import {
  demoERC20Abi,
  demoERC20Address,
  tokenFaucetAbi,
  tokenFaucetAddress,
  signedOrderBookAbi,
  signedOrderBookAddress,
  signedOrderDemoDeploymentMeta as deploymentMeta,
} from "@web3-frontend-labs/contracts/siwe-eip712-demo";

const contracts = {
  demoERC20: {
    address: demoERC20Address,
    abi: demoERC20Abi,
  },
  tokenFaucet: {
    address: tokenFaucetAddress,
    abi: tokenFaucetAbi,
  },
  signedOrderBook: {
    address: signedOrderBookAddress,
    abi: signedOrderBookAbi,
  },
} as const;

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
