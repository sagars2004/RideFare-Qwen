import random
from backend.agents.qwen_client import call_qwen_json

class TiersAgent:
    def __init__(self):
        pass

    def generate_tiers(self, provider: str, base_price: float, eta: int) -> dict:
        """
        Uses Qwen to dynamically generate 3 ride tiers based on the provider and base price.
        """
        prompt = f"""
        You are an AI generating dynamic ride tiers for a ride-hailing app.
        The selected provider is {provider.capitalize()}.
        The calculated base standard price is ${base_price:.2f} and the base ETA is {eta} minutes.

        Task: Generate EXACTLY 3 realistic vehicle tiers for this provider.
        - For Uber, tiers might be: "UberX", "Comfort", "Uber Black".
        - For Lyft, tiers might be: "Lyft", "Lyft XL", "Lyft Lux".
        - For Waymo/Robotaxi/Zoox, invent 3 futuristic tiers (e.g. "Standard Pod", "Premium Lounge", "Group Pod").

        Scale the prices realistically based on the standard price (${base_price:.2f}).
        Scale the ETAs slightly for premium tiers.
        Include a capacity (e.g., 4, 6) and a short 4-word description for each.

        Output MUST be valid JSON matching exactly this schema:
        {{
            "tiers": [
                {{
                    "name": "string",
                    "price": float,
                    "eta": int,
                    "capacity": int,
                    "description": "string"
                }}, ...
            ]
        }}
        """
        
        sys_prompt = "You are a precise JSON data generation agent."
        
        try:
            result = call_qwen_json(prompt=prompt, system_prompt=sys_prompt)
            return result
        except Exception as e:
            print(f"Qwen Tiers generation failed: {e}")
            # Fallback
            return {
                "tiers": [
                    {
                        "name": f"{provider.capitalize()} Standard",
                        "price": round(base_price, 2),
                        "eta": eta,
                        "capacity": 4,
                        "description": "Affordable standard ride"
                    },
                    {
                        "name": f"{provider.capitalize()} Premium",
                        "price": round(base_price * 1.3, 2),
                        "eta": eta + 3,
                        "capacity": 4,
                        "description": "Premium vehicle experience"
                    },
                    {
                        "name": f"{provider.capitalize()} XL",
                        "price": round(base_price * 1.5, 2),
                        "eta": eta + 5,
                        "capacity": 6,
                        "description": "Extra space for groups"
                    }
                ]
            }
