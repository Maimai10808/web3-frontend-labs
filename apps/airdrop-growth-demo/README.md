# Airdrop Growth Demo

A Web3 consumer growth campaign demo that combines wallet connection, task verification, referral growth, leaderboard, and reward claiming.

## Overview

`airdrop-growth-demo` is part of the `web3-frontend-labs` monorepo.
It models a practical C-end dApp growth funnel: users connect a wallet, complete tasks to accumulate points, check campaign eligibility, grow through referrals, and claim rewards when eligible.

The demo intentionally combines:

- frontend campaign state management
- mock backend verification and referral services
- on-chain claim interaction

## Features

- **Airdrop Eligibility Check**: calculate points and claimability from task completion state.
- **Task List**: wallet + social tasks with per-task status transitions.
- **Task Verification Mock**:
  - `connect_wallet` is verified client-side.
  - `sign_message` is verified by server-side signature verification.
  - social tasks use mock API verification.
- **Claim Reward**: submits on-chain `claim()` transaction to the demo claim contract.
- **Claim Status**: shows `unqualified / claimable / claimed / expired` based on current state.
- **Referral Link**: generates wallet-based referral URL (`?ref=...`).
- **Referral Points**: loads inviter stats from a mock referral backend.
- **Leaderboard**: displays ranked wallets from mock leaderboard data.
- **Anti-duplicate Claim**:
  - contract-level `hasClaimed` enforcement
  - frontend claim-state gating
- **Merkle Proof Claim**: **planned**, not implemented in this version.

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- wagmi + viem
- RainbowKit (via shared wallet provider package)
- TanStack React Query
- Zod
- Local API routes / mock backend logic
- Solidity + Foundry (RewardToken + AirdropGrowthClaim)

## Demo Flow

1. Connect wallet (RainbowKit / wagmi).
2. Complete or verify campaign tasks.
3. Recompute eligibility and claim status from task state.
4. Generate and share referral link, accumulate referral points.
5. View ranking in leaderboard.
6. Claim reward on-chain when status becomes claimable.

## Local Development

From monorepo root:

```bash
npm install
```

Start a local chain (optional but recommended for real claim transactions):

```bash
npm run chain:local
```

Deploy and sync airdrop-growth contracts:

```bash
npm run deploy:airdrop-growth
```

Run this app:

```bash
npm run dev -w apps/airdrop-growth-demo
```

Alternative:

```bash
cd apps/airdrop-growth-demo
npm run dev
```

Default URL: [http://localhost:3000](http://localhost:3000)

## Contract Deployment

This demo includes a Foundry deployment + artifact sync flow.

- Build contracts:
  ```bash
  npm run contracts:build
  ```
- Deploy airdrop-growth contracts:
  ```bash
  npm run contracts:deploy:airdrop-growth:raw
  ```
- Sync ABI/address exports to frontend package:
  ```bash
  npm run contracts:sync:airdrop-growth
  ```
- One-shot command:
  ```bash
  npm run deploy:airdrop-growth
  ```

Synced artifacts are written to:

- `packages/contracts/src/airdrop-growth-demo/contracts.ts`
- `packages/contracts/src/airdrop-growth-demo/deployment.meta.json`

The app consumes these exports through:

- `apps/airdrop-growth-demo/src/lib/contracts/airdrop-growth.ts`

## Project Structure

```txt
apps/airdrop-growth-demo/
  src/
    app/
      page.tsx
      layout.tsx
      api/
        campaign/
        tasks/
        referral/
        leaderboard/
    components/
      campaign/
      tasks/
      claim/
      referral/
      leaderboard/
      shared/
    hooks/
      campaign/
      tasks/
      claim/
      referral/
      leaderboard/
    lib/
      campaign/
      tasks/
      referral/
      contracts/
  README.md
```

Key supporting contract sources in monorepo:

- `contracts/foundry/src/airdrop-growth-demo/*`
- `contracts/foundry/script/DeployAirdropGrowth.s.sol`
- `scripts/sync-airdrop-growth-contracts.mjs`
- `packages/contracts/src/airdrop-growth-demo/*`

## Why This Demo Matters

This demo shows how to build a realistic Web3 growth campaign frontend:

- wallet identity as campaign identity
- task verification and points progression
- separation of frontend campaign state from on-chain claim state
- anti-duplicate claim protection patterns
- referral and leaderboard mechanics for user growth loops

It is useful for interview and portfolio discussions because it demonstrates both product flow design and implementation-level Web3 integration.

## Roadmap

- Add Merkle proof-based claim path
- Replace mock task verification with external integrations
- Add campaign admin panel for task/rule management
- Support multi-token or NFT reward campaigns
- Add analytics and event tracking for growth funnel metrics

[Back to Web3 Frontend Labs](../../README.md)
