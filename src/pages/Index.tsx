import { useState } from "react";
import { Header } from "@/components/Header";
import { FarmContextForm, type FarmContext } from "@/components/FarmContextForm";
import { AgentTracePanel } from "@/components/AgentTracePanel";
import { RevenueComparisonTable } from "@/components/RevenueComparisonTable";
import { RecommendationCard } from "@/components/RecommendationCard";
import { LogisticsChecklist } from "@/components/LogisticsChecklist";
import { RiskAnalysisPanel } from "@/components/RiskAnalysisPanel";
import { SensitivityAnalysis } from "@/components/SensitivityAnalysis";
import { MarketInsightsPanel } from "@/components/MarketInsightsPanel";
import { WeatherPanel } from "@/components/WeatherPanel";
import { PriceHistoryChart } from "@/components/PriceHistoryChart";
import { useMarketAnalysis } from "@/hooks/useMarketAnalysis";
import { Sprout, TrendingUp, Truck, BarChart3, Wifi } from "lucide-react";

export default function Index() {
  const [farmContext, setFarmContext] = useState<FarmContext | null>(null);
  const {
    agentSteps,
    comparisons,
    isAnalyzing,
    recommendedIndex,
    bestOption,
    secondBest,
    riskWarning,
    analyzeMarket,
    markets,
    cropInfo,
    storageInfo,
    transportInfo,
    marketInsights,
    weatherData,
    priceHistory,
  } = useMarketAnalysis();

  const handleAnalyze = async (context: FarmContext) => {
    setFarmContext(context);
    await analyzeMarket(context);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 space-y-8">
        {/* Hero section */}
        <section className="text-center py-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Wifi className="h-4 w-4" />
            Real-Time AI Analysis
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-balance gradient-text mb-4">
            Maximize Your Harvest Returns
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
            Our multi-agent AI generates real-time market data, analyzes transport costs, and storage losses 
            to recommend the optimal time and place to sell your crops.
          </p>
        </section>

        {/* Stats row */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Sprout, label: "Crops Supported", value: "10+", color: "text-primary" },
            { icon: TrendingUp, label: "Live Markets", value: markets.length > 0 ? `${markets.length}` : "4-6", color: "text-success" },
            { icon: Truck, label: "Real-Time Data", value: "✓", color: "text-agent-logistics" },
            { icon: BarChart3, label: "AI Factors", value: "20+", color: "text-accent" },
          ].map((stat, i) => (
            <div key={i} className="stat-card text-center animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold font-display">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Main form */}
        <section id="dashboard" className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <FarmContextForm onSubmit={handleAnalyze} isLoading={isAnalyzing} />
        </section>

        {/* Results section */}
        {(agentSteps.length > 0 || comparisons.length > 0) && (
          <section id="analysis" className="space-y-6">
            {/* Weather Panel */}
            {weatherData && (
              <div className="animate-fade-in">
                <WeatherPanel weather={weatherData} />
              </div>
            )}

            {/* Price History Chart */}
            {priceHistory && priceHistory.length > 0 && (
              <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
                <PriceHistoryChart priceHistory={priceHistory} cropName={cropInfo?.name} />
              </div>
            )}

            {/* Market Insights Panel */}
            {marketInsights && (
              <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
                <MarketInsightsPanel insights={marketInsights} cropName={cropInfo?.name} />
              </div>
            )}

            {/* Agent trace and recommendation */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="animate-slide-in-right">
                <AgentTracePanel steps={agentSteps} isRunning={isAnalyzing} />
              </div>
              {bestOption && (
                <div className="animate-slide-in-right" style={{ animationDelay: "100ms" }}>
                  <RecommendationCard 
                    bestOption={bestOption}
                    secondBest={secondBest}
                    volatilityWarning={riskWarning || (
                      bestOption.market.volatility === "high" 
                        ? `${bestOption.market.name} has high price volatility. Consider monitoring prices closely.`
                        : undefined
                    )}
                  />
                </div>
              )}
            </div>

            {/* Revenue comparison table */}
            {comparisons.length > 0 && (
              <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
                <RevenueComparisonTable 
                  comparisons={comparisons}
                  recommendedIndex={recommendedIndex}
                />
              </div>
            )}

            {/* Sensitivity analysis */}
            {cropInfo && bestOption && storageInfo && transportInfo && (
              <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
                <SensitivityAnalysis
                  crop={cropInfo}
                  quantity={farmContext?.quantity || 50}
                  market={bestOption.market}
                  transport={transportInfo}
                  storage={storageInfo}
                />
              </div>
            )}

            {/* Logistics and risk */}
            <div id="logistics" className="grid gap-6 lg:grid-cols-2">
              <div className="animate-fade-in" style={{ animationDelay: "400ms" }}>
                <LogisticsChecklist 
                  market={bestOption?.market}
                  quantity={farmContext?.quantity}
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: "500ms" }}>
                <RiskAnalysisPanel 
                  markets={markets}
                  crop={cropInfo}
                  storage={storageInfo}
                />
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-border pt-8 pb-12 text-center text-sm text-muted-foreground">
          <p className="mb-2">
            Built for <span className="font-semibold">AI Ignite National Gen AI Hackathon</span>
          </p>
          <p>
            Powered by <span className="font-semibold text-primary">Lovable AI</span> • Real-Time Market Intelligence
          </p>
          <p className="mt-4 text-xs max-w-xl mx-auto">
            Disclaimer: This tool provides AI-generated estimates based on real-time market analysis. 
            Always verify current market prices before making selling decisions.
          </p>
        </footer>
      </main>
    </div>
  );
}
