"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMockTradeSigningFlow } from "@/lib/trade/encode";
import { mockSignPayload } from "@/lib/trade/mock-signer";
import { useSubmitChainOrder } from "./use-submit-chain-order";
import { useTradeLogStore } from "./useTradeLogStore";

import type {
  SubmitTradeRequest,
  SubmitTradeResponse,
  TradeFormInput,
} from "@/lib/trade/types";

async function postSubmitTrade(
  request: SubmitTradeRequest,
): Promise<SubmitTradeResponse> {
  const response = await fetch("/api/trade/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Failed to submit trade.");
  }

  return data;
}

export function useSubmitTrade() {
  const queryClient = useQueryClient();
  const submitChainOrder = useSubmitChainOrder();

  return useMutation({
    mutationKey: ["trade", "submit"],
    mutationFn: async (input: {
      account?: `0x${string}`;
      input: TradeFormInput;
      mode?: "mock" | "chain";
    }): Promise<SubmitTradeResponse> => {
      if ((input.mode ?? "chain") === "chain") {
        return submitChainOrder.mutateAsync({
          input: input.input,
        });
      }

      if (!input.account) {
        throw new Error("Mock mode requires an account.");
      }

      const mockFlow = createMockTradeSigningFlow({
        account: input.account,
        input: input.input,
      });
      const signature = await mockSignPayload({
        account: input.account,
        payload: mockFlow.signingPayload,
      });
      const submitResponse = await postSubmitTrade({
        payload: mockFlow.signingPayload,
        signature,
      });

      useTradeLogStore.getState().recordSubmission({
        formInput: input.input,
        tradeData: mockFlow.tradeData,
        signingPayload: mockFlow.signingPayload,
        signature,
        submitResponse,
      });

      return submitResponse;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["trade", "orders", "chain"],
      });
    },
    onError: (error) => {
      useTradeLogStore.getState().recordError({
        message:
          error instanceof Error ? error.message : "Failed to submit trade.",
      });
    },
  });
}
