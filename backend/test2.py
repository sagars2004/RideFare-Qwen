import os
from backend.agents.scraper_agent import LivePricingAgent

def test():
    scraper = LivePricingAgent()
    pickup = "894 Windmill Park Lane, Mountain View CA 94043"
    dropoff = "1536 North Main Street, Salinas CA 93906"
    res = scraper.fetch_live_pricing(pickup, dropoff)
    print("FINAL RESULT:", res)

if __name__ == "__main__":
    test()
