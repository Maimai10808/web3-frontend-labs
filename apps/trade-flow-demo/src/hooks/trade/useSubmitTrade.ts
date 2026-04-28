"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTradeSigningFlow } from "@/lib/trade/encode";
import { mockSignPayload } from "@/lib/trade/mock-signer";
import { useTradeLogStore } from "./useTradeLogStore";

import type {
  SubmitTradeRequest,
  SubmitTradeResponse,
  TradeFormInput,
} from "@/lib/trade/types";

type SubmitTradeInput = {
  account: `0x${string}`;
  input: TradeFormInput;
};

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

async function submitTrade(
  input: SubmitTradeInput,
): Promise<SubmitTradeResponse> {
  const { tradeData, operation, signingPayload } = createTradeSigningFlow({
    account: input.account,
    input: input.input,
  });

  let signature: string | undefined;

  try {
    signature = await mockSignPayload({
      account: input.account,
      payload: signingPayload,
    });

    const submitResponse = await postSubmitTrade({
      payload: signingPayload,
      signature,
    });

    useTradeLogStore.getState().recordSubmission({
      formInput: input.input,
      tradeData,
      operation,
      signingPayload,
      signature,
      submitResponse,
    });

    return submitResponse;
  } catch (error) {
    useTradeLogStore.getState().recordError({
      message:
        error instanceof Error ? error.message : "Failed to submit trade.",
      formInput: input.input,
      tradeData,
      operation,
      signingPayload,
      signature,
    });

    throw error;
  }
}

export function useSubmitTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["trade", "submit"],
    mutationFn: submitTrade,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["trade", "orders"],
      });
    },
  });
}
