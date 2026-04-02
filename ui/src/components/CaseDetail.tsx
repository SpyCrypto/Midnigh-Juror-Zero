import { Users, Play, Copy, CheckCheck, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import type { MockCase, MockAttachedDapp } from '../lib/mock-data';
import { getStatusColor, getVerdictColor, getVerdictLabel, shortAddr } from '../lib/mock-data';
import VotePanel from './VotePanel';
import VerdictDisplay from './VerdictDisplay';
import DAppManager from './DAppManager';
import JuryInstructions from './JuryInstructions';

interface CaseDetailProps {
  juryCase: MockCase;
  attachedDapps: MockAttachedDapp[];
  loading: boolean;
  onSetInstructions: (caseId: string, summary: string, hash: string) => Promise<void>;
  onAcknowledgeInstructions: (caseId: string) => Promise<void>;
  onEnroll: () => Promise<void>;
  onStartDeliberation: () => Promise<void>;
  onCastVote: (guilty: boolean) => Promise<void>;
  onFinalizeVerdict: () => Promise<void>;
  onAttachDapp: (caseId: string, dappId: string, label: string) => Promise<void>;
  onDetachDapp: (caseId: string, dappId: string) => Promise<void>;
  onSyncBridge: (dappId: string) => Promise<void>;
}

export default function CaseDetail({
  juryCase,
  attachedDapps,
  loading,
  onSetInstructions,
  onAcknowledgeInstructions,
  onEnroll,
  onStartDeliberation,
  onCastVote,
  onFinalizeVerdict,
  onAttachDapp,
  onDetachDapp,
  onSyncBridge,
}: CaseDetailProps) {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(juryCase.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const enrollmentProgress = juryCase.requiredJurors > 0
    ? Math.round((juryCase.enrolledJurors / juryCase.requiredJurors) * 100)
    : 0;
  const canStartDeliberation = juryCase.status === 'Open' && juryCase.enrolledJurors >= juryCase.requiredJurors;
  const canVote = juryCase.status === 'Deliberating';
  const canFinalize = juryCase.status === 'Deliberating' &&
    (juryCase.guiltyVotes + juryCase.notGuiltyVotes) >= juryCase.requiredJurors;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Case header */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-100 leading-snug">
              {juryCase.caseTitle}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={clsx('badge border', getStatusColor(juryCase.status))}>
                {juryCase.status}
              </span>
              {juryCase.verdict !== 'Pending' && (
                <span className={clsx('badge border', getVerdictColor(juryCase.verdict))}>
                  {getVerdictLabel(juryCase.verdict)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="bg-midnight-800/40 rounded-xl p-3 border border-midnight-700/30">
            <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-1">Plaintiff</p>
            <p className="text-xs font-mono text-slate-300 truncate">{shortAddr(juryCase.plaintiff, 10)}</p>
          </div>
          <div className="bg-midnight-800/40 rounded-xl p-3 border border-midnight-700/30">
            <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-1">Defendant</p>
            <p className="text-xs font-mono text-slate-300 truncate">{shortAddr(juryCase.defendant, 10)}</p>
          </div>
        </div>

        {/* Contract address */}
        <div className="flex items-center gap-2 bg-midnight-900/60 border border-midnight-700/40 rounded-xl px-3 py-2">
          <ExternalLink className="w-3 h-3 text-slate-600 flex-shrink-0" />
          <span className="text-[11px] font-mono text-slate-500 flex-1 truncate">
            {juryCase.contractAddress}
          </span>
          <button
            onClick={copyAddress}
            className="text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0"
          >
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Jury Instructions */}
      <JuryInstructions
        caseId={juryCase.id}
        instructionsSet={juryCase.instructionsSet}
        instructionsSummary={juryCase.instructionsSummary}
        instructionsHash={juryCase.instructionsHash}
        acknowledgedCount={juryCase.acknowledgedCount}
        requiredJurors={juryCase.requiredJurors}
        isClosed={juryCase.status === 'Closed'}
        loading={loading}
        onSetInstructions={onSetInstructions}
        onAcknowledge={onAcknowledgeInstructions}
      />

      {/* Juror enrollment */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-midnight-400" />
            Jury Panel
          </h3>
          <span className="text-xs font-mono text-midnight-300">
            {juryCase.enrolledJurors} / {juryCase.requiredJurors}
          </span>
        </div>

        <div className="w-full h-2 bg-midnight-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-midnight-500 rounded-full transition-all duration-700"
            style={{ width: `${enrollmentProgress}%` }}
          />
        </div>

        <div className="flex gap-2">
          {juryCase.status === 'Open' && juryCase.enrolledJurors < juryCase.requiredJurors && (
            <button
              onClick={onEnroll}
              disabled={loading}
              className="btn-secondary flex items-center gap-1.5 text-xs"
            >
              {loading
                ? <span className="w-3 h-3 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                : <Users className="w-3.5 h-3.5" />}
              Enroll as Juror
            </button>
          )}
          {canStartDeliberation && (
            <button
              onClick={onStartDeliberation}
              disabled={loading}
              className="btn-primary flex items-center gap-1.5 text-xs"
            >
              {loading
                ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Play className="w-3.5 h-3.5" />}
              Begin Deliberation
            </button>
          )}
        </div>
      </div>

      {/* Verdict display */}
      <VerdictDisplay
        verdict={juryCase.verdict}
        guiltyVotes={juryCase.guiltyVotes}
        notGuiltyVotes={juryCase.notGuiltyVotes}
        requiredJurors={juryCase.requiredJurors}
        onFinalize={onFinalizeVerdict}
        canFinalize={canFinalize}
        loading={loading}
      />

      {/* Vote panel (deliberation phase only) */}
      {canVote && (
        <VotePanel
          onCastVote={onCastVote}
          loading={loading}
        />
      )}

      {/* DApp composability */}
      <div className="card p-5">
        <DAppManager
          caseId={juryCase.id}
          attachedDapps={attachedDapps}
          onAttach={onAttachDapp}
          onDetach={onDetachDapp}
          onSync={onSyncBridge}
          loading={loading}
        />
      </div>
    </div>
  );
}
