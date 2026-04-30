"use client";

import { useState } from "react";
import { useMultichainDemoStore } from "@/store/multichain-demo-store";
import { useWalletAccount } from "@/hooks/multichain/use-wallet-account";
import { useMultichainLogs } from "@/hooks/multichain/use-multichain-logs";
import type {
  ChainNamespace,
  MultiChainError,
} from "@/lib/multichain/types";

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

export function WalletConnectPanel() {
  const {
    adapter,
    ecosystem,
    evmConnectors,
    connectEvmWith,
    solanaWallets,
    solanaWalletName,
    selectSolanaWallet,
    btcWalletName,
    selectBtcWallet,
    seiAvailableWallets,
    disconnectAllWallets,
    selectedSeiWallet,
    selectSeiWallet,
  } = useWalletAccount();

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

  const handleConnect = async (connectorId?: string) => {
    if (!adapter) return;

    setIsBusy(true);
    setUnifiedWalletConnecting(ecosystem);

    try {
      await disconnectAllWallets(ecosystem);
      debugUnified("disconnect all before connect", ecosystem);

      let connectedAccount = null;

      if (ecosystem === "evm" && connectorId) {
        debugUnified("selected wallet", connectorId);
        connectedAccount = await connectEvmWith(connectorId);
      } else {
        if (ecosystem === "btc") {
          debugBtc("selected wallet", btcWalletName);
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

  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900 p-4">
      <h3 className="mb-3 text-base font-semibold text-white">
        Wallet Connect
      </h3>

      <div className="mb-3 rounded-xl border border-white/10 bg-gray-950 p-3 text-sm text-gray-300">
        <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
          Current session
        </div>
        <div>
          {unifiedWallet.account
            ? `${unifiedWallet.account.walletName} -> ${unifiedWallet.account.address.slice(0, 6)}...${unifiedWallet.account.address.slice(-4)}`
            : `No ${ecosystem} wallet connected`}
        </div>
      </div>

      {ecosystem === "evm" ? (
        <div className="grid gap-2">
          {evmConnectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => handleConnect(connector.id)}
              disabled={isBusy}
              className="rounded-xl bg-blue-600 px-4 py-2 text-left text-sm text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Connect {connector.name}
            </button>
          ))}
        </div>
      ) : null}

      {ecosystem === "btc" ? (
        <div className="grid gap-2">
          <div className="rounded-xl border border-white/10 bg-gray-950 p-3 text-sm text-gray-300">
            <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
              Selected BTC Wallet
            </div>
            <div>{btcWalletName ?? "None"}</div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              onClick={() => selectBtcWallet("unisat")}
              disabled={isBusy}
              className="rounded-xl bg-orange-600 px-4 py-2 text-sm text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Select Unisat
            </button>

            <button
              onClick={() => selectBtcWallet("okx")}
              disabled={isBusy}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Select OKX BTC
            </button>
          </div>

          <button
            onClick={() => handleConnect()}
            disabled={isBusy || !btcWalletName}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Connect BTC Wallet
          </button>
        </div>
      ) : null}

      {ecosystem === "solana" ? (
        <div className="grid gap-2">
          <div className="rounded-xl border border-white/10 bg-gray-950 p-3 text-sm text-gray-300">
            <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
              Selected Solana Wallet
            </div>
            <div>{solanaWalletName ?? "None"}</div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {solanaWallets.map((walletOption) => (
              <button
                key={walletOption.label}
                onClick={() => selectSolanaWallet(walletOption.value)}
                disabled={isBusy}
                className={
                  solanaWalletName === walletOption.value
                    ? "rounded-xl bg-violet-600 px-4 py-2 text-sm text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                    : "rounded-xl bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                }
              >
                Select {walletOption.label}
              </button>
            ))}
          </div>

          <p className="rounded-xl border border-white/10 bg-gray-950 p-3 text-sm text-gray-300">
            Pick a Solana wallet first, then connect it.
          </p>

          <button
            onClick={() => handleConnect()}
            disabled={isBusy || !solanaWalletName}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Connect Solana Wallet
          </button>
        </div>
      ) : null}

      {ecosystem === "sei" ? (
        <div className="grid gap-2">
          <p className="rounded-xl border border-white/10 bg-gray-950 p-3 text-sm text-gray-300">
            Sei wallet flow is ecosystem-specific and usually relies on a
            dedicated wallet provider.
          </p>

          <div className="rounded-xl border border-white/10 bg-gray-950 p-3 text-sm text-gray-300">
            <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
              Selected Sei Wallet
            </div>
            <div>
              {selectedSeiWallet
                ? seiAvailableWallets.find(
                    (wallet) => wallet.type === selectedSeiWallet,
                  )?.walletName ?? "Unknown"
                : "None"}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {seiAvailableWallets.map((wallet) => (
              <button
                key={wallet.type}
                onClick={() => selectSeiWallet(wallet.type)}
                disabled={isBusy}
                className={
                  selectedSeiWallet === wallet.type
                    ? "rounded-xl bg-cyan-600 px-4 py-2 text-sm text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
                    : "rounded-xl bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
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
            onClick={() => handleConnect()}
            disabled={isBusy || !selectedSeiWallet}
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Connect Sei Wallet
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
        onClick={handleDisconnect}
        disabled={isBusy}
        className="mt-3 rounded-xl bg-gray-700 px-4 py-2 text-sm text-white transition hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Disconnect
      </button>

      {unifiedWallet.status === "error" && unifiedWallet.error ? (
        <p className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">
          {unifiedWallet.error}
        </p>
      ) : null}
    </section>
  );
}
