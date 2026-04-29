"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAccount, useChainId } from "wagmi";
import {
  Clock3,
  DollarSign,
  Gauge,
  Layers3,
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
import {
  tradeMarketConfig,
  tradeOrderBookContract,
  tradingStateChainId,
} from "@/lib/contracts/trade-order-book";

type TradeFormProps = {
  account?: `0x${string}`;
  onSubmitted?: (orderId: string) => void;
};

const defaultValues: TradeFormInput = {
  side: "buy",
  market: tradeMarketConfig.label,
  amount: "1",
  price: "2500",
  slippageBps: "50",
  deadlineSeconds: "60",
};

export function TradeForm({ account, onSubmitted }: TradeFormProps) {
  const wallet = useAccount();
  const chainId = useChainId();
  const submitTrade = useSubmitTrade();
  const currentAccount = account ?? wallet.address;
  const isExpectedChain = chainId === tradingStateChainId;

  const form = useForm<TradeFormInput>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const watchedSide = form.watch("side");

  const isReady = useMemo(() => {
    return (
      Boolean(currentAccount) &&
      isExpectedChain &&
      form.formState.isValid &&
      !submitTrade.isPending
    );
  }, [
    currentAccount,
    form.formState.isValid,
    isExpectedChain,
    submitTrade.isPending,
  ]);

  async function onSubmit(values: TradeFormInput) {
    if (!currentAccount) {
      form.setError("root", {
        message: "Please connect wallet before submitting a trade.",
      });
      return;
    }

    if (!isExpectedChain) {
      form.setError("root", {
        message: `Wrong network. Switch to chain ${tradingStateChainId}.`,
      });
      return;
    }

    try {
      const response = await submitTrade.mutateAsync({
        account: currentAccount,
        input: values,
        mode: "chain",
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
    <Card className="w-full overflow-hidden rounded-xl border bg-card shadow-sm">
      <CardHeader className="border-b pb-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <Layers3 className="size-3.5" />
              Limit Order Ticket
            </div>
            <CardTitle className="text-base font-semibold text-foreground">
              Place Limit Order
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Limit order ticket routed to the connected local chain.
            </CardDescription>
          </div>
          <CardAction className="justify-self-start lg:justify-self-end">
            <div className="rounded-lg bg-muted/50 px-3 py-2 text-right">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Account
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm font-medium text-foreground">
                <Wallet className="size-4 text-primary" />
                <span>
                  {currentAccount
                    ? `${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`
                    : "Disconnected"}
                </span>
              </div>
            </div>
          </CardAction>
        </div>
      </CardHeader>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-muted/50 px-3 py-2.5">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <DollarSign className="size-3.5 text-primary" />
                Notional
              </div>
              <div className="text-base font-semibold text-foreground">
                $
                {Number.isFinite(summary.notional)
                  ? summary.notional.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })
                  : "0"}
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-2.5">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <Gauge className="size-3.5 text-primary" />
                Slippage
              </div>
              <div className="text-base font-semibold text-foreground">
                {summary.slippagePct}%
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-2.5">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <Clock3 className="size-3.5 text-primary" />
                Deadline
              </div>
              <div className="text-base font-semibold text-foreground">
                {summary.deadlineLabel}
              </div>
            </div>
          </div>

          <FieldGroup className="gap-6">
            <Field>
              <FieldLabel htmlFor="side" className="text-sm font-semibold text-foreground">
                Side
              </FieldLabel>

              <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    size="lg"
                    className="w-full"
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
                    className="w-full"
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

              {form.formState.errors.side && (
                <FieldError>{form.formState.errors.side.message}</FieldError>
              )}
            </Field>

            <div className="grid gap-6 lg:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="market" className="text-sm font-semibold text-foreground">
                Market
                </FieldLabel>
                <Input
                  id="market"
                  className="h-11"
                  placeholder={tradeMarketConfig.label}
                  readOnly
                  {...form.register("market")}
                />
                {form.formState.errors.market && (
                  <FieldError>{form.formState.errors.market.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="amount" className="text-sm font-semibold text-foreground">
                Amount
                </FieldLabel>
                <InputGroup className="h-11">
                  <Input
                    id="amount"
                    className="h-11"
                    inputMode="decimal"
                    placeholder="1"
                    {...form.register("amount")}
                  />
                  <InputGroupAddon>
                    <InputGroupText>ETH</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {form.formState.errors.amount && (
                  <FieldError>{form.formState.errors.amount.message}</FieldError>
                )}
              </Field>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <Field>
                <FieldLabel htmlFor="price" className="text-sm font-semibold text-foreground">
                Limit Price
                </FieldLabel>
                <InputGroup className="h-11">
                  <InputGroupAddon>
                    <InputGroupText>$</InputGroupText>
                  </InputGroupAddon>
                  <Input
                    id="price"
                    className="h-11"
                    inputMode="decimal"
                    placeholder="2500"
                    {...form.register("price")}
                  />
                </InputGroup>
                {form.formState.errors.price && (
                  <FieldError>{form.formState.errors.price.message}</FieldError>
                )}
              </Field>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              <Field>
                <FieldLabel
                  htmlFor="slippageBps"
                  className="text-sm font-semibold text-foreground"
                >
                  Slippage
                </FieldLabel>
                <InputGroup className="h-11">
                  <Input
                    id="slippageBps"
                    className="h-11"
                    inputMode="numeric"
                    placeholder="50"
                    {...form.register("slippageBps")}
                  />
                  <InputGroupAddon>
                    <InputGroupText>bps</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {form.formState.errors.slippageBps && (
                  <FieldError>
                    {form.formState.errors.slippageBps.message}
                  </FieldError>
                )}
              </Field>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <SummaryRow label="Mode" value="Chain" />
                  <SummaryRow
                    label="Contract"
                    value={tradeOrderBookContract.address}
                    breakAll
                  />
                  <SummaryRow
                    label="Latest Tx"
                    value={submitTrade.data?.txHash ?? "No tx submitted yet"}
                    breakAll
                  />
                </div>
              </div>

              <div>
            <Field>
                <FieldLabel
                  htmlFor="deadlineSeconds"
                  className="text-sm font-semibold text-foreground"
                >
                  Deadline
                </FieldLabel>
                <InputGroup className="h-11">
                  <Input
                    id="deadlineSeconds"
                    className="h-11"
                    inputMode="numeric"
                    placeholder="60"
                    {...form.register("deadlineSeconds")}
                  />
                  <InputGroupAddon>
                    <InputGroupText>sec</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {form.formState.errors.deadlineSeconds && (
                  <FieldError>
                    {form.formState.errors.deadlineSeconds.message}
                  </FieldError>
                )}
              </Field>
              </div>
            </div>

            {!currentAccount && (
              <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
                Wallet is not connected. The form can be edited, but submission
                is disabled until an account is available.
              </div>
            )}

            {currentAccount && !isExpectedChain && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
                Wrong network. Connect wallet to chain {tradingStateChainId}
                before submitting to the TradeOrderBook contract.
              </div>
            )}

            {rootError && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
                {rootError}
              </div>
            )}
          </FieldGroup>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => form.reset(defaultValues)}
            disabled={submitTrade.isPending}
          >
            Reset
          </Button>

          <Button
            type="submit"
            size="lg"
            className="w-full px-6 sm:w-auto"
            disabled={!isReady}
          >
            {submitTrade.isPending ? "Signing / Sending..." : "Sign & Submit"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function SummaryRow(props: {
  label: string;
  value: string;
  breakAll?: boolean;
}) {
  return (
    <div className="rounded-md bg-background px-3 py-2">
      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {props.label}
      </div>
      <div
        className={`mt-1 text-sm font-medium text-foreground ${
          props.breakAll ? "break-all" : ""
        }`}
      >
        {props.value}
      </div>
    </div>
  );
}
