import { AgentResponse } from '@/types';

export abstract class BaseAgent<T> {
  protected agentName: string;
  protected context: any;

  constructor(agentName: string, context: any = {}) {
    this.agentName = agentName;
    this.context = context;
  }

  protected createResponse(
    success: boolean,
    data: T,
    steps: { action: string; result: any }[] = []
  ): AgentResponse<T> {
    return {
      success,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime: 0, // This would be calculated in a real implementation
        agent: this.agentName,
      },
      trace: {
        steps: steps.map(step => ({
          ...step,
          timestamp: new Date().toISOString(),
        })),
      },
    };
  }

  protected logStep(action: string, result: any) {
    console.log(`[${this.agentName}] ${action}`, result);
    return { action, result };
  }

  // Abstract method to be implemented by each agent
  abstract execute(...args: any[]): Promise<AgentResponse<T>>;
}
