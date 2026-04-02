import { useState } from 'react';
import { PlusCircle, Scale, AlertCircle, X } from 'lucide-react';
import Header from './components/Header';
import CaseCard from './components/CaseCard';
import CaseDetail from './components/CaseDetail';
import CreateCase from './components/CreateCase';
import { useJury } from './hooks/useJury';

export default function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const {
    cases,
    selectedCase,
    attachedDapps,
    loading,
    error,
    selectCase,
    createCase,
    setInstructions,
    acknowledgeInstructions,
    enrollAsJuror,
    startDeliberation,
    castVote,
    finalizeVerdict,
    attachDapp,
    detachDapp,
    syncBridge,
    clearError,
  } = useJury();

  const handleConnectWallet = () => {
    // Mock wallet connection — replace with real Lace wallet call in production
    setWalletConnected(true);
    setWalletAddress('0xMIDNIGHT_LACE_WALLET_ADDRESS');
  };

  const handleCreateCase = async (params: {
    caseTitle: string;
    plaintiff: string;
    defendant: string;
    requiredJurors: number;
  }) => {
    await createCase(params);
    setShowCreate(false);
  };

  return (
    <div className="min-h-screen bg-midnight-950">
      {/* Ambient gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-midnight-700/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-midnight-600/8 rounded-full blur-3xl" />
      </div>

      <Header
        walletConnected={walletConnected}
        walletAddress={walletAddress}
        onConnectWallet={handleConnectWallet}
        networkId="TestNet"
      />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-900/30 border border-red-700/50 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300 flex-1">{error}</p>
            <button onClick={clearError} className="text-red-500 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar — case list */}
          <div className="lg:col-span-4 space-y-4">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Scale className="w-5 h-5 text-midnight-400" />
                Jury Cases
                <span className="text-xs font-mono text-slate-500 bg-midnight-800/60 border border-midnight-700/40 px-2 py-0.5 rounded-lg">
                  {cases.length}
                </span>
              </h1>
              <button
                onClick={() => setShowCreate((v) => !v)}
                className="btn-primary flex items-center gap-1.5 text-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                New Case
              </button>
            </div>

            {/* Create case form */}
            {showCreate && (
              <CreateCase
                onSubmit={handleCreateCase}
                onCancel={() => setShowCreate(false)}
                loading={loading}
              />
            )}

            {/* Case list */}
            <div className="space-y-2">
              {cases.length === 0 && !showCreate && (
                <div className="text-center py-12 text-slate-600">
                  <Scale className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No jury cases yet.</p>
                  <p className="text-xs mt-1">Create one to get started.</p>
                </div>
              )}
              {cases.map((c) => (
                <CaseCard
                  key={c.id}
                  juryCase={c}
                  selected={selectedCase?.id === c.id}
                  onClick={() => selectCase(c.id)}
                />
              ))}
            </div>
          </div>

          {/* Right panel — case detail */}
          <div className="lg:col-span-8">
            {selectedCase ? (
              <CaseDetail
                juryCase={selectedCase}
                attachedDapps={attachedDapps}
                loading={loading}
                onSetInstructions={setInstructions}
                onAcknowledgeInstructions={acknowledgeInstructions}
                onEnroll={() => enrollAsJuror(selectedCase.id)}
                onStartDeliberation={() => startDeliberation(selectedCase.id)}
                onCastVote={(guilty) => castVote(selectedCase.id, guilty)}
                onFinalizeVerdict={() => finalizeVerdict(selectedCase.id)}
                onAttachDapp={attachDapp}
                onDetachDapp={detachDapp}
                onSyncBridge={syncBridge}
              />
            ) : (
              <div className="h-full min-h-[400px] card flex flex-col items-center justify-center text-center p-12">
                <div className="w-16 h-16 rounded-2xl bg-midnight-800/60 border border-midnight-700/40 flex items-center justify-center mb-4">
                  <Scale className="w-7 h-7 text-midnight-500" />
                </div>
                <h2 className="text-base font-medium text-slate-300 mb-2">Select a Case</h2>
                <p className="text-sm text-slate-600 max-w-xs">
                  Choose a jury case from the left panel to view details, cast votes,
                  and manage attached dApps.
                </p>
                {!walletConnected && (
                  <button
                    onClick={handleConnectWallet}
                    className="btn-primary mt-6 text-xs"
                  >
                    Connect Lace Wallet to Get Started
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Protocol info strip */}
        <div className="mt-10 pt-6 border-t border-midnight-800/60">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: 'Zero-Knowledge Votes',
                desc: 'Votes are ZK witnesses — individual choices are cryptographically hidden while the tally is verifiable.',
              },
              {
                title: 'DApp Composability',
                desc: 'Attach any dApp via the JuryBridge contract. Verdicts propagate as verifiable ZK state transitions.',
              },
              {
                title: '⅔ Supermajority',
                desc: 'A Guilty or Not Guilty verdict requires two-thirds of enrolled jurors to agree. Otherwise: Hung Jury.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-midnight-900/30 border border-midnight-800/50 rounded-xl p-4"
              >
                <p className="text-xs font-semibold text-midnight-300 mb-1">{item.title}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
