import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  TRANSPORT_RATES,
  type MarketData,
} from "@/lib/mockData";
import type { FarmContext } from "@/components/FarmContextForm";
import type { LiveMarketData } from "@/hooks/useLiveMarketPrices";
import { toast } from "sonner";

export interface AIAgentStep {
  agent: "market" | "logistics" | "storage" | "supervisor";
  action: string;
  reasoning: string;
  timestamp: Date;
  data?: Record<string, unknown>;
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

interface AIAnalysisResponse {
  agentSteps: Array<{
    agent: "market" | "logistics" | "storage" | "supervisor";
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
}

export function useMarketAnalysis() {
  const [agentSteps, setAgentSteps] = useState<AIAgentStep[]>([]);
  const [comparisons, setComparisons] = useState<AIRevenueComparison[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendedIndex, setRecommendedIndex] = useState<number | undefined>();
  const [riskWarning, setRiskWarning] = useState<string | undefined>();

  const analyzeMarket = useCallback(async (context: FarmContext, liveMarkets?: LiveMarketData[]) => {
    setIsAnalyzing(true);
    setAgentSteps([]);
    setComparisons([]);
    setRecommendedIndex(undefined);
    setRiskWarning(undefined);

    try {
      // Add initial step to show we're starting
      setAgentSteps([{
        agent: "supervisor",
        action: "Initializing multi-agent analysis",
        reasoning: "Starting AI-powered market analysis for your farm context...",
        timestamp: new Date(),
      }]);

      // Use live markets if available, otherwise use static data
      const marketsToUse = liveMarkets && liveMarkets.length > 0 
        ? liveMarkets.map(m => ({
            id: m.id,
            name: m.name,
            location: m.location,
            distance: m.distance,
            currentPrice: m.currentPrice,
            projectedPrice7Days: m.projectedPrice7Days,
            volatility: m.volatility,
            demand: m.demand,
          }))
        : [];

      const { data, error } = await supabase.functions.invoke("analyze-market", {
        body: {
          farmContext: {
            crop: context.crop,
            quantity: context.quantity,
            location: context.location,
            storageCondition: context.storageCondition,
          },
          markets: marketsToUse.length > 0 ? marketsToUse : undefined,
          transportRates: TRANSPORT_RATES,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const analysis = data as AIAnalysisResponse;

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
        // Try to find in live markets first, then create from comparison data
        const liveMarket = liveMarkets?.find(m => m.id === comp.marketId);
        const market: MarketData = liveMarket || {
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
      
      toast.success("AI analysis complete!", {
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
  };
}
