import { AlertTriangle, TrendingUp, TrendingDown, Info, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarketData, CropType, StorageCondition } from "@/lib/mockData";
import { DISCLAIMER_TEXT } from "@/lib/mockData";

interface RiskAnalysisPanelProps {
  markets: MarketData[];
  crop?: CropType;
  storage?: StorageCondition;
}

export function RiskAnalysisPanel({ markets, crop, storage }: RiskAnalysisPanelProps) {
  const highVolatilityMarkets = markets.filter(m => m.volatility === "high");
  const hasStorageRisk = storage && storage.lossMultiplier > 1;
  const isPerishable = crop && crop.shelfLife < 30;

  const risks = [
    {
      level: "high" as const,
      title: "Price Volatility",
      description: `${highVolatilityMarkets.length} market(s) showing high price volatility`,
      markets: highVolatilityMarkets.map(m => m.name),
      visible: highVolatilityMarkets.length > 0,
    },
    {
      level: "medium" as const,
      title: "Storage Degradation",
      description: hasStorageRisk 
        ? `${storage?.type} storage increases loss rate by ${((storage?.lossMultiplier || 1) - 1) * 100}%`
        : "Storage conditions are optimal",
      visible: hasStorageRisk,
    },
    {
      level: isPerishable ? "high" : "low" as const,
      title: "Crop Shelf Life",
      description: crop 
        ? `${crop.name} has ${crop.shelfLife} day shelf life with ${crop.lossRatePerDay}% daily loss`
        : "Select a crop to see shelf life risk",
      visible: !!crop,
    },
  ];

  return (
    <div className="card-elevated p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/20">
          <AlertTriangle className="h-4 w-4 text-warning" />
        </div>
        <div>
          <h2 className="font-display font-semibold">Risk Analysis</h2>
          <p className="text-xs text-muted-foreground">Factors affecting your decision</p>
        </div>
      </div>

      {/* Risk items */}
      <div className="space-y-3">
        {risks.filter(r => r.visible).map((risk, index) => (
          <div
            key={index}
            className={cn(
              "p-3 rounded-lg border",
              risk.level === "high" && "bg-destructive/5 border-destructive/20",
              risk.level === "medium" && "bg-warning/5 border-warning/20",
              risk.level === "low" && "bg-success/5 border-success/20"
            )}
          >
            <div className="flex items-start gap-3">
              {risk.level === "high" ? (
                <TrendingDown className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              ) : risk.level === "medium" ? (
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              ) : (
                <TrendingUp className="h-4 w-4 text-success shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-medium">{risk.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{risk.description}</p>
                {risk.markets && risk.markets.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {risk.markets.map((market) => (
                      <span 
                        key={market}
                        className="text-xs px-2 py-0.5 rounded bg-background border border-border"
                      >
                        {market}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Market demand overview */}
      <div className="p-4 rounded-lg bg-muted/30">
        <h3 className="text-sm font-semibold mb-3">Market Demand Overview</h3>
        <div className="space-y-2">
          {markets.map((market) => (
            <div key={market.id} className="flex items-center justify-between text-sm">
              <span>{market.name}</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                market.demand === "high" && "bg-success/20 text-success",
                market.demand === "medium" && "bg-warning/20 text-warning-foreground",
                market.demand === "low" && "bg-muted text-muted-foreground"
              )}>
                {market.demand} demand
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground space-y-2">
            <p className="font-medium">Important Disclaimer</p>
            <p>
              This tool provides estimates based on simulated data. Actual results may vary due to 
              market fluctuations, weather, and local conditions.
            </p>
            <div className="flex items-center gap-1 text-primary">
              <ExternalLink className="h-3 w-3" />
              <a href="https://agmarknet.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Verify prices at Agmarknet
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
