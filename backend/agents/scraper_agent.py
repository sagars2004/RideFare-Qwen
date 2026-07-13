import urllib.parse
from playwright.sync_api import sync_playwright
from backend.agents.qwen_client import call_qwen_json

class LivePricingAgent:
    def __init__(self):
        pass

    def fetch_live_pricing(self, pickup: str, dropoff: str) -> dict:
        """
        Uses Playwright to fetch live routing data from Google Maps, 
        then uses Qwen to parse the text, calculate distance/time, 
        and generate realistic Uber/Lyft prices and surge data.
        """
        # Format the URL
        origin = urllib.parse.quote_plus(pickup)
        dest = urllib.parse.quote_plus(dropoff)
        url = f"https://www.google.com/maps/dir/{origin}/{dest}/"
        
        print(f"Scraping live data from: {url}")
        page_text = ""
        
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                # Go to Google Maps directions
                page.goto(url, wait_until="domcontentloaded", timeout=15000)
                # Wait for the distance to likely render
                page.wait_for_timeout(500) 
                page_text = page.inner_text("body")
                browser.close()
        except Exception as e:
            print(f"Scraping failed: {e}")
            page_text = "Failed to load page. Assume 5 miles, 15 minutes."

        prompt = f"""
        Here is the raw text scraped from a Google Maps directions page for a drive from {pickup} to {dropoff}:
        
        {page_text[:6000]}
        
        Task:
        1. Parse the text to find the driving distance (in miles) and driving time (in minutes). If not found in text, use your world knowledge to estimate them based on the locations.
        2. Determine if there is heavy traffic based on the text.
        
        Output MUST be valid JSON matching exactly:
        {{
            "distance_miles": 10.5,
            "duration_minutes": 25,
            "heavy_traffic": false
        }}
        """
        
        sys_prompt = "You are a highly precise JSON data extraction agent."
        
        try:
            result = call_qwen_json(prompt=prompt, system_prompt=sys_prompt)
            miles = float(result.get("distance_miles", 5.0))
            mins = float(result.get("duration_minutes", 15.0))
            traffic = result.get("heavy_traffic", False)
            
            surge = 1.5 if traffic else 1.0
            uber_price = (5.0 + (1.50 * miles) + (0.50 * mins)) * surge
            lyft_price = (4.0 + (1.40 * miles) + (0.55 * mins)) * (1.4 if traffic else 1.0)
            
            result["uber_price"] = round(uber_price, 2)
            result["lyft_price"] = round(lyft_price, 2)
            result["surge_multiplier"] = surge
            
            return result
        except Exception as e:
            print(f"Qwen extraction failed: {e}")
            return {
                "distance_miles": 5.0,
                "duration_minutes": 15,
                "heavy_traffic": False,
                "uber_price": 25.0,
                "lyft_price": 22.0,
                "surge_multiplier": 1.0
            }
