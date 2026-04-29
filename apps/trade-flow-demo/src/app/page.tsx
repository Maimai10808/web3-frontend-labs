import { LogPanel } from "@/components/trade/log-panel";
import { OrderTable } from "@/components/trade/order-table";
import { TradeForm } from "@/components/trade/trade-form";
import { TradeHero } from "@/components/trade/trade-hero";
import { WalletStatus } from "@/components/wallet/wallet-status";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <TradeHero />

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <TradeForm />
          </div>

          <div className="space-y-6 xl:col-span-7">
            <WalletStatus />
            <LogPanel />
          </div>
        </section>

        <section className="mt-6">
          <OrderTable />
        </section>
      </div>
    </main>
  );
}
