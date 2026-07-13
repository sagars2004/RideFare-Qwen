import os
from backend.agents.scraper_agent import LivePricingAgent

def test():
    scraper = LivePricingAgent()
    # Let's test a drive from SF Airport to Golden Gate Bridge
    res = scraper.fetch_live_pricing("San Francisco International Airport", "Golden Gate Bridge")
    print(res)

if __name__ == "__main__":
    test()
