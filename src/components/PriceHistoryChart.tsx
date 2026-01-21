import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export interface PriceHistoryEntry {
  date: string;
  price: number;
  volume?: number;
}

interface PriceHistoryChartProps {
  priceHistory: PriceHistoryEntry[];
  cropName?: string;
}

export function PriceHistoryChart({ priceHistory, cropName }: PriceHistoryChartProps) {
  if (!priceHistory || priceHistory.length === 0) {
    return null;
  }

  // Calculate statistics
  const prices = priceHistory.map(p => p.price);
  const currentPrice = prices[prices.length - 1];
  const previousPrice = prices[0];
  const highPrice = Math.max(...prices);
  const lowPrice = Math.min(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = ((priceChange / previousPrice) * 100).toFixed(1);

  const trend = priceChange > 0 ? "up" : priceChange < 0 ? "down" : "neutral";
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  // Format data for chart
  const chartData = priceHistory.map((entry) => ({
    ...entry,
    dateLabel: new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  }));

  const chartConfig = {
    price: {
      label: "Price",
      color: "hsl(var(--primary))",
    },
    volume: {
      label: "Volume",
      color: "hsl(var(--muted-foreground))",
    },
  };

  return (
    <div className="card-elevated p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
            <Calendar className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="font-display font-semibold">Price History</h2>
            <p className="text-xs text-muted-foreground">
              {cropName || "Crop"} - Last 30 days
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
          trend === "up" ? "bg-success/20 text-success" :
          trend === "down" ? "bg-destructive/20 text-destructive" :
          "bg-muted text-muted-foreground"
        }`}>
          <TrendIcon className="h-4 w-4" />
          <span className="text-sm font-medium">
            {trend === "up" ? "+" : ""}{priceChangePercent}%
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Current", value: `₹${currentPrice.toLocaleString('en-IN')}`, highlight: true },
          { label: "High", value: `₹${highPrice.toLocaleString('en-IN')}` },
          { label: "Low", value: `₹${lowPrice.toLocaleString('en-IN')}` },
          { label: "Average", value: `₹${avgPrice.toFixed(0).toLocaleString()}` },
        ].map((stat, i) => (
          <div key={i} className={`p-3 rounded-lg ${stat.highlight ? 'bg-primary/10' : 'bg-muted/30'}`}>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`text-sm font-bold font-display ${stat.highlight ? 'text-primary' : ''}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[200px]">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="dateLabel" 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
                domain={['dataMin - 100', 'dataMax + 100']}
              />
              <ChartTooltip
                content={<ChartTooltipContent 
                  formatter={(value, name) => {
                    if (name === 'price') return [`₹${Number(value).toLocaleString('en-IN')}/quintal`, 'Price'];
                    if (name === 'volume') return [`${value} quintals`, 'Volume'];
                    return [value, name];
                  }}
                />}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
