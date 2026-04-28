"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";

import { contractAddresses, MockTokenAbi } from "@web3-frontend-labs/contracts";

import { useReadContract } from "wagmi";

import { defaultChain } from "@web3-frontend-labs/wallet";

export function WalletStatus() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const isExpectedChain = chainId === defaultChain.id;

  const tokenAddress = contractAddresses.MockToken;

  const nameQuery = useReadContract({
    address: tokenAddress,

    abi: MockTokenAbi,

    functionName: "name",
  });

  const symbolQuery = useReadContract({
    address: tokenAddress,

    abi: MockTokenAbi,

    functionName: "symbol",
  });

  const totalSupplyQuery = useReadContract({
    address: tokenAddress,

    abi: MockTokenAbi,

    functionName: "totalSupply",
  });

  return (
    <section className="rounded-2xl border p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Wallet</h2>
          <p className="text-sm text-muted-foreground">
            Connect a wallet and verify the local chain state.
          </p>
        </div>

        <ConnectButton />
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-muted-foreground">Connected: </span>
          <span>{isConnected ? "Yes" : "No"}</span>
        </div>

        <div>
          <span className="text-muted-foreground">Address: </span>
          <span>{address ?? "Not connected"}</span>
        </div>

        <div>
          <span className="text-muted-foreground">Current chain: </span>
          <span>{chainId}</span>
        </div>

        <div>
          <span className="text-muted-foreground">Expected chain: </span>
          <span>{defaultChain.id}</span>
        </div>

        <div>
          <span className="text-muted-foreground">Network status: </span>
          <span>{isExpectedChain ? "Correct network" : "Wrong network"}</span>
        </div>
      </div>

      <section className="rounded-2xl border p-4">
        <h2 className="text-lg font-semibold">Mock Token</h2>

        <div className="mt-4 space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Address: </span>

            <span className="font-mono">{tokenAddress}</span>
          </div>

          <div>
            <span className="text-muted-foreground">Name: </span>

            <span>{String(nameQuery.data ?? "-")}</span>
          </div>

          <div>
            <span className="text-muted-foreground">Symbol: </span>

            <span>{String(symbolQuery.data ?? "-")}</span>
          </div>

          <div>
            <span className="text-muted-foreground">Total Supply: </span>

            <span>{totalSupplyQuery.data?.toString() ?? "-"}</span>
          </div>
        </div>
      </section>
    </section>
  );
}
