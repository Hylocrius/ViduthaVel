from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json
import sys
import os
from sqlalchemy.orm import Session

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import our agents and database
from src.agents.supervisor import SupervisorAgent
from src.types import UserContext, StorageConditions
from models.database import get_db, FarmContext, RecommendationHistory, init_db

app = FastAPI(
    title="Agentic AI Market Price and Harvest Logistics Planner",
    description="API for crop selling recommendations based on market prices and logistics",
    version="1.0.0"
)

# Initialize database
init_db()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class CropDetails(BaseModel):
    type: str
    quantity: float  # in kg
    harvest_date: str  # ISO format
    current_storage: Optional[dict] = None

class FarmLocation(BaseModel):
    latitude: float
    longitude: float
    address: str

class UserPreferences(BaseModel):
    risk_tolerance: str = "medium"  # low, medium, high
    preferred_markets: List[str] = []
    storage_capacity: float  # in kg

class RecommendationRequest(BaseModel):
    crop: CropDetails
    farm_location: FarmLocation
    preferences: UserPreferences

# Endpoints
@app.get("/")
async def root():
    return {
        "message": "Welcome to Agentic AI Market Price and Harvest Logistics Planner API",
        "status": "running",
        "version": "1.0.0"
    }

@app.post("/api/recommendations/generate")
async def generate_recommendation(
    request: RecommendationRequest,
    user_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    try:
        # Convert request to UserContext
        user_context = UserContext(
            farmLocation={
                'latitude': request.farm_location.latitude,
                'longitude': request.farm_location.longitude,
                'address': request.farm_location.address
            },
            cropDetails={
                'type': request.crop.type,
                'quantity': request.crop.quantity,
                'harvestDate': request.crop.harvest_date,
                'currentStorage': request.crop.current_storage or {}
            },
            preferences={
                'riskTolerance': request.preferences.risk_tolerance,
                'preferredMarkets': request.preferences.preferred_markets,
                'storageCapacity': request.preferences.storage_capacity
            }
        )

        # Save farm context to database
        if user_id:
            farm_context = FarmContext(
                user_id=user_id,
                crop_type=request.crop.type,
                crop_name=request.crop.type,
                quantity=request.crop.quantity,
                location=request.farm_location.address,
                latitude=request.farm_location.latitude,
                longitude=request.farm_location.longitude,
                storage_type="default",
                storage_capacity=request.preferences.storage_capacity,
                risk_tolerance=request.preferences.risk_tolerance,
                preferred_markets=request.preferences.preferred_markets,
                context_data=user_context.dict()
            )
            db.add(farm_context)
            db.commit()
            db.refresh(farm_context)
            context_id = farm_context.id
        else:
            context_id = None

        # Initialize supervisor agent
        supervisor = SupervisorAgent(user_context)
        
        # Get recommendation
        response = await supervisor.execute()
        
        if not response.success:
            raise HTTPException(status_code=400, detail="Failed to generate recommendation")
        
        # Save recommendation to history
        if context_id and response.data:
            rec_history = RecommendationHistory(
                farm_context_id=context_id,
                recommendation_type=response.data.get('recommendationType', 'sell_now'),
                target_market=response.data.get('targetMarket', ''),
                expected_revenue=response.data.get('expectedRevenue', 0),
                net_profit=response.data.get('netProfit', 0),
                confidence=response.data.get('confidence', 0),
                reasoning=response.data.get('reasoning', []),
                risks=response.data.get('risks', [])
            )
            db.add(rec_history)
            db.commit()
        
        return {
            "success": True,
            "data": response.data,
            "metadata": response.metadata,
            "trace": response.trace
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/farm-context/{user_id}")
async def get_farm_context(user_id: str, db: Session = Depends(get_db)):
    """Get saved farm context for a user"""
    contexts = db.query(FarmContext).filter(FarmContext.user_id == user_id).order_by(FarmContext.created_at.desc()).limit(10).all()
    return {"contexts": [c.context_data for c in contexts]}

@app.get("/api/recommendations/history/{user_id}")
async def get_recommendation_history(user_id: str, db: Session = Depends(get_db)):
    """Get recommendation history for a user"""
    contexts = db.query(FarmContext).filter(FarmContext.user_id == user_id).all()
    context_ids = [c.id for c in contexts]
    recommendations = db.query(RecommendationHistory).filter(RecommendationHistory.farm_context_id.in_(context_ids)).order_by(RecommendationHistory.created_at.desc()).limit(20).all()
    return {"recommendations": [{
        "id": r.id,
        "recommendationType": r.recommendation_type,
        "targetMarket": r.target_market,
        "expectedRevenue": r.expected_revenue,
        "netProfit": r.net_profit,
        "confidence": r.confidence,
        "createdAt": r.created_at.isoformat()
    } for r in recommendations]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
