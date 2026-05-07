# Multichain Wallet Demo

This app is a Web3 frontend demo focused on multi-chain wallet UX: wallet connection state, chain awareness, and network-specific interaction patterns across EVM, Solana, BTC, and Sei.  
It is part of the **web3-frontend-labs** monorepo.

## What This Demo Shows

- Multi-ecosystem switching (`evm`, `solana`, `btc`, `sei`, plus reserved `ton` mode)
- Wallet connection and disconnection flows with ecosystem-specific wallet selection
- Unified connected account overview (namespace, wallet name, address, chain/network info)
- Network status detection, including wrong-network handling and EVM chain switch action
- Intent lab for signing and sending demo transactions with adapter-specific capabilities
- Event log panel for connection, signing, and transaction feedback
- Internationalized App Router flow (`en`, `zh-CN`, `ja`) with locale routing

## Why This Demo Matters

Multi-chain dApps need explicit wallet and network state handling to reduce user confusion and failed actions.  
This demo models practical frontend patterns for disconnected states, wrong-network prompts, wallet capability differences, and action feedback in a single interface.

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- wagmi
- viem
- @tanstack/react-query
- next-intl
- Zustand
- Solana Wallet Adapter (`@solana/wallet-adapter-*`, `@solana/web3.js`)

## Project Structure

```txt
apps/multichain-wallet-demo/
  src/
    app/
      [locale]/
      api/wallet/
    components/
      wallet/
    hooks/
      multichain/
    i18n/
      messages/
    lib/
      multichain/
    providers/
    store/
  middleware.ts
  next.config.ts
  package.json
```

- `src/app`: App Router pages, locale entrypoints, and wallet demo API routes
- `src/components/wallet`: main demo UI (overview, wallet control, intent lab, event logs)
- `src/hooks/multichain`: wallet state, adapter orchestration, signing/transaction hooks
- `src/lib/multichain`: chain config, adapters, wallet integrations, shared types
- `src/providers`: app providers (wagmi, Solana, React Query, i18n)
- `src/store`: centralized multichain demo state via Zustand

## Getting Started

Install dependencies from monorepo root:

```bash
npm install
```

Run this app from monorepo root:

```bash
npm run dev -w apps/multichain-wallet-demo
```

Or run inside the app directory:

```bash
cd apps/multichain-wallet-demo
npm run dev
```

Default local URL:

[http://localhost:3000](http://localhost:3000)

## Environment Variables

For the default local UI, no required app-specific environment variable is needed.

If you want to use the WalletConnect option in EVM mode, set:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

Place app-specific variables in:

`apps/multichain-wallet-demo/.env.local`

## Available Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Demo Scope

- This is a frontend engineering demo.
- It focuses on wallet and network UX across multiple ecosystems.
- It is not a production wallet application.
- It can be extended with deeper contract flows, history, and cross-chain coordination.

## Monorepo Navigation

[Back to Web3 Frontend Labs](../../README.md)
