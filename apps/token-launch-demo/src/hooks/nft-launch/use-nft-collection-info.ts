import { useReadContracts } from "wagmi";

import { nftCollectionContract } from "@/lib/contracts/nft-contracts";
import type { NftCollectionInfo } from "@/lib/nft-launch/types";

export function useNftCollectionInfo() {
  return useReadContracts({
    allowFailure: false,
    contracts: [
      {
        ...nftCollectionContract,
        functionName: "name",
      },
      {
        ...nftCollectionContract,
        functionName: "symbol",
      },
      {
        ...nftCollectionContract,
        functionName: "contractURI",
      },
      {
        ...nftCollectionContract,
        functionName: "baseTokenURI",
      },
      {
        ...nftCollectionContract,
        functionName: "maxSupply",
      },
      {
        ...nftCollectionContract,
        functionName: "nextTokenId",
      },
      {
        ...nftCollectionContract,
        functionName: "totalSupply",
      },
      {
        ...nftCollectionContract,
        functionName: "totalMinted",
      },
    ],
    query: {
      select(data): NftCollectionInfo {
        return {
          name: data[0] as string,
          symbol: data[1] as string,
          contractURI: data[2] as string,
          baseTokenURI: data[3] as string,
          maxSupply: data[4] as bigint,
          nextTokenId: data[5] as bigint,
          totalSupply: data[6] as bigint,
          totalMinted: data[7] as bigint,
        };
      },
    },
  });
}
