import { useState } from 'react';
import { Loader2, RefreshCw, Edit3 } from 'lucide-react';
import type { ActionStep } from '../types';

type Props = {
  onSyncVerdict: () => Promise<void>;
  onUpdateContext: (context: string) => Promise<void>;
  isLoading: boolean;
  actionStep: ActionStep;
};

export default function SyncPanel({ onSyncVerdict, onUpdateContext, isLoading, actionStep }: Props) {
  const [newContext, setNewContext] = useState('');
  const [showContextEdit, setShowContextEdit] = useState(false);

  return (
    <div className="card p-5 space-y-4">
      <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-slate-500">
        Bridge Actions
      </p>

      {/* Sync Verdict */}
      <button
        onClick={onSyncVerdict}
        disabled={isLoading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {actionStep === 'syncing' ? (
          <><Loader2 className="w-4 h-4 animate-spin" />Syncing verdict...</>
        ) : (
          <><RefreshCw className="w-4 h-4" />Sync Verdict from Jury DApp</>
        )}
      </button>

      {/* Update Context */}
      <div className="space-y-2">
        <button
          onClick={() => setShowContextEdit(v => !v)}
          className="btn-secondary w-full flex items-center justify-center gap-2 text-xs"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Update Custom Context
        </button>

        {showContextEdit && (
          <div className="space-y-2">
            <input
              type="text"
              value={newContext}
              onChange={e => setNewContext(e.target.value)}
              placeholder="New 64-byte context in hex"
              className="input font-mono text-xs"
            />
            <button
              onClick={() => { onUpdateContext(newContext.trim()); setNewContext(''); setShowContextEdit(false); }}
              disabled={isLoading || !newContext.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2 text-xs"
            >
              {actionStep === 'updating' ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" />Updating...</>
              ) : 'Update Context'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}