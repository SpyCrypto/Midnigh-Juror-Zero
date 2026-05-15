import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from './hooks/useWallet';
import { WalletPanel } from './components/WalletPanel';
import ContractPanel from './components/ContractPanel';
import JurorConsole from './components/JurorConsole';
import {
  Scale,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Shield,
} from 'lucide-react';

type AppStep = 'idle' | 'deploying' | 'attaching' | 'ready';

export interface OnChainState {
  case_status: string;
  guilty_votes: number;
  not_guilty_votes: number;
  abstain_votes: number;
  juror_count: number;
  selected_count: number;
  case_id: string;
}

const EXPLORER = 'https://explorer.1am.xyz';
const NETWORK = 'preview';

async function getRuntime(providers: any) {
  const { __wbindgen_ready: onchainRuntimeReady } = await import('./lib/vendor/onchain-runtime-v3/midnight_onchain_runtime_wasm.js');
  const { __wbindgen_ready: ledgerRuntimeReady } = await import('./lib/vendor/ledger-v8/index.js');
  await Promise.all([onchainRuntimeReady, ledgerRuntimeReady]);
  const { createManagedContractRuntime } = await import('./lib/compact-contract');
  const contractModule = await import('./managed/contract/contract/index.js');
  const { managedArtifacts } = await import('./managed/contract/compiler/artifact-map');
  return createManagedContractRuntime({
    compiledContract: contractModule,
    artifacts: managedArtifacts,
    wallet: providers,
  });
}

export default function App() {
  const { status, providers, address } = useWallet();
  const [appStep, setAppStep] = useState<AppStep>('idle');
  const [contractAddress, setContractAddress] = useState('');
  const [pasteAddress, setPasteAddress] = useState('');
  const [onChainState, setOnChainState] = useState<OnChainState | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [runtime, setRuntime] = useState<any>(null);

  const isConnected = status === 'connected';
  const isLoading = appStep === 'deploying' || appStep === 'attaching';

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const readState = useCallback(async (rt: any, addr: string) => {
    try {
      const state = await rt.read(addr);
      const statusMap: Record<number, string> = {
        0: 'Open',
        1: 'Deliberating',
        2: 'Closed',
      };
      setOnChainState({
        case_status: statusMap[state.case_status] ?? 'Unknown',
        guilty_votes: Number(state.guilty_votes ?? 0),
        not_guilty_votes: Number(state.not_guilty_votes ?? 0),
        abstain_votes: Number(state.abstain_votes ?? 0),
        juror_count: Number(state.juror_count ?? 0),
        selected_count: Number(state.selected_count ?? 0),
        case_id: String(state.case_id ?? '0'),
      });
    } catch (e: any) {
      setError('Failed to read on-chain state: ' + e.message);
    }
  }, []);

  const handleDeploy = async () => {
    if (!providers) return;
    setError(null);
    setAppStep('deploying');
    try {
      const rt = await getRuntime(providers);
      setRuntime(rt);
      const instance = await rt.deploy();
      const addr = instance.deployTxData.public.contractAddress;
      setContractAddress(addr);
      setLastTxHash(instance.deployTxData.public.txHash ?? null);
      await readState(rt, addr);
      setAppStep('ready');
    } catch (e: any) {
      setError(e.message ?? 'Deploy failed');
      setAppStep('idle');
    }
  };

  const handleAttach = async () => {
    if (!providers || !pasteAddress.trim()) return;
    setError(null);
    setAppStep('attaching');
    try {
      const rt = await getRuntime(providers);
      setRuntime(rt);
      await rt.attach(pasteAddress.trim());
      setContractAddress(pasteAddress.trim());
      await readState(rt, pasteAddress.trim());
      setAppStep('ready');
    } catch (e: any) {
      setError(e.message ?? 'Attach failed');
      setAppStep('idle');
    }
  };

  const handleCircuit = async (circuit: string, ...args: any[]) => {
    if (!runtime || !contractAddress) return;
    setError(null);
    try {
      const instance = await runtime.attach(contractAddress);
      const result = await instance.invoke(circuit, ...args);
      setLastTxHash(result?.txHash ?? result?.public?.txHash ?? null);
      await readState(runtime, contractAddress);
    } catch (e: any) {
      setError(e.message ?? 'Transaction failed');
    }
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Source Code Pro', monospace" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-2xl mx-auto px-6 py-12 space-y-6"
      >
        {/* Header */}
        <div className="space-y-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/45">
            Midnight Network · {NETWORK}
          </p>
          <div className="flex items-center gap-3">
            <Scale className="w-6 h-6 text-foreground/60" />
            <h1
              className="text-3xl font-semibold text-foreground"
              style={{ fontFamily: "'Source Sans Pro', 'Source Sans 3', sans-serif" }}
            >
              Juror Zero
            </h1>
          </div>
          <p className="text-sm text-foreground/50 max-w-md">
            Anonymous jury selection and private on-chain voting.
          </p>
        </div>

        {/* Wallet Panel */}
        <div className="border border-foreground/10 bg-card p-5">
          <WalletPanel />
          {isConnected && address && (
            <div className="mt-4 flex items-center justify-between px-3 py-2.5 border border-foreground/10 bg-foreground/5">
              <div className="flex items-center gap-2 min-w-0">
                <Shield className="w-3.5 h-3.5 text-foreground/40 shrink-0" />
                <span className="font-mono text-xs text-foreground/50 truncate">{address}</span>
              </div>
              <button
                onClick={() => copyToClipboard(address)}
                className="text-foreground/30 hover:text-foreground/60 transition-colors shrink-0 ml-2 cursor-pointer"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400 font-mono"
            >
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-3 text-red-400/60 hover:text-red-400 cursor-pointer"
              >
                dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Deploy / Attach Panel */}
        <AnimatePresence mode="wait">
          {isConnected && !contractAddress && (
            <motion.div
              key="deploy"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="border border-foreground/10 bg-card"
            >
              <div className="border-b border-foreground/10 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
                Deploy or Attach
              </div>
              <div className="p-5 space-y-4">
                <button
                  onClick={handleDeploy}
                  disabled={isLoading}
                  className="w-full h-11 border border-blue-500/40 bg-blue-500/10 px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300 hover:bg-blue-500/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {appStep === 'deploying' ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deploying contract...</>
                  ) : (
                    'Deploy New Contract'
                  )}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-foreground/10" />
                  <span className="font-mono text-[10px] text-foreground/30 uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-foreground/10" />
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pasteAddress}
                    onChange={(e) => setPasteAddress(e.target.value)}
                    placeholder="Paste existing contract address..."
                    className="flex-1 h-11 border border-foreground/10 bg-background px-3 font-mono text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-blue-500/40"
                  />
                  <button
                    onClick={handleAttach}
                    disabled={isLoading || !pasteAddress.trim()}
                    className="h-11 border border-foreground/10 bg-foreground/5 px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/75 hover:bg-foreground/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {appStep === 'attaching' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      'Attach'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Contract Active */}
          {isConnected && contractAddress && appStep === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <ContractPanel
                contractAddress={contractAddress}
                lastTxHash={lastTxHash}
                network={NETWORK}
                explorer={EXPLORER}
                onReset={() => {
                  setContractAddress('');
                  setOnChainState(null);
                  setLastTxHash(null);
                  setAppStep('idle');
                }}
              />

              <JurorConsole
                onChainState={onChainState}
                onCircuit={handleCircuit}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}