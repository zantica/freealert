import { BinanceAdapter } from "../../infrastructure/external-apis/BinanceAdapter";
import { CapitulationSignal } from "@domain/market/CapitulationMeter";

interface Candle {
  close: number;
  volume: number;
  // add other properties if needed
}

export class GetCapitulationMeter {
  constructor(private binance: BinanceAdapter) {}

  async execute(symbol: string): Promise<CapitulationSignal> {
    // 1. OHLC para calcular MA200 y volumen promedio
    const candles: Candle[] = await this.binance.getOHLC(symbol, "1d", 200);
    const closes = candles.map((c) => c.close);
    const volumes = candles.map((c) => c.volume);

    const ma200 = closes.reduce((a, b) => a + b, 0) / closes.length;
    const lastClose = closes[closes.length - 1];
    const belowMA200 = lastClose < ma200;

    // Volumen spike = volumen actual > 2x volumen promedio
    const avgVol =
      volumes.slice(0, -1).reduce((a, b) => a + b, 0) / (volumes.length - 1);
    const lastVol = volumes[volumes.length - 1];
    const volumeSpike = lastVol > avgVol * 2;

    // 2. Ticker para trade count
    const ticker = await this.binance.getTicker24h(symbol);

    // 3. Order book para presión
    const orderBook = await this.binance.getOrderBook(symbol, 100);
    const bidVol = orderBook.bids.reduce((a: number, b: [number, number]) => a + b[1], 0);
    const askVol = orderBook.asks.reduce((a: number, b: [number, number]) => a + b[1], 0);
    let orderBookPressure: "buy" | "sell" | "neutral" = "neutral";
    if (bidVol > askVol * 1.5) orderBookPressure = "buy";
    if (askVol > bidVol * 1.5) orderBookPressure = "sell";

    // 4. Capitulation = drawdown fuerte + bajo MA200 + presión de venta
    const ath = Math.max(...closes);
    const drawdown = ((lastClose - ath) / ath) * 100;

    const capitulation =
      drawdown < -50 &&
      belowMA200 &&
      (volumeSpike || orderBookPressure === "sell");

    return {
      symbol,
      drawdown,
      belowMA200,
      volumeSpike,
      tradeCount: Array.isArray(ticker) ? ticker[0]?.tradeCount : ticker.tradeCount,
      orderBookPressure,
      capitulation,
    };
  }
}
