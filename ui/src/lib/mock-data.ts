// ─── Mock data for UI development without a live Midnight node ───────────────

export type MockJuryStatus = 'Open' | 'Deliberating' | 'Closed';
export type MockVerdict = 'Pending' | 'Guilty' | 'NotGuilty' | 'Hung';

export interface MockCase {
  id: string;
  caseId: string;
  caseTitle: string;
  plaintiff: string;
  defendant: string;
  status: MockJuryStatus;
  verdict: MockVerdict;
  requiredJurors: number;
  enrolledJurors: number;
  guiltyVotes: number;
  notGuiltyVotes: number;
  contractAddress: string;
  attachedDappCount: number;
  createdAt: string;
  // Jury instructions
  instructionsSet: boolean;
  instructionsSummary: string;
  instructionsHash: string;   // hex SHA-256
  acknowledgedCount: number;
}

export interface MockAttachedDapp {
  dappId: string;
  label: string;
  contractAddress: string;
  bridgeStatus: 'Active' | 'Synced' | 'Unregistered';
  mirroredVerdict: string;
  syncedAt: string | null;
  icon: string;
}

export interface MockJuror {
  address: string;
  label: string;
  enrolled: boolean;
  hasVoted: boolean;
}

export const DEFAULT_JURY_INSTRUCTIONS = `JURY INSTRUCTIONS — MIDNIGHT NETWORK DECENTRALIZED TRIBUNAL

1. DUTY OF JURORS
You have been selected to serve as a juror in this matter. Your duty is to determine the facts based solely on the evidence presented and to apply those facts to the applicable standard.

2. STANDARD OF PROOF
The claimant must establish their case by a preponderance of the evidence — meaning it is more likely true than not true. This is not a criminal proceeding; the standard is not "beyond a reasonable doubt."

3. EVALUATION OF EVIDENCE
Consider all on-chain evidence, submitted transaction records, smart contract audit reports, and cryptographic proofs. Disregard any off-chain claims that have not been verified through the protocol.

4. IMPARTIALITY
You must decide this case impartially and without bias. You must not be influenced by sympathy, prejudice, or any consideration outside the submitted evidence.

5. DELIBERATION PRIVACY
Your vote is private and protected by zero-knowledge cryptography. No party — including the protocol itself — can determine how you individually voted.

6. VERDICT THRESHOLD
A verdict of Guilty or Not Guilty requires a two-thirds (2/3) supermajority of enrolled jurors. Failure to reach this threshold results in a Hung Jury.

7. FINALITY
Once the verdict is finalized on-chain, it is immutable and may be used by any attached dApp as a verified, trustless input.`;

export const MOCK_CASES: MockCase[] = [
  {
    id: '1',
    caseId: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    caseTitle: 'Token Dispute — Project Hydra v. DAO Treasury',
    plaintiff: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
    defendant: '0x9876543210FEDCBA9876543210FEDCBA98765432',
    status: 'Deliberating',
    verdict: 'Pending',
    requiredJurors: 7,
    enrolledJurors: 7,
    guiltyVotes: 0,
    notGuiltyVotes: 0,
    contractAddress: '0x1111222233334444555566667777888899990000',
    attachedDappCount: 2,
    createdAt: '2026-03-28T10:00:00Z',
    instructionsSet: true,
    instructionsSummary: DEFAULT_JURY_INSTRUCTIONS,
    instructionsHash: 'a3f1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
    acknowledgedCount: 7,
  },
  {
    id: '2',
    caseId: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    caseTitle: 'Smart Contract Exploit — Nexus Bridge',
    plaintiff: '0x1234ABCD5678EF901234ABCD5678EF901234ABCD',
    defendant: '0xEF901234ABCD5678EF901234ABCD5678EF901234',
    status: 'Closed',
    verdict: 'Guilty',
    requiredJurors: 5,
    enrolledJurors: 5,
    guiltyVotes: 4,
    notGuiltyVotes: 1,
    contractAddress: '0xAAAABBBBCCCCDDDDEEEEFFFF00001111222233334',
    attachedDappCount: 1,
    createdAt: '2026-03-20T09:00:00Z',
    instructionsSet: true,
    instructionsSummary: DEFAULT_JURY_INSTRUCTIONS,
    instructionsHash: 'b4c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
    acknowledgedCount: 5,
  },
  {
    id: '3',
    caseId: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    caseTitle: 'IP Ownership Dispute — NFT Collection Alpha',
    plaintiff: '0x2468ACE02468ACE02468ACE02468ACE024680000',
    defendant: '0x13579BDF13579BDF13579BDF13579BDF13570000',
    status: 'Open',
    verdict: 'Pending',
    requiredJurors: 9,
    enrolledJurors: 4,
    guiltyVotes: 0,
    notGuiltyVotes: 0,
    contractAddress: '0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEAD0000',
    attachedDappCount: 0,
    createdAt: '2026-04-01T15:30:00Z',
    instructionsSet: false,
    instructionsSummary: '',
    instructionsHash: '',
    acknowledgedCount: 0,
  },
];

export const MOCK_ATTACHED_DAPPS: MockAttachedDapp[] = [
  {
    dappId: 'd1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2',
    label: 'DAO Governance v2',
    contractAddress: '0xDAODAODAODAODAODAODAODAODAODAODAODAODAOD',
    bridgeStatus: 'Active',
    mirroredVerdict: 'Unknown',
    syncedAt: null,
    icon: '🏛️',
  },
  {
    dappId: 'e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3',
    label: 'Insurance Escrow Protocol',
    contractAddress: '0xESCROWESCROWESCROWESCROWESCROWESCROWESCR',
    bridgeStatus: 'Synced',
    mirroredVerdict: 'Pending',
    syncedAt: '2026-03-29T12:00:00Z',
    icon: '🔒',
  },
];

export const MOCK_JURORS: MockJuror[] = [
  { address: '0xJUROR1111', label: 'Juror #1', enrolled: true, hasVoted: false },
  { address: '0xJUROR2222', label: 'Juror #2', enrolled: true, hasVoted: false },
  { address: '0xJUROR3333', label: 'Juror #3', enrolled: true, hasVoted: false },
  { address: '0xJUROR4444', label: 'Juror #4', enrolled: true, hasVoted: false },
  { address: '0xJUROR5555', label: 'Juror #5', enrolled: true, hasVoted: false },
  { address: '0xJUROR6666', label: 'Juror #6', enrolled: true, hasVoted: false },
  { address: '0xJUROR7777', label: 'Juror #7', enrolled: true, hasVoted: false },
];

export function getStatusColor(status: MockJuryStatus): string {
  const map: Record<MockJuryStatus, string> = {
    Open: 'bg-emerald-900/40 text-emerald-400 border-emerald-700/50',
    Deliberating: 'bg-amber-900/40 text-amber-400 border-amber-700/50',
    Closed: 'bg-slate-800/60 text-slate-400 border-slate-600/50',
  };
  return map[status];
}

export function getVerdictColor(verdict: MockVerdict): string {
  const map: Record<MockVerdict, string> = {
    Pending: 'bg-slate-800/60 text-slate-400 border-slate-600/50',
    Guilty: 'bg-red-900/40 text-red-400 border-red-700/50',
    NotGuilty: 'bg-emerald-900/40 text-emerald-400 border-emerald-700/50',
    Hung: 'bg-orange-900/40 text-orange-400 border-orange-700/50',
  };
  return map[verdict];
}

export function getVerdictLabel(verdict: MockVerdict): string {
  const map: Record<MockVerdict, string> = {
    Pending: 'Pending',
    Guilty: 'Guilty',
    NotGuilty: 'Not Guilty',
    Hung: 'Hung Jury',
  };
  return map[verdict];
}

export function shortAddr(addr: string, chars = 8): string {
  if (addr.length <= chars * 2 + 2) return addr;
  return `${addr.slice(0, chars)}…${addr.slice(-chars)}`;
}
