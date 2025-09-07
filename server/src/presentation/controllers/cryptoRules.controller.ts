import { Request, Response } from "express";
import { CoingeckoAdapter } from "../../infrastructure/external-apis/CoingeckoAdapter";

interface MarketCoin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
}

interface GlobalData {
  total_volume: {
    usd: number;
  };
  market_cap_percentage: {
    btc: number;
  };
}

interface FearGreedData {
  value: string;
  value_classification: string;
}

interface CapitulationSignals {
  priceDropSeverity: number;
  volumeSpike: number;
  fearGreedLevel: number;
  btcDominanceChange: number;
  severeDropCount: number;
}

interface CapitulationResult {
  score: number;
  level: "None" | "Moderate" | "Severe" | "Extreme";
  signals: string[];
  breakdown: {
    priceScore: number;
    volumeScore: number;
    fearScore: number;
    dominanceScore: number;
  };
}

// Store para mantener datos históricos (en producción usar Redis o DB)
let historicalVolume: number = 0;
let previousBTCDominance: number = 0;

// Instancia del adapter
const coingeckoAdapter = new CoingeckoAdapter();

const calculateCapitulationSignals = ({
  markets,
  currentTotalVolume,
  historicalVolume,
  globalData,
  fearGreedData,
  previousBTCDominance,
}: {
  markets: MarketCoin[];
  currentTotalVolume: number;
  historicalVolume: number;
  globalData: GlobalData;
  fearGreedData: FearGreedData;
  previousBTCDominance: number;
}): CapitulationSignals => {
  const severeDrops = markets.filter(
    (coin) => coin.price_change_percentage_24h <= -15
  );

  const avgPriceChange =
    markets
      .slice(0, 20)
      .reduce((sum, coin) => sum + coin.price_change_percentage_24h, 0) / 20;

  const volumeRatio =
    historicalVolume > 0 ? currentTotalVolume / historicalVolume : 1;

  const btcDominanceChange =
    previousBTCDominance > 0
      ? globalData.market_cap_percentage.btc - previousBTCDominance
      : 0;

  return {
    priceDropSeverity: avgPriceChange,
    volumeSpike: volumeRatio,
    fearGreedLevel: parseInt(fearGreedData.value, 10),
    btcDominanceChange: btcDominanceChange,
    severeDropCount: severeDrops.length,
  };
};

const calculateCapitulationScore = (
  signals: CapitulationSignals
): CapitulationResult => {
  let priceScore = 0;
  let volumeScore = 0;
  let fearScore = 0;
  let dominanceScore = 0;
  const resultSignals: string[] = [];

  // Price drop scoring (50% weight total)
  if (signals.priceDropSeverity <= -25) {
    priceScore = 40;
    resultSignals.push(
      `Severe market drop (${signals.priceDropSeverity.toFixed(1)}%)`
    );
  } else if (signals.priceDropSeverity <= -15) {
    priceScore = 30;
    resultSignals.push(
      `Notable market drop (${signals.priceDropSeverity.toFixed(1)}%)`
    );
  } else if (signals.priceDropSeverity <= -10) {
    priceScore = 20;
    resultSignals.push(
      `Market decline (${signals.priceDropSeverity.toFixed(1)}%)`
    );
  }

  if (signals.severeDropCount >= 15) {
    priceScore += 10;
    resultSignals.push(`${signals.severeDropCount} coins down >15%`);
  } else if (signals.severeDropCount >= 10) {
    priceScore += 5;
    resultSignals.push(`${signals.severeDropCount} coins down >15%`);
  }

  // Volume spike scoring (25% weight)
  if (signals.volumeSpike >= 3) {
    volumeScore = 25;
    resultSignals.push(
      `Extreme volume (${signals.volumeSpike.toFixed(1)}x normal)`
    );
  } else if (signals.volumeSpike >= 2) {
    volumeScore = 15;
    resultSignals.push(
      `High volume (${signals.volumeSpike.toFixed(1)}x normal)`
    );
  } else if (signals.volumeSpike >= 1.5) {
    volumeScore = 10;
    resultSignals.push(
      `Elevated volume (${signals.volumeSpike.toFixed(1)}x normal)`
    );
  }

  // Fear & Greed scoring (25% weight)
  if (signals.fearGreedLevel <= 10) {
    fearScore = 25;
    resultSignals.push(`Extreme fear (${signals.fearGreedLevel})`);
  } else if (signals.fearGreedLevel <= 25) {
    fearScore = 20;
    resultSignals.push(`High fear (${signals.fearGreedLevel})`);
  } else if (signals.fearGreedLevel <= 35) {
    fearScore = 10;
    resultSignals.push(`Moderate fear (${signals.fearGreedLevel})`);
  }

  // BTC Dominance change (10% weight)
  if (signals.btcDominanceChange >= 2) {
    dominanceScore = 10;
    resultSignals.push(
      `BTC dominance spike (+${signals.btcDominanceChange.toFixed(1)}%)`
    );
  } else if (signals.btcDominanceChange >= 1) {
    dominanceScore = 5;
    resultSignals.push(
      `BTC dominance rise (+${signals.btcDominanceChange.toFixed(1)}%)`
    );
  }

  const totalScore = Math.min(
    100,
    priceScore + volumeScore + fearScore + dominanceScore
  );

  let level: "None" | "Moderate" | "Severe" | "Extreme" = "None";
  if (totalScore >= 70) level = "Extreme";
  else if (totalScore >= 50) level = "Severe";
  else if (totalScore >= 30) level = "Moderate";

  return {
    score: totalScore,
    level,
    signals: resultSignals,
    breakdown: {
      priceScore,
      volumeScore,
      fearScore,
      dominanceScore,
    },
  };
};

export const cryptoRules = {
  getRules: (req: Request, res: Response): void => {
    const rules = [
      {
        id: 1,
        name: "Rule 1",
        description: "Description for Rule 1",
      },
      {
        id: 2,
        name: "Rule 2",
        description: "Description for Rule 2",
      },
    ];
    
    if (rules) {
      res.status(200).json(rules);
    } else {
      res.status(404).json({ error: "Rules not found" });
    }
  },

  getCapitulation: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Fetching capitulation data...');

      // Usar el adapter para obtener los datos
      const apiData = await coingeckoAdapter.getCapitulationData();

      // Calculate historical volume average
      const currentTotalVolume = apiData.markets.reduce(
        (sum, coin) => sum + coin.total_volume,
        0
      );

      // Set historical volume baseline if not set
      if (historicalVolume === 0) {
        historicalVolume = currentTotalVolume;
      }

      // Calculate signals
      const signals = calculateCapitulationSignals({
        markets: apiData.markets,
        currentTotalVolume,
        historicalVolume: historicalVolume || currentTotalVolume,
        globalData: apiData.global.data,
        fearGreedData: apiData.fearGreed.data[0],
        previousBTCDominance,
      });

      const result = calculateCapitulationScore(signals);

      // Update previous BTC dominance for next calculation
      previousBTCDominance = apiData.global.data.market_cap_percentage.btc;

      res.status(200).json({
        capitulation: result,
        lastUpdate: new Date().toISOString(),
        success: true
      });

    } catch (error) {
      console.error('Error fetching capitulation data:', error);
      res.status(500).json({
        error: 'Failed to fetch capitulation data',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    }
  },
};
