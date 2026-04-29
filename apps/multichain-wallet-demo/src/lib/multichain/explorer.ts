import { CHAINS } from "./chains";
import type { ChainEcosystem } from "./types";

export function getExplorerTxUrl(ecosystem: ChainEcosystem, txHash: string) {
  if (ecosystem === "evm") {
    return `${CHAINS.ARBITRUM.explorerUrl}/tx/${txHash}`;
  }

  if (ecosystem === "solana") {
    return `${CHAINS.SOLANA.explorerUrl}/tx/${txHash}`;
  }

  if (ecosystem === "btc") {
    return `${CHAINS.BTC.explorerUrl}/tx/${txHash}`;
  }

  if (ecosystem === "sei") {
    return `${CHAINS.SEI.explorerUrl}/txs/${txHash}`;
  }

  return undefined;
}
