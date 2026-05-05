import type { Address } from "viem";
import type { GrowthTask, GrowthTaskDefinition } from "@/lib/campaign/types";

export const TASK_DEFINITIONS: GrowthTaskDefinition[] = [
  {
    id: "connect-wallet",
    type: "connect_wallet",
    title: "Connect Wallet",
    description: "Connect your wallet to activate campaign participation.",
    points: 100,
    verifyLabel: "Check Wallet",
    verifyMode: "frontend_wallet",
  },
  {
    id: "sign-message",
    type: "sign_message",
    title: "Sign Message",
    description: "Sign a campaign message to verify wallet ownership.",
    points: 150,
    verifyLabel: "Sign Message",
    verifyMode: "wallet_signature",
  },
  {
    id: "follow-x",
    type: "follow",
    title: "Follow on X",
    description: "Follow the campaign account on X to unlock growth points.",
    points: 120,
    verifyLabel: "Verify Follow",
    verifyMode: "mock_api",
    href: "https://x.com",
  },
  {
    id: "join-discord",
    type: "join",
    title: "Join Community",
    description: "Join the community channel to complete the social task.",
    points: 120,
    verifyLabel: "Verify Join",
    verifyMode: "mock_api",
    href: "https://discord.com",
  },
  {
    id: "visit-website",
    type: "visit_website",
    title: "Visit Website",
    description: "Visit the campaign site and verify the growth touchpoint.",
    points: 80,
    verifyLabel: "Verify Visit",
    verifyMode: "mock_api",
    href: "https://example.com",
  },
];

export function buildInitialTaskList(walletAddress?: Address): GrowthTask[] {
  return TASK_DEFINITIONS.map((task) => {
    if (task.type === "connect_wallet" && walletAddress) {
      return {
        ...task,
        status: "verified",
        verifiedAt: Date.now(),
      };
    }

    return {
      ...task,
      status: "ready",
    };
  });
}
