// ─── Midnight Provider Setup ──────────────────────────────────────────────────
//
//  Wraps the Midnight SDK provider construction. Provides a typed interface
//  for both TestNet / DevNet usage and local node development.
//
//  Usage:
//    import { createMidnightProvider } from '@midnight-jury/api';
//    const provider = await createMidnightProvider({ networkId: 'TestNet', ... });

import type { MidnightProviderConfig } from './types.js';

// Midnight SDK imports — available after `npm install` in the api workspace.
// Type stubs are used here so the package compiles without an active SDK install;
// real runtime behaviour requires the actual @midnight-ntwrk/* packages.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MidnightProvider = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WalletAPI = any;

export interface ProviderBundle {
  provider: MidnightProvider;
  wallet: WalletAPI;
  config: MidnightProviderConfig;
}

const NETWORK_ENDPOINTS: Record<
  MidnightProviderConfig['networkId'],
  { indexer: string; prover: string }
> = {
  DevNet: {
    indexer: 'https://indexer.devnet.midnight.network/api/v1/graphql',
    prover: 'https://prover.devnet.midnight.network',
  },
  TestNet: {
    indexer: 'https://indexer.testnet.midnight.network/api/v1/graphql',
    prover: 'https://prover.testnet.midnight.network',
  },
  MainNet: {
    indexer: 'https://indexer.midnight.network/api/v1/graphql',
    prover: 'https://prover.midnight.network',
  },
};

/**
 * Creates a Midnight provider and wallet API bundle from the given config.
 *
 * @param config - Provider configuration (network, URIs, optional seed phrase)
 * @returns ProviderBundle ready to be passed to JuryAPI or BridgeAPI
 *
 * @remarks
 * When `config.walletSeedPhrase` is provided the function creates an
 * in-memory wallet — useful for testing / CI.  In a browser context omit
 * the seed phrase and the Midnight Lace wallet browser extension will be
 * used instead.
 */
export async function createMidnightProvider(
  config: MidnightProviderConfig,
): Promise<ProviderBundle> {
  const endpoints = NETWORK_ENDPOINTS[config.networkId];

  const effectiveConfig: MidnightProviderConfig = {
    ...config,
    indexerUri: config.indexerUri || endpoints.indexer,
    proverServerUri: config.proverServerUri || endpoints.prover,
  };

  // Dynamic import guards: these will fail gracefully during build-time type
  // checking and only resolve when the SDK is installed at runtime.
  let provider: MidnightProvider;
  let wallet: WalletAPI;

  try {
    const { createProvider } = await import(
      '@midnight-ntwrk/midnight-js-contracts'
    );
    const { NetworkId } = await import('@midnight-ntwrk/midnight-js-network-id');

    provider = createProvider({
      networkId: NetworkId[config.networkId],
      indexerUri: effectiveConfig.indexerUri,
      proverServerUri: effectiveConfig.proverServerUri,
    });

    if (config.walletSeedPhrase) {
      const { InMemoryWallet } = await import('@midnight-ntwrk/midnight-js-wallet');
      wallet = await InMemoryWallet.fromSeedPhrase(config.walletSeedPhrase, provider);
    } else {
      // Browser: use the Lace wallet extension
      const { getLaceWallet } = await import('@midnight-ntwrk/midnight-js-wallet');
      wallet = await getLaceWallet();
    }
  } catch (err) {
    throw new Error(
      `Failed to initialize Midnight provider: ${(err as Error).message}\n` +
        'Make sure @midnight-ntwrk/* packages are installed and the Midnight ' +
        'Lace wallet extension is available in your browser.',
    );
  }

  return { provider, wallet, config: effectiveConfig };
}
