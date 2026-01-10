// Mock data for the Agentic AI Market Price Planner

export interface MarketData {
  id: string;
  name: string;
  location: string;
  distance: number; // km
  currentPrice: number; // per quintal
  projectedPrice7Days: number;
  volatility: "low" | "medium" | "high";
  demand: "low" | "medium" | "high";
}

export interface CropType {
  id: string;
  name: string;
  nameHindi: string;
  shelfLife: number; // days
  lossRatePerDay: number; // percentage
  basePrice: number; // per quintal
  unit: string;
}

export interface TransportRate {
  vehicleType: string;
  ratePerKm: number;
  capacity: number; // quintals
  loadingTime: number; // hours
}

export interface StorageCondition {
  type: string;
  lossMultiplier: number;
  costPerDay: number; // per quintal
  description: string;
}

export interface AgentStep {
  agent: "market" | "logistics" | "storage" | "supervisor";
  action: string;
  reasoning: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

export const CROPS: CropType[] = [
  { id: "wheat", name: "Wheat", nameHindi: "गेहूं", shelfLife: 180, lossRatePerDay: 0.05, basePrice: 2200, unit: "quintal" },
  { id: "rice", name: "Rice (Paddy)", nameHindi: "धान", shelfLife: 120, lossRatePerDay: 0.08, basePrice: 2100, unit: "quintal" },
  { id: "tomato", name: "Tomato", nameHindi: "टमाटर", shelfLife: 14, lossRatePerDay: 3.5, basePrice: 1800, unit: "quintal" },
  { id: "onion", name: "Onion", nameHindi: "प्याज", shelfLife: 60, lossRatePerDay: 0.8, basePrice: 1500, unit: "quintal" },
  { id: "potato", name: "Potato", nameHindi: "आलू", shelfLife: 90, lossRatePerDay: 0.5, basePrice: 1200, unit: "quintal" },
  { id: "soybean", name: "Soybean", nameHindi: "सोयाबीन", shelfLife: 150, lossRatePerDay: 0.1, basePrice: 4500, unit: "quintal" },
];

export const MARKETS: MarketData[] = [
  { id: "mandi-a", name: "Azadpur Mandi", location: "Delhi", distance: 45, currentPrice: 2350, projectedPrice7Days: 2420, volatility: "medium", demand: "high" },
  { id: "mandi-b", name: "Vashi APMC", location: "Mumbai", distance: 120, currentPrice: 2280, projectedPrice7Days: 2380, volatility: "low", demand: "medium" },
  { id: "mandi-c", name: "Koyambedu", location: "Chennai", distance: 85, currentPrice: 2400, projectedPrice7Days: 2350, volatility: "high", demand: "high" },
  { id: "mandi-d", name: "Devi Ahilya Bai", location: "Indore", distance: 30, currentPrice: 2250, projectedPrice7Days: 2320, volatility: "low", demand: "medium" },
];

export const TRANSPORT_RATES: TransportRate[] = [
  { vehicleType: "Tractor Trolley", ratePerKm: 12, capacity: 20, loadingTime: 1.5 },
  { vehicleType: "Mini Truck (Tata Ace)", ratePerKm: 18, capacity: 15, loadingTime: 1 },
  { vehicleType: "Medium Truck", ratePerKm: 25, capacity: 50, loadingTime: 2 },
  { vehicleType: "Large Truck", ratePerKm: 35, capacity: 100, loadingTime: 3 },
];

export const STORAGE_CONDITIONS: StorageCondition[] = [
  { type: "Open Air", lossMultiplier: 1.5, costPerDay: 0, description: "No additional storage cost, but higher losses" },
  { type: "Covered Shed", lossMultiplier: 1.0, costPerDay: 2, description: "Basic protection from weather" },
  { type: "Warehouse", lossMultiplier: 0.6, costPerDay: 5, description: "Temperature controlled, lower losses" },
  { type: "Cold Storage", lossMultiplier: 0.2, costPerDay: 15, description: "Best for perishables, minimal losses" },
];

export const FUEL_PRICE_PER_LITER = 105; // INR

export function generateAgentSteps(
  crop: CropType,
  quantity: number,
  markets: MarketData[],
  storageType: StorageCondition
): AgentStep[] {
  const now = new Date();
  return [
    {
      agent: "market",
      action: "Fetching market prices",
      reasoning: `Analyzed ${markets.length} markets for ${crop.name}. Current best price: ₹${Math.max(...markets.map(m => m.currentPrice))}/quintal at ${markets.find(m => m.currentPrice === Math.max(...markets.map(m => m.currentPrice)))?.name}`,
      timestamp: new Date(now.getTime()),
      data: { markets: markets.map(m => ({ name: m.name, price: m.currentPrice })) }
    },
    {
      agent: "market",
      action: "Forecasting 7-day prices",
      reasoning: `Based on seasonal trends and demand patterns, projecting price changes. Markets with 'high' demand showing upward trend.`,
      timestamp: new Date(now.getTime() + 1000),
      data: { projections: markets.map(m => ({ name: m.name, projected: m.projectedPrice7Days })) }
    },
    {
      agent: "logistics",
      action: "Calculating transport costs",
      reasoning: `For ${quantity} quintals, optimal vehicle selection considering capacity and cost-efficiency. Distance-based calculations include loading/unloading time.`,
      timestamp: new Date(now.getTime() + 2000),
    },
    {
      agent: "logistics",
      action: "Creating route plans",
      reasoning: `Mapped routes to all markets. Factored in road conditions, toll costs, and estimated travel times.`,
      timestamp: new Date(now.getTime() + 3000),
    },
    {
      agent: "storage",
      action: "Modeling storage losses",
      reasoning: `${crop.name} has a shelf-life of ${crop.shelfLife} days. With ${storageType.type} storage (${storageType.lossMultiplier}x loss rate), daily value loss: ${(crop.lossRatePerDay * storageType.lossMultiplier).toFixed(2)}%`,
      timestamp: new Date(now.getTime() + 4000),
    },
    {
      agent: "storage",
      action: "Calculating break-even point",
      reasoning: `Analyzed when storage costs exceed potential price gains. Critical decision point identified.`,
      timestamp: new Date(now.getTime() + 5000),
    },
    {
      agent: "supervisor",
      action: "Aggregating analysis",
      reasoning: `Combined market prices, transport costs, and storage losses. Comparing net revenue scenarios: sell now vs. store and sell later.`,
      timestamp: new Date(now.getTime() + 6000),
    },
    {
      agent: "supervisor",
      action: "Final recommendation",
      reasoning: `Based on comprehensive analysis, providing optimized selling strategy with risk assessment.`,
      timestamp: new Date(now.getTime() + 7000),
    },
  ];
}

export interface RevenueComparison {
  market: MarketData;
  scenario: "now" | "7days";
  grossRevenue: number;
  transportCost: number;
  storageCost: number;
  storageLoss: number;
  netRevenue: number;
  profitMargin: number;
}

export function calculateRevenueComparison(
  crop: CropType,
  quantity: number,
  market: MarketData,
  transport: TransportRate,
  storage: StorageCondition,
  scenario: "now" | "7days"
): RevenueComparison {
  const price = scenario === "now" ? market.currentPrice : market.projectedPrice7Days;
  const days = scenario === "now" ? 0 : 7;
  
  const lossPercentage = days * crop.lossRatePerDay * storage.lossMultiplier / 100;
  const effectiveQuantity = quantity * (1 - lossPercentage);
  
  const grossRevenue = effectiveQuantity * price;
  const transportCost = market.distance * transport.ratePerKm * Math.ceil(quantity / transport.capacity);
  const storageCost = days * storage.costPerDay * quantity;
  const storageLoss = (quantity - effectiveQuantity) * price;
  
  const netRevenue = grossRevenue - transportCost - storageCost;
  const profitMargin = ((netRevenue - (quantity * crop.basePrice)) / (quantity * crop.basePrice)) * 100;
  
  return {
    market,
    scenario,
    grossRevenue,
    transportCost,
    storageCost,
    storageLoss,
    netRevenue,
    profitMargin,
  };
}

export const LOGISTICS_CHECKLIST = [
  { id: 1, category: "Documentation", item: "Farmer ID / Aadhaar Card", required: true },
  { id: 2, category: "Documentation", item: "Land ownership / lease documents", required: true },
  { id: 3, category: "Documentation", item: "Previous sale receipts (if any)", required: false },
  { id: 4, category: "Packaging", item: "Jute/PP bags (50kg each)", required: true },
  { id: 5, category: "Packaging", item: "Weighing machine / spring balance", required: true },
  { id: 6, category: "Packaging", item: "Rope/twine for securing load", required: true },
  { id: 7, category: "Transport", item: "Vehicle booking confirmation", required: true },
  { id: 8, category: "Transport", item: "Driver contact number", required: true },
  { id: 9, category: "Transport", item: "Fuel/toll money", required: true },
  { id: 10, category: "Market", item: "Market timing confirmation", required: true },
  { id: 11, category: "Market", item: "Commission agent contact", required: false },
  { id: 12, category: "Market", item: "Bank account details for payment", required: true },
];

export const DISCLAIMER_TEXT = `
**Important Disclaimer:**

This tool provides estimates based on simulated market data and general agricultural parameters. Actual results may vary significantly due to:

- Real-time market fluctuations
- Weather conditions affecting transport and storage
- Local regulations and mandi fees
- Quality grading at the market

**Data Sources & References:**
- Default loss rates based on FAO Post-Harvest Loss Guidelines
- Storage parameters referenced from ICAR (Indian Council of Agricultural Research)
- Transport costs are indicative averages

Always consult with local agricultural extension officers and verify current market prices before making selling decisions. This tool does not guarantee any specific financial outcome.
`;
