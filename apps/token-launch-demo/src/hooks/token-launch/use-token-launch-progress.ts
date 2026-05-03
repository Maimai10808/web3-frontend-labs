import type {
  TokenLaunchProgressItem,
  TokenLaunchStep,
} from "@/lib/token-launch/types";

export type TokenLaunchProgressIcon =
  | "upload"
  | "json"
  | "wallet"
  | "radio"
  | "success";

export type TokenLaunchProgressViewItem = TokenLaunchProgressItem & {
  icon: TokenLaunchProgressIcon;
};

type TokenLaunchProgressMeta = {
  label: string;
  description: string;
  activeDescription: string;
  icon: TokenLaunchProgressIcon;
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

const stepMeta: Record<TokenLaunchStep, TokenLaunchProgressMeta> = {
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
): TokenLaunchProgressViewItem[] {
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
      icon: meta.icon,
      status,
    };
  });
}

export function useTokenLaunchProgress(step: TokenLaunchStep) {
  const currentMeta = stepMeta[step];
  const statusLabel = step.replaceAll("_", " ");
  const statusClass =
    step === "success"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
      : step === "error"
        ? "border-red-500/30 bg-red-500/10 text-red-100"
        : step === "idle"
          ? "border-white/10 bg-white/5 text-gray-300"
          : "border-blue-500/30 bg-blue-500/10 text-blue-100";

  return {
    currentDescription:
      step === "idle" ? currentMeta.description : currentMeta.activeDescription,
    items: getProgressItems(step),
    statusClass,
    statusLabel,
  };
}
