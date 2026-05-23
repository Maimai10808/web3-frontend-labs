import { TradingViewChart } from '@/components/tradingview/trading-view-chart';

export default function Page() {
  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <h1 className="mb-6 text-2xl font-semibold">
        TradingView Symbol Overview Demo
      </h1>

      <TradingViewChart />
    </main>
  );
}
