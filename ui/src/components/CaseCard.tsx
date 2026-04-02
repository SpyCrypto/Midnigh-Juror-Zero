import { Scale, Users, Clock, Link2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { MockCase } from '../lib/mock-data';
import { getStatusColor, getVerdictColor, getVerdictLabel, shortAddr } from '../lib/mock-data';

interface CaseCardProps {
  juryCase: MockCase;
  selected: boolean;
  onClick: () => void;
}

export default function CaseCard({ juryCase, selected, onClick }: CaseCardProps) {
  const progress =
    juryCase.requiredJurors > 0
      ? Math.round((juryCase.enrolledJurors / juryCase.requiredJurors) * 100)
      : 0;

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left p-4 rounded-xl border transition-all duration-200 animate-fade-in',
        selected
          ? 'bg-midnight-800/80 border-midnight-500/60 shadow-lg shadow-midnight-900/50'
          : 'bg-midnight-900/40 border-midnight-700/40 hover:bg-midnight-800/50 hover:border-midnight-600/50',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-midnight-700/60 flex items-center justify-center flex-shrink-0">
            <Scale className="w-3.5 h-3.5 text-midnight-300" />
          </div>
          <p className="text-sm font-medium text-slate-200 truncate">{juryCase.caseTitle}</p>
        </div>
        <span className={clsx('badge border flex-shrink-0', getStatusColor(juryCase.status))}>
          {juryCase.status}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Users className="w-3 h-3" />
            {juryCase.enrolledJurors}/{juryCase.requiredJurors} jurors
          </span>
          {juryCase.attachedDappCount > 0 && (
            <span className="flex items-center gap-1 text-midnight-400">
              <Link2 className="w-3 h-3" />
              {juryCase.attachedDappCount} dApp{juryCase.attachedDappCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Juror enrollment progress bar */}
        <div className="w-full h-1 bg-midnight-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-midnight-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-600 font-mono">
            {shortAddr(juryCase.contractAddress)}
          </span>
          {juryCase.verdict !== 'Pending' && (
            <span className={clsx('badge border text-[10px]', getVerdictColor(juryCase.verdict))}>
              {getVerdictLabel(juryCase.verdict)}
            </span>
          )}
          {juryCase.verdict === 'Pending' && (
            <span className="flex items-center gap-1 text-[11px] text-slate-600">
              <Clock className="w-3 h-3" />
              {new Date(juryCase.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
