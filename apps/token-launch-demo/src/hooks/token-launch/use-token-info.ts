"use client";

import { useQuery } from "@tanstack/react-query";
import {
  launchERC20Abi,
  tokenFactoryAbi,
} from "@web3-frontend-labs/contracts/token-launch-demo";
import { formatUnits, type Address } from "viem";
import { usePublicClient } from "wagmi";
import type { TokenInfo } from "@/lib/token-launch/types";
import { tokenFactoryAddress } from "@/lib/contracts/token-launch";

type UseTokenInfoParams = {
  tokenAddress?: string;
  decimals?: number;
};

type LaunchRecord = {
  token: Address;
  creator: Address;
  name: string;
  symbol: string;
  metadataURI: string;
  maxSupply: bigint;
  createdAt: bigint;
};

export function useTokenInfo({
  tokenAddress,
  decimals = 18,
}: UseTokenInfoParams) {
  const publicClient = usePublicClient();

  const query = useQuery({
    queryKey: ["token-launch-demo", "token-info", tokenAddress, decimals],
    enabled: !!publicClient && !!tokenAddress,
    queryFn: async (): Promise<TokenInfo> => {
      if (!publicClient) {
        throw new Error("Public client is not ready.");
      }

      if (!tokenAddress) {
        throw new Error("Token address is required.");
      }

      const normalizedTokenAddress = tokenAddress as Address;

      const launchRecord = (await publicClient.readContract({
        abi: tokenFactoryAbi,
        address: tokenFactoryAddress,
        functionName: "launchRecordByToken",
        args: [normalizedTokenAddress],
      })) as unknown as LaunchRecord;

      const [name, symbol, totalSupply, owner, metadataURI] = await Promise.all(
        [
          publicClient.readContract({
            abi: launchERC20Abi,
            address: normalizedTokenAddress,
            functionName: "name",
          }) as Promise<string>,

          publicClient.readContract({
            abi: launchERC20Abi,
            address: normalizedTokenAddress,
            functionName: "symbol",
          }) as Promise<string>,

          publicClient.readContract({
            abi: launchERC20Abi,
            address: normalizedTokenAddress,
            functionName: "totalSupply",
          }) as Promise<bigint>,

          publicClient.readContract({
            abi: launchERC20Abi,
            address: normalizedTokenAddress,
            functionName: "owner",
          }) as Promise<Address>,

          publicClient.readContract({
            abi: launchERC20Abi,
            address: normalizedTokenAddress,
            functionName: "metadataURI",
          }) as Promise<string>,
        ],
      );

      return {
        tokenAddress: normalizedTokenAddress,
        creator: launchRecord.creator,
        owner,
        name,
        symbol,
        totalSupply: formatUnits(totalSupply, decimals),
        maxSupply: formatUnits(launchRecord.maxSupply, decimals),
        metadataUrl: metadataURI || launchRecord.metadataURI,
        createdAt: Number(launchRecord.createdAt),
      };
    },
  });

  return {
    tokenInfo: query.data ?? null,
    isLoadingTokenInfo: query.isLoading,
    tokenInfoError: query.error,
    refetchTokenInfo: query.refetch,
  };
}
