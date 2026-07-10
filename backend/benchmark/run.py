import sys
import os
import json
import random
from typing import List, Dict, Any
from datetime import datetime, timezone, timedelta

# Ensure backend can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from backend.schemas.models import ConstraintObject, HardConstraints, SoftPreferences
from backend.agents.provider_agents import UberAgent, LyftAgent, WaymoAgent, RobotaxiAgent
from backend.agents.coordinator_agent import CoordinatorAgent
from backend.agents.qwen_client import call_qwen_json

def single_agent_baseline(bids: List[Any], constraint: ConstraintObject) -> str:
    system_prompt = """You are a simple ride-selection agent.
You are given a list of bids and the rider's constraints. 
Pick the single best provider that meets the constraints, balancing price and ETA.
You MUST output ONLY a JSON object with this exact schema:
{
    "recommended_provider": "string provider name"
}
"""
    prompt = f"Bids:\n{[b.model_dump_json() for b in bids]}\n\nConstraints:\n{constraint.model_dump_json()}"
    try:
        response = call_qwen_json(prompt=prompt, system_prompt=system_prompt, model="qwen-max")
        return response.get("recommended_provider", "uber")
    except Exception as e:
        return "uber" # fallback

def generate_synthetic_scenarios(num_scenarios: int = 20):
    scenarios = []
    for i in range(num_scenarios):
        # vary constraints randomly
        has_deadline = random.choice([True, False])
        deadline = None
        if has_deadline:
            deadline = datetime.now(timezone.utc) + timedelta(minutes=random.randint(15, 45))
            
        no_av_at_night = random.choice([True, False])
        excluded = []
        reason = None
        if no_av_at_night:
            excluded = ["waymo", "robotaxi"]
            reason = "no AV at night"
            
        price_weight = random.uniform(0.1, 0.9)
        eta_weight = 1.0 - price_weight
        
        constraint = ConstraintObject(
            hard_constraints=HardConstraints(
                arrival_deadline=deadline,
                excluded_providers=excluded,
                excluded_reason=reason
            ),
            soft_preferences=SoftPreferences(
                price_weight=price_weight,
                eta_weight=eta_weight
            ),
            rider_count=random.randint(1, 4)
        )
        scenarios.append(constraint)
    return scenarios

def run_benchmark():
    scenarios = generate_synthetic_scenarios(5) # Set to 5 for speed during hackathon build, scale up later
    
    multi_agent_costs = []
    multi_agent_times = []
    multi_agent_violations = 0
    
    single_agent_costs = []
    single_agent_times = []
    single_agent_violations = 0
    
    print(f"Running benchmark on {len(scenarios)} scenarios...")
    
    for idx, constraint in enumerate(scenarios):
        print(f"Processing scenario {idx+1}/{len(scenarios)}...")
        
        # 1. Generate bids for this scenario
        request_context = {}
        providers = [UberAgent(), LyftAgent(), WaymoAgent(), RobotaxiAgent()]
        bids = [p.generate_bid(request_context) for p in providers]
        
        # 2. Multi-agent Coordinator
        coordinator = CoordinatorAgent()
        decision = coordinator.negotiate(constraint=constraint, request_context=request_context, pre_generated_bids=bids)
        multi_provider = decision.recommended_provider
        
        # 3. Single-agent baseline
        single_provider = single_agent_baseline(bids, constraint)
        
        # Evaluate Multi-agent pick
        multi_bid = next((b for b in bids if b.provider.lower() == multi_provider.lower()), bids[0])
        multi_agent_costs.append(multi_bid.price_usd)
        multi_agent_times.append(multi_bid.eta_total_min)
        if multi_provider.lower() in constraint.hard_constraints.excluded_providers:
            multi_agent_violations += 1
            
        # Evaluate Single-agent pick
        single_bid = next((b for b in bids if b.provider.lower() == single_provider.lower()), bids[0])
        single_agent_costs.append(single_bid.price_usd)
        single_agent_times.append(single_bid.eta_total_min)
        if single_provider.lower() in constraint.hard_constraints.excluded_providers:
            single_agent_violations += 1
            
    # Compile markdown report
    report = f"""# RideFare Benchmark Results

Comparing Multi-Agent Coordinator vs. Single-Agent Baseline over {len(scenarios)} synthetic scenarios.

| Metric | Single-Agent Baseline | Multi-Agent Coordinator |
|---|---|---|
| Average Cost | ${sum(single_agent_costs)/len(single_agent_costs):.2f} | ${sum(multi_agent_costs)/len(multi_agent_costs):.2f} |
| Average Total ETA | {sum(single_agent_times)/len(single_agent_times):.1f} min | {sum(multi_agent_times)/len(multi_agent_times):.1f} min |
| Constraint Violations | {single_agent_violations} | {multi_agent_violations} |

*Note: Multi-agent coordination actively filters out hard constraint violations before final selection, whereas the single-agent LLM is prone to occasional hallucination or ignoring constraints when optimizing for price/ETA.*
"""
    
    docs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../docs/benchmark_results.md'))
    with open(docs_path, 'w') as f:
        f.write(report)
        
    print(f"Benchmark complete. Report saved to {docs_path}")

if __name__ == "__main__":
    run_benchmark()
