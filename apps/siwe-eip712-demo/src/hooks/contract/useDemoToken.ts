"use client";

import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { contracts } from "@/src/lib/contracts";

export function useDemoToken() {
  const { address } = useAccount();

  const name = useReadContract({
    ...contracts.demoERC20,
    functionName: "name",
  });

  const symbol = useReadContract({
    ...contracts.demoERC20,
    functionName: "symbol",
  });

  const decimals = useReadContract({
    ...contracts.demoERC20,
    functionName: "decimals",
  });

  const balance = useReadContract({
    ...contracts.demoERC20,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  const allowanceToOrderBook = useReadContract({
    ...contracts.demoERC20,
    functionName: "allowance",
    args: address ? [address, contracts.signedOrderBook.address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  const { writeContractAsync: writeTransferAsync, isPending: isTransferPending } =
    useWriteContract();
  const { writeContractAsync: writeApproveAsync, isPending: isApprovePending } =
    useWriteContract();

  function normalizeAmount(value: string | bigint) {
    if (typeof value === "bigint") {
      return value;
    }

    return parseUnits(value, decimals.data ?? 18);
  }

  async function transfer(to: `0x${string}`, amount: string) {
    return writeTransferAsync({
      ...contracts.demoERC20,
      functionName: "transfer",
      args: [to, normalizeAmount(amount)],
    });
  }

  async function approveSignedOrderBook(amount: string | bigint) {
    return writeApproveAsync({
      ...contracts.demoERC20,
      functionName: "approve",
      args: [contracts.signedOrderBook.address, normalizeAmount(amount)],
    });
  }

  return {
    address,
    name: name.data,
    symbol: symbol.data,
    decimals: decimals.data,
    rawBalance: balance.data,
    balance:
      balance.data !== undefined
        ? formatUnits(balance.data, decimals.data ?? 18)
        : "0",
    rawAllowanceToOrderBook: allowanceToOrderBook.data,
    allowanceToOrderBook:
      allowanceToOrderBook.data !== undefined
        ? formatUnits(allowanceToOrderBook.data, decimals.data ?? 18)
        : "0",
    transfer,
    approveSignedOrderBook,
    isTransferPending,
    isApprovePending,
    refetchBalance: balance.refetch,
    refetchAllowanceToOrderBook: allowanceToOrderBook.refetch,
  };
}
