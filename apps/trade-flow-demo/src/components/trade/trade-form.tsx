"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Clock3,
  DollarSign,
  Gauge,
  Layers3,
  Shield,
  Wallet,
} from "lucide-react";

import { Button } from "@web3-frontend-labs/ui";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@web3-frontend-labs/ui";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@web3-frontend-labs/ui";
import { Input } from "@web3-frontend-labs/ui";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "@web3-frontend-labs/ui";

import { tradeFormSchema } from "@/lib/trade/schema";
import type { TradeFormInput } from "@/lib/trade/types";
import { useSubmitTrade } from "@/hooks/trade/useSubmitTrade";

type TradeFormProps = {
  account?: `0x${string}`;
  onSubmitted?: (orderId: string) => void;
};

const defaultValues: TradeFormInput = {
  side: "buy",
  market: "ETH-USDC",
  amount: "1",
  price: "2500",
  slippageBps: "50",
  deadlineSeconds: "60",
};

export function TradeForm({ account, onSubmitted }: TradeFormProps) {
  const submitTrade = useSubmitTrade();

  const form = useForm<TradeFormInput>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const watchedSide = form.watch("side");

  const isReady = useMemo(() => {
    return Boolean(account) && form.formState.isValid && !submitTrade.isPending;
  }, [account, form.formState.isValid, submitTrade.isPending]);

  async function onSubmit(values: TradeFormInput) {
    if (!account) {
      form.setError("root", {
        message: "Please connect wallet before submitting a trade.",
      });
      return;
    }

    try {
      const response = await submitTrade.mutateAsync({
        account,
        input: values,
      });

      onSubmitted?.(response.orderId);

      form.clearErrors("root");
    } catch (error) {
      form.setError("root", {
        message:
          error instanceof Error ? error.message : "Failed to submit trade.",
      });
    }
  }

  const rootError = form.formState.errors.root?.message;
  const summary = {
    notional:
      Number(form.watch("amount") || 0) * Number(form.watch("price") || 0),
    slippagePct: Number(form.watch("slippageBps") || 0) / 100,
    deadlineLabel: `${form.watch("deadlineSeconds") || "0"}s`,
  };

  return (
    <Card className="trade-panel w-full overflow-hidden rounded-[2rem]">
      <CardHeader className="border-b border-[var(--line-soft)] pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700">
            <Layers3 className="size-3.5" />
            Limit Order Ticket
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Place Limit Order
          </CardTitle>
        </div>
        <CardDescription>
          Enter trade parameters, build an operation, sign the payload, and
          submit it to the mock backend.
        </CardDescription>
        <CardAction>
          <div className="trade-soft-card rounded-[1.4rem] px-4 py-3 text-right backdrop-blur">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Account
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Wallet className="size-4 text-sky-600" />
              <span>
                {account
                  ? `${account.slice(0, 6)}...${account.slice(-4)}`
                  : "Disconnected"}
              </span>
            </div>
          </div>
        </CardAction>
      </CardHeader>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="trade-soft-card trade-tint-peach rounded-[1.4rem] p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                <DollarSign className="size-3.5" />
                Notional
              </div>
              <div className="text-xl font-semibold text-slate-800">
                $
                {Number.isFinite(summary.notional)
                  ? summary.notional.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })
                  : "0"}
              </div>
            </div>
            <div className="trade-soft-card trade-tint-mint rounded-[1.4rem] p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                <Gauge className="size-3.5" />
                Slippage
              </div>
              <div className="text-xl font-semibold text-slate-800">
                {summary.slippagePct}%
              </div>
            </div>
            <div className="trade-soft-card trade-tint-sky rounded-[1.4rem] p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                <Clock3 className="size-3.5" />
                Deadline
              </div>
              <div className="text-xl font-semibold text-slate-800">
                {summary.deadlineLabel}
              </div>
            </div>
          </div>

          <FieldGroup className="gap-6">
            <Field>
              <FieldLabel htmlFor="side" className="text-sm font-semibold">
                Side
              </FieldLabel>

              <div className="rounded-[1.4rem] border border-[var(--line-soft)] bg-white/58 p-1.5 shadow-inner">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    size="lg"
                    className={
                      watchedSide === "buy"
                        ? "rounded-2xl border-emerald-300/35 bg-[linear-gradient(180deg,rgba(74,222,128,0.95),rgba(52,211,153,0.92))] text-white shadow-[0_18px_34px_-20px_rgba(16,185,129,0.76)] hover:brightness-[1.02]"
                        : "rounded-2xl border-transparent bg-transparent text-slate-500 hover:bg-white/80"
                    }
                    variant={watchedSide === "buy" ? "default" : "outline"}
                    onClick={() =>
                      form.setValue("side", "buy", {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    Buy
                  </Button>

                  <Button
                    type="button"
                    size="lg"
                    className={
                      watchedSide === "sell"
                        ? "rounded-2xl border-rose-300/35 bg-[linear-gradient(180deg,rgba(251,146,177,0.96),rgba(244,114,182,0.92))] text-white shadow-[0_18px_34px_-20px_rgba(244,114,182,0.72)] hover:brightness-[1.02]"
                        : "rounded-2xl border-transparent bg-transparent text-slate-500 hover:bg-white/80"
                    }
                    variant={watchedSide === "sell" ? "default" : "outline"}
                    onClick={() =>
                      form.setValue("side", "sell", {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    Sell
                  </Button>
                </div>
              </div>

              <FieldDescription>
                Choose whether this mock order is a buy or sell order.
              </FieldDescription>

              {form.formState.errors.side && (
                <FieldError>{form.formState.errors.side.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="market" className="text-sm font-semibold">
                Market
              </FieldLabel>
              <Input
                id="market"
                className="h-11 rounded-xl border-white/40 bg-white/72"
                placeholder="ETH-USDC"
                {...form.register("market")}
              />
              <FieldDescription>
                Trading pair used by the mock matching system.
              </FieldDescription>
              {form.formState.errors.market && (
                <FieldError>{form.formState.errors.market.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="amount" className="text-sm font-semibold">
                Amount
              </FieldLabel>
              <InputGroup className="h-11 rounded-xl border-white/40 bg-white/72">
                <Input
                  id="amount"
                  className="h-11 rounded-xl bg-transparent"
                  inputMode="decimal"
                  placeholder="1"
                  {...form.register("amount")}
                />
                <InputGroupAddon>
                  <InputGroupText>ETH</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription>
                The base asset amount you want to trade.
              </FieldDescription>
              {form.formState.errors.amount && (
                <FieldError>{form.formState.errors.amount.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="price" className="text-sm font-semibold">
                Limit Price
              </FieldLabel>
              <InputGroup className="h-11 rounded-xl border-white/40 bg-white/72">
                <InputGroupAddon>
                  <InputGroupText>$</InputGroupText>
                </InputGroupAddon>
                <Input
                  id="price"
                  className="h-11 rounded-xl bg-transparent"
                  inputMode="decimal"
                  placeholder="2500"
                  {...form.register("price")}
                />
              </InputGroup>
              <FieldDescription>
                The limit price used to build the order operation.
              </FieldDescription>
              {form.formState.errors.price && (
                <FieldError>{form.formState.errors.price.message}</FieldError>
              )}
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel
                  htmlFor="slippageBps"
                  className="text-sm font-semibold"
                >
                  Slippage
                </FieldLabel>
                <InputGroup className="h-11 rounded-xl border-white/40 bg-white/72">
                  <Input
                    id="slippageBps"
                    className="h-11 rounded-xl bg-transparent"
                    inputMode="numeric"
                    placeholder="50"
                    {...form.register("slippageBps")}
                  />
                  <InputGroupAddon>
                    <InputGroupText>bps</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription>
                  50 bps means 0.5% max slippage.
                </FieldDescription>
                {form.formState.errors.slippageBps && (
                  <FieldError>
                    {form.formState.errors.slippageBps.message}
                  </FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel
                  htmlFor="deadlineSeconds"
                  className="text-sm font-semibold"
                >
                  Deadline
                </FieldLabel>
                <InputGroup className="h-11 rounded-xl border-white/40 bg-white/72">
                  <Input
                    id="deadlineSeconds"
                    className="h-11 rounded-xl bg-transparent"
                    inputMode="numeric"
                    placeholder="60"
                    {...form.register("deadlineSeconds")}
                  />
                  <InputGroupAddon>
                    <InputGroupText>sec</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription>
                  The order expires after this many seconds.
                </FieldDescription>
                {form.formState.errors.deadlineSeconds && (
                  <FieldError>
                    {form.formState.errors.deadlineSeconds.message}
                  </FieldError>
                )}
              </Field>
            </div>

            {!account && (
              <div className="rounded-2xl border border-dashed border-[var(--line-strong)] bg-white/46 p-4 text-sm text-slate-600">
                Wallet is not connected. The form can be edited, but submission
                is disabled until an account is available.
              </div>
            )}

            {rootError && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {rootError}
              </div>
            )}
          </FieldGroup>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t border-[var(--line-soft)] bg-white/36 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Shield className="size-4 text-sky-600" />
            Submission only creates an order. Final status updates arrive later.
          </div>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="trade-button-secondary w-full rounded-2xl sm:w-auto"
            onClick={() => form.reset(defaultValues)}
            disabled={submitTrade.isPending}
          >
            Reset
          </Button>

          <Button
            type="submit"
            size="lg"
            className="trade-button-primary w-full rounded-2xl px-6 sm:w-auto"
            disabled={!isReady}
          >
            {submitTrade.isPending ? "Submitting..." : "Sign & Submit"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
