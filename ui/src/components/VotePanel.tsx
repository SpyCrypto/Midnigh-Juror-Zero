import { useState } from 'react';
import { ShieldCheck, ShieldX, Lock, Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';

interface VotePanelProps {
  onCastVote: (guilty: boolean) => Promise<void>;
  loading: boolean;
  hasVoted?: boolean;
}

export default function VotePanel({ onCastVote, loading, hasVoted }: VotePanelProps) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [showVote, setShowVote] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (selected === null) return;
    await onCastVote(selected);
    setSubmitted(true);
  };

  if (hasVoted || submitted) {
    return (
      <div className="card p-5 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center mx-auto">
          <Lock className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-200">Vote Submitted</p>
          <p className="text-xs text-slate-500 mt-1">
            Your ZK proof has been recorded on Midnight Network.
            Your vote is cryptographically sealed and will never be revealed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Cast Your Vote</h3>
        <button
          onClick={() => setShowVote((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          {showVote ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showVote ? 'Hide' : 'Preview'}
        </button>
      </div>

      <div className="bg-midnight-800/40 rounded-xl p-3 border border-midnight-700/40">
        <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-midnight-400" />
          Your vote is a ZK witness — only a cryptographic proof is submitted on-chain.
          No one, including the jury system, can determine how you voted.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setSelected(false)}
          className={clsx(
            'p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2',
            selected === false
              ? 'border-emerald-500/60 bg-emerald-900/30'
              : 'border-midnight-700/40 bg-midnight-900/40 hover:border-emerald-700/50',
          )}
        >
          <ShieldCheck
            className={clsx(
              'w-8 h-8 transition-colors',
              selected === false ? 'text-emerald-400' : 'text-slate-500',
            )}
          />
          <div>
            <p className={clsx('text-sm font-medium', selected === false ? 'text-emerald-300' : 'text-slate-400')}>
              Not Guilty
            </p>
            {showVote && selected === false && (
              <p className="text-[10px] text-emerald-600 mt-0.5">Will be cast</p>
            )}
          </div>
        </button>

        <button
          onClick={() => setSelected(true)}
          className={clsx(
            'p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2',
            selected === true
              ? 'border-red-500/60 bg-red-900/30'
              : 'border-midnight-700/40 bg-midnight-900/40 hover:border-red-700/50',
          )}
        >
          <ShieldX
            className={clsx(
              'w-8 h-8 transition-colors',
              selected === true ? 'text-red-400' : 'text-slate-500',
            )}
          />
          <div>
            <p className={clsx('text-sm font-medium', selected === true ? 'text-red-300' : 'text-slate-400')}>
              Guilty
            </p>
            {showVote && selected === true && (
              <p className="text-[10px] text-red-600 mt-0.5">Will be cast</p>
            )}
          </div>
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={selected === null || loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Lock className="w-4 h-4" />
        )}
        Submit ZK Vote
      </button>
    </div>
  );
}
