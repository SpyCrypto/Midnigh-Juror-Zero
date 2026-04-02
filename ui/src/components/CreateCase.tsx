import { useState } from 'react';
import { PlusCircle, X, Scale } from 'lucide-react';

interface CreateCaseProps {
  onSubmit: (params: {
    caseTitle: string;
    plaintiff: string;
    defendant: string;
    requiredJurors: number;
  }) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export default function CreateCase({ onSubmit, onCancel, loading }: CreateCaseProps) {
  const [caseTitle, setCaseTitle] = useState('');
  const [plaintiff, setPlaintiff] = useState('');
  const [defendant, setDefendant] = useState('');
  const [requiredJurors, setRequiredJurors] = useState(7);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseTitle.trim() || !plaintiff.trim() || !defendant.trim()) return;
    await onSubmit({ caseTitle, plaintiff, defendant, requiredJurors });
  };

  return (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-midnight-600/30 border border-midnight-500/40 flex items-center justify-center">
            <Scale className="w-4 h-4 text-midnight-300" />
          </div>
          <h2 className="text-base font-semibold text-slate-100">New Jury Case</h2>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-midnight-800/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Case Title</label>
          <input
            className="input"
            placeholder="e.g. Smart Contract Exploit — Project Hydra"
            value={caseTitle}
            onChange={(e) => setCaseTitle(e.target.value)}
            required
            maxLength={64}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Plaintiff Address</label>
            <input
              className="input font-mono text-xs"
              placeholder="0x…"
              value={plaintiff}
              onChange={(e) => setPlaintiff(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Defendant Address</label>
            <input
              className="input font-mono text-xs"
              placeholder="0x…"
              value={defendant}
              onChange={(e) => setDefendant(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Required Jurors</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={3}
              max={21}
              step={2}
              value={requiredJurors}
              onChange={(e) => setRequiredJurors(Number(e.target.value))}
              className="flex-1 accent-midnight-500"
            />
            <span className="w-10 text-center text-sm font-mono text-midnight-300 bg-midnight-800/60 border border-midnight-600/40 px-2 py-1 rounded-lg">
              {requiredJurors}
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-600">
            Verdict requires a ⅔ supermajority ({Math.ceil((requiredJurors * 2) / 3)} votes)
          </p>
        </div>

        <div className="bg-midnight-800/40 border border-midnight-700/40 rounded-xl p-3 mt-2">
          <p className="text-xs text-slate-500 leading-relaxed">
            <span className="text-midnight-400 font-medium">ZK Privacy: </span>
            All votes are cast as zero-knowledge proofs on Midnight Network.
            Individual votes are never revealed — only the tally is updated on-chain.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !caseTitle.trim() || !plaintiff.trim() || !defendant.trim()}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <PlusCircle className="w-4 h-4" />
            )}
            Deploy Contract
          </button>
        </div>
      </form>
    </div>
  );
}
