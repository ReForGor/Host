# 🏗️ สถาปัตยกรรม 3-Tier, การประยุกต์ใช้ AI, ฐานข้อมูล และบันทึกการปรับปรุงระบบ (IT PRICE)

เอกสารฉบับนี้รวบรวมเนื้อหาการสนทนาและการวิเคราะห์เชิงลึกตามที่ได้ตกลงกันไว้ ครอบคลุม:
1. **หลักการ Single Source of Truth & Data Persistence (การดึงข้อมูลจาก Database มาแสดงผลและเปรียบเทียบ)**
2. **การนำ AI มาใช้ในแต่ละส่วนของสถาปัตยกรรม 3-Tier (พร้อมโมเดลและ Prompt สำหรับแต่ละ Tier)**
3. **แผนผังความสัมพันธ์ Database: ตารางไหนใช้ในส่วนไหน & การดึงมาวิเคราะห์ย้อนหลัง**
4. **สรุปการแก้ไขจุดบกพร่องตามบันทึกการทำงาน (Action Items Implemented)**

---

## 1. หลักการ Single Source of Truth & Data Persistence

> **หลักการสำคัญ:** ไม่ว่าจะนำข้อมูลในส่วนใดออกมาแสดงผลบนหน้าเว็บ (Frontend) จะต้องดึงมาจากฐานข้อมูล **PostgreSQL** เสมอ (ห้ามใช้ Mock data หรือ Hardcode ลอยๆ) เพื่อให้ระบบมีข้อมูลจริงอ้างอิง และมีข้อมูลประวัติเก่าเก็บไว้เปรียบเทียบในอนาคต

### ประโยชน์เชิงโครงสร้าง:
1. **Historical Traceability (การตรวจสอบย้อนหลัง):** ราคาสินค้าแต่ละวันจากแต่ละร้าน (Advice, JIB, BaNANA, iHaveCPU) จะถูกบันทึกลงตาราง `price_history` อย่างต่อเนื่อง ทำให้สามารถสร้างกราฟราคา และดูราคาต่ำสุดตลอดกาล (All-Time Low) ได้จริง
2. **Consistency (ความสอดคล้องของข้อมูล):** หน้าแรก (Home), หน้ารวมสินค้า (All Products), หน้าดีลเด็ด (Deals), และหน้าเปรียบเทียบ (Compare) อ้างอิงชุดข้อมูลเดียวกันเสมอ
3. **AI Grounding:** เมื่อส่งข้อมูลให้ AI วิเคราะห์ ข้อมูลทั้งหมดจะมีหลักฐานอ้างอิงจากฐานข้อมูลจริง ไม่เกิดปัญหา AI คิดไปเอง (Hallucination)

---

## 2. การประยุกต์ใช้ AI ในสถาปัตยกรรม 3-Tier (Architecture & Prompts)

```
┌─────────────────────────────────────────────────────────────┐
│  Tier 1: Presentation Tier (Frontend: React + TailwindCSS)  │
│  • AI Smart Spec Summary & Comparison Verdict               │
│  • Natural Language Search Filtering                        │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON API
┌──────────────────────────────▼──────────────────────────────┐
│  Tier 2: Application Tier (Backend: FastAPI + Scraper)      │
│  • AI Product Entity Resolution (จับคู่ชื่อสินค้าต่างร้าน)     │
│  • Specs Extraction into JSON Schema                        │
│  • Price Anomaly Detection (ตรวจจับราคาผิดพลาด)             │
└──────────────────────────────┬──────────────────────────────┘
                               │ AsyncPG / SQLAlchemy
┌──────────────────────────────▼──────────────────────────────┐
│  Tier 3: Data Tier (Database: PostgreSQL / Neon Cloud)      │
│  • Time-Series Price Trend Analysis (วิเคราะห์แนวโน้มราคา)   │
│  • Best-Time-to-Buy Probability Scoring                     │
│  • Audit Trail & Historical Comparison Storage              │
└─────────────────────────────────────────────────────────────┘
```

### 🔹 Tier 1: Presentation Tier (Frontend - หน้าบ้าน)
* **โมเดล AI ที่แนะนำ:** `Gemini 1.5 Flash` หรือ `GPT-4o-mini` (ความเร็วสูง ประมวลผลเสร็จในเสี้ยววินาที)
* **หน้าที่ของ AI:**
  1. **Smart Hardware Summary:** สรุปสเปกและจุดเด่นของอุปกรณ์ให้อ่านเข้าใจง่ายสำหรับผู้ใช้งานทั่วไปใน 2-3 บรรทัด
  2. **Comparison Verdict:** เมื่อผู้ใช้กดเปรียบเทียบสินค้า 2-4 ชิ้น AI จะให้บทสรุปว่าชิ้นไหนเหมาะกับงานประเภทใด (เช่น เล่นเกม vs ตัดต่อกราฟิก)
  3. **Natural Language Query:** แปลงคำค้นหาภาษาพูดของผู้ใช้ (เช่น *"อยากได้การ์ดจอเล่น Cyberpunk งบไม่เกิน 15000"*) ให้กลายเป็นตัวกรองหมวดหมู่และช่วงราคา
* **ตัวอย่าง Prompt (Frontend Assistant):**
  ```text
  "คุณเป็นผู้ช่วยวิเคราะห์ฮาร์ดแวร์คอมพิวเตอร์ จงนำข้อมูลสเปกและราคาปัจจุบันของสินค้า {product_name} 
  ต่อไปนี้: {specs_json} ราคาต่ำสุด: {lowest_price} บาท
  มาสรุปจุดเด่น ความคุ้มค่า และการใช้งานที่เหมาะสมที่สุด เป็นภาษาไทยสั้นกระชับไม่เกิน 3 บรรทัด"
  ```

---

### 🔹 Tier 2: Application Tier (Backend - ตรรกะระบบ & Web Scraper)
* **โมเดล AI ที่แนะนำ:** `Gemini 1.5 Pro` หรือ Sentence Transformers (Embedding)
* **หน้าที่ของ AI:**
  1. **Product Entity Resolution (จับคู่สินค้าอัตโนมัติ):** แต่ละร้านค้าตั้งชื่อสินค้าไม่เหมือนกัน เช่น:
     - Advice: `ASUS DUAL-RTX4060-O8G-EVO`
     - JIB: `VGA ASUS DUAL GEFORCE RTX 4060 EVO OC EDITION - 8GB GDDR6`
     - AI จะทำหน้าที่คำนวณความเหมือนและจับคู่ให้เข้ามาอยู่ภายใต้ `Product.id` ตัวเดียวกันใน Master Catalog
  2. **Specs Structuring:** แปลงข้อความสเปกที่เป็นก้อน Text ดิบจากร้านค้า ให้กลายเป็น JSON Key-Value มาตรฐาน (`vram`, `tdp`, `cores_threads`, `socket`)
  3. **Price Anomaly Detection:** ตรวจสอบความถูกต้องของราคาที่ Scrape เข้ามา ป้องกันกรณีราคาติดลบ เป็นศูนย์ หรือลดราคาผิดธรรมชาติ
* **ตัวอย่าง Prompt (Backend Entity Resolver):**
  ```text
  "จงวิเคราะห์ชื่อสินค้า: '{raw_scraped_title}' จากร้าน {store_name} 
  เปรียบเทียบกับรายการ Master Catalog สินค้าในฐานข้อมูล: {master_catalog_sample}
  แล้วระบุว่าตรงกับ Master Product ID ใดในรูปแบบ JSON:
  {
    "matched_product_id": 387,
    "confidence_score": 0.98,
    "reason": "Exact match for Ryzen 7 7800X3D"
  }
  หากไม่ตรงกับสินค้าใด ให้ตอบ matched_product_id: null"
  ```

---

### 🔹 Tier 3: Data Tier (Database - วิเคราะห์เชิงสถิติจากข้อมูลที่เก็บไว้)
* **โมเดล / เทคนิค:** Time-Series Statistical Analysis + AI Insights
* **หน้าที่ของ AI:**
  1. **Price Trend Prediction:** ดึงแถวข้อมูลทั้งหมดจากตาราง `price_history` มาคำนวณแนวโน้มราคา (Moving Average, 30-Day All-Time Low)
  2. **Best Time to Buy:** วิเคราะห์และบอกผู้ใช้ว่า *"ราคานี้ปรับลดลงมาต่ำสุดในรอบ 3 เดือน แนะนำให้ซื้อทันที"* หรือ *"ราคายังปรับขึ้นชั่วคราว แนะนำให้ตั้งเตือนราคารอก่อน"*
* **ตัวอย่าง Prompt (Data Analysis Insights):**
  ```text
  "นำข้อมูลประวัติการปรับเปลี่ยนราคาของสินค้า ID {product_id} จากตาราง price_history ย้อนหลัง 60 วัน:
  {historical_prices_csv}
  จงคำนวณ:
  1. ราคาต่ำสุดตลอดกาล (All-time Low)
  2. อัตราความผันผวนของราคา (Volatility)
  3. ประเมินว่าขณะนี้เป็นจังหวะที่ 'ควรซื้อทันที' หรือ 'ควรรอดูราคา' พร้อมให้เหตุผลสนับสนุนเชิงสถิติ"
  ```

---

## 3. แผนผัง Database: ตารางไหนใช้ในส่วนไหน & ดึงมาวิเคราะห์ย้อนหลัง

| ชื่อตาราง (Table Name) | ฟิลด์สำคัญที่จัดเก็บ | ฟีเจอร์ที่นำไปใช้งาน (Front & Back) | การนำมาใช้วิเคราะห์ / ดูย้อนหลัง |
| :--- | :--- | :--- | :--- |
| **`users`** | `id`, `email`, `username`, `hashed_password`, `is_admin`, `created_at` | • ระบบ Authentication, สมัครสมาชิก, เข้าสู่ระบบ<br>• จัดการสิทธิ์ Admin Dashboard | ตรวจสอบประวัติบัญชีผู้ใช้งาน และการจำกัดสิทธิ์ |
| **`products`** | `id`, `name`, `slug`, `category`, `brand`, `model_no`, `msrp`, `specs`, `image_url` | • แสดงหน้ารายการสินค้า (`/products`), ค้นหา (`/search`)<br>• หมวดหมู่และตัวกรองแบรนด์ | ข้อมูลหลัก (Master Catalog) ในการเปรียบเทียบสเปก |
| **`stores`** | `id`, `name`, `slug`, `base_url`, `logo_url`, `color` | • โลโก้และชื่อร้านค้า (Advice, JIB, BaNANA, iHaveCPU) | ติดตามสถิติร้านค้าที่ให้ราคาถูกที่สุดบ่อยที่สุด |
| **`price_listings`** | `product_id`, `store_id`, `price`, `original_price`, `product_url`, `is_available` | • เปรียบเทียบราคาปัจจุบันระหว่าง 4 ร้าน<br>• ปุ่มกดไปสั่งซื้อที่ร้านค้าจริง (`Buy Now`) | ตรวจสอบส่วนต่างราคาในตลาดปัจจุบัน (Price Spread) |
| **`price_history`** *(หัวใจการเปรียบเทียบ)* | `product_id`, `store_id`, `price`, `timestamp` | • **พลอตกราฟราคาใน `PriceChartModal`**<br>• ป้ายราคาต่ำสุดในรอบ 7 วัน / 30 วัน | **ดึงให้ AI วิเคราะห์แนวโน้มราคาในอดีต** เพื่อแนะนำจังหวะซื้อที่คุ้มค่าที่สุด |
| **`price_alerts`** | `product_id`, `user_id`, `email`, `target_price`, `is_active` | • ระบบเฝ้าราคาและส่งอีเมลแจ้งเตือนเมื่อราคาลดถึงเป้า | ตรวจสอบประวัติเป้าหมายราคาที่ผู้ใช้สนใจมากที่สุด |
| **`email_logs`** | `recipient`, `product_id`, `status`, `from_email`, `created_at` | • บันทึกหลักฐานการส่งอีเมลผ่าน Brevo API | ตรวจสอบย้อนหลัง (Audit Trail) ว่าส่งเตือนวันไหน เวลาใด |
| **`visitor_records`** | `session_id`, `ip_address`, `user_agent`, `path`, `user_id`, `last_seen_at` | • **บันทึกเมื่อมีคนกด Login หรือเข้าชมเว็บ**<br>• แสดงผลใน Admin Analytics Dashboard | วิเคราะห์พฤติกรรมผู้ใช้งาน และสถิติผู้เข้าชมเว็บไซต์ |
| **`system_metrics`** | `metric_key`, `metric_value`, `updated_at` | • บันทึกยอดเปิดดูหน้ารวม (`total_pageviews`)<br>• บันทึกยอดการเข้าสู่ระบบรวม (`total_logins`) | ดูสถิติการเติบโตของแพลตฟอร์มย้อนหลัง |

---

## 4. สรุปผลการแก้ไขโค้ดตามข้อกำหนด (Action Items Implemented)

### ✅ 1. เมื่อมีคนกด Login ให้บันทึกข้อมูลไว้ (User Login Logging)
- **ไฟล์ที่แก้ไข:** [`backend/features/auth/router.py`](file:///d:/Newfolder/backend/features/auth/router.py)
- **สิ่งที่ทำ:** เพิ่มโค้ดดักจับเมื่อ Login สำเร็จ ให้บันทึกแถวใหม่ลงใน `visitor_records` พร้อมระบุ `user_id`, `username`, `email`, `ip_address` และอัปเดตตัวนับ `total_logins` ใน `system_metrics` ทันที

### ✅ 2. แก้ไขระบบแบ่งหน้า: ปรับเป็น 16 ชิ้นต่อ 1 หน้า และทำปุ่ม 1 2 3 ให้กดได้จริง
- **ไฟล์ที่แก้ไข:** [`frontend/src/pages/AllProductsPage.jsx`](file:///d:/Newfolder/frontend/src/pages/AllProductsPage.jsx)
- **สิ่งที่ทำ:**
  - เปลี่ยนจากการแสดงผลสินค้าก้อนใหญ่ทั้งหมดรวดเดียว มาเป็น **16 ชิ้นต่อ 1 หน้า** (4 แถว x 4 คอลัมน์) ตามคำแนะนำในโน้ต
  - เชื่อมโยง State `currentPage`, `totalPages`, และ `jumpPageInput`
  - ทำปุ่มตัวเลขหน้า **1, 2, 3...** และปุ่ม `|<`, `<`, `>`, `>|` ให้กดเปลี่ยนหน้าได้จริงแบบ Dynamic
  - เมื่อเปลี่ยนตัวกรอง (หมวดหมู่, แบรนด์, หรือคำค้นหา) ระบบจะรีเซ็ตกลับไปหน้า 1 อัตโนมัติ

### ✅ 3. การบอกค่าทั้งหมด (Total Items Count)
- **ไฟล์ที่แก้ไข:** [`frontend/src/pages/AllProductsPage.jsx`](file:///d:/Newfolder/frontend/src/pages/AllProductsPage.jsx)
- **สิ่งที่ทำ:** แสดงข้อความบอกจำนวนชัดเจน เช่น:
  - *ภาษาไทย:* `แสดงรายการที่ 1 - 16 จากทั้งหมด 34 รายการ (หน้า 1 จาก 3)`
  - *ภาษาอังกฤษ:* `Showing 1 - 16 of 34 items (Page 1 of 3)`

### ✅ 4. หน้าเปรียบเทียบสินค้า (Compare Page) ที่ใช้งานไม่ได้
- **ไฟล์ที่แก้ไข:** [`frontend/src/pages/ComparePage.jsx`](file:///d:/Newfolder/frontend/src/pages/ComparePage.jsx)
- **สาเหตุของปัญหาเดิม:** มีเงื่อนไข `ids.every(id => id.toString().length < 4)` ทำให้สินค้าจริงในฐานข้อมูลที่มี ID สั้น (เช่น 1, 2, 387) ถูกมองว่าเป็น Mock data ส่งผลให้ไม่ยอมเรียก API `/api/compare` ของ Backend และตาราง Spec Matrix มีการฮาร์ดโค้ดเป็น Ryzen 7 7800X3D กับ Intel 14700K ไว้
- **สิ่งที่แก้:**
  - นำเงื่อนไขที่ปิดกั้นออก และให้เรียก API `/api/compare` ของ Backend สำหรับสินค้าจริงทุกชิ้น
  - ปรับตารางสเปก (Spec Comparison Matrix) ให้ดึงข้อมูลสเปกจาก `compareData.spec_matrix` ของ Backend มาแสดงผลแบบ Dynamic ไม่ว่าจะเลือกเปรียบเทียบสินค้าชิ้นใดในระบบ

### ✅ 5. หน้า Hot Deal ปรับปรุงให้ดึงส่วนลดจากราคาจริง
- **ไฟล์ที่แก้ไข:** [`backend/features/products/service.py`](file:///d:/Newfolder/backend/features/products/service.py) และ [`frontend/src/pages/DealsPage.jsx`](file:///d:/Newfolder/frontend/src/pages/DealsPage.jsx)
- **สิ่งที่ทำ:**
  - เพิ่มการคำนวณส่วนลดเทียบกับราคาเปิดตัว (`prod.msrp`) และส่วนต่างราคาของร้านค้าที่แพงที่สุด (`highest_p - lowest_p`) ทำให้สินค้าที่มีการปรับลดราคามีค่า `max_discount_percent` ถูกต้องจริง
  - ปรับปรุงการโหลดข้อมูลในหน้า DealsPage ให้รองรับทั้งแบบ Array และ Items Object กรองเฉพาะสินค้าที่มีราคาขายจริง
