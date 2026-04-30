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

type SeiAdapterDeps = {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  getAddress: () => string | undefined;
  getChainId: () => string | undefined;
  getWalletName: () => string;
  signArbitrary?: (
    chainId: string,
    signer: string,
    message: string,
  ) => Promise<{
    signature: string;
    pub_key: {
      type: string;
      value: string;
    };
  }>;
  sendTokens?: (
    from: string,
    to: string,
    amount: string,
  ) => Promise<{ transactionHash: string }>;
};

export class SeiAdapter implements WalletAdapter {
  public ecosystem = "sei" as const;

  constructor(private readonly deps: SeiAdapterDeps) {}

  async connect(): Promise<WalletAccount> {
    try {
      await this.deps.connectWallet();

      const account = await this.getAccount();
      if (!account) {
        throw new Error("Sei wallet not connected yet");
      }

      return account;
    } catch (error) {
      throw normalizeMultiChainError(error, this.ecosystem);
    }
  }

  async disconnect(): Promise<void> {
    try {
      this.deps.disconnectWallet();
    } catch (error) {
      throw normalizeMultiChainError(error, this.ecosystem);
    }
  }

  async getAccount(): Promise<WalletAccount | null> {
    const address = this.deps.getAddress();
    if (!address) return null;

    return {
      ecosystem: "sei",
      address,
      displayAddress: `${address.slice(0, 6)}...${address.slice(-4)}`,
      providerName: this.deps.getWalletName(),
      networkId: this.deps.getChainId(),
    };
  }

  async getNetworkStatus(): Promise<NetworkStatus> {
    return {
      ecosystem: "sei",
      currentNetworkId: this.deps.getChainId(),
      supported: true,
      wrongNetwork: false,
      switchRequired: false,
      switchAvailable: false,
      label: "Sei network is wallet-managed",
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
    try {
      const account = await this.getAccount();
      if (!account) {
        throw new Error("Sei wallet not connected");
      }
      if (!this.deps.signArbitrary) {
        throw new Error("Sei wallet does not support arbitrary signing");
      }

      const chainId = this.deps.getChainId();
      if (!chainId) {
        throw new Error("Missing Sei chainId");
      }

      const signed = await this.deps.signArbitrary(
        chainId,
        account.address,
        input.message,
      );

      return {
        kind: "sei_arbitrary",
        signature: signed.signature,
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
      const account = await this.getAccount();
      if (!account) {
        throw new Error("Sei wallet not connected");
      }
      if (!this.deps.sendTokens) {
        throw new Error("Sei wallet does not support sendTokens");
      }
      if (!input.to || !input.value) {
        throw new Error("Missing Sei tx params");
      }

      const tx = await this.deps.sendTokens(
        account.address,
        input.to,
        input.value,
      );

      return {
        ecosystem: "sei",
        txHash: tx.transactionHash,
        explorerUrl: getExplorerTxUrl("sei", tx.transactionHash),
        status: "pending",
      };
    } catch (error) {
      throw normalizeMultiChainError(error, this.ecosystem);
    }
  }
}
