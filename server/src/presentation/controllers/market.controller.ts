import { Request, Response } from "express";
import { BinanceAdapter } from "../../infrastructure/external-apis/BinanceAdapter";
import { GetCapitulationMeter } from "../../application/services/GetCapitulationMeter";
import { CoinmarketcapAdapter } from "../../infrastructure/external-apis/CoinmarketcapAdapter";

const binance = new BinanceAdapter();
const coinmarketcap = new CoinmarketcapAdapter();
const getCapitulation = new GetCapitulationMeter(binance);

export const marketController = {
  getGlobalMarket: async (req: Request, res: Response) => {
    try {
      const response = await fetch("https://api.alternative.me/v2/global/");
      const data = (await response.json()) as {
        data: {
          active_cryptocurrencies: number;
          quotes: {
            USD: {
              total_market_cap: number;
              total_volume_24h: number;
            };
          };
          bitcoin_percentage_of_market_cap: number;
        };
      };
      // take 2 decimal market cap percentage with all USD
      const marketCapTrillion = (
        data.data.quotes.USD.total_market_cap / 1e12
      ).toFixed(2);

      const marketCapUsd = (
        data.data.quotes.USD.total_market_cap / 1e12
      ).toFixed(2);
      const globalData = {
        active_cryptocurrencies: data.data.active_cryptocurrencies,
        total_market_cap: {
          usd: marketCapUsd,
          trillion: marketCapTrillion,
        },
        total_volume: {
          usd: data.data.quotes.USD.total_volume_24h,
        },
        market_cap_percentage: {
          btc: data.data.bitcoin_percentage_of_market_cap,
        },
        market_cap_change_percentage_24h_usd: 0,
      };
      res.json(globalData);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  },

  getCapitulationMeter: async (req: Request, res: Response) => {
    const { symbol = "BTCUSDT" } = req.query;
    try {
      const result = await getCapitulation.execute(symbol as string);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  },

  getMarketMovers: async (req: Request, res: Response) => {
    try {
      const { order = "all", limit } = req.query;
      const tickers = await binance.getTicker24h();

      let result;
      const limitNum = limit ? parseInt(limit as string) : undefined;

      switch (order) {
        case "gainers":
          result = (tickers as any[])
            .filter((ticker) => parseFloat(ticker.priceChangePercent) > 0)
            .sort(
              (a, b) =>
                parseFloat(b.priceChangePercent) -
                parseFloat(a.priceChangePercent)
            );
          break;

        case "losers":
          result = (tickers as any[])
            .filter((ticker) => parseFloat(ticker.priceChangePercent) < 0)
            .sort(
              (a, b) =>
                parseFloat(a.priceChangePercent) -
                parseFloat(b.priceChangePercent)
            );
          break;

        case "all":
        default:
          result = (tickers as any[]).sort(
            (a, b) =>
              parseFloat(b.priceChangePercent) -
              parseFloat(a.priceChangePercent)
          );
          break;
      }
      // Aplicar límite si se especifica
      if (limitNum) {
        result = result.slice(0, limitNum);
      }

      res.json(result);
    } catch (err) {
      console.error("Error fetching market movers:", err);
      res.status(500).json({ error: (err as Error).message });
    }
  },

  getTopGainers: async (req: Request, res: Response) => {
    try {
      const { limit = "10" } = req.query;

      const gainers = await coinmarketcap.getGainers(limit as unknown as number);

      res.json(gainers);
    } catch (err) {
      console.error("Error fetching top gainers:", err);
      res.status(500).json({ error: (err as Error).message });
    }
  },

  getTopLosers: async (req: Request, res: Response) => {
    try {
      const { limit = "10" } = req.query;
      const tickers = await binance.getTicker24h();

      const losers = (tickers as any[])
        .filter((ticker) => parseFloat(ticker.priceChangePercent) < 0)
        .sort(
          (a, b) =>
            parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent)
        )
        .slice(0, parseInt(limit as string));

      res.json(losers);
    } catch (err) {
      console.error("Error fetching top losers:", err);
      res.status(500).json({ error: (err as Error).message });
    }
  },

  // getBTCDominance: async (req: Request, res: Response) => {
  //   try {
  //     const data = await fetch(
  //       "https://api.alternative.me/v2/ticker/?limit=300"
  //     );
  //     const response = (await data.json()) as { data: Record<string, any> };

  //     if (!response?.data) {
  //       throw new Error("No se pudo obtener la data de la API");
  //     }

  //     const coins = Object.values<any>(response.data);

  //     let btcMarketCap = 0;
  //     let ethMarketCap = 0;

  //     const totalMarketCap = coins.reduce((acc, coin: any) => {
  //       const marketCap = coin?.quotes?.USD?.market_cap ?? 0;

  //       if (coin.symbol === "BTC") {
  //         btcMarketCap = marketCap;
  //       }

  //       if (coin.symbol === "ETH") {
  //         ethMarketCap = marketCap;
  //       }

  //       return acc + (marketCap > 0 ? marketCap : 0);
  //     }, 0);

  //     if (btcMarketCap === 0 || ethMarketCap === 0 || totalMarketCap === 0) {
  //       throw new Error("No se pudo calcular la dominance");
  //     }

  //     const btcDominance = Math.floor((btcMarketCap / totalMarketCap) * 100);
  //     const ethDominance = Math.floor((ethMarketCap / totalMarketCap) * 100);
  //     res.status(200).json({ btcDominance, ethDominance });
  //   } catch (err) {
  //     console.error("Error calculando la dominance:", err);
  //     return null;
  //   }
  // },
  getDominance: async (req: Request, res: Response) => {
    try {
      const data = await coinmarketcap.getDominance();
      res.status(200).json(data);
    } catch (err) {
      console.error("Error fetching dominance data:", err);
      res.status(500).json({ error: (err as Error).message });
    }
  },
  get24hData: async (req: Request, res: Response) => {
    const { symbol } = req.params;
    try {
      if (!symbol) {
        return res.status(400).json({ error: "Symbol is required" });
      }
      const tickers = await binance.getTicker24h();
      const ticker = (tickers as any[]).find(
        (t) => t.symbol.toUpperCase() === symbol.toUpperCase()
      );
      if (!ticker) {
        return res.status(404).json({ error: "Ticker not found" });
      }
      res.json(ticker);
    } catch (err) {
      console.error("Error fetching 24h data:", err);
      res.status(500).json({ error: (err as Error).message });
    }
  },
};
