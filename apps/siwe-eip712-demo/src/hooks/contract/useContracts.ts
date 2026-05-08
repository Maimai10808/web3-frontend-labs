"use client";

import { useMemo } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

import { deploymentMeta } from "@/src/lib/contracts";

import { useDemoToken } from "./useDemoToken";
import { useTokenFaucet } from "./useTokenFaucet";
import { useSignedOrderBook } from "./useSignedOrderBook";

export function useContracts() {
  const account = useAccount();
  const chainId = useChainId();

  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();

  const demoToken = useDemoToken();
  const tokenFaucet = useTokenFaucet();
  const signedOrderBook = useSignedOrderBook();

  const isConnected = account.isConnected;
  const walletAddress = account.address;

  const expectedChainId = deploymentMeta.chainId;
  const isCorrectChain = chainId === expectedChainId;
  const isWrongNetwork = isConnected && !isCorrectChain;

  const isReady = isConnected && isCorrectChain;

  const status = useMemo(() => {
    if (!isConnected) {
      return {
        type: "disconnected" as const,
        message: "Wallet not connected",
      };
    }

    if (!isCorrectChain) {
      return {
        type: "wrong-chain" as const,
        message: `Wrong network. Expected chain ${expectedChainId}, current chain ${chainId}.`,
      };
    }

    return {
      type: "ready" as const,
      message: "Ready",
    };
  }, [chainId, expectedChainId, isConnected, isCorrectChain]);

  async function switchToExpectedChain() {
    return switchChainAsync({
      chainId: expectedChainId,
    });
  }

  async function claimAndRefresh() {
    const hash = await tokenFaucet.claim();

    await Promise.all([
      demoToken.refetchBalance(),
      tokenFaucet.refetchCanClaim(),
    ]);

    return hash;
  }

  async function refreshUserData() {
    await Promise.all([
      demoToken.refetchBalance(),
      tokenFaucet.refetchCanClaim(),
    ]);
  }

  return {
    wallet: {
      address: walletAddress,
      isConnected,
      chainId,
      expectedChainId,
      isCorrectChain,
      isWrongNetwork,
      isReady,
      status,

      switchToExpectedChain,
      isSwitchingChain,
    },

    demoToken: {
      address: demoToken.address,
      name: demoToken.name,
      symbol: demoToken.symbol,
      decimals: demoToken.decimals,
      rawBalance: demoToken.rawBalance,
      balance: demoToken.balance,
      transfer: demoToken.transfer,
      isTransferPending: demoToken.isTransferPending,
      refetchBalance: demoToken.refetchBalance,
    },

    tokenFaucet: {
      canClaim: tokenFaucet.canClaim,
      claimAmount: tokenFaucet.claimAmount,
      cooldown: tokenFaucet.cooldown,
      lastClaimedAt: tokenFaucet.lastClaimedAt,
      claim: tokenFaucet.claim,
      claimAndRefresh,
      isClaimPending: tokenFaucet.isClaimPending,
      refetchCanClaim: tokenFaucet.refetchCanClaim,
    },

    signedOrderBook: {
      signOrder: signedOrderBook.signOrder,
      executeOrder: signedOrderBook.executeOrder,
      isSigningPending: signedOrderBook.isSigningPending,
      isExecutePending: signedOrderBook.isExecutePending,
    },

    actions: {
      refreshUserData,
      claimAndRefresh,
      switchToExpectedChain,
    },
  };
}
