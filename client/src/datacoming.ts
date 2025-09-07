export const dataProviders = {
  // Binance para datos real-time y precisos
  priceData: "binance", // Precios, volúmenes, MAs
  topMovers: "binance", // Gainers/losers
  capitulation: "binance", // Análisis de volumen/precio
  historicalData: "binance", // Datos históricos
  // APIs especializadas para datos únicos
  fearGreed: "alternative.me", // Fear & Greed Index
  globalData: "coingecko", // Market cap, dominance (1 call/día)
  marketCap: "coingecko",
  fallback: "coingecko",
};
