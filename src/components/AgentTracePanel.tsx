import { useState } from "react";
import { Bot, ChevronDown, ChevronRight, TrendingUp, Truck, Warehouse, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentStep } from "@/lib/mockData";

interface AgentTracePanelProps {
  steps: AgentStep[];
  isRunning?: boolean;
}

const agentConfig = {
  market: {
    icon: TrendingUp,
    label: "Market Analyst",
    badgeClass: "agent-badge-market",
  },
  logistics: {
    icon: Truck,
    label: "Logistics Coordinator",
    badgeClass: "agent-badge-logistics",
  },
  storage: {
    icon: Warehouse,
    label: "Storage Strategist",
    badgeClass: "agent-badge-storage",
  },
  supervisor: {
    icon: Brain,
    label: "Supervisor Agent",
    badgeClass: "agent-badge-supervisor",
  },
};

export function AgentTracePanel({ steps, isRunning }: AgentTracePanelProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([steps.length - 1]));

  const toggleStep = (index: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSteps(newExpanded);
  };

  return (
    <div className="card-elevated p-6">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="font-display font-semibold">Agent Reasoning Trace</h2>
          <p className="text-xs text-muted-foreground">Step-by-step AI decision process</p>
        </div>
        {isRunning && (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            <span className="text-xs text-muted-foreground">Processing...</span>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {steps.map((step, index) => {
          const config = agentConfig[step.agent];
          const Icon = config.icon;
          const isExpanded = expandedSteps.has(index);
          const isLast = index === steps.length - 1;

          return (
            <div
              key={index}
              className={cn(
                "relative rounded-lg border border-border bg-background/50 transition-all",
                isLast && "ring-2 ring-primary/20"
              )}
            >
              <button
                onClick={() => toggleStep(index)}
                className="flex w-full items-center gap-3 p-3 text-left"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("agent-badge", config.badgeClass)}>
                      {config.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {step.action}
                    </span>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="px-3 pb-3">
                  <div className="ml-11 rounded-lg bg-muted/50 p-3">
                    <p className="text-sm text-foreground/90">{step.reasoning}</p>
                    {step.data && (
                      <pre className="mt-2 text-xs text-muted-foreground overflow-x-auto">
                        {JSON.stringify(step.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
