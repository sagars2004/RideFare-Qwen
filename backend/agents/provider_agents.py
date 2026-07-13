import random
from datetime import datetime, timezone, timedelta
from abc import ABC, abstractmethod

from backend.schemas.models import BidObject

class BaseProviderAgent(ABC):
    @abstractmethod
    def generate_bid(self, request_context: dict) -> BidObject:
        """Generate a bid based on the request context."""
        pass

class UberAgent(BaseProviderAgent):
    def generate_bid(self, request_context: dict) -> BidObject:
        base_price = 15.0
        # Surge multiplier: 1.0 (normal), 1.2 (moderate), 1.5 (high)
        surge = random.choice([1.0, 1.2, 1.5])
        price = base_price * surge
        
        eta_pickup = random.randint(2, 8)
        eta_total = eta_pickup + 15
        
        flags = []
        if surge >= 1.5:
            flags.append("high_service_demand")
            agent_note = "Demand is elevated in this area; price is surging."
        elif surge >= 1.2:
            flags.append("moderate_service_demand")
            agent_note = "Slightly elevated demand."
        else:
            agent_note = "Standard Uber pricing."
            
        return BidObject(
            provider="uber",
            price_usd=round(price, 2),
            eta_pickup_min=eta_pickup,
            eta_total_min=eta_total,
            vehicle_type="standard",
            capacity=4,
            confidence=0.9,
            flags=flags,
            quote_timestamp=datetime.now(timezone.utc),
            agent_note=agent_note
        )

class LyftAgent(BaseProviderAgent):
    def generate_bid(self, request_context: dict) -> BidObject:
        base_price = 14.5
        # Deliberate conflict injection: sometimes Lyft is cheapest overall
        multiplier = random.choice([0.9, 1.0, 1.3])
        price = base_price * multiplier
        
        eta_pickup = random.randint(4, 10)
        eta_total = eta_pickup + 15
        
        flags = []
        if multiplier < 1.0:
            agent_note = "Lyft Agent: I am currently the cheapest option overall!"
            flags.append("price_leader")
        else:
            agent_note = "Reliable Lyft ride."
            
        return BidObject(
            provider="lyft",
            price_usd=round(price, 2),
            eta_pickup_min=eta_pickup,
            eta_total_min=eta_total,
            vehicle_type="standard",
            capacity=4,
            confidence=0.85,
            flags=flags,
            quote_timestamp=datetime.now(timezone.utc),
            agent_note=agent_note
        )

class WaymoAgent(BaseProviderAgent):
    def generate_bid(self, request_context: dict) -> BidObject:
        base_price = 16.0
        
        # Conflict injection: stale quote
        is_stale = random.choice([True, False])
        timestamp = datetime.now(timezone.utc)
        if is_stale:
            timestamp -= timedelta(minutes=5)
            
        eta_pickup = random.randint(5, 12)
        
        flags = ["av_provider"]
        if is_stale:
            flags.append("stale_quote")
            agent_note = "Waymo Agent: Quote generated 5 minutes ago, actual arrival may vary."
        else:
            agent_note = "Waymo Agent: Premium autonomous experience. Often cheapest per comfort tier."
            flags.append("comfort_leader")
            
        return BidObject(
            provider="waymo",
            price_usd=round(base_price, 2),
            eta_pickup_min=eta_pickup,
            eta_total_min=eta_pickup + 15,
            vehicle_type="premium",
            capacity=4,
            confidence=0.95,
            flags=flags,
            quote_timestamp=timestamp,
            agent_note=agent_note
        )

class RobotaxiAgent(BaseProviderAgent):
    def generate_bid(self, request_context: dict) -> BidObject:
        base_price = 12.0
        # Extremely volatile pricing
        price = base_price * random.choice([0.8, 1.0, 1.5])
        
        eta_pickup = random.randint(8, 20)
        
        flags = ["av_provider"]
        if eta_pickup > 15:
            flags.append("long_wait")
            agent_note = "Robotaxi Agent: Vehicles are far away, but price is highly competitive."
        else:
            agent_note = "Robotaxi Agent: The most affordable autonomous ride."
            
        return BidObject(
            provider="robotaxi",
            price_usd=round(price, 2),
            eta_pickup_min=eta_pickup,
            eta_total_min=eta_pickup + 18,
            vehicle_type="standard",
            # Smaller capacity to potentially trigger constraints
            capacity=3, 
            confidence=0.7,
            flags=flags,
            quote_timestamp=datetime.now(timezone.utc),
            agent_note=agent_note
        )


class ZooxAgent(BaseProviderAgent):
    def generate_bid(self, request_context: dict) -> BidObject:
        base_price = 18.0
        price = base_price * random.choice([0.95, 1.05])
        eta_pickup = random.randint(10, 25)
        return BidObject(
            provider="zoox", price_usd=round(price, 2), eta_pickup_min=eta_pickup,
            eta_total_min=eta_pickup + 15, vehicle_type="premium", capacity=4,
            confidence=0.85, flags=["av_provider", "spacious"], quote_timestamp=datetime.now(timezone.utc),
            agent_note="Zoox Agent: Premium spacious autonomous pod."
        )
