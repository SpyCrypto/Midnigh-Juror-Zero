import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { ConnectedAPI } from './wallet-bridge';
import { toHex, fromHex } from './wallet-bridge';
export interface AppProviders {
  walletProvider: { getCoinPublicKey(): string; getEncryptionPublicKey(): string; balanceTx(tx: any): Promise<any> };
  midnightProvider: { submitTx(tx: any): Promise<string> };
  connectedAPI: ConnectedAPI;
  networkId: string; indexerUrl: string; indexerWsUrl: string; proofServerUrl: string;
  shieldedAddress: string; unshieldedAddress: string;
}
export async function buildProviders(api: ConnectedAPI): Promise<AppProviders> {
  const config = await api.getConfiguration();
  setNetworkId(config.networkId);
  const shielded = await api.getShieldedAddresses();
  const unshielded = await api.getUnshieldedAddress();
  return {
    walletProvider: {
      getCoinPublicKey: () => shielded.shieldedCoinPublicKey,
      getEncryptionPublicKey: () => shielded.shieldedEncryptionPublicKey,
      async balanceTx(tx: any) {
        const hex = toHex(tx.serialize());
        const result = await api.balanceUnsealedTransaction(hex);
        if (!result?.tx) throw new Error('Wallet rejected transaction');
        const resultBytes = fromHex(result.tx);
        return { serialize: () => resultBytes, identifiers: () => [result.tx.slice(0, 64)], _txHex: result.tx };
      },
    },
    midnightProvider: {
      async submitTx(tx: any) {
        const hex = toHex(tx.serialize());
        await api.submitTransaction(hex);
        return typeof tx.identifiers === 'function' ? tx.identifiers()[0] : hex.slice(0, 64);
      },
    },
    connectedAPI: api,
    networkId: config.networkId, indexerUrl: config.indexerUri, indexerWsUrl: config.indexerWsUri, proofServerUrl: config.proverServerUri,
    shieldedAddress: shielded.shieldedAddress, unshieldedAddress: unshielded.unshieldedAddress,
  };
}