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
}
