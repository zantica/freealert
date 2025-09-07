import { Request, Response } from "express";
import { BinanceAdapter } from "@infrastructure/external-apis/BinanceAdapter";
import { GetCapitulationMeter } from "@application/services/GetCapitulationMeter";

const binance = new BinanceAdapter();
const getCapitulation = new GetCapitulationMeter(binance);

export async function getCapitulationMeter(req: Request, res: Response) {
  const { symbol = "BTCUSDT" } = req.query;
  try {
    const result = await getCapitulation.execute(symbol as string);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
