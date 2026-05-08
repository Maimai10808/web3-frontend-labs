import {
  demoERC20Abi,
  demoERC20Address,
  tokenFaucetAbi,
  tokenFaucetAddress,
  signedOrderBookAbi,
  signedOrderBookAddress,
  signedOrderDemoDeploymentMeta as deploymentMeta,
} from "@web3-frontend-labs/contracts/siwe-eip712-demo";

export const contracts = {
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

export { deploymentMeta };
