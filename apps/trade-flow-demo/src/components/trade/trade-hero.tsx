import { Activity, ArrowRightLeft, ShieldCheck } from "lucide-react";

export function TradeHero() {
  return (
    <div className="space-y-6 text-center lg:space-y-8">
      <div className="space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-white/76 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-600 shadow-sm backdrop-blur">
          <Activity className="size-3.5" />
          Trade Flow Demo
        </div>

        <div className="space-y-4">
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-slate-800 sm:text-5xl xl:text-[3.35rem] xl:leading-[1.06]">
            Build, sign, and submit a mock limit order like a real trading
            client.
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            This panel stops pretending that trade submission equals final
            execution. You validate inputs, encode business params, prepare an
            operation, sign it, and hand off the order to the backend.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <FeatureCard
          icon={<ArrowRightLeft className="size-4" />}
          title="Operation First"
          description="Business params are encoded before signing and submission."
          tone="trade-tint-peach"
        />

        <FeatureCard
          icon={<ShieldCheck className="size-4" />}
          title="Signature Separated"
          description="The signer produces an intent proof, not the final order state."
          tone="trade-tint-mint"
        />

        <FeatureCard
          icon={<Activity className="size-4" />}
          title="State Keeps Moving"
          description="Mutation success is only the start. Matching and fills arrive later."
          tone="trade-tint-sky"
        />
      </div>
    </div>
  );
}

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone: string;
};

function FeatureCard({ icon, title, description, tone }: FeatureCardProps) {
  return (
    <div
      className={`trade-soft-card ${tone} rounded-[1.6rem] p-5 text-left backdrop-blur`}
    >
      <div className="mb-3 inline-flex rounded-2xl border border-white/45 bg-white/70 p-2.5 text-slate-700 shadow-sm">
        {icon}
      </div>

      <div className="text-sm font-semibold text-slate-800">{title}</div>

      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
