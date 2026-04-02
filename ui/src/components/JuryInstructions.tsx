import { useState } from 'react';
import {
  BookOpen,
  Edit3,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Hash,
  Users,
  AlertCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { DEFAULT_JURY_INSTRUCTIONS } from '../lib/mock-data';

interface JuryInstructionsProps {
  caseId: string;
  instructionsSet: boolean;
  instructionsSummary: string;
  instructionsHash: string;
  acknowledgedCount: number;
  requiredJurors: number;
  isClosed: boolean;
  loading: boolean;
  onSetInstructions: (caseId: string, summary: string, hash: string) => Promise<void>;
  onAcknowledge: (caseId: string) => Promise<void>;
}

export default function JuryInstructions({
  caseId,
  instructionsSet,
  instructionsSummary,
  instructionsHash,
  acknowledgedCount,
  requiredJurors,
  isClosed,
  loading,
  onSetInstructions,
  onAcknowledge,
}: JuryInstructionsProps) {
  const [expanded, setExpanded] = useState(instructionsSet);
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState(
    instructionsSummary || DEFAULT_JURY_INSTRUCTIONS,
  );
  const [acknowledged, setAcknowledged] = useState(false);

  const ackProgress = requiredJurors > 0
    ? Math.round((acknowledgedCount / requiredJurors) * 100)
    : 0;

  const handleSave = async () => {
    const hash = await mockSha256(draftText);
    await onSetInstructions(caseId, draftText, hash);
    setEditing(false);
    setExpanded(true);
  };

  const handleAcknowledge = async () => {
    await onAcknowledge(caseId);
    setAcknowledged(true);
  };

  return (
    <div className="card overflow-hidden">
      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-midnight-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-midnight-700/60 border border-midnight-600/40 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-midnight-300" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-200">Jury Instructions</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {instructionsSet
                ? `On-chain · ${acknowledgedCount}/${requiredJurors} jurors acknowledged`
                : 'Not yet set'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {instructionsSet && (
            <span className="badge border bg-emerald-900/30 text-emerald-400 border-emerald-700/40 text-[10px]">
              <Lock className="w-2.5 h-2.5" />
              On-chain
            </span>
          )}
          {!instructionsSet && !isClosed && (
            <span className="badge border bg-amber-900/30 text-amber-400 border-amber-700/40 text-[10px]">
              <AlertCircle className="w-2.5 h-2.5" />
              Required
            </span>
          )}
          {expanded
            ? <ChevronUp className="w-4 h-4 text-slate-500" />
            : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-midnight-700/40 p-5 space-y-4 animate-fade-in">

          {/* Edit / Set mode */}
          {editing ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-400">
                  Edit Instruction Text
                  <span className="ml-2 text-slate-600 font-normal">(max 256 bytes stored on-chain)</span>
                </p>
                <span className="text-[10px] font-mono text-slate-600">
                  {new TextEncoder().encode(draftText).length} / 256 bytes
                </span>
              </div>
              <textarea
                className="input resize-none h-72 font-mono text-xs leading-relaxed"
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                spellCheck={false}
              />
              <div className="bg-midnight-800/40 rounded-xl p-3 border border-midnight-700/40">
                <p className="text-[11px] text-slate-500">
                  <span className="text-midnight-400 font-medium">On-chain storage:</span>{' '}
                  The first 256 bytes are written to{' '}
                  <code className="font-mono text-midnight-300">ledger.juryInstructions</code>.
                  A SHA-256 hash of the full text is committed to{' '}
                  <code className="font-mono text-midnight-300">ledger.instructionsHash</code>{' '}
                  so jurors can verify the complete document off-chain.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || !draftText.trim()}
                  className="btn-primary flex-1 flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                  Commit to Chain
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Instructions text */}
              {instructionsSet ? (
                <div className="space-y-3">
                  <div className="bg-midnight-900/60 border border-midnight-700/40 rounded-xl p-4 max-h-72 overflow-y-auto">
                    <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {instructionsSummary}
                    </pre>
                  </div>

                  {/* Hash display */}
                  <div className="flex items-center gap-2 bg-midnight-900/40 border border-midnight-700/30 rounded-xl px-3 py-2">
                    <Hash className="w-3 h-3 text-slate-600 flex-shrink-0" />
                    <span className="text-[10px] font-mono text-slate-600 flex-1 truncate">
                      SHA-256: {instructionsHash || '—'}
                    </span>
                  </div>

                  {/* Acknowledgement progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3 h-3" />
                        Juror acknowledgements
                      </span>
                      <span className="font-mono">{acknowledgedCount} / {requiredJurors}</span>
                    </div>
                    <div className="w-full h-1.5 bg-midnight-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(ackProgress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {!isClosed && (
                      <button
                        onClick={() => {
                          setDraftText(instructionsSummary);
                          setEditing(true);
                        }}
                        className="btn-secondary flex items-center gap-1.5 text-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Instructions
                      </button>
                    )}
                    {!isClosed && !acknowledged && (
                      <button
                        onClick={handleAcknowledge}
                        disabled={loading}
                        className={clsx(
                          'flex items-center gap-1.5 text-xs btn-primary',
                        )}
                      >
                        {loading ? (
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        I Have Read These Instructions
                      </button>
                    )}
                    {(isClosed || acknowledged) && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 px-3 py-2 rounded-xl bg-emerald-900/20 border border-emerald-700/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Acknowledged
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Not yet set */
                <div className="space-y-3">
                  <div className="text-center py-6 space-y-2">
                    <BookOpen className="w-8 h-8 mx-auto text-midnight-600 opacity-50" />
                    <p className="text-sm text-slate-400">No jury instructions set yet</p>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto">
                      Instructions are committed to the Midnight ledger and must be
                      acknowledged by each juror before deliberation begins.
                    </p>
                  </div>
                  {!isClosed && (
                    <button
                      onClick={() => setEditing(true)}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Set Jury Instructions
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Simple mock SHA-256 using Web Crypto API
async function mockSha256(text: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0'),
    ).join('');
  }
}
