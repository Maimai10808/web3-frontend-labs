export const DEFAULT_MARKET_ID = 'BTC';

export const tradingViewSymbolMap: Record<string, string> = {
  BTC: 'BINANCE:BTCUSDC',
  ETH: 'BINANCE:ETHUSDC',
  SOL: 'BINANCE:SOLUSDC',
  BNB: 'BINANCE:BNBUSDC',
};

export function getTradingViewSymbol(marketId?: string) {
  if (!marketId) {
    return tradingViewSymbolMap[DEFAULT_MARKET_ID];
  }

  return tradingViewSymbolMap[marketId] ?? tradingViewSymbolMap[DEFAULT_MARKET_ID];
}
