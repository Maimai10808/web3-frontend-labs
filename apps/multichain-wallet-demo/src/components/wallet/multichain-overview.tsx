"use client";

import {
  Activity,
  BadgeCheck,
  Layers3,
  Link2,
  ShieldCheck,
} from "lucide-react";

type UnifiedWalletAccount = {
  namespace?: string;
  walletName?: string;
  address?: string;
  chainId?: string | number;
};

type UnifiedWallet = {
  status: string;
  account?: UnifiedWalletAccount | null;
  error?: string | null;
};

type MultichainOverviewProps = {
  unifiedWallet: UnifiedWallet;
};

export function MultichainOverview({ unifiedWallet }: MultichainOverviewProps) {
  const account = unifiedWallet.account;
  const activeNamespace = account?.namespace ?? "disconnected";

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-sm">
      <div className="relative border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.25),transparent_36%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_34%)] p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-blue-200">
            <Layers3 className="size-3.5" />
            Multichain Wallet Lab
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            multichain-wallet-demo
          </h1>

          <p className="mt-3 max-w-[880px] text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
            这个 Demo 展示的是多链钱包接入的工程抽象。重点不是“连上钱包”，
            而是把连接、网络识别、签名适配、交易适配、账户绑定和错误归一拆成可维护的前端链路。
          </p>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-base font-semibold text-white">
                <Activity className="size-4 text-blue-300" />
                Current Wallet Session
              </div>
              <p className="mt-1 text-sm text-slate-400">
                当前统一钱包状态。页面只消费标准化后的 account、chain、wallet 和
                error。
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full border border-white/10 bg-slate-800 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-300">
              Active: {activeNamespace}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <SessionStat
              label="Status"
              value={unifiedWallet.status}
              intent={
                unifiedWallet.status === "connected" ? "success" : "default"
              }
            />

            <SessionStat label="Namespace" value={account?.namespace ?? "-"} />

            <SessionStat label="Wallet" value={account?.walletName ?? "-"} />

            <SessionStat
              label="Address"
              value={account?.address ?? "-"}
              truncate
            />

            <SessionStat
              label="Chain ID"
              value={account?.chainId ? String(account.chainId) : "-"}
            />

            <SessionStat
              label="Error"
              value={unifiedWallet.error ?? "-"}
              intent={unifiedWallet.error ? "error" : "default"}
              truncate
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
          <div className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
            <ShieldCheck className="size-4 text-emerald-300" />
            Interview Talking Points
          </div>

          <div className="grid gap-3">
            <TalkingPoint
              icon={<Layers3 className="size-4" />}
              title="多链不是加 chainId"
              description="EVM、Solana、BTC、Sei 的账户模型、签名模型、交易模型都不同。"
            />

            <TalkingPoint
              icon={<Link2 className="size-4" />}
              title="页面不直接处理链逻辑"
              description="页面通过 WalletAdapter 消费统一能力，不关心底层 SDK 的差异。"
            />

            <TalkingPoint
              icon={<BadgeCheck className="size-4" />}
              title="连接态和业务绑定态分离"
              description="钱包连接成功不等于业务账号绑定完成，这两层状态需要独立建模。"
            />

            <TalkingPoint
              icon={<ShieldCheck className="size-4" />}
              title="错误需要统一归一"
              description="不同钱包 SDK 的原始报错应统一成 MultiChainError，避免 UI 到处写分支。"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function SessionStat(props: {
  label: string;
  value: string;
  truncate?: boolean;
  intent?: "default" | "success" | "error";
}) {
  const valueClassName =
    props.intent === "success"
      ? "text-emerald-300"
      : props.intent === "error"
        ? "text-rose-300"
        : "text-white";

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        {props.label}
      </div>
      <div
        className={`mt-2 text-sm font-semibold ${valueClassName} ${
          props.truncate ? "truncate" : ""
        }`}
        title={props.value}
      >
        {props.value}
      </div>
    </div>
  );
}

function TalkingPoint(props: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl border border-blue-400/20 bg-blue-400/10 p-2 text-blue-200">
          {props.icon}
        </div>

        <div>
          <div className="text-sm font-semibold text-white">{props.title}</div>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            {props.description}
          </p>
        </div>
      </div>
    </div>
  );
}
