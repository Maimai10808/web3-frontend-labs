import type { ChainDefinition } from "./types";

export const CHAINS = {
  ETHEREUM: {
    id: "ethereum",
    ecosystem: "evm",
    name: "Ethereum Mainnet",
    chainId: 1,
    nativeCurrency: "ETH",
    explorerUrl: "https://etherscan.io",
    testnet: false,
  },
  ARBITRUM: {
    id: "arbitrum",
    ecosystem: "evm",
    name: "Arbitrum One",
    chainId: 42161,
    nativeCurrency: "ETH",
    explorerUrl: "https://arbiscan.io",
    testnet: false,
  },
  BSC: {
    id: "bsc",
    ecosystem: "evm",
    name: "BNB Smart Chain",
    chainId: 56,
    nativeCurrency: "BNB",
    explorerUrl: "https://bscscan.com",
    testnet: false,
  },
  SOLANA: {
    id: "solana",
    ecosystem: "solana",
    name: "Solana",
    nativeCurrency: "SOL",
    explorerUrl: "https://solscan.io",
    testnet: false,
  },
  BTC: {
    id: "btc",
    ecosystem: "btc",
    name: "Bitcoin",
    nativeCurrency: "BTC",
    explorerUrl: "https://mempool.space",
    testnet: false,
  },
  SEI: {
    id: "sei",
    ecosystem: "sei",
    name: "Sei",
    nativeCurrency: "SEI",
    explorerUrl: "https://www.seiscan.app",
    testnet: false,
  },
} satisfies Record<string, ChainDefinition>;

export const CHAIN_OPTIONS = Object.values(CHAINS);
