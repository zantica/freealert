export interface CoinData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export interface PriceHistory {
  prices: [number, number][];
}

export interface Alert {
  id: string;
  coinId: string;
  coinName: string;
  symbol: string;
  maType: 'MA50' | 'MA100' | 'MA200';
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: Date;
  lastPrice?: number;
  currentMA?: number;
}