import { Scale, Moon, Wifi, WifiOff } from 'lucide-react';
import { clsx } from 'clsx';

interface HeaderProps {
  walletConnected: boolean;
  walletAddress: string | null;
  onConnectWallet: () => void;
  networkId: string;
}

export default function Header({
  walletConnected,
  walletAddress,
  onConnectWallet,
  networkId,
}: HeaderProps) {
  return (
    <header className="border-b border-midnight-700/50 bg-midnight-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-midnight-600/30 border border-midnight-500/40 flex items-center justify-center">
            <Scale className="w-4 h-4 text-midnight-300" />
          </div>
          <div>
            <span className="font-semibold text-slate-100 tracking-tight">
              Midnight Jury
            </span>
            <span className="ml-2 text-[10px] font-mono text-midnight-400 bg-midnight-800/60 border border-midnight-600/40 px-1.5 py-0.5 rounded-md uppercase">
              ZK Protocol
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Network indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-midnight-900/60 border border-midnight-700/40">
            <Moon className="w-3 h-3 text-midnight-400" />
            <span className="text-xs font-mono text-midnight-300">{networkId}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
          </div>

          {/* Wallet connect */}
          {walletConnected && walletAddress ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-midnight-800/60 border border-midnight-600/50">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-mono text-slate-300">
                {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
              </span>
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
                'bg-midnight-600 hover:bg-midnight-500 text-white border border-midnight-500/60',
              )}
            >
              <WifiOff className="w-3.5 h-3.5" />
              Connect Lace
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
