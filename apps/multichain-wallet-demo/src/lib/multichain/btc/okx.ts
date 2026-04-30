import type { BtcInjectedWallet } from "./types";

declare global {
  interface Window {
    okxwallet?: {
      bitcoin?: {
        connect: () => Promise<{ address: string }>;
        signMessage: (message: string) => Promise<string>;
        sendBitcoin: (to: string, amount: number) => Promise<string>;
      };
    };
  }
}

export class OkxBtcWallet implements BtcInjectedWallet {
  name = "OKX BTC";

  async connect(): Promise<string> {
    if (typeof window === "undefined" || !window.okxwallet?.bitcoin) {
      throw new Error("OKX BTC wallet not installed");
    }

    const result = await window.okxwallet.bitcoin.connect();
    if (!result?.address) {
      throw new Error("No BTC address returned from OKX wallet");
    }

    return result.address;
  }

  async signMessage(message: string): Promise<string> {
    if (typeof window === "undefined" || !window.okxwallet?.bitcoin) {
      throw new Error("OKX BTC wallet not installed");
    }

    return window.okxwallet.bitcoin.signMessage(message);
  }

  async sendBitcoin(to: string, amountSats: number): Promise<string> {
    if (typeof window === "undefined" || !window.okxwallet?.bitcoin) {
      throw new Error("OKX BTC wallet not installed");
    }

    return window.okxwallet.bitcoin.sendBitcoin(to, amountSats);
  }
}
