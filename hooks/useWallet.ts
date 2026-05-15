import { useEffect, useSyncExternalStore } from 'react';
import { connectWallet, detectWallets, type ConnectedAPI } from '../lib/wallet-bridge';
import { buildProviders, type AppProviders } from '../lib/providers';

type WalletStatus = 'detecting' | 'disconnected' | 'connecting' | 'connected';
type WalletState = {
  status: WalletStatus;
  api: ConnectedAPI | null;
  providers: AppProviders | null;
  address: string;
  error: string;
};

const listeners = new Set<() => void>();
let state: WalletState = {
  status: 'detecting',
  api: null,
  providers: null,
  address: '',
  error: '',
};
let hasStartedDetection = false;
let connectPromise: Promise<string | void> | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

function setWalletState(next: Partial<WalletState>) {
  state = { ...state, ...next };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function ensureDetection() {
  if (hasStartedDetection) return;
  hasStartedDetection = true;

  detectWallets()
    .then(() => {
      if (state.status === 'detecting') {
        setWalletState({ status: 'disconnected' });
      }
    })
    .catch((e) => {
      setWalletState({
        status: 'disconnected',
        error: e instanceof Error ? e.message : 'Wallet detection failed',
      });
    });
}

async function connect(): Promise<string | void> {
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    setWalletState({ status: 'connecting', error: '' });
    try {
      const { api: connectedApi } = await connectWallet();
      const provs = await buildProviders(connectedApi);
      const nextAddress = provs.unshieldedAddress;
      setWalletState({
        api: connectedApi,
        providers: provs,
        address: nextAddress,
        status: 'connected',
        error: '',
      });
      return nextAddress;
    } catch (e) {
      setWalletState({
        status: 'disconnected',
        error: e instanceof Error ? e.message : 'Connection failed',
      });
      throw e;
    } finally {
      connectPromise = null;
    }
  })();

  return connectPromise;
}

export function useWallet() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    ensureDetection();
  }, []);

  return { ...snapshot, connect };
}