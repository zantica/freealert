export interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  currentPrice: number;
  priceChangePercentage24h: number;
  volume24h: number;
  marketCap?: number;
  lastUpdated: Date;
}

export class CryptocurrencyEntity implements Cryptocurrency {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly symbol: string,
    public readonly currentPrice: number,
    public readonly priceChangePercentage24h: number,
    public readonly volume24h: number,
    public readonly lastUpdated: Date,
    public readonly marketCap?: number
  ) {
    this.validatePrice();
    this.validateSymbol();
  }

  private validatePrice(): void {
    if (this.currentPrice < 0) {
      throw new Error("Price cannot be negative");
    }
  }

  private validateSymbol(): void {
    if (!this.symbol || this.symbol.trim().length === 0) {
      throw new Error("Symbol cannot be empty");
    }
  }

  public isGainer(): boolean {
    return this.priceChangePercentage24h > 0;
  }

  public isLoser(): boolean {
    return this.priceChangePercentage24h < 0;
  }
}
