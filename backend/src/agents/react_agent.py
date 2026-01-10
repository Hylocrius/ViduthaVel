"""
ReAct (Reasoning + Acting) Agent implementation using LangChain
This provides a structured approach to agent reasoning and action execution
"""
from typing import List, Dict, Any, Optional
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser
import json

class ReActAgent:
    """
    A ReAct-style agent that reasons about actions before taking them.
    Implements the pattern: Thought -> Action -> Observation -> Thought -> ...
    """
    
    def __init__(self, agent_name: str, tools: List[Dict[str, Any]] = None):
        self.agent_name = agent_name
        self.tools = tools or []
        self.reasoning_steps = []
        
    def think(self, observation: str, goal: str) -> str:
        """
        Generate a thought/reasoning step based on observation and goal
        """
        thought = f"[{self.agent_name}] Analyzing: {observation}. Goal: {goal}"
        self.reasoning_steps.append({
            "type": "thought",
            "content": thought,
            "timestamp": self._get_timestamp()
        })
        return thought
    
    def act(self, action: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute an action and return the result
        """
        self.reasoning_steps.append({
            "type": "action",
            "action": action,
            "parameters": parameters,
            "timestamp": self._get_timestamp()
        })
        
        # Execute the action (in real implementation, this would call actual tools)
        result = self._execute_action(action, parameters)
        
        self.reasoning_steps.append({
            "type": "observation",
            "content": result,
            "timestamp": self._get_timestamp()
        })
        
        return result
    
    def _execute_action(self, action: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a specific action. Override in subclasses for specific implementations.
        """
        return {"status": "executed", "action": action, "parameters": parameters}
    
    def _get_timestamp(self) -> str:
        from datetime import datetime
        return datetime.utcnow().isoformat()
    
    def get_reasoning_trace(self) -> List[Dict[str, Any]]:
        """
        Get the complete reasoning trace
        """
        return self.reasoning_steps
    
    def reset(self):
        """Reset the agent's reasoning steps"""
        self.reasoning_steps = []


class MarketAnalystReAct(ReActAgent):
    """
    Market Analyst Agent with ReAct pattern
    """
    
    def __init__(self):
        super().__init__("MarketAnalyst")
        self.tools = [
            {"name": "fetch_market_prices", "description": "Fetch current market prices for a crop"},
            {"name": "analyze_price_trends", "description": "Analyze historical price trends"},
            {"name": "predict_future_prices", "description": "Predict prices for future days"}
        ]
    
    def analyze(self, crop: str, days: int = 7) -> Dict[str, Any]:
        """
        Analyze market prices using ReAct pattern
        """
        self.reset()
        goal = f"Analyze market prices for {crop} and predict prices for next {days} days"
        
        # Thought 1: Need to fetch current prices
        thought1 = self.think(
            f"Need to analyze market prices for {crop}",
            goal
        )
        
        # Action 1: Fetch current prices
        current_prices = self.act("fetch_market_prices", {"crop": crop})
        
        # Thought 2: Analyze trends
        thought2 = self.think(
            f"Fetched {len(current_prices.get('prices', []))} market prices. Need to analyze trends.",
            goal
        )
        
        # Action 2: Analyze trends
        trends = self.act("analyze_price_trends", {"prices": current_prices})
        
        # Thought 3: Predict future
        thought3 = self.think(
            f"Trends analyzed. Now predicting prices for next {days} days.",
            goal
        )
        
        # Action 3: Predict future prices
        predictions = self.act("predict_future_prices", {
            "current_prices": current_prices,
            "trends": trends,
            "days": days
        })
        
        return {
            "current_prices": current_prices,
            "trends": trends,
            "predictions": predictions,
            "reasoning_trace": self.get_reasoning_trace()
        }


class LogisticsCoordinatorReAct(ReActAgent):
    """
    Logistics Coordinator Agent with ReAct pattern
    """
    
    def __init__(self):
        super().__init__("LogisticsCoordinator")
        self.tools = [
            {"name": "calculate_distance", "description": "Calculate distance between locations"},
            {"name": "estimate_transport_cost", "description": "Estimate transport cost"},
            {"name": "plan_route", "description": "Plan optimal route"}
        ]
    
    def coordinate(self, origin: str, destinations: List[str], quantity: float) -> Dict[str, Any]:
        """
        Coordinate logistics using ReAct pattern
        """
        self.reset()
        goal = f"Plan logistics from {origin} to {len(destinations)} destinations for {quantity} kg"
        
        # Thought 1: Calculate distances
        thought1 = self.think(
            f"Need to calculate distances to {len(destinations)} markets",
            goal
        )
        
        # Action 1: Calculate distances
        distances = {}
        for dest in destinations:
            dist = self.act("calculate_distance", {"from": origin, "to": dest})
            distances[dest] = dist
        
        # Thought 2: Estimate costs
        thought2 = self.think(
            f"Distances calculated. Now estimating transport costs for {quantity} kg.",
            goal
        )
        
        # Action 2: Estimate costs
        costs = {}
        for dest, dist in distances.items():
            cost = self.act("estimate_transport_cost", {
                "distance": dist.get("distance", 0),
                "quantity": quantity
            })
            costs[dest] = cost
        
        # Thought 3: Plan routes
        thought3 = self.think(
            "Costs estimated. Planning optimal routes.",
            goal
        )
        
        # Action 3: Plan routes
        routes = {}
        for dest in destinations:
            route = self.act("plan_route", {
                "from": origin,
                "to": dest,
                "distance": distances[dest].get("distance", 0)
            })
            routes[dest] = route
        
        return {
            "distances": distances,
            "costs": costs,
            "routes": routes,
            "reasoning_trace": self.get_reasoning_trace()
        }


class StorageStrategistReAct(ReActAgent):
    """
    Storage Strategist Agent with ReAct pattern
    """
    
    def __init__(self):
        super().__init__("StorageStrategist")
        self.tools = [
            {"name": "calculate_loss_rate", "description": "Calculate storage loss rate"},
            {"name": "project_losses", "description": "Project losses over time"},
            {"name": "find_break_even", "description": "Find break-even point for storage"}
        ]
    
    def strategize(self, crop: str, quantity: float, storage_conditions: Dict[str, Any], days: int = 30) -> Dict[str, Any]:
        """
        Strategize storage using ReAct pattern
        """
        self.reset()
        goal = f"Analyze storage strategy for {quantity} kg of {crop} over {days} days"
        
        # Thought 1: Calculate loss rate
        thought1 = self.think(
            f"Need to calculate loss rate for {crop} under given storage conditions",
            goal
        )
        
        # Action 1: Calculate loss rate
        loss_rate = self.act("calculate_loss_rate", {
            "crop": crop,
            "storage_conditions": storage_conditions
        })
        
        # Thought 2: Project losses
        thought2 = self.think(
            f"Loss rate calculated: {loss_rate.get('daily_loss_rate', 0)}%/day. Projecting losses over {days} days.",
            goal
        )
        
        # Action 2: Project losses
        projections = self.act("project_losses", {
            "initial_quantity": quantity,
            "loss_rate": loss_rate,
            "days": days
        })
        
        # Thought 3: Find break-even
        thought3 = self.think(
            "Losses projected. Finding break-even point where storage costs exceed gains.",
            goal
        )
        
        # Action 3: Find break-even
        break_even = self.act("find_break_even", {
            "projections": projections,
            "loss_rate": loss_rate
        })
        
        return {
            "loss_rate": loss_rate,
            "projections": projections,
            "break_even": break_even,
            "reasoning_trace": self.get_reasoning_trace()
        }

