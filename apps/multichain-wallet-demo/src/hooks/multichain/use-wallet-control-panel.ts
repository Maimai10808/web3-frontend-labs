"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { useMultichainLogs } from "@/hooks/multichain/use-multichain-logs";
import { useNetworkStatus } from "@/hooks/multichain/use-network-status";
import { useWalletAccount } from "@/hooks/multichain/use-wallet-account";
import { DEFAULT_CHAIN_BY_ECOSYSTEM } from "@/lib/multichain/chains";
import type { ChainNamespace, MultiChainError } from "@/lib/multichain/types";
import { useMultichainDemoStore } from "@/store/multichain-demo-store";

function debugBtc(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.debug("[btc-wallet]", ...args);
  }
}

function debugSei(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.debug("[sei-wallet]", ...args);
  }
}

function debugUnified(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.debug("[unified-wallet]", ...args);
  }
}

function getReadableErrorMessage(
  error: unknown,
  fallbackMessage: string,
) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as MultiChainError).message === "string"
  ) {
    return (error as MultiChainError).message;
  }

  return fallbackMessage;
}

function toChainNamespace(namespace: string): ChainNamespace {
  if (
    namespace === "evm" ||
    namespace === "solana" ||
    namespace === "btc" ||
    namespace === "sei"
  ) {
    return namespace;
  }

  throw new Error(`Unsupported wallet namespace: ${namespace}`);
}

type BasicNetworkStatus =
  | {
      connected?: boolean;
      switchRequired?: boolean;
    }
  | null
  | undefined;

function getStatusLabel(
  status: BasicNetworkStatus,
  messages: {
    walletNotConnected: string;
    wrongNetwork: string;
    ready: string;
  },
) {
  if (!status?.connected) {
    return messages.walletNotConnected;
  }

  if (status.switchRequired) {
    return messages.wrongNetwork;
  }

  return messages.ready;
}

function getStatusClassName(status: BasicNetworkStatus) {
  if (!status?.connected) {
    return "border-slate-700 bg-slate-800 text-slate-300";
  }

  if (status.switchRequired) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-200";
  }

  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
}

export function formatNetworkValue(value?: string | number | null) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return String(value);
}

export function useWalletControlPanel() {
  const t = useTranslations("multichainDemo.walletControl");
  const ecosystemLabels = useTranslations("multichainDemo.ecosystem");
  const walletAccount = useWalletAccount();

  const {
    adapter,
    ecosystem,
    selectedEvmWalletId,
    connectEvmWith,
    selectedSolanaWalletId,
    btcWalletName,
    selectedSeiWallet,
    disconnectAllWallets,
  } = walletAccount;

  const {
    status: networkStatus,
    adapter: networkAdapter,
    refresh,
  } = useNetworkStatus();

  const { pushLog } = useMultichainLogs();

  const unifiedWallet = useMultichainDemoStore((state) => state.unifiedWallet);

  const setUnifiedWalletConnecting = useMultichainDemoStore(
    (state) => state.setUnifiedWalletConnecting,
  );

  const setUnifiedWalletConnected = useMultichainDemoStore(
    (state) => state.setUnifiedWalletConnected,
  );

  const setUnifiedWalletError = useMultichainDemoStore(
    (state) => state.setUnifiedWalletError,
  );

  const resetUnifiedWallet = useMultichainDemoStore(
    (state) => state.resetUnifiedWallet,
  );

  const [isBusy, setIsBusy] = useState(false);

  const currentTarget =
    DEFAULT_CHAIN_BY_ECOSYSTEM[networkStatus?.ecosystem ?? "evm"];

  const statusLabel = getStatusLabel(networkStatus, {
    walletNotConnected: t("statusWalletNotConnected"),
    wrongNetwork: t("statusWrongNetwork"),
    ready: t("statusReady"),
  });
  const statusClassName = getStatusClassName(networkStatus);

  const handleConnect = async () => {
    if (!adapter) return;

    setIsBusy(true);
    setUnifiedWalletConnecting(ecosystem);

    try {
      await disconnectAllWallets(ecosystem);
      debugUnified("disconnect all before connect", ecosystem);

      let connectedAccount = null;

      if (ecosystem === "evm") {
        if (!selectedEvmWalletId) {
          throw new Error(t("errorSelectEvmFirst"));
        }

        debugUnified("selected wallet", selectedEvmWalletId);
        connectedAccount = await connectEvmWith(selectedEvmWalletId);
      } else {
        if (ecosystem === "btc") {
          debugBtc("selected wallet", btcWalletName);
        }

        if (ecosystem === "solana") {
          debugUnified("selected solana wallet", selectedSolanaWalletId);
        }

        if (ecosystem === "sei") {
          debugSei("selected wallet", selectedSeiWallet);
        }

        connectedAccount = await adapter.connect();
      }

      const account = connectedAccount ?? (await adapter.getAccount());

      debugUnified("normalized account", account);

      if (!account) {
        throw new Error(t("errorNoAccountReturned"));
      }

      setUnifiedWalletConnected({
        namespace: toChainNamespace(account.ecosystem),
        walletName: account.providerName,
        address: account.address,
        chainId:
          typeof account.chainId === "number"
            ? String(account.chainId)
            : account.networkId,
      });

      debugUnified("store state after connect", {
        ...unifiedWallet,
        status: "connected",
        account,
      });

      pushLog({
        level: "success",
        title: t("logWalletConnected"),
        message: `${account.providerName} -> ${account.displayAddress}`,
      });

      await refresh();
    } catch (error) {
      const message = getReadableErrorMessage(
        error,
        t("errorUnknownConnection"),
      );

      setUnifiedWalletError(ecosystem, message);

      debugUnified("store state after error", {
        status: "error",
        ecosystem,
        message,
      });

      pushLog({
        level: "error",
        title: t("logConnectFailed"),
        message,
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleDisconnect = async () => {
    if (!adapter) return;

    setIsBusy(true);

    try {
      await adapter.disconnect();
      resetUnifiedWallet();
      await refresh();

      pushLog({
        level: "info",
        title: t("logWalletDisconnected"),
        message: `${ecosystemLabels(ecosystem)} wallet disconnected`,
      });
    } catch (error) {
      const message = getReadableErrorMessage(
        error,
        t("errorUnknownConnection"),
      );

      setUnifiedWalletError(ecosystem, message);

      pushLog({
        level: "error",
        title: t("logDisconnectFailed"),
        message,
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleSwitchNetwork = async () => {
    if (!networkAdapter?.switchNetwork || !networkStatus?.expectedChainId) {
      return;
    }

    await networkAdapter.switchNetwork(networkStatus.expectedChainId);
    await refresh();
  };

  return {
    ...walletAccount,

    isBusy,
    unifiedWallet,

    networkStatus,
    currentTarget,
    statusLabel,
    statusClassName,

    handleConnect,
    handleDisconnect,
    handleSwitchNetwork,
  };
}
