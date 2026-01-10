import { BaseAgent } from './baseAgent';
import { MarketAnalysis, MarketPrice, AgentResponse } from '../types';

// Mock data for demonstration
const MOCK_MARKET_DATA: Record<string, MarketPrice[]> = {
  'wheat': [
    {
      marketId: 'm1',
      marketName: 'Delhi Mandi',
      crop: 'wheat',
      price: 2100,
      date: '2024-01-10',
      volatility: 2.5
    },
    // Add more mock data as needed
  ],
  'rice': [
    {
      marketId: 'm2',
      marketName: 'Mumbai APMC',
      crop: 'rice',
      price: 2800,
      date: '2024-01-10',
      volatility: 3.1
    },
    // Add more mock data as needed
  ]
};

export class MarketAnalystAgent extends BaseAgent<MarketAnalysis> {
  constructor(context: any = {}) {
    super('MarketAnalystAgent', context);
  }

  private async fetchMarketPrices(crop: string): Promise<MarketPrice[]> {
    // In a real implementation, this would be an API call to Agmarknet or similar
    this.logStep('fetchMarketPrices', { crop });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data for now
    return MOCK_MARKET_DATA[crop.toLowerCase()] || [];
  }

  private async predictPrices(prices: MarketPrice[]): Promise<MarketPrice[]> {
    this.logStep('predictPrices', { currentPrices: prices });
    
    // Simple prediction: 1% daily increase with some random variation
    return prices.map(price => ({
      ...price,
      price: Math.round(price.price * (1.01 + (Math.random() * 0.02 - 0.01))),
      date: new Date(new Date(price.date).setDate(new Date(price.date).getDate() + 1)).toISOString().split('T')[0],
      volatility: price.volatility * (0.9 + Math.random() * 0.2) // Randomize volatility slightly
    }));
  }

  async execute(crop: string, days: number = 7): Promise<AgentResponse<MarketAnalysis>> {
    const steps = [];
    
    try {
      // Step 1: Fetch current market prices
      const currentPrices = await this.fetchMarketPrices(crop);
      steps.push(this.logStep('fetchMarketPrices', { crop, result: currentPrices }));

      if (currentPrices.length === 0) {
        throw new Error(`No market data available for ${crop}`);
      }

      // Step 2: Generate price predictions
      let predictedPrices = [...currentPrices];
      const allPredictions: MarketPrice[] = [];
      
      for (let i = 0; i < days; i++) {
        predictedPrices = await this.predictPrices(predictedPrices);
        allPredictions.push(...predictedPrices);
      }
      
      steps.push(this.logStep('generatePredictions', { days, result: allPredictions }));

      // Step 3: Calculate confidence score (simplified)
      const confidenceScore = 0.85 - (days * 0.02); // Confidence decreases with prediction horizon

      // Step 4: Prepare response
      const response: MarketAnalysis = {
        currentPrices,
        priceHistory: currentPrices, // In a real app, this would be historical data
        predictedPrices: allPredictions,
        confidenceScore: Math.max(0.1, Math.min(0.99, confidenceScore)), // Keep between 0.1 and 0.99
        lastUpdated: new Date().toISOString()
      };

      return this.createResponse(true, response, steps);
    } catch (error) {
      console.error('MarketAnalystAgent error:', error);
      steps.push(this.logStep('error', { error: error.message }));
      return this.createResponse(false, null as any, steps);
    }
  }
}
