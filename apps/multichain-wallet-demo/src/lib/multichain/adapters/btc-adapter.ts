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
import { getExplorerTxUrl } from "../explorer";
import type { BtcInjectedWallet } from "../btc/types";

type BtcAdapterDeps = {
  wallet: BtcInjectedWallet | null;
  setWallet: (wallet: BtcInjectedWallet | null) => void;
  address: string | null;
  setAddress: (address: string | null) => void;
};

export class BtcAdapter implements WalletAdapter {
  public ecosystem = "btc" as const;

  constructor(private readonly deps: BtcAdapterDeps) {}

  async connect(): Promise<WalletAccount> {
    try {
      if (!this.deps.wallet) {
        throw new Error("BTC wallet not selected");
      }

      const address = await this.deps.wallet.connect();
      this.deps.setAddress(address);

      return {
        ecosystem: "btc",
        address,
        displayAddress: `${address.slice(0, 6)}...${address.slice(-4)}`,
        providerName: this.deps.wallet.name,
        networkId: "bitcoin-mainnet",
      };
    } catch (error) {
      throw normalizeMultiChainError(error, this.ecosystem);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.deps.wallet?.disconnect?.();
      this.deps.setAddress(null);
      this.deps.setWallet(null);
    } catch (error) {
      throw normalizeMultiChainError(error, this.ecosystem);
    }
  }

  async getAccount(): Promise<WalletAccount | null> {
    if (!this.deps.address || !this.deps.wallet) {
      return null;
    }

    return {
      ecosystem: "btc",
      address: this.deps.address,
      displayAddress: `${this.deps.address.slice(0, 6)}...${this.deps.address.slice(-4)}`,
      providerName: this.deps.wallet.name,
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
      label: "BTC network is wallet-managed",
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
    try {
      const account = await this.getAccount();
      if (!account || !this.deps.wallet) {
        throw new Error("BTC wallet not connected");
      }

      const signature = await this.deps.wallet.signMessage(input.message);

      return {
        kind: input.kind === "btc_psbt" ? "btc_psbt" : "btc_message",
        signature,
        address: account.address,
        payloadPreview: input.message,
      };
    } catch (error) {
      throw normalizeMultiChainError(error, this.ecosystem);
    }
  }

  async sendTransaction(
    input: TransactionIntentInput,
  ): Promise<TransactionResult> {
    try {
      if (!this.deps.wallet) {
        throw new Error("BTC wallet not connected");
      }

      if (!input.to || !input.value) {
        throw new Error("Missing BTC transaction params");
      }

      const sats = Math.floor(Number(input.value) * 1e8);
      if (!Number.isFinite(sats) || sats <= 0) {
        throw new Error("Invalid BTC amount");
      }

      const txHash = await this.deps.wallet.sendBitcoin(input.to, sats);

      return {
        ecosystem: "btc",
        txHash,
        explorerUrl: getExplorerTxUrl("btc", txHash),
        status: "pending",
        raw: {
          to: input.to,
          sats,
        },
      };
    } catch (error) {
      throw normalizeMultiChainError(error, this.ecosystem);
    }
  }
}
