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
import { MockSolanaAdapter } from "@/lib/multichain/adapters/mock-solana-adapter";
import { MockBtcAdapter } from "@/lib/multichain/adapters/mock-btc-adapter";
import { MockSeiAdapter } from "@/lib/multichain/adapters/mock-sei-adapter";
import { useActiveEcosystem } from "./use-active-ecosystem";
import type { WalletAdapter } from "@/lib/multichain/types";

export function useWalletAccount() {
  const { ecosystem } = useActiveEcosystem();

  const account = useAccount();
  const { connectors, connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();
  const { signTypedDataAsync } = useSignTypedData();
  const { sendTransactionAsync } = useSendTransaction();

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

  const solanaAdapter = useMemo(() => new MockSolanaAdapter(), []);
  const btcAdapter = useMemo(() => new MockBtcAdapter(), []);
  const seiAdapter = useMemo(() => new MockSeiAdapter(), []);

  const adapter = useMemo<WalletAdapter | null>(() => {
    if (ecosystem === "evm") return evmAdapter;
    if (ecosystem === "solana") return solanaAdapter;
    if (ecosystem === "btc") return btcAdapter;
    if (ecosystem === "sei") return seiAdapter;
    return null;
  }, [btcAdapter, ecosystem, evmAdapter, seiAdapter, solanaAdapter]);

  return {
    adapter,
    ecosystem,
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
  };
}
