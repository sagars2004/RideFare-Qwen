import json
from backend.agents.qwen_client import call_qwen_with_tools, call_qwen_json

class WeatherSurgeAgent:
    def __init__(self):
        self.tools = [{
            "type": "function",
            "function": {
                "name": "get_live_weather",
                "description": "Fetch the current weather conditions for a given city or location.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "The city and state/country, e.g., 'San Francisco, CA'"
                        }
                    },
                    "required": ["location"]
                }
            }
        }]

    def _execute_weather_tool(self, location: str) -> dict:
        """Mock weather API execution to avoid Geocoding/Rate limits during the hackathon demo."""
        print(f"[WeatherSurgeAgent] Executing tool get_live_weather for location: {location}")
        loc_lower = location.lower()
        if "seattle" in loc_lower or "london" in loc_lower or "portland" in loc_lower:
            return {"condition": "Heavy Rain", "temperature_f": 48}
        elif "boston" in loc_lower or "new york" in loc_lower or "chicago" in loc_lower:
            return {"condition": "Snowstorm", "temperature_f": 28}
        elif "miami" in loc_lower or "phoenix" in loc_lower:
            return {"condition": "Clear", "temperature_f": 85}
        else:
            return {"condition": "Overcast", "temperature_f": 65}

    def analyze_weather_surge(self, pickup_location: str) -> dict:
        """
        Uses Qwen function calling to get weather, then asks Qwen to calculate a surge multiplier.
        """
        messages = [
            {"role": "system", "content": "You are a weather-routing assistant. Use tools to find the weather, then return your final answer as JSON."},
            {"role": "user", "content": f"What is the weather like in {pickup_location}? Call the tool to find out."}
        ]
        
        # Step 1: Ask Qwen, expect a tool call
        try:
            response_msg = call_qwen_with_tools(messages, self.tools, model="qwen-plus")
        except Exception as e:
            print(f"Weather tool call failed: {e}")
            return {"weather_condition": "Unknown", "weather_surge_multiplier": 1.0}
            
        # Step 2: Execute the tool if Qwen requested it
        if "tool_calls" in response_msg and response_msg["tool_calls"]:
            tool_call = response_msg["tool_calls"][0]
            func_name = tool_call["function"]["name"]
            
            if func_name == "get_live_weather":
                args = json.loads(tool_call["function"]["arguments"])
                tool_result = self._execute_weather_tool(args.get("location", pickup_location))
                
                # Step 3: We have the weather. Now we use a standard JSON call to calculate surge.
                prompt = f"""
                The live weather in {pickup_location} is: {tool_result['condition']} ({tool_result['temperature_f']} F).
                
                Calculate a 'weather_surge_multiplier' based on these conditions:
                - Clear/Overcast: 1.0
                - Rain: 1.2 - 1.4
                - Snowstorm: 1.8 - 2.5
                
                Output ONLY valid JSON matching:
                {{
                    "weather_condition": "Snowstorm",
                    "weather_surge_multiplier": 2.1,
                    "rationale": "High surge due to dangerous snow conditions."
                }}
                """
                
                final_result = call_qwen_json(prompt, system_prompt="You are a JSON pricing engine.")
                print(f"[WeatherSurgeAgent] Final Surge Result: {final_result}")
                
                # Ensure safety bounds
                surge = float(final_result.get("weather_surge_multiplier", 1.0))
                final_result["weather_surge_multiplier"] = max(1.0, min(3.0, surge))
                return final_result
                
        return {"weather_condition": "Clear", "weather_surge_multiplier": 1.0, "rationale": "No weather data."}
