// ─── Jury DApp — Shared TypeScript Types ─────────────────────────────────────

export enum JuryStatus {
  Open = 'Open',
  Deliberating = 'Deliberating',
  Closed = 'Closed',
}

export enum Verdict {
  Pending = 'Pending',
  Guilty = 'Guilty',
  NotGuilty = 'NotGuilty',
  Hung = 'Hung',
}

export enum BridgedVerdict {
  Unknown = 'Unknown',
  Pending = 'Pending',
  Guilty = 'Guilty',
  NotGuilty = 'NotGuilty',
  Hung = 'Hung',
}

export enum BridgeStatus {
  Unregistered = 'Unregistered',
  Active = 'Active',
  Synced = 'Synced',
}

// ─── On-chain state mirrors ───────────────────────────────────────────────────

export interface JuryLedgerState {
  caseId: Uint8Array;          // Bytes<32>
  caseTitle: Uint8Array;       // Bytes<64>
  plaintiff: Uint8Array;       // Bytes<32>
  defendant: Uint8Array;       // Bytes<32>
  requiredJurors: number;
  enrolledCount: bigint;
  guiltyVotes: bigint;
  notGuiltyVotes: bigint;
  juryInstructions: Uint8Array; // Bytes<256> — inline summary
  instructionsHash: Uint8Array; // Bytes<32>  — SHA-256 of full doc
  instructionsSet: boolean;
  acknowledgedCount: bigint;
  status: JuryStatus;
  verdict: Verdict;
  dappCount: bigint;
  lastVerdictBlock: bigint;
}

export interface BridgeLedgerState {
  juryContractAddress: Uint8Array;
  bridgeId: Uint8Array;
  mirroredVerdict: BridgedVerdict;
  mirroredCaseId: Uint8Array;
  mirroredPlaintiff: Uint8Array;
  mirroredDefendant: Uint8Array;
  status: BridgeStatus;
  syncedAtBlock: bigint;
  customContext: Uint8Array;
}

// ─── API request / response shapes ───────────────────────────────────────────

export interface InitializeCaseParams {
  caseId: string;         // hex string, 32 bytes
  caseTitle: string;      // utf-8, max 64 bytes
  plaintiff: string;      // hex string, 32 bytes
  defendant: string;      // hex string, 32 bytes
  requiredJurors: number;
}

export interface SetInstructionsParams {
  summary: string;        // plain text, max 256 bytes
  docHash: string;        // hex string, 32 bytes — SHA-256 of full document
}

export interface DeployJuryResult {
  contractAddress: string;
  initialState: JuryLedgerState;
}

export interface AttachedDapp {
  dappId: string;         // hex string, 32 bytes
  active: boolean;
  label?: string;         // off-chain human-readable name (stored client-side)
}

export interface BridgeRegisterParams {
  juryContractAddress: string;   // hex string
  bridgeId: string;              // hex string, 32 bytes
  customContext?: string;        // hex string, 64 bytes (padded if shorter)
}

// ─── Midnight provider config ─────────────────────────────────────────────────

export interface MidnightProviderConfig {
  networkId: 'TestNet' | 'DevNet' | 'MainNet';
  indexerUri: string;
  proverServerUri: string;
  walletSeedPhrase?: string;  // for headless / CI usage only
}

// ─── Circuit names (must match .compact export names) ────────────────────────

export const JURY_CIRCUITS = {
  initializeCase: 'initializeCase',
  enrollJuror: 'enrollJuror',
  setInstructions: 'setInstructions',
  acknowledgeInstructions: 'acknowledgeInstructions',
  startDeliberation: 'startDeliberation',
  castVote: 'castVote',
  finalizeVerdict: 'finalizeVerdict',
  attachDapp: 'attachDapp',
  detachDapp: 'detachDapp',
  queryVerdict: 'queryVerdict',
  queryStatus: 'queryStatus',
  queryInstructions: 'queryInstructions',
  queryInstructionsHash: 'queryInstructionsHash',
  queryInstructionsSet: 'queryInstructionsSet',
  queryAcknowledgedCount: 'queryAcknowledgedCount',
  queryIsDappAttached: 'queryIsDappAttached',
  queryJurorEnrolled: 'queryJurorEnrolled',
  queryHasVoted: 'queryHasVoted',
} as const;

export const BRIDGE_CIRCUITS = {
  register: 'register',
  syncVerdict: 'syncVerdict',
  updateContext: 'updateContext',
  getVerdict: 'getVerdict',
  isGuilty: 'isGuilty',
  isNotGuilty: 'isNotGuilty',
  isHung: 'isHung',
  isSynced: 'isSynced',
  getCustomContext: 'getCustomContext',
} as const;

// ─── Helper utilities ─────────────────────────────────────────────────────────

export function hexToBytes32(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/, '').padStart(64, '0').slice(0, 64);
  const arr = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    arr[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return arr;
}

export function stringToBytes256(str: string): Uint8Array {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str);
  const arr = new Uint8Array(256);
  arr.set(encoded.slice(0, 256));
  return arr;
}

export function bytes256ToString(bytes: Uint8Array): string {
  const decoder = new TextDecoder();
  return decoder.decode(bytes).replace(/\0/g, '').trim();
}

export function hexToBytes64(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/, '').padStart(128, '0').slice(0, 128);
  const arr = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    arr[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return arr;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function stringToBytes64(str: string): Uint8Array {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str);
  const arr = new Uint8Array(64);
  arr.set(encoded.slice(0, 64));
  return arr;
}

export function bytes64ToString(bytes: Uint8Array): string {
  const decoder = new TextDecoder();
  return decoder.decode(bytes).replace(/\0/g, '').trim();
}
