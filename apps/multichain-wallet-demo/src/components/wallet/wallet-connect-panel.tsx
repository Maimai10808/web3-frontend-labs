"use client";

import { useState } from "react";
import { useWalletAccount } from "@/hooks/multichain/use-wallet-account";
import { useMultichainLogs } from "@/hooks/multichain/use-multichain-logs";

export function WalletConnectPanel() {
  const { adapter, ecosystem, evmConnectors, connectEvmWith } =
    useWalletAccount();
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
          : "Connected",
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
    <section className="rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-sm">
      <h3 className="mb-3 text-base font-semibold">Wallet Connect</h3>

      {ecosystem === "evm" ? (
        <div className="grid gap-2">
          {evmConnectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => handleConnect(connector.id)}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isBusy}
            >
              Connect {connector.name}
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={() => handleConnect()}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isBusy}
        >
          Connect {ecosystem} wallet
        </button>
      )}

      <button
        onClick={handleDisconnect}
        className="mt-3 rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isBusy}
      >
        Disconnect
      </button>
    </section>
  );
}
