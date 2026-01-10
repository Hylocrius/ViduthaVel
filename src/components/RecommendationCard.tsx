import { CheckCircle2, AlertTriangle, ArrowRight, Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RevenueComparison, MarketData } from "@/lib/mockData";

interface RecommendationCardProps {
  bestOption: RevenueComparison;
  secondBest?: RevenueComparison;
  volatilityWarning?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function RecommendationCard({ bestOption, secondBest, volatilityWarning }: RecommendationCardProps) {
  const savingsVsSecond = secondBest 
    ? bestOption.netRevenue - secondBest.netRevenue 
    : 0;

  return (
    <div className="card-elevated overflow-hidden">
      {/* Header with gradient */}
      <div className="relative bg-primary p-6 text-primary-foreground">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent/30" />
        </div>
        <div className="relative">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium opacity-90">AI Recommendation</p>
              <h3 className="font-display text-xl font-bold mt-1">
                {bestOption.scenario === "now" ? "Sell Now" : "Store for 7 Days & Sell"}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        {/* Primary recommendation */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-success/10 border border-success/20">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-success" />
            <div>
              <p className="font-semibold">{bestOption.market.name}</p>
              <p className="text-sm text-muted-foreground">{bestOption.market.location}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-success">{formatCurrency(bestOption.netRevenue)}</p>
            <p className="text-sm text-muted-foreground">Net Revenue</p>
          </div>
        </div>

        {/* Comparison with second best */}
        {secondBest && savingsVsSecond > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <ArrowRight className="h-4 w-4 text-accent" />
            <p className="text-sm">
              <span className="font-medium text-success">+{formatCurrency(savingsVsSecond)}</span>
              {" "}more than selling at {secondBest.market.name}
              {secondBest.scenario === "7days" ? " in 7 days" : " now"}
            </p>
          </div>
        )}

        {/* Action timing */}
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              {bestOption.scenario === "now" 
                ? "Recommended selling window: Next 1-2 days"
                : "Optimal selling date: 7 days from now"
              }
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Market timing: 5:00 AM - 11:00 AM for best prices
            </p>
          </div>
        </div>

        {/* Risk warning */}
        {volatilityWarning && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warning-foreground">Risk Notice</p>
              <p className="text-sm text-muted-foreground mt-0.5">{volatilityWarning}</p>
            </div>
          </div>
        )}

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-lg font-bold">{bestOption.market.distance} km</p>
            <p className="text-xs text-muted-foreground">Distance</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-lg font-bold">{formatCurrency(bestOption.transportCost)}</p>
            <p className="text-xs text-muted-foreground">Transport</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-lg font-bold">{bestOption.profitMargin.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Margin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
