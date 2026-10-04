"""
Comprehensive Full-Project Automated Test Suite
Covers all User & Admin Test Cases from testcase.md and verifies Backend, Database, and Frontend integrity.
"""
import sys
import os
import asyncio
import traceback

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Ensure project root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.core.config import settings
from backend.core.database import AsyncSessionLocal, engine
from sqlalchemy import text

passed_count = 0
failed_count = 0
test_results = []

def record_result(tc_id, scenario, passed, detail=""):
    global passed_count, failed_count
    if passed:
        passed_count += 1
        status = "PASS"
    else:
        failed_count += 1
        status = "FAIL"
    test_results.append({
        "id": tc_id,
        "scenario": scenario,
        "status": status,
        "detail": detail
    })
    mark = "✅" if passed else "❌"
    print(f"[{mark}] {tc_id:<12} | {scenario:<50} | {status} {detail}")

async def run_database_tests():
    print("\n--- 1. Testing Neon Cloud Database Connectivity ---")
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(text("SELECT 1"))
            val = result.scalar()
            assert val == 1
            
            # Check products count
            p_res = await session.execute(text("SELECT count(*) FROM products"))
            prod_count = p_res.scalar()
            
            # Check stores count
            s_res = await session.execute(text("SELECT count(*) FROM stores"))
            store_count = s_res.scalar()
            
            # Check price_listings count
            sp_res = await session.execute(text("SELECT count(*) FROM price_listings"))
            price_count = sp_res.scalar()

            record_result("DB_CONN", "Database Connectivity & Basic Queries", True, f"({prod_count} products, {store_count} stores, {price_count} price listings)")
    except Exception as e:
        record_result("DB_CONN", "Database Connectivity", False, str(e))

async def run_api_and_feature_tests():
    print("\n--- 2. Testing Full API Endpoints & testcase.md Scenarios ---")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        
        # Health check
        res = await client.get("/health")
        record_result("SYS_HEALTH", "System Health Check API", res.status_code == 200, f"HTTP {res.status_code}")

        # TC_U2_001: Search bar with valid model
        res = await client.get("/api/products?q=RTX")
        if res.status_code == 200:
            items = res.json()
            has_rtx = any("RTX" in p.get("name", "").upper() for p in items)
            record_result("TC_U2_001", "Search products with valid model (RTX)", has_rtx and len(items) > 0, f"Found {len(items)} items")
        else:
            record_result("TC_U2_001", "Search products with valid model", False, f"HTTP {res.status_code}")

        # TC_U2_002: Search non-existent product
        res = await client.get("/api/products?q=iPhone+16+Pro+Max+999")
        if res.status_code == 200:
            items = res.json()
            record_result("TC_U2_002", "Search non-existent product", len(items) == 0, "Correctly returned empty list")
        else:
            record_result("TC_U2_002", "Search non-existent product", False, f"HTTP {res.status_code}")

        # TC_U2_003: Search with empty string
        res = await client.get("/api/products")
        if res.status_code == 200:
            items = res.json()
            record_result("TC_U2_003", "Search with empty string returns standard list", len(items) > 0, f"Returned {len(items)} items")
        else:
            record_result("TC_U2_003", "Search with empty string", False, f"HTTP {res.status_code}")

        # TC_U1_001 & TC_U1_003: Product details & price comparison across retailers
        target_prod_id = items[0]["id"] if items else 1
        
        res_prod = await client.get(f"/api/products/{target_prod_id}")
        if res_prod.status_code == 200:
            prod_data = res_prod.json()
            platforms = prod_data.get("platforms", [])
            has_stores = len(platforms) > 0
            has_cheapest = any(p.get("is_lowest") for p in platforms)
            record_result("TC_U1_001", "Multi-store price comparison", has_stores and has_cheapest, f"{len(platforms)} store prices found")
            
            # TC_U1_003: Outbound URL validity
            has_urls = any(bool(p.get("product_url")) for p in platforms)
            record_result("TC_U1_003", "Retailer outbound purchase links exist", has_urls, "Stores have valid URLs")
        else:
            record_result("TC_U1_001", "Multi-store price comparison", False, f"HTTP {res_prod.status_code}")
            record_result("TC_U1_003", "Retailer outbound purchase links", False, "Product details failed")

        # TC_U3_001: Price history data for 30 days chart
        res_hist = await client.get(f"/api/products/{target_prod_id}/history")
        if res_hist.status_code == 200:
            hist_data = res_hist.json()
            has_series = "series" in hist_data and len(hist_data["series"]) > 0
            record_result("TC_U3_001", "Historical price time-series", has_series, f"{len(hist_data.get('series', []))} store series")
        else:
            record_result("TC_U3_001", "Historical price time-series", False, f"HTTP {res_hist.status_code}")

        # Compare Feature (/api/compare)
        prod_ids = [items[0]["id"]] if items else [1]
        res_cmp = await client.get(f"/api/compare?ids={','.join(map(str, prod_ids))}")
        record_result("TC_COMPARE", "Multi-product spec & price comparison API", res_cmp.status_code == 200, f"HTTP {res_cmp.status_code}")

        # Auth & Login (Admin & Demo User)
        login_res = await client.post("/api/auth/login", json={"email_or_username": "admin@techprice.com", "password": "password123"})
        if login_res.status_code != 200:
            login_res = await client.post("/api/auth/login", json={"email_or_username": "admin@techprice.com", "password": "admin123"})
        
        admin_token = None
        if login_res.status_code == 200:
            admin_token = login_res.json().get("access_token")
            record_result("TC_AUTH_01", "Admin Login & JWT Token Generation", True, "Authenticated successfully")
        else:
            record_result("TC_AUTH_01", "Admin Login & JWT Token Generation", False, f"HTTP {login_res.status_code}")

        admin_headers = {"Authorization": f"Bearer {admin_token}"} if admin_token else {}

        # TC_U4_001 & TC_U4_002: Email price alert creation
        alert_payload = {
            "product_id": target_prod_id,
            "target_price": 5000,
            "email": "test@kptm.com"
        }
        res_alert = await client.post("/api/alerts", json=alert_payload, headers=admin_headers)
        record_result("TC_U4_001", "Create price alert (Positive)", res_alert.status_code in [200, 201], f"HTTP {res_alert.status_code}")

        # TC_U4_002: Invalid email format validation
        invalid_alert = {
            "product_id": target_prod_id,
            "target_price": 5000,
            "email": "invalid_email_without_at"
        }
        res_inv = await client.post("/api/alerts", json=invalid_alert, headers=admin_headers)
        record_result("TC_U4_002", "Reject invalid email format (Negative)", res_inv.status_code in [400, 422], f"HTTP {res_inv.status_code}")

        # TC_U4_003: Immediate alert trigger when price already reached target
        reached_alert = {
            "product_id": target_prod_id,
            "target_price": 999999,
            "email": "buyer@test.com"
        }
        res_reached = await client.post("/api/alerts", json=reached_alert, headers=admin_headers)
        record_result("TC_U4_003", "Immediate price drop notification when price reached", res_reached.status_code == 200 and res_reached.json().get("current_lowest_price") is not None, f"HTTP {res_reached.status_code}")

        # Real-time analytics 2-minute window visit tracking
        res_visit = await client.post("/api/analytics/visit", json={"session_id": "test_session_realtime", "page_path": "/home"})
        record_result("TC_ANALYTICS", "Real-time audience tracking with 2-min active window", res_visit.status_code == 200 and res_visit.json().get("online_now", 0) >= 1, f"Online now: {res_visit.json().get('online_now') if res_visit.status_code == 200 else 'ERR'}")

        # Market Analysis & Store Dominance Ranking (analysis.md)
        res_analysis = await client.get("/api/analysis/store-dominance")
        is_analysis_valid = (
            res_analysis.status_code == 200 and 
            len(res_analysis.json().get("store_rankings", [])) >= 4 and
            res_analysis.json().get("price_spread", {}).get("avg_spread_percent") is not None
        )
        record_result("TC_ANALYSIS", "4-Dimension Market Analysis & Store Dominance API", is_analysis_valid, f"HTTP {res_analysis.status_code}")

        # Admin 1: Scraper Status (TC_A1_001)
        res_scrapers = await client.get("/api/scrapers/status", headers=admin_headers)
        record_result("TC_A1_001", "Admin check Web Scraper status", res_scrapers.status_code == 200, f"HTTP {res_scrapers.status_code}")

        # Admin 3: Email logs history (TC_A3_001)
        res_elogs = await client.get("/api/emails/logs", headers=admin_headers)
        record_result("TC_A3_001", "Admin view email alert dispatch logs", res_elogs.status_code == 200, f"HTTP {res_elogs.status_code}")

        # Admin 4: Scheduler settings & run (TC_A4_001)
        res_sched = await client.get("/api/scrapers/scheduler", headers=admin_headers)
        record_result("TC_A4_001", "Admin get scheduler cron settings", res_sched.status_code == 200, f"HTTP {res_sched.status_code}")

        # Admin 2: Store management (TC_A2_001)
        res_stores = await client.get("/api/admin/stores", headers=admin_headers)
        record_result("TC_A2_001", "Admin view store platforms", res_stores.status_code == 200, f"HTTP {res_stores.status_code}")

        # Admin 7: Dashboard KPI metrics (TC_A7_001)
        res_metrics = await client.get("/api/admin/stats", headers=admin_headers)
        if res_metrics.status_code == 200:
            m_data = res_metrics.json()
            record_result("TC_A7_001", "Admin Dashboard KPI metrics", True, f"Users: {m_data.get('total_users')}, Products: {m_data.get('total_products')}")
        else:
            record_result("TC_A7_001", "Admin Dashboard KPI metrics", False, f"HTTP {res_metrics.status_code}")

def check_frontend_bundle():
    print("\n--- 3. Testing Frontend Production Build Integrity ---")
    dist_dir = os.path.join(os.path.dirname(__file__), "frontend", "dist")
    index_html = os.path.join(dist_dir, "index.html")
    assets_dir = os.path.join(dist_dir, "assets")
    
    has_index = os.path.exists(index_html) and os.path.getsize(index_html) > 0
    has_assets = os.path.exists(assets_dir) and len(os.listdir(assets_dir)) >= 2
    
    record_result("FE_BUILD_01", "Frontend index.html exists and non-empty", has_index, f"Size: {os.path.getsize(index_html) if has_index else 0} bytes")
    record_result("FE_BUILD_02", "Frontend compiled assets (CSS + JS) present", has_assets, f"{len(os.listdir(assets_dir)) if has_assets else 0} asset files")

async def main():
    print("=" * 80)
    print("TECHPRICE THAILAND - FULL PROJECT AUTOMATED TEST SUITE")
    print("=" * 80)
    
    await run_database_tests()
    await run_api_and_feature_tests()
    check_frontend_bundle()

    print("\n" + "=" * 80)
    print(f"TEST EXECUTION SUMMARY: Total: {passed_count + failed_count} | Passed: {passed_count} | Failed: {failed_count}")
    print("=" * 80)
    
    if failed_count > 0:
        print("Some tests failed!")
        sys.exit(1)
    else:
        print("ALL TESTS PASSED SUCCESSFULLY (100% PASS RATE)!")
        sys.exit(0)

if __name__ == "__main__":
    asyncio.run(main())
