import { RefreshCw, TrendingUp, TrendingDown, Clock, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LiveMarketData } from "@/hooks/useLiveMarketPrices";

interface LivePricesTickerProps {
  markets: LiveMarketData[];
  isLoading: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
  selectedCrop: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LivePricesTicker({
  markets,
  isLoading,
  lastUpdated,
  onRefresh,
  selectedCrop,
}: LivePricesTickerProps) {
  if (markets.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="h-5 w-5 text-success" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-success rounded-full animate-pulse" />
          </div>
          <h3 className="font-display font-semibold text-lg">Live Market Prices</h3>
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            {selectedCrop}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Updated {formatTime(lastUpdated)}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8"
          >
            <RefreshCw className={cn("h-4 w-4 mr-1", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {markets.slice(0, 6).map((market, index) => {
          const priceChange = market.projectedPrice7Days - market.currentPrice;
          const changePercent = ((priceChange / market.currentPrice) * 100).toFixed(1);
          const isPositive = priceChange > 0;

          return (
            <div
              key={market.id}
              className={cn(
                "flex-shrink-0 min-w-[180px] p-3 rounded-lg border transition-all duration-300",
                index === 0 ? "bg-primary/5 border-primary/30" : "bg-muted/30 border-border",
                "hover:border-primary/50 hover:shadow-sm"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground truncate max-w-[100px]">
                  {market.name}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] h-4",
                    market.demand === "high" ? "bg-success/10 text-success border-success/30" :
                    market.demand === "medium" ? "bg-warning/10 text-warning border-warning/30" :
                    "bg-muted text-muted-foreground"
                  )}
                >
                  {market.demand}
                </Badge>
              </div>
              
              <p className="font-display font-bold text-lg">
                {formatCurrency(market.currentPrice)}
                <span className="text-xs text-muted-foreground font-normal">/q</span>
              </p>
              
              <div className={cn(
                "flex items-center gap-1 text-xs mt-1",
                isPositive ? "text-success" : "text-destructive"
              )}>
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{isPositive ? "+" : ""}{changePercent}% (7d)</span>
              </div>

              <p className="text-[10px] text-muted-foreground mt-1">
                {market.arrivals} quintals arrived
              </p>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground mt-3 text-center">
        📡 Simulated real-time data • Auto-refreshes every 5 minutes • Prices in INR per quintal
      </p>
    </div>
  );
}
