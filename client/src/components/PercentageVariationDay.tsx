import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, RefreshCw, Activity } from "lucide-react";

interface PercentageVariationDayProps {
  coinName: string;
}

const PercentageVariationDay: React.FC<PercentageVariationDayProps> = ({
  coinName,
}) => {
  const [variation, setVariation] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchVariation = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(
        `${API_BASE_URL}/api/v1/market/${coinName}/24h`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setVariation(data.priceChangePercent);
      setLastUpdate(new Date());
    } catch (error) {
      setError("Error fetching variation data");
      console.error("Error fetching variation:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariation();

    // Update every 5 minutes
    const interval = setInterval(fetchVariation, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [coinName]);

  const getVariationLevel = () => {
    if (!variation) return "Neutral";
    const numVariation = Math.abs(parseFloat(variation));
    if (numVariation >= 10) return "Extreme";
    if (numVariation >= 5) return "High";
    if (numVariation >= 2) return "Moderate";
    return "Low";
  };

  const getVariationClasses = () => {
    if (!variation) return "text-slate-400 bg-slate-400/20 border-slate-400";
    const numVariation = parseFloat(variation);
    const level = getVariationLevel();

    if (numVariation >= 0) {
      switch (level) {
        case "Extreme":
          return "text-green-300 bg-green-500/30 border-green-400";
        case "High":
          return "text-green-400 bg-green-400/20 border-green-400";
        case "Moderate":
          return "text-green-500 bg-green-400/15 border-green-500";
        default:
          return "text-green-600 bg-green-400/10 border-green-600";
      }
    } else {
      switch (level) {
        case "Extreme":
          return "text-red-300 bg-red-500/30 border-red-400";
        case "High":
          return "text-red-400 bg-red-400/20 border-red-400";
        case "Moderate":
          return "text-red-500 bg-red-400/15 border-red-500";
        default:
          return "text-red-600 bg-red-400/10 border-red-600";
      }
    }
  };

  const getGradientClasses = () => {
    if (!variation) return "from-slate-500 to-slate-600";
    const numVariation = parseFloat(variation);
    const level = getVariationLevel();

    if (numVariation >= 0) {
      switch (level) {
        case "Extreme":
          return "from-green-400 to-emerald-500";
        case "High":
          return "from-green-500 to-green-600";
        case "Moderate":
          return "from-green-600 to-green-700";
        default:
          return "from-green-700 to-green-800";
      }
    } else {
      switch (level) {
        case "Extreme":
          return "from-red-400 to-red-500";
        case "High":
          return "from-red-500 to-red-600";
        case "Moderate":
          return "from-red-600 to-red-700";
        default:
          return "from-red-700 to-red-800";
      }
    }
  };

  const getVariationIcon = () => {
    if (!variation) return <Activity className="w-6 h-6 text-slate-400" />;
    const numVariation = parseFloat(variation);
    return numVariation >= 0 ? (
      <TrendingUp className="w-6 h-6" />
    ) : (
      <TrendingDown className="w-6 h-6" />
    );
  };

  const getVariationMessage = () => {
    if (!variation) return "No data available";
    const numVariation = parseFloat(variation);
    const level = getVariationLevel();
    const isPositive = numVariation >= 0;

    switch (level) {
      case "Extreme":
        return isPositive
          ? "🚀 Massive pump! Extremely bullish movement detected."
          : "💥 Heavy dump! Extreme bearish movement detected.";
      case "High":
        return isPositive
          ? "📈 Strong bullish momentum. Consider taking profits."
          : "📉 Significant drop. Potential buying opportunity.";
      case "Moderate":
        return isPositive
          ? "✅ Good upward movement. Market showing strength."
          : "⚠️ Moderate decline. Monitor closely.";
      default:
        return isPositive
          ? "🔄 Small gain. Normal market fluctuation."
          : "🔄 Small dip. Normal market fluctuation.";
    }
  };

  const formatVariation = () => {
    if (!variation) return "0.00%";
    const numVariation = parseFloat(variation);
    const sign = numVariation >= 0 ? "+" : "";
    return `${sign}${numVariation.toFixed(2)}%`;
  };

  if (loading && !variation) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-slate-600 rounded w-48"></div>
            <div className="h-4 bg-slate-600 rounded w-16"></div>
          </div>
          <div className="h-20 bg-slate-600 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️ Error Loading Data</div>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={fetchVariation}
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
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Activity className="text-blue-400" />
          24h Variation - {coinName.toUpperCase().substring(0, 3)}
        </h3>
        <button
          onClick={fetchVariation}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Main Display */}
      <div className="text-center mb-6">
        <div
          className={`inline-flex items-center gap-4 px-6 py-4 rounded-xl border-2 ${getVariationClasses()} mb-4`}
        >
          {getVariationIcon()}
          <div>
            <div className="text-3xl font-bold">{formatVariation()}</div>
            <div className="text-sm opacity-80">24h Change</div>
          </div>
          <div className="text-left">
            <div className="text-lg font-bold">{getVariationLevel()}</div>
            <div className="text-sm opacity-80">Movement</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden mb-4">
          <div
            className={`h-full bg-gradient-to-r ${getGradientClasses()} transition-all duration-1000 ease-out relative`}
            style={{
              width: `${Math.min(
                100,
                Math.abs(parseFloat(variation || "0")) * 10
              )}%`,
              marginLeft: parseFloat(variation || "0") < 0 ? "auto" : "0",
            }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Interpretation Message */}
      <div className={`p-4 rounded-lg mb-4 ${getVariationClasses()} border-0`}>
        <p className="text-sm font-medium">{getVariationMessage()}</p>
      </div>

      {/* Footer */}
      <div className="text-center text-slate-400 text-xs border-t border-slate-600 pt-3">
        Data from Binance API
        <br />
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default PercentageVariationDay;
