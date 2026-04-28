"use client";

import { useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";

import { DemoNFTAbi, contractAddresses } from "@web3-frontend-labs/contracts";

const demoNftAddress = contractAddresses.DemoNFT;

function shortenAddress(address?: string) {
  if (!address) return "-";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function normalizeIpfsUri(uri?: string) {
  if (!uri) return "-";

  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  return uri;
}

export function NftDemoCard() {
  const { address, isConnected } = useAccount();

  const { data: name, isLoading: isNameLoading } = useReadContract({
    address: demoNftAddress,
    abi: DemoNFTAbi,
    functionName: "name",
  });

  const { data: symbol, isLoading: isSymbolLoading } = useReadContract({
    address: demoNftAddress,
    abi: DemoNFTAbi,
    functionName: "symbol",
  });

  const { data: nextTokenId, isLoading: isNextTokenIdLoading } =
    useReadContract({
      address: demoNftAddress,
      abi: DemoNFTAbi,
      functionName: "nextTokenId",
    });

  const { data: tokenZeroOwner, isLoading: isOwnerLoading } = useReadContract({
    address: demoNftAddress,
    abi: DemoNFTAbi,
    functionName: "ownerOf",
    args: [BigInt(0)],
  });

  const { data: tokenZeroUri, isLoading: isTokenUriLoading } = useReadContract({
    address: demoNftAddress,
    abi: DemoNFTAbi,
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  const { data: connectedWalletBalance, isLoading: isBalanceLoading } =
    useReadContract({
      address: demoNftAddress,
      abi: DemoNFTAbi,
      functionName: "balanceOf",
      args: address ? [address] : undefined,
      query: {
        enabled: Boolean(address),
      },
    });

  const mintedCount = useMemo(() => {
    if (typeof nextTokenId === "bigint") {
      return nextTokenId.toString();
    }

    return "-";
  }, [nextTokenId]);

  const readableTokenUri = normalizeIpfsUri(tokenZeroUri as string | undefined);

  return (
    <section className="rounded-2xl border bg-background p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">NFT Demo</h2>
          <p className="text-sm text-muted-foreground">
            Read ERC721 contract data from the local deployment.
          </p>
        </div>

        <div className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
          Local chain · 31337
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InfoItem
          label="Contract address"
          value={shortenAddress(demoNftAddress)}
          rawValue={demoNftAddress}
        />

        <InfoItem
          label="Connected wallet"
          value={isConnected ? shortenAddress(address) : "Not connected"}
          rawValue={address}
        />

        <InfoItem
          label="NFT name"
          value={isNameLoading ? "Loading..." : String(name ?? "-")}
        />

        <InfoItem
          label="NFT symbol"
          value={isSymbolLoading ? "Loading..." : String(symbol ?? "-")}
        />

        <InfoItem
          label="Minted count"
          value={isNextTokenIdLoading ? "Loading..." : mintedCount}
        />

        <InfoItem
          label="Your NFT balance"
          value={
            !isConnected
              ? "Connect wallet first"
              : isBalanceLoading
                ? "Loading..."
                : String(connectedWalletBalance ?? "0")
          }
        />

        <InfoItem
          label="Token #0 owner"
          value={isOwnerLoading ? "Loading..." : shortenAddress(tokenZeroOwner)}
          rawValue={tokenZeroOwner as string | undefined}
        />

        <InfoItem
          label="Token #0 URI"
          value={isTokenUriLoading ? "Loading..." : readableTokenUri}
          rawValue={tokenZeroUri as string | undefined}
          className="sm:col-span-2"
        />
      </div>
    </section>
  );
}

function InfoItem({
  label,
  value,
  rawValue,
  className,
}: {
  label: string;
  value: string;
  rawValue?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border bg-muted/30 p-4 ${className ?? ""}`}>
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>

      <div className="break-all text-sm font-medium">{value}</div>

      {rawValue && rawValue !== value ? (
        <div className="mt-2 break-all text-xs text-muted-foreground">
          {rawValue}
        </div>
      ) : null}
    </div>
  );
}
