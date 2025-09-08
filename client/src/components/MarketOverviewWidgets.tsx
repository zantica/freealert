import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Crown,
  Activity,
  RefreshCw,
} from "lucide-react";

interface GlobalData {
  active_cryptocurrencies: number;
  total_market_cap: {
    usd: number;
  };
  total_volume: {
    usd: number;
  };
  market_cap_percentage: {
    btc: number;
    eth: number;
  };
  market_cap_change_percentage_24h_usd: number;
}

interface CoinMovers {
  symbol: string;
  quote: {
    USD: {
      price: number;
      percent_change_24h: number;
    };
  };
}

interface MarketData {
  global: GlobalData | null;
  topGainers: CoinMovers[];
  topLosers: CoinMovers[];
  btcDominance: {
    btcDominance: number;
    ethDominance: number;
  } | null;
}

const MarketOverviewWidgets: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData>({
    global: null,
    topGainers: [],
    topLosers: [],
    btcDominance: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError("");

      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3000";

      // Fetch global data
      const globalResponse = await fetch(
        `${API_BASE_URL}/api/v1/market/global`
      ).then((res) => res.json());
      const globalData = globalResponse;

      // Sort by price change to get gainers and losers
      const gainersResponse = await fetch(
        `${API_BASE_URL}/api/v1/market/top-gainers?limit=3`
      );
      const losersResponse = await fetch(
        `${API_BASE_URL}/api/v1/market/top-losers?limit=3`
      );

      const btcDominance = await fetch(
        `${API_BASE_URL}/api/v1/market/btc-dominance`
      ).then((res) => res.json());
      const gainersData: CoinMovers[] = await gainersResponse.json();
      const losersData: CoinMovers[] = await losersResponse.json();

      setMarketData({
        global: globalData,
        topGainers: gainersData,
        topLosers: losersData,
        btcDominance: btcDominance,
      });

      setLastUpdate(new Date());
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch market data";
      setError(errorMessage);
      console.error("Error fetching market data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();

    // Update every 10 minutes (same as your alerts)
    const interval = setInterval(fetchMarketData, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1e12) {
      return `$${num / 1e12}T`;
    } else if (num >= 1e9) {
      return `$${num / 1e9}B`;
    } else if (num >= 1e6) {
      return `$${num / 1e6}M`;
    }
    return `$${num}`;
  };

  const formatPrice = (price: number): string => {
    if (price >= 1) {
      return `$${price}`;
    }
    return `$${price}`;
  };

  const formatPercentage = (percentage: number): string => {
    const sign = percentage >= 0 ? "+" : "";
    return `${sign}${percentage}%`;
  };

  if (loading && !marketData.global) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
          >
            <div className="animate-pulse">
              <div className="h-6 bg-slate-600 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-slate-600 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-slate-600 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️ Error Loading Market Data</div>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={fetchMarketData}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Market Overview Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Market Cap Widget */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <DollarSign className="text-green-400 w-5 h-5" />
              Market Cap
            </h3>
            <button
              onClick={fetchMarketData}
              disabled={loading}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {marketData.global && (
            <>
              <div className="mb-3">
                <div className="text-2xl font-bold text-white">
                  {formatNumber(marketData.global.total_market_cap.usd)}
                </div>
                <div
                  className={`text-sm flex items-center gap-1 ${
                    marketData.global.market_cap_change_percentage_24h_usd >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {marketData.global.market_cap_change_percentage_24h_usd >=
                  0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {formatPercentage(
                    marketData.global.market_cap_change_percentage_24h_usd
                  )}{" "}
                  24h
                </div>
              </div>

              <div className="text-xs text-slate-400">
                <div>
                  Volume: {formatNumber(marketData.global.total_volume.usd)}
                </div>
                <div>
                  {marketData.global.active_cryptocurrencies} active cryptos
                </div>
              </div>
            </>
          )}
        </div>

        {/* BTC Dominance Widget */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Crown className="text-orange-400 w-5 h-5" />
              BTC Dominance
            </h3>
          </div>

          {marketData.btcDominance && (
            <>
              <div className="mb-3">
                <div className="text-2xl font-bold text-orange-400">
                  {marketData.btcDominance.btcDominance}%
                </div>
                <div className="text-sm text-slate-300">
                  ETH: {marketData.btcDominance.ethDominance}%
                </div>
              </div>

              {/* Dominance Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${marketData.btcDominance.btcDominance}%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-slate-400">
                  Bitcoin market share
                </div>
              </div>
            </>
          )}
        </div>

        {/* Market Sentiment Widget */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="text-purple-400 w-5 h-5" />
              Market Pulse
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">Gainers</span>
              <span className="text-green-400 font-medium">
                {marketData.topGainers.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">Losers</span>
              <span className="text-red-400 font-medium">
                {marketData.topLosers.length}
              </span>
            </div>

            {marketData.global && (
              <div
                className={`text-center p-2 rounded-lg ${
                  marketData.global.market_cap_change_percentage_24h_usd >= 0
                    ? "bg-green-400/10 text-green-400"
                    : "bg-red-400/10 text-red-400"
                }`}
              >
                <div className="text-xs">Overall Market</div>
                <div className="font-semibold">
                  {marketData.global.market_cap_change_percentage_24h_usd >= 0
                    ? "📈 Bullish"
                    : "📉 Bearish"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Movers Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-400 w-5 h-5" />
            Top Gainers 24h
          </h3>

          <div className="space-y-3">
            {marketData.topGainers.map(
              (coin, index) => (
                (
                  <div
                    key={coin.symbol}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-sm">
                        #{index + 1}
                      </span>
                      <div>
                        <div className="font-medium text-white">
                          {coin.symbol}
                        </div>
                        <div className="text-xs text-slate-400">
                          {coin.symbol.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">
                        {formatPrice(Number(coin.quote?.USD?.price.toFixed(2)))}
                      </div>
                      <div className="text-green-400 text-sm font-medium">
                        {Number(coin.quote?.USD?.percent_change_24h.toFixed(2))}
                        %
                      </div>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingDown className="text-red-400 w-5 h-5" />
            Top Losers 24h
          </h3>

          <div className="space-y-3">
            {marketData.topLosers.map(
              (coin, index) => (
                (
                  <div
                    key={coin.symbol}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-sm">
                        #{index + 1}
                      </span>
                      <div>
                        <div className="font-medium text-white">
                          {coin.symbol}
                        </div>
                        <div className="text-xs text-slate-400">
                          {coin.symbol.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">
                        {Number(coin.quote?.USD?.price).toFixed(2)}
                      </div>
                      <div className="text-red-400 text-sm font-medium">
                        {Number(coin.quote?.USD?.percent_change_24h).toFixed(2)}
                        %
                      </div>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-slate-400 text-xs">
        Last updated: {lastUpdate.toLocaleString()} • Updates every 10 minutes
      </div>
    </div>
  );
};

export default MarketOverviewWidgets;
