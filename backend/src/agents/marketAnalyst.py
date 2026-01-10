from typing import List, Dict, Any
from datetime import datetime, timedelta
import random
from ..types import UserContext, MarketAnalysis, MarketPrice

# Mock market data (in production, this would fetch from Agmarknet API)
MOCK_MARKET_DATA: Dict[str, List[Dict[str, Any]]] = {
    'wheat': [
        {
            'marketId': 'm1',
            'marketName': 'Azadpur Mandi',
            'crop': 'wheat',
            'price': 2350,
            'date': datetime.now().isoformat(),
            'volatility': 2.5
        },
        {
            'marketId': 'm2',
            'marketName': 'Vashi APMC',
            'crop': 'wheat',
            'price': 2280,
            'date': datetime.now().isoformat(),
            'volatility': 1.8
        },
        {
            'marketId': 'm3',
            'marketName': 'Koyambedu',
            'crop': 'wheat',
            'price': 2400,
            'date': datetime.now().isoformat(),
            'volatility': 3.2
        },
    ],
    'rice': [
        {
            'marketId': 'm1',
            'marketName': 'Azadpur Mandi',
            'crop': 'rice',
            'price': 2800,
            'date': datetime.now().isoformat(),
            'volatility': 2.8
        },
        {
            'marketId': 'm2',
            'marketName': 'Vashi APMC',
            'crop': 'rice',
            'price': 2750,
            'date': datetime.now().isoformat(),
            'volatility': 2.1
        },
    ],
    'tomato': [
        {
            'marketId': 'm1',
            'marketName': 'Azadpur Mandi',
            'crop': 'tomato',
            'price': 1800,
            'date': datetime.now().isoformat(),
            'volatility': 5.2
        },
    ],
    'onion': [
        {
            'marketId': 'm1',
            'marketName': 'Azadpur Mandi',
            'crop': 'onion',
            'price': 1500,
            'date': datetime.now().isoformat(),
            'volatility': 4.1
        },
    ],
    'potato': [
        {
            'marketId': 'm1',
            'marketName': 'Azadpur Mandi',
            'crop': 'potato',
            'price': 1200,
            'date': datetime.now().isoformat(),
            'volatility': 2.3
        },
    ],
    'soybean': [
        {
            'marketId': 'm1',
            'marketName': 'Azadpur Mandi',
            'crop': 'soybean',
            'price': 4500,
            'date': datetime.now().isoformat(),
            'volatility': 3.5
        },
    ],
}

class MarketAnalystAgent:
    def __init__(self, context: UserContext):
        self.context = context
        self.steps = []
    
    def _log_step(self, action: str, result: Any):
        step = {
            "action": action,
            "result": result,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.steps.append(step)
        return step
    
    async def fetch_market_prices(self, crop: str) -> List[MarketPrice]:
        """Fetch current market prices for a crop"""
        await asyncio.sleep(0.5)  # Simulate API delay
        
        crop_lower = crop.lower()
        market_data = MOCK_MARKET_DATA.get(crop_lower, [])
        
        prices = [
            MarketPrice(
                marketId=m['marketId'],
                marketName=m['marketName'],
                crop=m['crop'],
                price=m['price'],
                date=m['date'],
                volatility=m['volatility']
            )
            for m in market_data
        ]
        
        self._log_step('fetchMarketPrices', {'crop': crop, 'result': len(prices)})
        return prices
    
    async def predict_prices(self, prices: List[MarketPrice], days: int) -> List[MarketPrice]:
        """Predict prices for future days"""
        predicted = []
        current_date = datetime.now()
        
        for day in range(1, days + 1):
            for price in prices:
                # Simple prediction: 1% daily increase with variation
                price_change = 1.01 + (random.random() * 0.02 - 0.01)
                new_price = MarketPrice(
                    marketId=price.marketId,
                    marketName=price.marketName,
                    crop=price.crop,
                    price=round(price.price * price_change),
                    date=(current_date + timedelta(days=day)).isoformat(),
                    volatility=price.volatility * (0.9 + random.random() * 0.2)
                )
                predicted.append(new_price)
        
        self._log_step('generatePredictions', {'days': days, 'result': len(predicted)})
        return predicted
    
    async def execute(self, crop: str, days: int = 7):
        """Execute market analysis"""
        import asyncio
        
        try:
            # Fetch current prices
            current_prices = await self.fetch_market_prices(crop)
            
            if not current_prices:
                raise ValueError(f"No market data available for {crop}")
            
            # Generate predictions
            predicted_prices = await self.predict_prices(current_prices, days)
            
            # Calculate confidence score
            confidence_score = max(0.1, min(0.99, 0.85 - (days * 0.02)))
            
            # Create response
            analysis = MarketAnalysis(
                currentPrices=current_prices,
                priceHistory=current_prices,  # In production, fetch historical data
                predictedPrices=predicted_prices,
                confidenceScore=confidence_score,
                lastUpdated=datetime.utcnow().isoformat()
            )
            
            return {
                "success": True,
                "data": analysis,
                "metadata": {
                    "timestamp": datetime.utcnow().isoformat(),
                    "processingTime": 0,
                    "agent": "MarketAnalystAgent"
                },
                "trace": {
                    "steps": self.steps
                }
            }
        except Exception as e:
            self._log_step('error', {'error': str(e)})
            return {
                "success": False,
                "data": None,
                "metadata": {
                    "timestamp": datetime.utcnow().isoformat(),
                    "processingTime": 0,
                    "agent": "MarketAnalystAgent"
                },
                "trace": {
                    "steps": self.steps
                }
            }

