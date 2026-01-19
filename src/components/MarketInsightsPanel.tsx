import { TrendingUp, BarChart2, Activity, Lightbulb } from "lucide-react";
import type { MarketInsights } from "@/hooks/useMarketAnalysis";

interface MarketInsightsPanelProps {
  insights: MarketInsights;
  cropName?: string;
}

export function MarketInsightsPanel({ insights, cropName }: MarketInsightsPanelProps) {
  return (
    <div className="card-elevated p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
          <Lightbulb className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="font-display font-semibold">Real-Time Market Insights</h2>
          <p className="text-xs text-muted-foreground">
            AI-generated analysis for {cropName || "your crop"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <h3 className="text-sm font-semibold">Seasonal Trend</h3>
          </div>
          <p className="text-sm text-muted-foreground">{insights.seasonalTrend}</p>
        </div>

        <div className="p-4 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold">Demand Outlook</h3>
          </div>
          <p className="text-sm text-muted-foreground">{insights.demandOutlook}</p>
        </div>

        <div className="p-4 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold">Price Volatility</h3>
          </div>
          <p className="text-sm text-muted-foreground">{insights.priceVolatility}</p>
        </div>
      </div>
    </div>
  );
}
