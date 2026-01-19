import { useState, useMemo } from "react";
import { Sliders, Fuel, Warehouse, TrendingUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { CropInfo, StorageInfo, TransportInfo, MarketData } from "@/hooks/useMarketAnalysis";

interface SensitivityAnalysisProps {
  crop: CropInfo;
  quantity: number;
  market: MarketData;
  transport: TransportInfo;
  storage: StorageInfo;
}

const FUEL_PRICE_PER_LITER = 105; // INR

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function SensitivityAnalysis({ 
  crop, 
  quantity, 
  market, 
  transport, 
  storage 
}: SensitivityAnalysisProps) {
  const [fuelPriceMultiplier, setFuelPriceMultiplier] = useState([1]);
  const [lossRateMultiplier, setLossRateMultiplier] = useState([1]);

  // Calculate break-even point data
  const breakEvenData = useMemo(() => {
    const data = [];
    const basePrice = market.currentPrice;
    const projectedPriceGain = market.projectedPrice7Days - basePrice;
    const dailyPriceIncrease = projectedPriceGain / 7;

    for (let day = 0; day <= 14; day++) {
      const estimatedPrice = basePrice + (dailyPriceIncrease * day);
      const adjustedLossRate = crop.lossRatePerDay * storage.lossMultiplier * lossRateMultiplier[0];
      const lossPercentage = (day * adjustedLossRate) / 100;
      const effectiveQuantity = quantity * (1 - lossPercentage);
      
      const grossRevenue = effectiveQuantity * estimatedPrice;
      const adjustedFuelCost = FUEL_PRICE_PER_LITER * fuelPriceMultiplier[0];
      const fuelConsumption = market.distance / 8; // km per liter
      const fuelCostComponent = fuelConsumption * adjustedFuelCost;
      const transportCost = (transport.ratePerKm * market.distance + fuelCostComponent) * Math.ceil(quantity / transport.capacity);
      const storageCost = day * storage.costPerDay * quantity;
      
      const netRevenue = grossRevenue - transportCost - storageCost;
      const storageLossValue = (quantity - effectiveQuantity) * estimatedPrice;

      data.push({
        day,
        netRevenue: Math.round(netRevenue),
        storageLossValue: Math.round(storageLossValue),
        storageCost: Math.round(storageCost),
      });
    }
    return data;
  }, [crop, quantity, market, transport, storage, fuelPriceMultiplier, lossRateMultiplier]);

  // Find optimal day
  const optimalDay = breakEvenData.reduce((best, current) => 
    current.netRevenue > best.netRevenue ? current : best
  ).day;

  // Find break-even day (where revenue starts declining from peak)
  const breakEvenDay = breakEvenData.findIndex((d, i) => 
    i > optimalDay && d.netRevenue < breakEvenData[optimalDay].netRevenue * 0.95
  );

  return (
    <div className="card-elevated p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
          <Sliders className="h-4 w-4 text-accent" />
        </div>
        <div>
          <h2 className="font-display font-semibold">Sensitivity Analysis</h2>
          <p className="text-xs text-muted-foreground">Adjust parameters to see impact</p>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm">
              <Fuel className="h-4 w-4 text-muted-foreground" />
              Fuel Price
            </Label>
            <span className="text-sm font-medium">
              {formatCurrency(FUEL_PRICE_PER_LITER * fuelPriceMultiplier[0])}/L
            </span>
          </div>
          <Slider
            value={fuelPriceMultiplier}
            onValueChange={setFuelPriceMultiplier}
            min={0.8}
            max={1.5}
            step={0.05}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>-20%</span>
            <span>Current</span>
            <span>+50%</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm">
              <Warehouse className="h-4 w-4 text-muted-foreground" />
              Loss Rate
            </Label>
            <span className="text-sm font-medium">
              {(crop.lossRatePerDay * lossRateMultiplier[0]).toFixed(2)}%/day
            </span>
          </div>
          <Slider
            value={lossRateMultiplier}
            onValueChange={setLossRateMultiplier}
            min={0.5}
            max={2}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Best case</span>
            <span>Default</span>
            <span>Worst case</span>
          </div>
        </div>
      </div>

      {/* Break-even chart */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Diminishing Returns Analysis</h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span>Net Revenue</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-destructive" />
              <span>Storage Loss</span>
            </div>
          </div>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={breakEvenData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `Day ${v}`}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelFormatter={(label) => `Day ${label}`}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <ReferenceLine 
                x={optimalDay} 
                stroke="hsl(var(--success))" 
                strokeDasharray="5 5"
                label={{ value: 'Optimal', position: 'top', fontSize: 10 }}
              />
              <Line 
                type="monotone" 
                dataKey="netRevenue" 
                name="Net Revenue"
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="storageLossValue" 
                name="Storage Loss"
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 p-4 rounded-lg bg-muted/30">
        <div className="text-center">
          <p className="text-lg font-bold text-success">Day {optimalDay}</p>
          <p className="text-xs text-muted-foreground">Optimal Sell Day</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">{formatCurrency(breakEvenData[optimalDay]?.netRevenue || 0)}</p>
          <p className="text-xs text-muted-foreground">Peak Revenue</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-warning">
            {breakEvenDay > 0 ? `Day ${breakEvenDay}` : "N/A"}
          </p>
          <p className="text-xs text-muted-foreground">Break-even Point</p>
        </div>
      </div>
    </div>
  );
}
