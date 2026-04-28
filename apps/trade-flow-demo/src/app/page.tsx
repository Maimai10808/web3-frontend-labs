import { LogPanel } from "@/components/trade/log-panel";
import { OrderTable } from "@/components/trade/order-table";
import { TradeForm } from "@/components/trade/trade-form";
import { TradeHero } from "@/components/trade/trade-hero";

export default function Home() {
  const mockAccount = "0x0000000000000000000000000000000000000001";

  return (
    <main className="trade-shell mx-auto w-full max-w-[860px] px-4 py-8 sm:px-6 lg:py-12">
      <div className="trade-grid-glow rounded-[2.25rem] border border-white/45 bg-white/34 p-4 shadow-[0_36px_100px_-58px_rgba(108,91,69,0.44)] backdrop-blur-sm sm:p-6 lg:p-7">
        <section className="grid gap-6 xl:gap-7">
          <TradeHero />
          <TradeForm account={mockAccount} />
        </section>

        <section className="mt-6 grid gap-6 xl:gap-7">
          <OrderTable account={mockAccount} />
          <LogPanel />
        </section>
      </div>
    </main>
  );
}
