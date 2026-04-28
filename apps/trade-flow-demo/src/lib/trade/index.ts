/**

 * Trade domain module

 *

 * This folder contains the core domain logic for the simplified trading demo.

 * It does not render UI and does not directly depend on React components.

 *

 * The main responsibility of this module is to model the trading flow:

 *

 * form input

 * -> validated trade data

 * -> encoded trade data

 * -> operation

 * -> signing payload

 * -> mock signature

 * -> submitted order

 * -> order status updates

 *

 * Module responsibilities:

 *

 * types.ts

 * Defines the shared TypeScript types used by the trading flow, including

 * trade form input, trade data, operation, signing payload, order, order status,

 * submit response, order event, and trade logs.

 *

 * schema.ts

 * Defines the Zod validation schemas for user input and API payloads.

 * This is responsible for checking whether trade parameters are valid before

 * they are encoded, signed, or submitted.

 *

 * encode.ts

 * Converts validated trade form input into structured trade data, encoded trade

 * data, operation objects, and signing payloads.

 * This module represents the transformation layer before signing.

 *

 * mock-signer.ts

 * Simulates wallet signing during the early demo stage.

 * It allows the app to test the full submit and order-status flow without

 * connecting a real wallet signature implementation yet.

 *

 * order-store.ts

 * Implements the mock backend order store.

 * It stores submitted orders in memory, updates order status over time, and

 * emits order events that can later be consumed by SSE.

 *

 * index.ts

 * Re-exports the public API of the trade domain module.

 * Other parts of the app should import trade-related utilities from this file

 * instead of importing from each internal file directly.

 */

export * from "./types";

export * from "./schema";

export * from "./encode";

export * from "./mock-signer";

export * from "./order-store";
