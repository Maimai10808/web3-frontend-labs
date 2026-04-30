// src/components/.../wallet-control-panel.tsx
"use client";

import {
  formatNetworkValue,
  useWalletControlPanel,
} from "@/hooks/multichain/use-wallet-control-panel";
import { EcosystemSwitcher } from "./ecosystem-switcher";

export function WalletControlPanel() {
  const {
    ecosystem,
    evmWalletOptions,
    selectedEvmWalletId,
    selectEvmWallet,
    solanaWalletOptions,
    selectedSolanaWalletId,
    selectSolanaWallet,
    btcWalletName,
    selectBtcWallet,
    seiAvailableWallets,
    selectedSeiWallet,
    selectSeiWallet,

    isBusy,
    unifiedWallet,

    networkStatus,
    currentTarget,
    statusLabel,
    statusClassName,

    handleConnect,
    handleDisconnect,
    handleSwitchNetwork,
  } = useWalletControlPanel();

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

          <div className="sm:min-w-55">
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
          <EvmWalletConnector
            isBusy={isBusy}
            options={evmWalletOptions}
            selectedId={selectedEvmWalletId}
            onSelect={selectEvmWallet}
            onConnect={handleConnect}
          />
        ) : null}

        {ecosystem === "btc" ? (
          <BtcWalletConnector
            isBusy={isBusy}
            selectedWallet={btcWalletName}
            onSelect={selectBtcWallet}
            onConnect={handleConnect}
          />
        ) : null}

        {ecosystem === "solana" ? (
          <SolanaWalletConnector
            isBusy={isBusy}
            options={solanaWalletOptions}
            selectedId={selectedSolanaWalletId}
            onSelect={selectSolanaWallet}
            onConnect={handleConnect}
          />
        ) : null}

        {ecosystem === "sei" ? (
          <SeiWalletConnector
            isBusy={isBusy}
            wallets={seiAvailableWallets}
            selectedWallet={selectedSeiWallet}
            onSelect={selectSeiWallet}
            onConnect={handleConnect}
          />
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

      <NetworkStatusView
        networkStatus={networkStatus}
        currentTargetName={currentTarget.name}
        statusLabel={statusLabel}
        statusClassName={statusClassName}
        onSwitchNetwork={handleSwitchNetwork}
      />
    </section>
  );
}

type WalletOption = {
  id: string;
  label: string;
};

function EvmWalletConnector(props: {
  isBusy: boolean;
  options: Array<WalletOption & { id: "metamask" | "okx" | "coinbase" | "walletconnect" | "injected" }>;
  selectedId?: "metamask" | "okx" | "coinbase" | "walletconnect" | "injected" | null;
  onSelect: (
    id: "metamask" | "okx" | "coinbase" | "walletconnect" | "injected",
  ) => void;
  onConnect: () => void;
}) {
  const selectedLabel =
    props.options.find((option) => option.id === props.selectedId)?.label ??
    "EVM Wallet";

  return (
    <div className="grid gap-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {props.options.map((walletOption) => (
          <button
            key={walletOption.id}
            type="button"
            onClick={() => props.onSelect(walletOption.id)}
            disabled={props.isBusy}
            className={
              props.selectedId === walletOption.id
                ? activeButtonClassName("blue")
                : inactiveButtonClassName
            }
          >
            {walletOption.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={props.onConnect}
        disabled={props.isBusy || !props.selectedId}
        className={activeButtonClassName("blue")}
      >
        {props.selectedId ? `Connect ${selectedLabel}` : "Connect EVM Wallet"}
      </button>
    </div>
  );
}

function BtcWalletConnector(props: {
  isBusy: boolean;
  selectedWallet?: string | null;
  onSelect: (wallet: "unisat" | "okx") => void;
  onConnect: () => void;
}) {
  return (
    <div className="grid gap-3">
      <SelectedWalletBox
        label="Selected BTC Wallet"
        value={props.selectedWallet ?? "None"}
      />

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => props.onSelect("unisat")}
          disabled={props.isBusy}
          className={
            props.selectedWallet === "unisat"
              ? activeButtonClassName("orange")
              : inactiveButtonClassName
          }
        >
          Select Unisat
        </button>

        <button
          type="button"
          onClick={() => props.onSelect("okx")}
          disabled={props.isBusy}
          className={
            props.selectedWallet === "okx"
              ? activeButtonClassName("emerald")
              : inactiveButtonClassName
          }
        >
          Select OKX BTC
        </button>
      </div>

      <button
        type="button"
        onClick={props.onConnect}
        disabled={props.isBusy || !props.selectedWallet}
        className={activeButtonClassName("blue")}
      >
        Connect BTC Wallet
      </button>
    </div>
  );
}

function SolanaWalletConnector(props: {
  isBusy: boolean;
  options: Array<WalletOption & { id: "phantom" | "solflare" | "okx" | "metamask" }>;
  selectedId?: "phantom" | "solflare" | "okx" | "metamask" | null;
  onSelect: (id: "phantom" | "solflare" | "okx" | "metamask") => void;
  onConnect: () => void;
}) {
  const selectedLabel =
    props.options.find((option) => option.id === props.selectedId)?.label ??
    "Unknown";

  return (
    <div className="grid gap-3">
      <SelectedWalletBox
        label="Selected Solana Wallet"
        value={props.selectedId ? selectedLabel : "None"}
      />

      <div className="grid gap-2 sm:grid-cols-2">
        {props.options.map((walletOption) => (
          <button
            key={walletOption.id}
            type="button"
            onClick={() => props.onSelect(walletOption.id)}
            disabled={props.isBusy}
            className={
              props.selectedId === walletOption.id
                ? activeButtonClassName("violet")
                : inactiveButtonClassName
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
        onClick={props.onConnect}
        disabled={props.isBusy || !props.selectedId}
        className={activeButtonClassName("violet")}
      >
        {props.selectedId
          ? `Connect ${selectedLabel}`
          : "Connect Solana Wallet"}
      </button>
    </div>
  );
}

function SeiWalletConnector(props: {
  isBusy: boolean;
  wallets: Array<{
    type: "compass" | "keplr" | "leap";
    walletName: string;
  }>;
  selectedWallet?: "compass" | "keplr" | "leap" | null;
  onSelect: (wallet: "compass" | "keplr" | "leap") => void;
  onConnect: () => void;
}) {
  const selectedLabel =
    props.wallets.find((wallet) => wallet.type === props.selectedWallet)
      ?.walletName ?? "Unknown";

  return (
    <div className="grid gap-3">
      <SelectedWalletBox
        label="Selected Sei Wallet"
        value={props.selectedWallet ? selectedLabel : "None"}
      />

      <div className="grid gap-2 sm:grid-cols-3">
        {props.wallets.map((wallet) => (
          <button
            key={wallet.type}
            type="button"
            onClick={() => props.onSelect(wallet.type)}
            disabled={props.isBusy}
            className={
              props.selectedWallet === wallet.type
                ? activeButtonClassName("cyan")
                : inactiveButtonClassName
            }
          >
            Select {wallet.walletName}
          </button>
        ))}
      </div>

      {props.wallets.length === 0 ? (
        <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">
          No Sei wallet detected. Install Compass, Keplr, or Leap.
        </p>
      ) : null}

      <button
        type="button"
        onClick={props.onConnect}
        disabled={props.isBusy || !props.selectedWallet}
        className={activeButtonClassName("cyan")}
      >
        {props.selectedWallet
          ? `Connect ${selectedLabel}`
          : "Connect Sei Wallet"}
      </button>
    </div>
  );
}

function NetworkStatusView(props: {
  networkStatus:
    | {
        ecosystem?: string;
        currentChainId?: string | number | null;
        expectedChainId?: string | number | null;
        switchRequired?: boolean;
        switchAvailable?: boolean;
      }
    | null
    | undefined;
  currentTargetName: string;
  statusLabel: string;
  statusClassName: string;
  onSwitchNetwork: () => void;
}) {
  const { networkStatus } = props;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">Network Status</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            Verify whether the selected wallet is connected to the expected
            network.
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${props.statusClassName}`}
        >
          {props.statusLabel}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InfoItem
          label="Ecosystem"
          value={formatNetworkValue(networkStatus?.ecosystem)}
        />
        <InfoItem label="Target Network" value={props.currentTargetName} />
        <InfoItem
          label="Current Chain ID"
          value={formatNetworkValue(networkStatus?.currentChainId)}
        />
        <InfoItem
          label="Expected Chain ID"
          value={formatNetworkValue(networkStatus?.expectedChainId)}
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
          onClick={props.onSwitchNetwork}
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

      {!networkStatus?.switchAvailable && networkStatus?.ecosystem !== "evm" ? (
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

const inactiveButtonClassName =
  "rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50";

function activeButtonClassName(
  color: "blue" | "orange" | "emerald" | "violet" | "cyan",
) {
  const classNames = {
    blue: "rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
    orange:
      "rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50",
    emerald:
      "rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50",
    violet:
      "rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50",
    cyan: "rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50",
  };

  return classNames[color];
}
