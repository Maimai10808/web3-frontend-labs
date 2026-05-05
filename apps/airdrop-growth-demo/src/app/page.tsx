import { AirdropGrowthDemoShell } from "@/components/airdrop-growth-demo-shell";

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-950 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-white">
            Airdrop Growth Demo
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            This demo extracts a Web3 growth workflow from real production
            projects: task verification, points accumulation, eligibility
            checks, referral, leaderboard, and reward claiming.
          </p>
        </header>

        <AirdropGrowthDemoShell />
      </div>
    </main>
  );
}
