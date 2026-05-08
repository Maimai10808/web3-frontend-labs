"use client";

import { useSession } from "next-auth/react";
import { useAccount, useChainId } from "wagmi";
import { useSiweSessionGuard } from "./useSiweSessionGuard";

function shortAddress(address?: string) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function useSiweStatusViewModel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: session, status } = useSession();

  const sessionAddress = session?.user?.name ?? null;
  const isSignedIn = Boolean(sessionAddress);

  useSiweSessionGuard({
    address,
    isConnected,
    chainId,
    sessionAddress,
  });

  return {
    wallet: {
      isConnected,
      address: address ?? null,
      shortAddress: shortAddress(address),
      chainId,
    },
    auth: {
      status,
      sessionAddress,
      isSignedIn,
    },
  };
}
