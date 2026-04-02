import { useState } from 'react';
import { Link2, Link2Off, RefreshCw, PlusCircle, CheckCircle2, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import type { MockAttachedDapp } from '../lib/mock-data';
import { shortAddr } from '../lib/mock-data';

interface DAppManagerProps {
  caseId: string;
  attachedDapps: MockAttachedDapp[];
  onAttach: (caseId: string, dappId: string, label: string) => Promise<void>;
  onDetach: (caseId: string, dappId: string) => Promise<void>;
  onSync: (dappId: string) => Promise<void>;
  loading: boolean;
}

export default function DAppManager({
  caseId,
  attachedDapps,
  onAttach,
  onDetach,
  onSync,
  loading,
}: DAppManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [dappId, setDappId] = useState('');
  const [label, setLabel] = useState('');

  const handleAttach = async () => {
    if (!dappId.trim() || !label.trim()) return;
    await onAttach(caseId, dappId.trim(), label.trim());
    setDappId('');
    setLabel('');
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-midnight-400" />
          Attached DApps
          {attachedDapps.length > 0 && (
            <span className="text-xs font-mono text-midnight-400 bg-midnight-800/60 border border-midnight-600/40 px-1.5 py-0.5 rounded-md">
              {attachedDapps.length}
            </span>
          )}
        </h3>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-midnight-400 hover:text-midnight-300 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Attach DApp
        </button>
      </div>

      {/* Attach form */}
      {showForm && (
        <div className="card p-4 space-y-3 animate-fade-in">
          <p className="text-xs text-slate-500">
            Register an external dApp to receive this jury's verdict via the Bridge contract.
          </p>
          <div>
            <label className="label">DApp ID (hex, 32 bytes)</label>
            <input
              className="input font-mono text-xs"
              placeholder="a1b2c3d4…"
              value={dappId}
              onChange={(e) => setDappId(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Human-Readable Label</label>
            <input
              className="input"
              placeholder="e.g. DAO Governance v2"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleAttach}
              disabled={loading || !dappId.trim() || !label.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Link2 className="w-3.5 h-3.5" />
              )}
              Attach
            </button>
          </div>
        </div>
      )}

      {/* DApp list */}
      {attachedDapps.length === 0 && !showForm && (
        <div className="text-center py-8 text-slate-600 text-sm">
          <Link2 className="w-6 h-6 mx-auto mb-2 opacity-30" />
          No dApps attached yet
        </div>
      )}

      <div className="space-y-2">
        {attachedDapps.map((dapp) => (
          <div
            key={dapp.dappId}
            className="card-hover p-3.5 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl">{dapp.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{dapp.label}</p>
                <p className="text-[11px] font-mono text-slate-600 truncate">
                  {shortAddr(dapp.contractAddress)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Bridge status badge */}
              <span
                className={clsx(
                  'badge border text-[10px]',
                  dapp.bridgeStatus === 'Synced'
                    ? 'bg-emerald-900/30 text-emerald-400 border-emerald-700/40'
                    : dapp.bridgeStatus === 'Active'
                    ? 'bg-midnight-800/60 text-midnight-300 border-midnight-600/40'
                    : 'bg-slate-800/40 text-slate-500 border-slate-700/40',
                )}
              >
                {dapp.bridgeStatus === 'Synced' ? (
                  <CheckCircle2 className="w-2.5 h-2.5" />
                ) : (
                  <Clock className="w-2.5 h-2.5" />
                )}
                {dapp.bridgeStatus}
              </span>

              {/* Sync button */}
              {dapp.bridgeStatus !== 'Synced' && (
                <button
                  onClick={() => onSync(dapp.dappId)}
                  disabled={loading}
                  title="Sync verdict to bridge"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-midnight-300 hover:bg-midnight-800/60 transition-colors"
                >
                  <RefreshCw className={clsx('w-3.5 h-3.5', loading && 'animate-spin')} />
                </button>
              )}

              {/* Detach button */}
              <button
                onClick={() => onDetach(caseId, dapp.dappId)}
                disabled={loading}
                title="Detach dApp"
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
              >
                <Link2Off className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {attachedDapps.length > 0 && (
        <p className="text-[11px] text-slate-600 mt-1 px-1">
          Attached dApps receive the finalized verdict via the Jury Bridge contract.
          Use <span className="font-mono">syncVerdict()</span> to mirror the result.
        </p>
      )}
    </div>
  );
}
