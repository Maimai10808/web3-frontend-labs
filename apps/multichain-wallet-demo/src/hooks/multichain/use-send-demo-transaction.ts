"use client";

import { useState } from "react";
import type {
  MultiChainError,
  TransactionIntentInput,
  TransactionResult,
} from "@/lib/multichain/types";
import { normalizeMultiChainError } from "@/lib/multichain/errors";
import { useWalletAccount } from "./use-wallet-account";
import { useMultichainDemoStore } from "@/store/multichain-demo-store";
import { useMultichainLogs } from "./use-multichain-logs";

export function useSendDemoTransaction() {
  const { connectedAdapter: adapter } = useWalletAccount();
  const { pushLog } = useMultichainLogs();
  const setDebugPayload = useMultichainDemoStore(
    (state) => state.setDebugPayload,
  );

  const [result, setResult] = useState<TransactionResult | null>(null);
  const [error, setError] = useState<MultiChainError | null>(null);
  const [isPending, setIsPending] = useState(false);

  const send = async (input: TransactionIntentInput) => {
    if (!adapter?.sendTransaction) {
      const nextError = normalizeMultiChainError(
        new Error("Transaction is not supported by current adapter"),
        adapter?.ecosystem,
      );
      setError(nextError);
      setDebugPayload("lastError", nextError);
      throw nextError;
    }

    setIsPending(true);
    setError(null);
    setDebugPayload("lastTxInput", input);

    try {
      const next = await adapter.sendTransaction(input);
      setResult(next);
      setDebugPayload("lastTxResult", next);
      pushLog({
        level: "success",
        title: "Transaction Submitted",
        message: `${adapter.ecosystem} -> ${next.txHash}`,
      });
      return next;
    } catch (err) {
      const nextError = normalizeMultiChainError(err, adapter.ecosystem);
      setError(nextError);
      setDebugPayload("lastError", nextError);
      pushLog({
        level: "error",
        title: "Transaction Failed",
        message: nextError.message,
      });
      throw nextError;
    } finally {
      setIsPending(false);
    }
  };

  return {
    send,
    result,
    error,
    isPending,
  };
}
