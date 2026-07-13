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
        import concurrent.futures
        
        pickup = req.request_context.get("pickup")
        dropoff = req.request_context.get("dropoff")
        
        def get_constraint():
            return ConstraintAgent().parse_intent(req.rider_intent)
            
        def get_live_pricing():
            if pickup and dropoff:
                from backend.agents.scraper_agent import LivePricingAgent
                return LivePricingAgent().fetch_live_pricing(pickup, dropoff)
            return None
            
        def get_weather():
            if pickup:
                from backend.agents.weather_agent import WeatherSurgeAgent
                return WeatherSurgeAgent().analyze_weather_surge(pickup)
            return None

        # Run the API calls and scraping concurrently
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            future_constraint = executor.submit(get_constraint)
            future_pricing = executor.submit(get_live_pricing)
            future_weather = executor.submit(get_weather)
            
            constraint_obj = future_constraint.result()
            live_pricing = future_pricing.result()
            weather_data = future_weather.result()
            
        if live_pricing:
            req.request_context["live_pricing"] = live_pricing
        if weather_data:
            req.request_context["weather"] = weather_data
            
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
        tiers = agent.generate_tiers(provider, base_price, eta)
        return tiers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- AUTH & USER ENDPOINTS ---

from backend.db import db
from pydantic import BaseModel
import os
import uuid

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/auth/login")
def login(req: LoginRequest):
    demo_email = os.environ.get("DEMO_EMAIL", "admin@ridefare.com")
    demo_pwd = os.environ.get("DEMO_PASSWORD", "qwen2026")
    
    if req.email == demo_email and req.password == demo_pwd:
        # Generate a mock token
        token = str(uuid.uuid4())
        return {"token": token, "email": req.email}
    raise HTTPException(status_code=401, detail="Invalid credentials")

class ProfileUpdateRequest(BaseModel):
    name: str
    state: str
    cc_last4: str

@app.get("/api/user/profile")
def get_profile(email: str):
    if email in db.users:
        return db.users[email]
    raise HTTPException(status_code=404, detail="User not found")

@app.put("/api/user/profile")
def update_profile(email: str, req: ProfileUpdateRequest):
    if email in db.users:
        db.users[email].update(req.model_dump())
        return {"status": "success", "profile": db.users[email]}
    raise HTTPException(status_code=404, detail="User not found")

class BookingRequest(BaseModel):
    email: str
    provider: str
    tier: str
    price: float
    pickup: str
    dropoff: str

@app.get("/api/user/bookings")
def get_bookings(email: str):
    user_bookings = [b for b in db.bookings if b["email"] == email]
    return {"bookings": user_bookings}

@app.post("/api/user/bookings")
def add_booking(req: BookingRequest):
    booking_data = req.model_dump()
    booking_data["id"] = str(uuid.uuid4())
    import datetime
    booking_data["date"] = datetime.datetime.now().isoformat()
    db.bookings.insert(0, booking_data) # Add to top
    return {"status": "success", "booking": booking_data}
