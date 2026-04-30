export type ChainEcosystem = "evm" | "solana" | "btc" | "sei" | "ton";

export type ChainNamespace = "evm" | "solana" | "btc" | "sei";

export type WalletConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export type UnifiedWalletAccount = {
  namespace: ChainNamespace;
  walletName: string;
  address: string;
  chainId?: string;
};

export type UnifiedWalletState = {
  status: WalletConnectionStatus;
  account?: UnifiedWalletAccount;
  error?: string;
};

export type SignatureKind =
  | "personal_sign"
  | "eip712"
  | "solana_message"
  | "btc_message"
  | "btc_psbt"
  | "sei_arbitrary";

export type WalletCapability = {
  canSwitchNetwork: boolean;
  canPersonalSign: boolean;
  canSignTypedData: boolean;
  canSignMessage: boolean;
  canSendTransaction: boolean;
  canWriteContract: boolean;
  canSignPsbt: boolean;
};

export type ChainDefinition = {
  id: string;
  ecosystem: ChainEcosystem;
  name: string;
  chainId?: number;
  rpcUrl?: string;
  explorerUrl?: string;
  nativeCurrency: string;
  testnet: boolean;
};

export type WalletAccount = {
  ecosystem: ChainEcosystem;
  address: string;
  displayAddress: string;
  providerName: string;
  chainId?: number;
  networkId?: string;
};

export type SignIntentInput = {
  kind: SignatureKind;
  message: string;
  typedData?: {
    domain: Record<string, unknown>;
    types: Record<string, Array<{ name: string; type: string }>>;
    primaryType: string;
    message: Record<string, unknown>;
  };
};

export type SignatureResult = {
  kind: SignatureKind;
  walletName: string;
  signature: string;
  address: string;
  payloadPreview: string;
};

export type TransactionIntentInput = {
  mode: "native-transfer" | "contract-write" | "program-call" | "btc-psbt";
  to?: string;
  value?: string;
  contract?: {
    address: string;
    abiName: string;
    functionName: string;
    args?: readonly unknown[];
  };
};

export type TransactionResult = {
  ecosystem: ChainEcosystem;
  txHash: string;
  explorerUrl?: string;
  status: "pending" | "confirmed" | "failed";
  raw?: Record<string, unknown>;
};

export type NetworkStatus = {
  ecosystem: ChainEcosystem;
  currentChainId?: number;
  currentNetworkId?: string;
  expectedChainId?: number;
  supported: boolean;
  wrongNetwork: boolean;
  switchRequired: boolean;
  switchAvailable: boolean;
  label: string;
};

export type WalletBindingStatus = "unbound" | "verifying" | "bound" | "failed";

export type MultiChainErrorCode =
  | "WALLET_NOT_INSTALLED"
  | "USER_REJECTED"
  | "UNSUPPORTED_NETWORK"
  | "SWITCH_NETWORK_UNAVAILABLE"
  | "SIGNATURE_NOT_SUPPORTED"
  | "TRANSACTION_NOT_SUPPORTED"
  | "RPC_ERROR"
  | "BIND_FAILED"
  | "UNKNOWN";

export type MultiChainError = {
  code: MultiChainErrorCode;
  message: string;
  cause?: unknown;
  ecosystem?: ChainEcosystem;
};

export type EventLogEntry = {
  id: string;
  level: "info" | "success" | "error";
  title: string;
  message: string;
  timestamp: string;
};

export interface WalletAdapter {
  ecosystem: ChainEcosystem;
  connect(): Promise<WalletAccount>;
  disconnect(): Promise<void>;
  getAccount(): Promise<WalletAccount | null>;
  getNetworkStatus(): Promise<NetworkStatus>;
  getCapabilities(): WalletCapability;
  switchNetwork?(chainId: string | number): Promise<void>;
  signIntent(input: SignIntentInput): Promise<SignatureResult>;
  sendTransaction?(input: TransactionIntentInput): Promise<TransactionResult>;
}
