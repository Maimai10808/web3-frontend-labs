import type {
  BtcInjectedWallet,
  BtcWalletConnectResult,
  UnisatProvider,
} from "./types";

function debugBtc(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.debug("[btc-wallet]", ...args);
  }
}

function getUnisatProvider(): UnisatProvider | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.unisat;
}

function normalizeBtcAddress(result: BtcWalletConnectResult) {
  if (Array.isArray(result)) {
    return result[0];
  }

  if (typeof result === "string") {
    return result;
  }

  if (result && typeof result === "object") {
    if ("address" in result && typeof result.address === "string") {
      return result.address;
    }

    if (
      "addresses" in result &&
      Array.isArray(result.addresses) &&
      typeof result.addresses[0] === "string"
    ) {
      return result.addresses[0];
    }
  }

  return undefined;
}

export class UnisatWallet implements BtcInjectedWallet {
  name = "Unisat";

  async connect(): Promise<string> {
    const provider = getUnisatProvider();
    debugBtc("selected wallet", this.name, "provider detected", !!provider);

    if (!provider) {
      throw new Error("Unisat wallet not installed");
    }

    const rawResult = provider.requestAccounts
      ? await provider.requestAccounts()
      : provider.getAccounts
        ? await provider.getAccounts()
        : undefined;
    debugBtc("raw connect result", rawResult);

    const address = normalizeBtcAddress(rawResult);
    if (!address) {
      console.warn("[btc-wallet] Unexpected Unisat connect result", rawResult);
      throw new Error("No BTC account returned from Unisat");
    }

    return address;
  }

  async signMessage(message: string): Promise<string> {
    const provider = getUnisatProvider();
    if (!provider) {
      throw new Error("Unisat wallet not installed");
    }

    return provider.signMessage(message);
  }

  async sendBitcoin(to: string, amountSats: number): Promise<string> {
    const provider = getUnisatProvider();
    if (!provider) {
      throw new Error("Unisat wallet not installed");
    }

    return provider.sendBitcoin(to, amountSats);
  }
}
