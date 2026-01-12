import { useState } from "react";
import { Header } from "@/components/Header";
import { FarmContextForm, type FarmContext } from "@/components/FarmContextForm";
import { AgentTracePanel } from "@/components/AgentTracePanel";
import { RevenueComparisonTable } from "@/components/RevenueComparisonTable";
import { RecommendationCard } from "@/components/RecommendationCard";
import { LogisticsChecklist } from "@/components/LogisticsChecklist";
import { RiskAnalysisPanel } from "@/components/RiskAnalysisPanel";
import { SensitivityAnalysis } from "@/components/SensitivityAnalysis";
import { LivePricesTicker } from "@/components/LivePricesTicker";
import { useMarketAnalysis } from "@/hooks/useMarketAnalysis";
import { useLiveMarketPrices } from "@/hooks/useLiveMarketPrices";
import { TRANSPORT_RATES } from "@/lib/mockData";
import { Sprout, TrendingUp, Truck, BarChart3, Sparkles, Radio } from "lucide-react";

export default function Index() {
  const [farmContext, setFarmContext] = useState<FarmContext | null>(null);
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  
  const {
    markets: liveMarkets,
    isLoading: isPricesLoading,
    lastUpdated,
    refreshPrices,
  } = useLiveMarketPrices(selectedCropId);

  const {
    agentSteps,
    comparisons,
    isAnalyzing,
    recommendedIndex,
    bestOption,
    secondBest,
    riskWarning,
    analyzeMarket,
  } = useMarketAnalysis();

  const handleAnalyze = async (context: FarmContext) => {
    setFarmContext(context);
    setSelectedCropId(context.crop.id);
    
    // Wait a moment for live prices to load if needed
    await new Promise(resolve => setTimeout(resolve, 500));
    await analyzeMarket(context, liveMarkets.length > 0 ? liveMarkets : undefined);
  };

  const selectedTransport = farmContext 
    ? TRANSPORT_RATES.find(t => t.capacity >= farmContext.quantity) || TRANSPORT_RATES[0]
    : TRANSPORT_RATES[0];

  // Convert live markets for risk analysis panel
  const marketsForRisk = liveMarkets.length > 0 
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 space-y-8">
        {/* Hero section */}
        <section className="text-center py-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Real AI-Powered Analysis
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-balance gradient-text mb-4">
            Maximize Your Harvest Returns
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
            Our multi-agent AI analyzes <strong>live market prices</strong>, transport costs, and storage losses 
            to recommend the optimal time and place to sell your crops.
          </p>
        </section>

        {/* Stats row */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Radio, label: "Live Markets", value: liveMarkets.length > 0 ? `${liveMarkets.length}` : "6+", color: "text-success" },
            { icon: TrendingUp, label: "Real-time Prices", value: "Yes", color: "text-primary" },
            { icon: Truck, label: "Transport Options", value: "4", color: "text-agent-logistics" },
            { icon: BarChart3, label: "AI Factors", value: "15+", color: "text-accent" },
          ].map((stat, i) => (
            <div key={i} className="stat-card text-center animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold font-display">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Live prices ticker */}
        {liveMarkets.length > 0 && selectedCropId && (
          <LivePricesTicker
            markets={liveMarkets}
            isLoading={isPricesLoading}
            lastUpdated={lastUpdated}
            onRefresh={refreshPrices}
            selectedCrop={farmContext?.crop.name || selectedCropId}
          />
        )}

        {/* Main form */}
        <section id="dashboard" className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <FarmContextForm onSubmit={handleAnalyze} isLoading={isAnalyzing} />
        </section>

        {/* Results section */}
        {(agentSteps.length > 0 || comparisons.length > 0) && (
          <section id="analysis" className="space-y-6">
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
            {farmContext && bestOption && (
              <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
                <SensitivityAnalysis
                  crop={farmContext.crop}
                  quantity={farmContext.quantity}
                  market={bestOption.market}
                  transport={selectedTransport}
                  storage={farmContext.storageCondition}
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
                  markets={marketsForRisk.length > 0 ? marketsForRisk : undefined}
                  crop={farmContext?.crop}
                  storage={farmContext?.storageCondition}
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
            Powered by <span className="font-semibold text-primary">Lovable AI</span> • Live prices simulated (Agmarknet API integration ready)
          </p>
          <p className="mt-4 text-xs max-w-xl mx-auto">
            Disclaimer: This tool provides AI-generated estimates. Live price integration uses simulated data for demonstration.
            In production, connect to data.gov.in or Agmarknet portal for real market prices.
          </p>
        </footer>
      </main>
    </div>
  );
}
