import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract, findDeployedContract, getPublicStates, submitCallTx } from './vendor/midnight-js-contracts/index.js';
import { CompiledContract } from './vendor/compact-js/effect/index.js';
import { httpClientProofProvider } from './vendor/midnight-js-http-client-proof-provider/index.js';
import { indexerPublicDataProvider } from './vendor/midnight-js-indexer-public-data-provider/index.js';
import { ZKConfigProvider } from './vendor/midnight-js-types/index.js';
import { __wbindgen_ready as onchainRuntimeReady } from './vendor/onchain-runtime-v3/midnight_onchain_runtime_wasm.js';
import { __wbindgen_ready as ledgerRuntimeReady } from './vendor/ledger-v8/index.js';
import type { AppProviders } from './providers';

export type ManagedArtifactEntry = {
  content: string;
  encoding: 'utf8' | 'base64';
};

export type ManagedArtifactMap = Record<string, ManagedArtifactEntry>;

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function decodeArtifact(artifact: ManagedArtifactEntry): Uint8Array {
  if (artifact.encoding === 'base64') {
    return decodeBase64(artifact.content);
  }
  return new TextEncoder().encode(artifact.content);
}

class EmbeddedZKConfigProvider extends ZKConfigProvider<string> {
  constructor(private readonly artifacts: ManagedArtifactMap) {
    super();
  }

  private readArtifact(paths: string[], label: string): Uint8Array {
    for (const path of paths) {
      const artifact = this.artifacts[path];
      if (artifact) {
        return decodeArtifact(artifact);
      }
    }
    throw new Error('Missing ' + label + '. The compiler output is incomplete.');
  }

  async getZKIR(circuitId: string) {
    return this.readArtifact(
      ['zkir/' + circuitId + '.bzkir', 'zkir/' + circuitId + '.zkir'],
      'ZKIR for ' + circuitId,
    );
  }

  async getProverKey(circuitId: string) {
    return this.readArtifact(
      ['keys/' + circuitId + '.prover'],
      'prover key for ' + circuitId,
    );
  }

  async getVerifierKey(circuitId: string) {
    return this.readArtifact(
      ['keys/' + circuitId + '.verifier'],
      'verifier key for ' + circuitId,
    );
  }
}

function createPreviewPrivateStateProvider() {
  let scope = 'preview';
  const states = new Map<string, unknown>();
  const signingKeys = new Map<string, unknown>();

  const scoped = (id: string) => scope + ':' + id;

  return {
    setContractAddress(address: string) {
      scope = address || 'preview';
    },
    async set(privateStateId: string, state: unknown) {
      states.set(scoped(privateStateId), state);
    },
    async get(privateStateId: string) {
      return states.has(scoped(privateStateId)) ? states.get(scoped(privateStateId)) : null;
    },
    async remove(privateStateId: string) {
      states.delete(scoped(privateStateId));
    },
    async clear() {
      for (const key of Array.from(states.keys())) {
        if (key.startsWith(scope + ':')) {
          states.delete(key);
        }
      }
    },
    async setSigningKey(address: string, signingKey: unknown) {
      signingKeys.set(address, signingKey);
    },
    async getSigningKey(address: string) {
      return signingKeys.has(address) ? signingKeys.get(address) : null;
    },
    async removeSigningKey(address: string) {
      signingKeys.delete(address);
    },
    async clearSigningKeys() {
      signingKeys.clear();
    },
    async exportPrivateStates() {
      throw new Error('Private state export is not available in the preview sandbox.');
    },
    async importPrivateStates() {
      throw new Error('Private state import is not available in the preview sandbox.');
    },
    async exportSigningKeys() {
      throw new Error('Signing key export is not available in the preview sandbox.');
    },
    async importSigningKeys() {
      throw new Error('Signing key import is not available in the preview sandbox.');
    },
  };
}

function parseContractInfo(artifacts: ManagedArtifactMap) {
  const raw = artifacts['compiler/contract-info.json']?.content;
  if (!raw) {
    return {
      circuits: [] as Array<{ name: string }>,
      witnesses: [] as Array<string | { name?: string }>,
    };
  }

  try {
    return JSON.parse(raw) as {
      circuits?: Array<{ name: string }>;
      witnesses?: Array<string | { name?: string }>;
    };
  } catch {
    return {
      circuits: [] as Array<{ name: string }>,
      witnesses: [] as Array<string | { name?: string }>,
    };
  }
}

function resolveTxHash(value: any): string {
  return (
    value?.public?.txHash ||
    value?.txHash ||
    value?.public?.txId ||
    value?.txId ||
    ''
  );
}

function resolveContractAddress(value: any): string {
  return (
    value?.deployTxData?.contractAddress ||
    value?.deployTxData?.public?.contractAddress ||
    value?.contractAddress ||
    value?.address ||
    ''
  );
}

function decodeLedger(contractModule: any, contractState: unknown) {
  if (typeof contractModule?.ledger !== 'function') {
    return null;
  }
  const chargedState =
    (contractState as any)?.data ??
    (contractState as any)?.state ??
    contractState;
  return contractModule.ledger(chargedState);
}

function unwrapCompiledContractModule(contractModule: any): any {
  if (
    contractModule &&
    typeof contractModule === 'object' &&
    (typeof contractModule.Contract === 'function' ||
      typeof contractModule.ledger === 'function')
  ) {
    return contractModule;
  }

  if (
    contractModule?.default &&
    typeof contractModule.default === 'object' &&
    contractModule.default !== contractModule
  ) {
    return unwrapCompiledContractModule(contractModule.default);
  }

  return contractModule;
}

function getWitnessNames(contractInfo: {
  witnesses?: Array<string | { name?: string }>;
}) {
  return Array.isArray(contractInfo?.witnesses)
    ? contractInfo.witnesses
        .map((witness) =>
          typeof witness === 'string' ? witness : witness?.name ?? '',
        )
        .filter(Boolean)
    : [];
}

function normalizeContractInstance(instance: any) {
  if (!instance || typeof instance !== 'object') {
    return instance;
  }

  if (
    !instance.provableCircuits &&
    instance.impureCircuits &&
    typeof instance.impureCircuits === 'object'
  ) {
    instance.provableCircuits = instance.impureCircuits;
  }

  return instance;
}

function buildCompiledContractBinding(
  compiledContract: any,
  contractInfo: {
    witnesses?: Array<string | { name?: string }>;
  },
) {
  if (
    compiledContract &&
    typeof compiledContract === 'object' &&
    compiledContract[CompiledContract.TypeId]
  ) {
    return {
      contractModule: compiledContract,
      executableContract: compiledContract,
    };
  }

  const contractModule = unwrapCompiledContractModule(compiledContract);
  const contractCtor = contractModule?.Contract;

  if (typeof contractCtor !== 'function') {
    throw new Error(
      'Compiled contract bundle is missing an exported Contract constructor.',
    );
  }

  const executableCtor = function (...args: unknown[]) {
    return normalizeContractInstance(new contractCtor(...args));
  };

  let executableContract = CompiledContract.make(
    typeof contractModule?.tag === 'string' && contractModule.tag
      ? contractModule.tag
      : contractCtor.name || 'managed-contract',
    executableCtor,
  );

  const witnessNames = getWitnessNames(contractInfo);
  const witnesses =
    contractModule?.witnesses && typeof contractModule.witnesses === 'object'
      ? contractModule.witnesses
      : undefined;

  if (witnesses !== undefined) {
    executableContract = CompiledContract.withWitnesses(
      executableContract,
      witnesses,
    );
  } else if (witnessNames.length === 0) {
    executableContract =
      CompiledContract.withVacantWitnesses(executableContract);
  } else {
    throw new Error(
      'Compiled contract requires witnesses (' +
        witnessNames.join(', ') +
        ') but the generated bundle did not export a witnesses object.',
    );
  }

  return {
    contractModule,
    executableContract,
  };
}

function mergeLedgerState(contractAddress: string, publicStates: any, ledger: any) {
  return {
    contractAddress,
    publicStates,
    ledger,
    ...(ledger && typeof ledger === 'object' ? ledger : {}),
  };
}

function decorateTxResult(txHash: string, state: any) {
  return Object.assign(new String(txHash || ''), state, { txHash });
}

function buildContractProviders(wallet: AppProviders, artifacts: ManagedArtifactMap) {
  const publicDataProvider = indexerPublicDataProvider(
    wallet.indexerUrl,
    wallet.indexerWsUrl,
    typeof window !== 'undefined' ? (window.WebSocket as any) : undefined,
  );
  const zkConfigProvider = new EmbeddedZKConfigProvider(artifacts);
  const proofProvider = httpClientProofProvider(wallet.proofServerUrl, zkConfigProvider);
  const privateStateProvider = createPreviewPrivateStateProvider();

  return {
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
    privateStateProvider,
    walletProvider: wallet.walletProvider,
    midnightProvider: wallet.midnightProvider,
  };
}

function wrapContractHandle({
  contractAddress,
  compiledContract,
  providers,
  read,
  privateStateId,
  circuitIds,
}: {
  contractAddress: string;
  compiledContract: any;
  providers: any;
  read: (address: string) => Promise<any>;
  privateStateId?: string;
  circuitIds: Set<string>;
}) {
  const invokeCircuit = async (circuitId: string, args: unknown[]) => {
    if (circuitIds.size > 0 && !circuitIds.has(circuitId)) {
      throw new Error('Circuit ' + circuitId + ' is not available in the compiled contract.');
    }

    const options: any = {
      compiledContract,
      contractAddress,
      circuitId,
      args,
    };

    if (privateStateId) {
      options.privateStateId = privateStateId;
    }

    const result = await submitCallTx(providers as any, options);
    const next = await read(contractAddress);
    return decorateTxResult(resolveTxHash(result), next);
  };

  const callTx = new Proxy(
    {},
    {
      get(_target, prop) {
        if (typeof prop !== 'string') {
          return undefined;
        }
        return (...args: unknown[]) => invokeCircuit(prop, args);
      },
    },
  );

  return {
    contractAddress,
    callTx,
    refresh: () => read(contractAddress),
    invoke: async (circuitId: string, ...args: unknown[]) => {
      return invokeCircuit(circuitId, args);
    },
  };
}

export async function createManagedContractRuntime({
  compiledContract,
  artifacts,
  wallet,
  privateStateId,
  initialPrivateState,
}: {
  compiledContract: any;
  artifacts: ManagedArtifactMap;
  wallet: AppProviders;
  privateStateId?: string;
  initialPrivateState?: unknown;
}) {
  await Promise.all([onchainRuntimeReady, ledgerRuntimeReady]);
  setNetworkId(wallet.networkId);
  const providers = buildContractProviders(wallet, artifacts);
  const contractInfo = parseContractInfo(artifacts);
  const normalizedContract = buildCompiledContractBinding(
    compiledContract,
    contractInfo,
  );
  const circuitIds = new Set(
    Array.isArray(contractInfo?.circuits)
      ? contractInfo.circuits
          .map((circuit) =>
            typeof circuit?.name === 'string' ? circuit.name : '',
          )
          .filter(Boolean)
      : [],
  );

  const read = async (contractAddress: string) => {
    await Promise.all([onchainRuntimeReady, ledgerRuntimeReady]);
    const publicStates = await getPublicStates(
      providers.publicDataProvider,
      contractAddress,
    );
    const ledger = decodeLedger(
      normalizedContract.contractModule,
      publicStates.contractState,
    );

    return mergeLedgerState(contractAddress, publicStates, ledger);
  };

  const attach = async (contractAddress: string) => {
    await Promise.all([onchainRuntimeReady, ledgerRuntimeReady]);
    const options: any = {
      compiledContract: normalizedContract.executableContract,
      contractAddress,
    };
    if (privateStateId) {
      options.privateStateId = privateStateId;
      if (initialPrivateState !== undefined) {
        options.initialPrivateState = initialPrivateState;
      }
    }

    await findDeployedContract(providers as any, options);
    return wrapContractHandle({
      contractAddress,
      compiledContract: normalizedContract.executableContract,
      providers,
      read,
      privateStateId,
      circuitIds,
    });
  };

  const deploy = async (args: unknown[] = []) => {
    await Promise.all([onchainRuntimeReady, ledgerRuntimeReady]);
    const options: any = {
      compiledContract: normalizedContract.executableContract,
    };
    if (args.length > 0) {
      options.args = args;
    }
    if (privateStateId) {
      options.privateStateId = privateStateId;
      if (initialPrivateState !== undefined) {
        options.initialPrivateState = initialPrivateState;
      }
    }

    const deployed = await deployContract(providers as any, options);
    const contractAddress = resolveContractAddress(deployed);
    const state = contractAddress
      ? await read(contractAddress)
      : { contractAddress, publicStates: null, ledger: null };

    return {
      ...state,
      txHash: resolveTxHash(deployed.deployTxData),
      contract: wrapContractHandle({
        contractAddress,
        compiledContract: normalizedContract.executableContract,
        providers,
        read,
        privateStateId,
        circuitIds,
      }),
    };
  };

  return {
    providers,
    contractInfo,
    circuits: Array.isArray(contractInfo?.circuits) ? contractInfo.circuits : [],
    deploy,
    attach,
    read,
  };
}