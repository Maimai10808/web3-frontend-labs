"use client";

import { useState } from "react";

import { useMultichainLogs } from "@/hooks/multichain/use-multichain-logs";
import { useNetworkStatus } from "@/hooks/multichain/use-network-status";
import { useWalletAccount } from "@/hooks/multichain/use-wallet-account";
import { DEFAULT_CHAIN_BY_ECOSYSTEM } from "@/lib/multichain/chains";
import type { ChainNamespace, MultiChainError } from "@/lib/multichain/types";
import { useMultichainDemoStore } from "@/store/multichain-demo-store";
import { EcosystemSwitcher } from "./ecosystem-switcher";

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

function getReadableErrorMessage(error: unknown) {
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

  return "Unknown connection error";
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

function formatValue(value?: string | number | null) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return String(value);
}

type BasicNetworkStatus =
  | {
      connected?: boolean;
      switchRequired?: boolean;
    }
  | null
  | undefined;

function getStatusLabel(status: BasicNetworkStatus) {
  if (!status?.connected) {
    return "Wallet not connected";
  }

  if (status.switchRequired) {
    return "Wrong network";
  }

  return "Ready";
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

export function WalletControlPanel() {
  const {
    adapter,
    ecosystem,
    evmWalletOptions,
    selectedEvmWalletId,
    selectEvmWallet,
    connectEvmWith,
    solanaWalletOptions,
    selectedSolanaWalletId,
    selectSolanaWallet,
    btcWalletName,
    selectBtcWallet,
    seiAvailableWallets,
    disconnectAllWallets,
    selectedSeiWallet,
    selectSeiWallet,
  } = useWalletAccount();

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

  const statusLabel = getStatusLabel(networkStatus);
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
          throw new Error("Select an EVM wallet first.");
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
        throw new Error("Wallet connected but no account was returned.");
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
        title: "Wallet Connected",
        message: `${account.providerName} -> ${account.displayAddress}`,
      });

      await refresh();
    } catch (error) {
      const message = getReadableErrorMessage(error);

      setUnifiedWalletError(ecosystem, message);

      debugUnified("store state after error", {
        status: "error",
        ecosystem,
        message,
      });

      pushLog({
        level: "error",
        title: "Connect Failed",
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
        title: "Wallet Disconnected",
        message: `${ecosystem} wallet disconnected`,
      });
    } catch (error) {
      const message = getReadableErrorMessage(error);

      setUnifiedWalletError(ecosystem, message);

      pushLog({
        level: "error",
        title: "Disconnect Failed",
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

  return (
    <section className="grid gap-4 rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">
              Wallet Connect
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Select an ecosystem, choose a wallet, then connect through the
              unified adapter layer.
            </p>
          </div>

          <div className="sm:min-w-[220px]">
            <EcosystemSwitcher compact />
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-slate-300">
          <div className="mb-1 text-xs uppercase tracking-wide text-slate-500">
            Current Session
          </div>

          <div className="break-all">
            {unifiedWallet.account
              ? `${unifiedWallet.account.walletName} -> ${unifiedWallet.account.address.slice(0, 6)}...${unifiedWallet.account.address.slice(-4)}`
              : `No ${ecosystem} wallet connected`}
          </div>
        </div>

        {ecosystem === "evm" ? (
          <div className="grid gap-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {evmWalletOptions.map((walletOption) => (
                <button
                  key={walletOption.id}
                  type="button"
                  onClick={() => selectEvmWallet(walletOption.id)}
                  disabled={isBusy}
                  className={
                    selectedEvmWalletId === walletOption.id
                      ? "rounded-xl bg-blue-600 px-4 py-2.5 text-left text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                      : "rounded-xl bg-slate-800 px-4 py-2.5 text-left text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  }
                >
                  {walletOption.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleConnect}
              disabled={isBusy || !selectedEvmWalletId}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-left text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {selectedEvmWalletId
                ? `Connect ${
                    evmWalletOptions.find(
                      (walletOption) => walletOption.id === selectedEvmWalletId,
                    )?.label ?? "EVM Wallet"
                  }`
                : "Connect EVM Wallet"}
            </button>
          </div>
        ) : null}

        {ecosystem === "btc" ? (
          <div className="grid gap-3">
            <SelectedWalletBox
              label="Selected BTC Wallet"
              value={btcWalletName ?? "None"}
            />

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => selectBtcWallet("unisat")}
                disabled={isBusy}
                className={
                  btcWalletName === "unisat"
                    ? "rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                    : "rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                }
              >
                Select Unisat
              </button>

              <button
                type="button"
                onClick={() => selectBtcWallet("okx")}
                disabled={isBusy}
                className={
                  btcWalletName === "okx"
                    ? "rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                    : "rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                }
              >
                Select OKX BTC
              </button>
            </div>

            <button
              type="button"
              onClick={handleConnect}
              disabled={isBusy || !btcWalletName}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Connect BTC Wallet
            </button>
          </div>
        ) : null}

        {ecosystem === "solana" ? (
          <div className="grid gap-3">
            <SelectedWalletBox
              label="Selected Solana Wallet"
              value={
                selectedSolanaWalletId
                  ? (solanaWalletOptions.find(
                      (walletOption) =>
                        walletOption.id === selectedSolanaWalletId,
                    )?.label ?? "Unknown")
                  : "None"
              }
            />

            <div className="grid gap-2 sm:grid-cols-2">
              {solanaWalletOptions.map((walletOption) => (
                <button
                  key={walletOption.id}
                  type="button"
                  onClick={() => selectSolanaWallet(walletOption.id)}
                  disabled={isBusy}
                  className={
                    selectedSolanaWalletId === walletOption.id
                      ? "rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                      : "rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  }
                >
                  Select {walletOption.label}
                </button>
              ))}
            </div>

            <p className="rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-slate-300">
              Pick a Solana wallet first, then connect it.
            </p>

            <button
              type="button"
              onClick={handleConnect}
              disabled={isBusy || !selectedSolanaWalletId}
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {selectedSolanaWalletId
                ? `Connect ${
                    solanaWalletOptions.find(
                      (walletOption) =>
                        walletOption.id === selectedSolanaWalletId,
                    )?.label ?? "Solana Wallet"
                  }`
                : "Connect Solana Wallet"}
            </button>
          </div>
        ) : null}

        {ecosystem === "sei" ? (
          <div className="grid gap-3">
            <SelectedWalletBox
              label="Selected Sei Wallet"
              value={
                selectedSeiWallet
                  ? (seiAvailableWallets.find(
                      (wallet) => wallet.type === selectedSeiWallet,
                    )?.walletName ?? "Unknown")
                  : "None"
              }
            />

            <div className="grid gap-2 sm:grid-cols-3">
              {seiAvailableWallets.map((wallet) => (
                <button
                  key={wallet.type}
                  type="button"
                  onClick={() => selectSeiWallet(wallet.type)}
                  disabled={isBusy}
                  className={
                    selectedSeiWallet === wallet.type
                      ? "rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
                      : "rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  }
                >
                  Select {wallet.walletName}
                </button>
              ))}
            </div>

            {seiAvailableWallets.length === 0 ? (
              <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">
                No Sei wallet detected. Install Compass, Keplr, or Leap.
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleConnect}
              disabled={isBusy || !selectedSeiWallet}
              className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {selectedSeiWallet
                ? `Connect ${
                    seiAvailableWallets.find(
                      (wallet) => wallet.type === selectedSeiWallet,
                    )?.walletName ?? "Sei Wallet"
                  }`
                : "Connect Sei Wallet"}
            </button>
          </div>
        ) : null}

        {ecosystem === "ton" ? (
          <div className="grid gap-2">
            <p className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm text-yellow-200">
              TON is reserved in this demo. No real wallet integration is wired
              yet.
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleDisconnect}
          disabled={isBusy}
          className="mt-4 rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Disconnect
        </button>

        {unifiedWallet.status === "error" && unifiedWallet.error ? (
          <p className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">
            {unifiedWallet.error}
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white">
              Network Status
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Verify whether the selected wallet is connected to the expected
              network.
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${statusClassName}`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoItem
            label="Ecosystem"
            value={formatValue(networkStatus?.ecosystem)}
          />
          <InfoItem label="Target Network" value={currentTarget.name} />
          <InfoItem
            label="Current Chain ID"
            value={formatValue(networkStatus?.currentChainId)}
          />
          <InfoItem
            label="Expected Chain ID"
            value={formatValue(networkStatus?.expectedChainId)}
          />
          <InfoItem
            label="Switch Required"
            value={networkStatus?.switchRequired ? "Yes" : "No"}
          />
          <InfoItem
            label="Switch Supported"
            value={networkStatus?.switchAvailable ? "Yes" : "No"}
          />
        </div>

        {networkStatus?.switchRequired && networkStatus.switchAvailable ? (
          <button
            type="button"
            onClick={handleSwitchNetwork}
            className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 sm:w-auto"
          >
            Switch to target network
          </button>
        ) : null}

        {networkStatus?.switchRequired && !networkStatus.switchAvailable ? (
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-100">
            This wallet does not expose an automatic network switching method.
            Please switch the network manually inside the wallet extension.
          </div>
        ) : null}

        {!networkStatus?.switchAvailable &&
        networkStatus?.ecosystem !== "evm" ? (
          <p className="mt-4 text-xs leading-5 text-slate-400">
            {networkStatus?.ecosystem} usually does not follow the EVM-style{" "}
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">
              switchChain
            </span>{" "}
            model. Network context is usually controlled by the wallet itself or
            by the provider injected into the page.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function SelectedWalletBox(props: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-slate-300">
      <div className="mb-1 text-xs uppercase tracking-wide text-slate-500">
        {props.label}
      </div>
      <div>{props.value}</div>
    </div>
  );
}

function InfoItem(props: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950 p-3">
      <div className="text-xs uppercase tracking-wide text-slate-500">
        {props.label}
      </div>
      <div className="mt-1 break-all text-sm font-medium text-slate-100">
        {props.value}
      </div>
    </div>
  );
}
