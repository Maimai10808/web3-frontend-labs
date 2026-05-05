import type { Address } from "viem";
import {
  rewardTokenAbi,
  rewardTokenAddress,
  rewardTokenDeployment,
  airdropGrowthClaimAbi,
  airdropGrowthClaimAddress,
  airdropGrowthClaimDeployment,
  airdropGrowthDeploymentMeta,
} from "@web3-frontend-labs/contracts/airdrop-growth-demo";

export const airdropGrowthChainId = airdropGrowthDeploymentMeta.chainId;

export const rewardTokenContract = {
  address: rewardTokenAddress as Address,
  abi: rewardTokenAbi,
  chainId: airdropGrowthChainId,
} as const;

export const airdropGrowthClaimContract = {
  address: airdropGrowthClaimAddress as Address,
  abi: airdropGrowthClaimAbi,
  chainId: airdropGrowthChainId,
} as const;

export const rewardTokenDeployTxHash = rewardTokenDeployment.transactionHash;
export const airdropGrowthClaimDeployTxHash =
  airdropGrowthClaimDeployment.transactionHash;

export const rewardClaimedEventName = "RewardClaimed";
export const eligibilityUpdatedEventName = "EligibilityUpdated";
