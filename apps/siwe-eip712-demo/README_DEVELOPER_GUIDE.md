# SIWE + EIP-712 + SignedOrderBook Demo

<p align="center">
  <img src="./1.png" alt="Home" width="30%" />
  <img src="./2.png" alt="Home" width="30%" />
  <img src="./3.png" alt="Home" width="30%" />
</p>
<p align="center">
  <img src="./4.png" alt="Home" width="50%" />
  <img src="./5.png" alt="Home" width="50%" />
</p>

**Language / 语言**

- [English](#english)
- [中文](#中文)

---

<a id="english"></a>

# English

## Project Positioning

This project is a **minimal but complete** Web3 identity + business-signing demo. It is not just a wallet-connect example. It separates and connects three different layers:

1. `Connect Wallet`
   The frontend learns which wallet is connected and which chain is active.
2. `SIWE Login`
   The wallet signs a login message so the backend can create a Web session.
3. `EIP-712 Business Signature + Onchain Execute`
   After login, the user signs a real `SignedOrderBook.Order`, the backend verifies it, then the app approves `DemoERC20` and executes the order onchain.

The core problem this demo solves is:

- Wallet connection is not the same thing as login.
- Login is not the same thing as authorizing a concrete business action.
- For business signatures, the backend and the contract must verify independently instead of trusting the frontend.

The project is organized around three main steps:

### Step 01

**Connect**

Connect a wallet, read the active address, and confirm the expected local deployment chain.

### Step 02

**Authenticate with SIWE**

Create a web session that proves the connected wallet address is the current authenticated user.

### Step 03

**Verify and Execute**

Build a real `SignedOrderBook` order, sign it with EIP-712 typed data, verify it on the backend, approve `DemoERC20`, and execute it onchain.

---

## What This Demo Solves

In one sentence:

> `SIWE` answers “who are you”, `EIP-712` answers “what exact action did you authorize”, and `SignedOrderBook` answers “can that authorization be accepted and executed onchain”.

The three demo contracts have different responsibilities:

- `DemoERC20`
  A test token used for balances, `approve`, and `transferFrom`.
- `TokenFaucet`
  A faucet that gives users `DemoERC20`, so later business signatures can produce a real onchain effect.
- `SignedOrderBook`
  The core business-signing contract. It accepts `Order + signature`, recovers the signer, checks `deadline` and `nonce`, then performs `transferFrom`.

This makes the repo a clean teaching demo for four separate layers:

- wallet connection
- web session
- business authorization
- onchain execution

---

## Core Concepts

### Wallet Connection

Wallet connection means the frontend can read:

- the active address
- the active chain ID
- whether the wallet is connected

It only proves:

- the browser currently has access to that wallet address

It does **not** prove:

- the backend recognizes that address as the logged-in user
- the user has approved a concrete business action

So:

> Connect Wallet ≠ Login

### SIWE

`SIWE` means `Sign-In with Ethereum`.

Its job is not business authorization. Its job is login.

The user signs a login message, the backend verifies it, and a session is created. After that, the backend knows which wallet address belongs to the current browser session.

### Session

A session is the backend-managed login state.

In this project, `NextAuth` stores the authenticated address in:

- `session.user.name`

That lets backend APIs identify the current logged-in address without repeating the whole login challenge each time.

### EIP-712 Typed Data

`EIP-712` is a standard for **structured signatures**.

Instead of signing an arbitrary string, the wallet signs:

- `domain`
- `types`
- `message`

In this project, the signed business object is `SignedOrderBook.Order`:

- `maker`
- `token`
- `recipient`
- `amount`
- `deadline`
- `nonce`

### Off-chain Signature

An off-chain signature means:

- the wallet signs data
- no transaction is sent
- no gas is spent

This project has two off-chain signatures:

1. SIWE login signature
2. EIP-712 business signature

### On-chain Verification

On-chain verification means the contract validates the signature by itself.

Here, `SignedOrderBook.executeOrder(order, signature)` does contract-side verification:

- recomputes `hashOrder`
- recovers the signer
- checks `deadline`
- checks `usedNonces`
- checks `signer == maker`

Only then does it perform the token transfer.

### Nonce

A `nonce` is a one-time value used for replay protection.

Without a nonce, the same signature could be submitted again later.

This demo uses nonce in two places:

- the backend issues a business nonce before signing
- the contract tracks `usedNonces` to prevent reuse onchain

### Deadline

`deadline` is the expiration time of the authorization.

It ensures that an old signature cannot remain valid forever.

### ERC20 approve

`approve` means the token owner authorizes another address or contract to spend tokens on their behalf.

In this project, the user must approve:

- `DemoERC20` → `SignedOrderBook`

### transferFrom

`transferFrom` means a third party spends tokens on behalf of the owner, subject to allowance.

The final onchain effect in this demo is:

- `SignedOrderBook` calls `DemoERC20.transferFrom(order.maker, order.recipient, order.amount)`

### Chain ID / verifyingContract / domain separator

An EIP-712 signature is bound not only to the message, but also to the `domain`.

In this project, the real domain includes:

- `name: "SignedOrderBook"`
- `version: "1"`
- `chainId`
- `verifyingContract`

This prevents:

- cross-chain replay
- cross-contract replay

### Why SIWE and EIP-712 are different

`SIWE` answers:

> who are you

`EIP-712` answers:

> what exact action did you authorize

They have different outputs:

- `SIWE` creates a session
- `EIP-712` creates a verifiable business authorization

Neither one is a transaction by itself.

---

## Full Business Flow

```text
connect wallet
→ check chain
→ request SIWE nonce
→ sign SIWE message
→ backend verify SIWE
→ create session
→ build SignedOrderBook order
→ request business nonce
→ sign EIP-712 typed data
→ backend verify typed data
→ approve DemoERC20
→ executeOrder on SignedOrderBook
→ contract recover signer
→ contract check nonce / deadline
→ contract transferFrom
→ emit OrderExecuted
```

### Step 01: Connect

Relevant files:

- [`src/app/page.tsx`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/page.tsx)
- [`src/components/siwe-status.tsx`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/components/siwe-status.tsx)
- [`src/components/providers.tsx`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/components/providers.tsx)
- [`src/lib/wallet.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/wallet.ts)

What happens:

1. The user clicks `ConnectButton`.
2. wagmi / RainbowKit reads the current address.
3. The frontend reads the current `chainId`.
4. The app compares it with `deploymentMeta.chainId`.

Expected chain source:

- [`src/lib/contracts.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/contracts.ts)
- [`src/generated/deployment.meta.json`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/generated/deployment.meta.json)

Current local expectation:

- `chainId = 31337`
- RPC = `http://127.0.0.1:8545`

### Step 02: Authenticate with SIWE

Relevant files:

- [`src/lib/auth.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/auth.ts)
- [`src/app/api/auth/[...nextauth]/route.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/api/auth/[...nextauth]/route.ts)
- [`src/components/providers.tsx`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/components/providers.tsx)
- [`src/hooks/useSiweStatusViewModel.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/useSiweStatusViewModel.ts)
- [`src/hooks/useSiweSessionGuard.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/useSiweSessionGuard.ts)

What happens:

1. The user triggers SIWE login after connecting a wallet.
2. The wallet signs a SIWE login message.
3. NextAuth `CredentialsProvider.authorize()` receives `message` and `signature`.
4. The backend verifies the message using `SiweMessage.verify()`.
5. NextAuth creates a JWT session.
6. The wallet address is stored in `session.user.name`.

In this project, SIWE nonce is not exposed as a separate business route. It is tied to NextAuth `csrfToken`.

### Step 03: Verify and Execute

#### 3.1 Build the business order

Relevant files:

- [`src/components/order-signer.tsx`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/components/order-signer.tsx)
- [`src/hooks/order/useOrderSigner.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/order/useOrderSigner.ts)
- [`src/lib/eip712/order.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712/order.ts)
- [`src/lib/eip712/domain.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712/domain.ts)

User input:

- `recipient`
- `amount`
- `deadlineSeconds`

System-filled fields:

- `maker`
- `token`
- `deadline`
- `nonce`

#### 3.2 Request the business nonce

Relevant files:

- [`src/app/api/eip712/order-nonce/route.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/api/eip712/order-nonce/route.ts)
- [`src/lib/eip712/nonce.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712/nonce.ts)

What happens:

1. The frontend calls `POST /api/eip712/order-nonce`.
2. The backend reads the current session address.
3. It generates a `bytes32` nonce.
4. It stores that nonce in an in-memory `Map`.
5. It returns the nonce and expiration time.

Important:

- this nonce store is demo-only
- it is suitable for local development
- it is not suitable for serverless, multi-instance, or restart-heavy production systems

#### 3.3 Sign EIP-712 typed data

Relevant files:

- [`src/hooks/order/useOrderSigner.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/order/useOrderSigner.ts)
- [`src/lib/eip712/order.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712/order.ts)
- [`src/lib/eip712/domain.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712/domain.ts)

The frontend calls `signTypedDataAsync()` with:

- `domain`
- `types`
- `primaryType: "Order"`
- `message`

The output is:

- `signature`

This still does not spend gas.

#### 3.4 Backend verification

Relevant file:

- [`src/app/api/eip712/verify-order/route.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/api/eip712/verify-order/route.ts)

The backend checks:

1. session exists
2. `chainId` matches expected `31337`
3. `token` is in the allowlist
4. recovered signer equals `order.maker`
5. `session.user.name` equals `order.maker`
6. `deadline` is not expired
7. nonce exists, belongs to that address, is not expired, and is not already used

#### 3.5 Approve DemoERC20

Relevant files:

- [`src/hooks/contract/useDemoToken.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/contract/useDemoToken.ts)
- [`src/components/order-signer.tsx`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/components/order-signer.tsx)

The frontend:

1. reads `allowance(owner, signedOrderBook)`
2. checks if allowance is enough
3. lets the user click `Approve Token`
4. calls `DemoERC20.approve(SignedOrderBook, amount)`

#### 3.6 Onchain executeOrder

Relevant files:

- [`src/hooks/contract/useSignedOrderBook.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/contract/useSignedOrderBook.ts)
- [`../foundry/src/siwe-eip712-demo/SignedOrderBook.sol`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/src/siwe-eip712-demo/SignedOrderBook.sol)

What happens:

1. The frontend calls `executeOrder(order, signature)`.
2. The contract recovers the signer again.
3. The contract checks:
   - `deadline`
   - `usedNonces`
   - `maker`
   - `token`
   - `recipient`
   - `amount`
4. The contract marks the nonce as used.
5. The contract calls `IERC20(order.token).transferFrom(...)`.
6. The contract emits `OrderExecuted`.

---

## Module Map

### Pages and UI

#### [`src/app/page.tsx`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/page.tsx)

The main teaching page. It organizes the full three-step flow:

- Step 01 Connect
- Step 02 Authenticate with SIWE
- Step 03 Verify and Execute

It renders:

- `SiweStatus`
- `OrderSigner`
- `SignatureFlowExplainer`

#### [`src/app/order/page.tsx`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/order/page.tsx)

A standalone order page that currently reuses the same main components:

- `SiweStatus`
- `OrderSigner`

#### [`src/app/test/page.tsx`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/test/page.tsx)

A local deployment dashboard focused on:

- wallet / chain status
- wrong network handling
- DemoERC20 reads
- Faucet claim

It is not the full signature-execution teaching page.

### API

#### [`src/app/api/auth/[...nextauth]/route.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/api/auth/[...nextauth]/route.ts)

NextAuth route entry point.

#### [`src/app/api/eip712/order-nonce/route.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/api/eip712/order-nonce/route.ts)

The real business nonce route for `SignedOrderBook.Order`.

#### [`src/app/api/eip712/verify-order/route.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/api/eip712/verify-order/route.ts)

The real backend verification route for `SignedOrderBook.Order`.

#### Legacy mock routes

- [`src/app/api/orders/nonce/route.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/api/orders/nonce/route.ts)
- [`src/app/api/orders/verify/route.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/api/orders/verify/route.ts)

These remain in the repo as the older mock-order flow, but they are not the main path used by the current homepage.

### Hooks

Authentication:

- [`src/hooks/useSiweStatusViewModel.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/useSiweStatusViewModel.ts)
- [`src/hooks/useSiweSessionGuard.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/useSiweSessionGuard.ts)

Contracts:

- [`src/hooks/contract/useDemoToken.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/contract/useDemoToken.ts)
- [`src/hooks/contract/useTokenFaucet.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/contract/useTokenFaucet.ts)
- [`src/hooks/contract/useSignedOrderBook.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/contract/useSignedOrderBook.ts)
- [`src/hooks/contract/useContracts.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/contract/useContracts.ts)

Business signing:

- [`src/hooks/order/useOrderSigner.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/order/useOrderSigner.ts)

Legacy mock hook:

- [`src/hooks/useOrderSigner.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/useOrderSigner.ts)

### lib

- [`src/lib/wallet.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/wallet.ts): wagmi / RainbowKit chain config
- [`src/lib/auth.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/auth.ts): SIWE + NextAuth config
- [`src/lib/contracts.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/contracts.ts): frontend contract entry point
- [`src/lib/eip712/domain.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712/domain.ts): real domain config
- [`src/lib/eip712/order.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712/order.ts): real order schema / types
- [`src/lib/eip712/nonce.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712/nonce.ts): business nonce store
- [`src/lib/eip712.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712.ts): legacy mock typed-data module

### Generated files

- [`src/generated/contracts.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/generated/contracts.ts): ABI + address exports actually used by the frontend
- [`src/generated/deployment.meta.json`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/generated/deployment.meta.json): deployment metadata actually used by the frontend

The repo also contains:

- `../generated/*`
- `../foundry/generated/*`

But the running frontend currently uses `src/generated/*`.

---

## Contract Overview

Contracts live in:

- [`../foundry/src/siwe-eip712-demo`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/src/siwe-eip712-demo)

### 1. DemoERC20

File:

- [`../foundry/src/siwe-eip712-demo/DemoERC20.sol`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/src/siwe-eip712-demo/DemoERC20.sol)

Role:

- test token
- balance source
- `approve` / `transferFrom` target

Current behavior:

- mints `1_000_000 ether` to the deployer on deployment
- owner can call `mint()`

### 2. TokenFaucet

File:

- [`../foundry/src/siwe-eip712-demo/TokenFaucet.sol`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/src/siwe-eip712-demo/TokenFaucet.sol)

Role:

- gives users `DemoERC20`

Current behavior:

- fixed `claimAmount`
- `cooldown`
- `lastClaimedAt`
- `canClaim(address)`

### 3. SignedOrderBook

File:

- [`../foundry/src/siwe-eip712-demo/SignedOrderBook.sol`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/src/siwe-eip712-demo/SignedOrderBook.sol)

This is the core business-signing contract.

#### Order struct

```solidity
struct Order {
    address maker;
    address token;
    address recipient;
    uint256 amount;
    uint256 deadline;
    bytes32 nonce;
}
```

#### ORDER_TYPEHASH

Defines the exact EIP-712 order shape:

```solidity
keccak256(
  "Order(address maker,address token,address recipient,uint256 amount,uint256 deadline,bytes32 nonce)"
)
```

#### hashOrder

Creates the final EIP-712 digest for the order using `_hashTypedDataV4`.

#### recoverSigner

Recovers the signer from `order + signature`.

#### usedNonces

Tracks whether a nonce has already been consumed onchain.

#### executeOrder

Execution flow:

1. check `deadline`
2. check `usedNonces`
3. validate non-zero addresses and `amount > 0`
4. recover signer
5. check `signer == maker`
6. mark nonce as used
7. call `transferFrom`
8. emit `OrderExecuted`

#### Why approve is required before executeOrder

Because `SignedOrderBook` is not the token owner. It must rely on:

- `DemoERC20.transferFrom(maker, recipient, amount)`

That only works if the maker first approves `SignedOrderBook`.

---

## Deployment and Generated Artifacts

### Foundry deployment script

- [`../foundry/script/siwe-eip712-demo/DeployDemo.s.sol`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/script/siwe-eip712-demo/DeployDemo.s.sol)

It deploys:

- `DemoERC20`
- `TokenFaucet`
- `SignedOrderBook`

### One-command local deployment

- [`../foundry/tools/deploy-and-export.sh`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/tools/deploy-and-export.sh)

It currently:

1. sets `PRIVATE_KEY`
2. sets `NETWORK_NAME=localhost`
3. removes old generated directories
4. runs `forge build`
5. runs the deployment script with `--broadcast`
6. runs `npm run export:deployment`

### Exporting frontend-ready ABI and addresses

Relevant scripts:

- [`../foundry/tools/export-foundry-deployment.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/tools/export-foundry-deployment.ts)
- [`../foundry/tools/exportDeploymentArtifacts.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/tools/exportDeploymentArtifacts.ts)

The actual frontend target is:

- `src/generated/deployment.meta.json`
- `src/generated/contracts.ts`

So the frontend uses exported artifacts written directly into the Next.js app.

---

## Local Development

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Install Foundry-side dependencies

```bash
cd ../foundry
npm install
```

If Foundry tools such as `anvil` and `forge` are not installed yet, install them first.

### 3. Start the local chain

```bash
anvil
```

Expected local RPC:

```text
http://127.0.0.1:8545
```

Expected chain:

- `31337`

### 4. Build and deploy contracts

In `../foundry`, either run:

```bash
npm run deploy:local
```

or run manually:

```bash
export PRIVATE_KEY=your_private_key
export NETWORK_NAME=localhost
forge build
forge script script/siwe-eip712-demo/DeployDemo.s.sol:DeployDemo --rpc-url http://127.0.0.1:8545 --broadcast
npm run export:deployment
```

### 5. Configure frontend environment variables

Create `.env.local` in the current Next.js project root:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-random-secret
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=replace-with-your-project-id
```

### 6. Start Next.js

```bash
npm run dev
```

### 7. Open the app

```text
http://localhost:3000
```

### 8. Connect wallet and switch to the local chain

Make sure the wallet uses:

- RPC: `http://127.0.0.1:8545`
- Chain ID: `31337`

### 9. Claim faucet tokens

Open:

- [http://localhost:3000/test](http://localhost:3000/test)

Then click `Claim Token`.

### 10. Complete SIWE login

Go back to the homepage and finish SIWE login.

### 11. Sign an EIP-712 order

On the homepage:

1. fill `recipient`
2. fill `amount`
3. fill `deadline`
4. sign and let the backend verify

### 12. Approve

Click `Approve Token`.

### 13. Execute

Click the execute button. The app will call:

- `SignedOrderBook.executeOrder(order, signature)`

---

## Environment Variables

Only variables actually read by the current code are listed here.

### Next.js app / API

#### `NEXTAUTH_URL`

Read in:

- [`src/lib/auth.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/auth.ts)

#### `NEXTAUTH_SECRET`

Read in:

- [`src/lib/auth.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/auth.ts)

#### `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

Read in:

- [`src/lib/wallet.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/wallet.ts)

### Foundry deployment

#### `PRIVATE_KEY`

Read in:

- [`../foundry/script/siwe-eip712-demo/DeployDemo.s.sol`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/script/siwe-eip712-demo/DeployDemo.s.sol)

#### `NETWORK_NAME`

Read in:

- [`../foundry/script/siwe-eip712-demo/DeployDemo.s.sol`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/script/siwe-eip712-demo/DeployDemo.s.sol)

---

## Frontend Interaction Guide

### What `ConnectButton` does

It connects the wallet and exposes the current address and chain.

It does not create a session.

### How the current wallet address is shown

The app reads it through wagmi `useAccount()` and displays it in `SiweStatus` and `/test`.

### How current chain and expected chain are compared

- current chain: wagmi `useChainId()`
- expected chain: `deploymentMeta.chainId`

### What happens on Wrong Network

- `/test` shows an explicit wrong-network banner and switch-chain button
- the homepage signing area shows a wrong-network warning
- normal sign / execute flow is not treated as ready

### What `Claim Faucet` does

It calls `TokenFaucet.claim()` and sends `DemoERC20` to the current wallet.

### What the SIWE login button does

It triggers wallet-based login signing and creates a backend session after verification.

### What `Sign Order` does

On the homepage it:

1. requests a business nonce
2. builds a real `SignedOrderBook.Order`
3. signs typed data
4. sends it to the backend `verify-order` API

### What `Verify Result` shows

It shows:

- session address
- recovered signer
- order content
- expected token
- expected chain ID

### What `Approve` does

It calls:

- `DemoERC20.approve(SignedOrderBook, amount)`

### What `Execute` does

It calls:

- `SignedOrderBook.executeOrder(order, signature)`

This is the actual transaction that changes onchain state.

---

## SIWE vs EIP-712

| Item                           | SIWE                   | EIP-712                                                           |
| ------------------------------ | ---------------------- | ----------------------------------------------------------------- |
| Goal                           | authentication         | business authorization                                            |
| Core question                  | who are you            | what action did you authorize                                     |
| Signed content                 | login message          | structured business data                                          |
| Project object                 | SIWE message           | `SignedOrderBook.Order`                                           |
| Verification location          | backend / NextAuth     | backend + contract                                                |
| Creates a session              | yes                    | no                                                                |
| Directly changes onchain state | no                     | no, only later execution does                                     |
| Common usage                   | login, account binding | orders, permit, allowlists, profile update                        |
| Project modules                | `src/lib/auth.ts`      | `src/lib/eip712/*`, `src/app/api/eip712/*`, `SignedOrderBook.sol` |

---

## FAQ / Troubleshooting

### Why is wallet connection not the same as login?

Because connection only tells the frontend which wallet is available. It does not create backend session state.

### Why does the app show Wrong Network?

Because the wallet chain ID does not match `deploymentMeta.chainId`, which is currently expected to be `31337`.

### Why can’t the app read contract data?

Common causes:

- wallet not connected
- wrong chain
- local chain not running
- contracts not deployed
- `src/generated/contracts.ts` still points to old addresses

### Why does `executeOrder` fail?

Common causes:

- no `approve`
- insufficient allowance
- insufficient balance
- invalid signature
- nonce already used
- expired deadline
- wrong chain

### Why is `approve` required?

Because `SignedOrderBook` relies on `transferFrom`, not a direct token transfer from the maker.

### Why does it say `nonce already used`?

Because replay protection is working as intended.

### Why does it say `order expired`?

Because current time is already later than `order.deadline`.

### Why doesn’t the recovered signer match `maker`?

Possible causes:

- the wallet changed before or after signing
- the order was modified
- the signature was tampered with
- the domain settings do not match

### Why may contract addresses change after restarting the local chain?

Because redeployment usually produces new addresses, and the frontend depends on exported deployment artifacts.

### How is `generated/contracts.ts` created?

It is generated from the Foundry deployment metadata and ABI export scripts.

### Why must I redeploy and re-export after changing a contract?

Because both the contract address and ABI may change, and the frontend depends on both.

---

## Legacy Mock Flow vs Current Real Flow

The repo still contains two EIP-712 paths.

### Current real path

- `src/lib/eip712/domain.ts`
- `src/lib/eip712/order.ts`
- `src/lib/eip712/nonce.ts`
- `src/app/api/eip712/order-nonce/route.ts`
- `src/app/api/eip712/verify-order/route.ts`
- `src/hooks/order/useOrderSigner.ts`
- `SignedOrderBook.sol`

This is the current homepage flow.

### Legacy mock path

- `src/lib/eip712.ts`
- `src/lib/order-nonce-store.ts`
- `src/app/api/orders/nonce/route.ts`
- `src/app/api/orders/verify/route.ts`
- `src/hooks/useOrderSigner.ts`

These remain mainly for historical comparison.

---

## Recommended Teaching Order

If you want to explain this demo to a beginner, use this order:

1. wallet connection
2. SIWE login
3. the difference between session and wallet address
4. EIP-712 typed data
5. backend verification
6. `approve`
7. SignedOrderBook onchain execution

That sequence makes it much easier to separate:

- identity
- authorization
- execution

---

<a id="中文"></a>

# 中文

## 项目定位

这是一个**最小但完整**的 Web3 身份认证 + 业务签名 Demo。它不是单纯的“连接钱包”示例，而是把下面三件事清楚地拆开并串起来：

1. `Connect Wallet`
   让前端知道当前连接的是哪个钱包地址、当前链是什么。
2. `SIWE Login`
   用钱包签名建立 Web Session，证明“这个浏览器里的当前用户，确实控制这个钱包地址”。
3. `EIP-712 Business Signature + Onchain Execute`
   在登录之后，对一个具体业务对象 `SignedOrderBook.Order` 做结构化签名，后端验签，再由合约做最终链上验证和执行。

这个 Demo 解决的核心问题是：

- 连接钱包不等于登录。
- 登录成功也不等于用户已经授权某个具体业务动作。
- 对业务签名，后端和合约都要重新验证，而不是只信前端。

当前项目围绕三步主流程组织：

### Step 01

**Connect**

Connect a wallet, read the active address, and confirm the expected local deployment chain.

### Step 02

**Authenticate with SIWE**

Create a web session that proves the connected wallet address is the current authenticated user.

### Step 03

**Verify and Execute**

Build a real `SignedOrderBook` order, sign it with EIP-712 typed data, verify it on the backend, approve `DemoERC20`, and execute it onchain.

---

## 这个 Demo 在解决什么

用一句话概括：

> `SIWE` 负责“你是谁”，`EIP-712` 负责“你授权了什么业务动作”，`SignedOrderBook` 负责“这份授权能不能被链上承认并执行”。

项目中的三个链上合约分别承担不同职责：

- `DemoERC20`
  测试代币，用来提供真实余额、`approve`、`transferFrom` 的执行对象。
- `TokenFaucet`
  水龙头，给用户发 `DemoERC20`，让后续业务签名真的能产生链上效果。
- `SignedOrderBook`
  业务签名核心合约。它接收一个 `Order + signature`，恢复 signer、检查 `deadline` / `nonce`，再执行 `transferFrom`。

所以这个项目不是“展示钱包连接动画”的 UI 项目，而是一个很适合教学和复习的边界示例：

- 钱包连接态
- Web 登录态
- 业务签名
- 链上执行

这四层在这个 Demo 里是分开的。

---

## 核心概念解释

这一节面向新手，但保持工程准确性。

### Wallet Connection

Wallet Connection 指的是前端通过钱包插件或钱包 App 获得：

- 当前地址
- 当前链 ID
- 钱包是否已连接

这一步只能证明：

- 浏览器现在能读到这个地址

它**不能**证明：

- 后端已经把这个地址当成登录用户
- 用户已经同意某个具体业务动作

所以：

> Connect Wallet ≠ Login

### SIWE

`SIWE` 是 `Sign-In with Ethereum`。

它的作用不是签业务单子，而是做登录认证。

用户会签一条登录消息，后端验证成功后建立 session。这样后端就知道：

- 当前这个浏览器会话，对应的钱包地址是谁

你可以把它理解成：

- Web2 里用户名密码登录，换成了“钱包签名登录”

### Session

Session 是后端保存的登录态。

在这个项目里，session 由 `NextAuth` 维护，地址最终放在：

- `session.user.name`

这意味着后端 API 不需要每次都重新做“登录签名挑战”，它可以直接读取当前 session 里的地址。

### EIP-712 Typed Data

`EIP-712` 是一种**结构化签名**标准。

它不是签一段随便的字符串，而是签：

- `domain`
- `types`
- `message`

这能让签名明确绑定到：

- 哪个业务结构
- 哪个链
- 哪个 verifying contract

在本项目中，用户签的是 `SignedOrderBook.Order`，字段包括：

- `maker`
- `token`
- `recipient`
- `amount`
- `deadline`
- `nonce`

### Off-chain Signature

Off-chain Signature 指的是：

- 钱包签了消息
- 但没有发链上交易
- 不消耗 gas

本项目里有两种 off-chain signature：

1. `SIWE` 登录签名
2. `EIP-712` 业务签名

这两者都不是链上交易。

### On-chain Verification

On-chain Verification 指的是合约自己验证签名是否有效。

在本项目中，`SignedOrderBook.executeOrder(order, signature)` 会在合约内部：

- 重新算 `hashOrder`
- `recoverSigner`
- 检查 `deadline`
- 检查 `usedNonces`
- 检查 `signer == maker`

全部通过后才执行真实代币转移。

### Nonce

`Nonce` 是一次性随机值，用来防止重放攻击。

如果没有 nonce，那么同一份签名理论上可以被重复提交。

这个项目中有两层 nonce 语义：

- 后端签名前会给前端发一个业务 nonce
- 合约里有 `usedNonces`，确保链上同一 nonce 不能重复执行

### Deadline

`deadline` 是签名的过期时间。

它告诉系统：

- 这份授权只在某个时间点之前有效

如果过期了：

- 后端应该拒绝
- 合约也应该拒绝

### ERC20 approve

`approve` 的意思是：

- 代币持有者授权某个合约，未来可以代表自己转出一定数量的 token

在这个项目里，用户需要：

- 把 `DemoERC20` 授权给 `SignedOrderBook`

否则 `SignedOrderBook` 没法执行 `transferFrom`。

### transferFrom

`transferFrom` 是 ERC20 的一种转账方式：

- 不是持币用户自己直接转
- 而是被授权的第三方合约代扣

本项目链上执行的核心动作就是：

- `SignedOrderBook` 调用 `DemoERC20.transferFrom(order.maker, order.recipient, order.amount)`

### Chain ID / verifyingContract / domain separator

EIP-712 签名不是只签业务字段，还会绑定 `domain`。

本项目的 domain 关键包含：

- `name: "SignedOrderBook"`
- `version: "1"`
- `chainId`
- `verifyingContract`

这意味着：

- 同一个订单签名，不能随便拿去别的链复用
- 也不能随便拿去别的合约复用

为什么签名必须绑定 `chainId` 和 `verifyingContract`？

- 防止跨链重放
- 防止跨合约重放
- 让签名明确属于“这个链上的这个合约”

### 为什么 SIWE 和 EIP-712 是两种不同签名

`SIWE` 解决的是：

> 你是谁

`EIP-712` 解决的是：

> 你授权了哪个具体业务动作

它们的区别不只是“格式不同”，而是职责完全不同：

- `SIWE` 成功后产生 session
- `EIP-712` 成功后产生可验证的业务授权

两者都不是链上交易，也都不直接改链上状态。

---

## 完整业务链路

下面是当前项目的真实主链路。

```text
connect wallet
→ check chain
→ request SIWE nonce
→ sign SIWE message
→ backend verify SIWE
→ create session
→ build SignedOrderBook order
→ request business nonce
→ sign EIP-712 typed data
→ backend verify typed data
→ approve DemoERC20
→ executeOrder on SignedOrderBook
→ contract recover signer
→ contract check nonce / deadline
→ contract transferFrom
→ emit OrderExecuted
```

为了方便讲解，下面按“前端、后端、合约”拆开。

### Step 01: Connect

前端入口：

- 页面：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/page.tsx`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/page.tsx)
- 组件：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/components/siwe-status.tsx`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/components/siwe-status.tsx)
- Provider：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/components/providers.tsx`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/components/providers.tsx)
- 钱包配置：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/wallet.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/wallet.ts)

发生了什么：

1. 用户点击 `ConnectButton`
2. wagmi / RainbowKit 读取当前钱包地址
3. 前端读取当前 `chainId`
4. 前端将当前链与 `deploymentMeta.chainId` 对比

预期链来源：

- [`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/contracts.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/contracts.ts)
- [`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/generated/deployment.meta.json`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/generated/deployment.meta.json)

当前项目的本地链配置是：

- `chainId = 31337`
- RPC = `http://127.0.0.1:8545`

### Step 02: Authenticate with SIWE

相关文件：

- NextAuth 配置：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/auth.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/auth.ts)
- NextAuth route：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/api/auth/[...nextauth]/route.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/api/auth/[...nextauth]/route.ts)
- SIWE provider 装配：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/components/providers.tsx`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/components/providers.tsx)
- 前端状态整理：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/useSiweStatusViewModel.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/useSiweStatusViewModel.ts)
- Session guard：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/useSiweSessionGuard.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/useSiweSessionGuard.ts)

发生了什么：

1. 用户在连接钱包后触发 SIWE 登录。
2. 钱包签一条 SIWE 登录消息。
3. NextAuth 的 `CredentialsProvider.authorize()` 收到：
   - `message`
   - `signature`
4. 后端用 `SiweMessage.verify()` 校验签名。
5. 验证成功后，NextAuth 创建 JWT session。
6. 钱包地址被写入 `session.user.name`。

这个项目里，SIWE nonce 不是单独的业务 API，而是通过 NextAuth 的 `csrfToken` 参与校验。

### Step 03: Verify and Execute

这一阶段是当前项目的重点。

#### 3.1 构造业务订单

相关文件：

- 页面组件：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/components/order-signer.tsx`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/components/order-signer.tsx)
- 前端业务签名 hook：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/order/useOrderSigner.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/order/useOrderSigner.ts)
- EIP-712 order schema：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712/order.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712/order.ts)
- EIP-712 domain：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712/domain.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712/domain.ts)

前端表单输入的是：

- `recipient`
- `amount`
- `deadlineSeconds`

系统补齐的是：

- `maker`：当前钱包地址
- `token`：当前 DemoERC20 地址
- `deadline`：当前时间 + 用户输入秒数
- `nonce`：后端签名前发的 bytes32 nonce

最终构造出真实的 `SignedOrderBook.Order`。

#### 3.2 请求业务 nonce

相关文件：

- API：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/api/eip712/order-nonce/route.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/api/eip712/order-nonce/route.ts)
- Store：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712/nonce.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712/nonce.ts)

发生了什么：

1. 前端调用 `POST /api/eip712/order-nonce`
2. 后端从当前 session 取出地址
3. 后端生成一个 `bytes32` nonce
4. nonce 记录到内存 `Map`
5. nonce 带过期时间返回给前端

注意：

- 当前 nonce store 是内存 Map
- 这只适合本地 demo
- 不适合 serverless、多实例、服务重启后的生产环境

#### 3.3 签 EIP-712 Typed Data

相关文件：

- 前端 hook：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/order/useOrderSigner.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/order/useOrderSigner.ts)
- 结构定义：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712/order.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712/order.ts)
- domain 定义：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712/domain.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712/domain.ts)

前端调用 `signTypedDataAsync()` 时会带上：

- `domain`
- `types`
- `primaryType: "Order"`
- `message`

签完后得到：

- `signature`

此时还没有发链上交易，也没有消耗 gas。

#### 3.4 后端验签

相关文件：

- API：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/api/eip712/verify-order/route.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/api/eip712/verify-order/route.ts)

后端做了哪些最少校验：

1. 当前 session 是否存在
2. `chainId` 是否等于预期 `31337`
3. `token` 是否在允许列表内
4. `recoverTypedDataAddress()` 恢复出的 signer 是否等于 `order.maker`
5. `session.user.name` 是否等于 `order.maker`
6. `deadline` 是否已过期
7. nonce 是否存在、是否属于当前地址、是否过期、是否已使用

这一步的意义是：

- 后端不盲信前端
- 后端自己重新计算 signer
- 并且把“登录身份”和“业务签名身份”绑在一起

#### 3.5 Approve DemoERC20

相关文件：

- Hook：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/contract/useDemoToken.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/contract/useDemoToken.ts)
- UI：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/components/order-signer.tsx`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/components/order-signer.tsx)

前端会：

1. 读取 `allowance(owner, signedOrderBook)`
2. 判断额度是否足够
3. 如果不足，让用户点击 `Approve Token`
4. 调用 `DemoERC20.approve(SignedOrderBook, amount)`

为什么必须先 approve？

因为链上执行时，`SignedOrderBook` 不是 token owner，它只能通过 `transferFrom` 代扣。没有 allowance，合约执行会失败。

#### 3.6 链上 executeOrder

相关文件：

- Hook：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/contract/useSignedOrderBook.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/contract/useSignedOrderBook.ts)
- 合约：[`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/src/siwe-eip712-demo/SignedOrderBook.sol`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/src/siwe-eip712-demo/SignedOrderBook.sol)

发生了什么：

1. 前端调用 `executeOrder(order, signature)`
2. 合约重新 `recoverSigner`
3. 合约检查：
   - `deadline`
   - `usedNonces`
   - `maker`
   - `token`
   - `recipient`
   - `amount`
4. 合约把 nonce 标记成已使用
5. 合约执行 `IERC20(order.token).transferFrom(order.maker, order.recipient, order.amount)`
6. 成功后发出 `OrderExecuted`

这一步才是真正的链上状态变化。

---

## 模块关系

这一节按目录整理“谁负责什么，数据怎么流”。

## 页面与 UI

### [`src/app/page.tsx`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/page.tsx)

项目主页面。当前首页就是完整教学页，负责把三步主流程组织在一起：

- Step 01 Connect
- Step 02 Authenticate with SIWE
- Step 03 Verify and Execute

它组合了：

- `SiweStatus`
- `OrderSigner`
- `SignatureFlowExplainer`

### [`src/app/order/page.tsx`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/order/page.tsx)

独立的 order 页面，但目前也是复用主流程组件：

- `SiweStatus`
- `OrderSigner`

可以理解成主页教学流的单独入口。

### [`src/app/test/page.tsx`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/test/page.tsx)

本地链测试面板，偏“合约状态与网络状态”。

它当前主要负责：

- 显示当前钱包
- 显示当前链 / 预期链
- Wrong Network 提示
- 读取 DemoERC20
- 领取 Faucet

它**没有**承载完整的签名执行教学流；完整链路目前在首页。

## API

### [`src/app/api/auth/[...nextauth]/route.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/api/auth/[...nextauth]/route.ts)

NextAuth 入口，把请求交给 `authOptions`。

### [`src/app/api/eip712/order-nonce/route.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/api/eip712/order-nonce/route.ts)

新的真实业务 nonce API，服务 `SignedOrderBook.Order`。

### [`src/app/api/eip712/verify-order/route.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/api/eip712/verify-order/route.ts)

新的真实后端验签 API，专门验证 `SignedOrderBook.Order`。

### [`src/app/api/orders/nonce/route.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/api/orders/nonce/route.ts)

### [`src/app/api/orders/verify/route.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/app/api/orders/verify/route.ts)

这两条是**旧 mock order** 路线遗留 API。

当前首页主流程已经不再使用它们，但它们还保留在仓库里，便于对比旧版 mock 方案与新版真实 `SignedOrderBook` 方案。

## hooks

### 认证相关

- [`src/hooks/useSiweStatusViewModel.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/useSiweStatusViewModel.ts)
  统一整理连接态、登录态、地址展示。
- [`src/hooks/useSiweSessionGuard.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/useSiweSessionGuard.ts)
  在账号切换、链切换、断开连接时自动 `signOut()`，避免 session 和钱包状态错位。

### 合约相关

- [`src/hooks/contract/useDemoToken.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/contract/useDemoToken.ts)
  读取 `name` / `symbol` / `decimals` / `balance` / `allowance`，并提供 `approveSignedOrderBook()`。
- [`src/hooks/contract/useTokenFaucet.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/contract/useTokenFaucet.ts)
  读取 faucet 状态并执行 `claim()`。
- [`src/hooks/contract/useSignedOrderBook.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/contract/useSignedOrderBook.ts)
  负责链上签名单领域：读取 `usedNonces`、执行 `executeOrder()`、等待 receipt。
- [`src/hooks/contract/useContracts.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/contract/useContracts.ts)
  聚合多个 contract hook，供 `/test` 页面使用。

### 业务签名相关

- [`src/hooks/order/useOrderSigner.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/order/useOrderSigner.ts)
  当前首页真实签名主流程入口。
  它负责：
  - 请求业务 nonce
  - 构造 order
  - 发起 typed data 签名
  - 调后端 verify API
  - 返回前端需要展示的结果

### 旧 mock route 遗留 hook

- [`src/hooks/useOrderSigner.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/hooks/useOrderSigner.ts)

这是旧版 mock order hook。当前首页真实流程用的是 `src/hooks/order/useOrderSigner.ts`，不是这个文件。

## lib

### [`src/lib/wallet.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/wallet.ts)

钱包与链配置：

- 定义本地 `anvil` 链
- `chainId = 31337`
- 配置 RainbowKit / wagmi

### [`src/lib/auth.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/auth.ts)

SIWE + NextAuth 的核心认证配置。

### [`src/lib/contracts.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/contracts.ts)

前端唯一的合约导出入口。

它从：

- [`src/generated/contracts.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/generated/contracts.ts)

导入 ABI 和地址，再统一导出：

- `contracts`
- `deploymentMeta`

### [`src/lib/eip712/domain.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712/domain.ts)

定义真实 `SignedOrderBook` 的 EIP-712 domain：

- name
- version
- chainId
- verifyingContract

### [`src/lib/eip712/order.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712/order.ts)

定义 `SignedOrderBook.Order` 的：

- Zod schema
- typed data `types`
- 构造方法
- typed data 格式转换方法

### [`src/lib/eip712/nonce.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712/nonce.ts)

业务 nonce 内存存储。当前只适合 demo。

### [`src/lib/eip712.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/eip712.ts)

旧 mock order 路线的 typed data 定义。当前真实首页流程不再使用，但仓库仍保留。

## generated

### [`src/generated/contracts.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/generated/contracts.ts)

前端实际使用的 ABI + 地址导出文件。

### [`src/generated/deployment.meta.json`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/generated/deployment.meta.json)

前端实际使用的部署元数据。

注意：仓库里还存在：

- `../generated/*`
- `../foundry/generated/*`

但当前前端运行时实际读的是 `src/generated/*`。

---

## 合约说明

合约都在：

- [`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/src/siwe-eip712-demo`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/src/siwe-eip712-demo)

## 1. DemoERC20

文件：

- [`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/src/siwe-eip712-demo/DemoERC20.sol`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/src/siwe-eip712-demo/DemoERC20.sol)

作用：

- 测试代币
- 用来演示余额、`approve`、`transferFrom`

当前实现特点：

- 部署时给部署者 mint `1_000_000 ether`
- owner 可以继续 `mint()`

它在本项目里承担的是“真实业务对象”的角色，而不是占位符。

## 2. TokenFaucet

文件：

- [`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/src/siwe-eip712-demo/TokenFaucet.sol`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/src/siwe-eip712-demo/TokenFaucet.sol)

作用：

- 给测试用户领取 `DemoERC20`

当前实现特点：

- `claimAmount` 固定
- 有 `cooldown`
- 使用 `lastClaimedAt` 限制重复领取
- `canClaim(address)` 可以供前端读取

为什么需要它：

- 没有 token，后续 `approve` 和 `executeOrder` 就没有实际效果

## 3. SignedOrderBook

文件：

- [`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/src/siwe-eip712-demo/SignedOrderBook.sol`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/src/siwe-eip712-demo/SignedOrderBook.sol)

这是整个业务签名核心合约。

### Order struct

结构是：

```solidity
struct Order {
    address maker;
    address token;
    address recipient;
    uint256 amount;
    uint256 deadline;
    bytes32 nonce;
}
```

语义上表示：

- `maker`：谁授权这笔业务
- `token`：操作哪个 ERC20
- `recipient`：token 最终转给谁
- `amount`：数量
- `deadline`：何时过期
- `nonce`：防重放

### ORDER_TYPEHASH

`ORDER_TYPEHASH` 是 EIP-712 结构签名的类型哈希：

```solidity
keccak256(
  "Order(address maker,address token,address recipient,uint256 amount,uint256 deadline,bytes32 nonce)"
)
```

它让合约明确知道：

- 这份签名对应的结构到底长什么样

### hashOrder

`hashOrder(order)` 做的事是：

1. 先对 `Order` 按 EIP-712 规则编码
2. 再结合 domain 做 `_hashTypedDataV4`
3. 得到最终 digest

这个 digest 才是签名恢复真正使用的内容。

### recoverSigner

`recoverSigner(order, signature)`：

1. 先 `hashOrder(order)`
2. 再 `ECDSA.recover(digest, signature)`
3. 恢复出 signer 地址

这和后端做的 `recoverTypedDataAddress()` 在逻辑上是同一类事情，只是一个在链下，一个在链上。

### usedNonces

`mapping(bytes32 => bool) public usedNonces;`

它负责链上防重放：

- nonce 没用过，才允许执行
- 一旦执行成功，就标记为已使用

### executeOrder

`executeOrder(order, signature)` 是最终入口。

它当前执行顺序是：

1. 校验 `block.timestamp <= order.deadline`
2. 校验 `!usedNonces[order.nonce]`
3. 校验 `maker` / `token` / `recipient` 非零地址
4. 校验 `amount > 0`
5. `recoverSigner(order, signature)`
6. 校验 `signer == maker`
7. 把 nonce 标记成已使用
8. 调 `IERC20(order.token).transferFrom(order.maker, order.recipient, order.amount)`
9. 发出 `OrderExecuted`

### deadline 校验

它保证：

- 过期签名不能无限期重放

### signer == maker 校验

它保证：

- 订单里写的 maker，必须真的是签名人本人

### transferFrom

执行成功的本质动作是：

- 从 maker 扣 token
- 转给 recipient

### OrderExecuted event

成功后会发出：

- `maker`
- `recipient`
- `token`
- `amount`
- `nonce`

这让链上执行结果可追踪。

### 为什么执行前必须先 approve DemoERC20 给 SignedOrderBook

因为 `SignedOrderBook` 自己并不持有 maker 的 token。

它只能通过：

- `DemoERC20.transferFrom(maker, recipient, amount)`

来代扣。

而 ERC20 的规则要求：

- `transferFrom` 前必须有 allowance

所以用户必须先执行：

- `DemoERC20.approve(SignedOrderBook, amount)`

否则即使签名正确，链上执行也会失败。

---

## 生成文件与部署链路

这是当前项目一个很重要的工程点。

## Foundry 合约部署

部署脚本：

- [`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/script/siwe-eip712-demo/DeployDemo.s.sol`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/script/siwe-eip712-demo/DeployDemo.s.sol)

它会部署：

- `DemoERC20`
- `TokenFaucet`
- `SignedOrderBook`

并写出部署元数据。

## 一键部署脚本

脚本：

- [`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/tools/deploy-and-export.sh`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/tools/deploy-and-export.sh)

当前脚本会：

1. 设置 `PRIVATE_KEY`
2. 设置 `NETWORK_NAME=localhost`
3. 删除旧的 `generated` 和 `../generated`
4. `forge build`
5. `forge script ... --broadcast`
6. `npm run export:deployment`

## 生成前端可用 ABI / 地址文件

相关脚本：

- [`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/tools/export-foundry-deployment.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/tools/export-foundry-deployment.ts)
- [`/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/tools/exportDeploymentArtifacts.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/tools/exportDeploymentArtifacts.ts)

真实导出目标是：

- `../siwe-eip712-demo/src/generated/deployment.meta.json`
- `../siwe-eip712-demo/src/generated/contracts.ts`

也就是说，**前端实际使用的 generated 文件，是 Foundry 导出后写进当前 Next.js 项目的 `src/generated/*`**。

---

## 本地运行说明

这一节基于当前仓库里的真实脚本和结构整理。

## 1. 安装前端依赖

在当前项目根目录：

```bash
npm install
```

## 2. 安装 Foundry 侧依赖

在 Foundry 目录：

```bash
cd ../foundry
npm install
```

如果你的环境还没有 Foundry / `anvil` / `forge`，需要先按 Foundry 官方方式安装。

## 3. 启动本地链

开一个终端，运行：

```bash
anvil
```

默认本地 RPC 应是：

```text
http://127.0.0.1:8545
```

当前前端钱包配置预期链是：

- `31337`

## 4. 编译和部署合约

在 `../foundry` 目录，你可以走两种方式。

### 方式 A：一键脚本

```bash
npm run deploy:local
```

根据当前 `../foundry/package.json`，这会执行：

```bash
bash tools/deploy-and-export.sh
```

### 方式 B：手动执行

```bash
export PRIVATE_KEY=你的私钥
export NETWORK_NAME=localhost
forge build
forge script script/siwe-eip712-demo/DeployDemo.s.sol:DeployDemo --rpc-url http://127.0.0.1:8545 --broadcast
npm run export:deployment
```

如果你只是照着当前仓库的本地开发脚本跑，`tools/deploy-and-export.sh` 已经内置了本地测试私钥和 `NETWORK_NAME=localhost`。

## 5. 准备前端环境变量

在当前 Next.js 项目根目录创建 `.env.local`，至少补齐代码里实际读取到的变量。

示例：

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-random-secret
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=replace-with-your-project-id
```

说明：

- `NEXTAUTH_URL` 和 `NEXTAUTH_SECRET` 是 SIWE + NextAuth 必需项
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` 当前在 `src/lib/wallet.ts` 里被强制读取
- 如果你只使用 MetaMask 扩展，有时也许还能工作，但按当前代码，建议明确配置

## 6. 启动 Next.js

回到当前项目根目录：

```bash
npm run dev
```

## 7. 浏览器打开首页

```text
http://localhost:3000
```

## 8. 连接钱包并切到本地链

在钱包里确认：

- RPC：`http://127.0.0.1:8545`
- Chain ID：`31337`

如果页面显示 Wrong Network，先切链。

## 9. 领取 Faucet

你可以先访问：

- [`/test`](http://localhost:3000/test)

这里能看到：

- 当前链状态
- DemoERC20 信息
- Faucet 状态

点击 `Claim Token`，领取 `DemoERC20`。

## 10. 完成 SIWE 登录

回到首页，完成钱包连接后，进行 SIWE 登录，建立 session。

## 11. 签署 EIP-712 Order

在首页 `SignedOrderBook Verify and Execute` 区域：

1. 填 `recipient`
2. 填 `amount`
3. 填 `deadline`
4. 点击签名并让后端验证

## 12. Approve

后端验签通过后：

1. 点击 `Approve Token`
2. 给 `SignedOrderBook` allowance

## 13. ExecuteOrder

allowance 足够后：

1. 点击执行按钮
2. 前端调用 `SignedOrderBook.executeOrder(order, signature)`
3. 页面展示 tx hash、receipt status、nonce 使用状态

---

## 环境变量说明

下面只列代码中**实际读取到**的变量。

## Next.js 前端 / API

### `NEXTAUTH_URL`

读取位置：

- [`src/lib/auth.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/auth.ts)

作用：

- SIWE 校验时取 domain

### `NEXTAUTH_SECRET`

读取位置：

- [`src/lib/auth.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/auth.ts)

作用：

- NextAuth secret

### `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

读取位置：

- [`src/lib/wallet.ts`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/lib/wallet.ts)

作用：

- RainbowKit / WalletConnect 配置

## Foundry 部署

### `PRIVATE_KEY`

读取位置：

- [`../foundry/script/siwe-eip712-demo/DeployDemo.s.sol`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/script/siwe-eip712-demo/DeployDemo.s.sol)

作用：

- 部署账户私钥

### `NETWORK_NAME`

读取位置：

- [`../foundry/script/siwe-eip712-demo/DeployDemo.s.sol`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/foundry/script/siwe-eip712-demo/DeployDemo.s.sol)

作用：

- 写入部署元数据的网络名

如果未来项目新增别的环境变量，需要以代码中实际读取的位置为准，不要只看旧文档。

---

## 前端交互说明

这一节按当前 UI 解释“按钮到底在干什么”。

### ConnectButton 做什么

位置：

- [`src/components/siwe-status.tsx`](/Volumes/DevDisk/Dev/projects/web3-frontend-demos/siwe-eip712-demo/src/components/siwe-status.tsx)

作用：

- 连接钱包
- 读取当前地址
- 读取当前链

它不建立 session。

### 当前钱包地址如何显示

前端通过 wagmi 的 `useAccount()` 读取地址，并在 `SiweStatus` 和 `/test` 页中展示。

### 当前 chainId 和 expected chainId 如何判断

当前 chainId 来自：

- wagmi `useChainId()`

expected chainId 来自：

- `deploymentMeta.chainId`

如果两者不一致，就会出现 Wrong Network 状态。

### Wrong Network 时如何处理

在 `/test` 页面中，有明确的 wrong network banner 和切链按钮。

在首页业务签名区中，会显示：

- “Wrong network. Switch your wallet to chain 31337 before signing.”

而且正常签名与执行路径不会被当作 ready 状态。

### Claim Faucet 做什么

`Claim Token` 会调用 `TokenFaucet.claim()`，把 `DemoERC20` 发到当前钱包。

### SIWE 登录按钮做什么

SIWE 登录按钮会触发钱包签登录消息，后端验签后建立 session。

### Sign Order 做什么

在首页真实业务卡片里，签名动作会：

1. 请求业务 nonce
2. 构造真实 `SignedOrderBook.Order`
3. 调用钱包 `signTypedData`
4. 提交给后端 `verify-order`

### Verify Result 显示什么

会展示：

- session address
- recovered signer
- order 内容
- expected token
- expected chainId

也就是“后端独立验签后到底认不认这份业务授权”。

### Approve 做什么

`Approve Token` 会执行：

- `DemoERC20.approve(SignedOrderBook, amount)`

### Execute 做什么

`Execute Verified Order` 会执行：

- `SignedOrderBook.executeOrder(order, signature)`

这是链上交易，会产生真实状态变化。

---

## SIWE 和 EIP-712 对比表

| 对比项                   | SIWE              | EIP-712                                                           |
| ------------------------ | ----------------- | ----------------------------------------------------------------- |
| 目的                     | 登录认证          | 业务授权                                                          |
| 解决的问题               | 你是谁            | 你授权了什么                                                      |
| 签名内容                 | 登录消息          | 结构化业务数据                                                    |
| 本项目签名对象           | SIWE message      | `SignedOrderBook.Order`                                           |
| 验证位置                 | NextAuth / 后端   | 后端 + 合约                                                       |
| 是否建立 session         | 是                | 否                                                                |
| 是否直接产生链上状态变化 | 否                | 否，只有后续执行交易才会                                          |
| 常见用途                 | 登录、账户绑定    | 订单、permit、白名单、profile update                              |
| 本项目对应模块           | `src/lib/auth.ts` | `src/lib/eip712/*`、`src/app/api/eip712/*`、`SignedOrderBook.sol` |

---

## 常见问题与排错

### 1. 钱包连接后为什么不等于登录

因为连接钱包只说明前端读到了地址，不代表后端已经建立 session。

你仍然需要完成 SIWE 登录，后端才会把这个地址当成当前认证用户。

### 2. 为什么显示 Wrong Network

因为当前钱包链 ID 和 `deploymentMeta.chainId` 不一致。

当前项目预期链是：

- `31337`

### 3. 为什么读取不到合约数据

常见原因：

- 钱包没连上
- 钱包不在 `31337`
- 本地链没启动
- 合约没重新部署
- `src/generated/contracts.ts` 仍然是旧地址

### 4. 为什么 executeOrder 失败

常见原因：

- 没有 approve
- allowance 不足
- token 余额不足
- signature 无效
- nonce 已使用
- deadline 已过期
- 当前链不对

### 5. 为什么必须 approve

因为 `SignedOrderBook` 执行的是 `transferFrom`，而不是持币用户自己直接 `transfer`。

没有 allowance，合约无权代扣 token。

### 6. 为什么出现 nonce already used

因为同一个 nonce 只能成功执行一次。

这正是 replay protection 生效的表现。

### 7. 为什么出现 order expired

因为当前时间已经晚于 `order.deadline`。

这个项目里后端和合约都对过期订单有校验。

### 8. 为什么恢复地址和 maker 不一致

说明签名人和订单里声明的 maker 不是同一个地址。

可能原因：

- 签名前后切换了钱包
- 手动篡改了 order
- 篡改了 signature
- domain 配置不一致

### 9. 为什么本地链重启后合约地址可能变化

因为重新部署后，地址通常会变化。当前前端地址来自生成文件，不是写死在业务代码里。

### 10. `generated/contracts.ts` 是怎么来的

它来自 Foundry 导出脚本：

- 先部署合约
- 再读取 Foundry `out` 目录中的 ABI
- 再写入 `src/generated/contracts.ts`

### 11. 修改合约后为什么要重新部署和 export deployment

因为前端依赖的两类信息都可能变：

- 合约地址
- ABI

只改 Solidity 源码但不重新部署、不重新导出，前端就可能继续用旧 ABI 或旧地址。

### 12. 为什么 session 和 wallet address 会突然不一致

当前项目有 session guard。

如果你切换账号、切换链、或者断开钱包，前端会主动 `signOut()`，避免“钱包已经变了，但 session 还留着旧地址”的风险。

---

## 旧 mock 路线与当前真实路线

仓库中目前同时保留两套 EIP-712 代码：

### 当前主路线

- `src/lib/eip712/domain.ts`
- `src/lib/eip712/order.ts`
- `src/lib/eip712/nonce.ts`
- `src/app/api/eip712/order-nonce/route.ts`
- `src/app/api/eip712/verify-order/route.ts`
- `src/hooks/order/useOrderSigner.ts`
- `SignedOrderBook.sol`

这是当前首页真实使用的路线。

### 旧 mock 路线

- `src/lib/eip712.ts`
- `src/lib/order-nonce-store.ts`
- `src/app/api/orders/nonce/route.ts`
- `src/app/api/orders/verify/route.ts`
- `src/hooks/useOrderSigner.ts`

这套路线当前主要用于保留历史演化痕迹与对比，不是主流程。

如果你以后继续维护，建议始终以“`src/lib/eip712/*` + `/api/eip712/*` + `SignedOrderBook` 合约”作为主线理解项目。

---

## 如何讲解这个 Demo

如果你要给新手讲，推荐按下面顺序：

### 1. 先讲钱包连接

先让对方明白：

- 前端怎么知道当前地址
- 前端怎么知道当前链
- 连接钱包不等于登录

### 2. 再讲 SIWE 登录

解释：

- 为什么要签登录消息
- 为什么后端要建立 session
- 为什么 session 是 Web 应用需要的状态

### 3. 再讲 session 和 wallet address 的区别

强调：

- 钱包连接态来自 wagmi
- 登录态来自 NextAuth
- 这两者可以暂时一致，也可能失配
- 所以需要 session guard

### 4. 再讲 EIP-712 typed data

解释：

- 为什么不用一段普通字符串
- 为什么要有 `domain`
- 为什么要绑定 `chainId` 和 `verifyingContract`

### 5. 再讲后端验签

解释：

- 后端不能信前端说“这是我签的”
- 后端必须自己 recover signer
- 后端还要把 signer、maker、sessionAddress 对起来

### 6. 再讲 approve

解释：

- 业务签名不等于链上转账
- 真正执行前，合约还需要 ERC20 allowance

### 7. 最后讲 SignedOrderBook 链上执行

解释：

- 合约如何重新验签
- 如何检查 nonce / deadline
- 如何 `transferFrom`
- 为什么执行成功后 nonce 不能再复用

按这个顺序讲，新手通常能比较清楚地区分：

- 身份认证
- 业务授权
- 链上执行

而这正是这个 Demo 最有价值的地方。

---

## 结语

这个项目最值得保留的不是某一张 UI，而是它清楚地展示了 Web3 应用里三层边界：

- 钱包连接态
- Web 登录态
- 业务授权与链上执行

当你以后把它扩展到：

- 订单系统
- permit-like 授权
- 白名单操作
- profile update
- relayer 执行

都可以继续沿用这个分层思路。
