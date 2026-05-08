import { contracts, deploymentMeta } from "@/src/lib/contracts";

export const expectedOrderChainId = deploymentMeta.chainId;
export const expectedOrderTokenAddress = contracts.demoERC20.address;

const allowedOrderTokenAddresses = [
  expectedOrderTokenAddress.toLowerCase(),
] as const;

export function getSignedOrderBookDomain() {
  return {
    name: "SignedOrderBook",
    version: "1",
    chainId: expectedOrderChainId,
    verifyingContract: contracts.signedOrderBook.address,
  } as const;
}

export function isAllowedOrderToken(token: `0x${string}`) {
  return allowedOrderTokenAddresses.includes(
    token.toLowerCase() as (typeof allowedOrderTokenAddresses)[number],
  );
}
