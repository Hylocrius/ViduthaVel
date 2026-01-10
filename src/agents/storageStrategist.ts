import { BaseAgent } from './baseAgent';
import { StorageAnalysis, StorageConditions, MarketPrice } from '../types';

// Default storage loss rates (percentage per day)
const DEFAULT_LOSS_RATES: Record<string, number> = {
  'wheat': 0.5,    // 0.5% loss per day
  'rice': 0.8,     // 0.8% loss per day
  'corn': 0.6,     // 0.6% loss per day
  'soybean': 0.7,  // 0.7% loss per day
};

// Default shelf life in days for different crops
const DEFAULT_SHELF_LIFE: Record<string, number> = {
  'wheat': 180,    // ~6 months
  'rice': 210,     // ~7 months
  'corn': 150,     // ~5 months
  'soybean': 120,  // ~4 months
};

export class StorageStrategistAgent extends BaseAgent<StorageAnalysis> {
  private crop: string;
  private initialQuantity: number;
  private currentStorage: StorageConditions;
  private marketPrices: MarketPrice[];

  constructor(
    crop: string,
    initialQuantity: number,
    currentStorage: Partial<StorageConditions> = {},
    marketPrices: MarketPrice[] = []
  ) {
    super('StorageStrategistAgent');
    this.crop = crop.toLowerCase();
    this.initialQuantity = initialQuantity;
    this.marketPrices = marketPrices;
    
    // Set default storage conditions with overrides
    this.currentStorage = {
      temperature: 25, // Celsius
      humidity: 60,    // percentage
      shelfLife: DEFAULT_SHELF_LIFE[this.crop] || 90, // days
      dailyLossRate: this.calculateAdjustedLossRate(currentStorage)
    };
  }

  private calculateAdjustedLossRate(storage: Partial<StorageConditions>): number {
    // Base loss rate from defaults
    let lossRate = DEFAULT_LOSS_RATES[this.crop] || 1.0; // Default to 1% if crop not found
    
    // Adjust based on storage conditions
    if (storage.temperature !== undefined) {
      // Ideal storage temperature is around 20°C for most grains
      const tempDiff = Math.abs(20 - storage.temperature);
      lossRate += tempDiff * 0.05; // 0.05% increase in loss per degree from ideal
    }
    
    if (storage.humidity !== undefined) {
      // Ideal humidity is around 60%
      const humidityDiff = Math.abs(60 - storage.humidity);
      lossRate += humidityDiff * 0.02; // 0.02% increase in loss per % from ideal
    }
    
    return Math.min(5, Math.max(0.1, lossRate)); // Keep between 0.1% and 5%
  }

  private calculateValueOverTime(
    days: number,
    initialValue: number,
    dailyLossRate: number
  ): { day: number; remainingValue: number; cumulativeLoss: number }[] {
    const result = [];
    let currentValue = initialValue;
    
    for (let day = 0; day <= days; day++) {
      if (day > 0) {
        // Apply daily loss
        const dailyLoss = currentValue * (dailyLossRate / 100);
        currentValue -= dailyLoss;
      }
      
      result.push({
        day,
        remainingValue: parseFloat((currentValue / initialValue * 100).toFixed(2)),
        cumulativeLoss: parseFloat((initialValue - currentValue).toFixed(2))
      });
    }
    
    return result;
  }

  async execute(daysToProject: number = 30) {
    const steps = [];
    
    try {
      // Calculate storage losses over time
      const projectedLosses = this.calculateValueOverTime(
        daysToProject,
        this.initialQuantity,
        this.currentStorage.dailyLossRate
      );
      
      steps.push(this.logStep('calculateLosses', { 
        days: daysToProject, 
        initialQuantity: this.initialQuantity,
        dailyLossRate: this.currentStorage.dailyLossRate
      }));

      // Calculate max storage days based on shelf life and value decay
      const maxStorageDays = Math.min(
        this.currentStorage.shelfLife,
        Math.ceil(100 / this.currentStorage.dailyLossRate) // Days until value drops to near zero
      );

      // Prepare response
      const response: StorageAnalysis = {
        currentStorage: this.currentStorage,
        projectedLosses,
        maxStorageDays
      };

      return this.createResponse(true, response, steps);
    } catch (error) {
      console.error('StorageStrategistAgent error:', error);
      steps.push(this.logStep('error', { error: error.message }));
      return this.createResponse(false, null as any, steps);
    }
  }
}
