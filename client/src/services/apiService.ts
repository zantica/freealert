import { dataProviders } from "../datacoming";

// Tipos para Binance API
// interface BinanceTickerPrice {
//   symbol: string;
//   price: string;
// }

interface Binance24hrTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  askPrice: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

interface BinanceKline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
}

// Servicio para datos de precios
export const priceService = {
  async getCurrentPrices() {
    if (dataProviders.priceData === "binance") {
      try {
        const response = await fetch(
          "https://api.binance.com/api/v3/ticker/24hr"
        );
        if (!response.ok)
          throw new Error(`Binance API error: ${response.status}`);

        const data: Binance24hrTicker[] = await response.json();

        // Convertir formato Binance a formato compatible con CoinGecko
        return data
          .filter((ticker) => ticker.symbol.endsWith("USDT")) // Solo pares con USDT
          .map((ticker) => ({
            id: ticker.symbol.toLowerCase().replace("usdt", ""),
            name: ticker.symbol.replace("USDT", ""),
            symbol: ticker.symbol.replace("USDT", "").toLowerCase(),
            current_price: parseFloat(ticker.lastPrice),
            price_change_percentage_24h: parseFloat(ticker.priceChangePercent),
            total_volume: parseFloat(ticker.quoteVolume),
            market_cap: 0, // No disponible en Binance, se obtendrá de CoinGecko si es necesario
          }))
          .sort((a, b) => b.total_volume - a.total_volume) // Ordenar por volumen
          .slice(0, 50); // Top 50
      } catch (error) {
        console.error(
          "Error fetching from Binance, falling back to CoinGecko:",
          error
        );
        return this.getFallbackPrices();
      }
    }
    return this.getFallbackPrices();
  },

  async getFallbackPrices() {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1"
    );
    if (!response.ok)
      throw new Error(`CoinGecko fallback error: ${response.status}`);
    return response.json();
  },

  async getHistoricalPrices(symbol: string, days: number): Promise<number[]> {
    console.info(days);
    if (dataProviders.historicalData === "binance") {
      try {
        console.log("Symbol:", symbol);
        const binanceSymbol = symbol.toUpperCase() + "USDT";
        const interval = days <= 30 ? "1d" : "1d";
        const limit = days;

        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`
        );

        if (!response.ok)
          throw new Error(`Binance klines error: ${response.status}`);

        const klines: BinanceKline[] = await response.json();
        return klines.map((kline) => parseFloat(kline.close));
      } catch (error) {
        console.error(
          `Error fetching ${symbol} history from Binance, falling back:`,
          error
        );
        return this.getFallbackHistoricalPrices(symbol, days);
      }
    }
    return this.getFallbackHistoricalPrices(symbol, days);
  },

  async getFallbackHistoricalPrices(
    coinId: string,
    days: number
  ): Promise<number[]> {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`
    );
    if (!response.ok)
      throw new Error(
        `CoinGecko historical fallback error: ${response.status}`
      );
    const data = await response.json();
    return data.prices.map((price: [number, number]) => price[1]);
  },
};

// Servicio para datos globales (siempre CoinGecko)
export const globalService = {
  async getGlobalData() {
    const response = await fetch("https://api.coingecko.com/api/v3/global");
    if (!response.ok) throw new Error(`Global data error: ${response.status}`);
    const data = await response.json();
    return data.data;
  },
};

// Servicio para Fear & Greed (siempre alternative.me)
export const fearGreedService = {
  async getFearGreedIndex() {
    const response = await fetch("https://api.alternative.me/fng/?limit=1");
    if (!response.ok) throw new Error(`Fear & Greed error: ${response.status}`);
    const data = await response.json();
    return data.data[0];
  },
};
