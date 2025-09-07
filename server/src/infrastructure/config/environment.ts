export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
  apis: {
    binance: {
      baseUrl: "https://api.binance.com",
    },
    coingecko: {
      baseUrl: "https://api.coingecko.com/api/v3",
    },
    fearGreed: {
      baseUrl: "https://api.alternative.me",
    },
  },
};