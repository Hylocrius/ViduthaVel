import { BaseAgent } from './baseAgent';
import { LogisticsPlan, Route, UserContext } from '../types';

// Mock transport rates (INR per km per kg)
const TRANSPORT_RATES = {
  'truck': 1.2,
  'tractor': 1.0,
  'pickup': 1.5,
};

// Mock road conditions with speed multipliers
const ROAD_CONDITIONS = {
  'highway': 1.0,    // 100% speed
  'state_road': 0.8, // 80% speed
  'village_road': 0.5, // 50% speed
};

export class LogisticsCoordinatorAgent extends BaseAgent<LogisticsPlan> {
  constructor(context: UserContext) {
    super('LogisticsCoordinatorAgent', context);
  }

  private calculateDistance(from: string, to: string): number {
    // In a real app, this would use a mapping service API
    // For now, return mock distances based on location names
    const distances: Record<string, number> = {
      'delhi-mumbai': 1400,
      'delhi-bangalore': 2150,
      'mumbai-bangalore': 1000,
      'delhi-chandigarh': 250,
      'mumbai-pune': 150,
    };

    const key = `${from.toLowerCase()}-${to.toLowerCase()}`;
    return distances[key] || Math.floor(Math.random() * 1000) + 100; // Random distance between 100-1100 km
  }

  private estimateTransportCost(
    distance: number,
    quantity: number,
    vehicleType: string = 'truck'
  ): { cost: number; vehicle: string } {
    const rate = TRANSPORT_RATES[vehicleType] || 1.0;
    const baseCost = distance * rate * (quantity / 1000); // Convert kg to tons for calculation
    
    // Add 10-20% variation
    const variation = 1 + (Math.random() * 0.2 - 0.1);
    const finalCost = Math.round(baseCost * variation);
    
    return {
      cost: finalCost,
      vehicle: vehicleType
    };
  }

  private generateRoute(
    from: string,
    to: string,
    quantity: number
  ): Route {
    const distance = this.calculateDistance(from, to);
    const roadTypes = Object.keys(ROAD_CONDITIONS);
    const roadType = roadTypes[Math.floor(Math.random() * roadTypes.length)];
    
    // Estimate time based on distance and road conditions
    const avgSpeed = 50 * ROAD_CONDITIONS[roadType]; // km/h
    const travelTime = distance / avgSpeed;
    
    // Generate waypoints (simplified)
    const waypoints = [];
    if (distance > 500) {
      const midPoint = Math.floor(distance / 2);
      waypoints.push(`Waypoint near ${midPoint}km`);
    }

    // Get transport cost
    const { cost: transportCost, vehicle } = this.estimateTransportCost(distance, quantity);
    
    return {
      from,
      to,
      distance,
      estimatedTime: parseFloat(travelTime.toFixed(1)),
      transportCost,
      routeDetails: {
        waypoints,
        roadConditions: [roadType],
        tolls: Math.round(distance * 0.05) // Approx toll cost
      }
    };
  }

  async execute(origin: string, destinations: string[], quantity: number) {
    const steps = [];
    
    try {
      // Generate routes to all destinations
      const routes = destinations.map(dest => 
        this.generateRoute(origin, dest, quantity)
      );
      
      steps.push(this.logStep('generateRoutes', { 
        origin, 
        destinations,
        routesCount: routes.length 
      }));

      // Calculate total costs
      const totalCost = routes.reduce((sum, route) => sum + route.transportCost, 0);
      
      // Prepare response
      const response: LogisticsPlan = {
        routes,
        totalCost,
        estimatedArrival: new Date(
          Date.now() + Math.max(...routes.map(r => r.estimatedTime)) * 60 * 60 * 1000
        ).toISOString(),
        transportRequirements: {
          vehicleType: 'truck', // Default, could be determined by quantity
          capacity: Math.ceil(quantity / 1000) * 1000, // Round up to nearest ton
          specialRequirements: quantity > 5000 ? ['refrigeration'] : []
        }
      };

      return this.createResponse(true, response, steps);
    } catch (error) {
      console.error('LogisticsCoordinatorAgent error:', error);
      steps.push(this.logStep('error', { error: error.message }));
      return this.createResponse(false, null as any, steps);
    }
  }
}
