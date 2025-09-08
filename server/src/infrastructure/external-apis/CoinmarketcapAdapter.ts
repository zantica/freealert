import axios from "axios";

export class CoinmarketcapAdapter {
  private baseUrl = "https://pro-api.coinmarketcap.com/v1/";
  getDominance = async (): Promise<{
    btcDominance: number;
    ethDominance: number;
  }> => {
    const response = await axios.get(
      `${this.baseUrl}global-metrics/quotes/latest`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY || "",
        },
      }
    );
    const data = response.data;

    // take only 2 decimal places of an float
    const btcDominance = data.data.btc_dominance.toFixed(2);
    const ethDominance = data.data.eth_dominance.toFixed(2);
    return {
      btcDominance: parseFloat(btcDominance),
      ethDominance: parseFloat(ethDominance),
    };
  };

  getGainers = async (limit: number): Promise<any[]> => {
    const response = await axios.get(
      `${this.baseUrl}cryptocurrency/listings/latest`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY || "",
        },
      }
    );
    const data = response.data;
    return data.data
      .sort(
        (a: any, b: any) =>
          b.quote.USD.percent_change_24h - a.quote.USD.percent_change_24h
      )
      .slice(0, limit);
  };

  getLosers = async (limit: number): Promise<any[]> => {
    const response = await axios.get(
      `${this.baseUrl}cryptocurrency/listings/latest`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY || "",
        },
      }
    );
    const data = response.data;
    return data.data
      .sort(
        (a: any, b: any) =>
          a.quote.USD.percent_change_24h - b.quote.USD.percent_change_24h
      )
      .slice(0, limit);
  };
}
