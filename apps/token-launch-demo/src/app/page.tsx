import { WalletStatusPanel } from "@/components/token-launch/wallet-status-panel";
import { TokenLaunchDemoShell } from "@/components/token-launch-demo-shell";

export default function Page() {
  return (
    <main className="min-h-screen bg-[radial-gradient(140%_120%_at_0%_0%,#eef2ff_0%,#f8fafc_45%,#f8fafc_100%),radial-gradient(120%_120%_at_100%_0%,#e2e8f0_0%,transparent_55%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white/75 p-6 shadow-sm backdrop-blur-sm">
          <h1 className="text-3xl font-semibold text-slate-900">
            Token Launch Demo
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
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
