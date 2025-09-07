import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Activity, RefreshCw } from "lucide-react";

interface FearGreedData {
  value: string;
  value_classification: string;
  timestamp: string;
  time_until_update: string;
}

const FearGreedIndex: React.FC = () => {
  const [fearGreedData, setFearGreedData] = useState<FearGreedData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchFearGreedIndex = async () => {
    try {
      setLoading(true);

      const response = await fetch("http://localhost:3000/api/v1/crypto/sentiment");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("RESPOOOOOONSE", data);

      if (data.metadata?.error) {
        throw new Error(data.metadata.error);
      }

      if (data.data && data.data.length > 0) {
        setFearGreedData(data.data[0]);
        setLastUpdate(new Date());
      } else {
        throw new Error("No data available");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch Fear & Greed Index";
      setError(errorMessage);
      console.error("Error fetching Fear & Greed Index:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFearGreedIndex();

    // Update every 4 hours (index updates daily, but we check periodically)
    const interval = setInterval(fetchFearGreedIndex, 4 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const getIndexColor = (value: number): string => {
    if (value >= 75) return "text-red-400 border-red-400 bg-red-400/10";
    if (value >= 55)
      return "text-orange-400 border-orange-400 bg-orange-400/10";
    if (value >= 45)
      return "text-yellow-400 border-yellow-400 bg-yellow-400/10";
    if (value >= 25) return "text-blue-400 border-blue-400 bg-blue-400/10";
    return "text-green-400 border-green-400 bg-green-400/10";
  };

  const getProgressBarColor = (value: number): string => {
    if (value >= 75) return "bg-gradient-to-r from-red-500 to-red-600";
    if (value >= 55) return "bg-gradient-to-r from-orange-500 to-orange-600";
    if (value >= 45) return "bg-gradient-to-r from-yellow-500 to-yellow-600";
    if (value >= 25) return "bg-gradient-to-r from-blue-500 to-blue-600";
    return "bg-gradient-to-r from-green-500 to-green-600";
  };

  const getIcon = (classification: string) => {
    const lowerCase = classification.toLowerCase();
    if (lowerCase.includes("greed")) return <TrendingUp className="w-5 h-5" />;
    if (lowerCase.includes("fear")) return <TrendingDown className="w-5 h-5" />;
    return <Activity className="w-5 h-5" />;
  };

  const getInterpretation = (value: number): string => {
    if (value >= 75)
      return "Market may be overvalued - Consider taking profits";
    if (value >= 55) return "Market showing signs of overconfidence";
    if (value >= 45) return "Market sentiment is neutral";
    if (value >= 25) return "Good opportunities may be emerging";
    return "Potential buying opportunity - Market oversold";
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading && !fearGreedData) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-slate-600 rounded w-48"></div>
            <div className="h-4 bg-slate-600 rounded w-16"></div>
          </div>
          <div className="h-32 bg-slate-600 rounded mb-4"></div>
          <div className="h-4 bg-slate-600 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="text-center">
          <div className="text-red-400 mb-2">
            ⚠️ Error Loading Fear & Greed Index
          </div>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={fetchFearGreedIndex}
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

  if (!fearGreedData) {
    return null;
  }

  const indexValue = parseInt(fearGreedData.value);
  const colorClasses = getIndexColor(indexValue);
  const progressBarColor = getProgressBarColor(indexValue);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Activity className="text-purple-400" />
          Fear & Greed Index
        </h3>
        <button
          onClick={fetchFearGreedIndex}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Main Index Display */}
      <div className="text-center mb-6">
        <div
          className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${colorClasses} mb-4`}
        >
          {getIcon(fearGreedData.value_classification)}
          <div>
            <div className="text-3xl font-bold">{indexValue}</div>
            <div className="text-sm font-medium">
              {fearGreedData.value_classification}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Extreme Fear</span>
          <span>Neutral</span>
          <span>Extreme Greed</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${progressBarColor} transition-all duration-1000 ease-out relative`}
            style={{ width: `${indexValue}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>

      {/* Interpretation */}
      <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-slate-300 mb-2">
          Market Interpretation:
        </h4>
        <p className="text-sm text-slate-200">
          {getInterpretation(indexValue)}
        </p>
      </div>

      {/* Metadata */}
      <div className="flex justify-between text-xs text-slate-400 border-t border-slate-600 pt-3">
        <span>Data: {formatTimestamp(fearGreedData.timestamp)}</span>
        <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-5 gap-2 text-xs">
        <div className="text-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
          <span className="text-slate-400">0-24</span>
        </div>
        <div className="text-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
          <span className="text-slate-400">25-44</span>
        </div>
        <div className="text-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-1"></div>
          <span className="text-slate-400">45-54</span>
        </div>
        <div className="text-center">
          <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto mb-1"></div>
          <span className="text-slate-400">55-74</span>
        </div>
        <div className="text-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
          <span className="text-slate-400">75-100</span>
        </div>
      </div>
    </div>
  );
};

export default FearGreedIndex;
