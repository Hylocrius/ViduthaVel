// API client for backend communication

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface RecommendationRequest {
  crop: {
    type: string;
    quantity: number;
    harvest_date: string;
    current_storage?: Record<string, any>;
  };
  farm_location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  preferences: {
    risk_tolerance: 'low' | 'medium' | 'high';
    preferred_markets: string[];
    storage_capacity: number;
  };
}

export interface RecommendationResponse {
  success: boolean;
  data: {
    recommendationType: 'sell_now' | 'store' | 'sell_later';
    targetMarket: string;
    bestTimeToSell: string;
    expectedRevenue: number;
    netProfit: number;
    confidence: number;
    reasoning: string[];
    risks: string[];
  };
  metadata: {
    timestamp: string;
    processingTime: number;
    agent: string;
  };
  trace: {
    steps: Array<{
      action: string;
      result: any;
      timestamp: string;
    }>;
  };
}

export async function generateRecommendation(
  request: RecommendationRequest
): Promise<RecommendationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/recommendations/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getFarmContext(userId: string) {
  const response = await fetch(`${API_BASE_URL}/api/farm-context/${userId}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json();
}

export async function getRecommendationHistory(userId: string) {
  const response = await fetch(`${API_BASE_URL}/api/recommendations/history/${userId}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json();
}

