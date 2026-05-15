import { RefreshCw, HelpCircle, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import type { LedgerState } from '../App';

type Props = {
  ledger: LedgerState;
  onRefresh: () => void;
  isLoading: boolean;
};

function VerdictIcon({ verdict }: { verdict: string }) {
  switch (verdict) {
    case 'Guilty':    return <XCircle className="w-4 h-4 text-red-400" />;
    case 'NotGuilty': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    case 'Hung':      return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    case 'Pending':   return <Clock className="w-4 h-4 text-blue-400" />;
    default:          return <HelpCircle className="w-4 h-4 text-slate-500" />;
  }
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const colors: Record<string, string> = {
    Guilty:    'bg-red-900/40 border-red-700/50 text-red-300',
    NotGuilty: 'bg-green-900/40 border-green-700/50 text-green-300',
    Hung:      'bg-yellow-900/40 border-yellow-700/50 text-yellow-300',
    Pending:   'bg-blue-900/40 border-blue-700/50 text-blue-300',
    Unknown:   'bg-midnight-800/60 border-midnight-700/40 text-slate-500',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${colors[verdict] ?? colors.Unknown}`}>
      <VerdictIcon verdict={verdict} />
      {verdict}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Unregistered: 'bg-midnight-800/60 border-midnight-700/40 text-slate-500',
    Active:       'bg-blue-900/40 border-blue-700/50 text-blue-300',
    Synced:       'bg-green-900/40 border-green-700/50 text-green-300',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${colors[status] ?? colors.Unregistered}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'Active' ? 'bg-blue-400' : status === 'Synced' ? 'bg-green-400' : 'bg-slate-600'}`} />
      {status}
    </span>
  );
}

function Row({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  if (!value || value === '0') return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-midnight-700/30 last:border-0">
      <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-slate-500 shrink-0 mt-0.5">
        {label}
      </span>
      <span className={`text-right text-xs text-slate-300 break-all max-w-[60%] ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}

export default function BridgeStatus({ ledger, onRefresh, isLoading }: Props) {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-slate-500">
          Bridge State
        </p>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40 cursor-pointer"
          title="Refresh from chain"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="space-y-1">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-slate-600">Status</p>
          <StatusBadge status={ledger.status} />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-slate-600">Verdict</p>
          <VerdictBadge verdict={ledger.mirroredVerdict} />
        </div>
      </div>

      <div className="divide-y divide-midnight-700/30">
        <Row label="Jury Contract"  value={ledger.juryContractAddress} />
        <Row label="Bridge ID"      value={ledger.bridgeId} />
        <Row label="Case ID"        value={ledger.mirroredCaseId} />
        <Row label="Plaintiff"      value={ledger.mirroredPlaintiff} />
        <Row label="Defendant"      value={ledger.mirroredDefendant} />
        <Row label="Synced Block"   value={ledger.syncedAtBlock !== '0' ? ledger.syncedAtBlock : ''} />
        <Row label="Context"        value={ledger.customContext} />
      </div>
    </div>
  );
}