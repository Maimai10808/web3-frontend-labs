"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useChainId, useSignTypedData } from "wagmi";

import {
  createTradeSigningFlow,
} from "@/lib/trade/encode";
import {
  buildChainSubmitResponse,
  getTradeOrderDomain,
  mapStoredOrderToUiOrder,
  toTradeOrderMessage,
  tradeOrderBookContract,
  tradeOrderTypes,
  tradingStateChainId,
} from "@/lib/contracts/trade-order-book";
import { useTradeOrderBook } from "@/hooks/contracts/use-trade-order-book";
import { useTradeLogStore } from "./useTradeLogStore";

import type { SubmitTradeResponse, TradeFormInput } from "@/lib/trade/types";

export type SubmitChainOrderInput = {
  input: TradeFormInput;
};

export function useSubmitChainOrder() {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const chainId = useChainId();
  const { signTypedDataAsync } = useSignTypedData();
  const tradeOrderBook = useTradeOrderBook(address);

  return useMutation({
    mutationKey: ["trade", "submit", "chain"],
    mutationFn: async ({
      input,
    }: SubmitChainOrderInput): Promise<SubmitTradeResponse> => {
      if (!address) {
        throw new Error("Wallet is not connected.");
      }

      if (chainId !== tradingStateChainId) {
        throw new Error(
          `Wrong network. Switch wallet to chain ${tradingStateChainId}.`,
        );
      }

      if (!tradeOrderBook.publicClient) {
        throw new Error("Public client is unavailable.");
      }

      const nonce = await tradeOrderBook.readNonce(address);
      const chainOrder = toTradeOrderMessage({
        trader: address,
        input,
        nonce,
      });

      const tradeFlow = createTradeSigningFlow({
        account: address,
        input,
        chainId,
        chainOrder,
      });

      const signature = await signTypedDataAsync({
        domain: getTradeOrderDomain(chainId),
        types: tradeOrderTypes,
        primaryType: "TradeOrder",
        message: chainOrder,
      });

      const orderId = await tradeOrderBook.readOrderId(chainOrder);
      const txHash = await tradeOrderBook.writeContractAsync({
        ...tradeOrderBookContract,
        functionName: "submitOrder",
        args: [chainOrder, signature],
      });

      const receipt = await tradeOrderBook.publicClient.waitForTransactionReceipt(
        {
          hash: txHash,
        },
      );

      const storedOrder = await tradeOrderBook.readOrder(orderId);
      const order = mapStoredOrderToUiOrder({
        orderId,
        storedOrder,
        signature,
        txHash,
      });

      const submitResponse = buildChainSubmitResponse({
        orderId,
        txHash,
        order,
      });

      useTradeLogStore.getState().recordSubmission({
        formInput: input,
        tradeData: tradeFlow.tradeData,
        contractOrder: tradeFlow.contractOrder,
        signingPayload: tradeFlow.signingPayload,
        signature,
        submitResponse: {
          ...submitResponse,
          receipt,
        },
      });

      return submitResponse;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["trade", "orders", "chain"],
      });
    },
    onError: (error, variables) => {
      const tradeFlow = address
        ? createTradeSigningFlow({
            account: address,
            input: variables.input,
            chainId,
            chainOrder: undefined,
          })
        : null;

      useTradeLogStore.getState().recordError({
        message:
          error instanceof Error ? error.message : "Failed to submit trade.",
        formInput: variables.input,
        tradeData: tradeFlow?.tradeData,
        contractOrder: tradeFlow?.contractOrder,
        signingPayload: tradeFlow?.signingPayload,
      });
    },
  });
}
