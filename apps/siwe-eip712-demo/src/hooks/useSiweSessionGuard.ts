// src/hooks/useSiweSessionGuard.ts

"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";

type UseSiweSessionGuardParams = {
  address?: string;
  isConnected: boolean;
  chainId?: number;
  sessionAddress?: string | null;
};

export function useSiweSessionGuard({
  address,
  isConnected,
  chainId,
  sessionAddress,
}: UseSiweSessionGuardParams) {
  const previousChainIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!sessionAddress) return;

    if (!isConnected || !address) {
      signOut();
      return;
    }

    const normalizedSessionAddress = sessionAddress.toLowerCase();
    const normalizedWalletAddress = address.toLowerCase();

    if (normalizedSessionAddress !== normalizedWalletAddress) {
      signOut();
    }
  }, [address, isConnected, sessionAddress]);

  useEffect(() => {
    if (!sessionAddress) return;
    if (!chainId) return;

    if (
      previousChainIdRef.current !== undefined &&
      previousChainIdRef.current !== chainId
    ) {
      signOut();
      return;
    }

    previousChainIdRef.current = chainId;
  }, [chainId, sessionAddress]);
}
