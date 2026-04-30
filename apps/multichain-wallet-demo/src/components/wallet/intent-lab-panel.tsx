"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { useSendDemoTransaction } from "@/hooks/multichain/use-send-demo-transaction";
import { useSignIntent } from "@/hooks/multichain/use-sign-intent";
import { useWalletAccount } from "@/hooks/multichain/use-wallet-account";
import type { MultiChainError } from "@/lib/multichain/types";

export function IntentLabPanel() {
  const { connectedAdapter: adapter, connectedEcosystem: ecosystem } =
    useWalletAccount();
  const t = useTranslations("multichainDemo.intentLab");
  const common = useTranslations("multichainDemo.common");
  const ecosystemT = useTranslations("multichainDemo.ecosystem");

  const {
    sign,
    result: signResult,
    error: signError,
    isPending: isSigning,
  } = useSignIntent();

  const {
    send,
    result: txResult,
    error: txError,
    isPending: isSending,
  } = useSendDemoTransaction();

  const [message, setMessage] = useState(t("signMessagePlaceholder"));
  const [to, setTo] = useState("0x000000000000000000000000000000000000dEaD");
  const [value, setValue] = useState("0.0001");

  const capabilities = adapter?.getCapabilities();
  const activeLabel = ecosystem ? ecosystemT(ecosystem) : common("disconnected");

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

  const handleSignMessage = () => {
    if (!ecosystem) {
      return;
    }

    const kind =
      ecosystem === "solana"
        ? "solana_message"
        : ecosystem === "btc"
          ? "btc_message"
          : ecosystem === "sei"
            ? "sei_arbitrary"
            : null;

    if (!kind) {
      return;
    }

    return sign({ kind, message });
  };

  const handleSend = async () => {
    if (!ecosystem) {
      return;
    }

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
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            {t("title")}
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
            {t("description")}
          </p>
        </div>

        <span className="rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">
          {activeLabel}
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-white">{t("signatureTitle")}</h4>
            <p className="mt-1 text-xs leading-5 text-slate-400">{t("signatureDescription")}</p>
          </div>

          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            className="mb-3 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none transition focus:border-slate-500"
          />

          <div className="mb-4 flex flex-wrap gap-2">
            {capabilities?.canPersonalSign ? (
              <button
                type="button"
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSigning}
                onClick={() => sign({ kind: "personal_sign", message })}
              >
                {t("personalSign")}
              </button>
            ) : null}

            {capabilities?.canSignTypedData ? (
              <button
                type="button"
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSigning}
                onClick={() =>
                  sign({
                    kind: "eip712",
                    message,
                    typedData,
                  })
                }
              >
                {t("typedDataSign")}
              </button>
            ) : null}

            {capabilities?.canSignMessage ? (
              <button
                type="button"
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSigning}
                onClick={handleSignMessage}
              >
                {t("signMessage")}
              </button>
            ) : null}
          </div>

          <ResultBox
            title={t("signatureResult")}
            emptyText={t("noSignatureResult")}
            result={signResult}
            error={signError}
            failedLabel={common("actionFailed")}
            unknownErrorLabel={t("errorUnknown")}
            renderResult={(result) => (
              <div className="space-y-2">
                <InfoLine label={t("wallet")} value={result.walletName} />
                <InfoLine label={t("address")} value={result.address} />
                <InfoLine label={t("message")} value={result.payloadPreview} />
                <InfoLine label={t("signature")} value={result.signature} breakAll />
              </div>
            )}
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-white">{t("transactionTitle")}</h4>
            <p className="mt-1 text-xs leading-5 text-slate-400">{t("transactionDescription")}</p>
          </div>

          <input
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="mb-3 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none transition focus:border-slate-500"
            placeholder={t("recipientPlaceholder")}
          />

          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="mb-3 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none transition focus:border-slate-500"
            placeholder={t("valuePlaceholder")}
          />

          <button
            type="button"
            className="mb-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSending || !adapter?.sendTransaction}
            onClick={handleSend}
          >
            {isSending ? t("sending") : t("sendDemoTransaction")}
          </button>

          <ResultBox
            title={t("transactionResult")}
            emptyText={t("noTransactionResult")}
            result={txResult}
            error={txError}
            failedLabel={common("actionFailed")}
            unknownErrorLabel={t("errorUnknown")}
            renderResult={(result) => (
              <pre className="overflow-auto whitespace-pre-wrap break-all text-xs leading-5 text-slate-300">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          />
        </div>
      </div>
    </section>
  );
}

type ResultBoxError = Error | MultiChainError | null | undefined;

function getResultBoxErrorMessage(
  error: ResultBoxError,
  unknownErrorLabel: string,
) {
  if (!error) {
    return "";
  }

  if (error instanceof Error) {
    return error.message;
  }

  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }

  return unknownErrorLabel;
}

function ResultBox<T>(props: {
  title: string;
  emptyText: string;
  result: T | null | undefined;
  error: ResultBoxError;
  failedLabel: string;
  unknownErrorLabel: string;
  renderResult: (result: T) => React.ReactNode;
}) {
  const errorMessage = getResultBoxErrorMessage(
    props.error,
    props.unknownErrorLabel,
  );

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950 p-3">
      <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">
        {props.title}
      </div>

      {props.result ? (
        props.renderResult(props.result)
      ) : props.error ? (
        <div className="space-y-2 text-xs">
          <div className="font-medium text-rose-300">{props.failedLabel}</div>
          <div className="break-all text-slate-300">{errorMessage}</div>
        </div>
      ) : (
        <div className="text-xs text-slate-500">{props.emptyText}</div>
      )}
    </div>
  );
}

function InfoLine(props: { label: string; value: string; breakAll?: boolean }) {
  return (
    <div className={props.breakAll ? "break-all" : ""}>
      <span className="text-slate-500">{props.label}</span>:{" "}
      <span className="text-slate-300">{props.value}</span>
    </div>
  );
}
