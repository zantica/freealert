import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  TrendingDown,
  Volume2,
  Activity,
  RefreshCw,
  Target,
} from "lucide-react";

interface CapitulationResult {
  score: number;
  level: "None" | "Moderate" | "Severe" | "Extreme";
  signals: string[];
  breakdown: {
    priceScore: number;
    volumeScore: number;
    fearScore: number;
    dominanceScore: number;
  };
}

interface CapitulationResponse {
  capitulation: CapitulationResult;
  lastUpdate: string;
  success: boolean;
  error?: string;
  message?: string;
}

const CapitulationWidget: React.FC = () => {
  const [capitulation, setCapitulation] = useState<CapitulationResult | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchCapitulationData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:3000/api/v1/market/capitulation");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CapitulationResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch capitulation data");
      }

      setCapitulation(data.capitulation);
      setLastUpdate(new Date(data.lastUpdate));
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch capitulation data";
      setError(errorMessage);
      console.error("Error fetching capitulation data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapitulationData();

    // Update every 10 minutes
    const interval = setInterval(fetchCapitulationData, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const getLevelColor = (level: string): string => {
    switch (level) {
      case "Extreme":
        return "text-red-400 bg-red-400/20 border-red-400";
      case "Severe":
        return "text-orange-400 bg-orange-400/20 border-orange-400";
      case "Moderate":
        return "text-yellow-400 bg-yellow-400/20 border-yellow-400";
      default:
        return "text-green-400 bg-green-400/20 border-green-400";
    }
  };

  const getScoreGradient = (score: number): string => {
    if (score >= 70) return "from-red-500 to-red-600";
    if (score >= 50) return "from-orange-500 to-orange-600";
    if (score >= 30) return "from-yellow-500 to-yellow-600";
    return "from-green-500 to-green-600";
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "Extreme":
        return <AlertTriangle className="w-6 h-6 text-red-400" />;
      case "Severe":
        return <TrendingDown className="w-6 h-6 text-orange-400" />;
      case "Moderate":
        return <Activity className="w-6 h-6 text-yellow-400" />;
      default:
        return <Target className="w-6 h-6 text-green-400" />;
    }
  };

  const getLevelMessage = (level: string): string => {
    switch (level) {
      case "Extreme":
        return "🚨 Potential buying opportunity! Historic panic levels detected.";
      case "Severe":
        return "⚠️ Significant capitulation occurring. Consider DCA strategy.";
      case "Moderate":
        return "📊 Some panic selling. Monitor for further development.";
      default:
        return "✅ Normal market conditions. No significant capitulation.";
    }
  };

  if (loading && !capitulation) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-slate-600 rounded w-48"></div>
            <div className="h-4 bg-slate-600 rounded w-16"></div>
          </div>
          <div className="h-20 bg-slate-600 rounded mb-4"></div>
          <div className="h-32 bg-slate-600 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="text-center">
          <div className="text-red-400 mb-2">
            ⚠️ Error Loading Capitulation Data
          </div>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={fetchCapitulationData}
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

  if (!capitulation) return null;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Volume2 className="text-purple-400" />
          Capitulation Meter
        </h3>
        <button
          onClick={fetchCapitulationData}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Main Score Display */}
      <div className="text-center mb-6">
        <div
          className={`inline-flex items-center gap-4 px-6 py-4 rounded-xl border-2 ${getLevelColor(
            capitulation.level
          )} mb-4`}
        >
          {getLevelIcon(capitulation.level)}
          <div>
            <div className="text-3xl font-bold">{capitulation.score}</div>
            <div className="text-sm font-medium">/ 100</div>
          </div>
          <div className="text-left">
            <div className="text-lg font-bold">{capitulation.level}</div>
            <div className="text-sm opacity-80">Capitulation</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden mb-4">
          <div
            className={`h-full bg-gradient-to-r ${getScoreGradient(
              capitulation.score
            )} transition-all duration-1000 ease-out relative`}
            style={{ width: `${capitulation.score}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>

        {/* Level markers */}
        <div className="flex justify-between text-xs text-slate-500 mb-4">
          <span>0</span>
          <span className="text-yellow-400">30</span>
          <span className="text-orange-400">50</span>
          <span className="text-red-400">70</span>
          <span>100</span>
        </div>
      </div>

      {/* Interpretation Message */}
      <div
        className={`p-4 rounded-lg mb-6 ${getLevelColor(
          capitulation.level
        )} border-0`}
      >
        <p className="text-sm font-medium">
          {getLevelMessage(capitulation.level)}
        </p>
      </div>

      {/* Signal Breakdown */}
      {capitulation.signals.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-300 mb-3">
            Active Signals:
          </h4>
          <div className="space-y-2">
            {capitulation.signals.map((signal, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-slate-200 bg-slate-700/30 px-3 py-2 rounded"
              >
                <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></div>
                {signal}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Price Impact</div>
          <div className="text-lg font-bold text-white">
            {capitulation.breakdown.priceScore}/50
          </div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Volume Spike</div>
          <div className="text-lg font-bold text-white">
            {capitulation.breakdown.volumeScore}/25
          </div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Fear Level</div>
          <div className="text-lg font-bold text-white">
            {capitulation.breakdown.fearScore}/25
          </div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">BTC Dominance</div>
          <div className="text-lg font-bold text-white">
            {capitulation.breakdown.dominanceScore}/10
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-slate-400 text-xs border-t border-slate-600 pt-3">
        Algorithm: Price Drop + Volume Spike + Fear Index + BTC Dominance
        <br />
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default CapitulationWidget;
