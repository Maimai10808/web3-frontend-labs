// src/components/SiweStatus.tsx

"use client";

import { signOut } from "next-auth/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSiweStatusViewModel } from "../hooks/useSiweStatusViewModel";

export function SiweStatus() {
  const { wallet, auth } = useSiweStatusViewModel();
  const statusCards = [
    ["Connected", wallet.isConnected ? "Yes" : "No"],
    ["Address", wallet.address ?? "Not connected"],
    ["Short address", wallet.shortAddress],
    ["Chain ID", wallet.chainId ?? "N/A"],
  ];
  const authCards = [
    ["Session status", auth.status],
    ["Authenticated address", auth.sessionAddress ?? "Not signed in"],
    ["Auth state", auth.isSignedIn ? "Signed in" : "Signed out"],
  ];

  return (
    <section className="islamic-card mx-auto w-full max-w-2xl rounded-xl border-2 border-[#c9a74e] p-8 shadow-[0_8px_24px_rgba(201,167,78,0.2)]">
      <div className="relative z-10">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg border-2 border-[#c9a74e] bg-[#1a3a5c] shadow-[0_4px_12px_rgba(201,167,78,0.15)]">
            <div className="islamic-starburst h-7 w-7 bg-[#c9a74e]" />
          </div>
          <div className="islamic-kicker mt-5 font-sans text-xs font-semibold text-[#c9a74e] md:text-sm">
            Identity Chamber
          </div>
          <h1 className="mt-4 font-sans text-3xl font-semibold tracking-wide text-[#1a3a5c] md:text-5xl">
            SIWE Session Portal
          </h1>
          <p className="mt-3 font-sans text-sm leading-7 text-[#1a3a5c]/76 md:text-base">
            Connect wallet, complete Sign-In with Ethereum, and inspect the
            live session state inside an ornamental status panel.
          </p>
        </div>

        <div className="mb-8 flex justify-center rounded-xl border-2 border-[#c9a74e] bg-[#1a3a5c]/95 px-4 py-5 shadow-[0_4px_12px_rgba(201,167,78,0.15)]">
          <ConnectButton />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border-2 border-[#c9a74e] bg-[#fff9ea] p-8 shadow-[0_4px_12px_rgba(201,167,78,0.15)]">
            <h2 className="mb-4 font-sans text-lg font-semibold tracking-wide text-[#1a3a5c] md:text-xl">
              Wallet State
            </h2>
            <div className="islamic-divider" />
            <div className="mt-5 space-y-3">
              {statusCards.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border-2 border-[#c9a74e] bg-[#f5ecd7] p-4 shadow-[0_2px_4px_rgba(201,167,78,0.1)]"
                >
                  <div className="font-sans text-xs font-semibold tracking-[0.2em] text-[#c9a74e] md:text-sm">
                    {label}
                  </div>
                  <div className="mt-2 break-all font-sans text-sm tracking-wide text-[#1a3a5c] md:text-base">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border-2 border-[#c9a74e] bg-[#fff9ea] p-8 shadow-[0_4px_12px_rgba(201,167,78,0.15)]">
            <h2 className="mb-4 font-sans text-lg font-semibold tracking-wide text-[#1a3a5c] md:text-xl">
              Auth Session
            </h2>
            <div className="islamic-divider" />
            <div className="mt-5 space-y-3">
              {authCards.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border-2 border-[#c9a74e] bg-[#f5ecd7] p-4 shadow-[0_2px_4px_rgba(201,167,78,0.1)]"
                >
                  <div className="font-sans text-xs font-semibold tracking-[0.2em] text-[#c9a74e] md:text-sm">
                    {label}
                  </div>
                  <div className="mt-2 break-all font-sans text-sm tracking-wide text-[#1a3a5c] md:text-base">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {auth.isSignedIn && (
              <div className="mt-5">
                <button
                  onClick={() => signOut()}
                  className="w-full rounded-lg border-2 border-[#c9a74e] bg-[#1a3a5c] px-4 py-3 font-sans text-sm font-semibold tracking-wider text-[#f5ecd7] transition-all duration-300 ease-in-out active:opacity-80 hover:shadow-[0_6px_20px_rgba(201,167,78,0.25)] focus:shadow-[0_0_0_3px_rgba(201,167,78,0.15)]"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
