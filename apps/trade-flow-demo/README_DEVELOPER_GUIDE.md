# Trading State Demo: Technical Walkthrough

This is the developer README for the trading lifecycle demo in this monorepo.  
Repository note: the implemented app path is `apps/trade-flow-demo` (there is no separate `apps/trading-state-demo` directory in the current tree).

## 1. Mental Model

Treat the app as a transaction lifecycle state machine around one core action: **submit limit order**.

Conceptual states:

- `idle`: no active form submission
- `editing`: user changes side/amount/price/slippage/deadline
- `validating`: Zod + React Hook Form evaluate input constraints
- `quote-ready`: form valid and derived summary computed (notional/slippage/deadline)
- `confirming`: represented by submit intent (no separate confirmation modal currently)
- `signing`: wallet typed-data signature prompt (`signTypedDataAsync`)
- `pending`: contract write + receipt wait
- `confirmed`: tx mined, order read and normalized
- `failed`: validation/sign/chain errors surfaced to UI and log panels
- `cancelled`: supported by contract type system, but no cancel action in current UI

Why this is state-heavy: trading UIs coordinate form state, wallet state, chain state, async mutation state, and monitoring state at the same time.

## 2. High-Level Runtime Flow

1. App loads `src/app/page.tsx` and renders dashboard sections (`TradeHero`, `WalletStatus`, `TradeForm`, `OrderTable`, `TerminalPanel`, `EventsPanel`).
2. `AppProviders` mounts shared `Web3WalletProvider` (wagmi + React Query + RainbowKit).
3. User connects wallet via RainbowKit `ConnectButton`.
4. `TradeForm` initializes with defaults and Zod resolver.
5. User edits trade fields; `useWatch` derives local summary values.
6. On submit, `useSubmitTrade` routes to chain mode by default.
7. `useSubmitChainOrder` runs:
   - wallet/network checks
   - nonce read
   - EIP-712 payload creation
   - signature request
   - `TradeOrderBook.submitOrder` tx
   - receipt wait + order read
8. Mutation success invalidates order query cache.
9. `useOrders` refetches chain-backed order list.
10. `useOrderEvents` watches contract events and upserts cache in near real time.
11. Zustand log store records submission payloads, responses, events, and errors for terminal/event panels.

## 3. File and Module Architecture

```txt
apps/trade-flow-demo/
  src/
    app/
      layout.tsx
      page.tsx
      api/trade/{submit,orders,stream}/route.ts
    components/
      providers/app-providers.tsx
      wallet/wallet-status.tsx
      trade/{trade-hero,trade-form,order-table,log-panel}.tsx
    hooks/
      contracts/use-trade-order-book.ts
      trade/{useSubmitTrade,use-submit-chain-order,useOrders,useOrderEvents,useTradeLogStore}.ts
    lib/
      contracts/trade-order-book.ts
      trade/{types,schema,encode,mock-signer,order-store}.ts
  README.md
  README_DEVELOPER_GUIDE.md
```

Related monorepo modules:

- `packages/contracts/src/trading-demo/*` (generated ABI/address/meta exports)
- `contracts/foundry/src/trading-state-demo/TradeOrderBook.sol`
- `contracts/foundry/src/MockToken.sol`
- `contracts/foundry/script/{DeployTradeFlowDemo.s.sol,DeployTradingStateDemo.s.sol}`
- `scripts/sync-trading-demo-contracts.mjs`

## 4. Core Flow 1: Trade Form State

Implemented in `components/trade/trade-form.tsx`:

- RHF `useForm` with `zodResolver(tradeFormSchema)` and `mode: "onChange"`.
- Defaults:
  - `side=buy`, `market=ETH-MOCK`, `amount=1`, `price=2500`, `slippageBps=50`, `deadlineSeconds=60`.
- Derived values via `useWatch` + `useMemo`:
  - notional = amount * price
  - slippage % = bps / 100
  - deadline label
- `isReady` gate combines:
  - wallet connected
  - expected chain
  - valid form
  - not currently submitting
- Reset button restores default form values.

Why trading forms are harder: each input has execution implications and must be validated before expensive chain operations.

## 5. Core Flow 2: Zod Validation

Central schema: `lib/trade/schema.ts`.

Highlights:

- `amount` and `price`: required + positive numeric strings.
- `slippageBps`: non-negative integer, max `1000`.
- `deadlineSeconds`: non-negative integer, min `10`, max `86400`.
- `side`: enum (`buy|sell`).
- request/payload schemas exist for submit/order models.

Not implemented currently:

- balance/allowance validation against wallet/token before signing.
- server-side quote correctness checks.

Impact: frontend validation removes many invalid submissions before wallet prompts and contract calls.

## 6. Core Flow 3: Quote Preview

Current quote preview is **local derived summary**, not an external pricing engine.

Displayed today:

- notional value
- slippage percentage
- deadline summary

Not implemented in current UI:

- estimated execution price engine
- minimum received
- fee breakdown
- price impact model
- stale quote detection

## 7. Core Flow 4: Order Confirmation

There is no separate confirmation modal yet.  
Current confirmation boundary is the **Submit** action itself:

- payload is effectively frozen when `useSubmitChainOrder` builds `chainOrder` + typed payload.
- signing and sending proceed from that frozen snapshot.

In production-grade trading UIs, a dedicated confirmation step is usually added before wallet signing.

## 8. Core Flow 5: Transaction Lifecycle

Main lifecycle hook: `hooks/trade/use-submit-chain-order.ts`.

Detailed sequence:

1. Validate preconditions:
   - wallet address exists
   - chain matches deployment chain
   - public client available
2. Read nonce from contract (`nonces`).
3. Build normalized `TradeOrder` message.
4. Sign EIP-712 payload (`signTypedDataAsync`).
5. Compute orderId (`getOrderId`).
6. Submit tx (`submitOrder`).
7. Wait for receipt (`waitForTransactionReceipt`).
8. Read stored order (`getOrder`).
9. Normalize order to UI model (`mapStoredOrderToUiOrder`).
10. Store submission snapshot in Zustand and invalidate React Query order cache.

Failure paths:

- wallet rejection during signing
- wrong network
- contract reverts (e.g., invalid nonce/deadline/signature)
- RPC/network failures

All surface through mutation error handling and terminal log entries.

## 9. Core Flow 6: SSE / WebSocket Updates

SSE exists server-side: `app/api/trade/stream/route.ts`.

- emits `connected`, `heartbeat`, and order events from in-memory `order-store`.

Current frontend update path for active UI:

- uses `wagmi` `useWatchContractEvent` (`hooks/trade/useOrderEvents.ts`) for on-chain push updates.

So today:

- SSE route is implemented (mock backend path),
- WebSocket is not implemented,
- main order monitor relies on contract-event subscription.

## 10. Core Flow 7: React Query State Management

Server/chain state:

- `useOrders` (`useQuery`) reads chain events + order details.
- `useSubmitTrade` and `useSubmitChainOrder` (`useMutation`) handle submissions.
- on success: invalidate `["trade","orders","chain"]`.

State separation:

- UI/form state: React Hook Form in `TradeForm`.
- wallet state: wagmi hooks (`useAccount`, `useChainId`).
- mutation lifecycle state: React Query mutation status.
- monitoring/log state: Zustand `useTradeLogStore`.
- chain/server data: React Query query cache.

## 11. Core Flow 8: Contract Integration

Contract config layer: `lib/contracts/trade-order-book.ts`.

Uses generated exports from:

- `@web3-frontend-labs/contracts/trading-demo`

Provides:

- chainId from deployment meta
- ABI/address bindings
- EIP-712 domain/types
- order normalization from contract storage to UI model

Contract used for trading lifecycle:

- `TradeOrderBook` (`submitOrder`, `getOrder`, `getOrderId`, `nonces`)

Support contract:

- `MockToken` (metadata/readiness display)

## 12. Core Flow 9: Order Monitor and Event Timeline

Order monitor (`OrderTable`):

- queries orders from chain history
- filters by connected account
- computes summary stats (total/active/filled/terminal)
- displays lifecycle status badges

Terminal/events (`log-panel.tsx` + Zustand):

- terminal: form/payload/signature/submit/error snapshots
- events: contract event snapshots
- capped rolling log (`MAX_LOG_ENTRIES = 18`)

## 13. Text-Based Data Flow Diagram

```txt
TradeForm (RHF + Zod)
  -> local derived summary (notional/slippage/deadline)
  -> useSubmitTrade (chain mode)
  -> useSubmitChainOrder
     -> nonce read
     -> EIP-712 signTypedData
     -> submitOrder transaction
     -> receipt wait
     -> getOrder read
  -> React Query invalidate orders
  -> useOrders refetch + useOrderEvents push updates
  -> OrderTable refresh
  -> Zustand trade log updates
  -> TerminalPanel / EventsPanel
```

## 14. Important Technical Decisions

- **React Query for async data**: query/mutation lifecycle, cache invalidation, and refetch behavior are centralized.
- **Zod schemas centralized in `lib/trade/schema.ts`**: single validation contract across form and API models.
- **Separated log store (Zustand)**: keeps debug/event timeline independent from form/query state.
- **Generated contract exports package**: ABI/address drift is reduced via deploy+sync scripts.
- **Dual path (chain + mock API)**: allows local mock backend testing while keeping real chain flow.
- **Order normalization helpers**: map contract storage shapes to UI-friendly order models.

## 15. Error Handling Strategy

Handled cases:

- wallet disconnected
- wrong chain
- malformed inputs (Zod)
- signing rejection / signing failure
- contract revert / tx failure
- network and RPC failures

Current behavior:

- form-level root errors for submit gating issues
- mutation error capture into log store
- order query error banners
- status panels maintain latest known state

Not yet implemented:

- rich, typed classification for all revert causes
- guided retry policies per failure class
- stale quote invalidation flow

## 16. Extending the Demo

Practical extension points:

1. Real quote engine (server-side pricing, fee, impact, min receive).
2. Persistent order backend (DB + indexing) for historical analytics.
3. Real-time order book depth and matching feed.
4. Advanced order types (market, stop, post-only, IOC/FOK variants).
5. Portfolio/balance/allowance pre-checks before signing.
6. Full SSE/WebSocket client integration for unified push updates.
7. Multi-market and multi-token configuration layer.
8. Settlement/indexing pipeline for production-grade monitoring.

## 17. Local Development

From monorepo root:

```bash
npm install
```

Run the app:

```bash
npm run dev -w apps/trade-flow-demo
```

Optional local chain:

```bash
npm run chain:local
```

Build/deploy/sync trading contracts:

```bash
npm run contracts:build
npm run contracts:deploy:trade-flow:raw
npm run contracts:deploy:trading-state:raw
npm run contracts:sync:trading-demo
```

One-command deploy path:

```bash
npm run deploy:trading-demo
```

Lint/build/typecheck:

```bash
npm run lint -w apps/trade-flow-demo
npm run build -w apps/trade-flow-demo
npm run typecheck
```

## 18. Known Limitations

Implemented:

- on-chain EIP-712 submission flow
- chain event monitoring
- RHF+Zod validation
- React Query + Zustand coordination

Mocked / simplified:

- quote preview logic (local summary only)
- API submit/orders/stream mock backend and in-memory order-store lifecycle
- no production-grade risk/validation engine

Planned / missing:

- persistent backend and indexing
- full quote service with liquidity/impact logic
- advanced order lifecycle controls (cancel/edit UI)
- explicit confirmation modal
- complete SSE client consumption path

## 19. Notes on Current Technical Debt

- The app path is `trade-flow-demo`, while contract/deploy naming also references `trading-state`; naming is mixed.
- Two chain-submit hooks exist (`src/hooks/use-submit-chain-order.ts` and `src/hooks/trade/use-submit-chain-order.ts`); only the `hooks/trade` version is active.
- Contract config exists in both `src/contracts/*` and `src/lib/contracts/*`; this is duplicated surface area.
- `ORDER_STATUSES` includes states not currently produced by on-chain path (`matched`, `partially_filled`, `rejected`, `expired` mainly appear in mock modeling).
