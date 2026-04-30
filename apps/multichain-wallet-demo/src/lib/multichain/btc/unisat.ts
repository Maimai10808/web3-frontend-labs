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

    debugBtc("provider exists", true, "connected account for signing", this.name);

    if (provider.signMessage) {
      const rawSignature = await provider.signMessage(message);
      debugBtc("raw signature result", rawSignature);
      const signature = normalizeSignatureResult(rawSignature);
      if (signature) {
        return signature;
      }
    }

    if (provider.request) {
      const rawSignature = await provider.request({
        method: "signMessage",
        params: [message],
      });
      debugBtc("raw signature result", rawSignature);
      const signature = normalizeSignatureResult(rawSignature);
      if (signature) {
        return signature;
      }
    }

    throw new Error(
      "Current BTC wallet does not support message signing in this adapter",
    );
  }

  async sendBitcoin(to: string, amountSats: number): Promise<string> {
    const provider = getUnisatProvider();
    if (!provider) {
      throw new Error("Unisat wallet not installed");
    }

    return provider.sendBitcoin(to, amountSats);
  }
}
