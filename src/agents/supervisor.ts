import { BaseAgent } from './baseAgent';
import { MarketAnalystAgent } from './marketAnalyst';
import { LogisticsCoordinatorAgent } from './logisticsCoordinator';
import { StorageStrategistAgent } from './storageStrategist';
import { 
  Recommendation, 
  MarketAnalysis, 
  LogisticsPlan, 
  StorageAnalysis,
  UserContext
} from '../types';

export class SupervisorAgent extends BaseAgent<Recommendation> {
  private marketAnalyst: MarketAnalystAgent;
  private logisticsCoordinator: LogisticsCoordinatorAgent;
  private storageStrategist: StorageStrategistAgent;
  
  // Context is already defined in BaseAgent, so we'll use a different name
  private userContext: UserContext;

  constructor(context: UserContext) {
    super('SupervisorAgent', context);
    this.userContext = context;
    
    // Initialize sub-agents
    this.marketAnalyst = new MarketAnalystAgent(context);
    this.logisticsCoordinator = new LogisticsCoordinatorAgent(context);
    
    // Storage strategist will be initialized with crop-specific data
    this.storageStrategist = new StorageStrategistAgent(
      this.userContext.cropDetails.type,
      this.userContext.cropDetails.quantity,
      this.userContext.cropDetails.currentStorage
    );
  }

  private calculateNetRevenue(
    marketPrice: number,
    quantity: number,
    logisticsCost: number,
    storageLoss: number = 0
  ): number {
    const grossRevenue = marketPrice * quantity * (1 - storageLoss / 100);
    return grossRevenue - logisticsCost;
  }

  private generateRecommendation(
    marketData: MarketAnalysis,
    logisticsData: LogisticsPlan,
    storageData: StorageAnalysis,
    quantity: number
  ): Recommendation {
    const currentMarket = marketData.currentPrices[0]; // Assuming first market is the best option
    const bestFutureMarket = marketData.predictedPrices.reduce((best, current) => 
      (current.price > best.price) ? current : best
    );

    // Calculate current net revenue
    const currentNetRevenue = this.calculateNetRevenue(
      currentMarket.price,
      quantity,
      logisticsData.routes[0]?.transportCost || 0
    );

    // Calculate future net revenue (after 7 days)
    const futureNetRevenue = this.calculateNetRevenue(
      bestFutureMarket.price,
      quantity,
      logisticsData.routes[0]?.transportCost || 0,
      storageData.projectedLosses[7]?.cumulativeLoss || 0
    );

    // Determine recommendation
    const priceIncrease = bestFutureMarket.price - currentMarket.price;
    const storageLoss = storageData.projectedLosses[7]?.cumulativeLoss || 0;
    
    let recommendation: Recommendation;
    
    if (priceIncrease > 0 && (priceIncrease * quantity * 0.9 > storageLoss)) {
      // If potential gain from waiting is significant
      recommendation = {
        recommendationType: 'store',
        targetMarket: bestFutureMarket.marketName,
        bestTimeToSell: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        expectedRevenue: futureNetRevenue,
        netProfit: futureNetRevenue - currentNetRevenue,
        confidence: marketData.confidenceScore * 0.9, // Reduce confidence for future predictions
        reasoning: [
          `Market prices are expected to increase by ${priceIncrease.toFixed(2)} INR/kg in the next 7 days.`,
          `Storage losses are estimated at ${storageLoss.toFixed(2)} kg.`,
          `Net gain from waiting is expected to be ${(futureNetRevenue - currentNetRevenue).toFixed(2)} INR.`
        ],
        risks: [
          'Market predictions have a confidence level of ' + (marketData.confidenceScore * 100).toFixed(0) + '%.',
          'Unexpected weather conditions could affect storage quality.',
          'Market prices are subject to volatility.'
        ]
      };
    } else {
      // If it's better to sell now
      recommendation = {
        recommendationType: 'sell_now',
        targetMarket: currentMarket.marketName,
        bestTimeToSell: new Date().toISOString(),
        expectedRevenue: currentNetRevenue,
        netProfit: 0, // No profit/loss compared to now
        confidence: 0.95, // High confidence for current prices
        reasoning: [
          `Current market price is favorable at ${currentMarket.price} INR/kg.`,
          storageLoss > 0 
            ? `Storing would result in estimated losses of ${storageLoss.toFixed(2)} kg.`
            : 'No significant price increase expected in the near future.'
        ],
        risks: [
          'Market prices may decrease in the future.',
          'Immediate transportation availability required.'
        ]
      };
    }

    return recommendation;
  }

  async execute() {
    const steps = [];
    
    try {
      const { cropDetails, farmLocation, preferences } = this.userContext;
      
      // Step 1: Get market analysis
      const marketResponse = await this.marketAnalyst.execute(cropDetails.type, 7);
      if (!marketResponse.success) throw new Error('Failed to get market analysis');
      steps.push(this.logStep('marketAnalysis', marketResponse.data));
      
      // Step 2: Get logistics information for top 3 markets
      const topMarkets = marketResponse.data.currentPrices
        .slice(0, 3)
        .map(m => m.marketName);
      
      const logisticsResponse = await this.logisticsCoordinator.execute(
        farmLocation.address,
        topMarkets,
        cropDetails.quantity
      );
      
      if (!logisticsResponse.success) throw new Error('Failed to get logistics information');
      steps.push(this.logStep('logisticsAnalysis', logisticsResponse.data));
      
      // Step 3: Get storage analysis
      const storageResponse = await this.storageStrategist.execute(30); // Project 30 days ahead
      if (!storageResponse.success) throw new Error('Failed to get storage analysis');
      steps.push(this.logStep('storageAnalysis', storageResponse.data));
      
      // Step 4: Generate final recommendation
      const recommendation = this.generateRecommendation(
        marketResponse.data,
        logisticsResponse.data,
        storageResponse.data,
        cropDetails.quantity
      );
      
      return this.createResponse(true, recommendation, steps);
      
    } catch (error) {
      console.error('SupervisorAgent error:', error);
      steps.push(this.logStep('error', { error: error.message }));
      
      // Return a fallback recommendation in case of errors
      const fallbackRecommendation: Recommendation = {
        recommendationType: 'sell_now',
        targetMarket: 'Nearest Local Market',
        bestTimeToSell: new Date().toISOString(),
        expectedRevenue: 0,
        netProfit: 0,
        confidence: 0,
        reasoning: ['Unable to complete analysis due to system error.'],
        risks: ['Incomplete data may affect recommendation accuracy.']
      };
      
      return this.createResponse(false, fallbackRecommendation, steps);
    }
  }
}
