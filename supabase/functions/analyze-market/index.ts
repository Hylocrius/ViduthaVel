import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FarmContext {
  crop: {
    id: string;
    name: string;
    shelfLife: number;
    lossRatePerDay: number;
    basePrice: number;
  };
  quantity: number;
  location: string;
  storageCondition: {
    type: string;
    lossMultiplier: number;
    costPerDay: number;
  };
}

interface MarketData {
  id: string;
  name: string;
  location: string;
  distance: number;
  currentPrice: number;
  projectedPrice7Days: number;
  volatility: "low" | "medium" | "high";
  demand: "low" | "medium" | "high";
}

interface TransportRate {
  vehicleType: string;
  ratePerKm: number;
  capacity: number;
}

const systemPrompt = `You are an expert agricultural market analyst AI assistant. You help farmers make informed decisions about when and where to sell their crops.

You analyze market conditions, transport costs, storage losses, and provide recommendations in JSON format.

When analyzing, consider:
1. Current market prices vs projected prices
2. Transport costs based on distance
3. Storage losses based on crop type and storage conditions
4. Net revenue calculations
5. Risk factors like price volatility

Always provide practical, actionable advice that maximizes farmer's net revenue.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanations outside JSON.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { farmContext, markets, transportRates } = await req.json() as {
      farmContext: FarmContext;
      markets: MarketData[];
      transportRates: TransportRate[];
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const transport = transportRates.find(t => t.capacity >= farmContext.quantity) || transportRates[0];

    const userPrompt = `Analyze the following farm context and provide market recommendations:

## Farm Context
- Crop: ${farmContext.crop.name}
- Quantity: ${farmContext.quantity} quintals
- Location: ${farmContext.location}
- Storage: ${farmContext.storageCondition.type} (loss multiplier: ${farmContext.storageCondition.lossMultiplier}x, cost: ₹${farmContext.storageCondition.costPerDay}/day/quintal)
- Crop shelf life: ${farmContext.crop.shelfLife} days
- Base loss rate: ${farmContext.crop.lossRatePerDay}% per day

## Available Markets
${markets.map(m => `- ${m.name} (${m.location}): ₹${m.currentPrice}/quintal now, ₹${m.projectedPrice7Days}/quintal projected in 7 days, Distance: ${m.distance}km, Volatility: ${m.volatility}, Demand: ${m.demand}`).join('\n')}

## Transport
- Vehicle: ${transport.vehicleType}
- Rate: ₹${transport.ratePerKm}/km
- Capacity: ${transport.capacity} quintals

Provide a complete analysis in this exact JSON structure:
{
  "agentSteps": [
    {
      "agent": "market" | "logistics" | "storage" | "supervisor",
      "action": "brief action description",
      "reasoning": "detailed reasoning with specific numbers"
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
    "reasoning": "explanation of why this is the best option",
    "riskWarning": "optional warning about risks"
  }
}

Generate entries for each market with both "now" and "7days" scenarios. Calculate actual numbers based on the data provided.`;

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
        temperature: 0.3,
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
