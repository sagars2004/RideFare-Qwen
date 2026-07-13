from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from fastapi.middleware.cors import CORSMiddleware

from backend.agents.constraint_agent import ConstraintAgent
from backend.agents.coordinator_agent import CoordinatorAgent

app = FastAPI(title="RideFare Backend API")

# Add CORS for local development with Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NegotiationRequest(BaseModel):
    rider_intent: str
    request_context: Dict[str, Any] = {}

@app.post("/api/negotiate")
def run_negotiation(req: NegotiationRequest):
    try:
        # 1. Parse constraints
        constraint_agent = ConstraintAgent()
        constraint_obj = constraint_agent.parse_intent(req.rider_intent)
        
        # 1.5 Scrape Live Pricing Data via Qwen
        pickup = req.request_context.get("pickup")
        dropoff = req.request_context.get("dropoff")
        if pickup and dropoff:
            from backend.agents.scraper_agent import LivePricingAgent
            scraper = LivePricingAgent()
            live_pricing = scraper.fetch_live_pricing(pickup, dropoff)
            req.request_context["live_pricing"] = live_pricing
        
        # 2. Run coordination
        coordinator = CoordinatorAgent()
        decision = coordinator.negotiate(constraint=constraint_obj, request_context=req.request_context)
        
        return decision.model_dump(mode="json")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tiers")
def get_tiers(provider: str, base_price: float, eta: int):
    try:
        from backend.agents.tiers_agent import TiersAgent
        agent = TiersAgent()
        result = agent.generate_tiers(provider, base_price, eta)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
