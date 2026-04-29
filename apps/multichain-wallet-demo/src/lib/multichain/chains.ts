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
  TON: {
    id: "ton",
    ecosystem: "ton",
    name: "TON",
    nativeCurrency: "TON",
    explorerUrl: "https://tonviewer.com",
    testnet: false,
  },
} satisfies Record<string, ChainDefinition>;

export const ECOSYSTEM_OPTIONS = [
  { label: "EVM", value: "evm" },
  { label: "Solana", value: "solana" },
  { label: "BTC", value: "btc" },
  { label: "Sei", value: "sei" },
  { label: "TON (reserved)", value: "ton" },
] as const;

export const DEFAULT_CHAIN_BY_ECOSYSTEM = {
  evm: CHAINS.ARBITRUM,
  solana: CHAINS.SOLANA,
  btc: CHAINS.BTC,
  sei: CHAINS.SEI,
  ton: CHAINS.TON,
} as const;
