from typing import Dict, Any
from ..types import UserContext
from .marketAnalyst import MarketAnalystAgent
from .logisticsCoordinator import LogisticsCoordinatorAgent
from .storageStrategist import StorageStrategistAgent

class SupervisorAgent:
    """
    Supervisor Agent that orchestrates all sub-agents
    """
    
    def __init__(self, user_context: UserContext):
        self.user_context = user_context
        self.market_analyst = MarketAnalystAgent(user_context)
        self.logistics_coordinator = LogisticsCoordinatorAgent(user_context)
        self.storage_strategist = StorageStrategistAgent(
            user_context.cropDetails.type,
            user_context.cropDetails.quantity,
            user_context.cropDetails.currentStorage or {}
        )
    
    async def execute(self):
        """
        Execute the full analysis pipeline
        """
        try:
            # Step 1: Market Analysis
            market_response = await self.market_analyst.execute(
                self.user_context.cropDetails.type,
                7
            )
            
            if not market_response.success:
                raise Exception("Market analysis failed")
            
            # Step 2: Logistics Analysis
            top_markets = market_response.data.currentPrices[:3]
            market_names = [m.marketName for m in top_markets]
            
            logistics_response = await self.logistics_coordinator.execute(
                self.user_context.farmLocation.address,
                market_names,
                self.user_context.cropDetails.quantity
            )
            
            if not logistics_response.success:
                raise Exception("Logistics analysis failed")
            
            # Step 3: Storage Analysis
            storage_response = await self.storage_strategist.execute(30)
            
            if not storage_response.success:
                raise Exception("Storage analysis failed")
            
            # Step 4: Generate Recommendation
            recommendation = self._generate_recommendation(
                market_response.data,
                logistics_response.data,
                storage_response.data
            )
            
            return {
                "success": True,
                "data": recommendation,
                "metadata": {
                    "timestamp": market_response.metadata.timestamp,
                    "processingTime": 0,
                    "agent": "SupervisorAgent"
                },
                "trace": {
                    "steps": [
                        *market_response.trace.steps,
                        *logistics_response.trace.steps,
                        *storage_response.trace.steps
                    ]
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "data": None,
                "metadata": {
                    "timestamp": "",
                    "processingTime": 0,
                    "agent": "SupervisorAgent"
                },
                "trace": {
                    "steps": [{
                        "action": "error",
                        "result": {"error": str(e)},
                        "timestamp": ""
                    }]
                }
            }
    
    def _calculate_net_revenue(self, market_price: float, quantity: float, logistics_cost: float, storage_loss: float = 0):
        """Calculate net revenue after all costs"""
        gross_revenue = market_price * quantity * (1 - storage_loss / 100)
        return gross_revenue - logistics_cost
    
    def _generate_recommendation(self, market_data, logistics_data, storage_data):
        """
        Generate final recommendation based on all analyses
        """
        from datetime import datetime, timedelta
        
        if not market_data.currentPrices:
            return {
                "recommendationType": "sell_now",
                "targetMarket": "Unknown",
                "bestTimeToSell": datetime.utcnow().isoformat(),
                "expectedRevenue": 0,
                "netProfit": 0,
                "confidence": 0,
                "reasoning": ["No market data available"],
                "risks": ["Incomplete data"]
            }
        
        current_market = market_data.currentPrices[0]
        quantity = self.user_context.cropDetails.quantity
        
        # Find best future market price
        best_future_price = current_market.price
        best_future_market = current_market
        if market_data.predictedPrices:
            for pred in market_data.predictedPrices:
                if pred.price > best_future_price:
                    best_future_price = pred.price
                    best_future_market = pred
        
        # Calculate current net revenue
        logistics_cost = logistics_data.routes[0].transportCost if logistics_data.routes else 0
        current_net_revenue = self._calculate_net_revenue(
            current_market.price,
            quantity,
            logistics_cost
        )
        
        # Calculate future net revenue (after 7 days)
        storage_loss_7days = 0
        if storage_data.projectedLosses and len(storage_data.projectedLosses) > 7:
            storage_loss_7days = storage_data.projectedLosses[7].get('cumulativeLoss', 0)
        
        future_net_revenue = self._calculate_net_revenue(
            best_future_price,
            quantity,
            logistics_cost,
            storage_loss_7days
        )
        
        # Determine recommendation
        price_increase = best_future_price - current_market.price
        storage_loss_value = storage_loss_7days * current_market.price if storage_loss_7days > 0 else 0
        
        if price_increase > 0 and (price_increase * quantity * 0.9 > storage_loss_value):
            # Store and sell later
            return {
                "recommendationType": "store",
                "targetMarket": best_future_market.marketName,
                "bestTimeToSell": (datetime.utcnow() + timedelta(days=7)).isoformat(),
                "expectedRevenue": future_net_revenue,
                "netProfit": future_net_revenue - current_net_revenue,
                "confidence": market_data.confidenceScore * 0.9,
                "reasoning": [
                    f"Market prices expected to increase by ₹{price_increase:.2f}/kg in next 7 days",
                    f"Storage losses estimated at {storage_loss_7days:.2f} kg",
                    f"Net gain from waiting: ₹{future_net_revenue - current_net_revenue:.2f}"
                ],
                "risks": [
                    f"Market predictions have {market_data.confidenceScore * 100:.0f}% confidence",
                    "Unexpected weather could affect storage quality",
                    "Market prices subject to volatility"
                ]
            }
        else:
            # Sell now
            return {
                "recommendationType": "sell_now",
                "targetMarket": current_market.marketName,
                "bestTimeToSell": datetime.utcnow().isoformat(),
                "expectedRevenue": current_net_revenue,
                "netProfit": 0,
                "confidence": 0.95,
                "reasoning": [
                    f"Current market price favorable at ₹{current_market.price}/kg",
                    "No significant price increase expected" if storage_loss_value == 0 else f"Storing would result in losses of {storage_loss_7days:.2f} kg"
                ],
                "risks": [
                    "Market prices may decrease in future",
                    "Immediate transportation availability required"
                ]
            }

