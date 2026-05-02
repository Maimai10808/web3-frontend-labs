"use client";

import { useMutation } from "@tanstack/react-query";
import { decodeEventLog, type Hex } from "viem";
import {
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { buildCreateTokenArgs } from "@/lib/token-launch/build-create-token-args";
import type {
  CreateTokenResult,
  ValidatedTokenLaunchFormValues,
} from "@/lib/token-launch/types";
import {
  tokenFactoryAddress,
  tokenLaunchedEventName,
} from "@/lib/contracts/token-launch";

// 这里后面优先替换成从 @web3-frontend-labs/contracts 导入
import { TokenFactoryAbi } from "@/lib/contracts/token-factory-abi";

type UseCreateTokenParams = {
  form: Pick<
    ValidatedTokenLaunchFormValues,
    "tokenName" | "tokenSymbol" | "description"
  >;
  metadataUrl: string;
  maxSupply: string;
};

export function useCreateToken() {
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const mutation = useMutation({
    mutationFn: async ({
      form,
      metadataUrl,
      maxSupply,
    }: UseCreateTokenParams): Promise<CreateTokenResult> => {
      if (!publicClient) {
        throw new Error("Public client is not ready.");
      }

      const args = buildCreateTokenArgs({
        form,
        metadataUrl,
        maxSupply,
      });

      const txHash = await writeContractAsync({
        abi: TokenFactoryAbi,
        address: tokenFactoryAddress,
        functionName: "createToken",
        args: [
          {
            name: args.name,
            symbol: args.symbol,
            maxSupply: args.maxSupply,
            metadataURI: args.metadataURI,
          },
        ],
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      let tokenAddress: string | null = null;

      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: TokenFactoryAbi,
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === tokenLaunchedEventName) {
            const eventArgs = decoded.args as {
              token?: string;
            };

            if (eventArgs.token) {
              tokenAddress = eventArgs.token;
              break;
            }
          }
        } catch {
          continue;
        }
      }

      if (!tokenAddress) {
        throw new Error("Token address not found in TokenLaunched event.");
      }

      return {
        txHash: txHash as Hex,
        tokenAddress,
        metadataUrl,
      };
    },
  });

  return {
    createToken: mutation.mutateAsync,
    createTokenResult: mutation.data ?? null,
    isCreatingToken: mutation.isPending,
    createTokenError: mutation.error,
    resetCreateToken: mutation.reset,
  };
}
