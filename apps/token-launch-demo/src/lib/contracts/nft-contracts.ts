import type { Address } from "viem";
import {
  launchERC721CollectionAbi,
  launchERC721CollectionAddress as deployedLaunchERC721CollectionAddress,
  launchERC721CollectionDeployment,
  nftCollectionDeploymentMeta,
} from "@web3-frontend-labs/contracts/token-launch-demo";

export const nftCollectionChainId = nftCollectionDeploymentMeta.chainId;

export const nftCollectionAddress =
  deployedLaunchERC721CollectionAddress as Address;

export const nftCollectionDeployTxHash =
  launchERC721CollectionDeployment.transactionHash;

export const nftCollectionContractName =
  launchERC721CollectionDeployment.contractName;

export const nftCollectionContract = {
  address: nftCollectionAddress,
  abi: launchERC721CollectionAbi,
  chainId: nftCollectionChainId,
} as const;

export const nftCollectionDeployment = {
  contractName: nftCollectionContractName,
  address: nftCollectionAddress,
  transactionHash: nftCollectionDeployTxHash,
  chainId: nftCollectionChainId,
  networkName: nftCollectionDeploymentMeta.networkName,
  deployScript: nftCollectionDeploymentMeta.deployScript,
  deploymentId: nftCollectionDeploymentMeta.deploymentId,
  exportedAt: nftCollectionDeploymentMeta.exportedAt,
} as const;

export const nftCollectionMintedEventName = "CollectionMinted";
export const nftCollectionBurnedEventName = "CollectionBurned";
export const nftContractURIUpdatedEventName = "ContractURIUpdated";
export const nftBaseTokenURIUpdatedEventName = "BaseTokenURIUpdated";
export const nftCustomTokenURIUpdatedEventName = "CustomTokenURIUpdated";
export const nftTransferEventName = "Transfer";

export function getNftCollectionExplorerTxUrl(txHash: string): string | null {
  if (nftCollectionChainId === 31337) {
    return null;
  }

  return null;
}

export function getNftCollectionExplorerAddressUrl(
  address: Address,
): string | null {
  if (nftCollectionChainId === 31337) {
    return null;
  }

  return null;
}
