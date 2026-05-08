# Multichain Wallet Demo Runtime Flow

## Application Entry

### `/` redirects to the default locale

### `[locale]/layout` loads locale messages

### `providers.tsx` mounts global providers

### `DemoShell` renders the main interface

## Provider Layer

### `NextIntlClientProvider`

### `WagmiProvider`

### Solana `ConnectionProvider`

### Solana `WalletProvider`

### `WalletModalProvider`

### `QueryClientProvider`

## Wallet Ecosystem Switching

### `EcosystemSwitcher`

#### Switch to EVM

#### Switch to Solana

#### Switch to BTC

#### Switch to Sei

#### TON is placeholder only

### `useActiveEcosystem`

#### Read current ecosystem

#### Write to Zustand store

## EVM Connection Flow

### User clicks Connect

### `WalletControlPanel` calls `handleConnect`

### `useWalletAccount` resolves `walletId`

### `wagmi connectAsync`

### Get `address` and `chainId`

### Normalize into `WalletAccount`

### Write into `unifiedWallet`

### `Overview` updates display

## Solana Connection Flow

### User selects Phantom or Solflare

### Solana Wallet Adapter connects

### Get `publicKey`

### `publicKey.toBase58`

### Normalize into `WalletAccount`

### Write into `unifiedWallet`

### `Overview` updates display

## BTC Connection Flow

### Select UniSat or OKX

### `useBtcWallet` detects provider

### Request account address

### `BtcAdapter` normalizes account

### Write into `unifiedWallet`

## Sei Connection Flow

### Detect Compass / Keplr / Leap

### Attempt to suggest chain

### Enable `pacific-1`

### Get account

### `SeiAdapter` normalizes account

## Current TON Flow

### User selects TON

### `WalletControlPanel` shows reserved notice

### No TON Connect provider

### No `ton-adapter`

### No signing or transaction flow

## Unified State Abstraction

### `WalletAdapter` interface

#### `connect`

#### `disconnect`

#### `getAccount`

#### `getNetworkStatus`

#### `signIntent`

#### `sendTransaction` (optional)

### `UnifiedWalletState`

#### `status`

#### `account`

#### `error`

### Zustand Store

#### `ecosystem`

#### `unifiedWallet`

#### `logs`

#### `bindStatus`

#### `debugPayload`

## Signing Flow

### Enter message in `IntentLabPanel`

### `useSignIntent.sign`

### `connectedAdapter.signIntent`

### Different ecosystems run different signing logic

#### EVM `personal_sign`

#### EVM `EIP-712`

#### Solana `signMessage`

#### BTC message signing

#### Sei arbitrary signing

#### TON not implemented

### Return `SignatureResult`

### Write result and logs

## Chain Switching Flow

### `useNetworkStatus`

### `adapter.getNetworkStatus`

### EVM checks current `chainId`

### Compare against default target chain Arbitrum

### Show switch button when network is wrong

### Non-EVM ecosystems currently do not provide a unified switch API

## Transaction Flow

### Click **Send Demo Transaction** in `IntentLabPanel`

### `useSendDemoTransaction`

### `connectedAdapter.sendTransaction`

#### Solana `SystemProgram.transfer`

#### BTC `sendBitcoin`

#### Sei `sendTokens`

#### TON not implemented

## Wallet Bind Mock Flow

### `useBindWallet.bind`

### `GET /api/wallet/nonce`

### Build bind message

### Call `adapter.signIntent`

### `POST /api/wallet/bind`

### Update bind state

### Currently no UI panel calls this flow

## Error Handling Flow

### Adapter throws error

### `normalizeMultiChainError`

### `store.setUnifiedWalletError`

### UI displays error

### `EventLogPanel` records logs

## Extension Directions

### Add TON Connect

### Add balance reading

### Add Wallet Bind UI

### Add real backend signature verification

### Add Solana cluster switching
