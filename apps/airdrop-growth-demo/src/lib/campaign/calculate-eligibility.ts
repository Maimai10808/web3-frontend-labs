import type { ClaimStatus, EligibilityResult, GrowthTask } from "./types";
import { calculatePoints } from "./calculate-points";

type CalculateEligibilityInput = {
  tasks: GrowthTask[];
  pointsThreshold: number;
  claimDeadline: number;
  hasClaimed?: boolean;
  now?: number;
};

export function calculateEligibility({
  tasks,
  pointsThreshold,
  claimDeadline,
  hasClaimed = false,
  now = Date.now(),
}: CalculateEligibilityInput): EligibilityResult {
  const totalPoints = calculatePoints(tasks);

  let claimStatus: ClaimStatus;
  let qualified = false;
  let reason: string | undefined;

  if (hasClaimed) {
    claimStatus = "claimed";
    qualified = true;
    reason = "Reward already claimed.";
  } else if (now > claimDeadline) {
    claimStatus = "expired";
    qualified = totalPoints >= pointsThreshold;
    reason = "Campaign claim window has expired.";
  } else if (totalPoints >= pointsThreshold) {
    claimStatus = "claimable";
    qualified = true;
  } else {
    claimStatus = "unqualified";
    qualified = false;
    reason = `You need ${pointsThreshold - totalPoints} more points to claim.`;
  }

  return {
    qualified,
    reason,
    totalPoints,
    pointsThreshold,
    claimStatus,
  };
}
