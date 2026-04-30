export interface BtcInjectedWallet {
  name: string;
  connect(): Promise<string>;
  signMessage(message: string): Promise<string>;
  sendBitcoin(to: string, amountSats: number): Promise<string>;
  disconnect?(): Promise<void>;
}
