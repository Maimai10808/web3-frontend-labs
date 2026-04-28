"use client";

import { useMutation } from "@tanstack/react-query";
import { parseUnits, zeroAddress } from "viem";
import {
  useAccount,
  useChainId,
  useReadContract,
  useSignTypedData,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";

import {
  getTradeOrderDomain,
  tradeOrderBookContract,
  tradeOrderTypes,
} from "@/contracts";

type SubmitChainOrderInput = {
  side: "buy" | "sell";
  price: string;
  amount: string;
  tif: number;
};

export function useSubmitChainOrder() {
  const { address } = useAccount();
  const chainId = useChainId();

  const { signTypedDataAsync } = useSignTypedData();
  const { writeContractAsync, data: hash } = useWriteContract();

  const receiptQuery = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: Boolean(hash),
    },
  });

  const nonceQuery = useReadContract({
    ...tradeOrderBookContract,
    functionName: "nonces",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  const mutation = useMutation({
    mutationFn: async (input: SubmitChainOrderInput) => {
      if (!address) {
        throw new Error("Wallet is not connected.");
      }

      const nonce =
        typeof nonceQuery.data === "bigint" ? nonceQuery.data : BigInt(0);

      const deadline = BigInt(Math.floor(Date.now() / 1000) + 15 * 60);

      const order = {
        trader: address,
        side: input.side === "buy" ? 0 : 1,
        baseToken: zeroAddress,
        quoteToken: zeroAddress,
        price: parseUnits(input.price, 18),
        amount: parseUnits(input.amount, 18),
        tif: BigInt(input.tif),
        nonce,
        deadline,
      } as const;

      const signature = await signTypedDataAsync({
        domain: getTradeOrderDomain(chainId),
        types: tradeOrderTypes,
        primaryType: "TradeOrder",
        message: order,
      });

      const txHash = await writeContractAsync({
        ...tradeOrderBookContract,
        functionName: "submitOrder",
        args: [order, signature],
      });

      return {
        txHash,
        order,
        signature,
      };
    },
  });

  return {
    submitChainOrder: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
    hash,
    receipt: receiptQuery.data,
    isConfirming: receiptQuery.isLoading,
    isConfirmed: receiptQuery.isSuccess,
    refetchNonce: nonceQuery.refetch,
  };
}
