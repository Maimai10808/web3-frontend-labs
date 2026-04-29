import { createConfig, http } from "wagmi";
import { mainnet, arbitrum, bsc } from "wagmi/chains";
import { injected, coinbaseWallet, walletConnect } from "wagmi/connectors";
import { parseEther } from "viem";
import type {
  NetworkStatus,
  SignatureResult,
  SignIntentInput,
  TransactionIntentInput,
  TransactionResult,
  WalletAccount,
  WalletAdapter,
  WalletCapability,
} from "../types";
import { normalizeMultiChainError } from "../errors";
import { DEFAULT_CHAIN_BY_ECOSYSTEM } from "../chains";
import { getExplorerTxUrl } from "../explorer";

export const config = createConfig({
  chains: [mainnet, arbitrum, bsc],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: "multichain-wallet-demo",
    }),
    walletConnect({
      projectId: "demo-project-id",
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [bsc.id]: http(),
  },
  ssr: true,
});

type EvmAdapterDeps = {
  connectDefault: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  getAddress: () => string | undefined;
  getChainId: () => number | undefined;
  getConnectorName: () => string;
  switchChain: (chainId: number) => Promise<unknown>;
  personalSign: (message: string) => Promise<string>;
  signTypedData: (
    input: NonNullable<SignIntentInput["typedData"]>,
  ) => Promise<string>;
  sendNativeTransaction: (params: {
    to: string;
    value: string;
  }) => Promise<{ hash: string }>;
};

export class EvmAdapter implements WalletAdapter {
  public ecosystem = "evm" as const;

  constructor(private readonly deps: EvmAdapterDeps) {}

  async connect(): Promise<WalletAccount> {
    try {
      await this.deps.connectDefault();
      const account = await this.getAccount();
      if (!account) {
        throw new Error("Failed to get EVM account after connect");
      }
      return account;
    } catch (error) {
      throw normalizeMultiChainError(error, this.ecosystem);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.deps.disconnectWallet();
    } catch (error) {
      throw normalizeMultiChainError(error, this.ecosystem);
    }
  }

  async getAccount(): Promise<WalletAccount | null> {
    const address = this.deps.getAddress();
    if (!address) return null;

    return {
      ecosystem: "evm",
      address,
      displayAddress: `${address.slice(0, 6)}...${address.slice(-4)}`,
      providerName: this.deps.getConnectorName(),
      chainId: this.deps.getChainId(),
    };
  }

  async getNetworkStatus(): Promise<NetworkStatus> {
    const currentChainId = this.deps.getChainId();
    const expectedChainId = DEFAULT_CHAIN_BY_ECOSYSTEM.evm.chainId;

    return {
      ecosystem: "evm",
      currentChainId,
      expectedChainId,
      supported: [1, 42161, 56].includes(currentChainId ?? -1),
      wrongNetwork: !!currentChainId && currentChainId !== expectedChainId,
      switchRequired: !!currentChainId && currentChainId !== expectedChainId,
      switchAvailable: true,
      label:
        currentChainId === expectedChainId
          ? "Connected to expected EVM network"
          : "Wrong EVM network",
    };
  }

  getCapabilities(): WalletCapability {
    return {
      canSwitchNetwork: true,
      canPersonalSign: true,
      canSignTypedData: true,
      canSignMessage: false,
      canSendTransaction: true,
      canWriteContract: true,
      canSignPsbt: false,
    };
  }

  async switchNetwork(chainId: string | number): Promise<void> {
    try {
      await this.deps.switchChain(Number(chainId));
    } catch (error) {
      throw normalizeMultiChainError(error, this.ecosystem);
    }
  }

  async signIntent(input: SignIntentInput): Promise<SignatureResult> {
    try {
      const account = await this.getAccount();
      if (!account) {
        throw new Error("Wallet not connected");
      }

      if (input.kind === "personal_sign") {
        const signature = await this.deps.personalSign(input.message);
        return {
          kind: input.kind,
          signature,
          address: account.address,
          payloadPreview: input.message,
        };
      }

      if (input.kind === "eip712" && input.typedData) {
        const signature = await this.deps.signTypedData(input.typedData);
        return {
          kind: input.kind,
          signature,
          address: account.address,
          payloadPreview: JSON.stringify(input.typedData.message),
        };
      }

      throw new Error(`Unsupported EVM signature kind: ${input.kind}`);
    } catch (error) {
      throw normalizeMultiChainError(error, this.ecosystem);
    }
  }

  async sendTransaction(
    input: TransactionIntentInput,
  ): Promise<TransactionResult> {
    try {
      if (input.mode !== "native-transfer" || !input.to || !input.value) {
        throw new Error("EVM demo adapter only supports native transfer");
      }

      const tx = await this.deps.sendNativeTransaction({
        to: input.to,
        value: input.value,
      });

      return {
        ecosystem: "evm",
        txHash: tx.hash,
        explorerUrl: getExplorerTxUrl("evm", tx.hash),
        status: "pending",
        raw: {
          mode: input.mode,
          to: input.to,
          value: parseEther(input.value).toString(),
        },
      };
    } catch (error) {
      throw normalizeMultiChainError(error, this.ecosystem);
    }
  }
}
