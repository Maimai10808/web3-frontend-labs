import type { Address } from "viem";
import {
  deploymentMeta,
  tokenFactoryAddress as deployedTokenFactoryAddress,
} from "@web3-frontend-labs/contracts/token-launch-demo";

export const tokenLaunchChainId = deploymentMeta.chainId;
export const tokenFactoryAddress = deployedTokenFactoryAddress as Address;
export const tokenFactoryDeployTxHash =
  deploymentMeta.contracts.tokenFactory.transactionHash;

export const tokenLaunchedEventName = "TokenLaunched";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getTokenLaunchExplorerTxUrl(txHash: string): string | null {
  if (tokenLaunchChainId === 31337) {
    return null;
  }

  return null;
}
