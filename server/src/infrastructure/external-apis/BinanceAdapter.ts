import axios from "axios";

export class BinanceAdapter {
  private baseUrl = process.env.BNB_BASE_URL;

  async getOHLC(symbol: string, interval: string = "1d", limit: number = 200) {
    const res = await axios.get(`${this.baseUrl}/api/v3/klines`, {
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

  async getTicker24h(symbol: string) {
    const res = await axios.get(`${this.baseUrl}/api/v3/ticker/24hr`, {
      params: { symbol },
    });
    return {
      lastPrice: parseFloat(res.data.lastPrice),
      highPrice: parseFloat(res.data.highPrice),
      lowPrice: parseFloat(res.data.lowPrice),
      volume: parseFloat(res.data.volume),
      tradeCount: parseInt(res.data.count, 10),
    };
  }

  async getOrderBook(symbol: string, limit: number = 100) {
    const res = await axios.get(`${this.baseUrl}/api/v3/depth`, {
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
