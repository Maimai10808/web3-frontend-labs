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
import { getExplorerTxUrl } from "../explorer";

export class MockSolanaAdapter implements WalletAdapter {
  public ecosystem = "solana" as const;
  private connected = false;

  async connect(): Promise<WalletAccount> {
    this.connected = true;

    return {
      ecosystem: "solana",
      address: "So1anaDemoPubKey111111111111111111111111111",
      displayAddress: "So1ana...1111",
      providerName: "Mock Solana Wallet",
      networkId: "mainnet-beta",
    };
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async getAccount(): Promise<WalletAccount | null> {
    if (!this.connected) return null;

    return {
      ecosystem: "solana",
      address: "So1anaDemoPubKey111111111111111111111111111",
      displayAddress: "So1ana...1111",
      providerName: "Mock Solana Wallet",
      networkId: "mainnet-beta",
    };
  }

  async getNetworkStatus(): Promise<NetworkStatus> {
    return {
      ecosystem: "solana",
      currentNetworkId: "mainnet-beta",
      supported: true,
      wrongNetwork: false,
      switchRequired: false,
      switchAvailable: false,
      label: "Solana network is controlled by wallet/provider context",
    };
  }

  getCapabilities(): WalletCapability {
    return {
      canSwitchNetwork: false,
      canPersonalSign: false,
      canSignTypedData: false,
      canSignMessage: true,
      canSendTransaction: true,
      canWriteContract: false,
      canSignPsbt: false,
    };
  }

  async signIntent(input: SignIntentInput): Promise<SignatureResult> {
    const account = await this.getAccount();
    if (!account) {
      throw new Error("Wallet not connected");
    }

    return {
      kind: "solana_message",
      signature: `mock-solana-signature:${Date.now()}`,
      address: account.address,
      payloadPreview: input.message,
    };
  }

  async sendTransaction(
    _input: TransactionIntentInput,
  ): Promise<TransactionResult> {
    const txHash = `mock-solana-tx-${Date.now()}`;

    return {
      ecosystem: "solana",
      txHash,
      explorerUrl: getExplorerTxUrl("solana", txHash),
      status: "pending",
    };
  }
}
