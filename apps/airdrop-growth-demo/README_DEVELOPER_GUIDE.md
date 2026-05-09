# Airdrop Growth Demo: Technical Walkthrough

This document is the developer-facing walkthrough for `apps/airdrop-growth-demo`.
It explains how the demo is implemented, how data moves across UI/hooks/API/contracts, and where behavior is real vs mocked.

## 1. Mental Model

Treat this demo as a Web3 growth campaign state machine driven by wallet identity plus task/referral progress.

Main runtime states:

- `wallet disconnected`
- `wallet connected`
- `tasks incomplete`
- `tasks verified`
- `user unqualified`
- `user claimable`
- `user claimed`
- `campaign expired` (implemented through deadline checks)

The architecture intentionally separates:

1. Wallet identity (`address`, `chainId`, connection state)
2. Task verification state (client + API mock verification)
3. Referral/points state (mock referral store + leaderboard endpoint)
4. Eligibility state (derived from task points and claim metadata)
5. On-chain claim state (`hasClaimed` read + `claim()` write)

This separation makes it easier to swap mock parts for production backends later without rewriting all UI logic.

## 2. High-Level Runtime Flow

1. App boots via App Router entry (`src/app/page.tsx`).
2. Root layout mounts providers (`src/app/layout.tsx` -> `AppProviders` -> shared `Web3WalletProvider`).
3. User connects wallet in `WalletStatusPanel` through RainbowKit.
4. `useAccount`/`useChainId` expose `address` and network in hooks.
5. `useAirdropGrowthDemo` assembles campaign state from task, eligibility, referral, leaderboard, and claim hooks.
6. Task list renders from `buildInitialTaskList`; wallet task may auto-mark verified when address exists.
7. Task verification runs:
   - locally for `connect_wallet`
   - server route for other tasks (`/api/tasks/verify`)
8. Eligibility and claim status are re-derived via `/api/campaign/eligibility` and `/api/campaign/claim-status`.
9. Claim button enables when state is `claimable`.
10. Claim action sends on-chain transaction (`claim()` on `AirdropGrowthClaim`).
11. On receipt, claim result card updates and `hasClaimed` is re-read from contract.
12. Referral stats and leaderboard continue to refresh from API queries.

## 3. File and Module Map

```txt
apps/airdrop-growth-demo/
  src/
    app/
      layout.tsx
      page.tsx
      globals.css
      api/
        campaign/eligibility/route.ts
        campaign/claim-status/route.ts
        tasks/verify/route.ts
        referral/route.ts
        leaderboard/route.ts
    components/
      airdrop-growth-demo-shell.tsx
      providers/app-providers.tsx
      campaign/*
      tasks/*
      claim/*
      referral/*
      leaderboard/*
      shared/event-log.tsx
    hooks/
      campaign/*
      tasks/*
      claim/*
      referral/*
      leaderboard/*
    lib/
      campaign/*
      tasks/*
      referral/*
      contracts/airdrop-growth.ts
```

Related monorepo modules:

- Shared wallet provider: `packages/wallet/src/provider.tsx`, `packages/wallet/src/config.ts`
- Generated contract exports:
  - `packages/contracts/src/airdrop-growth-demo/contracts.ts`
  - `packages/contracts/src/airdrop-growth-demo/deployment.meta.json`
- Foundry contracts and deploy:
  - `contracts/foundry/src/airdrop-growth-demo/RewardToken.sol`
  - `contracts/foundry/src/airdrop-growth-demo/AirdropGrowthClaim.sol`
  - `contracts/foundry/script/DeployAirdropGrowth.s.sol`
- Artifact sync script:
  - `scripts/sync-airdrop-growth-contracts.mjs`

## 4. Core Flow 1: Wallet Identity

Wallet identity is the primary campaign user key.

Where it is read:

- `useAccount` and `useChainId` in `useAirdropGrowthDemo`
- `WalletStatusPanel` for UI display and expected chain checks

Why address is the key:

- Task verification payloads include wallet address
- Referral link is generated as `?ref=<walletAddress>`
- On-chain claim and `hasClaimed` are wallet-address based

Disconnected / changed wallet behavior:

- Disconnected: `walletAddress` is absent; connect/sign tasks fail or become unavailable.
- Changed wallet: task query key (`buildTaskListQueryKey`) includes wallet address, so task state scope changes with wallet identity.

## 5. Core Flow 2: Task List and Verification

Task source:

- `src/lib/tasks/task-definitions.ts` defines five tasks and verify modes:
  - `frontend_wallet`
  - `wallet_signature`
  - `mock_api`

UI rendering:

- `TaskList` renders `TaskCard` list and a latest result panel.
- `TaskCard` displays title/points/status and verify action.

Verification execution:

- `useVerifyTask` handles mutation.
- `connect_wallet` is verified entirely on the client.
- Other task types call `POST /api/tasks/verify`.
- `sign_message` task:
  - UI triggers `useSignMessage` in `useAirdropGrowthDemo`
  - payload `{ message, signature }` is passed to verify API
  - server-side `verifyTaskMock` uses `viem.verifyMessage`.

Why this split exists:

- It demonstrates realistic UX/state transitions.
- It shows where production backend checks should live without requiring external integrations now.

Mock vs real:

- Real verification: wallet signature cryptographic verification exists for `sign_message`.
- Mocked verification: social tasks (`follow`, `join`, `visit_website`) return deterministic mock success.

## 6. Core Flow 3: Eligibility and Claim Status

Business logic:

- `calculatePoints` sums `task.points` where `status === "verified"`.
- `calculateEligibility` derives:
  - `unqualified`
  - `claimable`
  - `claimed`
  - `expired`

Inputs:

- tasks
- `hasClaimed`
- points threshold (`AIRDROP_GROWTH_POINTS_THRESHOLD = 300`)
- deadline (`AIRDROP_GROWTH_CLAIM_DEADLINE`)

How UI gets these states:

- `useEligibility` -> `POST /api/campaign/eligibility`
- `useClaimStatus` -> `POST /api/campaign/claim-status`

Edge cases:

- Wallet disconnected: `hasClaimed` contract read is disabled; defaults to not claimed, usually leading to `unqualified`.
- Already claimed: `hasClaimed === true` forces `claimed`.
- Expired campaign: `now > claimDeadline` returns `expired`.
- Insufficient points: returns `unqualified` with remaining-points reason.

## 7. Core Flow 4: Referral and Points

Referral generation:

- `buildReferralLink` builds URL with `ref` query param from wallet address.

Tracking logic:

- `useReferral` reads `?ref=` from URL and sends `PUT /api/referral`.
- Referee ID is either wallet address or a local visitor ID in `localStorage`.

Storage model:

- `mock-referral-store.ts` uses process memory (`globalThis.__airdropGrowthReferralStore`).
- Duplicate referee IDs per inviter are deduplicated via `Set`.
- Self-referral is blocked by lowercase comparison.

Points and multiplier:

- Stats are derived from mock baseline + recorded invites.
- `referralPoints` and `rewardMultiplier` are computed server-side in mock logic.

Status:

- Referral flow is implemented but backend persistence is mocked (in-memory only).

## 8. Core Flow 5: On-Chain Reward Claim

Contracts used by frontend:

- `AirdropGrowthClaim`
- `RewardToken`
- imported via `@web3-frontend-labs/contracts/airdrop-growth-demo` and wrapped in `src/lib/contracts/airdrop-growth.ts`

Claim transaction path:

1. `ClaimRewardCard` calls `handleClaimReward`.
2. `useClaimReward` sends `writeContractAsync` with `functionName: "claim"`.
3. `waitForTransactionReceipt` confirms transaction.
4. Receipt logs are decoded for `RewardClaimed` event.
5. Hook reads:
   - `AirdropGrowthClaim.hasClaimed(address)`
   - `RewardToken.balanceOf(address)`
6. UI displays tx hash, amount, and balance in `ClaimResultCard`.

Duplicate-claim prevention:

- Contract-level `hasClaimed` mapping + `AlreadyClaimed` error.
- Frontend also reads `hasClaimed` to derive UI claim status.

Important distinction:

- Claim is a real on-chain write.
- But campaign eligibility from tasks is off-chain UI/backend logic and is not automatically synced to contract `eligibleUsers`.

## 9. Core Flow 6: Leaderboard and Campaign Feedback

Leaderboard source:

- `GET /api/leaderboard` returns deterministic mock entries from hardcoded wallet seeds.
- Not derived from live task/referral data in a database.

Campaign feedback:

- `useAirdropGrowthDemo` appends activity events (`wallet_connected`, `wallet_signed`, `claim_confirmed`, etc.).
- `EventLog` renders this runtime feedback to make state transitions observable.

Why it matters:

- Growth UIs need visible progression and action feedback, not just final success/failure.

## 10. Contract and Deployment Flow

Foundry contracts:

- `RewardToken.sol`: ERC20 + `MINTER_ROLE`.
- `AirdropGrowthClaim.sol`:
  - eligibility map
  - `hasClaimed` map
  - deadline checks
  - reward transfer on claim
  - admin methods to set eligibility/reward/deadline

Deploy script:

- `DeployAirdropGrowth.s.sol` deploys both contracts, mints reward pool to claim contract.

Sync script:

- `sync-airdrop-growth-contracts.mjs` reads Foundry broadcast + artifacts, writes:
  - ABI exports
  - deployed addresses
  - deployment metadata
  into `packages/contracts/src/airdrop-growth-demo/*`.

Frontend import path:

- App consumes package exports in `src/lib/contracts/airdrop-growth.ts`.

Exact root commands:

```bash
npm run contracts:build
npm run contracts:deploy:airdrop-growth:raw
npm run contracts:sync:airdrop-growth
npm run deploy:airdrop-growth
```

## 11. Data Flow Diagram in Text

```txt
ConnectButton (RainbowKit)
  -> wagmi useAccount/useChainId
  -> useAirdropGrowthDemo (address, chain, hasClaimed read)
  -> useTaskList(buildInitialTaskList)
  -> Task verify action
      -> client verify (connect_wallet) OR /api/tasks/verify
      -> task cache update (React Query)
  -> /api/campaign/eligibility + /api/campaign/claim-status
  -> claimStatus == claimable
      -> writeContract(claim)
      -> waitForTransactionReceipt + decode RewardClaimed
      -> read hasClaimed + reward balance
  -> Referral query /api/referral + leaderboard /api/leaderboard
  -> EventLog updates for campaign feedback
```

## 12. Important Implementation Details

- **Zod validation in API routes**:
  - task verify payload
  - referral payload
  - eligibility/claim-status payloads
- **React Query keys**:
  - tasks: `["airdrop-growth-demo", "tasks", walletAddress | "disconnected"]`
  - eligibility and claim status include task array + params
  - referral and leaderboard have dedicated keys and refresh behavior
- **Mock backend storage**:
  - referral store is in-memory global map; resets on server restart
- **Event model**:
  - `GrowthEvent` union + `GrowthEventLogEntry`
  - entries are local runtime-only with `crypto.randomUUID()`
- **Contract hooks**:
  - read: `useReadContract` for `hasClaimed`
  - write: `useWriteContract` for `claim()`
  - post-tx reads via `publicClient.readContract`
- **Error handling**:
  - API routes return `{ ok: false, message }` with proper HTTP status
  - hooks throw user-facing errors when response is invalid
- **Loading states**:
  - every major panel includes explicit loading and empty/error UI

## 13. How to Extend This Demo

1. Add a new task:
   - append definition in `src/lib/tasks/task-definitions.ts`
   - handle verification branch in `use-verify-task.ts` or `/api/tasks/verify`.
2. Add new verification rule:
   - extend request schema in `src/app/api/tasks/verify/route.ts`
   - implement rule in `src/lib/tasks/verify-task-mock.ts` or replace with real service.
3. Add reward type:
   - extend `ClaimResult` and claim UI cards
   - extend contract wrapper and event parsing.
4. Replace mock backend:
   - move referral/task/leaderboard routes to persistent DB-backed services.
5. Add Merkle claim:
   - add Merkle root/proof checks in contract
   - add proof fetch endpoint and frontend proof submission.
6. Add admin campaign config:
   - add admin APIs/UI for threshold/deadline/task toggles.
7. Add analytics:
   - emit structured events from task verify, claim attempts, claim success/fail.

## 14. Local Development and Verification

From monorepo root:

```bash
npm install
```

Run app:

```bash
npm run dev -w apps/airdrop-growth-demo
```

Or inside app:

```bash
cd apps/airdrop-growth-demo
npm run dev
```

Optional local chain + contract deployment:

```bash
npm run chain:local
npm run deploy:airdrop-growth
```

Build/lint/typecheck:

```bash
npm run lint -w apps/airdrop-growth-demo
npm run build -w apps/airdrop-growth-demo
npm run typecheck
```

## 15. Known Limitations

- Social task verification is mock-based and not production-grade.
- Referral stats and leaderboard are mock/local endpoint data, not persistent analytics.
- Anti-sybil logic is simplified (no robust identity graph/device heuristics).
- Claim success depends on local chain and contract admin configuration.
- Task eligibility (off-chain) and contract `eligibleUsers` (on-chain) are not auto-synced.
- `schema.ts` exists but is currently empty.
- Merkle proof claim path is planned, not implemented.

