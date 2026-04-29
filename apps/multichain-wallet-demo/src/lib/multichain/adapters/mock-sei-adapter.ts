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

export class MockSeiAdapter implements WalletAdapter {
  public ecosystem = "sei" as const;
  private connected = false;

  async connect(): Promise<WalletAccount> {
    this.connected = true;

    return {
      ecosystem: "sei",
      address: "sei1multichaindemowallet0000000000000000",
      displayAddress: "sei1mu...0000",
      providerName: "Mock Sei Wallet",
      networkId: "sei-mainnet",
    };
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async getAccount(): Promise<WalletAccount | null> {
    if (!this.connected) return null;

    return {
      ecosystem: "sei",
      address: "sei1multichaindemowallet0000000000000000",
      displayAddress: "sei1mu...0000",
      providerName: "Mock Sei Wallet",
      networkId: "sei-mainnet",
    };
  }

  async getNetworkStatus(): Promise<NetworkStatus> {
    return {
      ecosystem: "sei",
      currentNetworkId: "sei-mainnet",
      supported: true,
      wrongNetwork: false,
      switchRequired: false,
      switchAvailable: false,
      label: "Sei wallet manages its own network context",
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
      kind: "sei_arbitrary",
      signature: `mock-sei-signature:${Date.now()}`,
      address: account.address,
      payloadPreview: input.message,
    };
  }

  async sendTransaction(
    _input: TransactionIntentInput,
  ): Promise<TransactionResult> {
    const txHash = `mock-sei-tx-${Date.now()}`;

    return {
      ecosystem: "sei",
      txHash,
      explorerUrl: getExplorerTxUrl("sei", txHash),
      status: "pending",
    };
  }
}
