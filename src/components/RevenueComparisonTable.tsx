import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RevenueComparison } from "@/lib/mockData";

interface RevenueComparisonTableProps {
  comparisons: RevenueComparison[];
  recommendedIndex?: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function RevenueComparisonTable({ comparisons, recommendedIndex }: RevenueComparisonTableProps) {
  // Group by market
  const marketGroups = comparisons.reduce((acc, comp) => {
    const key = comp.market.id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(comp);
    return acc;
  }, {} as Record<string, RevenueComparison[]>);

  return (
    <div className="card-elevated overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
            <TrendingUp className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="font-display font-semibold">Net Revenue Comparison</h2>
            <p className="text-xs text-muted-foreground">Now vs. +7 Days across markets</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 text-left">
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Market</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Scenario</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Gross Revenue</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Transport</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Storage Cost</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Loss Value</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Net Revenue</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Margin</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((comp, index) => {
              const isRecommended = index === recommendedIndex;
              const isFirstInGroup = !comparisons[index - 1] || comparisons[index - 1].market.id !== comp.market.id;
              
              return (
                <tr
                  key={`${comp.market.id}-${comp.scenario}`}
                  className={cn(
                    "border-b border-border last:border-0 transition-colors",
                    isRecommended && "bg-success/5",
                    !isFirstInGroup && "bg-muted/20"
                  )}
                >
                  <td className="px-4 py-3">
                    {isFirstInGroup && (
                      <div>
                        <span className="font-medium text-sm">{comp.market.name}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>{comp.market.location}</span>
                          <span>•</span>
                          <span>{comp.market.distance} km</span>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                      comp.scenario === "now" 
                        ? "bg-primary/10 text-primary"
                        : "bg-accent/10 text-accent-foreground"
                    )}>
                      {comp.scenario === "now" ? "Sell Now" : "Sell in 7 Days"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    {formatCurrency(comp.grossRevenue)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-destructive">
                    -{formatCurrency(comp.transportCost)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-destructive">
                    {comp.storageCost > 0 ? `-${formatCurrency(comp.storageCost)}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-destructive">
                    {comp.storageLoss > 0 ? `-${formatCurrency(comp.storageLoss)}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn(
                      "font-semibold text-sm",
                      isRecommended && "text-success"
                    )}>
                      {formatCurrency(comp.netRevenue)}
                      {isRecommended && (
                        <span className="ml-1 text-xs">✓</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn(
                      "inline-flex items-center gap-1 text-sm font-medium",
                      comp.profitMargin > 0 ? "text-success" : comp.profitMargin < 0 ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {comp.profitMargin > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : comp.profitMargin < 0 ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                      {comp.profitMargin.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
