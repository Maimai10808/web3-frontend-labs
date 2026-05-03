import type { Address } from "viem";
import {
  launchERC721CollectionAbi,
  launchERC721CollectionAddress as deployedLaunchERC721CollectionAddress,
  launchERC721CollectionDeployment,
  nftCollectionDeploymentMeta,
  launchERC721FactoryAbi,
  launchERC721FactoryAddress as deployedLaunchERC721FactoryAddress,
  launchERC721FactoryDeployment,
  nftCollectionFactoryDeploymentMeta,
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

export const nftCollectionFactoryChainId =
  nftCollectionFactoryDeploymentMeta.chainId;

export const nftCollectionFactoryAddress =
  deployedLaunchERC721FactoryAddress as Address;

export const nftCollectionFactoryDeployTxHash =
  launchERC721FactoryDeployment.transactionHash;

export const nftCollectionFactoryContractName =
  launchERC721FactoryDeployment.contractName;

export const nftCollectionFactoryContract = {
  address: nftCollectionFactoryAddress,
  abi: launchERC721FactoryAbi,
  chainId: nftCollectionFactoryChainId,
} as const;

export const nftCollectionFactoryDeployment = {
  contractName: nftCollectionFactoryContractName,
  address: nftCollectionFactoryAddress,
  transactionHash: nftCollectionFactoryDeployTxHash,
  chainId: nftCollectionFactoryChainId,
  networkName: nftCollectionFactoryDeploymentMeta.networkName,
  deployScript: nftCollectionFactoryDeploymentMeta.deployScript,
  deploymentId: nftCollectionFactoryDeploymentMeta.deploymentId,
  exportedAt: nftCollectionFactoryDeploymentMeta.exportedAt,
} as const;

export const nftCollectionCreatedEventName = "CollectionCreated";

export const nftCollectionMintedEventName = "CollectionMinted";
export const nftCollectionBurnedEventName = "CollectionBurned";
export const nftContractURIUpdatedEventName = "ContractURIUpdated";
export const nftBaseTokenURIUpdatedEventName = "BaseTokenURIUpdated";
export const nftCustomTokenURIUpdatedEventName = "CustomTokenURIUpdated";
export const nftMintPriceUpdatedEventName = "MintPriceUpdated";
export const nftWithdrawnEventName = "Withdrawn";
export const nftTransferEventName = "Transfer";

export function getNftCollectionExplorerTxUrl(txHash: string): string | null {
  void txHash;

  if (nftCollectionChainId === 31337) {
    return null;
  }

  return null;
}

export function getNftCollectionExplorerAddressUrl(
  address: Address,
): string | null {
  void address;

  if (nftCollectionChainId === 31337) {
    return null;
  }

  return null;
}

export function getNftCollectionFactoryExplorerTxUrl(
  txHash: string,
): string | null {
  void txHash;

  if (nftCollectionFactoryChainId === 31337) {
    return null;
  }

  return null;
}

export function getNftCollectionFactoryExplorerAddressUrl(
  address: Address,
): string | null {
  void address;

  if (nftCollectionFactoryChainId === 31337) {
    return null;
  }

  return null;
}
