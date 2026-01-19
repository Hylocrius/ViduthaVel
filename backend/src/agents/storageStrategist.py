from typing import List, Dict, Any
from datetime import datetime
from ..types import StorageAnalysis, StorageConditions

# Default storage loss rates (percentage per day)
DEFAULT_LOSS_RATES: Dict[str, float] = {
    'wheat': 0.5,
    'rice': 0.8,
    'corn': 0.6,
    'soybean': 0.7,
    'tomato': 3.5,
    'onion': 0.8,
    'potato': 0.5,
}

# Default shelf life in days
DEFAULT_SHELF_LIFE: Dict[str, int] = {
    'wheat': 180,
    'rice': 210,
    'corn': 150,
    'soybean': 120,
    'tomato': 14,
    'onion': 60,
    'potato': 90,
}

class StorageStrategistAgent:
    def __init__(self, crop: str, initial_quantity: float, current_storage: Dict[str, Any] = None):
        self.crop = crop.lower()
        self.initial_quantity = initial_quantity
        self.current_storage = current_storage or {}
        self.steps = []
    
    def _log_step(self, action: str, result: Any):
        step = {
            "action": action,
            "result": result,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.steps.append(step)
        return step
    
    def _calculate_adjusted_loss_rate(self) -> float:
        """Calculate loss rate adjusted for storage conditions"""
        base_loss_rate = DEFAULT_LOSS_RATES.get(self.crop, 1.0)
        
        # Adjust based on storage conditions
        if 'temperature' in self.current_storage:
            temp_diff = abs(20 - self.current_storage['temperature'])
            base_loss_rate += temp_diff * 0.05
        
        if 'humidity' in self.current_storage:
            humidity_diff = abs(60 - self.current_storage['humidity'])
            base_loss_rate += humidity_diff * 0.02
        
        return min(5.0, max(0.1, base_loss_rate))
    
    def _calculate_value_over_time(self, days: int, initial_value: float, daily_loss_rate: float) -> List[Dict[str, Any]]:
        """Calculate value degradation over time"""
        result = []
        current_value = initial_value
        
        for day in range(days + 1):
            if day > 0:
                daily_loss = current_value * (daily_loss_rate / 100)
                current_value -= daily_loss
            
            result.append({
                "day": day,
                "remainingValue": round((current_value / initial_value * 100), 2),
                "cumulativeLoss": round((initial_value - current_value), 2)
            })
        
        return result
    
    async def execute(self, days_to_project: int = 30):
        """Execute storage analysis"""
        import asyncio
        
        try:
            # Calculate adjusted loss rate
            daily_loss_rate = self._calculate_adjusted_loss_rate()
            
            # Calculate storage losses over time
            projected_losses = self._calculate_value_over_time(
                days_to_project,
                self.initial_quantity,
                daily_loss_rate
            )
            
            self._log_step('calculateLosses', {
                'days': days_to_project,
                'initialQuantity': self.initial_quantity,
                'dailyLossRate': daily_loss_rate
            })
            
            # Calculate max storage days
            shelf_life = DEFAULT_SHELF_LIFE.get(self.crop, 90)
            max_storage_days = min(
                shelf_life,
                int(100 / daily_loss_rate) if daily_loss_rate > 0 else shelf_life
            )
            
            # Create storage conditions
            storage_conditions = StorageConditions(
                temperature=self.current_storage.get('temperature', 25),
                humidity=self.current_storage.get('humidity', 60),
                shelfLife=shelf_life,
                dailyLossRate=daily_loss_rate
            )
            
            # Prepare response
            analysis = StorageAnalysis(
                currentStorage=storage_conditions,
                projectedLosses=projected_losses,
                maxStorageDays=max_storage_days
            )
            
            
            return {
                "success": True,
                "data": analysis,
                "metadata": {
                    "timestamp": datetime.utcnow().isoformat(),
                    "processingTime": 0,
                    "agent": "StorageStrategistAgent"
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
                    "agent": "StorageStrategistAgent"
                },
                "trace": {
                    "steps": self.steps
                }
            }

