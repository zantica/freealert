import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Plus, Trash2, TrendingUp, AlertTriangle } from "lucide-react";
import type { CoinData, Alert } from "../types";
import { priceService } from "../services/apiService";

const calculateMA = (prices: number[], period: number): number => {
  if (prices.length < period) return 0;
  const recentPrices = prices.slice(-period);
  return recentPrices.reduce((sum, price) => sum + price, 0) / period;
};

const getMADays = (maType: string) => parseInt(maType.substring(2));

const getAlertStatus = (alert: Alert) => {
  if (!alert.lastPrice || !alert.currentMA) return "pending";
  const conditionMet =
    (alert.condition === "above" && alert.lastPrice > alert.currentMA) ||
    (alert.condition === "below" && alert.lastPrice < alert.currentMA);
  return conditionMet ? "triggered" : "waiting";
};

const CryptoMAAlerts: React.FC = () => {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedCoin, setSelectedCoin] = useState("");
  const [selectedMA, setSelectedMA] = useState<"MA50" | "MA100" | "MA200">(
    "MA50"
  );
  const [selectedCondition, setSelectedCondition] = useState<"above" | "below">(
    "above"
  );
  const [loading, setLoading] = useState(false);
  const [alertsChecking, setAlertsChecking] = useState(false);
  const alertsRef = useRef<Alert[]>(alerts);

  useEffect(() => {
    fetchCoins();
    const interval = setInterval(checkAlerts, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    alertsRef.current = alerts;
  }, [alerts]);

  async function fetchCoins() {
    try {
      setLoading(true);
      const data = await priceService.getCurrentPrices();
      setCoins(data);
      console.log(
        "✅ Coins loaded from:",
        data.length > 0 ? "Binance" : "CoinGecko"
      );
    } catch (error) {
      console.error("Error fetching coins:", error);
    } finally {
      setLoading(false);
    }
  }

  const checkAlerts = useCallback(async () => {
    if (alertsRef.current.length === 0) return;
    setAlertsChecking(true);

    for (const alert of alertsRef.current.filter((a) => a.isActive)) {
      try {
        const days = getMADays(alert.maType);
        const prices = await priceService.getHistoricalPrices(
          alert.coinId,
          days
        );
        console.info(prices, days);
        if (prices.length >= getMADays(alert.maType)) {
          const ma = calculateMA(prices, getMADays(alert.maType));
          const currentPrice = prices[prices.length - 1];

          setAlerts((prev) =>
            prev.map((a) =>
              a.id === alert.id
                ? { ...a, lastPrice: currentPrice, currentMA: ma }
                : a
            )
          );

          const conditionMet =
            (alert.condition === "above" && currentPrice > ma) ||
            (alert.condition === "below" && currentPrice < ma);

          if (conditionMet && Notification.permission === "granted") {
            new Notification(`🚨 Alert: ${alert.symbol}`, {
              body: `Price $${currentPrice.toFixed(2)} is ${alert.condition} ${
                alert.maType
              } ($${ma.toFixed(2)})`,
              icon: "🚀",
            });
          }
        }
      } catch (error) {
        console.error(`Error checking alert for ${alert.coinName}:`, error);
      }
    }
    setAlertsChecking(false);
  }, [setAlerts]);

  // Intervalo que siempre usa la versión actual de alerts
  useEffect(() => {
    fetchCoins();
    const interval = setInterval(() => {
      checkAlerts();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [checkAlerts]);

  function addAlert() {
    if (!selectedCoin) return;
    const coin = coins.find((c) => c.id === selectedCoin);
    if (!coin) return;

    const newAlert: Alert = {
      id: Date.now().toString(),
      coinId: selectedCoin,
      coinName: coin.name,
      symbol: coin.symbol.toUpperCase(),
      maType: selectedMA,
      condition: selectedCondition,
      isActive: true,
      createdAt: new Date(),
    };

    setAlerts((prev) => [...prev, newAlert]);
    setSelectedCoin("");
    setSelectedMA("MA50");
    setSelectedCondition("above");
  }

  function removeAlert(alertId: string) {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  }

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <TrendingUp className="text-yellow-400" />
            Crypto MA Alerts
          </h1>
          <p className="text-slate-300">
            Monitor Moving Averages and Get Real-time Alerts
          </p>
        </div>

        {/* Add Alert Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Plus className="text-green-400" />
            Create New Alert
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cryptocurrency
              </label>
              <select
                value={selectedCoin}
                onChange={(e) => setSelectedCoin(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">Select a coin...</option>
                {coins.map((coin) => (
                  <option key={coin.id} value={coin.id}>
                    {coin.name} ({coin.symbol.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Moving Average
              </label>
              <select
                value={selectedMA}
                onChange={(e) =>
                  setSelectedMA(e.target.value as "MA50" | "MA100" | "MA200")
                }
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="MA50">MA50 (50 days)</option>
                <option value="MA100">MA100 (100 days)</option>
                <option value="MA200">MA200 (200 days)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Condition
              </label>
              <select
                value={selectedCondition}
                onChange={(e) =>
                  setSelectedCondition(e.target.value as "above" | "below")
                }
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="above">Price Above MA</option>
                <option value="below">Price Below MA</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={addAlert}
                disabled={!selectedCoin || loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Alert
              </button>
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Bell className="text-yellow-400" />
              Active Alerts ({alerts.length})
            </h2>
            {alertsChecking && (
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                Checking alerts...
              </div>
            )}
          </div>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <AlertTriangle size={48} className="mx-auto mb-2 opacity-50" />
              <p>No alerts created yet. Add your first alert above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => {
                console.log("Alert:", alert);
                const status = getAlertStatus(alert);
                const statusColors = {
                  pending: "text-yellow-400 bg-yellow-400/10",
                  waiting: "text-blue-400 bg-blue-400/10",
                  triggered: "text-green-400 bg-green-400/10",
                };
                return (
                  <div
                    key={alert.id}
                    className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-between border border-slate-600"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-semibold text-white">
                          {alert.coinName} ({alert.symbol})
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-slate-300 space-y-1">
                        <p>
                          Alert when price is{" "}
                          <span className="font-medium text-white">
                            {alert.condition}
                          </span>{" "}
                          <span className="font-medium text-yellow-400">
                            {alert.maType}
                          </span>
                        </p>
                        {alert.lastPrice && alert.currentMA && (
                          <p>
                            Current:{" "}
                            <span className="text-green-400">
                              ${alert.lastPrice.toFixed(2)}
                            </span>{" "}
                            | {alert.maType}:{" "}
                            <span className="text-blue-400">
                              ${alert.currentMA.toFixed(2)}
                            </span>
                          </p>
                        )}
                        <p className="text-xs text-slate-400">
                          Created: {alert.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeAlert(alert.id)}
                      className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Remove alert"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-400 text-sm">
          <p>
            Data provided by CoinGecko API • Alerts checked every 10 minutes
          </p>
          <p className="mt-1">
            Enable browser notifications to receive real-time alerts
          </p>
        </div>
      </div>
    </div>
  );
};

export default CryptoMAAlerts;
