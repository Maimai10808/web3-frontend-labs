"use client";

import { create } from "zustand";

import type {
  OrderEvent,
  Operation,
  SigningPayload,
  SubmitTradeResponse,
  TradeData,
  TradeFormInput,
  TradeLog,
} from "@/lib/trade/types";

type TradeLogEntrySection =
  | "formInput"
  | "tradeData"
  | "operation"
  | "signingPayload"
  | "signature"
  | "submitResponse"
  | "orderEvent"
  | "error";

export type TradeLogEntry = {
  id: string;
  section: TradeLogEntrySection;
  title: string;
  createdAt: number;
  payload: unknown;
};

type TradeLogStore = {
  snapshot: TradeLog;
  entries: TradeLogEntry[];
  recordSubmission: (params: {
    formInput: TradeFormInput;
    tradeData: TradeData;
    operation: Operation;
    signingPayload: SigningPayload;
    signature: string;
    submitResponse: SubmitTradeResponse;
  }) => void;
  recordOrderEvent: (event: OrderEvent) => void;
  recordError: (params: {
    message: string;
    formInput?: TradeFormInput;
    tradeData?: TradeData;
    operation?: Operation;
    signingPayload?: SigningPayload;
    signature?: string;
  }) => void;
  clear: () => void;
};

const MAX_LOG_ENTRIES = 18;

function createEntry(
  section: TradeLogEntrySection,
  title: string,
  payload: unknown,
): TradeLogEntry {
  return {
    id: crypto.randomUUID(),
    section,
    title,
    createdAt: Date.now(),
    payload,
  };
}

function withPrependedEntries(
  currentEntries: TradeLogEntry[],
  nextEntries: TradeLogEntry[],
) {
  return [...nextEntries, ...currentEntries].slice(0, MAX_LOG_ENTRIES);
}

export const useTradeLogStore = create<TradeLogStore>((set) => ({
  snapshot: {},
  entries: [],

  recordSubmission: (params) =>
    set((state) => ({
      snapshot: {
        ...state.snapshot,
        formInput: params.formInput,
        tradeData: params.tradeData,
        operation: params.operation,
        signingPayload: params.signingPayload,
        signature: params.signature,
        submitResponse: params.submitResponse,
        errorMessage: undefined,
      },
      entries: withPrependedEntries(state.entries, [
        createEntry("submitResponse", "Submit Response", params.submitResponse),
        createEntry("signature", "Signature", params.signature),
        createEntry("signingPayload", "Signing Payload", params.signingPayload),
        createEntry("operation", "Operation", params.operation),
        createEntry("tradeData", "Encoded Trade Data", params.tradeData),
        createEntry("formInput", "Trade Form Input", params.formInput),
      ]),
    })),

  recordOrderEvent: (event) =>
    set((state) => ({
      snapshot: {
        ...state.snapshot,
        latestOrderEvent: event,
      },
      entries: withPrependedEntries(state.entries, [
        createEntry("orderEvent", `Order Event: ${event.type}`, event),
      ]),
    })),

  recordError: (params) =>
    set((state) => ({
      snapshot: {
        ...state.snapshot,
        formInput: params.formInput ?? state.snapshot.formInput,
        tradeData: params.tradeData ?? state.snapshot.tradeData,
        operation: params.operation ?? state.snapshot.operation,
        signingPayload: params.signingPayload ?? state.snapshot.signingPayload,
        signature: params.signature ?? state.snapshot.signature,
        errorMessage: params.message,
      },
      entries: withPrependedEntries(state.entries, [
        createEntry("error", "Trade Error", {
          message: params.message,
        }),
      ]),
    })),

  clear: () =>
    set({
      snapshot: {},
      entries: [],
    }),
}));
