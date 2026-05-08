import { EventsPanel, TerminalPanel } from "@/components/trade/log-panel";
import { OrderTable } from "@/components/trade/order-table";
import { TradeForm } from "@/components/trade/trade-form";
import { TradeHero } from "@/components/trade/trade-hero";
import { WalletStatus } from "@/components/wallet/wallet-status";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <TradeHero />

        <section className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              Wallet / Network / Contract Summary
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Verify wallet connectivity and contract readiness before placing orders.
            </p>
          </div>
          <WalletStatus />
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              Limit Order Ticket
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Main trade operation area for signing and submitting limit orders.
            </p>
          </div>
          <TradeForm />
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              Order Monitor
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Track order state, status transitions, and latest on-chain updates.
            </p>
          </div>
          <OrderTable />
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              Terminal / Events
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Separate execution output from contract event feeds.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <TerminalPanel />
            <EventsPanel />
          </div>
        </section>
      </div>
    </main>
  );
}
