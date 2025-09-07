import axios from "axios";
import { config } from "../config/environment";

export class BinanceAdapter {
  private baseUrl = config.apis.binance.baseUrl;

  async getOHLC(symbol: string, interval: string = "1d", limit: number = 200) {
    const res = await axios.get(`${this.baseUrl}api/v3/klines`, {
      params: { symbol, interval, limit },
    });
    // [openTime, open, high, low, close, volume, ...]
    return res.data.map((candle: any) => ({
      openTime: candle[0],
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5]),
    }));
  }
  
  async getTicker24h(symbol?: string) {
    const path = `${this.baseUrl}api/v3/ticker/24hr`;
    const res = await axios.get(path, {
      params: symbol ? { symbol } : {},
    });
    
    console.log("Individual Ticker Result:", res.data.symbol);
    // Si es un array (sin símbolo específico), devolver el array completo
    if (Array.isArray(res.data)) {
      return res.data.map((ticker: any) => ({
        symbol: ticker.symbol,
        lastPrice: parseFloat(ticker.lastPrice) || 0,
        highPrice: parseFloat(ticker.highPrice) || 0,
        lowPrice: parseFloat(ticker.lowPrice) || 0,
        volume: parseFloat(ticker.volume) || 0,
        tradeCount: parseInt(ticker.count, 10) || 0,
        priceChangePercent: parseFloat(ticker.priceChangePercent) || 0,
        priceChange: parseFloat(ticker.priceChange) || 0,
        openPrice: parseFloat(ticker.openPrice) || 0,
      }));
    }

    // Si es un objeto individual (con símbolo específico)
    return {
      symbol: res.data.symbol,
      lastPrice: parseFloat(res.data.lastPrice) || 0,
      highPrice: parseFloat(res.data.highPrice) || 0,
      lowPrice: parseFloat(res.data.lowPrice) || 0,
      volume: parseFloat(res.data.volume) || 0,
      tradeCount: parseInt(res.data.count, 10) || 0,
      priceChangePercent: parseFloat(res.data.priceChangePercent) || 0,
      priceChange: parseFloat(res.data.priceChange) || 0,
      openPrice: parseFloat(res.data.openPrice) || 0,
    };
  }

  async getOrderBook(symbol: string, limit: number = 100) {
    const res = await axios.get(`${this.baseUrl}api/v3/depth`, {
      params: { symbol, limit },
    });
    const bids = res.data.bids.map((b: any) => [
      parseFloat(b[0]),
      parseFloat(b[1]),
    ]);
    const asks = res.data.asks.map((a: any) => [
      parseFloat(a[0]),
      parseFloat(a[1]),
    ]);

    return { bids, asks };
  }
}
