import { CryptocurrencyEntity } from "@domain/entities/Cryptocurrency";

describe("CryptocurrencyEntity", () => {
  const validData = {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    currentPrice: 50000,
    priceChangePercentage24h: 5.5,
    volume24h: 1000000,
    lastUpdated: new Date(),
    marketCap: 1000000000,
  };

  it("should create a cryptocurrency entity with valid data", () => {
    const crypto = new CryptocurrencyEntity(
      validData.id,
      validData.name,
      validData.symbol,
      validData.currentPrice,
      validData.priceChangePercentage24h,
      validData.volume24h,
      validData.lastUpdated,
      validData.marketCap
    );

    expect(crypto.id).toBe(validData.id);
    expect(crypto.symbol).toBe(validData.symbol);
    expect(crypto.currentPrice).toBe(validData.currentPrice);
  });

  it("should throw error when price is negative", () => {
    expect(() => {
      new CryptocurrencyEntity(
        validData.id,
        validData.name,
        validData.symbol,
        -100, // Precio negativo
        validData.priceChangePercentage24h,
        validData.volume24h,
        validData.lastUpdated
      );
    }).toThrow("Price cannot be negative");
  });

  it("should throw error when symbol is empty", () => {
    expect(() => {
      new CryptocurrencyEntity(
        validData.id,
        validData.name,
        "", // Symbol vacío
        validData.currentPrice,
        validData.priceChangePercentage24h,
        validData.volume24h,
        validData.lastUpdated
      );
    }).toThrow("Symbol cannot be empty");
  });

  it("should identify gainers correctly", () => {
    const gainer = new CryptocurrencyEntity(
      validData.id,
      validData.name,
      validData.symbol,
      validData.currentPrice,
      5.5, // Positivo
      validData.volume24h,
      validData.lastUpdated
    );

    expect(gainer.isGainer()).toBe(true);
    expect(gainer.isLoser()).toBe(false);
  });

  it("should identify losers correctly", () => {
    const loser = new CryptocurrencyEntity(
      validData.id,
      validData.name,
      validData.symbol,
      validData.currentPrice,
      -3.2, // Negativo
      validData.volume24h,
      validData.lastUpdated
    );

    expect(loser.isLoser()).toBe(true);
    expect(loser.isGainer()).toBe(false);
  });
});
