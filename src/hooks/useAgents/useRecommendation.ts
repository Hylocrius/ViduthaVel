import { useState } from 'react';
import { Recommendation } from '@/types';

interface RecommendationRequest {
  crop: {
    type: string;
    quantity: number;
    harvest_date: string;
    current_storage?: any;
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

export const useRecommendation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  const generateRecommendation = async (data: RecommendationRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/recommendations/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate recommendation');
      }

      const result = await response.json();
      setRecommendation(result.data);
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    recommendation,
    generateRecommendation,
  };
};

export default useRecommendation;
