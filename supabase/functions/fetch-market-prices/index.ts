import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simulated base market data (mimics Agmarknet structure)
const BASE_MARKETS = [
  { 
    id: "mandi-a", 
    name: "Azadpur Mandi", 
    location: "Delhi", 
    state: "Delhi",
    distance: 45, 
    basePrice: 2350, 
    volatility: 0.03,
    demandFactor: 1.1,
  },
  { 
    id: "mandi-b", 
    name: "Vashi APMC", 
    location: "Mumbai", 
    state: "Maharashtra",
    distance: 120, 
    basePrice: 2280, 
    volatility: 0.02,
    demandFactor: 1.0,
  },
  { 
    id: "mandi-c", 
    name: "Koyambedu", 
    location: "Chennai", 
    state: "Tamil Nadu",
    distance: 85, 
    basePrice: 2400, 
    volatility: 0.05,
    demandFactor: 1.15,
  },
  { 
    id: "mandi-d", 
    name: "Devi Ahilya Bai", 
    location: "Indore", 
    state: "Madhya Pradesh",
    distance: 30, 
    basePrice: 2250, 
    volatility: 0.02,
    demandFactor: 0.95,
  },
  {
    id: "mandi-e",
    name: "Yeshwanthpur APMC",
    location: "Bangalore",
    state: "Karnataka",
    distance: 65,
    basePrice: 2320,
    volatility: 0.03,
    demandFactor: 1.05,
  },
  {
    id: "mandi-f",
    name: "Bowenpally",
    location: "Hyderabad",
    state: "Telangana",
    distance: 55,
    basePrice: 2290,
    volatility: 0.04,
    demandFactor: 1.0,
  },
];

// Crop-specific price multipliers
const CROP_MULTIPLIERS: Record<string, number> = {
  wheat: 1.0,
  rice: 0.95,
  tomato: 0.8,
  onion: 0.7,
  potato: 0.55,
  soybean: 2.0,
};

function generateRealisticPrice(basePrice: number, volatility: number, cropMultiplier: number): number {
  // Add time-based variation (simulates daily fluctuations)
  const hour = new Date().getHours();
  const timeVariation = Math.sin(hour / 24 * Math.PI * 2) * 0.02; // ±2% based on time
  
  // Add random market noise
  const noise = (Math.random() - 0.5) * volatility * 2;
  
  // Calculate final price
  const price = basePrice * cropMultiplier * (1 + timeVariation + noise);
  return Math.round(price);
}

function calculateDemandLevel(demandFactor: number, volatility: number): "low" | "medium" | "high" {
  const adjustedDemand = demandFactor + (Math.random() - 0.5) * 0.2;
  if (adjustedDemand > 1.1) return "high";
  if (adjustedDemand > 0.95) return "medium";
  return "low";
}

function calculateVolatilityLevel(volatility: number): "low" | "medium" | "high" {
  if (volatility > 0.04) return "high";
  if (volatility > 0.025) return "medium";
  return "low";
}

function project7DayPrice(currentPrice: number, volatility: number, demandFactor: number): number {
  // Simulate 7-day trend based on demand
  const trendDirection = demandFactor > 1 ? 1 : demandFactor < 0.95 ? -1 : 0;
  const trendMagnitude = Math.random() * volatility * 7; // Up to 7 days of volatility
  const projection = currentPrice * (1 + trendDirection * trendMagnitude);
  return Math.round(projection);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cropId } = await req.json();
    
    const cropMultiplier = CROP_MULTIPLIERS[cropId] || 1.0;
    
    const markets = BASE_MARKETS.map(market => {
      const currentPrice = generateRealisticPrice(market.basePrice, market.volatility, cropMultiplier);
      const projectedPrice7Days = project7DayPrice(currentPrice, market.volatility, market.demandFactor);
      
      return {
        id: market.id,
        name: market.name,
        location: market.location,
        state: market.state,
        distance: market.distance,
        currentPrice,
        projectedPrice7Days,
        volatility: calculateVolatilityLevel(market.volatility),
        demand: calculateDemandLevel(market.demandFactor, market.volatility),
        lastUpdated: new Date().toISOString(),
        source: "Simulated Agmarknet Data",
        minPrice: Math.round(currentPrice * 0.95),
        maxPrice: Math.round(currentPrice * 1.05),
        modalPrice: currentPrice,
        arrivals: Math.round(Math.random() * 500 + 100), // Quintals arrived today
      };
    });

    // Sort by current price descending
    markets.sort((a, b) => b.currentPrice - a.currentPrice);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          markets,
          metadata: {
            fetchedAt: new Date().toISOString(),
            source: "Simulated Agmarknet API",
            disclaimer: "Prices are simulated for demonstration. Real implementation would connect to data.gov.in or Agmarknet portal.",
            refreshInterval: 300, // 5 minutes
          },
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching market prices:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
