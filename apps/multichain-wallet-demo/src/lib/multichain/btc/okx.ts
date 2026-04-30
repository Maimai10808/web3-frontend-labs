import type {
  BtcInjectedWallet,
  BtcWalletConnectResult,
  OkxBitcoinProvider,
} from "./types";

function debugBtc(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.debug("[btc-wallet]", ...args);
  }
}

function getOkxBitcoinProvider(): OkxBitcoinProvider | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.okxwallet?.bitcoin;
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

function normalizeSignatureResult(result: unknown) {
  if (typeof result === "string") {
    return result;
  }

  if (result && typeof result === "object") {
    if ("signature" in result && typeof result.signature === "string") {
      return result.signature;
    }

    if ("result" in result && typeof result.result === "string") {
      return result.result;
    }
  }

  return undefined;
}

export class OkxBtcWallet implements BtcInjectedWallet {
  name = "OKX BTC";

  async connect(): Promise<string> {
    const provider = getOkxBitcoinProvider();
    debugBtc("selected wallet", this.name, "provider detected", !!provider);

    if (!provider) {
      throw new Error("OKX BTC wallet not installed");
    }

    const rawResult = provider.connect
      ? await provider.connect()
      : provider.requestAccounts
        ? await provider.requestAccounts()
        : provider.getAccounts
          ? await provider.getAccounts()
          : undefined;
    debugBtc("raw connect result", rawResult);

    const address = normalizeBtcAddress(rawResult);
    if (!address) {
      console.warn("[btc-wallet] Unexpected OKX BTC connect result", rawResult);
      throw new Error("No BTC address returned from OKX wallet");
    }

    return address;
  }

  async signMessage(message: string): Promise<string> {
    const provider = getOkxBitcoinProvider();
    if (!provider) {
      throw new Error("OKX BTC wallet not installed");
    }

    debugBtc("provider exists", true);

    if (provider.signMessage) {
      try {
        const rawSignature = await provider.signMessage(message);
        debugBtc("raw signature result", rawSignature);
        const signature = normalizeSignatureResult(rawSignature);
        if (signature) {
          return signature;
        }
      } catch {
        // Fall through to alternative signatures below.
      }

      try {
        const accountsResult = provider.getAccounts
          ? await provider.getAccounts()
          : provider.requestAccounts
            ? await provider.requestAccounts()
            : provider.connect
              ? await provider.connect()
              : undefined;
        const address = normalizeBtcAddress(accountsResult);
        if (address) {
          const rawSignature = await provider.signMessage(address, message);
          debugBtc("raw signature result", rawSignature);
          const signature = normalizeSignatureResult(rawSignature);
          if (signature) {
            return signature;
          }
        }
      } catch {
        // Fall through to request() variants below.
      }
    }

    if (provider.request) {
      try {
        const rawSignature = await provider.request({
          method: "signMessage",
          params: [message],
        });
        debugBtc("raw signature result", rawSignature);
        const signature = normalizeSignatureResult(rawSignature);
        if (signature) {
          return signature;
        }
      } catch {
        // Try address + message variant next.
      }

      const accountsResult = provider.getAccounts
        ? await provider.getAccounts()
        : provider.requestAccounts
          ? await provider.requestAccounts()
          : provider.connect
            ? await provider.connect()
            : undefined;
      const address = normalizeBtcAddress(accountsResult);
      if (address) {
        const rawSignature = await provider.request({
          method: "signMessage",
          params: [address, message],
        });
        debugBtc("raw signature result", rawSignature);
        const signature = normalizeSignatureResult(rawSignature);
        if (signature) {
          return signature;
        }
      }
    }

    throw new Error(
      "Current BTC wallet does not support message signing in this adapter",
    );
  }

  async sendBitcoin(to: string, amountSats: number): Promise<string> {
    const provider = getOkxBitcoinProvider();
    if (!provider) {
      throw new Error("OKX BTC wallet not installed");
    }

    return provider.sendBitcoin(to, amountSats);
  }
}
