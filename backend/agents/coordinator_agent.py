import json
from typing import List, Dict, Any
from datetime import datetime, timezone, timedelta

from backend.schemas.models import (
    BidObject, 
    ConstraintObject, 
    CoordinatorDecisionObject,
    ExcludedProvider,
    ConflictDetected
)
from backend.agents.qwen_client import call_qwen_json
from backend.agents.provider_agents import (
    UberAgent, LyftAgent, WaymoAgent, RobotaxiAgent, ZooxAgent
)

class CoordinatorAgent:
    def __init__(self):
        self.providers = [
            UberAgent(),
            LyftAgent(),
            WaymoAgent(),
            RobotaxiAgent(),
            ZooxAgent(),
        ]
        
    def negotiate(self, constraint: ConstraintObject, request_context: dict, pre_generated_bids: List[BidObject] = None) -> CoordinatorDecisionObject:
        if pre_generated_bids:
            bids = pre_generated_bids
        else:
            bids = []
            for provider in self.providers:
                bids.append(provider.generate_bid(request_context))
            
        excluded = []
        valid_bids = []
        
        # Hard constraint filtering
        for bid in bids:
            is_excluded = False
            # Check capacity
            if bid.capacity < constraint.rider_count:
                excluded.append(ExcludedProvider(
                    provider=bid.provider, 
                    reason=f"violates hard constraint: capacity ({bid.capacity} < {constraint.rider_count})"
                ))
                is_excluded = True
                continue
                
            # Check explicit exclusions
            if bid.provider in constraint.hard_constraints.excluded_providers:
                excluded.append(ExcludedProvider(
                    provider=bid.provider,
                    reason=f"violates hard constraint: {constraint.hard_constraints.excluded_reason}"
                ))
                is_excluded = True
                continue
                
            # Check deadline
            if constraint.hard_constraints.arrival_deadline:
                arrival_time = datetime.now(timezone.utc) + timedelta(minutes=bid.eta_total_min)
                if arrival_time > constraint.hard_constraints.arrival_deadline:
                    excluded.append(ExcludedProvider(
                        provider=bid.provider,
                        reason=f"violates hard constraint: arrival deadline"
                    ))
                    is_excluded = True
                    continue
                    
            # State-Based Validation
            pickup = request_context.get("pickup", "")
            if pickup:
                is_valid = True
                extracted_state = "your state"
                parts = [p.strip() for p in pickup.split(",")]
                if len(parts) >= 3 and "United States" in parts[-1]:
                    extracted_state = parts[-3]
                    
                if bid.provider in ["waymo", "robotaxi"]:
                    if not any(state in pickup for state in ["California", "Arizona", "Texas", "Nevada", "CA", "AZ", "TX", "NV"]):
                        is_valid = False
                elif bid.provider == "zoox":
                    if not any(state in pickup for state in ["California", "Nevada", "CA", "NV"]):
                        is_valid = False
                        
                if not is_valid:
                    excluded.append(ExcludedProvider(
                        provider=bid.provider,
                        reason=f"is not yet available in the state of {extracted_state}"
                    ))
                    is_excluded = True
                    continue

            if not is_excluded:
                valid_bids.append(bid)
                
        system_prompt = """You are the RideFare Coordinator Agent.
You are given a list of valid bids from ride providers, a list of excluded providers, and the rider's constraints/preferences.
Your job is to:
1. Detect any conflicts among the valid bids (e.g., stale quotes older than 3 minutes, tied bids where one is cheaper but another is faster, or different framings of 'cheapest').
2. Resolve those conflicts based on the rider's soft preference weights (price vs ETA).
3. Rank the valid providers from best to worst.
4. Select the best provider as 'recommended_provider'.
5. Provide a step-by-step negotiation trace (array of strings, each representing an agent's argument or the coordinator's decision).
6. Provide a final natural-language rationale.

Output MUST be a JSON object exactly matching this schema:
{
  "recommended_provider": "string",
  "rank": ["provider_name1", "provider_name2"],
  "conflicts_detected": [
    {
      "type": "string (e.g., tied_bid_different_framing, stale_quote)",
      "providers": ["provider1", "provider2"],
      "resolution": "string"
    }
  ],
  "rationale": "string",
  "negotiation_trace": [
    "string", "string"
  ]
}

Make the negotiation trace engaging and realistic, as if the agents are arguing. Include the exclusions that were already made as well if relevant.
Example trace:
- "Waymo Agent: flagging high demand, price may increase."
- "Constraint Agent: excluding Robotaxi — hard constraint violation (no AV at night)."
- "Coordinator: Lyft vs Waymo tied under different framings - resolving in favor of price weight."
"""

        prompt = f"""
Valid Bids:
{[b.model_dump_json() for b in valid_bids]}

Excluded Providers:
{[e.model_dump_json() for e in excluded]}

Constraints & Preferences:
{constraint.model_dump_json()}
"""
        
        response_dict = call_qwen_json(prompt=prompt, system_prompt=system_prompt, model="qwen-plus")
        
        # Robust LLM output coercion
        rank = response_dict.get("rank", [])
        if isinstance(rank, str):
            rank = [rank]
            
        conflicts_list = response_dict.get("conflicts_detected", [])
        for c in conflicts_list:
            if isinstance(c.get("providers"), str):
                c["providers"] = [c["providers"]]
        
        return CoordinatorDecisionObject(
            recommended_provider=response_dict.get("recommended_provider", "uber"),
            rank=rank,
            bids=bids,
            excluded=excluded,
            conflicts_detected=[ConflictDetected(**c) for c in conflicts_list],
            rationale=response_dict.get("rationale", ""),
            negotiation_trace=response_dict.get("negotiation_trace", [])
        )
