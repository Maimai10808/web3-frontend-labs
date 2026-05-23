# Web3 Frontend Labs

Web3 Frontend Labs is a monorepo of focused Web3 frontend engineering demos.
It covers practical product flows across wallet integration, contract interaction, signature flows, async task state management, and modern frontend architecture.

## Apps

| App                                                                 | Focus                                        | Highlights                                                                                                                           |
| ------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [ai-task-state-demo](./apps/ai-task-state-demo/README.md)           | Async task state management                  | queued/processing/succeeded/failed states, polling, SSE, upload preview, retry, cancel, Cloudflare AI integration with mock fallback |
| [airdrop-growth-demo](./apps/airdrop-growth-demo/README.md)         | Web3 growth campaign and airdrop claim flow  | wallet connection, eligibility state, campaign tasks, referral flow, claim status, contract interaction                              |
| [defi-visualization-demo](./apps/defi-visualization-demo/README.md) | DeFi dashboard and data visualization        | protocol metrics, financial UI, charts, token/pool-style data presentation                                                           |
| [multichain-wallet-demo](./apps/multichain-wallet-demo/README.md)   | Multi-chain wallet UX                        | wallet connection, account state, chain detection, network switching, multi-chain UI patterns                                        |
| [siwe-eip712-demo](./apps/siwe-eip712-demo/README.md)               | Wallet login and typed-data signatures       | SIWE authentication, NextAuth session, EIP-712 signing, server-side signature verification                                           |
| [tanstack-table-demo](./apps/tanstack-table-demo/README.md)         | Data table architecture and state modeling   | React Query data containers, TanStack Table composition, virtualized audit logs, reusable people/activity table modules             |
| [telegram-ton-demo](./apps/telegram-ton-demo/README.md)             | Telegram Mini App and TON wallet integration | Telegram Mini App runtime, TON Connect, wallet connection inside Telegram                                                            |
| [token-launch-demo](./apps/token-launch-demo/README.md)             | Token launch frontend flow                   | launch configuration, token metadata, deployment sync, contract read/write interaction                                               |
| [trade-flow-demo](./apps/trade-flow-demo/README.md)                 | Trading flow UI                              | quote state, transaction confirmation, slippage, pending/error/success transaction states                                            |

## Repository Structure

```text
web3-frontend-labs/
  apps/
  contracts/
    foundry/
  packages/
  scripts/
```

- `apps/`: frontend demo applications
- `contracts/foundry/`: Solidity contracts and Foundry deployment scripts
- `packages/`: shared internal packages
- `scripts/`: sync and deployment helper scripts

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- wagmi
- viem
- RainbowKit
- NextAuth
- SIWE
- EIP-712
- Solidity
- Foundry
- Turborepo

## Common Commands

 Install new project:
```bash
npx create-next-app@latest apps/new-project-demo \
  --use-npm \
  --ts \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --skip-git
```

Install dependencies:

```bash
npm install
```

Start all apps:

```bash
npm run dev
```

Build all apps:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Type check:

```bash
npm run typecheck
```

Format:

```bash
npm run format
```

Run a specific app:

```bash
npm run dev -w apps/ai-task-state-demo
```

## Using Shared Workspace Packages in a New Demo

When creating a new app under `apps/*`, follow this pattern for internal package usage.

### 1. Add workspace dependencies in the app `package.json`

Use workspace package names (not relative filesystem paths):

```json
{
  "dependencies": {
    "@web3-frontend-labs/ui": "*",
    "@web3-frontend-labs/wallet": "*",
    "@web3-frontend-labs/contracts": "*",
    "@web3-frontend-labs/i18n": "*"
  }
}
```

Then install from repo root:

```bash
npm install
```

### 2. Import rules

- Package-internal imports: use `@/*` (mapped to the app's own `src/*`)
- Cross-package imports: use package names only
- Do not use `../../../packages/...` style imports

Examples:

```ts
import { cn } from "@web3-frontend-labs/ui/utils";
import { Button } from "@web3-frontend-labs/ui/components/button";
import { Web3WalletProvider } from "@web3-frontend-labs/wallet";
import { tokenFactoryAbi } from "@web3-frontend-labs/contracts/token-launch-demo";
import { routing } from "@web3-frontend-labs/i18n/routing";
```

### 3. Next.js transpilation for workspace TypeScript packages

If the app consumes internal TS source packages, add `transpilePackages` in `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@web3-frontend-labs/ui",
    "@web3-frontend-labs/wallet",
    "@web3-frontend-labs/contracts",
    "@web3-frontend-labs/i18n",
  ],
};

export default nextConfig;
```

Keep only the packages your app actually uses.

### 4. Tailwind v4 source scanning for shared UI classes

If you use `@web3-frontend-labs/ui` components, add to your app `src/app/globals.css`:

```css
@import "tailwindcss";
@source "../../../../packages/ui/src/**/*.{ts,tsx}";
```

### 5. tsconfig alias baseline for apps

Use local app alias only:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Do not map app `@/*` to other workspace packages.

## Local Blockchain and Contract Commands

Start local Anvil chain:

```bash
npm run chain:local
```

Build contracts:

```bash
npm run contracts:build
```

Deploy default local contracts and sync frontend artifacts:

```bash
npm run deploy:local
```

Deploy token launch contracts:

```bash
npm run deploy:token-launch
```

Deploy NFT collection contracts:

```bash
npm run deploy:nft-collection
```

Deploy NFT collection factory contracts:

```bash
npm run deploy:nft-collection-factory
```

Deploy airdrop growth contracts:

```bash
npm run deploy:airdrop-growth
```

Deploy siwe eip712 contracts:

```bash
npm run deploy:siwe-eip712
```

Deploy trading demo contracts:

```bash
npm run deploy:trading-demo
```

Deploy nft demo contracts:

```bash
npm run deploy:nft-demo
```

Most deploy commands follow this flow: build contracts -> deploy with Foundry -> sync addresses and ABIs to frontend apps.

## Environment Variables

- Each app may define its own `.env.local` under `apps/<app-name>/`.
- Foundry deployment environment variables usually live in `contracts/foundry/.env`.
- Never commit private keys, wallet secrets, or API tokens.

## Project Purpose

This repository is built as a Web3 frontend portfolio/lab. It demonstrates:

- practical dApp frontend architecture
- wallet and contract interaction
- signature authentication and typed-data signing
- async task state modeling
- deployment artifact sync
- interview-friendly and GitHub-friendly project organization
