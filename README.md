# Midnight Jury DApp

A privacy-preserving jury / verdict system built on **Midnight Network** using
zero-knowledge (ZK) proofs. Votes are hidden via ZK witnesses — only the tally
is updated on-chain, never individual choices. The system includes a composability
bridge so any other dApp can attach to a jury and receive verified verdicts.

---

## Architecture

```
midnight-jury-dapp/
├── contract/          Compact smart contracts (Midnight's ZK language)
│   └── src/
│       ├── jury.compact          Main jury contract
│       └── jury-bridge.compact   Composability bridge contract
├── api/               TypeScript API wrapping the Midnight SDK
│   └── src/
│       ├── types.ts
│       ├── providers.ts
│       ├── jury-api.ts
│       └── bridge-api.ts
└── ui/                React + Vite + TailwindCSS frontend
```

---

## Key Concepts

### ZK-Private Voting (`jury.compact`)

| Circuit | Privacy | Description |
|---|---|---|
| `initializeCase` | Public | Deploy a new case with plaintiff, defendant, juror count |
| `enrollJuror` | Private identity | Caller address is a ZK witness |
| `startDeliberation` | Public | Transitions to voting phase |
| `castVote` | **Private vote** | `privateVote()` witness — never revealed on-chain |
| `finalizeVerdict` | Public | Tallies votes, applies ⅔ supermajority rule |
| `attachDapp` / `detachDapp` | Public | Register external dApps for verdict propagation |

### DApp Composability (`jury-bridge.compact`)

External dApps deploy their own `JuryBridge` instance:

1. Call `register(juryContractAddress, bridgeId, context)`
2. Register the bridge address with the Jury DApp via `attachDapp(bridgeAddress)`
3. After verdict, call `syncVerdict()` — Midnight's cross-contract state proofs
   verify the verdict without a trusted oracle
4. Your dApp circuits can read `ledger.mirroredVerdict` with full ZK provability

---

## Quick Start

### Prerequisites

- Node.js ≥ 20
- [Midnight Compact compiler](https://docs.midnight.network/develop/tutorial/building/getting-started) (`compactc`)
- [Midnight Lace wallet](https://midnight.network/lace) (browser extension for UI)

### Install

```bash
# From the monorepo root
npm install
```

### Run the UI (mock mode — no live node needed)

```bash
npm run dev
# → http://localhost:3000
```

The UI ships with mock data and simulated ZK delays so you can explore
the full workflow without a running Midnight node.

### Compile Contracts

```bash
npm run compile:contracts
# Runs compactc on jury.compact and jury-bridge.compact
# Output: contract/dist/jury/ and contract/dist/jury-bridge/
```

### Deploy to TestNet

```typescript
import { createMidnightProvider, createAndDeployJury } from '@midnight-jury/api';

const bundle = await createMidnightProvider({
  networkId: 'TestNet',
  indexerUri: '',     // uses default TestNet indexer
  proverServerUri: '', // uses default TestNet prover
});

const { api, result } = await createAndDeployJury(bundle, {
  caseId: '0x' + randomHex(32),
  caseTitle: 'My Dispute',
  plaintiff: '0x...',
  defendant: '0x...',
  requiredJurors: 7,
});

console.log('Contract deployed at:', result.contractAddress);
```

### Attach Another DApp

```typescript
import { deployBridge } from '@midnight-jury/api';

// Deploy a bridge from the external dApp's context
const { api: bridge, address } = await deployBridge(bundle, juryApi, bridgeId);

// Register with the jury
await juryApi.attachDapp(bridgeId);

// After verdict is finalized, sync it to the bridge
const verdict = await bridge.syncVerdict(juryApi);
console.log('Mirrored verdict:', verdict);

// Your dApp circuits can now read bridge.mirroredVerdict on-chain
// with full cross-contract ZK proof verification
```

---

## Verdict Rules

- **Guilty** — ≥ ⌈2/3⌉ of required jurors voted Guilty
- **Not Guilty** — ≥ ⌈2/3⌉ of required jurors voted Not Guilty
- **Hung Jury** — neither side reached the supermajority threshold
- **Pending** — deliberation not yet finalized

---

## Privacy Guarantees

| What is visible on-chain | What is NOT visible |
|---|---|
| Case ID, title, parties | Individual votes |
| Juror enrolled (address) | How each juror voted |
| Vote cast (address marked) | Vote direction |
| Final tally | Link between juror and vote |
| Verdict | Juror deliberation comms |

Midnight's ZK prover ensures the above guarantees are enforced at the
cryptographic level — not by policy.

---

## Network Endpoints

| Network | Indexer | Status |
|---|---|---|
| DevNet | `https://indexer.devnet.midnight.network/api/v1/graphql` | Active |
| TestNet | `https://indexer.testnet.midnight.network/api/v1/graphql` | Active |
| MainNet | — | Not yet live |

---

## License

MIT
