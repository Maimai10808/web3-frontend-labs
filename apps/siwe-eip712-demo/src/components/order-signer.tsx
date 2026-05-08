"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useDemoToken } from "@/src/hooks/contract/useDemoToken";
import { useSignedOrderBook } from "@/src/hooks/contract/useSignedOrderBook";
import { useOrderSigner as useSignedOrderSigner } from "@/src/hooks/order/useOrderSigner";
import {
  signedOrderFormSchema,
  toSignedOrderTypedData,
  type SignedOrderFormInput,
} from "@/src/lib/eip712/order";

type ExecuteState = {
  mode: "normal" | "tampered";
  stage: "approve" | "execute";
  hash?: `0x${string}`;
  receiptStatus?: string;
  error?: string;
} | null;

export function OrderSigner() {
  const orderSigner = useSignedOrderSigner();
  const demoToken = useDemoToken();
  const typedOrder = useMemo(() => {
    return orderSigner.order.signedOrder
      ? toSignedOrderTypedData(orderSigner.order.signedOrder)
      : null;
  }, [orderSigner.order.signedOrder]);
  const signedOrderBook = useSignedOrderBook(typedOrder?.nonce);
  const [deadlineSeconds, setDeadlineSeconds] = useState("600");
  const [executeState, setExecuteState] = useState<ExecuteState>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignedOrderFormInput>({
    resolver: zodResolver(signedOrderFormSchema),
    defaultValues: {
      recipient: "0x000000000000000000000000000000000000dead",
      amount: "10",
    },
  });

  async function onSubmit(values: SignedOrderFormInput) {
    setExecuteState(null);

    await orderSigner.signAndVerify(values, {
      deadlineSeconds: Number(deadlineSeconds),
    });
  }

  const rawAllowanceToOrderBook = demoToken.rawAllowanceToOrderBook ?? BigInt(0);
  const signedAmount = typedOrder?.amount ?? BigInt(0);
  const hasEnoughAllowance = typedOrder
    ? rawAllowanceToOrderBook >= signedAmount
    : false;
  const canExecute =
    Boolean(
      typedOrder &&
        orderSigner.order.signature &&
        orderSigner.order.verifyResult?.ok === true &&
        orderSigner.wallet.isCorrectChain,
    ) &&
    hasEnoughAllowance &&
    !signedOrderBook.isNonceUsed;

  function getReadableErrorMessage(error: unknown, fallback: string) {
    if (error instanceof Error) {
      const candidate = [
        (error as Error & { shortMessage?: string }).shortMessage,
        error.message,
      ].find((value) => typeof value === "string" && value.length > 0);

      return candidate ?? fallback;
    }

    return fallback;
  }

  async function handleApprove() {
    if (!typedOrder) return;

    setExecuteState(null);

    try {
      await demoToken.approveSignedOrderBook(typedOrder.amount);
      await demoToken.refetchAllowanceToOrderBook();
    } catch (error) {
      setExecuteState({
        mode: "normal",
        stage: "approve",
        error: getReadableErrorMessage(error, "Approve transaction failed."),
      });
    }
  }

  function tamperSignature(signature: `0x${string}`) {
    const lastChar = signature.at(-1);
    const nextChar = lastChar?.toLowerCase() === "0" ? "1" : "0";
    return `${signature.slice(0, -1)}${nextChar}` as `0x${string}`;
  }

  async function handleExecute(mode: "normal" | "tampered") {
    if (!typedOrder || !orderSigner.order.signature) return;

    setExecuteState(null);

    try {
      const signature =
        mode === "tampered"
          ? tamperSignature(orderSigner.order.signature)
          : orderSigner.order.signature;

      const result = await signedOrderBook.executeOrder(typedOrder, signature);

      await Promise.all([
        demoToken.refetchBalance(),
        demoToken.refetchAllowanceToOrderBook(),
        signedOrderBook.refetchUsedNonce(),
      ]);

      setExecuteState({
        mode,
        stage: "execute",
        hash: result.hash,
        receiptStatus: result.receipt
          ? result.receipt.status === "success"
            ? "success"
            : "reverted"
          : "unavailable",
      });
    } catch (error) {
      await signedOrderBook.refetchUsedNonce();

      setExecuteState({
        mode,
        stage: "execute",
        error: getReadableErrorMessage(error, "Execute order failed."),
      });
    }
  }

  return (
    <section className="islamic-card mx-auto w-full max-w-2xl rounded-xl border-2 border-[#c9a74e] p-8 shadow-[0_8px_24px_rgba(201,167,78,0.2)]">
      <div className="relative z-10 space-y-5 text-sm">
        <div className="text-center">
          <div className="islamic-kicker font-sans text-xs font-semibold text-[#c9a74e] md:text-sm">
            Authorization Chamber
          </div>
          <h2 className="mt-4 font-sans text-2xl font-semibold tracking-wide text-[#1a3a5c] md:text-3xl">
            SignedOrderBook Verify and Execute
          </h2>
          <p className="mt-3 font-sans text-sm leading-7 text-[#1a3a5c]/76 md:text-base">
            Sign a real SignedOrderBook order, then let the backend recover the
            signer and verify that the session address, maker, token, deadline,
            and nonce all match before approving DemoERC20 and executing the
            signed order onchain.
          </p>
        </div>

        <div className="rounded-xl border-2 border-[#c9a74e] bg-[#fff9ea] p-8 shadow-[0_4px_12px_rgba(201,167,78,0.15)]">
          <div className="font-sans text-lg font-semibold tracking-wide text-[#1a3a5c] md:text-xl">
            Signing Context
          </div>
          <div className="islamic-divider mt-4" />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoItem
              label="Token"
              value={orderSigner.order.tokenAddress}
            />
            <InfoItem
              label="Verifying Contract"
              value={orderSigner.order.verifyingContract}
            />
            <InfoItem
              label="Current Chain"
              value={orderSigner.wallet.chainId ?? "-"}
            />
            <InfoItem
              label="Expected Chain"
              value={orderSigner.wallet.expectedChainId}
            />
            <InfoItem
              label="Allowance to OrderBook"
              value={demoToken.allowanceToOrderBook}
            />
            <InfoItem
              label="Used Nonce Onchain"
              value={typedOrder ? String(signedOrderBook.isNonceUsed) : "-"}
            />
          </div>
        </div>

        <div className="rounded-xl border-2 border-[#c9a74e] bg-[#fff9ea] p-8 shadow-[0_4px_12px_rgba(201,167,78,0.15)]">
          <div className="font-sans text-lg font-semibold tracking-wide text-[#1a3a5c] md:text-xl">
            Session Snapshot
          </div>
          <div className="islamic-divider mt-4" />
          <pre className="islamic-code-block mt-5 overflow-auto rounded-lg border-2 border-[#c9a74e] p-4 font-sans text-xs leading-6 tracking-wide text-[#1a3a5c]">
            {JSON.stringify(orderSigner.sessionSnapshot, null, 2)}
          </pre>
        </div>

        {!orderSigner.wallet.isCorrectChain && orderSigner.wallet.isConnected && (
          <div className="rounded-xl border-2 border-[#c9a74e] bg-[#f3e3bd] p-8 font-sans text-sm leading-7 text-[#1a3a5c] shadow-[0_4px_12px_rgba(201,167,78,0.15)]">
            Wrong network. Switch your wallet to chain{" "}
            {orderSigner.wallet.expectedChainId} before signing.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-xl border-2 border-[#c9a74e] bg-[#fff9ea] p-8 shadow-[0_4px_12px_rgba(201,167,78,0.15)]">
            <div className="font-sans text-lg font-semibold tracking-wide text-[#1a3a5c] md:text-xl">
              Signed Order Form
            </div>
            <div className="islamic-divider mt-4" />

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="font-sans text-xs font-semibold tracking-[0.18em] text-[#c9a74e] md:text-sm">
                  Recipient
                </span>
                <input
                  {...register("recipient")}
                  className="mt-2 w-full rounded-lg border-2 border-[#1a3a5c]/30 bg-[#f5ecd7] px-3 py-2 font-sans tracking-wide text-[#1a3a5c] focus:border-[#c9a74e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(201,167,78,0.15)] md:px-4 md:py-3"
                />
                {errors.recipient && (
                  <p className="mt-2 font-sans text-xs tracking-wide text-[#8b3a2e]">
                    {errors.recipient.message}
                  </p>
                )}
              </label>

              <label className="block">
                <span className="font-sans text-xs font-semibold tracking-[0.18em] text-[#c9a74e] md:text-sm">
                  Amount
                </span>
                <input
                  {...register("amount")}
                  className="mt-2 w-full rounded-lg border-2 border-[#1a3a5c]/30 bg-[#f5ecd7] px-3 py-2 font-sans tracking-wide text-[#1a3a5c] focus:border-[#c9a74e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(201,167,78,0.15)] md:px-4 md:py-3"
                />
                {errors.amount && (
                  <p className="mt-2 font-sans text-xs tracking-wide text-[#8b3a2e]">
                    {errors.amount.message}
                  </p>
                )}
              </label>

              <label className="block">
                <span className="font-sans text-xs font-semibold tracking-[0.18em] text-[#c9a74e] md:text-sm">
                  Deadline (seconds)
                </span>
                <input
                  value={deadlineSeconds}
                  onChange={(event) => setDeadlineSeconds(event.target.value)}
                  className="mt-2 w-full rounded-lg border-2 border-[#1a3a5c]/30 bg-[#f5ecd7] px-3 py-2 font-sans tracking-wide text-[#1a3a5c] focus:border-[#c9a74e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(201,167,78,0.15)] md:px-4 md:py-3"
                />
              </label>
            </div>
          </div>

          {!orderSigner.auth.canSign && (
            <div className="rounded-xl border-2 border-[#c9a74e] bg-[#f3e3bd] p-8 font-sans text-sm leading-7 text-[#1a3a5c] shadow-[0_4px_12px_rgba(201,167,78,0.15)]">
              Connect the expected wallet, switch to the expected chain, and
              complete SIWE login before signing.
            </div>
          )}

          {orderSigner.errorMessage && (
            <div className="rounded-xl border-2 border-[#c9a74e] bg-[#f7ddcf] p-8 font-sans text-sm leading-7 text-[#8b3a2e] shadow-[0_4px_12px_rgba(201,167,78,0.15)]">
              {orderSigner.errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={!orderSigner.auth.canSign || orderSigner.isPending}
            className="w-full rounded-lg border-2 border-[#c9a74e] bg-[#1a3a5c] px-4 py-3 font-sans text-sm font-semibold tracking-wider text-[#f5ecd7] transition-all duration-300 ease-in-out active:opacity-80 hover:shadow-[0_6px_20px_rgba(201,167,78,0.25)] focus:shadow-[0_0_0_3px_rgba(201,167,78,0.15)] disabled:cursor-not-allowed disabled:bg-[#1a3a5c]/55 disabled:text-[#f5ecd7]/70"
          >
            {orderSigner.isPending
              ? "Signing and verifying..."
              : "Sign Typed Data and Verify"}
          </button>
        </form>

        <JsonCard title="Signed Order JSON" data={orderSigner.order.signedOrder} />
        <JsonCard title="Signature" data={orderSigner.order.signature || null} />
        <JsonCard
          title="Backend Verify Result"
          data={orderSigner.order.verifyResult}
        />

        <div className="rounded-xl border-2 border-[#c9a74e] bg-[#fff9ea] p-8 shadow-[0_4px_12px_rgba(201,167,78,0.15)]">
          <div className="font-sans text-lg font-semibold tracking-wide text-[#1a3a5c] md:text-xl">
            Phase 4 Onchain Execution
          </div>
          <div className="islamic-divider mt-4" />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoItem
              label="Backend Verify Passed"
              value={String(orderSigner.order.verifyResult?.ok === true)}
            />
            <InfoItem
              label="Allowance Sufficient"
              value={typedOrder ? String(hasEnoughAllowance) : "-"}
            />
            <InfoItem
              label="Required Amount"
              value={typedOrder ? typedOrder.amount.toString() : "-"}
            />
            <InfoItem
              label="Execute Ready"
              value={String(canExecute)}
            />
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={handleApprove}
              disabled={!typedOrder || demoToken.isApprovePending}
              className="rounded-lg border-2 border-[#c9a74e] bg-[#1a3a5c] px-4 py-3 font-sans text-sm font-semibold tracking-wider text-[#f5ecd7] transition-all duration-300 ease-in-out active:opacity-80 hover:shadow-[0_6px_20px_rgba(201,167,78,0.25)] disabled:cursor-not-allowed disabled:bg-[#1a3a5c]/55 disabled:text-[#f5ecd7]/70"
            >
              {demoToken.isApprovePending ? "Approving..." : "Approve Token"}
            </button>

            <button
              type="button"
              onClick={() => handleExecute("normal")}
              disabled={
                !canExecute || signedOrderBook.isExecutePending
              }
              className="rounded-lg border-2 border-[#c9a74e] bg-[#1a3a5c] px-4 py-3 font-sans text-sm font-semibold tracking-wider text-[#f5ecd7] transition-all duration-300 ease-in-out active:opacity-80 hover:shadow-[0_6px_20px_rgba(201,167,78,0.25)] disabled:cursor-not-allowed disabled:bg-[#1a3a5c]/55 disabled:text-[#f5ecd7]/70"
            >
              {signedOrderBook.isExecutePending
                ? "Executing..."
                : "Execute Verified Order"}
            </button>

            <button
              type="button"
              onClick={() => handleExecute("tampered")}
              disabled={
                !typedOrder ||
                !orderSigner.order.signature ||
                !orderSigner.wallet.isCorrectChain ||
                signedOrderBook.isExecutePending
              }
              className="rounded-lg border-2 border-[#c9a74e] bg-[#f5ecd7] px-4 py-3 font-sans text-sm font-semibold tracking-wider text-[#1a3a5c] transition-all duration-300 ease-in-out active:opacity-80 hover:shadow-[0_6px_20px_rgba(201,167,78,0.25)] disabled:cursor-not-allowed disabled:bg-[#f5ecd7]/55 disabled:text-[#1a3a5c]/60"
            >
              Execute Tampered Signature
            </button>
          </div>

          <div className="mt-6 rounded-lg border-2 border-[#c9a74e] bg-[#f5ecd7] p-4 shadow-[0_2px_4px_rgba(201,167,78,0.1)]">
            <div className="font-sans text-xs font-semibold tracking-[0.18em] text-[#c9a74e] md:text-sm">
              Test Paths
            </div>
            <div className="mt-3 space-y-2 font-sans text-sm leading-7 text-[#1a3a5c]">
              <p>
                `Wrong chain`: switch away from chain{" "}
                {orderSigner.wallet.expectedChainId} and try signing or
                executing.
              </p>
              <p>
                `Deadline expired`: sign with a very short deadline such as `5`
                seconds, wait, then execute.
              </p>
              <p>
                `Invalid signature`: use `Execute Tampered Signature` to force a
                signature mismatch.
              </p>
              <p>
                `Used nonce`: execute a verified order successfully, wait for
                `Used Nonce Onchain` to become `true`, then try to execute the
                same order again.
              </p>
            </div>
          </div>
        </div>

        <JsonCard title="Onchain Execute Result" data={executeState} />
      </div>
    </section>
  );
}

function JsonCard({
  title,
  data,
}: {
  title: string;
  data: unknown;
}) {
  return (
    <div className="rounded-xl border-2 border-[#c9a74e] bg-[#fff9ea] p-8 shadow-[0_4px_12px_rgba(201,167,78,0.15)]">
      <div className="font-sans text-lg font-semibold tracking-wide text-[#1a3a5c] md:text-xl">
        {title}
      </div>
      <div className="islamic-divider mt-4" />
      <pre className="islamic-code-block mt-5 overflow-auto break-all rounded-lg border-2 border-[#c9a74e] p-4 font-sans text-xs leading-6 tracking-wide text-[#1a3a5c]">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border-2 border-[#c9a74e] bg-[#f5ecd7] p-4 shadow-[0_2px_4px_rgba(201,167,78,0.1)]">
      <div className="font-sans text-xs font-semibold tracking-[0.2em] text-[#c9a74e] md:text-sm">
        {label}
      </div>
      <div className="mt-2 break-all font-sans text-sm tracking-wide text-[#1a3a5c] md:text-base">
        {value}
      </div>
    </div>
  );
}
