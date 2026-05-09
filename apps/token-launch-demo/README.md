# Token Launch Demo

An end-to-end Web3 launch interface for ERC20 token creation and NFT collection flows.

## Overview

`token-launch-demo` is a product-loop frontend demo inside `web3-frontend-labs`.  
It shows how launch UIs can go from user input to metadata upload, contract creation, transaction tracking, and on-chain result reading.

## Features

- **ERC20 token launch flow**
  - token name/symbol/description/social links/max supply input
  - logo upload and metadata JSON generation
  - `TokenFactory.createToken` transaction submission
  - progress states, event log, tx hash, token address, metadata URL result
  - token info reader (`name`, `symbol`, `owner`, `supply`, `metadataURI`)
- **IPFS upload integration**
  - file and JSON upload route: `/api/ipfs/upload`
  - Pinata-backed upload client on the server
- **NFT collection flow (in the same app)**
  - create ERC721 collection (factory-based)
  - collection gallery + selection
  - NFT mint panel with metadata upload or custom token URI
  - on-chain collection/mint event history panels
- **Contract export sync integration**
  - frontend consumes generated ABIs/addresses from `@web3-frontend-labs/contracts/token-launch-demo`
- **Foundry deployment workflow**
  - token launch deploy/sync
  - NFT collection and NFT factory deploy/sync

## Tech Stack

- Next.js (App Router)
- TypeScript
- wagmi
- viem
- RainbowKit
- React Hook Form
- Zod
- TanStack React Query
- Pinata (`pinata-web3`) for IPFS uploads
- Solidity + Foundry
- ERC20 / ERC721 contracts

## Demo Flow

1. Connect wallet on the expected local chain.
2. Fill token or NFT collection parameters.
3. Validate inputs (Zod / form-level checks).
4. Upload logo/image and metadata to IPFS (Pinata route).
5. Submit contract creation / mint transaction.
6. Track launch progress and event logs.
7. Read on-chain contract data and view launch results (address, tx hash, metadata URI).

## Local Development

From monorepo root:

```bash
npm install
```

Run this app:

```bash
npm run dev -w apps/token-launch-demo
```

Alternative:

```bash
cd apps/token-launch-demo
npm run dev
```

Default URL: [http://localhost:3000](http://localhost:3000)

For local chain and contract deploy:

```bash
npm run chain:local
npm run deploy:token-launch
```

If you want NFT factory/collection flows fully wired to fresh deployments:

```bash
npm run deploy:nft-collection
npm run deploy:nft-collection-factory
```

For IPFS upload features, configure:

- `PINATA_JWT`
- `PINATA_GATEWAY`

in app/runtime environment before running upload flows.

## Contract Deployment

Token launch contracts:

- Deploy: `npm run contracts:deploy:token-launch:raw`
- Sync: `npm run contracts:sync:token-launch`
- One-shot: `npm run deploy:token-launch`

NFT contracts:

- Deploy collection: `npm run contracts:deploy:nft-collection:raw`
- Sync collection: `npm run contracts:sync:nft-collection`
- Deploy factory: `npm run contracts:deploy:nft-collection-factory:raw`
- Sync factory: `npm run contracts:sync:nft-collection-factory`

Generated exports are written under:

- `packages/contracts/src/token-launch-demo/*`

Frontend contract config reads those exports from:

- `src/lib/contracts/token-launch.ts`
- `src/lib/contracts/nft-contracts.ts`

## Project Structure

```txt
apps/token-launch-demo/
  src/
    app/
      page.tsx
      api/ipfs/upload/route.ts
    components/
      token-launch/
      nft-launch/
      token-launch-demo-shell.tsx
      demo-mode-selector.tsx
    hooks/
      token-launch/
      nft-launch/
    lib/
      token-launch/
      nft-launch/
      ipfs/
      contracts/
```

Key focus areas:

- `components/token-launch/*`: ERC20 launch form, progress, result, on-chain reader
- `components/nft-launch/*`: collection creation, gallery, mint panel, event history
- `hooks/token-launch/*` and `hooks/nft-launch/*`: upload, create, read, and event logic
- `app/api/ipfs/upload/route.ts`: server-side Pinata upload entrypoint

## Why This Demo Matters

This is a strong portfolio demo because it models a complete launch product loop, not just a standalone contract call.  
It combines UX design, metadata handling, contract integration, and deployment artifact sync in one workflow that resembles real creator tooling.

## Roadmap

- Multi-network launch support beyond local chain defaults
- Explorer URL integration for tx/address references
- Richer launch analytics dashboard
- Batch operations for collection and mint workflows
- More robust metadata/version management tooling

[Back to Web3 Frontend Labs](../../README.md)
