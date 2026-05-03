"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileJson,
  Loader2,
  RadioTower,
  UploadCloud,
  Wallet,
} from "lucide-react";
import type {
  TokenLaunchProgressItem,
  TokenLaunchStep,
} from "@/lib/token-launch/types";

type TokenLaunchProgressProps = {
  step: TokenLaunchStep;
  errorMessage?: string | null;
  txHash?: string | null;
  metadataURI?: string | null;
};

const stepOrder: TokenLaunchStep[] = [
  "logo_uploading",
  "metadata_building",
  "metadata_uploading",
  "wallet_confirming",
  "tx_pending",
  "tx_confirming",
  "success",
];

const stepMeta: Record<
  TokenLaunchStep,
  {
    label: string;
    description: string;
    activeDescription: string;
    icon: "upload" | "json" | "wallet" | "radio" | "success";
  }
> = {
  idle: {
    label: "Ready",
    description: "Fill the form and choose a logo to launch.",
    activeDescription: "Ready to launch.",
    icon: "upload",
  },
  logo_uploading: {
    label: "Logo upload",
    description: "Logo will be pinned to IPFS.",
    activeDescription: "Uploading logo to IPFS...",
    icon: "upload",
  },
  metadata_building: {
    label: "Build metadata",
    description: "Token metadata JSON will be generated.",
    activeDescription: "Building token metadata...",
    icon: "json",
  },
  metadata_uploading: {
    label: "Metadata upload",
    description: "Metadata JSON will be pinned to IPFS.",
    activeDescription: "Uploading metadata JSON to IPFS...",
    icon: "json",
  },
  wallet_confirming: {
    label: "Wallet confirmation",
    description: "Wallet signature is required.",
    activeDescription: "Waiting for wallet confirmation...",
    icon: "wallet",
  },
  tx_pending: {
    label: "Transaction submitted",
    description: "Transaction hash received.",
    activeDescription: "Transaction submitted. Waiting for confirmation...",
    icon: "radio",
  },
  tx_confirming: {
    label: "Receipt confirmation",
    description: "Waiting for transaction receipt.",
    activeDescription: "Waiting for transaction receipt...",
    icon: "radio",
  },
  success: {
    label: "Token launched",
    description: "Token address decoded from chain event.",
    activeDescription: "Token created successfully.",
    icon: "success",
  },
  error: {
    label: "Launch failed",
    description: "A launch step failed.",
    activeDescription: "Token launch failed.",
    icon: "radio",
  },
};

function getProgressItems(
  step: TokenLaunchStep,
): TokenLaunchProgressItem[] {
  const activeIndex = stepOrder.indexOf(step);

  return stepOrder.map((key, index) => {
    const meta = stepMeta[key];
    let status: TokenLaunchProgressItem["status"] = "idle";

    if (step === "error") {
      status = index <= Math.max(activeIndex, 0) ? "error" : "idle";
    } else if (step === "success") {
      status = "done";
    } else if (index < activeIndex) {
      status = "done";
    } else if (index === activeIndex) {
      status = "active";
    }

    return {
      key,
      label: meta.label,
      description:
        status === "active" ? meta.activeDescription : meta.description,
      status,
    };
  });
}

export function TokenLaunchProgress({
  step,
  errorMessage,
  txHash,
  metadataURI,
}: TokenLaunchProgressProps) {
  const items = getProgressItems(step);
  const currentMeta = stepMeta[step];

  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 p-4 shadow-2xl shadow-black/20">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">
            Launch Progress
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            {step === "idle"
              ? currentMeta.description
              : currentMeta.activeDescription}
          </p>
        </div>
        <StatusPill step={step} />
      </div>

      <div className="grid gap-3">
        {items.map((item) => (
          <div
            key={item.key}
            className={`flex gap-3 rounded-xl border p-3 transition ${
              item.status === "active"
                ? "border-blue-500/30 bg-blue-500/10"
                : item.status === "done"
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : item.status === "error"
                    ? "border-red-500/30 bg-red-500/10"
                    : "border-white/10 bg-gray-950/70"
            }`}
          >
            <StepIcon item={item} />
            <div className="min-w-0">
              <div className="text-sm font-medium text-white">
                {item.label}
              </div>
              <div className="mt-1 text-xs text-gray-400">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {(txHash || metadataURI || errorMessage) && (
        <div className="mt-4 grid gap-2 rounded-xl border border-white/10 bg-gray-950 p-3 text-xs">
          {metadataURI ? (
            <InfoRow label="Metadata URI" value={metadataURI} />
          ) : null}
          {txHash ? <InfoRow label="Tx Hash" value={txHash} /> : null}
          {errorMessage ? (
            <div className="flex gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="break-words">{errorMessage}</span>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

function StepIcon({ item }: { item: TokenLaunchProgressItem }) {
  if (item.status === "active") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-200">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (item.status === "done") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200">
        <CheckCircle2 className="h-4 w-4" />
      </div>
    );
  }

  if (item.status === "error") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-200">
        <AlertCircle className="h-4 w-4" />
      </div>
    );
  }

  const iconClass = "h-4 w-4";
  const meta = stepMeta[item.key];

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-gray-500">
      {meta.icon === "upload" ? <UploadCloud className={iconClass} /> : null}
      {meta.icon === "json" ? <FileJson className={iconClass} /> : null}
      {meta.icon === "wallet" ? <Wallet className={iconClass} /> : null}
      {meta.icon === "radio" ? <RadioTower className={iconClass} /> : null}
      {meta.icon === "success" ? <CheckCircle2 className={iconClass} /> : null}
    </div>
  );
}

function StatusPill({ step }: { step: TokenLaunchStep }) {
  const className =
    step === "success"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
      : step === "error"
        ? "border-red-500/30 bg-red-500/10 text-red-100"
        : step === "idle"
          ? "border-white/10 bg-white/5 text-gray-300"
          : "border-blue-500/30 bg-blue-500/10 text-blue-100";

  return (
    <div className={`rounded-full border px-3 py-1 text-xs ${className}`}>
      {step.replaceAll("_", " ")}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] px-3 py-2 text-gray-300">
      <div className="mb-1 text-[11px] font-medium uppercase text-gray-500">
        {label}
      </div>
      <div className="break-all font-mono text-xs leading-relaxed text-gray-100">
        {value}
      </div>
    </div>
  );
}
