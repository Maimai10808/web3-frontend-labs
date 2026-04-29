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

export class MockBtcAdapter implements WalletAdapter {
  public ecosystem = "btc" as const;
  private connected = false;

  async connect(): Promise<WalletAccount> {
    this.connected = true;

    return {
      ecosystem: "btc",
      address: "bc1qmultichaindemo0w4llet0address00000000000",
      displayAddress: "bc1qmu...0000",
      providerName: "Mock BTC Wallet",
      networkId: "bitcoin-mainnet",
    };
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async getAccount(): Promise<WalletAccount | null> {
    if (!this.connected) return null;

    return {
      ecosystem: "btc",
      address: "bc1qmultichaindemo0w4llet0address00000000000",
      displayAddress: "bc1qmu...0000",
      providerName: "Mock BTC Wallet",
      networkId: "bitcoin-mainnet",
    };
  }

  async getNetworkStatus(): Promise<NetworkStatus> {
    return {
      ecosystem: "btc",
      currentNetworkId: "bitcoin-mainnet",
      supported: true,
      wrongNetwork: false,
      switchRequired: false,
      switchAvailable: false,
      label: "BTC wallet manages its own network context",
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
      canSignPsbt: true,
    };
  }

  async signIntent(input: SignIntentInput): Promise<SignatureResult> {
    const account = await this.getAccount();
    if (!account) {
      throw new Error("Wallet not connected");
    }

    return {
      kind: input.kind === "btc_psbt" ? "btc_psbt" : "btc_message",
      signature: `mock-btc-signature:${Date.now()}`,
      address: account.address,
      payloadPreview: input.message,
    };
  }

  async sendTransaction(
    _input: TransactionIntentInput,
  ): Promise<TransactionResult> {
    const txHash = `mock-btc-tx-${Date.now()}`;

    return {
      ecosystem: "btc",
      txHash,
      explorerUrl: getExplorerTxUrl("btc", txHash),
      status: "pending",
    };
  }
}
