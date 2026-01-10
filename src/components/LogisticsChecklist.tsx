import { useState } from "react";
import { ClipboardList, Check, Truck, FileText, Package, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { LOGISTICS_CHECKLIST, TRANSPORT_RATES, type MarketData } from "@/lib/mockData";

interface LogisticsChecklistProps {
  market?: MarketData;
  quantity?: number;
}

const categoryIcons: Record<string, React.ElementType> = {
  Documentation: FileText,
  Packaging: Package,
  Transport: Truck,
  Market: Store,
};

export function LogisticsChecklist({ market, quantity = 50 }: LogisticsChecklistProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggleItem = (id: number) => {
    const newChecked = new Set(checked);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setChecked(newChecked);
  };

  const groupedItems = LOGISTICS_CHECKLIST.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof LOGISTICS_CHECKLIST>);

  const completedCount = checked.size;
  const totalRequired = LOGISTICS_CHECKLIST.filter(i => i.required).length;
  const requiredCompleted = LOGISTICS_CHECKLIST.filter(i => i.required && checked.has(i.id)).length;
  const progress = (requiredCompleted / totalRequired) * 100;

  // Calculate recommended vehicle
  const recommendedVehicle = TRANSPORT_RATES.find(t => t.capacity >= quantity) || TRANSPORT_RATES[TRANSPORT_RATES.length - 1];

  return (
    <div className="card-elevated p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <ClipboardList className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-semibold">Logistics Checklist</h2>
            <p className="text-xs text-muted-foreground">Prepare for market trip</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">{completedCount}/{LOGISTICS_CHECKLIST.length}</p>
          <p className="text-xs text-muted-foreground">completed</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div 
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {requiredCompleted === totalRequired 
            ? "✓ All required items checked" 
            : `${totalRequired - requiredCompleted} required items remaining`}
        </p>
      </div>

      {/* Route summary */}
      {market && (
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <h3 className="text-sm font-semibold mb-3">Route Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Destination</span>
              <span className="font-medium">{market.name}, {market.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Distance</span>
              <span className="font-medium">{market.distance} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Travel Time</span>
              <span className="font-medium">{Math.ceil(market.distance / 40)} - {Math.ceil(market.distance / 30)} hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recommended Vehicle</span>
              <span className="font-medium">{recommendedVehicle.vehicleType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Departure Time</span>
              <span className="font-medium">2:00 AM - 3:00 AM</span>
            </div>
          </div>
        </div>
      )}

      {/* Checklist items */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([category, items]) => {
          const Icon = categoryIcons[category] || ClipboardList;
          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">{category}</h3>
              </div>
              <div className="space-y-1 ml-6">
                {items.map((item) => (
                  <label
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                      checked.has(item.id) && "bg-success/5"
                    )}
                  >
                    <Checkbox
                      checked={checked.has(item.id)}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    <span className={cn(
                      "text-sm flex-1",
                      checked.has(item.id) && "line-through text-muted-foreground"
                    )}>
                      {item.item}
                    </span>
                    {item.required && !checked.has(item.id) && (
                      <span className="text-xs text-destructive">Required</span>
                    )}
                    {checked.has(item.id) && (
                      <Check className="h-4 w-4 text-success" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
