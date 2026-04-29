"use client";

import { useState } from "react";
import {
  fetchBindingNonce,
  submitBinding,
} from "@/lib/multichain/services/binding-service";
import { useWalletAccount } from "./use-wallet-account";
import { useMultichainDemoStore } from "@/store/multichain-demo-store";
import { useMultichainLogs } from "./use-multichain-logs";
import { normalizeMultiChainError } from "@/lib/multichain/errors";
import type {
  MultiChainError,
  SignIntentInput,
  SignatureKind,
} from "@/lib/multichain/types";

function getBindingSignatureKind(ecosystem: string): SignatureKind {
  if (ecosystem === "evm") return "eip712";
  if (ecosystem === "solana") return "solana_message";
  if (ecosystem === "btc") return "btc_message";
  if (ecosystem === "sei") return "sei_arbitrary";
  return "personal_sign";
}

export function useBindWallet() {
  const { adapter } = useWalletAccount();
  const setBindingStatus = useMultichainDemoStore(
    (state) => state.setBindingStatus,
  );
  const setBoundAddress = useMultichainDemoStore(
    (state) => state.setBoundAddress,
  );
  const setLastNonce = useMultichainDemoStore((state) => state.setLastNonce);
  const setDebugPayload = useMultichainDemoStore(
    (state) => state.setDebugPayload,
  );

  const { pushLog } = useMultichainLogs();

  const [error, setError] = useState<MultiChainError | null>(null);
  const [isPending, setIsPending] = useState(false);

  const bind = async () => {
    if (!adapter) {
      const nextError = normalizeMultiChainError(
        new Error("Adapter not ready"),
      );
      setError(nextError);
      setDebugPayload("lastError", nextError);
      throw nextError;
    }

    setBindingStatus("verifying");
    setIsPending(true);
    setError(null);

    try {
      const account = await adapter.getAccount();
      if (!account) {
        throw new Error("Wallet not connected");
      }

      const nonceData = await fetchBindingNonce();
      setLastNonce(nonceData.nonce);

      const kind = getBindingSignatureKind(adapter.ecosystem);

      const signInput: SignIntentInput =
        kind === "eip712"
          ? {
              kind,
              message: nonceData.message,
              typedData: {
                domain: {
                  name: "multichain-wallet-demo",
                  version: "1",
                  chainId: account.chainId ?? 1,
                },
                types: {
                  BindWallet: [
                    { name: "message", type: "string" },
                    { name: "nonce", type: "string" },
                  ],
                },
                primaryType: "BindWallet",
                message: {
                  message: nonceData.message,
                  nonce: nonceData.nonce,
                },
              },
            }
          : {
              kind,
              message: nonceData.message,
            };

      setDebugPayload("lastBindPayload", {
        nonce: nonceData.nonce,
        signInput,
      });

      const signatureResult = await adapter.signIntent(signInput);
      const bindResult = await submitBinding({
        ecosystem: adapter.ecosystem,
        nonce: nonceData.nonce,
        signatureResult,
      });

      setBindingStatus("bound");
      setBoundAddress(signatureResult.address);
      setDebugPayload("lastBindResult", bindResult);

      pushLog({
        level: "success",
        title: "Wallet Bound",
        message: `${adapter.ecosystem} -> ${signatureResult.address}`,
      });

      return bindResult;
    } catch (err) {
      const nextError = normalizeMultiChainError(err, adapter.ecosystem);
      setError(nextError);
      setBindingStatus("failed");
      setDebugPayload("lastError", nextError);

      pushLog({
        level: "error",
        title: "Bind Failed",
        message: nextError.message,
      });

      throw nextError;
    } finally {
      setIsPending(false);
    }
  };

  return {
    bind,
    error,
    isPending,
  };
}
