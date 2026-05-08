"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useAccount, useChainId, useSignTypedData } from "wagmi";
import {
  getOrderDomain,
  orderInputSchema,
  orderTypes,
  toOrderTypedData,
  type MockOrderInput,
} from "@/src/lib/eip712";

export type OrderFormValues = {
  token: `0x${string}`;
  amount: string;
  price: string;
};

export type VerifyResult = {
  ok: boolean;
  verified?: boolean;
  error?: string;
  message?: string;
  sessionAddress?: string;
  recoveredAddress?: string;
  orderMaker?: string;
  order?: MockOrderInput;
};

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

export function useOrderSigner() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: session, status } = useSession();
  const { signTypedDataAsync, isPending } = useSignTypedData();

  const [signature, setSignature] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const sessionAddress = session?.user?.name ?? null;

  const canSign =
    isConnected &&
    Boolean(address) &&
    status === "authenticated" &&
    sessionAddress?.toLowerCase() === address?.toLowerCase();

  const sessionSnapshot = useMemo(() => {
    return {
      status,
      walletAddress: address ?? null,
      sessionAddress,
      chainId,
      canSign,
    };
  }, [status, address, sessionAddress, chainId, canSign]);

  async function requestOrderNonce() {
    const response = await fetch("/api/orders/nonce", {
      method: "POST",
    });

    const data = (await response.json()) as OrderNonceResponse;

    if (!response.ok || !data.ok) {
      throw new Error(
        !data.ok && data.message
          ? data.message
          : "Failed to request order nonce.",
      );
    }

    return data.nonce;
  }

  function buildOrder(
    values: OrderFormValues,
    nonce: `0x${string}`,
  ): MockOrderInput {
    if (!address) {
      throw new Error("Wallet is not connected.");
    }

    return {
      maker: address,
      token: values.token,
      amount: values.amount,
      price: values.price,
      deadline: Math.floor(Date.now() / 1000) + 60 * 10,
      nonce,
    };
  }

  async function signAndVerify(values: OrderFormValues) {
    try {
      setSignature("");
      setResult(null);
      setErrorMessage("");

      if (!chainId) {
        throw new Error("Chain ID is missing.");
      }

      if (!canSign) {
        throw new Error(
          "You must connect wallet and complete SIWE login first.",
        );
      }

      const nonce = await requestOrderNonce();
      const order = buildOrder(values, nonce);

      const parsedOrder = orderInputSchema.safeParse(order);

      if (!parsedOrder.success) {
        throw new Error("Order form data is invalid.");
      }

      const typedOrder = toOrderTypedData(parsedOrder.data);

      const typedSignature = await signTypedDataAsync({
        domain: getOrderDomain(chainId),
        types: orderTypes,
        primaryType: "Order",
        message: typedOrder,
      });

      setSignature(typedSignature);

      const response = await fetch("/api/orders/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chainId,
          order: parsedOrder.data,
          signature: typedSignature,
        }),
      });

      const data = (await response.json()) as VerifyResult;

      setResult(data);

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
    },
    auth: {
      status,
      sessionAddress,
      canSign,
    },
    sessionSnapshot,
    signature,
    result,
    errorMessage,
    isPending,
    signAndVerify,
  };
}
