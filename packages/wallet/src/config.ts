import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { hardhat, localhost, sepolia } from "wagmi/chains";

export const defaultChain = localhost;

export const walletConfig = getDefaultConfig({
  appName: "Web3 Frontend Labs",
  projectId: "9b708e7d4ec71a89d6840a18c6e225c9",
  chains: [localhost, hardhat, sepolia],
  ssr: true,
});
