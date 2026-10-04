import random
from typing import Dict, Any, Optional

class MockLiveScraper:
    """
    Simulates real-time pricing dynamics across Thai IT platforms (JIB, iHaveCPU, BaNANA, Advice)
    with realistic competitor price moves, flash promotions, and stock fluctuations.
    """
    @staticmethod
    def simulate_price_scrape(base_msrp: float, store_slug: str, current_price: Optional[float] = None) -> Dict[str, Any]:
        msrp = float(base_msrp or 18900.0)
        curr = float(current_price) if (current_price and current_price > 0) else msrp
        
        # Store-specific pricing behavior in Thai retail:
        # Advice & iHaveCPU tend to compete aggressively on price (-2% to -6% from MSRP)
        # JIB offers competitive official prices with small adjustments (-1% to -4%)
        # BaNANA holds closer to MSRP or pairs with loyalty points (-1% to +1%)
        if store_slug in ["advice", "ihavecpu"]:
            deltas = [-0.055, -0.04, -0.03, -0.02, -0.015, -0.01]
        elif store_slug == "jib":
            deltas = [-0.04, -0.03, -0.02, -0.01, 0.0, 0.005]
        else: # banana or others
            deltas = [-0.025, -0.015, -0.01, 0.0, 0.01, 0.015]

        pct = random.choice(deltas)
        new_val = msrp * (1.0 + pct)
        
        # Ensure price changes from current price so sync visibly updates data
        if abs(new_val - curr) < 40:
            adjustment = random.choice([-290, -190, -150, -90, 80, 150, -350])
            new_val = curr + adjustment
            
        # Constrain within realistic retail boundaries (78% to 110% of MSRP)
        new_val = max(msrp * 0.78, min(msrp * 1.10, new_val))
        
        # Round to standard retail pricing (ending in 0, 50, or 90)
        rounded_base = round(new_val / 50) * 50
        simulated_price = float(rounded_base)
        original_price = float(round(max(simulated_price * 1.06, msrp), 2))

        stock_roll = random.random()
        if stock_roll < 0.88:
            stock = "in_stock"
        elif stock_roll < 0.96:
            stock = "low_stock"
        else:
            stock = "backorder"

        shipping = 0.0
        
        return {
            "price": float(simulated_price),
            "original_price": float(original_price) if original_price else None,
            "stock_status": stock,
            "shipping_cost": shipping,
            "rating": round(random.uniform(4.7, 4.9), 1),
            "review_count": random.randint(450, 5200)
        }

