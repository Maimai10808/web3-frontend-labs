"use client";

import { useState } from "react";
import type {
  MultiChainError,
  SignIntentInput,
  SignatureResult,
} from "@/lib/multichain/types";
import { normalizeMultiChainError } from "@/lib/multichain/errors";
import { useWalletAccount } from "./use-wallet-account";
import { useMultichainDemoStore } from "@/store/multichain-demo-store";
import { useMultichainLogs } from "./use-multichain-logs";

export function useSignIntent() {
  const { adapter } = useWalletAccount();
  const { pushLog } = useMultichainLogs();
  const setDebugPayload = useMultichainDemoStore(
    (state) => state.setDebugPayload,
  );

  const [result, setResult] = useState<SignatureResult | null>(null);
  const [error, setError] = useState<MultiChainError | null>(null);
  const [isPending, setIsPending] = useState(false);

  const sign = async (input: SignIntentInput) => {
    if (!adapter) {
      const nextError = normalizeMultiChainError(
        new Error("Adapter not ready"),
      );
      setError(nextError);
      setDebugPayload("lastError", nextError);
      throw nextError;
    }

    setIsPending(true);
    setError(null);
    setDebugPayload("lastSignInput", input);

    try {
      const next = await adapter.signIntent(input);
      setResult(next);
      setDebugPayload("lastSignResult", next);
      pushLog({
        level: "success",
        title: "Signature Success",
        message: `${adapter.ecosystem} -> ${next.kind}`,
      });
      return next;
    } catch (err) {
      const nextError = normalizeMultiChainError(err, adapter.ecosystem);
      setError(nextError);
      setDebugPayload("lastError", nextError);
      pushLog({
        level: "error",
        title: "Signature Failed",
        message: nextError.message,
      });
      throw nextError;
    } finally {
      setIsPending(false);
    }
  };

  return {
    sign,
    result,
    error,
    isPending,
    adapter,
  };
}
