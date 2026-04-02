// ─── Jury Bridge API ──────────────────────────────────────────────────────────
//
//  Manages deployment and interaction with jury-bridge.compact contracts.
//  External dApps use this to sync a Jury verdict into their own contract scope.

import {
  type BridgeLedgerState,
  type BridgeRegisterParams,
  BridgedVerdict,
  BridgeStatus,
  BRIDGE_CIRCUITS,
  hexToBytes32,
  hexToBytes64,
  bytesToHex,
  bytes64ToString,
} from './types.js';
import type { ProviderBundle } from './providers.js';
import type { JuryAPI } from './jury-api.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContractInstance = any;

export class BridgeAPI {
  private readonly bundle: ProviderBundle;
  private contract: ContractInstance | null = null;
  private contractAddress: string | null = null;

  constructor(bundle: ProviderBundle) {
    this.bundle = bundle;
  }

  // ── Deployment ─────────────────────────────────────────────────────────────

  async deploy(params: BridgeRegisterParams): Promise<string> {
    const { provider, wallet } = this.bundle;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { deployContract } = await import('@midnight-ntwrk/midnight-js-contracts') as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contractModule = await import('../../contract/dist/jury-bridge/index.js') as any;

      const contextBytes = params.customContext
        ? hexToBytes64(params.customContext)
        : new Uint8Array(64);

      this.contract = await deployContract(provider, wallet, contractModule, {
        initialCircuit: BRIDGE_CIRCUITS.register,
        args: [
          hexToBytes32(params.juryContractAddress),
          hexToBytes32(params.bridgeId),
          contextBytes,
        ],
      });

      this.contractAddress = await this.contract.address();
      return this.contractAddress;
    } catch (err) {
      throw new Error(`Bridge deployment failed: ${(err as Error).message}`);
    }
  }

  async connect(address: string): Promise<void> {
    const { provider, wallet } = this.bundle;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { findDeployedContract } = await import('@midnight-ntwrk/midnight-js-contracts') as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contractModule = await import('../../contract/dist/jury-bridge/index.js') as any;

      this.contract = await findDeployedContract(provider, wallet, contractModule, address);
      this.contractAddress = address;
    } catch (err) {
      throw new Error(`Failed to connect to bridge at ${address}: ${(err as Error).message}`);
    }
  }

  // ── State ──────────────────────────────────────────────────────────────────

  async getState(): Promise<BridgeLedgerState> {
    this.assertConnected();
    const ledger = await this.contract!.ledger();

    return {
      juryContractAddress: ledger.juryContractAddress,
      bridgeId: ledger.bridgeId,
      mirroredVerdict: ledger.mirroredVerdict as BridgedVerdict,
      mirroredCaseId: ledger.mirroredCaseId,
      mirroredPlaintiff: ledger.mirroredPlaintiff,
      mirroredDefendant: ledger.mirroredDefendant,
      status: ledger.status as BridgeStatus,
      syncedAtBlock: BigInt(ledger.syncedAtBlock ?? 0),
      customContext: ledger.customContext,
    };
  }

  getContractAddress(): string {
    this.assertConnected();
    return this.contractAddress!;
  }

  // ── Sync circuit ───────────────────────────────────────────────────────────

  /**
   * Pull the current verdict from the linked Jury contract and mirror it
   * into this bridge's on-chain state.
   *
   * @param juryApi  - A connected JuryAPI instance to read the current verdict from.
   */
  async syncVerdict(juryApi: JuryAPI): Promise<BridgedVerdict> {
    this.assertConnected();

    const summary = await juryApi.getSummary();

    const verdictMap: Record<string, number> = {
      Pending: 0,
      Guilty: 1,
      NotGuilty: 2,
      Hung: 3,
    };

    const rawVerdict = verdictMap[summary.verdict] ?? 0;

    await this.contract!.callCircuit(
      BRIDGE_CIRCUITS.syncVerdict,
      [],
      {
        juryVerdictProof: () => rawVerdict,
        juryCaseId: () => hexToBytes32(summary.caseId),
        juryPlaintiff: () => hexToBytes32(summary.plaintiff),
        juryDefendant: () => hexToBytes32(summary.defendant),
        juryCurrentBlock: () => BigInt(Date.now()),
      },
    );

    const state = await this.getState();
    return state.mirroredVerdict;
  }

  async updateContext(context: string): Promise<void> {
    this.assertConnected();
    await this.contract!.callCircuit(
      BRIDGE_CIRCUITS.updateContext,
      [hexToBytes64(context)],
    );
  }

  // ── Query circuits ─────────────────────────────────────────────────────────

  async getVerdict(): Promise<BridgedVerdict> {
    this.assertConnected();
    return this.contract!.callCircuit(BRIDGE_CIRCUITS.getVerdict, []);
  }

  async isGuilty(): Promise<boolean> {
    this.assertConnected();
    return this.contract!.callCircuit(BRIDGE_CIRCUITS.isGuilty, []);
  }

  async isNotGuilty(): Promise<boolean> {
    this.assertConnected();
    return this.contract!.callCircuit(BRIDGE_CIRCUITS.isNotGuilty, []);
  }

  async isHung(): Promise<boolean> {
    this.assertConnected();
    return this.contract!.callCircuit(BRIDGE_CIRCUITS.isHung, []);
  }

  async isSynced(): Promise<boolean> {
    this.assertConnected();
    return this.contract!.callCircuit(BRIDGE_CIRCUITS.isSynced, []);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  async getSummary(): Promise<{
    bridgeId: string;
    juryContractAddress: string;
    mirroredVerdict: BridgedVerdict;
    status: BridgeStatus;
    syncedAtBlock: number;
    customContext: string;
    contractAddress: string;
  }> {
    const state = await this.getState();
    return {
      bridgeId: bytesToHex(state.bridgeId),
      juryContractAddress: bytesToHex(state.juryContractAddress),
      mirroredVerdict: state.mirroredVerdict,
      status: state.status,
      syncedAtBlock: Number(state.syncedAtBlock),
      customContext: bytes64ToString(state.customContext),
      contractAddress: this.contractAddress!,
    };
  }

  private assertConnected(): void {
    if (!this.contract || !this.contractAddress) {
      throw new Error('BridgeAPI: not connected. Call deploy() or connect() first.');
    }
  }
}

// ─── Factory helpers ──────────────────────────────────────────────────────────

export async function deployBridge(
  bundle: ProviderBundle,
  juryApi: JuryAPI,
  bridgeId: string,
  customContext?: string,
): Promise<{ api: BridgeAPI; address: string }> {
  const api = new BridgeAPI(bundle);
  const address = await api.deploy({
    juryContractAddress: juryApi.getContractAddress(),
    bridgeId,
    customContext,
  });
  return { api, address };
}

export async function connectToBridge(
  bundle: ProviderBundle,
  address: string,
): Promise<BridgeAPI> {
  const api = new BridgeAPI(bundle);
  await api.connect(address);
  return api;
}
