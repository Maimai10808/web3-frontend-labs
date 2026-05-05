export const AIRDROP_GROWTH_CAMPAIGN_ID = "airdrop-growth-season-1";

export const AIRDROP_GROWTH_CAMPAIGN_TITLE = "Airdrop Growth Season 1";

export const AIRDROP_GROWTH_REWARD_TYPE = "erc20" as const;

export const AIRDROP_GROWTH_POINTS_THRESHOLD = 300;

export const AIRDROP_GROWTH_CLAIM_DEADLINE = new Date(
  "2026-12-31T23:59:59.000Z",
).getTime();

export const AIRDROP_GROWTH_SIGN_MESSAGE =
  "Sign this message to verify your wallet for Airdrop Growth Season 1.";

export const AIRDROP_GROWTH_CAMPAIGN_STATE = {
  campaignId: AIRDROP_GROWTH_CAMPAIGN_ID,
  title: AIRDROP_GROWTH_CAMPAIGN_TITLE,
  rewardType: AIRDROP_GROWTH_REWARD_TYPE,
  pointsThreshold: AIRDROP_GROWTH_POINTS_THRESHOLD,
  claimDeadline: AIRDROP_GROWTH_CLAIM_DEADLINE,
} as const;
