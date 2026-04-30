import type { BtcInjectedWallet } from "./types";

declare global {
  interface Window {
    unisat?: {
      requestAccounts: () => Promise<string[]>;
      signMessage: (message: string) => Promise<string>;
      sendBitcoin: (to: string, amount: number) => Promise<string>;
    };
  }
}

export class UnisatWallet implements BtcInjectedWallet {
  name = "Unisat";

  async connect(): Promise<string> {
    if (typeof window === "undefined" || !window.unisat) {
      throw new Error("Unisat wallet not installed");
    }

    const accounts = await window.unisat.requestAccounts();
    if (!accounts?.[0]) {
      throw new Error("No BTC account returned from Unisat");
    }

    return accounts[0];
  }

  async signMessage(message: string): Promise<string> {
    if (typeof window === "undefined" || !window.unisat) {
      throw new Error("Unisat wallet not installed");
    }

    return window.unisat.signMessage(message);
  }

  async sendBitcoin(to: string, amountSats: number): Promise<string> {
    if (typeof window === "undefined" || !window.unisat) {
      throw new Error("Unisat wallet not installed");
    }

    return window.unisat.sendBitcoin(to, amountSats);
  }
}
