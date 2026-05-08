"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { Web3WalletProvider } from "@web3-frontend-labs/wallet";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <Web3WalletProvider>{children}</Web3WalletProvider>
    </SessionProvider>
  );
}
