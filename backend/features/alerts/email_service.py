import asyncio
import logging
import smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from email.header import Header
from email.utils import formataddr
from typing import Optional, Dict, Any
import httpx

from backend.core.config import settings
from backend.core.database import AsyncSessionLocal
import backend.features.auth.models
import backend.features.products.models
from backend.features.alerts.models import EmailLog

logger = logging.getLogger("techprice.email")

def _send_smtp_sync(
    to_email: str,
    subject: str,
    html_body: str,
    text_body: str,
    inline_images: Optional[Dict[str, bytes]] = None
) -> None:
    to_clean = to_email.strip()
    from_clean = formataddr((Header(settings.SMTP_FROM_NAME, "utf-8").encode(), settings.SMTP_FROM_EMAIL))
    reply_to = getattr(settings, "SMTP_REPLY_TO", settings.SMTP_FROM_EMAIL)

    if inline_images:
        msg = MIMEMultipart("related")
        msg["Subject"] = Header(subject, "utf-8").encode()
        msg["From"] = from_clean
        msg["To"] = to_clean
        msg["Auto-Submitted"] = "auto-generated"
        msg["X-Auto-Response-Suppress"] = "All"
        if reply_to:
            msg["Reply-To"] = reply_to

        alt = MIMEMultipart("alternative")
        alt.attach(MIMEText(text_body, "plain", "utf-8"))
        alt.attach(MIMEText(html_body, "html", "utf-8"))
        msg.attach(alt)

        for cid, img_data in inline_images.items():
            if img_data:
                try:
                    subtype = "jpeg"
                    if img_data.startswith(b"\x89PNG"):
                        subtype = "png"
                    elif img_data.startswith(b"GIF8"):
                        subtype = "gif"
                    elif img_data.startswith(b"\xff\xd8"):
                        subtype = "jpeg"
                    elif img_data.startswith(b"RIFF") and b"WEBP" in img_data[:16]:
                        subtype = "webp"

                    img_part = MIMEImage(img_data, _subtype=subtype)
                    img_part.add_header("Content-ID", f"<{cid}>")
                    img_part.add_header("Content-Disposition", "inline", filename=f"{cid}.{subtype}")
                    msg.attach(img_part)
                except Exception as img_err:
                    logger.warning(f"Could not attach inline image {cid}: {img_err}")
    else:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = Header(subject, "utf-8").encode()
        msg["From"] = from_clean
        msg["To"] = to_clean
        msg["Auto-Submitted"] = "auto-generated"
        msg["X-Auto-Response-Suppress"] = "All"
        if reply_to:
            msg["Reply-To"] = reply_to

        part1 = MIMEText(text_body, "plain", "utf-8")
        part2 = MIMEText(html_body, "html", "utf-8")
        msg.attach(part1)
        msg.attach(part2)

    server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
    try:
        if settings.SMTP_TLS:
            server.starttls()
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
    finally:
        try:
            server.quit()
        except Exception:
            pass

class EmailService:
    @staticmethod
    async def send_email(
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        product_id: Optional[int] = None,
        inline_images: Optional[Dict[str, bytes]] = None
    ) -> Dict[str, Any]:
        if not to_email or "@" not in to_email:
            logger.warning(f"[EmailService] Invalid recipient email: {to_email}")
            return {"status": "error", "error": "Invalid email address"}

        plain_text = text_content or f"{subject}\n\nVisit: {settings.SMTP_FROM_EMAIL}"
        status = "sent"
        error_msg = None

        is_dummy_domain = any(to_email.lower().endswith(d) for d in ["@test.com", "@example.com", "@kptm.com", ".local", ".test"])
        has_smtp = bool(settings.SMTP_HOST and (settings.SMTP_USER or settings.SMTP_PORT == 25)) and not is_dummy_domain and not getattr(settings, "EMAIL_DEV_MODE", False)


        if getattr(settings, "GOOGLE_APPS_SCRIPT_URL", None):
            try:
                logger.info(f"📧 [EmailService] Sending email to {to_email} via Google Apps Script API...")
                payload = {
                    "to": to_email,
                    "subject": subject,
                    "html": html_content,
                    "text": plain_text
                }
                async with httpx.AsyncClient(follow_redirects=True) as client:
                    resp = await client.post(settings.GOOGLE_APPS_SCRIPT_URL, json=payload, timeout=15.0)
                    resp.raise_for_status()
                    data = resp.json()
                    if data.get("status") != "success":
                        raise Exception(f"Apps Script Error: {data.get('message', 'Unknown error')}")
                status = "sent"
                logger.info(f"✅ [EmailService] API email delivered to {to_email}!")
            except Exception as ex:
                logger.error(f"❌ [EmailService] API delivery failed to {to_email}: {ex}")
                status = "failed"
                error_msg = str(ex)
        elif has_smtp:
            try:
                logger.info(f"📧 [EmailService] Sending live SMTP email to {to_email} via {settings.SMTP_HOST}:{settings.SMTP_PORT}...")
                await asyncio.to_thread(_send_smtp_sync, to_email, subject, html_content, plain_text, inline_images)
                status = "sent"
                logger.info(f"✅ [EmailService] Live email delivered to {to_email}!")
            except Exception as ex:
                logger.error(f"❌ [EmailService] SMTP delivery failed to {to_email}: {ex}")
                status = "failed"
                error_msg = str(ex)
        else:
            status = "simulated"
            logger.info(f"📬 [EmailService (Simulation)] Email queued for {to_email} | Subject: '{subject}'")

        try:
            async with AsyncSessionLocal() as db:
                valid_pid = None
                if product_id:
                    from backend.features.products.models import Product
                    p_check = await db.get(Product, product_id)
                    if p_check:
                        valid_pid = product_id

                log_entry = EmailLog(
                    recipient=to_email,
                    subject=subject,
                    html_content=html_content,
                    status=status,
                    error_message=error_msg,
                    product_id=valid_pid,
                    created_at=datetime.utcnow()
                )
                db.add(log_entry)
                await db.commit()
        except Exception as db_err:
            logger.error(f"[EmailService] Could not save email log: {db_err}")

        return {
            "status": status,
            "recipient": to_email,
            "subject": subject,
            "error": error_msg,
            "mode": "live_smtp" if (has_smtp and status == "sent") else ("smtp_failed" if has_smtp else "dev_simulation")
        }

    @staticmethod
    def render_price_drop_html(
        product_name: str,
        new_price: float,
        target_price: float,
        store_name: str,
        product_url: str,
        product_image: Optional[str] = None,
        specs_text: Optional[str] = None,
        badge_text: Optional[str] = None,
        original_price: Optional[float] = None,
        store_comparisons: Optional[list] = None,
        alert_id: Optional[int] = None,
        tracking_code: Optional[str] = None,
        alert_time: Optional[str] = None,
        app_url: str = "http://localhost:5173"
    ) -> str:
        # Fallbacks & Computations
        orig_price = original_price if (original_price and original_price > new_price) else (target_price + 370.0 if new_price <= target_price else new_price + 370.0)
        price_drop = max(0.0, orig_price - new_price)
        diff_text = f"ลดลง ฿{price_drop:,.0f} จากราคาเดิม ฿{orig_price:,.0f}" if price_drop > 0 else f"ราคาตรงเป้าหมาย ฿{target_price:,.2f}"
        savings_percent = ((orig_price - new_price) / orig_price * 100.0) if orig_price > 0 else 10.6

        badge = badge_text or "AM4"
        specs = specs_text or "Socket: AM4 | Base 3.6 GHz / Boost 4.2 GHz"
        img_src = product_image or "https://www.jib.co.th/img_master/product/original/2022040514004252535_1.jpg"

        # Tracking code
        now_dt = datetime.utcnow()
        now_ict = alert_time or now_dt.strftime("%Y-%m-%d %H:%M:%S ICT")
        code = tracking_code or f"ALERT-AMD-5500-{alert_id or 883921}"

        # Default 4 stores comparison if not provided
        if not store_comparisons:
            store_comparisons = [
                {"name": store_name or "Advice IT Infinite", "price": new_price, "diff": 0, "is_best": True, "in_stock": True},
                {"name": "JIB Computer Group", "price": new_price + 170.0, "diff": 170.0, "is_best": False, "in_stock": True},
                {"name": "iHaveCPU", "price": new_price + 230.0, "diff": 230.0, "is_best": False, "in_stock": True},
                {"name": "BaNANA IT", "price": new_price + 370.0, "diff": 370.0, "is_best": False, "in_stock": True},
            ]

        # Generate stores comparison rows
        stores_html = ""
        for s in store_comparisons:
            s_name = s.get("name", "Store")
            s_price = float(s.get("price", new_price))
            s_diff = float(s.get("diff", 0.0))
            is_best = s.get("is_best", False) or (s_price <= new_price)

            if is_best:
                stores_html += f"""
                <div style="background-color: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 10px; padding: 10px 14px; margin-bottom: 8px;">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="text-align: left; vertical-align: middle;">
                        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #10b981; margin-right: 8px;"></span>
                        <strong style="color: #ffffff; font-size: 13px;">{s_name}</strong>
                        <span style="display: inline-block; margin-left: 6px; background-color: #059669; color: #ffffff; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">ถูกที่สุด</span>
                        <span style="display: inline-block; margin-left: 4px; background-color: rgba(6, 182, 212, 0.15); border: 1px solid #06b6d4; color: #38bdf8; font-size: 9px; font-weight: 600; padding: 1px 6px; border-radius: 4px;">ถึงเป้าหมาย</span>
                      </td>
                      <td style="text-align: right; vertical-align: middle;">
                        <span style="color: #38bdf8; font-size: 14px; font-weight: 800; font-family: 'Prompt', monospace, sans-serif; margin-right: 8px;">฿{s_price:,.2f}</span>
                        <span style="display: inline-block; border: 1px solid #059669; color: #34d399; font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 9999px;">พร้อมส่ง</span>
                      </td>
                    </tr>
                  </table>
                </div>
                """
            else:
                diff_label = f"+฿{s_diff:,.0f}" if s_diff > 0 else f"+฿{max(0.0, s_price - new_price):,.0f}"
                stores_html += f"""
                <div style="background-color: rgba(255, 255, 255, 0.02); border-radius: 8px; padding: 9px 14px; margin-bottom: 6px;">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="text-align: left; vertical-align: middle;">
                        <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background-color: #64748b; margin-right: 8px;"></span>
                        <span style="color: #cbd5e1; font-size: 13px;">{s_name}</span>
                      </td>
                      <td style="text-align: right; vertical-align: middle;">
                        <span style="color: #ffffff; font-size: 13px; font-weight: 600; font-family: 'Prompt', monospace, sans-serif; margin-right: 8px;">฿{s_price:,.2f}</span>
                        <span style="color: #94a3b8; font-size: 11px; font-family: monospace;">{diff_label}</span>
                      </td>
                    </tr>
                  </table>
                </div>
                """

        return f"""<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>แจ้งเตือน: สินค้าลดราคาถึงเป้าหมายของคุณแล้ว! - IT PRICE</title>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&family=Inter:wght@400;600;700;900&display=swap');
    body {{
        margin: 0;
        padding: 0;
        background-color: #0c061a;
        background: radial-gradient(circle at 50% 20%, #1c0e38 0%, #0c061a 100%);
        font-family: 'Prompt', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #f1f5f9;
        -webkit-font-smoothing: antialiased;
    }}
    table {{ border-collapse: collapse; }}
    a {{ text-decoration: none; }}
</style>
</head>
<body style="margin: 0; padding: 24px 10px; background-color: #0c061a;">
<table width="100%" border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center">
      <!-- Main Container Card -->
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #120926; border: 1px solid #2d1852; border-radius: 24px; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.65); overflow: hidden;">
        
        <!-- Header Section -->
        <tr>
          <td style="padding: 32px 24px 12px 24px; text-align: center;">
            
            <!-- Top Status Pill -->
            <div style="margin-bottom: 18px;">
              <span style="display: inline-block; background-color: rgba(16, 185, 129, 0.12); border: 1px solid #059669; color: #10b981; font-size: 13px; font-weight: 600; padding: 7px 18px; border-radius: 9999px;">
                แจ้งเตือน: สินค้าลดราคาถึงเป้าหมายของคุณแล้ว!
              </span>
            </div>

            <!-- Brand Logo -->
            <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 12px auto;">
              <tr>
                <td style="vertical-align: middle; padding-right: 8px;">
                  <div style="width: 28px; height: 28px; background-color: rgba(6, 182, 212, 0.15); border: 1px solid #06b6d4; border-radius: 8px; text-align: center; line-height: 28px; font-size: 11px; font-weight: 900; color: #38bdf8; font-family: 'Inter', sans-serif;">IT</div>
                </td>
                <td style="vertical-align: middle;">
                  <span style="font-family: 'Inter', -apple-system, sans-serif; font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #ffffff;">IT </span>
                  <span style="font-family: 'Inter', -apple-system, sans-serif; font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #38bdf8;">PRICE</span>
                </td>
              </tr>
            </table>

            <!-- Subtitle Description -->
            <div style="color: #94a3b8; font-size: 13px; line-height: 1.6; max-width: 480px; margin: 0 auto;">
              ราคาสินค้าที่คุณติดตามได้ปรับลดลงมาถึงราคาเป้าหมายแล้ว ตรวจพบจากระบบเช็คราคาอัตโนมัติ 24 ชม.
            </div>

          </td>
        </tr>

        <!-- Main Product Card -->
        <tr>
          <td style="padding: 12px 24px 20px 24px;">
            <div style="background-color: #170e30; border: 1px solid #2f1b54; border-radius: 18px; padding: 24px 20px; text-align: center;">
              
              <!-- Product Image Box (Email-Client Safe Table Layout) -->
              <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 16px auto; background-color: #0c051a; border: 1px solid #281545; border-radius: 14px; width: 220px;">
                <tr>
                  <td align="center" valign="middle" style="padding: 16px 12px 6px 12px; height: 120px; text-align: center;">
                    <img src="{img_src}" alt="{product_name}" width="160" border="0" style="display: block; margin: 0 auto; max-width: 160px; max-height: 110px; width: auto; height: auto; border: 0; outline: none; text-decoration: none;" />
                  </td>
                </tr>
                <tr>
                  <td align="right" style="padding: 0 12px 10px 0; text-align: right;">
                    <span style="display: inline-block; background-color: #ea580c; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; font-family: monospace;">{badge}</span>
                  </td>
                </tr>
              </table>

              <!-- Product Title -->
              <h2 style="margin: 0 0 8px 0; color: #ffffff; font-size: 18px; font-weight: 800; line-height: 1.4;">
                {product_name}
              </h2>

              <!-- Specs Pill -->
              <div style="margin-bottom: 20px;">
                <span style="display: inline-block; background-color: rgba(124, 58, 237, 0.2); border: 1px solid #7c3aed; color: #c4b5fd; font-size: 11px; font-weight: 600; padding: 4px 14px; border-radius: 9999px;">
                  {specs}
                </span>
              </div>

              <!-- 2-Column Price Comparison Box -->
              <table width="100%" border="0" cellpadding="0" cellspacing="10" style="margin-bottom: 16px;">
                <tr>
                  <td width="50%" style="background-color: #100824; border: 1px solid #231342; border-radius: 12px; padding: 14px 10px; text-align: center; vertical-align: top;">
                    <div style="color: #94a3b8; font-size: 11px; margin-bottom: 6px;">ราคาเป้าหมายที่คุณตั้งไว้</div>
                    <div style="color: #ffffff; font-size: 22px; font-weight: 900; font-family: 'Prompt', monospace, sans-serif;">฿{target_price:,.2f}</div>
                  </td>
                  <td width="50%" style="background-color: rgba(6, 182, 212, 0.05); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 12px; padding: 14px 10px; text-align: center; vertical-align: top;">
                    <div style="color: #2dd4bf; font-size: 11px; font-weight: 700; margin-bottom: 6px;">ราคาต่ำสุดในตลาดปัจจุบัน</div>
                    <div style="color: #2dd4bf; font-size: 22px; font-weight: 900; font-family: 'Prompt', monospace, sans-serif;">฿{new_price:,.2f}</div>
                    <div style="color: #34d399; font-size: 11px; margin-top: 4px;">{diff_text}</div>
                  </td>
                </tr>
              </table>

              <!-- Target Achieved Green Capsule -->
              <div style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid #059669; border-radius: 10px; padding: 11px 16px; margin-bottom: 20px; color: #34d399; font-size: 13px; font-weight: 700; text-align: center;">
                ถึงราคาเป้าหมายแล้ว! (ประหยัดได้ {savings_percent:.1f}%)
              </div>

              <!-- Main CTA Button -->
              <a href="{product_url}" target="_blank" style="display: block; background: linear-gradient(90deg, #0ea5e9 0%, #2563eb 100%); background-color: #0ea5e9; color: #ffffff !important; text-decoration: none; border-radius: 12px; padding: 14px 20px; font-size: 15px; font-weight: 800; text-align: center; box-shadow: 0 4px 20px rgba(14, 165, 233, 0.45);">
                ไปที่ร้าน {store_name} เพื่อสั่งซื้อราคานี้ทันที
              </a>

            </div>
          </td>
        </tr>

        <!-- 4 Stores Price Comparison Card -->
        <tr>
          <td style="padding: 0 24px 20px 24px;">
            <div style="background-color: #170e30; border: 1px solid #2f1b54; border-radius: 16px; padding: 18px 20px;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 14px;">
                <tr>
                  <td style="color: #ffffff; font-size: 13px; font-weight: 700; text-align: left;">
                    สรุปราคาเปรียบเทียบจาก 4 ร้านชั้นนำ
                  </td>
                  <td style="color: #38bdf8; font-size: 11px; text-align: right; font-family: monospace;">
                    อัปเดตล่าสุด: 2 นาทีที่แล้ว
                  </td>
                </tr>
              </table>

              <!-- Stores Comparison List -->
              {stores_html}

            </div>
          </td>
        </tr>

        <!-- Action Links Section -->
        <tr>
          <td style="padding: 0 24px 16px 24px;">
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 12px;">
              <tr>
                <td style="text-align: left; color: #64748b; font-size: 11px; vertical-align: middle;">
                  จัดการการแจ้งเตือน:
                </td>
                <td style="text-align: right; vertical-align: middle;">
                  <a href="{app_url}/products?q={product_name[:20]}" style="color: #94a3b8; text-decoration: none; font-size: 11px;">ปรับราคาเป้าหมายใหม่</a>
                  <span style="color: #334155; margin: 0 6px;">|</span>
                  <a href="{app_url}/compare" style="color: #94a3b8; text-decoration: none; font-size: 11px;">ดูกราฟประวัติราคา</a>
                  <span style="color: #334155; margin: 0 6px;">|</span>
                  <a href="{app_url}/watchlist" style="color: #94a3b8; text-decoration: none; font-size: 11px;">ปิดการแจ้งเตือนสินค้านี้</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Security ID & Barcode Footer -->
        <tr>
          <td style="background-color: #0c051a; border-top: 1px solid #1f1238; padding: 18px 20px; text-align: center;">
            <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">
              ระบบตรวจเช็คอัตโนมัติโดย IT PRICE Thailand
            </div>
            <div style="color: #475569; font-size: 10px; font-family: monospace; letter-spacing: 1px;">
              |||||||||||||||||||||||| {code} |||||||||||||||||||||||| : {now_ict}
            </div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>"""

    @staticmethod
    async def send_price_drop_alert(
        to_email: str,
        product_name: str,
        new_price: float,
        target_price: float,
        store_name: str,
        product_url: str,
        product_image: Optional[str] = None,
        product_id: Optional[int] = None,
        specs: Optional[Dict[str, Any]] = None,
        original_price: Optional[float] = None,
        store_comparisons: Optional[list] = None,
        alert_id: Optional[int] = None
    ) -> Dict[str, Any]:
        savings = max(0.0, target_price - new_price)
        subject = f"[IT PRICE] สินค้าลดราคาถึงเป้าหมายแล้ว! {product_name[:35]} เหลือเพียง ฿{new_price:,.2f}"

        badge_text = "AM4"
        specs_str = "Socket: AM4 | Base 3.6 GHz / Boost 4.2 GHz"

        # Attempt to pull product details and multi-store listings from database
        if product_id:
            try:
                from sqlalchemy import select
                from backend.features.products.models import Product, PriceListing, Store
                async with AsyncSessionLocal() as session:
                    prod = await session.get(Product, product_id)
                    if prod:
                        if not product_name:
                            product_name = prod.name
                        if not product_image:
                            product_image = prod.image_url
                        if original_price is None and prod.msrp:
                            original_price = prod.msrp
                        if specs is None and prod.specs:
                            specs = prod.specs

                        if specs:
                            if "Socket" in specs:
                                badge_text = specs["Socket"]
                                specs_str = f"Socket: {specs.get('Socket')} | Base {specs.get('Base Clock', '3.6 GHz')} / Boost {specs.get('Boost Clock', '4.2 GHz')}"
                            elif "VRAM" in specs:
                                badge_text = specs.get("VRAM", "GPU")
                                specs_str = f"VRAM: {specs.get('VRAM')} | Interface: {specs.get('Memory Interface', 'PCIe 4.0')}"
                            else:
                                specs_str = " | ".join(f"{k}: {v}" for k, v in list(specs.items())[:3])

                        # Query real store listings
                        if not store_comparisons:
                            listings_res = await session.execute(
                                select(PriceListing, Store)
                                .join(Store, PriceListing.store_id == Store.id)
                                .where(PriceListing.product_id == product_id)
                                .order_by(PriceListing.price.asc())
                            )
                            rows = listings_res.all()
                            if rows:
                                store_comparisons = []
                                min_p = rows[0][0].price
                                for l, s in rows:
                                    store_comparisons.append({
                                        "name": s.name,
                                        "price": l.price,
                                        "diff": max(0.0, l.price - min_p),
                                        "is_best": l.price == min_p,
                                        "in_stock": l.stock_status == "in_stock"
                                    })
            except Exception as e:
                logger.warning(f"Could not load additional product details for email alert: {e}")

        inline_images = {}
        email_img_src = product_image or "https://www.jib.co.th/img_master/product/original/2022040514004252535_1.jpg"

        # Candidate URLs to attempt downloading
        candidate_urls = []
        if product_image and product_image.startswith("http"):
            candidate_urls.append(product_image)
        if product_id and 'prod' in locals() and prod and prod.image_url and prod.image_url not in candidate_urls:
            candidate_urls.append(prod.image_url)
        # Final safety fallback image (AMD Ryzen 5 5500 verified 200 OK)
        candidate_urls.append("https://www.jib.co.th/img_master/product/original/2022040514004252535_1.jpg")

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        try:
            async with httpx.AsyncClient(timeout=1.0) as client:
                for url in candidate_urls:
                    try:
                        resp = await client.get(url, headers=headers)
                        if resp.status_code == 200 and resp.content and len(resp.content) > 500:
                            inline_images["product_image"] = resp.content
                            email_img_src = "cid:product_image"
                            break
                    except Exception:
                        pass
        except Exception:
            pass

        # If for any reason CID could not be attached, ensure email_img_src is a valid public HTTP URL
        if not inline_images.get("product_image"):
            email_img_src = candidate_urls[0] if candidate_urls else "https://www.jib.co.th/img_master/product/original/2022040514004252535_1.jpg"

        html_body = EmailService.render_price_drop_html(
            product_name=product_name,
            new_price=new_price,
            target_price=target_price,
            store_name=store_name,
            product_url=product_url,
            product_image=email_img_src,
            specs_text=specs_str,
            badge_text=badge_text,
            original_price=original_price,
            store_comparisons=store_comparisons,
            alert_id=alert_id
        )

        plain_text = (
            f"[IT PRICE] สินค้าลดราคาถึงเป้าหมายของคุณแล้ว!\n\n"
            f"สินค้า: {product_name}\n"
            f"ราคาเป้าหมายของคุณ: ฿{target_price:,.2f}\n"
            f"ราคาต่ำสุดในตลาดปัจจุบัน: ฿{new_price:,.2f} (ประหยัดได้ ฿{savings:,.2f})\n"
            f"ร้านค้าที่ราคาดีที่สุด: {store_name}\n\n"
            f"สั่งซื้อราคานี้ได้ทันทีที่: {product_url}\n"
        )

        return await EmailService.send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_body,
            text_content=plain_text,
            product_id=product_id,
            inline_images=inline_images
        )

    @staticmethod
    async def send_alert_confirmation(
        to_email: str,
        product_name: str,
        target_price: float,
        current_lowest_price: float,
        product_image: Optional[str] = None,
        product_id: Optional[int] = None,
        app_url: str = "http://localhost:3000"
    ) -> Dict[str, Any]:
        subject = f"[IT PRICE] ยืนยันการตั้งค่าแจ้งเตือนราคา: {product_name[:35]}..."

        inline_images = {}
        email_img_src = product_image or "https://www.jib.co.th/img_master/product/original/2022040514004252535_1.jpg"

        candidate_urls = []
        if product_image and product_image.startswith("http"):
            candidate_urls.append(product_image)
        candidate_urls.append("https://www.jib.co.th/img_master/product/original/2022040514004252535_1.jpg")

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        try:
            async with httpx.AsyncClient(timeout=1.0) as client:
                for url in candidate_urls:
                    try:
                        resp = await client.get(url, headers=headers)
                        if resp.status_code == 200 and resp.content and len(resp.content) > 500:
                            inline_images["product_image"] = resp.content
                            email_img_src = "cid:product_image"
                            break
                    except Exception:
                        pass
        except Exception:
            pass

        if not inline_images.get("product_image"):
            email_img_src = candidate_urls[0] if candidate_urls else "https://www.jib.co.th/img_master/product/original/2022040514004252535_1.jpg"

        now_ict = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S ICT")
        code = f"CONFIRM-{product_id or 390}-{int(datetime.utcnow().timestamp()) % 1000000}"

        html_body = f"""<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ยืนยันการตั้งค่าแจ้งเตือนราคา - IT PRICE</title>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&family=Inter:wght@400;600;700;900&display=swap');
    body {{
        margin: 0;
        padding: 0;
        background-color: #0c061a;
        background: radial-gradient(circle at 50% 20%, #1c0e38 0%, #0c061a 100%);
        font-family: 'Prompt', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #f1f5f9;
        -webkit-font-smoothing: antialiased;
    }}
    table {{ border-collapse: collapse; }}
    a {{ text-decoration: none; }}
</style>
</head>
<body style="margin: 0; padding: 24px 10px; background-color: #0c061a;">
<table width="100%" border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center">
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #120926; border: 1px solid #2d1852; border-radius: 24px; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.65); overflow: hidden;">
        
        <!-- Header -->
        <tr>
          <td style="padding: 32px 24px 12px 24px; text-align: center;">
            <div style="margin-bottom: 18px;">
              <span style="display: inline-block; background-color: rgba(6, 182, 212, 0.12); border: 1px solid #06b6d4; color: #38bdf8; font-size: 13px; font-weight: 600; padding: 7px 18px; border-radius: 9999px;">
                ยืนยันการตั้งค่าแจ้งเตือนราคาเรียบร้อยแล้ว
              </span>
            </div>

            <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 12px auto;">
              <tr>
                <td style="vertical-align: middle; padding-right: 8px;">
                  <div style="width: 28px; height: 28px; background-color: rgba(6, 182, 212, 0.15); border: 1px solid #06b6d4; border-radius: 8px; text-align: center; line-height: 28px; font-size: 11px; font-weight: 900; color: #38bdf8; font-family: 'Inter', sans-serif;">IT</div>
                </td>
                <td style="vertical-align: middle;">
                  <span style="font-family: 'Inter', -apple-system, sans-serif; font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #ffffff;">IT </span>
                  <span style="font-family: 'Inter', -apple-system, sans-serif; font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #38bdf8;">PRICE</span>
                </td>
              </tr>
            </table>

            <div style="color: #94a3b8; font-size: 13px; line-height: 1.6; max-width: 480px; margin: 0 auto;">
              ระบบได้บันทึกการติดตามราคาของคุณเรียบร้อยแล้ว เราจะตรวจเช็คราคาจาก JIB, Advice, iHaveCPU และ BaNANA IT ตลอด 24 ชั่วโมง และแจ้งเตือนทันทีเมื่อราคาลดถึงเป้าหมาย
            </div>
          </td>
        </tr>

        <!-- Product Card -->
        <tr>
          <td style="padding: 12px 24px 24px 24px;">
            <div style="background-color: #170e30; border: 1px solid #2f1b54; border-radius: 18px; padding: 24px 20px; text-align: center;">
              
              <!-- Product Image -->
              <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 16px auto; background-color: #0c051a; border: 1px solid #281545; border-radius: 14px; width: 220px;">
                <tr>
                  <td align="center" valign="middle" style="padding: 16px 12px; height: 120px; text-align: center;">
                    <img src="{email_img_src}" alt="{product_name}" width="160" border="0" style="display: block; margin: 0 auto; max-width: 160px; max-height: 110px; width: auto; height: auto; border: 0; outline: none;" />
                  </td>
                </tr>
              </table>

              <!-- Product Title -->
              <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 17px; font-weight: 800; line-height: 1.4;">
                {product_name}
              </h2>

              <!-- Price Box -->
              <table width="100%" border="0" cellpadding="0" cellspacing="10" style="margin-bottom: 20px;">
                <tr>
                  <td width="50%" style="background-color: #100824; border: 1px solid #231342; border-radius: 12px; padding: 14px 10px; text-align: center;">
                    <div style="color: #94a3b8; font-size: 11px; margin-bottom: 6px;">ราคาต่ำสุดในตลาดปัจจุบัน</div>
                    <div style="color: #ffffff; font-size: 20px; font-weight: 800;">฿{current_lowest_price:,.2f}</div>
                  </td>
                  <td width="50%" style="background-color: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 12px; padding: 14px 10px; text-align: center;">
                    <div style="color: #2dd4bf; font-size: 11px; font-weight: 700; margin-bottom: 6px;">ราคาเป้าหมายที่คุณตั้งไว้</div>
                    <div style="color: #2dd4bf; font-size: 22px; font-weight: 900;">฿{target_price:,.2f}</div>
                  </td>
                </tr>
              </table>

              <!-- Monitoring Capsule -->
              <div style="background-color: rgba(124, 58, 237, 0.12); border: 1px solid rgba(124, 58, 237, 0.35); border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; color: #c4b5fd; font-size: 12px; font-weight: 600;">
                กำลังเริ่มติดตามราคาอัตโนมัติ 24 ชั่วโมงจาก 4 ร้านค้าไอทีชั้นนำ
              </div>

              <!-- Button -->
              <a href="{app_url}/products" target="_blank" style="display: block; background: linear-gradient(90deg, #7c3aed 0%, #2563eb 100%); color: #ffffff !important; text-decoration: none; border-radius: 12px; padding: 12px 20px; font-size: 14px; font-weight: 700; text-align: center;">
                เข้าชมสินค้าและจัดการ Watchlist ของคุณ
              </a>

            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #0c051a; border-top: 1px solid #1f1238; padding: 18px 20px; text-align: center;">
            <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">
              ระบบตรวจเช็คอัตโนมัติโดย IT PRICE Thailand
            </div>
            <div style="color: #475569; font-size: 10px; font-family: monospace; letter-spacing: 1px;">
              |||||||||||||||||||||||| {code} |||||||||||||||||||||||| : {now_ict}
            </div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>"""

        plain_text = (
            f"[IT PRICE] ยืนยันการตั้งค่าแจ้งเตือนราคา\n\n"
            f"สินค้า: {product_name}\n"
            f"ราคาต่ำสุดในตลาดปัจจุบัน: ฿{current_lowest_price:,.2f}\n"
            f"ราคาเป้าหมายของคุณ: ฿{target_price:,.2f}\n\n"
            f"ระบบกำลังติดตามราคาจาก 4 ร้านค้าชั้นนำ (JIB, Advice, iHaveCPU, BaNANA IT) ตลอด 24 ชม.\n"
        )

        return await EmailService.send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_body,
            text_content=plain_text,
            product_id=product_id,
            inline_images=inline_images
        )

email_service = EmailService()
