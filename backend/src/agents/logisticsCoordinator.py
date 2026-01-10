from typing import List, Dict, Any
from datetime import datetime, timedelta
import random
from ..types import UserContext, LogisticsPlan, Route, RouteDetails, TransportRequirements

# Mock transport rates (INR per km per kg)
TRANSPORT_RATES = {
    'truck': 1.2,
    'tractor': 1.0,
    'pickup': 1.5,
}

# Mock road conditions
ROAD_CONDITIONS = {
    'highway': 1.0,
    'state_road': 0.8,
    'village_road': 0.5,
}

# Mock distances (in production, use mapping API)
MOCK_DISTANCES: Dict[str, float] = {
    'delhi-mumbai': 1400,
    'delhi-bangalore': 2150,
    'mumbai-bangalore': 1000,
    'delhi-chandigarh': 250,
    'mumbai-pune': 150,
}

class LogisticsCoordinatorAgent:
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
    
    def _calculate_distance(self, from_location: str, to_location: str) -> float:
        """Calculate distance between locations"""
        key = f"{from_location.lower()}-{to_location.lower()}"
        distance = MOCK_DISTANCES.get(key, random.randint(100, 1100))
        return float(distance)
    
    def _estimate_transport_cost(self, distance: float, quantity: float, vehicle_type: str = 'truck') -> Dict[str, Any]:
        """Estimate transport cost"""
        rate = TRANSPORT_RATES.get(vehicle_type, 1.0)
        base_cost = distance * rate * (quantity / 1000)  # Convert kg to tons
        
        variation = 1 + (random.random() * 0.2 - 0.1)
        final_cost = round(base_cost * variation)
        
        return {
            "cost": final_cost,
            "vehicle": vehicle_type
        }
    
    def _generate_route(self, origin: str, destination: str, quantity: float) -> Route:
        """Generate route plan"""
        distance = self._calculate_distance(origin, destination)
        road_types = list(ROAD_CONDITIONS.keys())
        road_type = random.choice(road_types)
        
        avg_speed = 50 * ROAD_CONDITIONS[road_type]
        travel_time = distance / avg_speed
        
        waypoints = []
        if distance > 500:
            mid_point = int(distance / 2)
            waypoints.append(f"Waypoint near {mid_point}km")
        
        transport_info = self._estimate_transport_cost(distance, quantity)
        
        route = Route(
            from_location=origin,
            to=destination,
            distance=distance,
            estimatedTime=round(travel_time, 1),
            transportCost=transport_info["cost"],
            routeDetails=RouteDetails(
                waypoints=waypoints,
                roadConditions=[road_type],
                tolls=round(distance * 0.05)
            )
        )
        
        return route
    
    async def execute(self, origin: str, destinations: List[str], quantity: float):
        """Execute logistics coordination"""
        import asyncio
        
        try:
            # Generate routes to all destinations
            routes = []
            for dest in destinations:
                route = self._generate_route(origin, dest, quantity)
                routes.append(route)
            
            self._log_step('generateRoutes', {
                'origin': origin,
                'destinations': destinations,
                'routesCount': len(routes)
            })
            
            # Calculate total cost
            total_cost = sum(route.transportCost for route in routes)
            
            # Determine vehicle requirements
            vehicle_type = 'truck'
            capacity = (quantity / 1000) * 1000  # Round up to nearest ton
            special_requirements = ['refrigeration'] if quantity > 5000 else []
            
            # Prepare response
            plan = LogisticsPlan(
                routes=routes,
                totalCost=total_cost,
                estimatedArrival=(datetime.utcnow() + timedelta(hours=max(r.estimatedTime for r in routes))).isoformat(),
                transportRequirements=TransportRequirements(
                    vehicleType=vehicle_type,
                    capacity=capacity,
                    specialRequirements=special_requirements
                )
            )
            
            return {
                "success": True,
                "data": plan,
                "metadata": {
                    "timestamp": datetime.utcnow().isoformat(),
                    "processingTime": 0,
                    "agent": "LogisticsCoordinatorAgent"
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
                    "agent": "LogisticsCoordinatorAgent"
                },
                "trace": {
                    "steps": self.steps
                }
            }

