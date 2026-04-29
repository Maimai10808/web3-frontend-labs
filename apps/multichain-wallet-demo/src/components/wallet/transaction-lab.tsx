"use client";

import { useState } from "react";
import { useWalletAccount } from "@/hooks/multichain/use-wallet-account";
import { useSendDemoTransaction } from "@/hooks/multichain/use-send-demo-transaction";

export function TransactionLab() {
  const { adapter, ecosystem } = useWalletAccount();
  const { send, result, error, isPending } = useSendDemoTransaction();

  const [to, setTo] = useState("0x000000000000000000000000000000000000dEaD");
  const [value, setValue] = useState("0.0001");

  const handleSend = async () => {
    if (ecosystem === "evm") {
      await send({
        mode: "native-transfer",
        to,
        value,
      });
      return;
    }

    await send({
      mode: ecosystem === "btc" ? "btc-psbt" : "program-call",
      to,
      value,
    });
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-sm">
      <h3 className="mb-3 text-base font-semibold">Transaction Lab</h3>

      <input
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="mb-3 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none transition focus:border-slate-500"
        placeholder="to"
      />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mb-3 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none transition focus:border-slate-500"
        placeholder="value"
      />

      <button
        className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending || !adapter?.sendTransaction}
        onClick={handleSend}
      >
        {isPending ? "Sending..." : "Send Demo Transaction"}
      </button>

      <pre className="mt-3 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-300">
        {JSON.stringify(result ?? error ?? { status: "idle" }, null, 2)}
      </pre>
    </section>
  );
}
