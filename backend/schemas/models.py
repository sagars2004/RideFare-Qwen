from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class BidObject(BaseModel):
    provider: str
    price_usd: float
    eta_pickup_min: int
    eta_total_min: int
    vehicle_type: str
    capacity: int
    confidence: float
    flags: List[str] = Field(default_factory=list)
    quote_timestamp: datetime
    agent_note: str

class HardConstraints(BaseModel):
    arrival_deadline: Optional[datetime] = None
    excluded_providers: List[str] = Field(default_factory=list)
    excluded_reason: Optional[str] = None

class SoftPreferences(BaseModel):
    price_weight: float
    eta_weight: float

class ConstraintObject(BaseModel):
    hard_constraints: HardConstraints
    soft_preferences: SoftPreferences
    rider_count: int

class ExcludedProvider(BaseModel):
    provider: str
    reason: str

class ConflictDetected(BaseModel):
    type: str
    providers: List[str]
    resolution: str

class CoordinatorDecisionObject(BaseModel):
    recommended_provider: str
    rank: List[str]
    excluded: List[ExcludedProvider] = Field(default_factory=list)
    conflicts_detected: List[ConflictDetected] = Field(default_factory=list)
    rationale: str
    negotiation_trace: List[str]
