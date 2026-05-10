# SIWE + EIP-712 Demo

A Web3 authentication and typed-data signing demo that combines SIWE login with structured EIP-712 authorization flow.

## Overview

`siwe-eip712-demo` shows how wallet identity and business authorization work together:

- **SIWE** handles wallet-based login and session establishment.
- **EIP-712** handles structured business signatures (signed order payloads).

It is designed as a practical flow demo, not just a wallet connect page.

## Features

Implemented:

- Wallet connection with RainbowKit/wagmi
- SIWE login using NextAuth credentials provider
- Session state display (wallet vs authenticated address)
- Session guard that signs out on wallet/account/chain mismatch
- EIP-712 signed order form (recipient, amount, deadline, nonce)
- Backend order verification API (`/api/eip712/verify-order`)
  - signer recovery
  - chain check
  - allowed token check
  - session-address vs maker check
  - nonce consumption check
  - deadline check
- Nonce issuance API for typed signing (`/api/eip712/order-nonce`)
- On-chain demo interactions:
  - DemoERC20 approve
  - SignedOrderBook `executeOrder(...)`
  - TokenFaucet claim flow (test route)
- Contract config import from `@web3-frontend-labs/contracts/siwe-eip712-demo`

Also present in codebase:

- Legacy `/api/orders/*` nonce/verify endpoints and a legacy signer hook (not the primary UI path).

## Tech Stack

- Next.js (App Router)
- TypeScript
- wagmi
- viem
- RainbowKit
- NextAuth
- SIWE (`siwe`)
- EIP-712 typed-data signing
- React Hook Form + Zod
- Solidity + Foundry (local contract deployment and sync)

## Demo Flow

1. Connect wallet.
2. Sign in with Ethereum (SIWE).
3. Backend verifies SIWE message and establishes session.
4. Request an order nonce from backend.
5. Build typed order payload and sign via EIP-712.
6. Submit signature to backend verification API.
7. Approve DemoERC20 allowance.
8. Execute verified order on SignedOrderBook (demo on-chain step).

## Local Development

From monorepo root:

```bash
npm install
```

Run this app:

```bash
npm run dev -w apps/siwe-eip712-demo
```

Alternative:

```bash
cd apps/siwe-eip712-demo
npm run dev
```

Default URL: [http://localhost:3000](http://localhost:3000)

Environment variables used by auth flow:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
```

`NEXTAUTH_URL` and `NEXTAUTH_SECRET` are required for stable SIWE + NextAuth session behavior.

For local contract-enabled demo flow:

```bash
npm run chain:local
npm run deploy:siwe-eip712
```

## Contract Deployment

This demo is wired to Foundry deployment + sync scripts:

- Deploy raw script:
  - `npm run contracts:deploy:siwe-eip712:raw`
- Sync generated frontend artifacts:
  - `npm run contracts:sync:siwe-eip712`
- Combined command:
  - `npm run deploy:siwe-eip712`

Generated exports are written under:

- `packages/contracts/src/siwe-eip712-demo/contracts.ts`
- `packages/contracts/src/siwe-eip712-demo/index.ts`

Frontend consumption happens in:

- `apps/siwe-eip712-demo/src/lib/contracts.ts`

## Project Structure

```txt
apps/siwe-eip712-demo/
  src/
    app/
      page.tsx
      order/page.tsx
      api/auth/[...nextauth]/route.ts
      api/eip712/order-nonce/route.ts
      api/eip712/verify-order/route.ts
    components/
      providers.tsx
      siwe-status.tsx
      order-signer.tsx
      signature-flow-explainer.tsx
    hooks/
      useSiweStatusViewModel.ts
      useSiweSessionGuard.ts
      order/useOrderSigner.ts
      contract/useDemoToken.ts
      contract/useSignedOrderBook.ts
      contract/useTokenFaucet.ts
    lib/
      auth.ts
      contracts.ts
      eip712/domain.ts
      eip712/order.ts
      eip712/nonce.ts
```

## Why This Demo Matters

- It demonstrates a real wallet-auth flow (not only wallet connection).
- It cleanly separates **login signatures** (SIWE) from **business signatures** (EIP-712).
- It shows frontend/backend coordination for signature verification and session binding.
- It is highly relevant for wallet-based products that need both authentication and explicit off-chain authorization.

## Roadmap

- Add EIP-1271 smart contract wallet signature verification.
- Harden nonce service (storage durability and replay controls).
- Expand signed-message workflows beyond single order shape.
- Add clearer multi-chain environment support.
- Add persistent user/order history storage.

[Back to Web3 Frontend Labs](../../README.md)
