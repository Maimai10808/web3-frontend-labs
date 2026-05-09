# Token Launch Demo: Technical Walkthrough

This document is the developer-facing walkthrough for `apps/token-launch-demo`.

It explains how the launch flows are built, how data moves across modules, and how Foundry deployment artifacts are synced into frontend contract configs.

## 1) Mental Model

Model this app as a **launch pipeline**, not a single wallet button:

1. Collect launch input (token or NFT collection/mint fields)
2. Validate and normalize inputs
3. Build metadata payloads
4. Upload assets/JSON to IPFS (Pinata)
5. Trigger factory/collection contract transactions
6. Decode transaction results and on-chain events
7. Read contract state back from chain
8. Render launch result and monitoring panels

This differs from a basic "connect wallet + call contract" demo because it includes:

- multi-step progress modeling
- metadata and file handling
- event-driven result extraction
- contract artifact sync from Foundry to frontend imports

## 2) High-Level Runtime Flow

At runtime:

1. `src/app/layout.tsx` mounts global providers (`Web3WalletProvider`).
2. `src/app/page.tsx` renders:
   - wallet status
   - mode selector (`token-launch` vs `nft-collection`)
   - selected workflow shell
3. User chooses mode in `DemoModeSelector`.
4. Form inputs are collected and validated.
5. Metadata flow runs (logo/image upload -> metadata JSON upload).
6. Transaction flow runs (wallet confirm -> tx submitted -> tx confirmed).
7. Event/receipt parsing extracts created token/collection data.
8. Result cards and readers display address, tx hash, metadata URI, and on-chain fields.

## 3) File and Module Architecture

```txt
apps/token-launch-demo/
  src/
    app/
      layout.tsx
      page.tsx
      api/ipfs/upload/route.ts
    components/
      token-launch/*
      nft-launch/*
      token-launch-demo-shell.tsx
      demo-mode-selector.tsx
      providers/app-providers.tsx
    hooks/
      token-launch/*
      nft-launch/*
    lib/
      token-launch/*
      nft-launch/*
      contracts/{token-launch,nft-contracts}.ts
      ipfs/{pinata-client,resolve-ipfs-uri}.ts
```

Related monorepo contract pipeline:

- `contracts/foundry/src/token-launch-demo/*`
- `contracts/foundry/script/{DeployTokenLaunch,DeployNftCollection,DeployNftCollectionFactory}.s.sol`
- `scripts/sync-token-launch-contracts.mjs`
- `scripts/sync-nft-collection.mjs`
- `scripts/sync-nft-collection-factory.mjs`
- generated outputs in `packages/contracts/src/token-launch-demo/*`

## 4) Core Flow 1: Token Launch Form

Main component: `components/token-launch/token-launch-form.tsx`  
Main orchestrator: `hooks/token-launch/use-token-launch-form.ts`

Important points:

- Uses local `useState` model for form values (not React Hook Form here).
- Tracks `launchStep` state machine:
  - `idle -> logo_uploading -> metadata_building -> metadata_uploading -> wallet_confirming -> tx_pending -> tx_confirming -> success|error`
- Builds preview URL for selected logo file.
- Stores structured event logs (`TokenLaunchEvent`) for UI event panel.
- Exposes result state:
  - metadata preview
  - tx hash
  - created token address
  - token info reader default address

Why this shape: token launch is modeled as an explicit pipeline, so each async step can be shown to users and retried.

## 5) Core Flow 2: Form Validation

Token validation:

- `lib/token-launch/schema.ts`
- `validateTokenLaunchForm(...).safeParse(...)`

Rules include:

- required token name/symbol/description/logo
- max length constraints for name/symbol/description
- optional social links normalized via preprocess

NFT collection and mint validation:

- `lib/nft-launch/schema.ts`
- collection form: name/symbol/description/image/maxSupply/mintPrice validation
- mint form: receiver address validation (`viem.isAddress`), and conditional requirements when `customTokenURI` is not provided

Note on form libraries:

- token launch form: manual state + Zod safeParse
- NFT mint panel: React Hook Form + Zod resolver
- NFT collection form: manual state + Zod safeParse

## 6) Core Flow 3: Metadata and IPFS (Pinata)

Server entrypoint:

- `src/app/api/ipfs/upload/route.ts`

Server client:

- `src/lib/ipfs/pinata-client.ts` (`server-only`)

Two upload modes:

1. `multipart/form-data` for image/logo files
2. `application/json` for metadata JSON

Token metadata path:

- upload logo (`useUploadTokenLogo`)
- build JSON (`buildTokenMetadata`)
- upload JSON (`useUploadTokenMetadata`)
- pass resulting URI into token creation args

NFT metadata path:

- collection image upload (`useUploadCollectionImage`)
- collection metadata build/upload (`buildCollectionMetadata`, `useUploadCollectionMetadata`)
- NFT image upload (`useUploadNftImage`)
- NFT metadata build/upload (`buildNftMetadata`, `useUploadNftMetadata`)

Environment requirement:

- `PINATA_JWT`
- `PINATA_GATEWAY`

If missing, upload flow fails at server side.

## 7) Core Flow 4: Contract Creation from Frontend

### Token flow

- Hook: `hooks/token-launch/use-create-token.ts`
- Contract call: `TokenFactory.createToken(config)`
- Args built by: `lib/token-launch/build-create-token-args.ts`
- Uses `wagmi` `useWriteContract` + `usePublicClient.waitForTransactionReceipt`
- Parses `TokenLaunched` event from receipt logs to recover token address

This is **factory-based creation**, not direct contract deployment from frontend.

### NFT collection flow

- Hook: `hooks/nft-launch/use-create-nft-collection.ts`
- Contract call: `LaunchERC721Factory.createCollection(config)`
- Config built by: `lib/nft-launch/build-create-collection-args.ts`
- Parses `CollectionCreated` event to recover collection address and launch details

### NFT mint flow

- Hook: `hooks/nft-launch/use-mint-nft.ts`
- Contract call:
  - `mint()` or
  - `mintWithURI(customTokenURI)`
- Chooses function via `lib/nft-launch/build-mint-args.ts`
- Parses `CollectionMinted` event + reads `tokenURI`

## 8) Core Flow 5: Foundry Deployment and Sync Pipeline

Contracts:

- `TokenFactory.sol`
- `LaunchERC20.sol`
- `LaunchERC721Collection.sol`
- `LaunchERC721Factory.sol`

Deploy scripts:

- `DeployTokenLaunch.s.sol`
- `DeployNftCollection.s.sol`
- `DeployNftCollectionFactory.s.sol`

Sync scripts:

- `sync-token-launch-contracts.mjs`
- `sync-nft-collection.mjs`
- `sync-nft-collection-factory.mjs`

What sync does:

- reads Foundry artifacts + broadcast outputs
- writes ABI/address/meta files into `packages/contracts/src/token-launch-demo/*`
- exposes typed exports consumed by frontend contract config modules

Why this pattern is useful:

- frontend never hardcodes ABI/address manually
- deploy output and UI imports stay synchronized in monorepo workflow

## 9) Core Flow 6: On-Chain Reads and Result Presentation

Token read path:

- `hooks/token-launch/use-token-info.ts`
- reads:
  - `TokenFactory.launchRecordByToken`
  - `LaunchERC20.name/symbol/totalSupply/owner/metadataURI`
- normalizes tuple/object return shapes
- renders in `TokenInfoReader`

NFT read path:

- `useCreatorNftCollections` -> factory `getCreatorCollections`
- `useNftCollectionCards` -> batch `useReadContracts` for collection fields + metadata fetch from IPFS URI
- `useNftCollectionCreatedEvents` and `useNftMintedEvents` -> logs + live watch updates
- `NftEventHistory`, `NftCollectionGallery`, `NftCollectionCard`, `NftMintResultCard` present results

## 10) Core Flow 7: NFT Collection and Mint Workflow

Mode switch:

- `DemoModeSelector` toggles between ERC20 and NFT pipeline UIs.

Collection creation:

- Form captures collection business fields.
- Upload image + metadata.
- Create collection through factory.
- Show collection in gallery with on-chain + metadata-enriched cards.

Mint flow:

- Select a collection.
- Fill mint form (or provide custom token URI).
- Upload NFT image + metadata when needed.
- Mint and parse tokenId from event.
- Display mint result and event history.

This is implemented, not just planned.

## 11) Text-Based Flow Diagram

```txt
Token/NFT Form Input
  -> Zod Validation
  -> Metadata Build
  -> IPFS Upload (Pinata Route)
  -> Factory/Collection Contract Call
  -> Tx Hash + Receipt
  -> Event Decode (TokenLaunched / CollectionCreated / CollectionMinted)
  -> On-chain Read Back
  -> Result Cards + Readers + Event Panels
```

## 12) Important Technical Decisions

- **Split orchestration hooks from presentational components**: keeps UI markup separate from async workflow state.
- **Generated contract exports package**: deploy artifacts are reused by all apps without duplicating ABIs/addresses.
- **Frontend create flow uses factories**: user can launch assets from UI without running deployment scripts.
- **Upload logic centralized via one API route**: all file/JSON upload flows share one server boundary.
- **Chain reads after writes**: result screens are not based only on optimistic local assumptions.
- **Mode-based shell**: same app hosts both ERC20 and ERC721 product flows while reusing wallet/provider setup.

## 13) Local Development

From repo root:

```bash
npm install
```

Run app:

```bash
npm run dev -w apps/token-launch-demo
```

Start local chain:

```bash
npm run chain:local
```

Deploy/sync token launch contracts:

```bash
npm run contracts:build
npm run contracts:deploy:token-launch:raw
npm run contracts:sync:token-launch
```

Deploy/sync NFT contracts:

```bash
npm run contracts:deploy:nft-collection:raw
npm run contracts:sync:nft-collection
npm run contracts:deploy:nft-collection-factory:raw
npm run contracts:sync:nft-collection-factory
```

Convenience deploy commands:

```bash
npm run deploy:token-launch
npm run deploy:nft-collection
npm run deploy:nft-collection-factory
```

Build/lint/typecheck:

```bash
npm run lint -w apps/token-launch-demo
npm run build -w apps/token-launch-demo
npm run typecheck
```

## 14) How to Extend This Demo

Practical extension directions:

1. Add token presets/templates (meme, utility, governance defaults).
2. Add multi-network profile support (chain-aware config + explorer links).
3. Build richer metadata editor (attributes/media/social validation UI).
4. Add launch history persistence (backend + indexed retrieval).
5. Add IPFS retry/backoff + upload status persistence.
6. Add post-launch analytics dashboard (holders, transfers, mint stats).
7. Add explicit transaction queue and resumable launch sessions.

## 15) Known Limitations

Implemented:

- end-to-end ERC20 launch flow
- end-to-end NFT collection + mint flow
- IPFS upload route with Pinata
- contract event parsing and on-chain reads
- Foundry artifact sync to shared contracts package

Mocked/simplified:

- no persistent backend DB for launch history
- local chain assumptions dominate default setup
- UX error normalization is heuristic string matching (not typed backend error envelopes)

Planned / technical debt:

- explorer URL helpers currently return `null` (no network-specific links)
- duplicate/legacy NFT schema/type helpers under `lib/token-launch/*` and active versions under `lib/nft-launch/*`
- URI format inconsistency across flows (`ipfs://` vs gateway URL in different upload hooks)
- no production-grade launch backend for auth/audit/risk policies

