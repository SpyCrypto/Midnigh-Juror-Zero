import { ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ContractPanelProps {
  contractAddress: string;
  lastTxHash: string | null;
  network: string;
  explorer: string;
  onReset: () => void;
}

export default function ContractPanel({
  contractAddress,
  lastTxHash,
  network,
  explorer,
  onReset,
}: ContractPanelProps) {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-foreground/10 bg-card">
      <div className="border-b border-foreground/10 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Contract Active · {network}
        </div>
        <button
          onClick={onReset}
          className="font-mono text-[10px] text-foreground/35 hover:text-foreground/60 transition-colors cursor-pointer uppercase tracking-widest"
        >
          change
        </button>
      </div>

      <div className="divide-y divide-foreground/10">
        {/* Contract address row */}
        <a
          href={`${explorer}/contract/${contractAddress}?network=${network}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-4 py-3 hover:bg-foreground/5 transition-colors"
        >
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
            Contract
          </span>
          <span className="flex items-center gap-2 font-mono text-xs text-foreground/70">
            {contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}
            <button
              onClick={(e) => { e.preventDefault(); copy(contractAddress); }}
              className="text-foreground/30 hover:text-foreground/60 cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
            <ExternalLink className="w-3 h-3 text-foreground/40" />
          </span>
        </a>

        {/* Tx hash row */}
        {lastTxHash && (
          <a
            href={`${explorer}/tx/${lastTxHash}?network=${network}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 hover:bg-foreground/5 transition-colors"
          >
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
              Last Tx
            </span>
            <span className="flex items-center gap-2 font-mono text-xs text-foreground/70">
              {lastTxHash.slice(0, 10)}...{lastTxHash.slice(-6)}
              <ExternalLink className="w-3 h-3 text-foreground/40" />
            </span>
          </a>
        )}
      </div>
    </div>
  );
}