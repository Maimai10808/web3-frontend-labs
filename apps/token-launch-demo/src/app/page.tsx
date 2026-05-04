import { WalletStatusPanel } from "@/components/token-launch/wallet-status-panel";
import { TokenLaunchDemoShell } from "@/components/token-launch-demo-shell";

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-950 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white">
            Token Launch Demo
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            This demo extracts the token launch flow from a real production
            project: form validation, logo upload, metadata upload, contract
            creation, and on-chain token info reading.
          </p>
        </div>

        <WalletStatusPanel />
        <TokenLaunchDemoShell />
      </div>
    </main>
  );
}
