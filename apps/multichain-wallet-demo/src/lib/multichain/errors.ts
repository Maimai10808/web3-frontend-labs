import type { ChainEcosystem, MultiChainError } from "./types";

export function normalizeMultiChainError(
  error: unknown,
  ecosystem?: ChainEcosystem,
): MultiChainError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("user rejected") || message.includes("rejected")) {
      return {
        code: "USER_REJECTED",
        message: "User rejected the wallet request.",
        cause: error,
        ecosystem,
      };
    }

    if (message.includes("not installed")) {
      return {
        code: "WALLET_NOT_INSTALLED",
        message: "Wallet is not installed.",
        cause: error,
        ecosystem,
      };
    }

    if (message.includes("unsupported")) {
      return {
        code: "UNSUPPORTED_NETWORK",
        message: "Unsupported network or capability.",
        cause: error,
        ecosystem,
      };
    }

    if (message.includes("switch")) {
      return {
        code: "SWITCH_NETWORK_UNAVAILABLE",
        message: "Switch network is unavailable.",
        cause: error,
        ecosystem,
      };
    }

    if (message.includes("rpc")) {
      return {
        code: "RPC_ERROR",
        message: "RPC request failed.",
        cause: error,
        ecosystem,
      };
    }

    if (message.includes("bind")) {
      return {
        code: "BIND_FAILED",
        message: "Wallet binding failed.",
        cause: error,
        ecosystem,
      };
    }

    return {
      code: "UNKNOWN",
      message: error.message,
      cause: error,
      ecosystem,
    };
  }

  return {
    code: "UNKNOWN",
    message: "Unknown error",
    cause: error,
    ecosystem,
  };
}
