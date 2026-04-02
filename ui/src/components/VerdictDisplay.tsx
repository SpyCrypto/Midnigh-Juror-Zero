import { CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import type { MockVerdict } from '../lib/mock-data';
import { getVerdictLabel } from '../lib/mock-data';

interface VerdictDisplayProps {
  verdict: MockVerdict;
  guiltyVotes: number;
  notGuiltyVotes: number;
  requiredJurors: number;
  onFinalize?: () => Promise<void>;
  canFinalize?: boolean;
  loading?: boolean;
}

const verdictConfig = {
  Pending: {
    icon: Clock,
    bg: 'bg-slate-800/40',
    border: 'border-slate-700/40',
    text: 'text-slate-400',
    iconColor: 'text-slate-500',
    label: 'Awaiting Verdict',
  },
  Guilty: {
    icon: XCircle,
    bg: 'bg-red-900/20',
    border: 'border-red-700/40',
    text: 'text-red-300',
    iconColor: 'text-red-400',
    label: 'Guilty',
  },
  NotGuilty: {
    icon: CheckCircle2,
    bg: 'bg-emerald-900/20',
    border: 'border-emerald-700/40',
    text: 'text-emerald-300',
    iconColor: 'text-emerald-400',
    label: 'Not Guilty',
  },
  Hung: {
    icon: AlertTriangle,
    bg: 'bg-orange-900/20',
    border: 'border-orange-700/40',
    text: 'text-orange-300',
    iconColor: 'text-orange-400',
    label: 'Hung Jury',
  },
};

export default function VerdictDisplay({
  verdict,
  guiltyVotes,
  notGuiltyVotes,
  requiredJurors,
  onFinalize,
  canFinalize,
  loading,
}: VerdictDisplayProps) {
  const cfg = verdictConfig[verdict];
  const Icon = cfg.icon;
  const totalVotes = guiltyVotes + notGuiltyVotes;
  const threshold = Math.ceil((requiredJurors * 2) / 3);
  const guiltyPct = totalVotes > 0 ? Math.round((guiltyVotes / requiredJurors) * 100) : 0;
  const notGuiltyPct = totalVotes > 0 ? Math.round((notGuiltyVotes / requiredJurors) * 100) : 0;

  return (
    <div className={clsx('card p-5 space-y-4', cfg.bg, cfg.border)}>
      <div className="flex items-center gap-3">
        <Icon className={clsx('w-8 h-8', cfg.iconColor)} />
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
            {verdict === 'Pending' ? 'Verdict' : 'Final Verdict'}
          </p>
          <p className={clsx('text-xl font-bold', cfg.text)}>{cfg.label}</p>
        </div>
      </div>

      {/* Vote tally bars */}
      <div className="space-y-2.5">
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Not Guilty</span>
            <span>{notGuiltyVotes} / {requiredJurors}</span>
          </div>
          <div className="w-full h-2 bg-midnight-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(notGuiltyPct, 100)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Guilty</span>
            <span>{guiltyVotes} / {requiredJurors}</span>
          </div>
          <div className="w-full h-2 bg-midnight-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(guiltyPct, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-600">
        Threshold: {threshold} of {requiredJurors} votes required for a supermajority verdict
      </p>

      {canFinalize && verdict === 'Pending' && totalVotes >= requiredJurors && (
        <button
          onClick={onFinalize}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          Finalize Verdict On-Chain
        </button>
      )}
    </div>
  );
}
