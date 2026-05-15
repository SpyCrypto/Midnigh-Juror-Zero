import { useState } from 'react';
import { Loader2, Link2 } from 'lucide-react';
import type { ActionStep } from '../types';

type Props = {
  onRegister: (juryAddress: string, bridgeId: string, context: string) => Promise<void>;
  isLoading: boolean;
  actionStep: ActionStep;
};

export default function RegisterPanel({ onRegister, isLoading, actionStep }: Props) {
  const [juryAddress, setJuryAddress] = useState('');
  const [bridgeId, setBridgeId]       = useState('');
  const [context, setContext]         = useState('');

  const canSubmit = juryAddress.trim().length > 0 && bridgeId.trim().length > 0 && !isLoading;

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Link2 className="w-4 h-4 text-midnight-400" />
        <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-slate-500">
          Register Bridge
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="label">Jury Contract Address (hex)</label>
          <input
            type="text"
            value={juryAddress}
            onChange={e => setJuryAddress(e.target.value)}
            placeholder="e.g. 0102abcd..."
            className="input font-mono text-xs"
          />
        </div>
        <div>
          <label className="label">Bridge ID (hex)</label>
          <input
            type="text"
            value={bridgeId}
            onChange={e => setBridgeId(e.target.value)}
            placeholder="32-byte identifier in hex"
            className="input font-mono text-xs"
          />
        </div>
        <div>
          <label className="label">Custom Context (hex, optional)</label>
          <input
            type="text"
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="64-byte context in hex (optional)"
            className="input font-mono text-xs"
          />
        </div>
      </div>

      <button
        onClick={() => onRegister(juryAddress.trim(), bridgeId.trim(), context.trim())}
        disabled={!canSubmit}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {actionStep === 'registering' ? (
          <><Loader2 className="w-4 h-4 animate-spin" />Registering on-chain...</>
        ) : (
          'Register Bridge'
        )}
      </button>
    </div>
  );
}