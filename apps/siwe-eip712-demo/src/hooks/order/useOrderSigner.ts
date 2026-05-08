"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useAccount, useChainId, useSignTypedData } from "wagmi";
import { contracts } from "@/src/lib/contracts";
import {
  expectedOrderChainId,
  expectedOrderTokenAddress,
  getSignedOrderBookDomain,
} from "@/src/lib/eip712/domain";
import {
  buildSignedOrderInput,
  signedOrderFormSchema,
  signedOrderInputSchema,
  signedOrderTypes,
  toSignedOrderTypedData,
  type SignedOrderFormInput,
  type SignedOrderInput,
} from "@/src/lib/eip712/order";

type OrderNonceResponse =
  | {
      ok: true;
      nonce: `0x${string}`;
      expiresAt: number;
    }
  | {
      ok: false;
      error: string;
      message?: string;
    };

export type VerifyOrderResult =
  | {
      ok: true;
      verified: true;
      sessionAddress: `0x${string}`;
      recoveredAddress: `0x${string}`;
      order: SignedOrderInput;
      expectedToken: `0x${string}`;
      expectedChainId: number;
    }
  | {
      ok: false;
      error: string;
      message?: string;
      sessionAddress?: `0x${string}`;
      recoveredAddress?: `0x${string}`;
      orderMaker?: `0x${string}`;
      expectedToken?: `0x${string}`;
    };

const DEFAULT_DEADLINE_SECONDS = 60 * 10;

export function useOrderSigner() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: session, status } = useSession();
  const { signTypedDataAsync, isPending } = useSignTypedData();

  const [signedOrder, setSignedOrder] = useState<SignedOrderInput | null>(null);
  const [signature, setSignature] = useState<`0x${string}` | "">("");
  const [verifyResult, setVerifyResult] = useState<VerifyOrderResult | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState("");

  const sessionAddress = session?.user?.name ?? null;
  const isCorrectChain = chainId === expectedOrderChainId;

  const canSign =
    isConnected &&
    Boolean(address) &&
    status === "authenticated" &&
    sessionAddress?.toLowerCase() === address?.toLowerCase() &&
    isCorrectChain;

  const sessionSnapshot = useMemo(() => {
    return {
      status,
      walletAddress: address ?? null,
      sessionAddress,
      chainId,
      expectedChainId: expectedOrderChainId,
      isCorrectChain,
      canSign,
    };
  }, [status, address, sessionAddress, chainId, isCorrectChain, canSign]);

  async function requestNonce() {
    const response = await fetch("/api/eip712/order-nonce", {
      method: "POST",
    });

    const data = (await response.json()) as OrderNonceResponse;

    if (!response.ok || !data.ok) {
      throw new Error(
        !data.ok && data.message
          ? data.message
          : "Failed to request signed order nonce.",
      );
    }

    return data.nonce;
  }

  async function signAndVerify(
    values: SignedOrderFormInput,
    options?: {
      deadlineSeconds?: number;
    },
  ) {
    try {
      setSignedOrder(null);
      setSignature("");
      setVerifyResult(null);
      setErrorMessage("");

      if (!address) {
        throw new Error("Wallet is not connected.");
      }

      if (!canSign) {
        throw new Error(
          "Connect the expected wallet, switch to the expected chain, and complete SIWE login first.",
        );
      }

      const parsedForm = signedOrderFormSchema.safeParse(values);

      if (!parsedForm.success) {
        throw new Error("Order form data is invalid.");
      }

      const nonce = await requestNonce();
      const deadline =
        Math.floor(Date.now() / 1000) +
        (options?.deadlineSeconds ?? DEFAULT_DEADLINE_SECONDS);

      const order = buildSignedOrderInput({
        maker: address,
        recipient: parsedForm.data.recipient,
        amount: parsedForm.data.amount,
        nonce,
        deadline,
      });

      const parsedOrder = signedOrderInputSchema.safeParse(order);

      if (!parsedOrder.success) {
        throw new Error("Signed order payload is invalid.");
      }

      const typedOrder = toSignedOrderTypedData(parsedOrder.data);
      const typedSignature = await signTypedDataAsync({
        account: address,
        domain: getSignedOrderBookDomain(),
        types: signedOrderTypes,
        primaryType: "Order",
        message: typedOrder,
      });

      setSignedOrder(parsedOrder.data);
      setSignature(typedSignature);

      const response = await fetch("/api/eip712/verify-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chainId: expectedOrderChainId,
          order: parsedOrder.data,
          signature: typedSignature,
        }),
      });

      const data = (await response.json()) as VerifyOrderResult;

      setVerifyResult(data);

      if (!response.ok || !data.ok) {
        throw new Error(
          data.message ?? data.error ?? "Backend verification failed.",
        );
      }

      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown signing error.";

      setErrorMessage(message);

      return null;
    }
  }

  return {
    wallet: {
      address: address ?? null,
      isConnected,
      chainId,
      expectedChainId: expectedOrderChainId,
      isCorrectChain,
    },
    auth: {
      status,
      sessionAddress,
      canSign,
    },
    order: {
      tokenAddress: expectedOrderTokenAddress,
      verifyingContract: contracts.signedOrderBook.address,
      signedOrder,
      signature,
      verifyResult,
    },
    sessionSnapshot,
    errorMessage,
    isPending,
    signAndVerify,
  };
}
