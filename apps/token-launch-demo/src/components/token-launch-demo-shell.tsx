"use client";

import { useState } from "react";
import {
  DemoModeSelector,
  type DemoMode,
} from "@/components/demo-mode-selector";
import { NftLaunchSection } from "@/components/nft-launch/nft-launch-section";
import { TokenLaunchSection } from "@/components/token-launch/token-launch-section";

export function TokenLaunchDemoShell() {
  const [demoMode, setDemoMode] = useState<DemoMode>("token-launch");

  return (
    <>
      <DemoModeSelector value={demoMode} onValueChange={setDemoMode} />

      {demoMode === "token-launch" ? (
        <TokenLaunchSection />
      ) : (
        <NftLaunchSection />
      )}
    </>
  );
}
