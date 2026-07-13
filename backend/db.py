import os
import uuid
from typing import Dict, List, Any

# In-memory database
class DB:
    def __init__(self):
        self.users: Dict[str, Dict[str, Any]] = {}
        self.bookings: List[Dict[str, Any]] = []
        
        # Initialize default demo user
        demo_email = os.environ.get("DEMO_EMAIL", "admin@ridefare.com")
        self.users[demo_email] = {
            "name": "Demo User",
            "state": "California",
            "cc_last4": "4242"
        }
        
db = DB()
