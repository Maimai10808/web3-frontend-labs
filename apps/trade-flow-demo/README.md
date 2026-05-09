# Trading State Demo

A Web3 trading lifecycle UI demo focused on order submission state, transaction flow, and order-status tracking.

## Overview

This demo models the state-heavy behavior of real trading products: form validation, typed-data signing, transaction submission, and order monitoring.  
It is part of the `web3-frontend-labs` monorepo and uses local contract deployments for end-to-end testing.

## Features

- **Trade Form**: side/market/amount/price/slippage/deadline inputs with trading-oriented layout.
- **Form Validation (Zod + React Hook Form)**: input constraints and inline error states.
- **Pre-submit Summary**: inline notional/slippage/deadline preview derived from current form values.
- **EIP-712 Signing**: signs `TradeOrder` typed data before submission.
- **On-chain Order Submission**: calls `TradeOrderBook.submitOrder(...)` through wagmi/viem.
- **Transaction Lifecycle Feedback**: clear pending/error/success feedback during signing and submission.
- **Order Monitor**: reads chain events + current order state and shows status badges/statistics.
- **Live Order Updates**: updates order list with `useWatchContractEvent` (`OrderSubmitted`, etc.).
- **Terminal / Event Panels**: Zustand-backed activity log for payloads, responses, and contract events.
- **Mock API Flow (available)**: mock submit/orders/stream routes exist for local backend simulation.

Planned / not fully wired in current UI:

- Dedicated quote engine and quote API (current preview is a lightweight local summary).
- SSE-driven UI consumption from `/api/trade/stream` (endpoint exists; main UI uses on-chain event watching).

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
- React Hook Form
- Zod
- TanStack React Query
- Zustand
- wagmi
- viem
- RainbowKit
- Solidity + Foundry (local contracts and deployment)

## Demo Flow

1. Connect wallet in the dashboard header.
2. Enter side, amount, price, slippage, and deadline.
3. Validate inputs through Zod + form state.
4. Review inline trade summary (notional/slippage/deadline).
5. Click **Sign & Submit**.
6. Sign typed data (EIP-712) and submit on-chain order.
7. Track submission state and errors in the ticket + terminal.
8. Monitor order status updates in the order table and events panel.

## Local Development

From monorepo root:

```bash
npm install
```

Run this app:

```bash
npm run dev -w apps/trade-flow-demo
```

Alternative:

```bash
cd apps/trade-flow-demo
npm run dev
```

Default URL: [http://localhost:3000](http://localhost:3000)

For local chain + contracts:

```bash
npm run chain:local
npm run deploy:trading-demo
```

## Contract Deployment

This demo consumes generated exports from `@web3-frontend-labs/contracts/trading-demo`.

Relevant contracts:

- `MockToken` (market quote token metadata/read checks)
- `TradeOrderBook` (typed-data order submission and state)

Root commands:

```bash
npm run contracts:build
npm run contracts:deploy:trade-flow:raw
npm run contracts:deploy:trading-state:raw
npm run contracts:sync:trading-demo
```

Combined command:

```bash
npm run deploy:trading-demo
```

Sync script:

- `scripts/sync-trading-demo-contracts.mjs`

Generated exports:

- `packages/contracts/src/trading-demo/contracts.ts`
- `packages/contracts/src/trading-demo/deployment.meta.json`

## Project Structure

```txt
apps/trade-flow-demo/
  src/
    app/
      page.tsx
      layout.tsx
      api/trade/
        submit/route.ts
        orders/route.ts
        stream/route.ts
    components/
      trade/
        trade-form.tsx
        order-table.tsx
        log-panel.tsx
        trade-hero.tsx
      wallet/wallet-status.tsx
      providers/app-providers.tsx
    hooks/
      trade/
        useSubmitTrade.ts
        use-submit-chain-order.ts
        useOrders.ts
        useOrderEvents.ts
        useTradeLogStore.ts
      contracts/use-trade-order-book.ts
    lib/
      trade/
        schema.ts
        types.ts
        encode.ts
        order-store.ts
        mock-signer.ts
      contracts/trade-order-book.ts
```

## Why This Demo Matters

Trading UIs are state-heavy and error-prone. This demo shows how to make transaction state explicit and observable across form validation, signing, pending/confirmed states, and order monitoring.  
It is useful for interview and portfolio discussions because it mirrors real exchange-style frontend workflows.

## Roadmap

- Add stronger quote simulation/preview engine.
- Wire SSE stream as a first-class UI update channel.
- Add richer error-recovery actions (retry / re-sign / reconnect guidance).
- Persist order history beyond in-memory/local process state.
- Add market depth and order-book visualization.
- Add indexed transaction and analytics views.

[Back to Web3 Frontend Labs](../../README.md)
