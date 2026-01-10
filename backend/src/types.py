from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class StorageConditions(BaseModel):
    temperature: float  # Celsius
    humidity: float  # percentage
    shelfLife: int  # days
    dailyLossRate: float  # percentage per day

class FarmLocation(BaseModel):
    latitude: float
    longitude: float
    address: str

class CropDetails(BaseModel):
    type: str
    quantity: float  # in kg
    harvestDate: str  # ISO format
    currentStorage: Optional[Dict[str, Any]] = None

class UserPreferences(BaseModel):
    riskTolerance: str = "medium"  # low, medium, high
    preferredMarkets: List[str] = []
    storageCapacity: float  # in kg

class UserContext(BaseModel):
    farmLocation: FarmLocation
    cropDetails: CropDetails
    preferences: UserPreferences

# Market types
class MarketPrice(BaseModel):
    marketId: str
    marketName: str
    crop: str
    price: float  # price per kg
    date: str
    volatility: float  # price volatility percentage

class MarketAnalysis(BaseModel):
    currentPrices: List[MarketPrice]
    priceHistory: List[MarketPrice]
    predictedPrices: List[MarketPrice]
    confidenceScore: float
    lastUpdated: str

# Logistics types
class RouteDetails(BaseModel):
    waypoints: List[str]
    roadConditions: List[str]
    tolls: float

class Route(BaseModel):
    from_location: str  # Using from_location instead of from_ to avoid keyword issues
    to: str
    distance: float  # in km
    estimatedTime: float  # in hours
    transportCost: float
    routeDetails: RouteDetails
    
    def dict(self, **kwargs):
        """Override dict to use 'from' in JSON output"""
        data = super().dict(**kwargs)
        data['from'] = data.pop('from_location')
        return data

class TransportRequirements(BaseModel):
    vehicleType: str
    capacity: float
    specialRequirements: List[str]

class LogisticsPlan(BaseModel):
    routes: List[Route]
    totalCost: float
    estimatedArrival: str
    transportRequirements: TransportRequirements

# Storage types
class StorageAnalysis(BaseModel):
    currentStorage: StorageConditions
    projectedLosses: List[Dict[str, Any]]
    maxStorageDays: int

# Recommendation types
class Recommendation(BaseModel):
    recommendationType: str  # 'sell_now' | 'store' | 'sell_later'
    targetMarket: str
    bestTimeToSell: str
    expectedRevenue: float
    netProfit: float
    confidence: float
    reasoning: List[str]
    risks: List[str]
