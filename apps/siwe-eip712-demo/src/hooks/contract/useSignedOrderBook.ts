"use client";

import {
  useAccount,
  usePublicClient,
  useReadContract,
  useSignTypedData,
  useWriteContract,
} from "wagmi";
import { contracts } from "@/src/lib/contracts";
import { getSignedOrderBookDomain } from "@/src/lib/eip712/domain";
import {
  buildSignedOrderInput,
  signedOrderTypes,
  toSignedOrderTypedData,
  type SignedOrderTypedData,
} from "@/src/lib/eip712/order";

export type SignedOrder = SignedOrderTypedData;

export function useSignedOrderBook(currentNonce?: `0x${string}`) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { signTypedDataAsync, isPending: isSigningPending } =
    useSignTypedData();
  const { writeContractAsync, isPending: isExecutePending } =
    useWriteContract();
  const usedNonce = useReadContract({
    ...contracts.signedOrderBook,
    functionName: "usedNonces",
    args: currentNonce ? [currentNonce] : undefined,
    query: {
      enabled: Boolean(currentNonce),
    },
  });

  async function signOrder(params: {
    recipient: `0x${string}`;
    amount: string;
    nonce: `0x${string}`;
    deadlineSeconds?: number;
  }) {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    const deadline =
      BigInt(Math.floor(Date.now() / 1000)) +
      BigInt(params.deadlineSeconds ?? 3600);

    const order = toSignedOrderTypedData(
      buildSignedOrderInput({
        maker: address,
        recipient: params.recipient,
        amount: params.amount,
        nonce: params.nonce,
        deadline,
      }),
    );

    const signature = await signTypedDataAsync({
      account: address,
      domain: getSignedOrderBookDomain(),
      types: signedOrderTypes,
      primaryType: "Order",
      message: order,
    });

    return {
      order,
      signature,
    };
  }

  async function executeOrder(order: SignedOrder, signature: `0x${string}`) {
    const hash = await writeContractAsync({
      ...contracts.signedOrderBook,
      functionName: "executeOrder",
      args: [order, signature],
    });

    const receipt = publicClient
      ? await publicClient.waitForTransactionReceipt({ hash })
      : null;

    return {
      hash,
      receipt,
    };
  }

  return {
    signOrder,
    executeOrder,
    isSigningPending,
    isExecutePending,
    isNonceUsed: usedNonce.data ?? false,
    refetchUsedNonce: usedNonce.refetch,
  };
}
