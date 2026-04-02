import { useState, useCallback } from 'react';
import type {
  MockCase,
  MockAttachedDapp,
  MockJuror,
  MockJuryStatus,
  MockVerdict,
} from '../lib/mock-data';
import {
  MOCK_CASES,
  MOCK_ATTACHED_DAPPS,
  MOCK_JURORS,
} from '../lib/mock-data';

// ─── useJury hook ─────────────────────────────────────────────────────────────
//
//  In mock mode (no live Midnight node) this hook drives all UI state using
//  in-memory data.  When a real ProviderBundle is injected, swap the mock
//  calls for the @midnight-jury/api JuryAPI methods.

export interface UseJuryReturn {
  cases: MockCase[];
  selectedCase: MockCase | null;
  jurors: MockJuror[];
  attachedDapps: MockAttachedDapp[];
  loading: boolean;
  error: string | null;

  selectCase: (id: string) => void;
  createCase: (params: {
    caseTitle: string;
    plaintiff: string;
    defendant: string;
    requiredJurors: number;
  }) => Promise<void>;
  setInstructions: (caseId: string, summary: string, docHash: string) => Promise<void>;
  acknowledgeInstructions: (caseId: string) => Promise<void>;
  enrollAsJuror: (caseId: string) => Promise<void>;
  startDeliberation: (caseId: string) => Promise<void>;
  castVote: (caseId: string, guilty: boolean) => Promise<void>;
  finalizeVerdict: (caseId: string) => Promise<void>;
  attachDapp: (caseId: string, dappId: string, label: string) => Promise<void>;
  detachDapp: (caseId: string, dappId: string) => Promise<void>;
  syncBridge: (dappId: string) => Promise<void>;
  clearError: () => void;
}

function randomHex(bytes: number): string {
  return Array.from({ length: bytes }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0'),
  ).join('');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useJury(): UseJuryReturn {
  const [cases, setCases] = useState<MockCase[]>(MOCK_CASES);
  const [selectedCase, setSelectedCase] = useState<MockCase | null>(null);
  const [jurors, setJurors] = useState<MockJuror[]>(MOCK_JURORS);
  const [attachedDapps, setAttachedDapps] = useState<MockAttachedDapp[]>(MOCK_ATTACHED_DAPPS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectCase = useCallback(
    (id: string) => {
      const found = cases.find((c) => c.id === id) ?? null;
      setSelectedCase(found);
    },
    [cases],
  );

  const withLoading = useCallback(
    async (fn: () => Promise<void>) => {
      setLoading(true);
      setError(null);
      try {
        await fn();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const setInstructions = useCallback(
    async (caseId: string, summary: string, docHash: string) =>
      withLoading(async () => {
        await sleep(700);
        const update = (c: MockCase): MockCase =>
          c.id === caseId
            ? { ...c, instructionsSet: true, instructionsSummary: summary, instructionsHash: docHash }
            : c;
        setCases((prev: MockCase[]) => prev.map(update));
        setSelectedCase((prev: MockCase | null) => (prev?.id === caseId ? update(prev) : prev));
      }),
    [withLoading],
  );

  const acknowledgeInstructions = useCallback(
    async (caseId: string) =>
      withLoading(async () => {
        await sleep(500);
        const update = (c: MockCase): MockCase =>
          c.id === caseId
            ? { ...c, acknowledgedCount: Math.min(c.acknowledgedCount + 1, c.requiredJurors) }
            : c;
        setCases((prev: MockCase[]) => prev.map(update));
        setSelectedCase((prev: MockCase | null) => (prev?.id === caseId ? update(prev) : prev));
      }),
    [withLoading],
  );

  const createCase = useCallback(
    async (params: {
      caseTitle: string;
      plaintiff: string;
      defendant: string;
      requiredJurors: number;
    }) =>
      withLoading(async () => {
        await sleep(800);
        const newCase: MockCase = {
          id: String(Date.now()),
          caseId: randomHex(32),
          caseTitle: params.caseTitle,
          plaintiff: params.plaintiff,
          defendant: params.defendant,
          status: 'Open',
          verdict: 'Pending',
          requiredJurors: params.requiredJurors,
          enrolledJurors: 0,
          guiltyVotes: 0,
          notGuiltyVotes: 0,
          contractAddress: '0x' + randomHex(20),
          attachedDappCount: 0,
          createdAt: new Date().toISOString(),
          instructionsSet: false,
          instructionsSummary: '',
          instructionsHash: '',
          acknowledgedCount: 0,
        };
        setCases((prev) => [newCase, ...prev]);
        setSelectedCase(newCase);
      }),
    [withLoading],
  );

  const enrollAsJuror = useCallback(
    async (caseId: string) =>
      withLoading(async () => {
        await sleep(600);
        setCases((prev: MockCase[]) =>
          prev.map((c) =>
            c.id === caseId
              ? { ...c, enrolledJurors: Math.min(c.enrolledJurors + 1, c.requiredJurors) }
              : c,
          ),
        );
        setSelectedCase((prev: MockCase | null) =>
          prev?.id === caseId
            ? { ...prev, enrolledJurors: Math.min(prev.enrolledJurors + 1, prev.requiredJurors) }
            : prev,
        );
        setJurors((prev: MockJuror[]) => {
          const unvoted = prev.find((j) => !j.enrolled);
          if (!unvoted) return prev;
          return prev.map((j) =>
            j.address === unvoted.address ? { ...j, enrolled: true } : j,
          );
        });
      }),
    [withLoading],
  );

  const startDeliberation = useCallback(
    async (caseId: string) =>
      withLoading(async () => {
        await sleep(700);
        const updateStatus = (c: MockCase): MockCase =>
          c.id === caseId ? { ...c, status: 'Deliberating' as MockJuryStatus } : c;
        setCases((prev: MockCase[]) => prev.map(updateStatus));
        setSelectedCase((prev: MockCase | null) => (prev?.id === caseId ? updateStatus(prev) : prev));
      }),
    [withLoading],
  );

  const castVote = useCallback(
    async (caseId: string, guilty: boolean) =>
      withLoading(async () => {
        await sleep(1000);
        const update = (c: MockCase): MockCase =>
          c.id === caseId
            ? {
                ...c,
                guiltyVotes: guilty ? c.guiltyVotes + 1 : c.guiltyVotes,
                notGuiltyVotes: !guilty ? c.notGuiltyVotes + 1 : c.notGuiltyVotes,
              }
            : c;
        setCases((prev: MockCase[]) => prev.map(update));
        setSelectedCase((prev: MockCase | null) => (prev?.id === caseId ? update(prev) : prev));
      }),
    [withLoading],
  );

  const finalizeVerdict = useCallback(
    async (caseId: string) =>
      withLoading(async () => {
        await sleep(1200);
        const theCase = cases.find((c) => c.id === caseId);
        if (!theCase) return;
        const threshold = Math.ceil((theCase.requiredJurors * 2) / 3);
        let verdict: MockVerdict = 'Hung';
        if (theCase.guiltyVotes >= threshold) verdict = 'Guilty';
        else if (theCase.notGuiltyVotes >= threshold) verdict = 'NotGuilty';
        const update = (c: MockCase): MockCase =>
          c.id === caseId ? { ...c, verdict, status: 'Closed' } : c;
        setCases((prev: MockCase[]) => prev.map(update));
        setSelectedCase((prev: MockCase | null) => (prev?.id === caseId ? update(prev) : prev));
      }),
    [withLoading, cases],
  );

  const attachDapp = useCallback(
    async (caseId: string, dappId: string, label: string) =>
      withLoading(async () => {
        await sleep(600);
        const newDapp: MockAttachedDapp = {
          dappId,
          label,
          contractAddress: '0x' + randomHex(20),
          bridgeStatus: 'Active',
          mirroredVerdict: 'Unknown',
          syncedAt: null,
          icon: '🔗',
        };
        setAttachedDapps((prev: MockAttachedDapp[]) => [...prev, newDapp]);
        const update = (c: MockCase): MockCase =>
          c.id === caseId ? { ...c, attachedDappCount: c.attachedDappCount + 1 } : c;
        setCases((prev: MockCase[]) => prev.map(update));
        setSelectedCase((prev: MockCase | null) => (prev?.id === caseId ? update(prev) : prev));
      }),
    [withLoading],
  );

  const detachDapp = useCallback(
    async (caseId: string, dappId: string) =>
      withLoading(async () => {
        await sleep(500);
        setAttachedDapps((prev: MockAttachedDapp[]) => prev.filter((d: MockAttachedDapp) => d.dappId !== dappId));
        const update = (c: MockCase): MockCase =>
          c.id === caseId
            ? { ...c, attachedDappCount: Math.max(0, c.attachedDappCount - 1) }
            : c;
        setCases((prev: MockCase[]) => prev.map(update));
        setSelectedCase((prev: MockCase | null) => (prev?.id === caseId ? update(prev) : prev));
      }),
    [withLoading],
  );

  const syncBridge = useCallback(
    async (dappId: string) =>
      withLoading(async () => {
        await sleep(900);
        setAttachedDapps((prev: MockAttachedDapp[]) =>
          prev.map((d) =>
            d.dappId === dappId
              ? {
                  ...d,
                  bridgeStatus: 'Synced',
                  mirroredVerdict: selectedCase?.verdict ?? 'Pending',
                  syncedAt: new Date().toISOString(),
                }
              : d,
          ),
        );
      }),
    [withLoading, selectedCase],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    cases,
    selectedCase,
    jurors,
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
  };
}
