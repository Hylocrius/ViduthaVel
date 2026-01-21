import { Cloud, CloudRain, Sun, CloudSnow, CloudFog, Thermometer, Droplets, Truck, Package, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WeatherCurrent {
  condition: "sunny" | "cloudy" | "rainy" | "stormy" | "foggy" | "hot";
  temperature: number;
  humidity: number;
  rainfall: number;
}

interface WeatherForecast {
  day: number;
  condition: "sunny" | "cloudy" | "rainy" | "stormy" | "foggy" | "hot";
  temperature: number;
  humidity: number;
  rainfall: number;
}

interface WeatherImpact {
  severity: "none" | "low" | "moderate" | "high" | "severe";
  description: string;
  delayRisk?: number;
  additionalLossRate?: number;
}

export interface WeatherData {
  location: string;
  current: WeatherCurrent;
  forecast: WeatherForecast[];
  transportImpact: WeatherImpact;
  storageImpact: WeatherImpact;
}

interface WeatherPanelProps {
  weather: WeatherData;
}

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  stormy: CloudRain,
  foggy: CloudFog,
  hot: Thermometer,
};

const severityColors = {
  none: "bg-success/20 text-success border-success/30",
  low: "bg-success/20 text-success border-success/30",
  moderate: "bg-warning/20 text-warning border-warning/30",
  high: "bg-destructive/20 text-destructive border-destructive/30",
  severe: "bg-destructive/20 text-destructive border-destructive/30",
};

export function WeatherPanel({ weather }: WeatherPanelProps) {
  const CurrentIcon = weatherIcons[weather.current.condition] || Cloud;

  return (
    <div className="card-elevated p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-agent-logistics/20">
          <Cloud className="h-4 w-4 text-agent-logistics" />
        </div>
        <div>
          <h2 className="font-display font-semibold">Weather Conditions</h2>
          <p className="text-xs text-muted-foreground">{weather.location} - Real-time weather data</p>
        </div>
      </div>

      {/* Current Weather */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 rounded-lg bg-muted/30 border border-border">
          <h3 className="text-sm font-semibold mb-3">Current Conditions</h3>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <CurrentIcon className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold font-display">{weather.current.temperature}°C</p>
              <p className="text-sm text-muted-foreground capitalize">{weather.current.condition}</p>
            </div>
          </div>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Droplets className="h-4 w-4" />
              <span>{weather.current.humidity}% humidity</span>
            </div>
            {weather.current.rainfall > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CloudRain className="h-4 w-4" />
                <span>{weather.current.rainfall}mm rain</span>
              </div>
            )}
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="p-4 rounded-lg bg-muted/30 border border-border">
          <h3 className="text-sm font-semibold mb-3">7-Day Forecast</h3>
          <div className="flex gap-2 overflow-x-auto">
            {weather.forecast.slice(0, 7).map((day, i) => {
              const Icon = weatherIcons[day.condition] || Cloud;
              return (
                <div key={i} className="flex flex-col items-center gap-1 min-w-[48px] p-2 rounded-lg bg-background/50">
                  <span className="text-xs text-muted-foreground">D{day.day}</span>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium">{day.temperature}°</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Impact Analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className={`p-4 rounded-lg border ${severityColors[weather.transportImpact.severity]}`}>
          <div className="flex items-center gap-2 mb-2">
            <Truck className="h-4 w-4" />
            <h3 className="text-sm font-semibold">Transport Impact</h3>
            <Badge variant="outline" className="ml-auto text-xs capitalize">
              {weather.transportImpact.severity}
            </Badge>
          </div>
          <p className="text-sm opacity-90">{weather.transportImpact.description}</p>
          {weather.transportImpact.delayRisk !== undefined && weather.transportImpact.delayRisk > 0 && (
            <div className="flex items-center gap-1.5 mt-2 text-sm">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Delay risk: {weather.transportImpact.delayRisk}%</span>
            </div>
          )}
        </div>

        <div className={`p-4 rounded-lg border ${severityColors[weather.storageImpact.severity]}`}>
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4" />
            <h3 className="text-sm font-semibold">Storage Impact</h3>
            <Badge variant="outline" className="ml-auto text-xs capitalize">
              {weather.storageImpact.severity}
            </Badge>
          </div>
          <p className="text-sm opacity-90">{weather.storageImpact.description}</p>
          {weather.storageImpact.additionalLossRate !== undefined && weather.storageImpact.additionalLossRate > 0 && (
            <div className="flex items-center gap-1.5 mt-2 text-sm">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Additional loss: +{weather.storageImpact.additionalLossRate}%/day</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
