export function normalizeTokenLaunchError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Token launch failed. Please try again.";
  }

  const message = error.message;
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("user rejected") ||
    lowerMessage.includes("user denied") ||
    lowerMessage.includes("rejected the request") ||
    lowerMessage.includes("request rejected")
  ) {
    return "Wallet confirmation was rejected.";
  }

  if (
    lowerMessage.includes("pinata") ||
    lowerMessage.includes("ipfs") ||
    lowerMessage.includes("upload")
  ) {
    return message || "IPFS upload failed. Check Pinata configuration.";
  }

  if (
    lowerMessage.includes("revert") ||
    lowerMessage.includes("execution reverted")
  ) {
    return "The contract reverted the transaction. Check form values and network state.";
  }

  if (
    lowerMessage.includes("chain") ||
    lowerMessage.includes("network") ||
    lowerMessage.includes("unsupported")
  ) {
    return "Wallet network mismatch. Connect to the token launch chain.";
  }

  if (
    lowerMessage.includes("connector") ||
    lowerMessage.includes("wallet") ||
    lowerMessage.includes("account")
  ) {
    return "Wallet is not ready. Connect a wallet and try again.";
  }

  if (
    lowerMessage.includes("failed to fetch") ||
    lowerMessage.includes("networkerror")
  ) {
    return "Network request failed. Check your connection and local services.";
  }

  return message || "Token launch failed. Please try again.";
}
