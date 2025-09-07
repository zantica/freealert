export interface CapitulationSignal {
  symbol: string;
  drawdown: number;
  belowMA200: boolean;
  volumeSpike: boolean;
  tradeCount: number;
  orderBookPressure: "buy" | "sell" | "neutral";
  capitulation: boolean;
}
