# Multichain Wallet Demo Developer Guide

## 1. What This Guide Explains

This document is a source-code-based implementation guide for developers.

It is not the showcase README.
It explains how this app is actually built: providers, adapters, hooks, UI wiring, mock API routes, and state normalization.

If you are onboarding to this codebase, this guide should help you understand:

- where each wallet ecosystem is implemented
- how chain-specific behavior is abstracted
- what is implemented vs what is intentionally reserved
- where to extend the project safely

---

## 2. Reality Check: Implemented vs Expected

The project name and UI messaging focus on multichain architecture.
In code, the current ecosystem status is:

| Ecosystem | Status in this repo                                                    |
| --------- | ---------------------------------------------------------------------- |
| EVM       | Implemented (wagmi + viem adapter flow)                                |
| Solana    | Implemented (Solana Wallet Adapter + injected provider fallback paths) |
| BTC       | Implemented (UniSat + OKX BTC adapters)                                |
| Sei       | Implemented (Compass/Keplr/Leap adapter flow)                          |
| TON       | **Reserved placeholder only** (no TON Connect integration yet)         |

Important clarification:

- There is **no RainbowKit integration** in current source code.
- There is **no TON Connect provider** in current source code.
- Wallet binding logic exists in hooks + API routes, but no UI panel currently calls it.

---

## 3. Project Architecture Overview

### 3.1 App structure (actual)

```txt
apps/multichain-wallet-demo/
  src/
    app/
      [locale]/
        layout.tsx
        page.tsx
      api/
        wallet/
          bind/route.ts
          nonce/route.ts
      globals.css
      layout.tsx
      page.tsx
    components/
      wallet/
        demo-shell.tsx
        ecosystem-switcher.tsx
        event-log-panel.tsx
        intent-lab-panel.tsx
        multichain-overview.tsx
        wallet-control-panel.tsx
    hooks/
      multichain/
        use-active-ecosystem.ts
        use-bind-wallet.ts
        use-btc-wallet.ts
        use-multichain-logs.ts
        use-network-status.ts
        use-send-demo-transaction.ts
        use-sei-wallet.ts
        use-sign-intent.ts
        use-wallet-account.ts
        use-wallet-control-panel.ts
    i18n/
      request.ts
      messages/
        en.json
        zh-CN.json
        ja.json
    lib/
      multichain/
        adapters/
          btc-adapter.ts
          evm-adapter.ts
          sei-adapter.ts
          solana-adapter.ts
        btc/
          okx.ts
          types.ts
          unisat.ts
        sei/
          config.ts
        services/
          binding-service.ts
        chains.ts
        errors.ts
        explorer.ts
        types.ts
    providers/
      providers.tsx
    store/
      multichain-demo-store.ts
  middleware.ts
  next.config.ts
  package.json
```

### 3.2 Responsibilities by directory

- `src/lib/multichain`: chain-agnostic interfaces + chain-specific adapter implementations.
- `src/hooks/multichain`: runtime orchestration between UI and adapters.
- `src/store`: unified state (wallet session, logs, bind status, debug payloads).
- `src/components/wallet`: demo UI panels and controls.
- `src/app/api/wallet/*`: mock backend routes for nonce and wallet binding.
- `src/providers/providers.tsx`: global provider composition.

---

## 4. Application Entry and Provider Setup

### 4.1 Entry flow

1. `src/app/page.tsx` redirects `/` to default locale from `@web3-frontend-labs/i18n/config`.
2. `src/app/[locale]/layout.tsx` validates locale and loads locale messages.
3. `src/providers/providers.tsx` mounts all runtime providers.
4. `src/app/[locale]/page.tsx` renders `<DemoShell />`.

### 4.2 Provider stack (actual order)

From `src/providers/providers.tsx`:

1. `NextIntlClientProvider`
2. `WagmiProvider`
3. `ConnectionProvider` (Solana RPC endpoint)
4. `WalletProvider` (Phantom + Solflare adapters, `autoConnect`)
5. `WalletModalProvider`
6. `QueryClientProvider`

This order matters:

- wallet hooks used by child components depend on wagmi / Solana providers.
- network status hook depends on React Query.
- i18n hooks (`useTranslations`) require NextIntl context.

### 4.3 Solana endpoint config

`providers.tsx` uses:

- `WalletAdapterNetwork.Devnet`
- `clusterApiUrl(network)` as endpoint

So the default Solana environment is devnet-oriented.

### 4.4 i18n routing note

`packages/i18n/src/config.ts` includes `en`, `zh-CN`, `ja`.
`apps/multichain-wallet-demo/middleware.ts` matcher currently includes `/` and `/(zh-CN|en)/:path*` only.

If `ja` routes should be directly matched in middleware, update matcher accordingly.

---

## 5. EVM Wallet Implementation

### 5.1 Key files

- `src/lib/multichain/adapters/evm-adapter.ts`
- `src/hooks/multichain/use-wallet-account.ts`
- `src/hooks/multichain/use-wallet-control-panel.ts`
- `src/components/wallet/wallet-control-panel.tsx`

### 5.2 Connector and chain config

In `evm-adapter.ts`, wagmi `createConfig` defines:

- chains: `mainnet`, `arbitrum`, `bsc`
- connectors: `injected`, `coinbaseWallet`, `walletConnect`
- WalletConnect project id from `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (fallback string exists in config, but runtime checks still enforce env for walletconnect path)

### 5.3 Wallet selection and connect flow

`use-wallet-account.ts` resolves wallet IDs:

- `metamask`
- `okx`
- `coinbase`
- `walletconnect`
- `injected`

The hook performs extension/connector checks before connection.
Examples:

- MetaMask: checks injected provider flags.
- OKX: checks OKX-specific injected markers.
- WalletConnect: throws if `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` missing.

### 5.4 EVM account normalization

After connect, account is normalized into shared `WalletAccount` shape:

- `ecosystem: "evm"`
- `address`
- `displayAddress`
- `providerName`
- `chainId`

### 5.5 Chain switching and unsupported network handling

`EvmAdapter.getNetworkStatus()` compares:

- current chain id
- expected chain id = `DEFAULT_CHAIN_BY_ECOSYSTEM.evm.chainId` (Arbitrum in this project)

It exposes:

- `switchRequired`
- `switchAvailable`
- `wrongNetwork`

`WalletControlPanel` then shows switch button when required + available.

### 5.6 Message signing

EVM supports:

- `personal_sign` via `useSignMessage`
- `eip712` via `useSignTypedData`

`IntentLabPanel` builds typed data in component state and triggers sign through `useSignIntent`.

### 5.7 Balance reading status

EVM balance display is **not implemented** in current code (no `useBalance` or equivalent call).

---

## 6. Solana Wallet Implementation

### 6.1 Key files

- `src/providers/providers.tsx`
- `src/lib/multichain/adapters/solana-adapter.ts`
- `src/hooks/multichain/use-wallet-account.ts`
- `src/components/wallet/wallet-control-panel.tsx`
- `src/components/wallet/intent-lab-panel.tsx`

### 6.2 Wallet provider setup

At provider level, registered adapters are:

- `PhantomWalletAdapter`
- `SolflareWalletAdapter`

### 6.3 Additional Solana connection paths

`use-wallet-account.ts` also supports:

- OKX Solana injected provider path
- MetaMask Solana injected provider path

So Solana connect behavior is hybrid:

- wallet-adapter path for Phantom/Solflare
- direct injected-provider path for OKX/MetaMask Solana

### 6.4 Account model and network model

Solana normalization uses:

- address from `publicKey.toBase58()`
- network id string (`solana-devnet` or `solana:devnet` depending path)

There is no EVM-like numeric `chainId` usage in Solana flow.

### 6.5 Solana signing and transaction

`SolanaAdapter.signIntent()`:

- encodes message with `TextEncoder`
- signs with `signMessage`
- converts signature bytes to base64

`SolanaAdapter.sendTransaction()`:

- supports native transfer demo path
- creates `SystemProgram.transfer` transaction
- sends through wallet `sendTransaction`

### 6.6 Balance reading status

Solana balance display is **not implemented** in current code.

---

## 7. TON Wallet Implementation (Current Status)

### 7.1 What exists

TON currently appears in:

- `ChainEcosystem` union type
- chain constants (`CHAINS.TON`)
- ecosystem switcher option
- UI placeholder text in `wallet-control-panel.tsx` and i18n messages

### 7.2 What does not exist

- no TON Connect provider
- no TON wallet hook
- no TON adapter implementing `WalletAdapter`
- no TON signing / transaction / network status

When user chooses TON in UI, panel shows a reserved notice only.

---

## 8. Additional Implemented Ecosystems: BTC and Sei

Although your expected scope mentions EVM/Solana/TON, this repo already includes BTC and Sei integrations.

### 8.1 BTC

- `use-btc-wallet.ts` manages selected wallet + address in local Zustand slice.
- wallet wrappers:
  - `lib/multichain/btc/unisat.ts`
  - `lib/multichain/btc/okx.ts`
- adapter:
  - `lib/multichain/adapters/btc-adapter.ts`

Supports:

- connect
- message signing (multiple provider method fallbacks)
- send BTC via provider `sendBitcoin`

### 8.2 Sei

- `use-sei-wallet.ts` detects Compass/Keplr/Leap providers.
- chain info helper: `lib/multichain/sei/config.ts`
- adapter: `lib/multichain/adapters/sei-adapter.ts`

Supports:

- chain suggestion (`experimentalSuggestChain`) when available
- enable wallet for `pacific-1`
- arbitrary signing
- token send flow if provider exposes `sendTokens`

---

## 9. Unified Wallet State Abstraction

This is the core architecture idea of the project.

### 9.1 Shared interfaces

`src/lib/multichain/types.ts` defines:

- `WalletAdapter` interface (connect, disconnect, getAccount, getNetworkStatus, signIntent, optional sendTransaction)
- `WalletCapability` shape
- `UnifiedWalletState`
- `UnifiedWalletAccount`

### 9.2 Store-level state

`src/store/multichain-demo-store.ts` holds:

- `ecosystem` (selected tab)
- `unifiedWallet` (status + account + error)
- logs
- bind status fields
- debug payload snapshots

### 9.3 How normalization happens

`use-wallet-control-panel.ts` and `use-wallet-account.ts` handle normalization:

- map chain-specific SDK outputs to shared account fields
- set unified status via store actions:
  - `setUnifiedWalletConnecting`
  - `setUnifiedWalletConnected`
  - `setUnifiedWalletError`

### 9.4 Shared vs chain-specific fields

| Field           | Shared?      | Notes                                                           |
| --------------- | ------------ | --------------------------------------------------------------- |
| `namespace`     | Yes          | one of normalized namespaces                                    |
| `walletName`    | Yes          | provider label for UI                                           |
| `address`       | Yes (string) | semantic meaning differs by ecosystem                           |
| `chainId`       | Partial      | EVM numeric-like chain context; others often use network string |
| signing methods | No           | exposed by `WalletCapability` per adapter                       |
| switch network  | No           | generally EVM-only in this app                                  |

Important design point:

- same field name (`address`) does **not** imply identical protocol semantics.
- Solana public key string and EVM hex address are not interchangeable.

---

## 10. Message Signing Implementation

### 10.1 Key files

- `src/components/wallet/intent-lab-panel.tsx`
- `src/hooks/multichain/use-sign-intent.ts`
- adapter sign implementations under `lib/multichain/adapters/*`

### 10.2 Flow

1. User enters message in `IntentLabPanel`.
2. UI checks adapter capabilities.
3. UI triggers `sign(...)` from `useSignIntent`.
4. Hook calls `connectedAdapter.signIntent(input)`.
5. Adapter performs ecosystem-specific signing.
6. Hook stores result/error and pushes event log.

### 10.3 Implemented signing modes

| Ecosystem | Signing mode in demo                      |
| --------- | ----------------------------------------- |
| EVM       | `personal_sign`, `eip712`                 |
| Solana    | `solana_message`                          |
| BTC       | `btc_message` / `btc_psbt` representation |
| Sei       | `sei_arbitrary`                           |
| TON       | Not implemented                           |

### 10.4 Typed data

Typed data object is created in `IntentLabPanel` with:

- `domain.name = "multichain-wallet-demo"`
- `version = "1"`
- primary type `SignIn`

Then passed to EVM adapter via `useSignIntent`.

### 10.5 Error handling

Adapters throw normalized errors using:

- `src/lib/multichain/errors.ts` (`normalizeMultiChainError`)

UI displays:

- success payload details
- error message from normalized error state

---

## 11. Chain Switching and Unsupported Chain Handling

### 11.1 Key files

- `src/lib/multichain/chains.ts`
- `src/lib/multichain/adapters/evm-adapter.ts`
- `src/hooks/multichain/use-network-status.ts`
- `src/components/wallet/wallet-control-panel.tsx`

### 11.2 Detection model

`useNetworkStatus` queries adapter `getNetworkStatus()` through React Query.

For EVM:

- `supported` checks `[1, 42161, 56]`
- expected chain defaults to Arbitrum config
- `switchRequired` true when current differs from expected

For non-EVM:

- `switchAvailable` is false in current adapters
- UI shows manual-switch hint when applicable

### 11.3 Why this is EVM-specific

EVM wallets commonly expose programmatic `switchChain`.
Solana/BTC/Sei in this codebase report wallet-managed network contexts, not unified switch API.

---

## 12. Wallet Bind Mock Implementation

### 12.1 Backend routes

- `GET /api/wallet/nonce` → `src/app/api/wallet/nonce/route.ts`
- `POST /api/wallet/bind` → `src/app/api/wallet/bind/route.ts`

### 12.2 Frontend service and hook

- service: `src/lib/multichain/services/binding-service.ts`
- hook: `src/hooks/multichain/use-bind-wallet.ts`

Hook flow:

1. fetch nonce
2. build sign payload by ecosystem
3. call adapter `signIntent`
4. submit signature to bind API
5. update bind state in store

### 12.3 Current integration status

`useBindWallet` is currently **not mounted by any UI component**.
So bind flow exists in code, but no visible button/panel triggers it in the current screen.

### 12.4 Example payloads (from current code)

Nonce response:

```json
{
  "nonce": "uuid",
  "issuedAt": "2026-01-01T00:00:00.000Z",
  "message": "Bind wallet with nonce: uuid"
}
```

Bind request body:

```json
{
  "ecosystem": "evm",
  "address": "0x...",
  "signature": "0x...",
  "nonce": "uuid",
  "mode": "eip712"
}
```

Bind response:

```json
{
  "ok": true,
  "binding": {
    "ecosystem": "evm",
    "address": "0x...",
    "nonce": "uuid",
    "verifiedAt": "2026-01-01T00:00:00.000Z",
    "verificationMode": "mock-demo"
  }
}
```

### 12.5 Type mismatch note

In `binding-service.ts`, `NonceResponse` currently expects `ok`, and `BindResponse.binding` expects fields like `mode`/`verifier`.
The route response shapes differ (`nonce` route has no `ok`; bind route returns `verificationMode`).

This does not break UI today because bind flow is not wired into panel rendering, but it should be aligned before production use.

---

## 13. Multi-Chain Difference Explanation in UI

There is no dedicated “difference explanation page” route yet.
Instead, explanation content currently lives in:

- `src/components/wallet/multichain-overview.tsx`
- i18n talking points in `src/i18n/messages/en.json` (`overview.point*`)

It explains:

- multichain is not just chainId
- SDK capability differences
- separation of connection state vs business binding state
- error normalization needs

If you need a full standalone explanation page, add a new route under `src/app/[locale]/`.

---

## 14. UI Component Walkthrough

### `demo-shell.tsx`

- top-level composition
- renders overview, control panel, intent lab, event log

### `multichain-overview.tsx`

- reads `unifiedWallet` from store
- displays normalized session status
- renders interview talking points
- includes `LanguageSwitcher`

### `ecosystem-switcher.tsx`

- uses `useActiveEcosystem`
- toggles selected ecosystem in store

### `wallet-control-panel.tsx`

- uses `useWalletControlPanel`
- handles wallet selection per ecosystem
- handles connect/disconnect/switch-network actions
- contains TON reserved placeholder UI

### `intent-lab-panel.tsx`

- uses `useWalletAccount`, `useSignIntent`, `useSendDemoTransaction`
- drives signing and transaction demos
- renders result/error boxes

### `event-log-panel.tsx`

- shows last N log entries from global store

---

## 15. Important TypeScript Types

### 15.1 Ecosystem unions

Defined in `lib/multichain/types.ts`:

- `ChainEcosystem = "evm" | "solana" | "btc" | "sei" | "ton"`
- `ChainNamespace = "evm" | "solana" | "btc" | "sei"`

Note: `ChainNamespace` intentionally excludes `ton` because TON is not fully wired.

### 15.2 Adapter contract

`WalletAdapter` interface is the abstraction center:

- `connect`, `disconnect`
- `getAccount`, `getNetworkStatus`
- `signIntent`
- optional `sendTransaction`

### 15.3 Unified session state

`UnifiedWalletState`:

- status (`idle`/`connecting`/`connected`/`disconnected`/`error`)
- normalized account
- normalized error string

### 15.4 Signing and transaction intent types

- `SignIntentInput`, `SignatureResult`
- `TransactionIntentInput`, `TransactionResult`

These decouple UI intent from SDK-specific call shapes.

---

## 16. Data Flow Diagrams (Text)

### 16.1 EVM connect

```txt
User clicks "Connect EVM Wallet"
        ↓
WalletControlPanel -> useWalletControlPanel.handleConnect()
        ↓
useWalletAccount.connectEvmWith(walletId)
        ↓
wagmi connectAsync(connector)
        ↓
normalize account into WalletAccount
        ↓
store.setUnifiedWalletConnected(...)
        ↓
MultichainOverview re-renders normalized session
```

### 16.2 Solana connect

```txt
User selects Solana wallet and clicks connect
        ↓
useWalletControlPanel.handleConnect()
        ↓
adapter.connect() (SolanaAdapter)
        ↓
useWalletAccount Solana branch:
  - wallet-adapter path (Phantom/Solflare), or
  - injected provider path (OKX/MetaMask Solana)
        ↓
normalize publicKey to address string
        ↓
store.setUnifiedWalletConnected(...)
```

### 16.3 TON selection (current placeholder)

```txt
User selects TON ecosystem
        ↓
wallet-control-panel renders reserved notice
        ↓
No adapter connect/sign/transaction path executed
```

### 16.4 Message signing

```txt
IntentLabPanel button click
        ↓
useSignIntent.sign(input)
        ↓
connectedAdapter.signIntent(input)
        ↓
ecosystem-specific signing
        ↓
SignatureResult stored + log entry pushed
```

### 16.5 Wallet bind (hook path)

```txt
useBindWallet.bind()
        ↓
GET /api/wallet/nonce
        ↓
adapter.signIntent(signInput)
        ↓
POST /api/wallet/bind
        ↓
store binding status updated
```

---

## 17. Key Implementation Decisions

1. Adapter-first architecture
   UI does not directly call wallet SDKs. It calls a unified adapter surface.

2. Capability-based UI
   Buttons are gated by `WalletCapability`, not by raw ecosystem string checks alone.

3. Store separation of concerns
   Connection state, binding state, logs, and debug payloads are modeled separately.

4. EVM switch chain treated as ecosystem-specific
   No assumption that Solana/BTC/Sei can use the same `switchChain` model.

5. Mock backend for binding
   Demonstrates product-level account linking flow without external infrastructure.

---

## 18. Common Mistakes and Debugging Notes

1. Missing wallet extension
   Check error messages from `use-wallet-account.ts` resolution logic.

2. WalletConnect not configured
   Set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` before choosing WalletConnect.

3. Wrong EVM network
   Network panel will show `switchRequired`; use switch button if available.

4. Solana signMessage unavailable
   Some wallet/provider paths may not expose signing capability.

5. TON expectations mismatch
   TON is placeholder-only in current code.

6. Locale route confusion
   `ja` exists in i18n config/messages, but middleware matcher currently does not include it.

7. Client/server boundary mistakes
   Wallet hooks/components are client-side (`"use client"`).
   API routes and nonce/bind verification logic are server-side.

8. Address semantics confusion
   Never assume EVM hex address semantics for Solana/BTC/Sei strings.

9. Binding response type mismatch
   Align `binding-service.ts` types with route outputs before wiring UI.

---

## 19. How to Extend This Project

### 19.1 Add another EVM chain

1. update wagmi chains in `lib/multichain/adapters/evm-adapter.ts`
2. update chain constants in `lib/multichain/chains.ts`
3. adjust expected chain logic in `DEFAULT_CHAIN_BY_ECOSYSTEM`

### 19.2 Add Solana cluster switch capability

1. make endpoint configurable in `providers/providers.tsx`
2. propagate selected cluster into Solana adapter/network status
3. expose cluster state in overview panel

### 19.3 Implement TON Connect (currently missing)

1. add TON provider package and provider wrapper in `providers/providers.tsx`
2. create `ton-adapter.ts` implementing `WalletAdapter`
3. create `use-ton-wallet.ts` hook
4. wire TON branch in `use-wallet-account.ts`
5. replace TON reserved notice in `wallet-control-panel.tsx`

### 19.4 Add wallet bind UI panel

1. create component under `components/wallet/` (for nonce/bind actions)
2. call `useBindWallet`
3. render `bindingStatus`, `boundAddress`, `lastNonce` from store
4. fix binding response TypeScript mismatches first

### 19.5 Add real backend verification

1. replace mock API routes with signature verification
2. persist wallet links in database
3. include replay protection and nonce expiration

### 19.6 Add balance read flows

- EVM: use wagmi balance hook / viem public client
- Solana: use `connection.getBalance(publicKey)`
- BTC/Sei: provider/client-specific balance readers

---

## 20. Summary

This project teaches practical multichain frontend architecture:

- adapter-based wallet abstraction
- ecosystem-specific capability handling
- normalized yet honest state modeling
- clear chain-switch and signing differences
- mock backend integration for account-linking flow

If you extend this codebase, preserve this principle:

> Unify UX and state shape where possible, but never erase protocol-level differences.
