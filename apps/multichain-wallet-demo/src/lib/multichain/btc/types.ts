export type BtcWalletConnectResult =
  | string[]
  | { address?: string; addresses?: string[] }
  | string
  | null
  | undefined;

export type UnisatProvider = {
  requestAccounts?: () => Promise<BtcWalletConnectResult>;
  getAccounts?: () => Promise<BtcWalletConnectResult>;
  signMessage?: (
    messageOrAddress: string,
    maybeMessage?: string,
  ) => Promise<string>;
  request?: (args: {
    method: string;
    params?: unknown[];
  }) => Promise<unknown>;
  sendBitcoin: (to: string, amountSats: number) => Promise<string>;
};

export type OkxBitcoinProvider = {
  connect?: () => Promise<BtcWalletConnectResult>;
  requestAccounts?: () => Promise<BtcWalletConnectResult>;
  getAccounts?: () => Promise<BtcWalletConnectResult>;
  signMessage?: (
    messageOrAddress: string,
    maybeMessage?: string,
  ) => Promise<string>;
  request?: (args: {
    method: string;
    params?: unknown[];
  }) => Promise<unknown>;
  sendBitcoin: (to: string, amountSats: number) => Promise<string>;
};

export interface BtcInjectedWallet {
  name: string;
  connect(): Promise<string>;
  signMessage(message: string): Promise<string>;
  sendBitcoin(to: string, amountSats: number): Promise<string>;
  disconnect?(): Promise<void>;
}

declare global {
  interface Window {
    unisat?: UnisatProvider;
    okxwallet?: {
      bitcoin?: OkxBitcoinProvider;
    };
  }
}
