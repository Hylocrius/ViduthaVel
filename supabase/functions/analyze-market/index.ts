import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FarmContext {
  crop: string;
  quantity: number;
  location: string;
  storageType: string;
}

const systemPrompt = `You are an expert agricultural market analyst AI assistant for Indian farmers. You provide real-time market analysis with REALISTIC current market data.

CRITICAL: Generate realistic, dynamic market data based on:
1. Current seasonal trends for the crop
2. Regional demand patterns in India
3. Typical price ranges for Indian agricultural markets (mandis)
4. Real market names and locations in India
5. Current weather conditions and their impact on transport/storage

When analyzing, consider:
1. Current estimated market prices based on crop type and season
2. Price projections based on supply-demand dynamics
3. Transport costs based on actual Indian road distances
4. Storage losses based on crop characteristics and weather
5. Net revenue calculations with realistic numbers
6. Weather impact on transport routes and storage conditions

IMPORTANT GUIDELINES:
- Use realistic INR prices per quintal for Indian markets
- Include actual major mandis like Azadpur (Delhi), Vashi (Mumbai), Koyambedu (Chennai), etc.
- Generate 4-6 markets with varying distances from the farmer's location
- Prices should vary by market based on local demand and supply
- Include volatility based on crop type (perishables = high, grains = low)
- Factor in monsoon, summer heat, or winter conditions based on current season

Always provide practical, actionable advice that maximizes farmer's net revenue.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanations outside JSON.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { farmContext } = await req.json() as {
      farmContext: FarmContext;
    };

    console.log("Received farm context:", farmContext);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const currentDate = new Date().toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const currentMonth = new Date().getMonth();
    const season = currentMonth >= 5 && currentMonth <= 9 ? "monsoon" : 
                   currentMonth >= 10 || currentMonth <= 1 ? "winter" : "summer";

    const userPrompt = `Generate a COMPLETE real-time market analysis for an Indian farmer with the following context:

## Current Date: ${currentDate}
## Current Season: ${season}

## Farm Context
- Crop: ${farmContext.crop}
- Quantity: ${farmContext.quantity} quintals
- Farmer Location: ${farmContext.location}
- Storage Available: ${farmContext.storageType}

Based on CURRENT MARKET CONDITIONS, WEATHER, and seasonal factors for ${farmContext.crop}, generate:

1. **Real-time market data** for 4-6 major Indian mandis/markets with:
   - Realistic current prices based on today's typical rates
   - 7-day price projections based on market trends
   - Estimated distances from ${farmContext.location}
   - Demand levels (low/medium/high)
   - Price volatility (low/medium/high)

2. **Complete analysis** with agent reasoning steps

3. **Revenue calculations** for each market with both "sell now" and "sell in 7 days" scenarios

4. **Weather data** for the farmer's location and target markets

5. **Price history** for the past 30 days (daily simulated prices)

Provide the analysis in this exact JSON structure:
{
  "generatedMarkets": [
    {
      "id": "market-id",
      "name": "Market Name",
      "location": "City",
      "distance": number,
      "currentPrice": number,
      "projectedPrice7Days": number,
      "volatility": "low" | "medium" | "high",
      "demand": "low" | "medium" | "high"
    }
  ],
  "cropInfo": {
    "name": "${farmContext.crop}",
    "shelfLife": number,
    "lossRatePerDay": number,
    "basePrice": number
  },
  "storageInfo": {
    "type": "${farmContext.storageType}",
    "lossMultiplier": number,
    "costPerDay": number
  },
  "transportInfo": {
    "vehicleType": "string",
    "ratePerKm": number,
    "capacity": number
  },
  "weatherData": {
    "location": "${farmContext.location}",
    "current": {
      "condition": "sunny" | "cloudy" | "rainy" | "stormy" | "foggy" | "hot",
      "temperature": number,
      "humidity": number,
      "rainfall": number
    },
    "forecast": [
      {
        "day": number,
        "condition": "sunny" | "cloudy" | "rainy" | "stormy" | "foggy" | "hot",
        "temperature": number,
        "humidity": number,
        "rainfall": number
      }
    ],
    "transportImpact": {
      "severity": "none" | "low" | "moderate" | "high" | "severe",
      "description": "Description of how weather affects transport",
      "delayRisk": number
    },
    "storageImpact": {
      "severity": "none" | "low" | "moderate" | "high" | "severe",
      "description": "Description of how weather affects storage",
      "additionalLossRate": number
    }
  },
  "priceHistory": [
    {
      "date": "YYYY-MM-DD",
      "price": number,
      "volume": number
    }
  ],
  "agentSteps": [
    {
      "agent": "market" | "logistics" | "storage" | "supervisor" | "weather",
      "action": "brief action description",
      "reasoning": "detailed reasoning with specific numbers and real-time insights"
    }
  ],
  "comparisons": [
    {
      "marketId": "market-id",
      "marketName": "Market Name",
      "location": "Location",
      "distance": number,
      "volatility": "low" | "medium" | "high",
      "demand": "low" | "medium" | "high",
      "scenario": "now" | "7days",
      "grossRevenue": number,
      "transportCost": number,
      "storageCost": number,
      "storageLoss": number,
      "netRevenue": number,
      "profitMargin": number
    }
  ],
  "recommendation": {
    "bestMarketId": "market-id",
    "bestScenario": "now" | "7days",
    "reasoning": "detailed explanation of why this is the best option with specific numbers and weather considerations",
    "riskWarning": "optional warning about risks based on current market and weather conditions"
  },
  "marketInsights": {
    "seasonalTrend": "description of current seasonal trends",
    "demandOutlook": "description of demand outlook",
    "priceVolatility": "description of price volatility factors"
  }
}

Generate entries for each market with BOTH "now" and "7days" scenarios. Calculate actual numbers based on realistic market conditions for ${farmContext.crop} in India today.

IMPORTANT: 
- Use realistic prices (e.g., Wheat: ₹2000-2500/quintal, Rice: ₹2000-2400/quintal, Tomato: ₹1500-4000/quintal depending on season, Onion: ₹1000-3000/quintal, Potato: ₹800-1500/quintal, Soybean: ₹4000-5500/quintal)
- Transport rates should be ₹15-40 per km depending on vehicle type
- Storage costs: Open Air ₹0, Covered Shed ₹2-3, Warehouse ₹4-6, Cold Storage ₹12-18 per quintal per day
- Loss rates vary by crop: Grains 0.05-0.1%/day, Vegetables 2-5%/day
- Generate realistic price history for the past 30 days with natural fluctuations
- Weather should match the ${season} season in ${farmContext.location}
- Include a weather agent step that analyzes weather impact on transport and storage`;

    console.log("Sending request to AI gateway...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    console.log("AI response received, parsing...");

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response - handle markdown code blocks if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.slice(7);
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.slice(3);
    }
    if (cleanContent.endsWith("```")) {
      cleanContent = cleanContent.slice(0, -3);
    }
    cleanContent = cleanContent.trim();

    const analysis = JSON.parse(cleanContent);

    console.log("Analysis complete, returning response");

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-market function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
