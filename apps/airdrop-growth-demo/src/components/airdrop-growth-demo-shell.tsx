"use client";

import { ClaimRewardCard } from "@/components/claim/claim-reward-card";
import { ClaimStatusCard } from "@/components/campaign/claim-status-card";
import { EligibilityCard } from "@/components/campaign/eligibility-card";
import { WalletStatusPanel } from "@/components/campaign/wallet-status-panel";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { ReferralCard } from "@/components/referral/referral-card";
import { ReferralPointsCard } from "@/components/referral/referral-points-card";
import { EventLog } from "@/components/shared/event-log";
import { TaskList } from "@/components/tasks/task-list";
import { useAirdropGrowthDemo } from "@/hooks/campaign/use-airdrop-growth-demo";

export function AirdropGrowthDemoShell() {
  const {
    wallet,
    tasks,
    eligibility,
    claimStatus,
    claimReward,
    referral,
    leaderboard,
    eventLog,
  } = useAirdropGrowthDemo();

  return (
    <div className="grid gap-6">
      <WalletStatusPanel />

      <TaskList
        walletAddress={wallet.address}
        onTasksChange={tasks.setTasks}
        onSignMessage={tasks.handleSignMessage}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <EligibilityCard
          eligibility={eligibility.data}
          isLoading={eligibility.isLoading}
          errorMessage={eligibility.errorMessage}
        />

        <ClaimStatusCard
          claimStatus={claimStatus.data}
          isLoading={claimStatus.isLoading}
          errorMessage={claimStatus.errorMessage}
        />
      </div>

      <ClaimRewardCard
        claimStatus={claimStatus.data}
        onClaim={claimReward.handleClaimReward}
        result={claimReward.result}
        isClaiming={claimReward.isClaiming}
        errorMessage={claimReward.errorMessage}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ReferralCard
          referralLink={referral.link}
          isLoading={referral.isLoading}
          errorMessage={referral.errorMessage}
        />

        <ReferralPointsCard
          referralStats={referral.stats}
          isLoading={referral.isLoading}
          errorMessage={referral.errorMessage}
        />
      </div>

      <LeaderboardTable
        items={leaderboard.items}
        isLoading={leaderboard.isLoading}
        errorMessage={leaderboard.errorMessage}
      />

      <EventLog entries={eventLog.entries} />
    </div>
  );
}
