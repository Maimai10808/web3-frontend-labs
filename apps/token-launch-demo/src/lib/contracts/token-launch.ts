import type { Address } from "viem";

const publicEnv = {
  NEXT_PUBLIC_TOKEN_LAUNCH_CHAIN_ID:
    process.env.NEXT_PUBLIC_TOKEN_LAUNCH_CHAIN_ID,
  NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS:
    process.env.NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS,
  NEXT_PUBLIC_TOKEN_FACTORY_DEPLOY_TX_HASH:
    process.env.NEXT_PUBLIC_TOKEN_FACTORY_DEPLOY_TX_HASH,
};

function getRequiredPublicEnv(name: keyof typeof publicEnv): string {
  const value = publicEnv[name];

  if (!value) {
    throw new Error(`Missing required public env: ${name}`);
  }

  return value;
}

export const tokenLaunchChainId = Number(
  getRequiredPublicEnv("NEXT_PUBLIC_TOKEN_LAUNCH_CHAIN_ID"),
);

export const tokenFactoryAddress = getRequiredPublicEnv(
  "NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS",
) as Address;

export const tokenFactoryDeployTxHash =
  publicEnv.NEXT_PUBLIC_TOKEN_FACTORY_DEPLOY_TX_HASH ?? null;

export const tokenLaunchedEventName = "TokenLaunched";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getTokenLaunchExplorerTxUrl(txHash: string): string | null {
  if (tokenLaunchChainId === 31337) {
    return null;
  }

  return null;
}
