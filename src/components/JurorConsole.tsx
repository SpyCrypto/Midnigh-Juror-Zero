import { useState } from 'react';
import { Loader2, Users, Scale, Vote, Lock } from 'lucide-react';
import { OnChainState } from '../App';

interface JurorConsoleProps {
  onChainState: OnChainState | null;
  onCircuit: (circuit: string, ...args: any[]) => Promise<void>;
}

type ActionStep =
  | 'idle'
  | 'open_case'
  | 'register_juror'
  | 'select_juror'
  | 'begin_deliberation'
  | 'cast_vote'
  | 'close_case';

export default function JurorConsole({ onChainState, onCircuit }: JurorConsoleProps) {
  const [actionStep, setActionStep] = useState<ActionStep>('idle');
  const [newCaseId, setNewCaseId] = useState('');
  const [voteChoice, setVoteChoice] = useState<'0' | '1' | '2'>('0');

  const isLoading = actionStep !== 'idle';

  const run = async (circuit: ActionStep, ...args: any[]) => {
    setActionStep(circuit);
    try {
      await onCircuit(circuit, ...args);
    } finally {
      setActionStep('idle');
    }
  };

  const statusColor: Record<string, string> = {
    Open: 'text-emerald-400',
    Deliberating: 'text-amber-400',
    Closed: 'text-foreground/40',
  };

  return (
    <div className="border border-foreground/10 bg-card">
      {/* State block */}
      <div className="border-b border-foreground/10 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
        Ledger State
      </div>

      {onChainState ? (
        <div className="divide-y divide-foreground/10">
          <StateRow label="Case ID" value={onChainState.case_id} />
          <StateRow
            label="Status"
            value={
              <span className={statusColor[onChainState.case_status] ?? 'text-foreground/60'}>
                {onChainState.case_status}
              </span>
            }
          />
          <StateRow label="Jurors Registered" value={onChainState.juror_count} />
          <StateRow label="Jurors Selected" value={onChainState.selected_count} />
          <StateRow label="Guilty Votes" value={onChainState.guilty_votes} />
          <StateRow label="Not Guilty Votes" value={onChainState.not_guilty_votes} />
          <StateRow label="Abstain Votes" value={onChainState.abstain_votes} />
        </div>
      ) : (
        <div className="px-4 py-6 text-center font-mono text-xs text-foreground/30">
          Loading on-chain state...
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-foreground/10 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
        Circuits
      </div>

      <div className="p-4 space-y-3">
        {/* Open Case */}
        <div className="flex gap-2">
          <input
            type="number"
            value={newCaseId}
            onChange={(e) => setNewCaseId(e.target.value)}
            placeholder="Case ID (number)"
            className="flex-1 h-10 border border-foreground/10 bg-background px-3 font-mono text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-blue-500/40"
          />
          <ActionButton
            label="Open Case"
            icon={<Scale className="w-3.5 h-3.5" />}
            loading={actionStep === 'open_case'}
            disabled={isLoading || !newCaseId}
            onClick={() => run('open_case', BigInt(newCaseId))}
          />
        </div>

        {/* Register + Select */}
        <div className="grid grid-cols-2 gap-2">
          <ActionButton
            label="Register Juror"
            icon={<Users className="w-3.5 h-3.5" />}
            loading={actionStep === 'register_juror'}
            disabled={isLoading}
            onClick={() => run('register_juror')}
          />
          <ActionButton
            label="Select Juror"
            icon={<Users className="w-3.5 h-3.5" />}
            loading={actionStep === 'select_juror'}
            disabled={isLoading}
            onClick={() => run('select_juror')}
          />
        </div>

        {/* Begin Deliberation */}
        <ActionButton
          label="Begin Deliberation"
          icon={<Vote className="w-3.5 h-3.5" />}
          loading={actionStep === 'begin_deliberation'}
          disabled={isLoading}
          onClick={() => run('begin_deliberation')}
          full
        />

        {/* Cast Vote */}
        <div className="flex gap-2">
          <select
            value={voteChoice}
            onChange={(e) => setVoteChoice(e.target.value as '0' | '1' | '2')}
            className="flex-1 h-10 border border-foreground/10 bg-background px-3 font-mono text-xs text-foreground focus:outline-none focus:border-blue-500/40"
          >
            <option value="0">Guilty</option>
            <option value="1">Not Guilty</option>
            <option value="2">Abstain</option>
          </select>
          <ActionButton
            label="Cast Vote"
            icon={<Vote className="w-3.5 h-3.5" />}
            loading={actionStep === 'cast_vote'}
            disabled={isLoading}
            onClick={() => run('cast_vote', Number(voteChoice))}
          />
        </div>

        {/* Close Case */}
        <ActionButton
          label="Close Case"
          icon={<Lock className="w-3.5 h-3.5" />}
          loading={actionStep === 'close_case'}
          disabled={isLoading}
          onClick={() => run('close_case')}
          full
          variant="secondary"
        />
      </div>
    </div>
  );
}

function StateRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
        {label}
      </span>
      <span className="font-mono text-xs text-foreground/80">{value}</span>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  loading,
  disabled,
  onClick,
  full,
  variant = 'primary',
}: {
  label: string;
  icon: React.ReactNode;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
  full?: boolean;
  variant?: 'primary' | 'secondary';
}) {
  const base =
    'h-10 border font-mono text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer px-3';
  const styles =
    variant === 'primary'
      ? 'border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15'
      : 'border-foreground/10 bg-foreground/5 text-foreground/75 hover:bg-foreground/10';

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${styles} ${full ? 'w-full' : ''}`}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
      {loading ? 'Processing...' : label}
    </button>
  );
}