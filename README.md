# ⚡ TechPrice - แพลตฟอร์มรวบรวมและเปรียบเทียบราคาอุปกรณ์ไอทีในประเทศไทย

> **TechPrice (KPTM Price)** คือเว็บแอปพลิเคชัน Full-Stack สำหรับรวบรวม เปรียบเทียบราคา และวิเคราะห์แนวโน้มราคาอุปกรณ์ไอทีและฮาร์ดแวร์คอมพิวเตอร์แบบเรียลไทม์ จาก 4 ร้านค้าไอทีชั้นนำในไทย: **Advice**, **JIB**, **BaNANA IT**, และ **iHaveCPU** พร้อมระบบแจ้งเตือนผ่าน E-mail เมื่อราคาลดลงถึงเป้าหมาย

---

## 🌟 ฟีเจอร์หลักของระบบ (Key Features)

### 👤 ฝั่งผู้ใช้งานทั่วไป (User Features)
1. **เปรียบเทียบสเปกและราคา (Product & Specs Comparison):**
   - เปรียบเทียบราคาสินค้าชิ้นเดียวกันจากทั้ง 4 ร้านค้าแบบ Side-by-Side
   - ไฮไลต์ร้านค้าที่ **"ถูกที่สุด"** พร้อมคำนวณส่วนต่างและปุ่มกดไปยังหน้าร้านค้าโดยตรง
   - เปรียบเทียบสเปกเชิงลึกระหว่างสินค้า 2-4 ชิ้นได้พร้อมกัน
2. **ระบบค้นหาอัจฉริยะ (Real-Time Search Bar):**
   - ค้นหาสินค้าตามชื่อรุ่น แบรนด์ หรือหมวดหมู่
   - มีระบบ **Auto-complete Search Suggestions** แนะนำคำค้นหาทันทีที่พิมพ์
3. **กราฟแนวโน้มราคาย้อนหลัง (Historical Price Chart):**
   - ดูกราฟประวัติราคาของแต่ละร้านค้าในช่วง 7 วัน, 30 วัน, 90 วัน หรือทั้งหมด
   - วิเคราะห์ราคาเฉลี่ย จุดราคาสูงสุดและต่ำสุดในอดีตเพื่อประกอบการตัดสินใจซื้อ
4. **ระบบแจ้งเตือนราคาลดผ่านทาง E-mail (Price Drop Alerts):**
   - ตั้งราคาเป้าหมาย (Target Price) ที่ต้องการซื้อ
   - เมื่อ Web Scraper ตรวจพบว่าราคาลดลงถึงเป้าหมาย ระบบจะส่งอีเมลแจ้งเตือนทันที
   - ภายในอีเมลมี **ปุ่มกดเข้าหน้าเว็บ TechPrice ทันที** และ **ปุ่มไปยังร้านค้าเพื่อสั่งซื้อ** ในราคาโปรโมชั่น
5. **รายการติดตามสินค้า (Watchlist):**
   - บันทึกสินค้าที่สนใจ ติดตามราคาแบบเรียลไทม์ และจัดการการแจ้งเตือน

---

### 🛡️ ฝั่งผู้ดูแลระบบ (Admin Features)
1. **แดชบอร์ดภาพรวมระบบ (System KPI Overview):**
   - ตรวจสอบจำนวนผู้ใช้งานจริงในระบบ (Real Users จาก Neon Cloud PostgreSQL)
   - สถิติยอดผู้เข้าชมสะสม และจำนวนผู้ใช้งานออนไลน์แบบ Real-time
   - สถานะสุขภาพของฮาร์ดแวร์, Database Connection และ Scraper Engine
2. **ตรวจสอบสถานะ Web Scraper (Platform Status & Diagnostics):**
   - ตรวจสอบสถานะการเชื่อมต่อของ Scraper แต่ละร้านค้า (Response Time, Success Rate, Mapped Items)
   - มีปุ่ม **"สั่งรัน Scraper ทันที"** เพื่อบังคับดึงข้อมูลสด
3. **เพิ่มหรือตั้งค่าแพลตฟอร์มร้านค้าใหม่ (Store Management):**
   - รองรับการขยายระบบเพื่อเพิ่มร้านค้าใหม่ๆ ในอนาคตผ่าน Modal บันทึกลงฐานข้อมูล
4. **ตั้งค่ารอบเวลาดึงข้อมูลอัตโนมัติ (Automated Daily 04:30 AM Scheduler):**
   - ระบบตั้งเวลาทำงานอัตโนมัติ (Cron Scheduler) ทุกเช้าเวลา **04:30 - 05:00 น. (เวลาประเทศไทย UTC+7)**
   - แสดงเวลา Next Run Time, Last Run Time พร้อมปุ่มสั่งรันรอบดึงราคาได้ทันที
5. **จัดหมวดหมู่และจัดการฐานข้อมูล (Catalog Management):**
   - เพิ่ม ลบ แก้ไขข้อมูลสินค้า แบรนด์ สเปก และราคาอ้างอิง ครอบคลุม 10 หมวดหมู่หลัก
6. **รายงานข้อผิดพลาด (Error Logs & Diagnostics):**
   - บันทึก Log ข้อผิดพลาดของ Scraper เช่น การเปลี่ยนโครงสร้าง DOM, Rate Limit หรือ Timeout เพื่อให้ผู้ดูแลปรับปรุงแก้ไขได้ทันที
7. **ระบบบรอดแคสต์แจ้งเตือนด่วน (Broadcast Notification):**
   - ส่งข้อความประกาศโปรโมชั่นหรือ Flash Sale ด่วนถึงผู้ใช้ทุกคนในระบบพร้อมกัน

---

## 🏗️ โครงสร้างสถาปัตยกรรมระบบ (Architecture)

```text
├── backend/                       # FastAPI REST API Backend (Python 3.10+)
│   ├── core/                      # Config, Security (JWT/Bcrypt), Database Engine
│   ├── features/
│   │   ├── admin/                 # Admin Dashboard, Stats, User/Store Management
│   │   ├── alerts/                # Price Alerts, Notifications, Gmail SMTP Service
│   │   ├── analytics/             # Online Session & Visitor Tracking
│   │   ├── auth/                  # Register, Login, JWT Authentication
│   │   ├── compare/               # Head-to-Head Product Specs & Price Comparison
│   │   ├── products/              # Product Catalog, Categories, Brands, Price History
│   │   └── scrapers/              # Async Scrapers (Advice, JIB, BaNANA, iHaveCPU) & Scheduler
│   └── main.py                    # Application Entrypoint & Background Lifespan
├── frontend/                      # Single Page Application (React 18 + Vite)
│   ├── src/
│   │   ├── api/                   # Axios API Client Modules
│   │   ├── components/            # Navbar, Footer, Modals (Chart, Alert, Login)
│   │   ├── pages/                 # HomePage, AdminPage, ComparePage, WatchlistPage...
│   │   ├── i18n/                  # รองรับภาษาไทย / English
│   │   └── App.jsx
│   └── package.json
└── sync_prices.py                 # สคริปต์ Sync ราคาสดจากทั้ง 4 ร้านค้าเข้า Database
```

---

## 💻 วิธีการรันโปรเจกต์ในโหมด Development (How to Run Dev)

### 1. สิ่งที่ต้องติดตั้งในเครื่อง (Prerequisites)
- **Python 3.10 หรือใหม่กว่า** (ดาวน์โหลดจาก [python.org](https://www.python.org/) และอย่าลืมติ๊กถูก **"Add Python to PATH"**)
- **Node.js 18 หรือใหม่กว่า** พร้อม npm (ดาวน์โหลดจาก [nodejs.org](https://nodejs.org/))
- **Git**

---

### 2. การเตรียมไฟล์และการตั้งค่า Environment (.env)

สร้างไฟล์ `.env` ไว้ที่ Root ของโปรเจกต์ (หรือตรวจสอบค่าในไฟล์ `.env` ที่มีอยู่แล้ว):

```env
# ตั้งค่าโปรเจกต์
PROJECT_NAME="TechPrice - Thai IT Equipment Price Aggregator API"
SECRET_KEY="your-super-secret-jwt-key"

# ฐานข้อมูล Neon Cloud PostgreSQL (หรือ Local PostgreSQL)
DATABASE_URL="postgresql+asyncpg://neondb_owner:npg_uH9lEsz6jTiy@ep-crimson-dawn-a1h2h6vd-pooler.ap-southeast-1.aws.neon.tech/neondb?ssl=require"

# การส่งอีเมลแจ้งเตือนผ่าน Gmail SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="TechPrice Alert <your-email@gmail.com>"
```

---

### 3. ติดตั้ง Dependencies (ทำครั้งแรก)

#### ฝั่ง Backend (Python):
```powershell
# เปิด Terminal ที่โฟลเดอร์โปรเจกต์
# แนะนำให้สร้าง Virtual Environment (ไม่บังคับ)
python -m venv venv
.\venv\Scripts\activate   # สำหรับ Windows (PowerShell / CMD)
# source venv/bin/activate # สำหรับ macOS / Linux

# ติดตั้งแพ็กเกจของ Backend
pip install -r backend/requirements.txt
```

#### ฝั่ง Frontend (Node.js):
```powershell
cd frontend
npm install
cd ..
```

---

### 4. วิธีการรันระบบ (Run Development Mode)

#### 🚀 วิธีที่ 1: รันคำสั่งอัตโนมัติด้วยคลิกเดียว (แนะนำสำหรับ Windows)
ดับเบิลคลิกไฟล์ **`run_all.bat`**  
*(หรือเปิด PowerShell แล้วรันคำสั่ง `.\run_all.ps1`)*

สคริปต์จะเปิดทั้ง Backend FastAPI (`:8000`) และ Frontend Vite (`:3000`) ขึ้นมาพร้อมกันโดยอัตโนมัติ

---

#### 🛠️ วิธีที่ 2: รันแยก 2 หน้าต่าง Terminal (มาตรฐานสำหรับ Dev)

**หน้าต่างที่ 1 — รัน Backend (FastAPI):**
```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
> เซิร์ฟเวอร์ Backend จะทำงานที่ `http://127.0.0.1:8000`  
> พร้อมรันตัว Scheduler ดึงราคารายวันอัตโนมัติในเบื้องหลัง

**หน้าต่างที่ 2 — รัน Frontend (React + Vite):**
```powershell
npm --prefix frontend run dev
```
> หน้าเว็บ Frontend จะเปิดขึ้นที่ `http://localhost:3000`

---

### 5. วิธีสั่ง Sync ราคาสดจากทั้ง 4 ร้านค้าด้วยตนเอง (Manual Price Sync)
หากต้องการอัปเดตราคาแบบเรียลไทม์จาก Advice, JIB, BaNANA, iHaveCPU ทั้ง 26 สินค้า (104 รายการ) ให้ตรงกับหน้าเว็บต้นทางทันที สามารถรันสคริปต์:
```powershell
python sync_prices.py
```

---

## 🌐 ลิงก์สำหรับเข้าใช้งานระบบ (URLs)

| ส่วนของระบบ | URL สำหรับเข้าชม | คำอธิบาย |
|---|---|---|
| **หน้าเว็บหลัก (Frontend)** | [http://localhost:3000](http://localhost:3000) | หน้าหลัก ค้นหาสินค้า เปรียบเทียบราคา 4 ร้าน |
| **หน้าเปรียบเทียบสเปก** | [http://localhost:3000/compare](http://localhost:3000/compare) | เปรียบเทียบสเปกระหว่างสินค้า |
| **หน้ารายการติดตาม** | [http://localhost:3000/watchlist](http://localhost:3000/watchlist) | ดูสินค้าที่ตั้งแจ้งเตือนราคาไว้ |
| **หน้าผู้ดูแลระบบ (Admin)** | [http://localhost:3000/admin](http://localhost:3000/admin) | แดชบอร์ด KPI, จัดการ Scraper, หมวดหมู่ และ Scheduler |
| **Interactive API Docs (Swagger)** | [http://localhost:8000/docs](http://localhost:8000/docs) | เอกสารและทดสอบเรียก REST API |
| **ReDoc API Docs** | [http://localhost:8000/redoc](http://localhost:8000/redoc) | เอกสารโครงสร้าง API แบบ ReDoc |
| **API Health Check** | [http://localhost:8000/health](http://localhost:8000/health) | ตรวจสอบสถานะการทำงานของเซิร์ฟเวอร์ |

---

## 🔑 บัญชีสำหรับเข้าสู่ระบบทดสอบ (Demo Credentials)

| บทบาท (Role) | อีเมล (Email) | รหัสผ่าน (Password) | สิทธิ์การใช้งาน |
|---|---|---|---|
| 👑 **ผู้ดูแลระบบ (Admin)** | `admin@techprice.com` | `admin123` | เข้าถึงหน้า Admin Portal จัดการสินค้า และสั่งรันระบบได้ทั้งหมด |
| 🎮 **ผู้ใช้งานทั่วไป (User)** | `gamer@demo.com` | `password123` | เข้าชมสินค้า ตั้งแจ้งเตือนราคา และจัดการ Watchlist |

---

## ⏰ รอบการทำงานของระบบดึงราคา (Scraper Schedule)
- ระบบมี Background Worker ทำงานอยู่ใน `backend/features/scrapers/scheduler.py`
- ทำการตรวจเช็กและรันอัปเดตราคาจาก 4 ร้านค้าโดยอัตโนมัติทุกวันระหว่าง **04:30 - 05:00 น. (เวลาประเทศไทย UTC+7)**
- หากราคาที่อัปเดตใหม่ลดลงต่ำกว่าราคาเป้าหมายของผู้ใช้คนใด ระบบจะส่งอีเมลแจ้งเตือนไปยังผู้ใช้นั้นทันที
