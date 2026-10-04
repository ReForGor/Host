"""
Live Store Client - fetches REAL prices and canonical product URLs directly from the
official websites of the 4 tracked Thai IT retailers:

- JIB Computer Group  (www.jib.co.th)
- Advice IT Infinite  (www.advice.co.th)
- BaNANA IT           (www.bnn.in.th)
- iHaveCPU            (ihavecpu.com)

Every store publishes a schema.org ``Product`` JSON-LD block on its product pages,
which contains the exact price shown to shoppers. That block is the single source
of truth used here, so the price stored in our database always equals the price on
the retailer's own page.

Product matching uses strict token rules (see ``match_score``) so that a search
result is only accepted when it is the *same* SKU/variant (capacity, colour, model
suffix, ...), never a "close enough" product.
"""
from __future__ import annotations

import asyncio
import base64
import json
import logging
import re
import time
import urllib.parse
from typing import Any, Dict, List, Optional

import httpx

logger = logging.getLogger(__name__)

STORE_SLUGS = ("jib", "advice", "banana", "ihavecpu")

DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "th,en;q=0.9",
}

ADVICE_API = "https://prodbackadvice.advice.in.th/api/v1.0.0/product/get"


# ---------------------------------------------------------------------------
# Matching helpers
# ---------------------------------------------------------------------------
_STRIP_RE = re.compile(r"[\s\-_/().,+\"'\[\]:|*®™]+")


def norm(text: Optional[str]) -> str:
    """Upper-case and strip whitespace/punctuation (Thai characters are kept)."""
    return _STRIP_RE.sub("", (text or "").upper())


def match_score(name: str, spec: Dict[str, Any]) -> Optional[int]:
    """
    Returns a score if ``name`` satisfies the spec, otherwise ``None``.

    spec keys:
      must   - list of tokens; each token may be a list of alternatives (any-of).
      not    - tokens that disqualify the candidate.
      prefer - tokens that add to the score.
      avoid  - tokens that subtract from the score.
    """
    n = norm(name)
    if not n:
        return None
    for tok in spec.get("must", []):
        alts = tok if isinstance(tok, (list, tuple)) else [tok]
        if not any(norm(a) in n for a in alts):
            return None
    for tok in spec.get("not", []):
        if norm(tok) in n:
            return None
    score = 100
    score += 10 * sum(1 for t in spec.get("prefer", []) if norm(t) in n)
    score -= 10 * sum(1 for t in spec.get("avoid", []) if norm(t) in n)
    return score


def to_price(value: Any) -> Optional[float]:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value) if value > 0 else None
    cleaned = re.sub(r"[^\d.]", "", str(value))
    try:
        val = float(cleaned)
        return val if val > 0 else None
    except ValueError:
        return None


# ---------------------------------------------------------------------------
# JSON-LD parsing
# ---------------------------------------------------------------------------
_LDJSON_RE = re.compile(r"<script[^>]*application/ld\+json[^>]*>(.*?)</script>", re.S | re.I)


def _walk_products(node: Any):
    if isinstance(node, dict):
        t = node.get("@type")
        if t == "Product" or (isinstance(t, list) and "Product" in t):
            yield node
        for v in node.values():
            yield from _walk_products(v)
    elif isinstance(node, list):
        for v in node:
            yield from _walk_products(v)


def parse_product_jsonld(html: str) -> Optional[Dict[str, Any]]:
    for m in _LDJSON_RE.finditer(html or ""):
        raw = m.group(1).strip()
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            try:
                data = json.loads(raw.replace("\r", " ").replace("\n", " "))
            except json.JSONDecodeError:
                continue
        for prod in _walk_products(data):
            offers = prod.get("offers") or {}
            if isinstance(offers, list):
                offers = offers[0] if offers else {}
            price = to_price(offers.get("price") or offers.get("lowPrice"))
            if not price:
                continue
            image = prod.get("image")
            if isinstance(image, list):
                image = image[0] if image else None
            if isinstance(image, dict):
                image = image.get("url")
            availability = str(offers.get("availability") or "")
            return {
                "name": (prod.get("name") or "").strip(),
                "price": price,
                "image": image,
                "sku": prod.get("sku"),
                "offer_url": offers.get("url"),
                "in_stock": ("OutOfStock" not in availability and "SoldOut" not in availability),
                "availability": availability.rsplit("/", 1)[-1] if availability else None,
            }
    return None


# ---------------------------------------------------------------------------
# Live client
# ---------------------------------------------------------------------------
class LiveStoreClient:
    def __init__(self, timeout: float = 20.0, concurrency: int = 4):
        self._client = httpx.AsyncClient(
            headers=DEFAULT_HEADERS, follow_redirects=True, timeout=timeout, verify=False
        )
        self._sem = asyncio.Semaphore(concurrency)
        self._advice_token: Optional[str] = None
        self._advice_token_exp: float = 0.0

    async def close(self):
        await self._client.aclose()

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        await self.close()

    async def _get(self, url: str, **kw) -> Optional[httpx.Response]:
        async with self._sem:
            for attempt in range(2):
                try:
                    r = await self._client.get(url, **kw)
                    if r.status_code == 200:
                        return r
                    if r.status_code in (404, 410):
                        return None
                except Exception as e:  # network hiccup -> retry once
                    logger.debug("GET %s failed: %s", url, e)
                await asyncio.sleep(1.0 + attempt)
        return None

    # ---------------- product page ----------------
    async def fetch_product(self, url: str) -> Optional[Dict[str, Any]]:
        """Fetch a product page and return its JSON-LD price data (or None)."""
        if not url or not is_direct_product_url(url):
            return None
        r = await self._get(url)
        if r is None:
            return None
        info = parse_product_jsonld(r.text)
        if not info:
            return None
        info["url"] = canonical_url(str(r.url), info.get("offer_url"))
        return info

    # ---------------- searches ----------------
    async def search(self, store: str, query: str) -> List[Dict[str, Any]]:
        fn = {
            "jib": self._search_jib,
            "advice": self._search_advice,
            "banana": self._search_banana,
            "ihavecpu": self._search_ihavecpu,
        }[store]
        try:
            return await fn(query)
        except Exception as e:
            logger.warning("Search %s '%s' failed: %s", store, query, e)
            return []

    async def _search_jib(self, query: str) -> List[Dict[str, Any]]:
        q = urllib.parse.quote(query)
        r = await self._get(f"https://www.jib.co.th/web/index.php/product/search_suggestion?term={q}")
        if r is None:
            return []
        out = []
        for it in r.json().get("rec", []) or []:
            try:
                pid = int(str(it.get("id", "0")))
            except ValueError:
                continue
            if not pid:
                continue
            out.append({
                "name": it.get("title", ""),
                "url": f"https://www.jib.co.th/web/product/readProduct/{pid}",
                "price": to_price(it.get("salePrice") or it.get("price")),
            })
        return out

    async def _advice_get_token(self, force: bool = False) -> Optional[str]:
        now = time.time()
        if not force and self._advice_token and now < self._advice_token_exp - 120:
            return self._advice_token
        r = await self._get("https://www.advice.co.th/")
        if r is None:
            return None
        toks = re.findall(r"eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}", r.text)
        if not toks:
            return None
        tok = toks[0]
        try:
            payload = json.loads(base64.urlsafe_b64decode(tok.split(".")[1] + "=="))
            self._advice_token_exp = float(payload.get("exp", now + 3600))
        except Exception:
            self._advice_token_exp = now + 3600
        self._advice_token = tok
        return tok

    async def _search_advice(self, query: str) -> List[Dict[str, Any]]:
        out: List[Dict[str, Any]] = []
        for attempt in range(2):
            token = await self._advice_get_token(force=attempt > 0)
            if not token:
                return out
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}",
                "Origin": "https://www.advice.co.th",
                "Referer": "https://www.advice.co.th/",
            }
            async with self._sem:
                r = await self._client.post(ADVICE_API, json={"keyword": query}, headers=headers)
            if r.status_code == 401:
                continue
            if r.status_code != 200:
                return out
            data = r.json().get("data") or {}
            for grp in data.get("product", []) or []:
                for it in grp.get("product", []) or []:
                    purl = it.get("product_url") or ""
                    if purl and not purl.startswith("http"):
                        purl = "https://www.advice.co.th/product/" + purl.lstrip("/").removeprefix("product/")
                    if not purl:
                        continue
                    out.append({
                        "name": it.get("product", ""),
                        "url": purl,
                        "price": to_price(it.get("price_sale") or it.get("price_sale_true")),
                        "srp": to_price(it.get("price_srp")),
                    })
            return out
        return out

    async def _search_banana(self, query: str) -> List[Dict[str, Any]]:
        q = urllib.parse.quote(query)
        r = await self._get(f"https://www.bnn.in.th/th/p?q={q}")
        if r is None:
            return []
        out = []
        for m in _LDJSON_RE.finditer(r.text):
            s = m.group(1)
            if '"ItemList"' not in s:
                continue
            try:
                data = json.loads(s)
            except json.JSONDecodeError:
                continue
            for el in data.get("itemListElement", []) or []:
                url = el.get("url") or (el.get("item") or {}).get("url") if isinstance(el.get("item"), dict) else el.get("url")
                name = el.get("name") or (el.get("item") or {}).get("name", "") if isinstance(el.get("item"), dict) else el.get("name", "")
                if url and "/th/p/" in url:
                    out.append({"name": name or "", "url": url, "price": None})
        return out

    async def _search_ihavecpu(self, query: str) -> List[Dict[str, Any]]:
        q = urllib.parse.quote(query)
        r = await self._get(f"https://ihavecpu.com/product/search/{q}")
        if r is None:
            return []
        m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', r.text, re.S)
        if not m:
            return []
        data = json.loads(m.group(1))
        prod = (data.get("props") or {}).get("pageProps", {}).get("product") or {}
        items = prod.get("data") if isinstance(prod, dict) else prod
        out = []
        for it in items or []:
            pid = it.get("product_id") or it.get("id")
            name = it.get("name_th") or it.get("name_gb") or ""
            if not pid:
                continue
            slug = re.sub(r"\s+", "-", name.strip().lower())
            out.append({
                "name": name,
                "url": f"https://ihavecpu.com/product/{pid}/{urllib.parse.quote(slug, safe='()-.')}",
                "price": to_price(it.get("price_sale")),
                "srp": to_price(it.get("price_before")),
                "stock": it.get("stock"),
            })
        return out


# ---------------------------------------------------------------------------
# URL helpers
# ---------------------------------------------------------------------------
def is_direct_product_url(url: Optional[str]) -> bool:
    if not url:
        return False
    u = url.strip()
    if "jib.co.th/web/product/readProduct/" in u:
        return True
    if "ihavecpu.com/product/" in u and "/product/search" not in u:
        return True
    if "bnn.in.th/th/p/" in u and "?q=" not in u and re.search(r"_[a-z0-9]{5,}$", u.split("?")[0]):
        return True
    if "advice.co.th/product/" in u and "/product/search" not in u and "/product/compare" not in u:
        return True
    return False


def canonical_url(final_url: str, offer_url: Optional[str]) -> str:
    """Prefer the page URL we actually loaded; iHaveCPU's offer URL is the canonical slug."""
    if offer_url and "ihavecpu.com/product/" in offer_url:
        m = re.match(r"(https://ihavecpu\.com/product/\d+)/(.*)", offer_url)
        if m:
            return f"{m.group(1)}/{urllib.parse.quote(m.group(2), safe='()-.')}"
    return final_url.split("#")[0]
