from backend.schemas.models import ConstraintObject
from backend.agents.qwen_client import call_qwen_json

class ConstraintAgent:
    def parse_intent(self, rider_intent: str) -> ConstraintObject:
        system_prompt = """You are the RideFare Constraint Agent.
Your job is to parse natural language rider intent into a structured JSON object representing their constraints and preferences.

The JSON output MUST exactly match this schema:
{
  "hard_constraints": {
    "arrival_deadline": "ISO-8601 datetime string or null",
    "excluded_providers": ["list of provider strings (e.g. 'uber', 'lyft', 'waymo', 'robotaxi')"],
    "excluded_reason": "string reason for exclusion or null"
  },
  "soft_preferences": {
    "price_weight": float between 0.0 and 1.0,
    "eta_weight": float between 0.0 and 1.0 (should sum to 1.0 with price_weight)
  },
  "rider_count": integer
}

Example Input:
"I need to be there by 7:15 PM on July 10, 2026. Don't put me in a Robotaxi at night. It's just me."

Example Output:
{
  "hard_constraints": {
    "arrival_deadline": "2026-07-10T19:15:00Z",
    "excluded_providers": ["robotaxi"],
    "excluded_reason": "no_av_at_night"
  },
  "soft_preferences": {
    "price_weight": 0.4,
    "eta_weight": 0.6
  },
  "rider_count": 1
}

Output ONLY valid JSON."""

        response_dict = call_qwen_json(prompt=rider_intent, system_prompt=system_prompt, model="qwen-plus")
        
        # Load into Pydantic model
        return ConstraintObject(**response_dict)
