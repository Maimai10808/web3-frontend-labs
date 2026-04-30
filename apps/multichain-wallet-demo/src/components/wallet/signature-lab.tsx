"use client";

import { useMemo, useState } from "react";
import { useWalletAccount } from "@/hooks/multichain/use-wallet-account";
import { useSignIntent } from "@/hooks/multichain/use-sign-intent";

export function SignatureLab() {
  const { adapter, ecosystem } = useWalletAccount();
  const { sign, result, error, isPending } = useSignIntent();
  const [message, setMessage] = useState("Sign in to multichain-wallet-demo");

  const typedData = useMemo(
    () => ({
      domain: {
        name: "multichain-wallet-demo",
        version: "1",
        chainId: 1,
      },
      types: {
        SignIn: [
          { name: "message", type: "string" },
          { name: "nonce", type: "string" },
        ],
      },
      primaryType: "SignIn",
      message: {
        message,
        nonce: "demo-nonce",
      },
    }),
    [message],
  );

  const capabilities = adapter?.getCapabilities();

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-sm">
      <h3 className="mb-3 text-base font-semibold">Signature Lab</h3>

      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={4}
        className="mb-3 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none transition focus:border-slate-500"
      />

      <div className="mb-3 flex flex-wrap gap-2">
        {capabilities?.canPersonalSign ? (
          <button
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            onClick={() => sign({ kind: "personal_sign", message })}
          >
            personal_sign
          </button>
        ) : null}

        {capabilities?.canSignTypedData ? (
          <button
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            onClick={() =>
              sign({
                kind: "eip712",
                message,
                typedData,
              })
            }
          >
            EIP-712
          </button>
        ) : null}

        {capabilities?.canSignMessage ? (
          <button
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            onClick={() => {
              const kind =
                ecosystem === "solana"
                  ? "solana_message"
                  : ecosystem === "btc"
                    ? "btc_message"
                    : "sei_arbitrary";
              return sign({ kind, message });
            }}
          >
            Sign Message
          </button>
        ) : null}
      </div>

      <div className="overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-300">
        {result ? (
          <div className="space-y-2">
            <div>
              <span className="text-slate-500">wallet</span>: {result.walletName}
            </div>
            <div>
              <span className="text-slate-500">address</span>: {result.address}
            </div>
            <div>
              <span className="text-slate-500">message</span>:{" "}
              {result.payloadPreview}
            </div>
            <div className="break-all">
              <span className="text-slate-500">signature</span>:{" "}
              {result.signature}
            </div>
          </div>
        ) : error ? (
          <div className="space-y-2">
            <div className="text-rose-300">Signature failed</div>
            <div className="break-all">{error.message}</div>
          </div>
        ) : (
          <div className="text-slate-500">No signature result yet.</div>
        )}
      </div>
    </section>
  );
}
