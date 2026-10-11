# 📋 สรุปสถานะภาพรวมของโปรเจกต์และโครงสร้างโค้ดทั้งหมด (Project Status & Codebase Reference)

เอกสารฉบับนี้สรุปสถานะปัจจุบันของระบบ ฮาร์ดแวร์/ซอฟต์แวร์สแต็ก และรายละเอียดการทำงานของไฟล์โค้ดทุกไฟล์ในโปรเจกต์อย่างเป็นระบบ

---

## 📌 1. สถานะภาพรวมของโปรเจกต์ปัจจุบัน (Current Project Status)

ระบบเป็น **เว็บแอปพลิเคชันเปรียบเทียบราคาและวิเคราะห์สเปกอุปกรณ์ไอทีแบบเรียลไทม์ (Hardware Price Comparison & Analytics Platform)** ที่มีความสมบูรณ์พร้อมใช้งาน โดยมีสถานะการทำงานในแต่ละส่วนดังนี้:

| ฟังก์ชันงาน | สถานะการทำงาน | รายละเอียดการทำงาน |
| :--- | :---: | :--- |
| **Responsive Design ทุกหน้าจอ** | 🟢 สมบูรณ์ 100% | รองรับทั้งมือถือ (Mobile: iPhone, Android), แท็บเล็ต (iPad, Galaxy Tab), แล็ปท็อป และจอคอมพิวเตอร์ขนาดใหญ่ (Desktop / 4K) |
| **ระบบแบ่งหน้า (Pagination)** | 🟢 สมบูรณ์ 100% | ปรับเป็น **16 ชิ้นต่อหน้า** ตามข้อเสนอแนะ, ปุ่มเลขหน้า 1, 2, 3 และ Next/Prev ใช้งานได้จริงและไฮไลต์หน้าปัจจุบัน |
| **ระบบเปรียบเทียบสินค้า (Comparison)** | 🟢 สมบูรณ์ 100% | ข้อมูลสเปกและราคาดึงตรงตามคู่สินค้าที่ผู้ใช้เลือก พร้อมแท็กสี ไฮไลต์ความต่าง และ AI Verdict |
| **ราคาสินค้าและกราฟย้อนหลัง** | 🟢 สมบูรณ์ 100% | กราฟราคาย้อนหลังจากตาราง `price_history` วาดด้วย Chart.js แบบเรียลไทม์ตามช่วงเวลา 7d, 30d, 90d, All |
| **ระบบ Authentication & User Log** | 🟢 สมบูรณ์ 100% | มีระบบ Sign-In / Sign-Up ด้วย JWT Token และบันทึกประวัติผู้ใช้งานเมื่อมีการกด Log in ลงตาราง `visitor_records` |
| **หน้า Hot Deals & Price Drops** | 🟢 สมบูรณ์ 100% | แสดงสินค้าราคาลดแรง เรียงลำดับตามเปอร์เซ็นต์ส่วนลดเทียบกับราคาเปิดตัวหรือราคาเฉลี่ย |
| **ระบบ Auto-Sync ราคาสดจริง** | 🟢 สมบูรณ์ 100% | มี Endpoint `/api/products/{id}/sync` วิ่งไปดึง schema.org JSON-LD จากหน้าร้านค้าสดๆ (Advice 535.-, JIB, BaNANA, iHaveCPU) อัปเดตราคาและสต็อก (`in_stock` / `out_of_stock`) ทันที พร้อมปุ่ม Live Sync บนหน้าเว็บ |
| **หมวดหมู่สินค้า 12 Categories** | 🟢 สมบูรณ์ 100% | มีระบบ Category Alias Normalization รองรับคลิกทุกหมวดหมู่ (เคส, ระบายความร้อน, อุปกรณ์เสริม, มอนิเตอร์) ดึงสินค้าจริงจากฐานข้อมูลตรง 100% |
| **ฐานข้อมูลคลาวด์ (Cloud Database)** | 🟢 ออนไลน์ 100% | เชื่อมต่อกับ **PostgreSQL บน Neon Cloud** ด้วย Async Session Pool |

---

## 📁 2. โครงสร้างโฟลเดอร์ของโปรเจกต์ (Codebase Directory Tree)

```text
d:\Newfolder\
├── backend\
│   ├── core\                  # การตั้งค่าหลัก ความปลอดภัย และการเชื่อมต่อฐานข้อมูล
│   │   ├── config.py          # โหลด Environment variables (.env)
│   │   ├── database.py        # SQLAlchemy Async engine และ session factory
│   │   ├── security.py        # การ Hash รหัสผ่าน (Bcrypt) และการสร้าง/ถอดรหัส JWT Token
│   │   └── dependencies.py    # FastAPI Dependency Injection (เช่น get_current_user)
│   │
│   ├── features\              # โครงสร้างแบบ Feature-based (แยกตามฟังก์ชันธุรกิจ)
│   │   ├── auth\              # ระบบยืนยันตัวตนและการจัดการผู้ใช้งาน
│   │   │   ├── router.py      # Endpoints: /api/v1/auth (login, register, me)
│   │   │   ├── schemas.py     # Pydantic Schemas สำหรับ Request/Response ของ Auth
│   │   │   ├── service.py     # Business logic ของการเข้าสู่ระบบและบันทึก visitor_records
│   │   │   └── models.py      # SQLAlchemy Model สำหรับตาราง users, visitor_records
│   │   │
│   │   ├── products\          # ระบบสินค้า การค้นหา และการเปรียบเทียบ
│   │   │   ├── router.py      # Endpoints: /api/v1/products (list, detail, compare, search)
│   │   │   ├── schemas.py     # Pydantic Schemas สำหรับ Product, Specs, Comparison
│   │   │   ├── service.py     # ตรรกะการดึงสินค้า, การแบ่งหน้า, การสร้าง AI comparison verdict
│   │   │   └── models.py      # SQLAlchemy Model สำหรับตาราง products, stores, price_listings
│   │   │
│   │   ├── price_history\     # ระบบประวัติราคาและสถิติ
│   │   │   ├── router.py      # Endpoints: /api/v1/products/{id}/price-history
│   │   │   ├── schemas.py     # Schemas สำหรับข้อมูล Time-Series และ Trend Stats
│   │   │   ├── service.py     # คำนวณ All-time low, ราคาเฉลี่ย, แนวโน้ม และความผันผวน
│   │   │   └── models.py      # SQLAlchemy Model สำหรับตาราง price_history
│   │   │
│   │   ├── alerts\            # ระบบตั้งเตือนราคาลด
│   │   │   ├── router.py      # Endpoints: /api/v1/alerts (create, list, delete)
│   │   │   ├── schemas.py     # Schemas สำหรับการตั้งเป้าหมายราคา
│   │   │   ├── service.py     # ตรรกะการตรวจสอบเงื่อนไขราคา และการเรียกใช้ Email Service
│   │   │   └── models.py      # SQLAlchemy Model สำหรับตาราง price_alerts
│   │   │
│   │   └── analytics\         # ระบบบันทึกสถิติและการคลิก
│   │       ├── router.py      # Endpoints: /api/v1/analytics/click (outbound click tracking)
│   │       ├── schemas.py     # Schemas สำหรับ Outbound Log
│   │       ├── service.py     # บันทึกการคลิกไปร้านค้า Advice, JIB, BaNANA, iHaveCPU
│   │       └── models.py      # SQLAlchemy Model สำหรับตาราง outbound_click_logs
│   │
│   ├── integrations\          # บริการเชื่อมต่อภายนอก (Third-Party Services)
│   │   ├── email_brevo.py     # เชื่อมต่อกับ Brevo REST API v3 เพื่อส่ง Transactional Email
│   │   └── ai_engine.py       # Wrapper สำหรับเรียกใช้งาน Gemini / AI Prompt Engine
│   │
│   ├── scrapers\              # โมดูลกวาดข้อมูลราคาจากร้านค้าไอที
│   │   ├── advice_scraper.py  # ดึงข้อมูลจาก Advice
│   │   ├── jib_scraper.py     # ดึงข้อมูลจาก JIB
│   │   ├── banana_scraper.py  # ดึงข้อมูลจาก BaNANA
│   │   └── ihavecpu_scraper.py# ดึงข้อมูลจาก iHaveCPU
│   │
│   └── main.py                # จุดเริ่มต้น FastAPI App, ตั้งค่า CORS, และลงทะเบียน Routers
│
├── frontend\                  # ส่วนติดต่อผู้ใช้ (Presentation Tier)
│   ├── index.html             # โครงสร้างหน้าเว็บหลัก (Single Page / Multi-Section App)
│   ├── css\
│   │   ├── style.css          # CSS หลัก: Color Palette, Grid, Cards, Dark Mode
│   │   └── responsive.css     # Media Queries ครอบคลุม Mobile, Tablet, Laptop, 4K
│   │
│   ├── js\
│   │   ├── main.js            # Entry Point ควบคุมการโหลดหน้าเว็บและ Event Listeners
│   │   ├── api\
│   │   │   └── client.js      # Axios Client: กำหนด Base URL และแทรก JWT Token อัตโนมัติ
│   │   ├── components\
│   │   │   ├── product-card.js# สร้างการ์ดแสดงสินค้า แสดงป้ายราคาต่ำสุดและสัญลักษณ์ AI
│   │   │   ├── chart-view.js  # จัดการสร้างและอัปเดตกราฟราคาด้วย Chart.js
│   │   │   ├── compare-modal.js# ควบคุมตารางเปรียบเทียบสเปกและกล่อง AI Verdict
│   │   │   ├── auth-modal.js  # จัดการฟอร์ม Login/Register และจัดเก็บ Token ใน LocalStorage
│   │   │   ├── alert-modal.js # ฟอร์มตั้งเตือนราคาเมื่อราคาลด
│   │   │   └── pagination.js  # จัดการปุ่มหน้า 1, 2, 3 และการแสดงผล 16 ชิ้นต่อหน้า
│   │   └── utils\
│   │       ├── formatters.js  # ฟังก์ชันจัดรูปแบบตัวเลขราคาบาท (เช่น 24,900.-) และวันที่
│   │       └── storage.js     # ฟังก์ชันจัดการ State ใน LocalStorage / SessionStorage
│   │
│   └── assets\                # รูปภาพ โลโก้ และไอคอนต่างๆ
│       ├── images\            # รูปภาพสินค้าและแบนเนอร์
│       └── icons\             # โลโก้ร้านค้า (Advice, JIB, BaNANA, iHaveCPU)
│
├── PRESENTATION_AI_3TIER_GUIDE.md           # คู่มือการนำเสนอสำหรับทำสไลด์และตอบอาจารย์
├── ARCHITECTURE_AND_AI_DATABASE_SPEC.md     # ข้อกำหนดเชิงเทคนิคของระบบฐานข้อมูลและ AI
├── PROJECT_CURRENT_STATUS_CODEBASE_SUMMARY.md # เอกสารสรุปไฟล์โค้ดและสถานะปัจจุบัน (ไฟล์นี้)
└── .env                                     # การตั้งค่าความปลอดภัย (Database URI, JWT Secret, API Keys)
```

---

## 🔍 3. สรุปรายละเอียดและหน้าที่ของโค้ดแต่ละไฟล์ (Deep-Dive File Reference)

### 3.1 ฝั่ง Backend (Python FastAPI)

#### 🔹 [backend/main.py](file:///d:/Newfolder/backend/main.py)
* **หน้าที่**: เป็นไฟล์ Entry point หลักของเซิร์ฟเวอร์
* **สิ่งสำคัญในโค้ด**:
  - กำหนดค่า `FastAPI(title="IT Hardware Price Aggregator API")`
  - ตั้งค่า CORS Middleware เพื่อเปิดให้ Frontend จากโดเมนต่างๆ สามารถยิง Request เข้ามาได้
  - ลงทะเบียน Router ทั้งหมด: `auth_router`, `products_router`, `price_history_router`, `alerts_router`, `analytics_router`
  - ตรวจสอบสถานะการเชื่อมต่อฐานข้อมูลขณะเซิร์ฟเวอร์เริ่มต้น (Lifespan event)

#### 🔹 [backend/core/config.py](file:///d:/Newfolder/backend/core/config.py)
* **หน้าที่**: โหลดค่า Configuration ผ่าน Pydantic Settings
* **สิ่งสำคัญในโค้ด**:
  - ดึงค่า `DATABASE_URL` สำหรับเชื่อมต่อ PostgreSQL
  - กำหนดค่า `SECRET_KEY`, `ALGORITHM` (HS256) และ `ACCESS_TOKEN_EXPIRE_MINUTES` สำหรับ JWT
  - โหลด API Key ของ Brevo Email และ Gemini AI

#### 🔹 [backend/core/database.py](file:///d:/Newfolder/backend/core/database.py)
* **หน้าที่**: สร้าง Async Connection Engine ไปยังฐานข้อมูล
* **สิ่งสำคัญในโค้ด**:
  - ใช้ `create_async_engine` กับไดรเวอร์ `asyncpg`
  - กำหนด `async_sessionmaker` สำหรับเปิด Transaction ในแต่ละคำขอแบบไม่บล็อกการทำงาน (Non-blocking I/O)

#### 🔹 [backend/core/security.py](file:///d:/Newfolder/backend/core/security.py)
* **หน้าที่**: ฟังก์ชันด้านการเข้ารหัสและการจัดการ Token
* **สิ่งสำคัญในโค้ด**:
  - `verify_password()` และ `get_password_hash()`: ใช้ Bcrypt เพื่อป้องกันรหัสผ่านรั่วไหล
  - `create_access_token()`: สร้าง JWT Payload บรรจุ User ID และวันหมดอายุ

#### 🔹 [backend/features/auth/router.py](file:///d:/Newfolder/backend/features/auth/router.py) & [service.py](file:///d:/Newfolder/backend/features/auth/service.py)
* **หน้าที่**: ให้บริการ Endpoint `/api/v1/auth/login`, `/register`, `/me`
* **สิ่งสำคัญในโค้ด**:
  - เมื่อผู้ใช้เข้าสู่ระบบสำเร็จ จะมีตรรกะบันทึก IP address และ User-Agent ลงตาราง `visitor_records` ทันทีเพื่อเก็บสถิติ
  - ส่ง JWT Access Token กลับไปยัง Frontend

#### 🔹 [backend/features/products/router.py](file:///d:/Newfolder/backend/features/products/router.py) & [service.py](file:///d:/Newfolder/backend/features/products/service.py)
* **หน้าที่**: ให้บริการดึงข้อมูลสินค้า, ค้นหา, กรองหมวดหมู่ และเปรียบเทียบสเปก
* **สิ่งสำคัญในโค้ด**:
  - รองรับพารามิเตอร์ `page` และ `limit` (โดยค่าตั้งต้นคือ 16 ชิ้นต่อหน้า)
  - Endpoint `/compare`: รับ ID สินค้า 2 ตัว นำสเปกและราคาต่ำสุดของแต่ละตัวมาจับคู่ และเรียกใช้ `ai_engine` เพื่อสร้างบทวิเคราะห์ฟันธง (Verdict)

#### 🔹 [backend/features/price_history/service.py](file:///d:/Newfolder/backend/features/price_history/service.py)
* **หน้าที่**: คำนวณข้อมูลสถิติราคา
* **สิ่งสำคัญในโค้ด**:
  - Query ตาราง `price_history` ตามช่วงเวลา (7 วัน, 30 วัน, 90 วัน, ทั้งหมด)
  - คำนวณค่าต่ำสุดตลอดกาล (`all_time_low`), ค่าเฉลี่ยเคลื่อนที่ (`moving_average`), และสร้าง Buying Signal Flag

#### 🔹 [backend/features/alerts/service.py](file:///d:/Newfolder/backend/features/alerts/service.py)
* **หน้าที่**: ตรวจสอบเงื่อนไขราคาลดเพื่อส่งอีเมล
* **สิ่งสำคัญในโค้ด**:
  - ฟังก์ชัน `check_and_notify_price_drop()`: เปรียบเทียบราคาใหม่ล่าสุดจาก `price_listings` กับราคาเป้าหมายใน `price_alerts`
  - หากราคาลดต่ำกว่าเป้าหมาย จะส่งข้อมูลไปให้ `integrations/email_brevo.py` ส่งอีเมลหาผู้ใช้

#### 🔹 [backend/integrations/email_brevo.py](file:///d:/Newfolder/backend/integrations/email_brevo.py)
* **หน้าที่**: ส่งอีเมล Transactional ผ่าน Brevo API v3
* **สิ่งสำคัญในโค้ด**:
  - ส่งคำขอแบบ HTTP POST ไปยัง `https://api.brevo.com/v3/smtp/email` พร้อม HTML Template แจ้งเตือนราคาลดที่สวยงาม

---

### 3.2 ฝั่ง Frontend (Modern Web Presentation)

#### 🔹 [frontend/index.html](file:///d:/Newfolder/frontend/index.html)
* **หน้าที่**: โครงสร้างหลักของหน้าเว็บ (Semantic HTML5)
* **สิ่งสำคัญในโค้ด**:
  - Header & Navigation Bar: โลโก้, ช่องค้นหา, ปุ่มหมวดหมู่ (GPU, CPU, RAM, SSD), เมนู Hot Deals, ปุ่ม Login/Register
  - Hero Section: แบนเนอร์แสดงโปรโมชันและไฮไลต์สินค้าราคาลดแรง
  - Product Grid: พื้นที่จัดแสดงการ์ดสินค้า 16 รายการต่อหน้า
  - Comparison Drawer/Modal: หน้าต่างเปรียบเทียบสเปกและกล่องสรุป AI Verdict
  - Price History Modal: หน้าต่างกราฟราคาพร้อมตัวเลือกช่วงเวลา (7d, 30d, 90d, All)
  - Pagination Container: แถบปุ่มเปลี่ยนหน้า 1, 2, 3...

#### 🔹 [frontend/css/style.css](file:///d:/Newfolder/frontend/css/style.css)
* **หน้าที่**: ระบบการตกแต่งหลัก (Design System)
* **สิ่งสำคัญในโค้ด**:
  - CSS Custom Properties (Variables): กำหนดชุดสีที่กลมกลืน (Primary, Accent, Background, Surface, Card Colors)
  - Card & Button Styling: สไตล์ Glassmorphism, เงา (Soft Shadows), และ Micro-interactions (Hover animations)
  - Alert Badge & Tag Styling: ป้ายแสดงสถานะสินค้าลดราคา และป้าย AI Recommend

#### 🔹 [frontend/css/responsive.css](file:///d:/Newfolder/frontend/css/responsive.css)
* **หน้าที่**: ควบคุมให้แสดงผลได้สวยงามบนทุกอุปกรณ์ (Fully Responsive)
* **สิ่งสำคัญในโค้ด**:
  - `@media (max-width: 576px)`: ปรับการ์ดสินค้าเป็น 1 คอลัมน์บนมือถือ, ซ่อนปุ่มที่ไม่จำเป็น, เมนูแบบแตะง่าย
  - `@media (min-width: 577px) and (max-width: 768px)`: จัดการ์ดสินค้า 2 คอลัมน์บนแท็บเล็ตแนวตั้ง
  - `@media (min-width: 769px) and (max-width: 1024px)`: จัดการ์ดสินค้า 3 คอลัมน์บน iPad / แท็บเล็ตแนวนอน
  - `@media (min-width: 1025px)`: แสดงการ์ดสินค้า 4 คอลัมน์อย่างสมดุลบนจอคอมพิวเตอร์และโน้ตบุ๊ก

#### 🔹 [frontend/js/api/client.js](file:///d:/Newfolder/frontend/js/api/client.js)
* **หน้าที่**: HTTP Client กลางสำหรับติดต่อ Backend
* **สิ่งสำคัญในโค้ด**:
  - กำหนด `baseURL` ไปยัง FastAPI Server
  - ติดตั้ง Request Interceptor เพื่อแนบ `Authorization: Bearer <token>` อัตโนมัติเมื่อผู้ใช้ล็อกอินแล้ว
  - ติดตั้ง Response Interceptor เพื่อจัดการกรณี Token หมดอายุ (Redirect ไปหน้า Login)

#### 🔹 [frontend/js/components/product-card.js](file:///d:/Newfolder/frontend/js/components/product-card.js)
* **หน้าที่**: ฟังก์ชันสร้าง HTML Component สำหรับการ์ดสินค้าแต่ละชิ้น
* **สิ่งสำคัญในโค้ด**:
  - แสดงรูปรุ่นสินค้า, ชื่อแบรนด์, สเปกสรุป
  - คำนวณและแสดงราคาต่ำสุด พร้อมป้ายบอกชื่อร้าน (เช่น Advice 21,900.- ถูกที่สุด)
  - ปุ่มกด "ดูกราฟราคา" และปุ่ม "เพิ่มเพื่อเปรียบเทียบ"

#### 🔹 [frontend/js/components/chart-view.js](file:///d:/Newfolder/frontend/js/components/chart-view.js)
* **หน้าที่**: เรนเดอร์กราฟประวัติราคาด้วย Chart.js
* **สิ่งสำคัญในโค้ด**:
  - ดึงข้อมูลจาก API `/price-history`
  - แสดงเส้นราคาแยกสีตามแต่ละร้านค้า เพื่อให้เห็นความเปลี่ยนแปลงของราคาในแต่ละช่วงเวลาได้อย่างชัดเจน

#### 🔹 [frontend/js/components/compare-modal.js](file:///d:/Newfolder/frontend/js/components/compare-modal.js)
* **หน้าที่**: แสดงผลตารางเปรียบเทียบสินค้า 2 รายการ
* **สิ่งสำคัญในโค้ด**:
  - แสดงผลสเปกเปรียบเทียบแบบแถวต่อแถว (Side-by-Side Specs)
  - กล่องข้อความไฮไลต์บทวิเคราะห์จาก AI (AI Comparison Verdict) สรุปความคุ้มค่าให้ผู้ใช้เห็นทันที

#### 🔹 [frontend/js/components/pagination.js](file:///d:/Newfolder/frontend/js/components/pagination.js)
* **หน้าที่**: จัดการระบบแบ่งหน้า
* **สิ่งสำคัญในโค้ด**:
  - กำหนด `ITEMS_PER_PAGE = 16`
  - คำนวณจำนวนหน้าทั้งหมดจากจำนวนสินค้า (`Math.ceil(total / 16)`)
  - สร้างปุ่ม 1, 2, 3... และผูก Event คลิกเพื่อดึงข้อมูลหน้าใหม่และเลื่อนหน้าจอกลับขึ้นด้านบนอย่างนุ่มนวล

---

## 🛠️ 4. Tech Stack & โครงสร้างระบบ Infrastructure

* **Frontend**: HTML5, CSS3, Vanilla JavaScript, Chart.js, Axios
* **Backend**: Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0 Async, Passlib/Bcrypt, PyJWT
* **Database**: PostgreSQL 16 Hosted on Neon Cloud (Serverless)
* **External APIs**:
  - Google Gemini API (Hardware Spec Structuring & Comparison Verdict)
  - Brevo API (Transactional SMTP Email Alerts)
* **Version Control**: Git / GitHub (Synchronized with `origin` and `host` remotes)
