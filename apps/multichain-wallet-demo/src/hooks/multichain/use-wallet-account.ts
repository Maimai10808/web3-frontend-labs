"use client";

import { useMemo } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSendTransaction,
  useSignMessage,
  useSignTypedData,
  useSwitchChain,
} from "wagmi";
import { parseEther } from "viem";
import { EvmAdapter } from "@/lib/multichain/adapters/evm-adapter";
import type { WalletName } from "@solana/wallet-adapter-base";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { SolanaAdapter } from "@/lib/multichain/adapters/solana-adapter";
import { useBtcWallet } from "./use-btc-wallet";

import { useActiveEcosystem } from "./use-active-ecosystem";
import type { ChainEcosystem, WalletAdapter } from "@/lib/multichain/types";
import { useSeiWallet } from "./use-sei-wallet";

type ConnectionSummary = {
  ecosystem: ChainEcosystem;
  providerName: string;
  address: string;
  displayAddress: string;
  networkLabel?: string;
};

export function useWalletAccount() {
  const { ecosystem } = useActiveEcosystem();

  const account = useAccount();
  const { connectors, connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();
  const { signTypedDataAsync } = useSignTypedData();
  const { sendTransactionAsync } = useSendTransaction();
  const {
    adapter: seiAdapter,
    walletName: seiWalletName,
    address: seiAddress,
    availableWalletName: seiAvailableWalletName,
  } = useSeiWallet();

  const { connection } = useConnection();
  const {
    publicKey,
    connected,
    wallet,
    wallets,
    select,
    connect,
    disconnect,
    signMessage,
    sendTransaction,
  } = useWallet();

  const evmAdapter = useMemo<WalletAdapter>(
    () =>
      new EvmAdapter({
        connectDefault: async () => {
          const first = connectors[0];
          if (!first) {
            throw new Error("No EVM connector available");
          }
          await connectAsync({ connector: first });
        },
        disconnectWallet: () => disconnectAsync(),
        getAddress: () => account.address,
        getChainId: () => account.chainId,
        getConnectorName: () => account.connector?.name ?? "EVM Wallet",
        switchChain: (chainId) => switchChainAsync({ chainId }),
        personalSign: (message) => signMessageAsync({ message }),
        signTypedData: (typedData) =>
          signTypedDataAsync({
            domain: typedData.domain,
            types: typedData.types,
            primaryType: typedData.primaryType,
            message: typedData.message,
          }),
        sendNativeTransaction: async ({ to, value }) => {
          const hash = await sendTransactionAsync({
            to: to as `0x${string}`,
            value: parseEther(value),
          });
          return { hash };
        },
      }),
    [
      account.address,
      account.chainId,
      account.connector?.name,
      connectAsync,
      connectors,
      disconnectAsync,
      sendTransactionAsync,
      signMessageAsync,
      signTypedDataAsync,
      switchChainAsync,
    ],
  );

  const solanaAdapter = useMemo<WalletAdapter>(
    () =>
      new SolanaAdapter({
        connectWallet: async () => {
          if (!wallet) {
            throw new Error("Select a Solana wallet before connecting");
          }
          await connect();

          const address = wallet.adapter.publicKey?.toBase58();
          if (!address || !wallet.adapter.connected) {
            throw new Error("Failed to get Solana account after connect");
          }

          return {
            ecosystem: "solana",
            address,
            displayAddress: `${address.slice(0, 6)}...${address.slice(-4)}`,
            providerName: wallet.adapter.name,
            networkId: "solana-devnet",
          };
        },
        disconnectWallet: () => disconnect(),
        getPublicKey: () => publicKey,
        getConnected: () => connected,
        getWalletName: () => wallet?.adapter.name ?? "Solana Wallet",
        signMessage,
        sendTransaction,
        connection,
      }),
    [
      wallet,
      publicKey,
      connected,
      connect,
      disconnect,
      signMessage,
      sendTransaction,
      connection,
    ],
  );

  const {
    adapter: btcAdapter,
    walletName: btcWalletName,
    address: btcAddress,
    selectWallet: selectBtcWallet,
  } = useBtcWallet();

  const adapter = useMemo<WalletAdapter | null>(() => {
    if (ecosystem === "evm") return evmAdapter;
    if (ecosystem === "solana") return solanaAdapter;
    if (ecosystem === "btc") return btcAdapter;
    if (ecosystem === "sei") return seiAdapter;
    return null;
  }, [btcAdapter, ecosystem, evmAdapter, seiAdapter, solanaAdapter]);

  const currentConnection = useMemo<ConnectionSummary | null>(() => {
    if (ecosystem === "evm" && account.isConnected && account.address) {
      return {
        ecosystem: "evm",
        providerName: account.connector?.name ?? "EVM Wallet",
        address: account.address,
        displayAddress: `${account.address.slice(0, 6)}...${account.address.slice(-4)}`,
        networkLabel: account.chainId ? `chain ${account.chainId}` : undefined,
      };
    }

    if (ecosystem === "solana" && connected && publicKey) {
      const address = publicKey.toBase58();
      return {
        ecosystem: "solana",
        providerName: wallet?.adapter.name ?? "Solana Wallet",
        address,
        displayAddress: `${address.slice(0, 6)}...${address.slice(-4)}`,
        networkLabel: "solana-devnet",
      };
    }

    if (ecosystem === "btc" && btcAddress && btcWalletName) {
      return {
        ecosystem: "btc",
        providerName: btcWalletName,
        address: btcAddress,
        displayAddress: `${btcAddress.slice(0, 6)}...${btcAddress.slice(-4)}`,
        networkLabel: "bitcoin-mainnet",
      };
    }

    if (ecosystem === "sei" && seiAddress) {
      return {
        ecosystem: "sei",
        providerName: seiWalletName ?? "Sei Wallet",
        address: seiAddress,
        displayAddress: `${seiAddress.slice(0, 6)}...${seiAddress.slice(-4)}`,
        networkLabel: "pacific-1",
      };
    }

    return null;
  }, [
    ecosystem,
    account.isConnected,
    account.address,
    account.connector?.name,
    account.chainId,
    connected,
    publicKey,
    wallet?.adapter.name,
    btcAddress,
    btcWalletName,
    seiAddress,
    seiWalletName,
  ]);

  const disconnectAllWallets = async (targetEcosystem?: ChainEcosystem) => {
    await Promise.allSettled([
      targetEcosystem !== "evm" && account.isConnected
        ? disconnectAsync()
        : Promise.resolve(),
      targetEcosystem !== "solana" && connected
        ? disconnect()
        : Promise.resolve(),
      targetEcosystem !== "btc" && (btcAddress || btcWalletName)
        ? btcAdapter.disconnect()
        : Promise.resolve(),
      targetEcosystem !== "sei" && seiAddress
        ? seiAdapter.disconnect()
        : Promise.resolve(),
    ]);
  };

  return {
    adapter,
    ecosystem,
    currentConnection,
    evmConnectors: connectors,
    connectEvmWith: async (connectorId: string) => {
      const target = connectors.find(
        (connector) => connector.id === connectorId,
      );
      if (!target) {
        throw new Error(`Connector not found: ${connectorId}`);
      }
      await connectAsync({ connector: target });
    },
    evmStatus: account.status,
    evmIsConnected: account.isConnected,
    solanaWallets: wallets.map((item) => ({
      label: item.adapter.name.toString(),
      value: item.adapter.name,
    })),
    solanaWalletName: wallet?.adapter.name ?? null,
    selectSolanaWallet: (walletName: WalletName) => {
      select(walletName);
    },
    btcWalletName,
    btcAddress,
    selectBtcWallet,
    seiWalletName,
    seiAddress,
    seiAvailableWalletName,
    disconnectAllWallets,
  };
}
