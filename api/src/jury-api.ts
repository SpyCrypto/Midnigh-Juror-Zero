// ─── Jury Contract API ────────────────────────────────────────────────────────
//
//  High-level TypeScript wrapper around the compiled jury.compact contract.
//  Handles deployment, circuit calls, and state subscriptions.

import {
  type InitializeCaseParams,
  type DeployJuryResult,
  type JuryLedgerState,
  type AttachedDapp,
  JuryStatus,
  Verdict,
  JURY_CIRCUITS,
  hexToBytes32,
  hexToBytes64,
  bytesToHex,
  stringToBytes64,
  bytes64ToString,
} from './types.js';
import type { ProviderBundle } from './providers.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContractInstance = any;

// ─── JuryAPI class ───────────────────────────────────────────────────────────

export class JuryAPI {
  private readonly bundle: ProviderBundle;
  private contract: ContractInstance | null = null;
  private contractAddress: string | null = null;

  constructor(bundle: ProviderBundle) {
    this.bundle = bundle;
  }

  // ── Deployment ─────────────────────────────────────────────────────────────

  /**
   * Deploy a new Jury contract instance on-chain.
   * Returns the contract address and initial ledger state.
   */
  async deploy(params: InitializeCaseParams): Promise<DeployJuryResult> {
    const { provider, wallet } = this.bundle;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { deployContract } = await import('@midnight-ntwrk/midnight-js-contracts') as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contractModule = await import('../../contract/dist/jury/index.js') as any;

      this.contract = await deployContract(provider, wallet, contractModule, {
        initialCircuit: JURY_CIRCUITS.initializeCase,
        args: [
          hexToBytes32(params.caseId),
          stringToBytes64(params.caseTitle),
          hexToBytes32(params.plaintiff),
          hexToBytes32(params.defendant),
          params.requiredJurors,
        ],
      });

      this.contractAddress = await this.contract.address();
      const state = await this.getState();

      return { contractAddress: this.contractAddress, initialState: state };
    } catch (err) {
      throw new Error(`Jury contract deployment failed: ${(err as Error).message}`);
    }
  }

  /**
   * Connect to an already-deployed Jury contract by address.
   */
  async connect(contractAddress: string): Promise<void> {
    const { provider, wallet } = this.bundle;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { findDeployedContract } = await import('@midnight-ntwrk/midnight-js-contracts') as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contractModule = await import('../../contract/dist/jury/index.js') as any;

      this.contract = await findDeployedContract(provider, wallet, contractModule, contractAddress);
      this.contractAddress = contractAddress;
    } catch (err) {
      throw new Error(`Failed to connect to Jury contract at ${contractAddress}: ${(err as Error).message}`);
    }
  }

  // ── State ──────────────────────────────────────────────────────────────────

  async getState(): Promise<JuryLedgerState> {
    this.assertConnected();
    const ledger = await this.contract!.ledger();

    return {
      caseId: ledger.caseId,
      caseTitle: ledger.caseTitle,
      plaintiff: ledger.plaintiff,
      defendant: ledger.defendant,
      requiredJurors: Number(ledger.requiredJurors),
      enrolledCount: BigInt(ledger.enrolledCount),
      guiltyVotes: BigInt(ledger.guiltyVotes),
      notGuiltyVotes: BigInt(ledger.notGuiltyVotes),
      status: ledger.status as JuryStatus,
      verdict: ledger.verdict as Verdict,
      dappCount: BigInt(ledger.dappCount),
      lastVerdictBlock: BigInt(ledger.lastVerdictBlock ?? 0),
    };
  }

  getContractAddress(): string {
    this.assertConnected();
    return this.contractAddress!;
  }

  // ── Jury life-cycle circuits ───────────────────────────────────────────────

  async enrollJuror(): Promise<void> {
    this.assertConnected();
    await this.contract!.callCircuit(JURY_CIRCUITS.enrollJuror, []);
  }

  async startDeliberation(): Promise<void> {
    this.assertConnected();
    await this.contract!.callCircuit(JURY_CIRCUITS.startDeliberation, []);
  }

  /**
   * Cast a private vote.
   *
   * @param guiltyVote - true = Guilty, false = Not Guilty
   *
   * The vote is supplied as a ZK witness and is never revealed on-chain.
   * The prover generates a validity proof that the vote was cast correctly.
   */
  async castVote(guiltyVote: boolean): Promise<void> {
    this.assertConnected();
    // The `privateVote` witness is injected via the prover — pass it as a
    // private input through the Midnight SDK witness API.
    await this.contract!.callCircuit(
      JURY_CIRCUITS.castVote,
      [],
      { privateVote: () => guiltyVote },
    );
  }

  async finalizeVerdict(): Promise<Verdict> {
    this.assertConnected();
    await this.contract!.callCircuit(JURY_CIRCUITS.finalizeVerdict, []);
    const state = await this.getState();
    return state.verdict;
  }

  // ── Composability circuits ─────────────────────────────────────────────────

  async attachDapp(dappId: string): Promise<void> {
    this.assertConnected();
    await this.contract!.callCircuit(JURY_CIRCUITS.attachDapp, [hexToBytes32(dappId)]);
  }

  async detachDapp(dappId: string): Promise<void> {
    this.assertConnected();
    await this.contract!.callCircuit(JURY_CIRCUITS.detachDapp, [hexToBytes32(dappId)]);
  }

  async isDappAttached(dappId: string): Promise<boolean> {
    this.assertConnected();
    return this.contract!.callCircuit(JURY_CIRCUITS.queryIsDappAttached, [hexToBytes32(dappId)]);
  }

  async queryVerdict(): Promise<Verdict> {
    this.assertConnected();
    return this.contract!.callCircuit(JURY_CIRCUITS.queryVerdict, []);
  }

  async queryStatus(): Promise<JuryStatus> {
    this.assertConnected();
    return this.contract!.callCircuit(JURY_CIRCUITS.queryStatus, []);
  }

  async isJurorEnrolled(address: string): Promise<boolean> {
    this.assertConnected();
    return this.contract!.callCircuit(JURY_CIRCUITS.queryJurorEnrolled, [hexToBytes32(address)]);
  }

  async hasVoted(address: string): Promise<boolean> {
    this.assertConnected();
    return this.contract!.callCircuit(JURY_CIRCUITS.queryHasVoted, [hexToBytes32(address)]);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Returns a human-readable summary of the current case state.
   */
  async getSummary(): Promise<{
    caseId: string;
    caseTitle: string;
    plaintiff: string;
    defendant: string;
    status: JuryStatus;
    verdict: Verdict;
    enrolledJurors: number;
    requiredJurors: number;
    guiltyVotes: number;
    notGuiltyVotes: number;
    attachedDappCount: number;
    contractAddress: string;
  }> {
    const state = await this.getState();
    return {
      caseId: bytesToHex(state.caseId),
      caseTitle: bytes64ToString(state.caseTitle),
      plaintiff: bytesToHex(state.plaintiff),
      defendant: bytesToHex(state.defendant),
      status: state.status,
      verdict: state.verdict,
      enrolledJurors: Number(state.enrolledCount),
      requiredJurors: state.requiredJurors,
      guiltyVotes: Number(state.guiltyVotes),
      notGuiltyVotes: Number(state.notGuiltyVotes),
      attachedDappCount: Number(state.dappCount),
      contractAddress: this.contractAddress!,
    };
  }

  private assertConnected(): void {
    if (!this.contract || !this.contractAddress) {
      throw new Error('JuryAPI: not connected to a contract. Call deploy() or connect() first.');
    }
  }
}

// ─── Factory helper ───────────────────────────────────────────────────────────

export async function createAndDeployJury(
  bundle: ProviderBundle,
  params: InitializeCaseParams,
): Promise<{ api: JuryAPI; result: DeployJuryResult }> {
  const api = new JuryAPI(bundle);
  const result = await api.deploy(params);
  return { api, result };
}

export async function connectToJury(
  bundle: ProviderBundle,
  contractAddress: string,
): Promise<JuryAPI> {
  const api = new JuryAPI(bundle);
  await api.connect(contractAddress);
  return api;
}
