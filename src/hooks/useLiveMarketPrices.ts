import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { MarketData } from "@/lib/mockData";

export interface LiveMarketData extends MarketData {
  state: string;
  lastUpdated: string;
  source: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  arrivals: number;
}

interface MarketPricesResponse {
  success: boolean;
  data?: {
    markets: LiveMarketData[];
    metadata: {
      fetchedAt: string;
      source: string;
      disclaimer: string;
      refreshInterval: number;
    };
  };
  error?: string;
}

export function useLiveMarketPrices(cropId: string | null) {
  const [markets, setMarkets] = useState<LiveMarketData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<MarketPricesResponse["data"]["metadata"] | null>(null);

  const fetchPrices = useCallback(async (showToast = false) => {
    if (!cropId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke<MarketPricesResponse>(
        "fetch-market-prices",
        { body: { cropId } }
      );

      if (fnError) throw new Error(fnError.message);
      if (!data?.success || !data.data) throw new Error(data?.error || "Failed to fetch prices");

      setMarkets(data.data.markets);
      setMetadata(data.data.metadata);
      setLastUpdated(new Date(data.data.metadata.fetchedAt));

      if (showToast) {
        toast.success("Prices refreshed", {
          description: `Updated from ${data.data.metadata.source}`,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch prices";
      setError(message);
      if (showToast) {
        toast.error("Failed to refresh prices", { description: message });
      }
    } finally {
      setIsLoading(false);
    }
  }, [cropId]);

  // Initial fetch when crop changes
  useEffect(() => {
    if (cropId) {
      fetchPrices();
    }
  }, [cropId, fetchPrices]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!cropId) return;
    
    const interval = setInterval(() => {
      fetchPrices();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [cropId, fetchPrices]);

  const refreshPrices = useCallback(() => {
    fetchPrices(true);
  }, [fetchPrices]);

  return {
    markets,
    isLoading,
    lastUpdated,
    error,
    metadata,
    refreshPrices,
  };
}
