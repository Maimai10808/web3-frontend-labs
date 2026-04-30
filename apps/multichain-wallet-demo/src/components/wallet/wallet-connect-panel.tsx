"use client";

import { useState } from "react";
import { useWalletAccount } from "@/hooks/multichain/use-wallet-account";
import { useMultichainLogs } from "@/hooks/multichain/use-multichain-logs";

export function WalletConnectPanel() {
  const {
    adapter,
    ecosystem,
    evmConnectors,
    connectEvmWith,
    btcWalletName,
    selectBtcWallet,
  } = useWalletAccount();

  const { pushLog } = useMultichainLogs();
  const [isBusy, setIsBusy] = useState(false);

  const handleConnect = async (connectorId?: string) => {
    if (!adapter) return;

    setIsBusy(true);
    try {
      if (ecosystem === "evm" && connectorId) {
        await connectEvmWith(connectorId);
      } else {
        await adapter.connect();
      }

      const account = await adapter.getAccount();

      pushLog({
        level: "success",
        title: "Wallet Connected",
        message: account
          ? `${account.providerName} -> ${account.displayAddress}`
          : `Connected ${ecosystem} wallet`,
      });
    } catch (error) {
      pushLog({
        level: "error",
        title: "Connect Failed",
        message: error instanceof Error ? error.message : "Unknown error",
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

      pushLog({
        level: "info",
        title: "Wallet Disconnected",
        message: `${ecosystem} wallet disconnected`,
      });
    } catch (error) {
      pushLog({
        level: "error",
        title: "Disconnect Failed",
        message: error instanceof Error ? error.message : "Unknown error",
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
          <p className="rounded-xl border border-white/10 bg-gray-950 p-3 text-sm text-gray-300">
            Solana uses wallet-adapter style connection. In a real integration,
            this button would open the Solana wallet modal.
          </p>

          <button
            onClick={() => handleConnect()}
            disabled={isBusy}
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

          <button
            onClick={() => handleConnect()}
            disabled={isBusy}
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
    </section>
  );
}
