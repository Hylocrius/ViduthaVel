import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { FarmContextForm, type FarmContext } from "@/components/FarmContextForm";
import { AgentTracePanel } from "@/components/AgentTracePanel";
import { RevenueComparisonTable } from "@/components/RevenueComparisonTable";
import { RecommendationCard } from "@/components/RecommendationCard";
import { LogisticsChecklist } from "@/components/LogisticsChecklist";
import { RiskAnalysisPanel } from "@/components/RiskAnalysisPanel";
import { SensitivityAnalysis } from "@/components/SensitivityAnalysis";
import { DisclaimerPanel } from "@/components/DisclaimerPanel";
import { 
  MARKETS, 
  TRANSPORT_RATES,
  generateAgentSteps,
  calculateRevenueComparison,
  type AgentStep,
  type RevenueComparison,
} from "@/lib/mockData";
import { Sprout, TrendingUp, Truck, BarChart3 } from "lucide-react";

export default function Index() {
  const [farmContext, setFarmContext] = useState<FarmContext | null>(null);
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [comparisons, setComparisons] = useState<RevenueComparison[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendedIndex, setRecommendedIndex] = useState<number | undefined>();

  const handleAnalyze = useCallback(async (context: FarmContext) => {
    setFarmContext(context);
    setIsAnalyzing(true);
    setAgentSteps([]);
    setComparisons([]);

    // Simulate agent processing with delays
    const steps = generateAgentSteps(
      context.crop,
      context.quantity,
      MARKETS,
      context.storageCondition
    );

    // Animate steps appearing
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setAgentSteps(prev => [...prev, steps[i]]);
    }

    // Calculate all comparisons
    const transport = TRANSPORT_RATES.find(t => t.capacity >= context.quantity) || TRANSPORT_RATES[0];
    const allComparisons: RevenueComparison[] = [];

    for (const market of MARKETS) {
      allComparisons.push(
        calculateRevenueComparison(
          context.crop,
          context.quantity,
          market,
          transport,
          context.storageCondition,
          "now"
        ),
        calculateRevenueComparison(
          context.crop,
          context.quantity,
          market,
          transport,
          context.storageCondition,
          "7days"
        )
      );
    }

    // Find best option
    const bestIndex = allComparisons.reduce(
      (best, current, index) => current.netRevenue > allComparisons[best].netRevenue ? index : best,
      0
    );

    setComparisons(allComparisons);
    setRecommendedIndex(bestIndex);
    setIsAnalyzing(false);
  }, []);

  const bestOption = recommendedIndex !== undefined ? comparisons[recommendedIndex] : null;
  const secondBest = comparisons
    .filter((_, i) => i !== recommendedIndex)
    .sort((a, b) => b.netRevenue - a.netRevenue)[0];

  const selectedTransport = farmContext 
    ? TRANSPORT_RATES.find(t => t.capacity >= farmContext.quantity) || TRANSPORT_RATES[0]
    : TRANSPORT_RATES[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 space-y-8">
        {/* Hero section */}
        <section className="text-center py-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <span className="pulse-dot" />
            AI-Powered Decision Support
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-balance gradient-text mb-4">
            Maximize Your Harvest Returns
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
            Our multi-agent AI analyzes market prices, transport costs, and storage losses 
            to recommend the optimal time and place to sell your crops.
          </p>
        </section>

        {/* Stats row */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Sprout, label: "Crops Tracked", value: "6+", color: "text-primary" },
            { icon: TrendingUp, label: "Markets Analyzed", value: "4", color: "text-success" },
            { icon: Truck, label: "Transport Options", value: "4", color: "text-agent-logistics" },
            { icon: BarChart3, label: "Factors Considered", value: "15+", color: "text-accent" },
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
                    volatilityWarning={
                      bestOption.market.volatility === "high" 
                        ? `${bestOption.market.name} has high price volatility. Consider monitoring prices closely.`
                        : undefined
                    }
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
                  markets={MARKETS}
                  crop={farmContext?.crop}
                  storage={farmContext?.storageCondition}
                />
              </div>
            </div>
          </section>
        )}

        {/* Disclaimer */}
        <section className="animate-fade-in" style={{ animationDelay: "600ms" }}>
          <DisclaimerPanel />
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-8 pb-12 text-center text-sm text-muted-foreground">
          <p className="mb-2">
            Built for <span className="font-semibold">AI Ignite National Gen AI Hackathon</span>
          </p>
          <p>
            Data sources: FAO Post-Harvest Guidelines, ICAR Research Publications
          </p>
        </footer>
      </main>
    </div>
  );
}
