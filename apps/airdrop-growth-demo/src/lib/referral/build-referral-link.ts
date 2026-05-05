import type { Address } from "viem";

type BuildReferralLinkParams = {
  origin: string;
  pathname?: string;
  address: Address;
};

export function buildReferralLink({
  origin,
  pathname = "/",
  address,
}: BuildReferralLinkParams): string {
  const url = new URL(pathname, origin);
  url.searchParams.set("ref", address);

  return url.toString();
}
