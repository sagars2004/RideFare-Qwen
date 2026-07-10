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
        
        # 2. Run coordination
        coordinator = CoordinatorAgent()
        decision = coordinator.negotiate(constraint=constraint_obj, request_context=req.request_context)
        
        return decision.model_dump(mode="json")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
