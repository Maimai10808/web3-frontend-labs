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
import { normalizeMultiChainError } from "../errors";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

type SolanaAdapterDeps = {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  getPublicKey: () => PublicKey | null;
  getConnected: () => boolean;
  getWalletName: () => string;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
  sendTransaction?: (
    transaction: Transaction,
    connection: Connection,
  ) => Promise<string>;
  connection: Connection;
};

export class SolanaAdapter implements WalletAdapter {
  public ecosystem = "solana" as const;

  constructor(private readonly deps: SolanaAdapterDeps) {}

  async connect(): Promise<WalletAccount> {
    try {
      await this.deps.connectWallet();
      const account = await this.getAccount();
      if (!account) {
        throw new Error("Failed to get Solana account after connect");
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
    const publicKey = this.deps.getPublicKey();
    if (!publicKey || !this.deps.getConnected()) return null;

    const address = publicKey.toBase58();

    return {
      ecosystem: "solana",
      address,
      displayAddress: `${address.slice(0, 6)}...${address.slice(-4)}`,
      providerName: this.deps.getWalletName(),
      networkId: "solana-devnet",
    };
  }

  async getNetworkStatus(): Promise<NetworkStatus> {
    return {
      ecosystem: "solana",
      currentNetworkId: "solana-devnet",
      supported: true,
      wrongNetwork: false,
      switchRequired: false,
      switchAvailable: false,
      label: "Solana network is managed by wallet/provider context",
    };
  }

  getCapabilities(): WalletCapability {
    return {
      canSwitchNetwork: false,
      canPersonalSign: false,
      canSignTypedData: false,
      canSignMessage: !!this.deps.signMessage,
      canSendTransaction: !!this.deps.sendTransaction,
      canWriteContract: false,
      canSignPsbt: false,
    };
  }

  async signIntent(input: SignIntentInput): Promise<SignatureResult> {
    try {
      const account = await this.getAccount();
      if (!account) throw new Error("Wallet not connected");
      if (!this.deps.signMessage) {
        throw new Error("Solana wallet does not support signMessage");
      }

      const encoded = new TextEncoder().encode(input.message);
      const signatureBytes = await this.deps.signMessage(encoded);
      const signature = Buffer.from(signatureBytes).toString("base64");

      return {
        kind: "solana_message",
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
      const account = await this.getAccount();
      if (!account) throw new Error("Wallet not connected");
      if (!this.deps.sendTransaction) {
        throw new Error("Solana wallet does not support sendTransaction");
      }

      if (input.mode !== "native-transfer" || !input.to || !input.value) {
        throw new Error("Solana demo only supports native transfer");
      }

      const from = this.deps.getPublicKey();
      if (!from) throw new Error("Missing publicKey");

      const to = new PublicKey(input.to);
      const lamports = Math.floor(Number(input.value) * 1e9);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: from,
          toPubkey: to,
          lamports,
        }),
      );

      const signature = await this.deps.sendTransaction(
        transaction,
        this.deps.connection,
      );

      return {
        ecosystem: "solana",
        txHash: signature,
        explorerUrl: getExplorerTxUrl("solana", signature),
        status: "pending",
        raw: {
          mode: input.mode,
          to: input.to,
          lamports,
        },
      };
    } catch (error) {
      throw normalizeMultiChainError(error, this.ecosystem);
    }
  }
}
