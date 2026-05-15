// Auto-injected: bridges parent page's 1AM wallet into Sandpack iframe
const SRC = '1am-sandpack-bridge';
const RSP = '1am-sandpack-response';
let rid = 0;
const pending = new Map<number, { resolve: (v: any) => void; reject: (e: Error) => void }>();

window.addEventListener('message', (e: MessageEvent) => {
  if (!e.data || e.data.source !== RSP) return;
  const p = pending.get(e.data.id);
  if (!p) return;
  pending.delete(e.data.id);
  if (e.data.error) p.reject(new Error(e.data.error));
  else p.resolve(e.data.result);
});

function callParent(method: string, args: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    const id = ++rid;
    pending.set(id, { resolve, reject });
    window.parent.postMessage({ source: SRC, id, method, args }, '*');
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error('Wallet bridge timeout')); } }, 60000);
  });
}

function makeBridgedAPI() {
  return {
    getConfiguration: () => callParent('getConfiguration'),
    getShieldedAddresses: () => callParent('getShieldedAddresses'),
    getUnshieldedAddress: () => callParent('getUnshieldedAddress'),
    getShieldedBalances: () => callParent('getShieldedBalances'),
    getUnshieldedBalances: () => callParent('getUnshieldedBalances'),
    getDustBalance: () => callParent('getDustBalance'),
    balanceUnsealedTransaction: (h: string) => callParent('balanceUnsealedTransaction', [h]),
    submitTransaction: (h: string) => callParent('submitTransaction', [h]),
  };
}

// Always inject the 1AM bridge into Sandpack iframes, even if other wallets (e.g. Lace) already set window.midnight
if (typeof window !== 'undefined' && window.parent !== window) {
  if (!(window as any).midnight) {
    (window as any).midnight = {};
  }
  (window as any).midnight['1am-bridge'] = {
    name: '1AM',
    icon: 'bridged',
    apiVersion: '4.0.0',
    connect: async (networkId: string) => {
      await callParent('connect', [networkId]);
      return makeBridgedAPI();
    },
  };
  console.log('[1AM Bridge] Wallet shim injected into Sandpack iframe');
}

export {};
