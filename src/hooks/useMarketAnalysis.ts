import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AIAgentStep {
  agent: "market" | "logistics" | "storage" | "supervisor" | "weather";
  action: string;
  reasoning: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

export interface MarketData {
  id: string;
  name: string;
  location: string;
  distance: number;
  currentPrice: number;
  projectedPrice7Days: number;
  volatility: "low" | "medium" | "high";
  demand: "low" | "medium" | "high";
}

export interface CropInfo {
  name: string;
  shelfLife: number;
  lossRatePerDay: number;
  basePrice: number;
}

export interface StorageInfo {
  type: string;
  lossMultiplier: number;
  costPerDay: number;
}

export interface TransportInfo {
  vehicleType: string;
  ratePerKm: number;
  capacity: number;
}

export interface AIRevenueComparison {
  market: MarketData;
  scenario: "now" | "7days";
  grossRevenue: number;
  transportCost: number;
  storageCost: number;
  storageLoss: number;
  netRevenue: number;
  profitMargin: number;
}

export interface MarketInsights {
  seasonalTrend: string;
  demandOutlook: string;
  priceVolatility: string;
}

export interface WeatherCurrent {
  condition: "sunny" | "cloudy" | "rainy" | "stormy" | "foggy" | "hot";
  temperature: number;
  humidity: number;
  rainfall: number;
}

export interface WeatherForecast {
  day: number;
  condition: "sunny" | "cloudy" | "rainy" | "stormy" | "foggy" | "hot";
  temperature: number;
  humidity: number;
  rainfall: number;
}

export interface WeatherImpact {
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

export interface PriceHistoryEntry {
  date: string;
  price: number;
  volume?: number;
}

export interface FarmContextInput {
  crop: string;
  quantity: number;
  location: string;
  storageType: string;
}

interface AIAnalysisResponse {
  generatedMarkets: MarketData[];
  cropInfo: CropInfo;
  storageInfo: StorageInfo;
  transportInfo: TransportInfo;
  weatherData?: WeatherData;
  priceHistory?: PriceHistoryEntry[];
  agentSteps: Array<{
    agent: "market" | "logistics" | "storage" | "supervisor" | "weather";
    action: string;
    reasoning: string;
  }>;
  comparisons: Array<{
    marketId: string;
    marketName: string;
    location: string;
    distance: number;
    volatility: "low" | "medium" | "high";
    demand: "low" | "medium" | "high";
    scenario: "now" | "7days";
    grossRevenue: number;
    transportCost: number;
    storageCost: number;
    storageLoss: number;
    netRevenue: number;
    profitMargin: number;
  }>;
  recommendation: {
    bestMarketId: string;
    bestScenario: "now" | "7days";
    reasoning: string;
    riskWarning?: string;
  };
  marketInsights?: MarketInsights;
}

export function useMarketAnalysis() {
  const [agentSteps, setAgentSteps] = useState<AIAgentStep[]>([]);
  const [comparisons, setComparisons] = useState<AIRevenueComparison[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendedIndex, setRecommendedIndex] = useState<number | undefined>();
  const [riskWarning, setRiskWarning] = useState<string | undefined>();
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [cropInfo, setCropInfo] = useState<CropInfo | null>(null);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [transportInfo, setTransportInfo] = useState<TransportInfo | null>(null);
  const [marketInsights, setMarketInsights] = useState<MarketInsights | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);

  const analyzeMarket = useCallback(async (context: FarmContextInput) => {
    setIsAnalyzing(true);
    setAgentSteps([]);
    setComparisons([]);
    setRecommendedIndex(undefined);
    setRiskWarning(undefined);
    setMarkets([]);
    setCropInfo(null);
    setStorageInfo(null);
    setTransportInfo(null);
    setMarketInsights(null);
    setWeatherData(null);
    setPriceHistory([]);

    try {
      // Add initial step to show we're starting
      setAgentSteps([{
        agent: "supervisor",
        action: "Initializing real-time market analysis",
        reasoning: "Connecting to AI-powered market intelligence system to generate live market data...",
        timestamp: new Date(),
      }]);

      const { data, error } = await supabase.functions.invoke("analyze-market", {
        body: {
          farmContext: {
            crop: context.crop,
            quantity: context.quantity,
            location: context.location,
            storageType: context.storageType,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const analysis = data as AIAnalysisResponse;

      // Store generated data
      setMarkets(analysis.generatedMarkets || []);
      setCropInfo(analysis.cropInfo || null);
      setStorageInfo(analysis.storageInfo || null);
      setTransportInfo(analysis.transportInfo || null);
      setMarketInsights(analysis.marketInsights || null);
      setWeatherData(analysis.weatherData || null);
      setPriceHistory(analysis.priceHistory || []);

      // Animate agent steps appearing
      const steps: AIAgentStep[] = analysis.agentSteps.map((step, index) => ({
        ...step,
        timestamp: new Date(Date.now() + index * 500),
      }));

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setAgentSteps(prev => [...prev.slice(0, 1), ...steps.slice(0, i + 1)]);
      }

      // Transform comparisons to include full market data
      const transformedComparisons: AIRevenueComparison[] = analysis.comparisons.map(comp => {
        const market = analysis.generatedMarkets?.find(m => m.id === comp.marketId) || {
          id: comp.marketId,
          name: comp.marketName,
          location: comp.location,
          distance: comp.distance,
          currentPrice: comp.scenario === "now" ? comp.grossRevenue / context.quantity : 0,
          projectedPrice7Days: comp.scenario === "7days" ? comp.grossRevenue / context.quantity : 0,
          volatility: comp.volatility,
          demand: comp.demand,
        };

        return {
          market: market as MarketData,
          scenario: comp.scenario,
          grossRevenue: comp.grossRevenue,
          transportCost: comp.transportCost,
          storageCost: comp.storageCost,
          storageLoss: comp.storageLoss,
          netRevenue: comp.netRevenue,
          profitMargin: comp.profitMargin,
        };
      });

      setComparisons(transformedComparisons);

      // Find the recommended option
      const bestIndex = transformedComparisons.findIndex(
        comp => 
          comp.market.id === analysis.recommendation.bestMarketId && 
          comp.scenario === analysis.recommendation.bestScenario
      );

      if (bestIndex === -1) {
        // Fallback to highest net revenue
        const maxIndex = transformedComparisons.reduce(
          (best, current, index) => 
            current.netRevenue > transformedComparisons[best].netRevenue ? index : best,
          0
        );
        setRecommendedIndex(maxIndex);
      } else {
        setRecommendedIndex(bestIndex);
      }

      setRiskWarning(analysis.recommendation.riskWarning);
      
      toast.success("Real-time analysis complete!", {
        description: analysis.recommendation.reasoning.slice(0, 100) + "...",
      });

    } catch (error) {
      console.error("Error analyzing market:", error);
      toast.error("Analysis failed", {
        description: error instanceof Error ? error.message : "Please try again",
      });
      
      // Add error step
      setAgentSteps(prev => [...prev, {
        agent: "supervisor",
        action: "Analysis error",
        reasoning: error instanceof Error ? error.message : "An error occurred during analysis",
        timestamp: new Date(),
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const bestOption = recommendedIndex !== undefined ? comparisons[recommendedIndex] : null;
  const secondBest = comparisons
    .filter((_, i) => i !== recommendedIndex)
    .sort((a, b) => b.netRevenue - a.netRevenue)[0];

  return {
    agentSteps,
    comparisons,
    isAnalyzing,
    recommendedIndex,
    bestOption,
    secondBest,
    riskWarning,
    analyzeMarket,
    // Real-time data
    markets,
    cropInfo,
    storageInfo,
    transportInfo,
    marketInsights,
    weatherData,
    priceHistory,
  };
}
