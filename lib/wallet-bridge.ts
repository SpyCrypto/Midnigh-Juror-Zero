// Side-effect import: sets up wallet bridge if running in Sandpack iframe
import './wallet-bridge-shim';

export interface InitialAPI {
  name: string; icon: string; apiVersion: string;
  connect(networkId: string): Promise<ConnectedAPI>;
}
export interface ConnectedAPI {
  getConfiguration(): Promise<{ networkId: string; indexerUri: string; indexerWsUri: string; proverServerUri: string }>;
  getShieldedAddresses(): Promise<{ shieldedAddress: string; shieldedCoinPublicKey: string; shieldedEncryptionPublicKey: string }>;
  getUnshieldedAddress(): Promise<{ unshieldedAddress: string }>;
  getShieldedBalances(): Promise<Record<string, bigint>>;
  getUnshieldedBalances(): Promise<Record<string, bigint>>;
  balanceUnsealedTransaction(txHex: string): Promise<{ tx: string }>;
  submitTransaction(txHex: string): Promise<string>;
}
export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
export function fromHex(hex: string): Uint8Array {
  const cleaned = hex.replace(/^0x/, '');
  return new Uint8Array((cleaned.match(/.{1,2}/g) ?? []).map(b => parseInt(b, 16)));
}
function extractWalletNetworkHint(error: unknown): string | null {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const match = message.match(/[Ww]allet is on (\S+)/);
  if (!match) return null;
  return match[1].replace(/[,.]$/, '');
}
function normalizeWalletConnectError(error: unknown, requestedNetwork: string): Error {
  const hintedNetwork = extractWalletNetworkHint(error);
  if (hintedNetwork && hintedNetwork !== requestedNetwork) {
    return new Error('Wallet is currently on ' + hintedNetwork + '. Switch to ' + requestedNetwork + ' in 1AM and try again.');
  }
  if (error instanceof Error) return error;
  return new Error(String(error ?? 'Failed to connect wallet'));
}
function findWallets(): InitialAPI[] {
  if (typeof window === 'undefined') return [];
  const midnight = (window as any).midnight;
  if (!midnight || typeof midnight !== 'object') return [];
  const wallets: InitialAPI[] = [];
  for (const key of Object.keys(midnight)) {
    const c = midnight[key];
    if (c && typeof c === 'object' && typeof c.name === 'string' && typeof c.icon === 'string'
        && typeof c.apiVersion === 'string' && typeof c.connect === 'function') {
      wallets.push(c as InitialAPI);
    }
  }
  return wallets;
}
export async function detectWallets(): Promise<InitialAPI[]> {
  const immediate = findWallets();
  if (immediate.length > 0) return immediate;
  return new Promise((resolve) => {
    let attempts = 0;
    const id = setInterval(() => {
      const wallets = findWallets();
      if (wallets.length > 0) { clearInterval(id); resolve(wallets); }
      else if (++attempts >= 40) { clearInterval(id); resolve([]); }
    }, 500);
  });
}
export async function connectWallet(): Promise<{ api: ConnectedAPI; config: Awaited<ReturnType<ConnectedAPI['getConfiguration']>> }> {
  const wallets = await detectWallets();
  if (wallets.length === 0) throw new Error('No Midnight wallet detected. Install 1AM from https://1am.xyz and refresh.');
  const selected = wallets.find(w => w.name === '1AM') || wallets[0];
  console.log('[Wallet] Found ' + wallets.length + ': ' + wallets.map(w => w.name).join(', ') + '. Selected: ' + selected.name);
  const targetNetwork = 'preview';
  try {
    const api = await Promise.race([
      selected.connect(targetNetwork),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('Timed out connecting to ' + targetNetwork)), 15000)),
    ]);
    const config = await api.getConfiguration();
    console.log('[Wallet] Connected on ' + config.networkId);
    return { api, config };
  } catch (error) {
    throw normalizeWalletConnectError(error, targetNetwork);
  }
}