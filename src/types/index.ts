// Market types
export interface MarketPrice {
  marketId: string;
  marketName: string;
  crop: string;
  price: number; // price per kg
  date: string;
  volatility: number; // price volatility percentage
}

export interface MarketAnalysis {
  currentPrices: MarketPrice[];
  priceHistory: MarketPrice[];
  predictedPrices: MarketPrice[];
  confidenceScore: number;
  lastUpdated: string;
}

// Logistics types
export interface Route {
  from: string;
  to: string;
  distance: number; // in km
  estimatedTime: number; // in hours
  transportCost: number;
  routeDetails: {
    waypoints: string[];
    roadConditions: string[];
    tolls: number;
  };
}

export interface LogisticsPlan {
  routes: Route[];
  totalCost: number;
  estimatedArrival: string;
  transportRequirements: {
    vehicleType: string;
    capacity: number;
    specialRequirements: string[];
  };
}

// Storage types
export interface StorageConditions {
  temperature: number; // in Celsius
  humidity: number; // percentage
  shelfLife: number; // in days
  dailyLossRate: number; // percentage of value lost per day
}

export interface StorageAnalysis {
  currentStorage: StorageConditions;
  projectedLosses: {
    day: number;
    remainingValue: number; // percentage of original value
    cumulativeLoss: number; // in currency
  }[];
  maxStorageDays: number;
}

// Recommendation types
export interface Recommendation {
  recommendationType: 'sell_now' | 'store' | 'sell_later';
  targetMarket: string;
  bestTimeToSell: string;
  expectedRevenue: number;
  netProfit: number;
  confidence: number;
  reasoning: string[];
  risks: string[];
}

// Agent types
export interface AgentResponse<T> {
  success: boolean;
  data: T;
  metadata: {
    timestamp: string;
    processingTime: number;
    agent: string;
  };
  trace: {
    steps: {
      action: string;
      result: any;
      timestamp: string;
    }[];
  };
}

// User context
export interface UserContext {
  farmLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  cropDetails: {
    type: string;
    quantity: number; // in kg
    harvestDate: string;
    currentStorage: StorageConditions;
  };
  preferences: {
    riskTolerance: 'low' | 'medium' | 'high';
    preferredMarkets: string[];
    storageCapacity: number; // in kg
  };
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
}
