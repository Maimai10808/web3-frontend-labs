"use client";

import type { ReactNode } from "react";
import {
  Activity,
  BadgeCheck,
  Layers3,
  Link2,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@web3-frontend-labs/ui";

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

type SupportedNamespace = "evm" | "solana" | "btc" | "sei" | "ton";

function isSupportedNamespace(value: string): value is SupportedNamespace {
  return (
    value === "evm" ||
    value === "solana" ||
    value === "btc" ||
    value === "sei" ||
    value === "ton"
  );
}

export function MultichainOverview({ unifiedWallet }: MultichainOverviewProps) {
  const account = unifiedWallet.account;
  const activeNamespace = account?.namespace ?? "disconnected";

  const t = useTranslations("multichainDemo.overview");
  const common = useTranslations("multichainDemo.common");
  const ecosystemT = useTranslations("multichainDemo.ecosystem");

  const statusLabel =
    unifiedWallet.status === "idle"
      ? common("idle")
      : unifiedWallet.status === "connecting"
        ? common("connecting")
        : unifiedWallet.status === "connected"
          ? common("connected")
          : unifiedWallet.status === "error"
            ? common("error")
            : common("disconnected");

  const activeNamespaceLabel =
    activeNamespace === "disconnected"
      ? common("disconnected")
      : isSupportedNamespace(activeNamespace)
        ? ecosystemT(activeNamespace)
        : activeNamespace;

  const accountNamespaceLabel = account?.namespace
    ? isSupportedNamespace(account.namespace)
      ? ecosystemT(account.namespace)
      : account.namespace
    : common("notAvailable");

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-sm">
      <div className="relative border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.25),transparent_36%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_34%)] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-blue-200">
              <Layers3 className="size-3.5" />
              {t("eyebrow")}
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t("title")}
            </h1>

            <p className="mt-3 max-w-220 text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
              {t("description")}
            </p>
          </div>

          <div className="shrink-0 lg:pt-1">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-base font-semibold text-white">
                <Activity className="size-4 text-blue-300" />
                {t("sessionTitle")}
              </div>
              <p className="mt-1 text-sm text-slate-400">
                {t("sessionDescription")}
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full border border-white/10 bg-slate-800 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-300">
              {t("active", {
                namespace: activeNamespaceLabel,
              })}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <SessionStat
              label={t("status")}
              value={statusLabel}
              intent={
                unifiedWallet.status === "connected" ? "success" : "default"
              }
            />

            <SessionStat label={t("namespace")} value={accountNamespaceLabel} />

            <SessionStat
              label={t("wallet")}
              value={account?.walletName ?? common("notAvailable")}
            />

            <SessionStat
              label={t("address")}
              value={account?.address ?? common("notAvailable")}
              truncate
            />

            <SessionStat
              label={t("chainId")}
              value={
                account?.chainId
                  ? String(account.chainId)
                  : common("notAvailable")
              }
            />

            <SessionStat
              label={t("error")}
              value={unifiedWallet.error ?? common("notAvailable")}
              intent={unifiedWallet.error ? "error" : "default"}
              truncate
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
          <div className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
            <ShieldCheck className="size-4 text-emerald-300" />
            {t("talkingPointsTitle")}
          </div>

          <div className="grid gap-3">
            <TalkingPoint
              icon={<Layers3 className="size-4" />}
              title={t("point1Title")}
              description={t("point1Description")}
            />

            <TalkingPoint
              icon={<Link2 className="size-4" />}
              title={t("point2Title")}
              description={t("point2Description")}
            />

            <TalkingPoint
              icon={<BadgeCheck className="size-4" />}
              title={t("point3Title")}
              description={t("point3Description")}
            />

            <TalkingPoint
              icon={<ShieldCheck className="size-4" />}
              title={t("point4Title")}
              description={t("point4Description")}
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
  icon: ReactNode;
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
