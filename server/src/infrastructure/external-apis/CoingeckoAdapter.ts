import axios from "axios";

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

interface GlobalResponse {
  data: GlobalData;
}

interface FearGreedResponse {
  data: FearGreedData[];
}

export class CoingeckoAdapter {
  private baseUrl = "https://api.coingecko.com/api/v3";

  async getCoinMarketData(id: string) {
    const res = await axios.get(`${this.baseUrl}/coins/${id}/market_chart`, {
      params: { vs_currency: "usd", days: "1", interval: "hourly" },
    });
    return res.data;
  }

  async getCoinInfo(id: string) {
    const res = await axios.get(`${this.baseUrl}/coins/${id}`);
    return res.data;
  }

  async getTrendingCoins() {
    const res = await axios.get(`${this.baseUrl}/search/trending`);
    return res.data;
  }

  async getGlobalData() {
    const [marketsResponse, globalResponse, fearGreedResponse] =
      await Promise.all([
        axios.get(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1"
        ),
        axios.get("https://api.coingecko.com/api/v3/global"),
        axios.get("https://api.alternative.me/fng/?limit=1"),
      ]);
    return {
      marketsResponse,
      globalResponse,
      fearGreedResponse,
    };
  }

  async getCapitulationData(): Promise<{
    markets: MarketCoin[];
    global: GlobalResponse;
    fearGreed: FearGreedResponse;
  }> {
    try {
      const [marketsResponse, globalResponse, fearGreedResponse] =
        await Promise.all([
          axios.get<MarketCoin[]>(
            `${this.baseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1`
          ),
          axios.get<GlobalResponse>(`${this.baseUrl}/global`),
          axios.get<FearGreedResponse>("https://api.alternative.me/fng/?limit=1"),
        ]);

      return {
        markets: marketsResponse.data,
        global: globalResponse.data,
        fearGreed: fearGreedResponse.data,
      };
    } catch (error) {
      console.error('Error fetching capitulation data from APIs:', error);
      throw new Error('Failed to fetch external API data');
    }
  }
}
