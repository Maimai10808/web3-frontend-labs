type ReferralStore = Map<string, Set<string>>;

type ReferralStatsInput = {
  address: string;
  referralLink: string;
};

type ReferralRecordInput = {
  inviter: string;
  refereeId: string;
};

declare global {
  var __airdropGrowthReferralStore: ReferralStore | undefined;
}

function getReferralStore() {
  globalThis.__airdropGrowthReferralStore ??= new Map<string, Set<string>>();
  return globalThis.__airdropGrowthReferralStore;
}

function normalizeAddress(address: string) {
  return address.toLowerCase();
}

function getMockBaselineInvitedCount(address: string) {
  const seed = Number.parseInt(address.slice(2, 10), 16);
  return (seed % 8) + 1;
}

export function recordReferralVisit({
  inviter,
  refereeId,
}: ReferralRecordInput) {
  const normalizedInviter = normalizeAddress(inviter);
  const normalizedReferee = refereeId.toLowerCase();

  if (normalizedInviter === normalizedReferee) {
    return {
      recorded: false,
    };
  }

  const store = getReferralStore();
  const referees = store.get(normalizedInviter) ?? new Set<string>();
  const previousSize = referees.size;

  referees.add(normalizedReferee);
  store.set(normalizedInviter, referees);

  return {
    recorded: referees.size > previousSize,
  };
}

export function buildReferralStats({
  address,
  referralLink,
}: ReferralStatsInput) {
  const normalizedAddress = normalizeAddress(address);
  const recordedInvites = getReferralStore().get(normalizedAddress)?.size ?? 0;
  const invitedCount = getMockBaselineInvitedCount(address) + recordedInvites;
  const referralPoints = invitedCount * 75;
  const seed = Number.parseInt(address.slice(2, 10), 16);
  const rewardMultiplier = 1 + ((seed % 4) + 1) * 0.05;

  return {
    address,
    referralCode: address,
    referralLink,
    invitedCount,
    referralPoints,
    rewardMultiplier: Number(rewardMultiplier.toFixed(2)),
  };
}
