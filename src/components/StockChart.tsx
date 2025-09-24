import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';

interface StockChartProps {
  symbol: string;
  onPriceSelect?: (price: number, timestamp: string) => void;
  showLevels?: boolean;
  entryPrice?: number;
  exitPrice?: number;
  targetPrice?: number;
  stopPrice?: number;
}

interface ChartData {
  timestamp: string;
  price: number;
  volume: number;
  date: string;
}

const ALPHA_VANTAGE_API_KEY = 'XEJGZXHTJT53OD85';

export default function StockChart({ 
  symbol, 
  onPriceSelect, 
  showLevels = false,
  entryPrice,
  exitPrice,
  targetPrice,
  stopPrice
}: StockChartProps) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'1min' | '5min' | '15min' | '30min' | '60min' | 'daily'>('5min');

  useEffect(() => {
    if (!symbol) return;
    fetchStockData();
  }, [symbol, timeframe]);

  const fetchStockData = async () => {
    if (!symbol.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let url = '';
      let functionName = '';
      
      if (timeframe === 'daily') {
        functionName = 'TIME_SERIES_DAILY';
        url = `https://www.alphavantage.co/query?function=${functionName}&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
      } else {
        functionName = 'TIME_SERIES_INTRADAY';
        url = `https://www.alphavantage.co/query?function=${functionName}&symbol=${symbol}&interval=${timeframe}&apikey=${ALPHA_VANTAGE_API_KEY}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result['Error Message']) {
        throw new Error('Invalid symbol or API error');
      }

      if (result['Note']) {
        throw new Error('API call frequency limit reached. Please try again later.');
      }

      // Parse the data based on timeframe
      let timeSeries;
      if (timeframe === 'daily') {
        timeSeries = result['Time Series (Daily)'];
      } else {
        timeSeries = result[`Time Series (${timeframe})`];
      }

      if (!timeSeries) {
        throw new Error('No data available for this symbol');
      }

      // Convert to chart format
      const chartData: ChartData[] = Object.entries(timeSeries)
        .slice(0, 100) // Last 100 data points
        .map(([timestamp, values]: [string, any]) => ({
          timestamp,
          price: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume']),
          date: new Date(timestamp).toLocaleDateString()
        }))
        .reverse(); // Chronological order

      setData(chartData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleChartClick = (data: any) => {
    if (onPriceSelect && data && data.activePayload?.[0]) {
      const price = data.activePayload[0].payload.price;
      const timestamp = data.activePayload[0].payload.timestamp;
      onPriceSelect(price, timestamp);
    }
  };

  const currentPrice = data.length > 0 ? data[data.length - 1].price : 0;
  const previousPrice = data.length > 1 ? data[data.length - 2].price : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  if (!symbol) {
    return (
      <div className="rounded-2xl p-6 card-surface">
        <div className="text-center text-gray-500">
          <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Enter a symbol to view chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 card-surface">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-900">{symbol.toUpperCase()}</h3>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
          {error && <AlertCircle className="h-4 w-4 text-red-500" />}
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex items-center gap-1">
          {(['1min', '5min', '15min', '30min', '60min', 'daily'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-1 text-xs rounded ${
                timeframe === tf 
                  ? 'accent-chip-selected' 
                  : 'chip'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Price Info */}
      {data.length > 0 && (
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            <span className="text-2xl font-bold text-gray-900">
              ${currentPrice.toFixed(2)}
            </span>
          </div>
          <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={fetchStockData}
            className="mt-2 accent-outline text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-blue-500" />
          <p className="text-gray-600 text-sm">Loading chart data...</p>
        </div>
      )}

      {/* Chart */}
      {!loading && !error && data.length > 0 && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} onClick={handleChartClick}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#666" 
                fontSize={12}
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                stroke="#666" 
                fontSize={12}
                domain={['dataMin - 1', 'dataMax + 1']}
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="var(--accent)" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: 'var(--accent)', strokeWidth: 2 }}
              />
              
              {/* Trade Level Markers */}
              {showLevels && entryPrice && (
                <ReferenceLine 
                  y={entryPrice} 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  label={{ value: `Entry: $${entryPrice.toFixed(2)}`, fill: '#3b82f6', fontSize: 12 }}
                />
              )}
              {showLevels && exitPrice && (
                <ReferenceLine 
                  y={exitPrice} 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  label={{ value: `Exit: $${exitPrice.toFixed(2)}`, fill: '#8b5cf6', fontSize: 12 }}
                />
              )}
              {showLevels && targetPrice && (
                <ReferenceLine 
                  y={targetPrice} 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  label={{ value: `Target: $${targetPrice.toFixed(2)}`, fill: '#10b981', fontSize: 12 }}
                />
              )}
              {showLevels && stopPrice && (
                <ReferenceLine 
                  y={stopPrice} 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  label={{ value: `Stop: $${stopPrice.toFixed(2)}`, fill: '#ef4444', fontSize: 12 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Instructions and Legend */}
      <div className="mt-3 space-y-2">
        {onPriceSelect && data.length > 0 && (
          <p className="text-xs text-gray-500 text-center">
            Click on the chart to select entry/exit prices
          </p>
        )}
        {showLevels && (entryPrice || exitPrice || targetPrice || stopPrice) && (
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            {entryPrice && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-blue-500 border-dashed border-t-2 border-blue-500"></div>
                <span className="text-blue-600">Entry</span>
              </div>
            )}
            {exitPrice && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-purple-500 border-dashed border-t-2 border-purple-500"></div>
                <span className="text-purple-600">Exit</span>
              </div>
            )}
            {targetPrice && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-green-500 border-dashed border-t-2 border-green-500"></div>
                <span className="text-green-600">Target</span>
              </div>
            )}
            {stopPrice && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-red-500 border-dashed border-t-2 border-red-500"></div>
                <span className="text-red-600">Stop</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
