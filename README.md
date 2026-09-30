# ⚡ KPTM PRICE - ระบบรวบรวมและเปรียบเทียบราคาอุปกรณ์ไอทีไทยแบบเรียลไทม์

ระบบค้นหา รวบรวม และเปรียบเทียบราคาอุปกรณ์คอมพิวเตอร์และฮาร์ดแวร์ไอทีจาก 4 ร้านค้าไอทีชั้นนำของประเทศไทย: **JIB**, **Advice IT Infinite**, **BaNANA IT**, และ **iHaveCPU**

พัฒนาด้วยสถาปัตยกรรม **FastAPI (Backend)**, ฐานข้อมูล **Neon Cloud Serverless PostgreSQL**, และ **React + Vite + TailwindCSS (Frontend)** พร้อมระบบยืนยันตัวตน JWT, ระบบแจ้งเตือนราคาลด (Price Drop Alert & Email), ระบบดึงราคาอัตโนมัติรอบเช้า (04:30 น.), และแดชบอร์ดจัดการสำหรับแอดมิน

---

## 🌟 ฟีเจอร์หลักของระบบ (Key Features)

1. **เปรียบเทียบราคาอุปกรณ์ไอทีสด 4 ร้านค้า (Real-Time Price Comparison)**:
   - ตรวจสอบราคาสดแบบเรียลไทม์จาก **JIB (`jib.co.th`)**, **Advice (`advice.co.th`)**, **BaNANA IT (`bnn.in.th`)**, และ **iHaveCPU (`ihavecpu.com`)**
   - แสดงป้าย **"🔥 ร้านที่ถูกที่สุดในไทย"** คำนวณส่วนต่างเงินที่ประหยัดได้ (บาท ฿) พร้อมปุ่มลิงก์ตรงไปยังหน้าร้านเพื่อสั่งซื้อได้ทันที
2. **ระบบดึงราคาอัตโนมัติประจำวัน (Daily Scheduled Scraper at 04:30 AM)**:
   - ทำงานในเบื้องหลัง (Background Worker) อัตโนมัติทุกเช้าช่วงเวลา **04:30 - 05:00 น. (เวลาไทย UTC+7)**
   - ดึงราคาจริงผ่าน Direct API และ Web Scraping อัปเดตลงฐานข้อมูล พร้อมระบบ Jitter ป้องกันการถูกจำกัดสิทธิ์ (Rate Limit)
3. **ระบบแจ้งเตือนราคาลดและรายการที่ติดตาม (Price Drop Alerts & Watchlist)**:
   - ตั้งราคาเป้าหมาย (Target Price) ที่ต้องการสำหรับสินค้าแต่ละชิ้น
   - แจ้งเตือนผ่านกระดิ่งบนหน้าเว็บ (In-App Notification) และส่งอีเมลแจ้งเตือนผ่าน SMTP เมื่อราคาสินค้าลดลงถึงเป้าหมาย
4. **เปรียบเทียบสเปกสินค้าแบบตัวต่อตัว (`/compare`)**:
   - เลือกเปรียบเทียบอุปกรณ์ไอทีได้พร้อมกัน 2 ถึง 4 ชิ้น
   - แสดงตารางเปรียบเทียบสเปกทางเทคนิคอย่างละเอียด (VRAM, Bus Width, Clock Speeds, TDP, Cores, Socket, Warranty)
5. **กราฟประวัติราคาย้อนหลัง (Price History Time-Series Chart)**:
   - แสดงกราฟเส้นประวัติการขึ้น-ลงของราคาย้อนหลัง 30 วัน แยกสีตามแต่ละร้านค้าอย่างชัดเจน
6. **พอร์ทัลจัดการสำหรับแอดมิน (`/admin`)**:
   - แดชบอร์ดตรวจสอบสถานะ Scraper ทั้ง 4 ร้านค้า
   - ปุ่มสั่งรันดึงราคาแบบ Manual ทันที (Run Scheduler Now)
   - จัดการข้อมูลสินค้า, แก้ไขสเปก, เพิ่มสินค้าใหม่, และจัดการผู้ใช้งาน
7. **ระบบความปลอดภัยและสมาชิก (User Authentication)**:
   - ระบบสมัครสมาชิกและเข้าสู่ระบบด้วย JWT Token และการเข้ารหัสรหัสผ่านด้วย Bcrypt

---

## 🚀 วิธีติดตั้งและรันโปรเจกต์ (How to Run Dev)

### ข้อกำหนดเบื้องต้น (Prerequisites)
* **Python 3.10 ขึ้นไป** (แนะนำ Python 3.11 หรือ 3.12/3.13)
* **Node.js 18 ขึ้นไป** (สำหรับพัฒนาฝั่ง Frontend)
* ไฟล์การตั้งค่า **`.env`** สำหรับเชื่อมต่อฐานข้อมูล Neon PostgreSQL (มีระบุไว้ในโปรเจกต์แล้ว)

---

### วิธีที่ 1: รันคำสั่งเดียวจบ (Backend + Frontend พร้อมกัน) - แนะนำสำหรับทดสอบระบบ
ระบบได้รับการปรับปรุงให้ Backend (FastAPI) สามารถ Serve หน้าเว็บ Frontend SPA ได้ในตัว ทำให้รันเพียงคำสั่งเดียวก็ใช้งานได้ทันที

#### บน Windows:
ดับเบิ้ลคลิกไฟล์ **`run.bat`** หรือเปิด PowerShell / Command Prompt ในโฟลเดอร์โปรเจกต์แล้วรัน:
```cmd
run.bat
```
*(หรือใช้คำสั่ง PowerShell: `.\run.ps1` หรือ `python run.py`)*

#### บน Linux / macOS:
```bash
chmod +x run.sh
./run.sh
```

เมื่อรันเสร็จแล้ว สามารถเปิดเว็บใช้งานได้ที่: **[http://localhost:8000](http://localhost:8000)**

---

### วิธีที่ 2: รันแยกโหมด Dev (สำหรับนักพัฒนาที่ต้องการแก้ไขโค้ด)
หากต้องการแก้ไขโค้ดหน้าเว็บแบบมี Hot Module Replacement (HMR) ให้เปิด 2 หน้าต่าง Terminal:

#### Terminal 1: ฝั่ง Backend (FastAPI API)
```bash
# 1. สร้างและเปิดใช้งาน Virtual Environment
python -m venv venv

# บน Windows:
.\venv\Scripts\activate
# บน Linux/macOS:
# source venv/bin/activate

# 2. ติดตั้งไลบรารี Python ที่จำเป็น
pip install -r requirements.txt

# 3. เริ่มรัน Backend Server แบบ Reload อัตโนมัติเมื่อแก้โค้ด
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```
*API Swagger Documentation จะอยู่ที่:* **[http://localhost:8000/docs](http://localhost:8000/docs)**

#### Terminal 2: ฝั่ง Frontend (React + Vite)
```bash
# 1. เข้าสู่โฟลเดอร์ frontend
cd frontend

# 2. ติดตั้ง Node Dependencies (ทำครั้งแรก)
npm install

# 3. เริ่มต้น Vite Dev Server
npm run dev
```
*หน้าเว็บโหมดพัฒนาจะอยู่ที่:* **[http://localhost:5173](http://localhost:5173)** *(ต่อ API เข้าพอร์ต 8000 อัตโนมัติ)*

---

## 🌿 แผนผังและหน้าที่ของแต่ละ Git Branch (Branching Strategy)

โปรเจกต์นี้ใช้โครงสร้างตามมาตรฐาน **Git Flow / Feature Branching** เพื่อให้แบ่งงานและแก้ไขโค้ดได้ตรงจุด โดยมีหน้าที่ของแต่ละ Branch ดังนี้:

### 1. กิ่งหลัก (Main Branches)
| Branch | หน้าที่ความรับผิดชอบ | ข้อปฏิบัติ |
| :--- | :--- | :--- |
| **`main`** | โค้ดเวอร์ชันเสร็จสมบูรณ์ 100% พร้อมใช้งานจริง (Production-ready) | ห้าม Commit งานระหว่างทำลงกิ่งนี้ตรงๆ |
| **`develop`** | กิ่งกลางสำหรับรวมงานของทุกคนในทีมก่อนทดสอบปล่อยขึ้น `main` | ใช้เป็นฐานในการแตก Feature Branch ใหม่ |

---

### 2. กิ่งฟีเจอร์ฝั่ง Backend (`feature/backend-...`)
ใช้สำหรับแก้ไขและพัฒนาระบบฝั่ง Server, API, ฐานข้อมูล และ Scraper ในโฟลเดอร์ `backend/`:

| ชื่อ Git Branch | หน้าที่ความรับผิดชอบ | ไฟล์โค้ดหลักที่เกี่ยวข้อง |
| :--- | :--- | :--- |
| **`feature/backend-scrapers`** | **ระบบ Web Scraper ดึงราคาสด 4 ร้านค้า (JIB, Advice, BaNANA, iHaveCPU)**, ระบบรอบเวลาอัตโนมัติ 04:30 น. (`scheduler.py`), และสคริปต์ Sync ราคา | `backend/features/scrapers/`, `sync_prices.py` |
| **`feature/backend-products`** | จัดการข้อมูลสินค้า, รายการราคา (`/api/products`), ระบบค้นหา, ตัวกรองราคา และหมวดหมู่ | `backend/features/products/` |
| **`feature/backend-alerts`** | ระบบแจ้งเตือนราคาลด (Price Alerts), ตรวจจับราคาตก, ส่งอีเมลแจ้งเตือน (SMTP), ระบบกระดิ่งแจ้งเตือน | `backend/features/alerts/` |
| **`feature/backend-auth`** | ระบบความปลอดภัย, สมัครสมาชิก, เข้าสู่ระบบ, ถอดรหัส/สร้าง JWT Token, จัดการสิทธิ์ User | `backend/features/auth/`, `backend/core/security.py` |
| **`feature/backend-admin`** | ระบบ API สำหรับหน้าแดชบอร์ดแอดมิน (`/api/admin`), จัดการสินค้า, รายงานสถิติผู้เข้าชม | `backend/features/admin/`, `backend/features/analytics/` |
| **`feature/backend-compare`** | ระบบ API คำนวณเปรียบเทียบสเปกและราคาอุปกรณ์แบบหลายชิ้น (`/api/compare`) | `backend/features/compare/` |
| **`feature/backend-core-db`** | โครงสร้างฐานข้อมูลหลัก, การเชื่อมต่อ Neon Serverless PostgreSQL, โมเดลพื้นฐาน, Config หลัก | `backend/core/database.py`, `backend/core/config.py` |

---

### 3. กิ่งฟีเจอร์ฝั่ง Frontend (`feature/frontend-...`)
ใช้สำหรับแก้ไขและพัฒนาส่วนติดต่อผู้ใช้ (UI/UX) และหน้าเว็บในโฟลเดอร์ `frontend/`:

| ชื่อ Git Branch | หน้าที่ความรับผิดชอบ | ไฟล์โค้ดหลักที่เกี่ยวข้อง |
| :--- | :--- | :--- |
| **`feature/frontend-home`** | หน้าแรกของเว็บ (HomePage), ช่องค้นหา, ตัวกรองหมวดหมู่, การ์ดแสดงสินค้า และรายการดีลแนะนำ | `frontend/src/pages/HomePage.jsx`, `frontend/src/components/ProductCard.jsx` |
| **`feature/frontend-chart-modal`** | หน้าต่าง Modal แสดงรายละเอียดสินค้า, ตารางเทียบ 4 ร้าน และกราฟประวัติราคาย้อนหลัง | `frontend/src/components/PriceChartModal.jsx` |
| **`feature/frontend-compare`** | หน้าตารางเปรียบเทียบสเปกและราคาสินค้า 2-4 รายการแบบละเอียด (`/compare`) | `frontend/src/pages/ComparePage.jsx` |
| **`feature/frontend-watchlist`** | หน้ารายการสินค้าที่ผู้ใช้บันทึกไว้และฟังก์ชันตั้งเตือนราคาลด (`/watchlist`) | `frontend/src/pages/WatchlistPage.jsx`, `frontend/src/components/AlertModal.jsx` |
| **`feature/frontend-admin`** | หน้าจอแดชบอร์ดแอดมิน (`/admin`), จัดการสินค้า, ตรวจสอบสถานะ Scraper, และสั่งรันดึงราคา | `frontend/src/pages/AdminPage.jsx` |
| **`feature/frontend-setup`** | โครงสร้าง React Vite, ตั้งค่า Tailwind CSS, Navigation Bar, Footer, และระบบ Routing | `frontend/src/App.jsx`, `frontend/src/components/Navbar.jsx`, `Footer.jsx` |

---

### 4. คำแนะนำการทำงานกับ Git ร่วมกับทีม (Git Workflow Guide)

1. **ก่อนเริ่มแก้ไขงานใหม่ทุกครั้ง:**
   ```bash
   # สลับไปที่ branch ที่ต้องการทำงาน (เช่น ต้องการแก้เรื่อง Scraper)
   git checkout feature/backend-scrapers
   git pull origin feature/backend-scrapers
   ```
2. **เมื่อแก้ไขโค้ดเสร็จแล้ว:**
   ```bash
   git add .
   git commit -m "feat(scrapers): update Advice API parser for live prices"
   git push origin feature/backend-scrapers
   ```
3. **การรวมโค้ดเข้าส่วนกลาง (Merging):**
   * แนะนำให้สร้าง **Pull Request (PR)** บน GitHub เพื่อให้เพื่อนร่วมทีมตรวจสอบก่อน Merge เข้า `develop` หรือ `main`

---

## 🌐 ลิงก์เข้าใช้งานระบบและบัญชีทดสอบ (Quick Access)

* **หน้าเว็บไซต์หลัก (Web Dashboard)**: [http://localhost:8000](http://localhost:8000)
* **หน้าแดชบอร์ดแอดมิน (Admin Portal)**: [http://localhost:8000/admin](http://localhost:8000/admin)
  * บัญชีแอดมินทดสอบ: `admin@techprice.com` / รหัสผ่าน: `admin123`
* **หน้ารายการสินค้าทั้งหมด**: [http://localhost:8000/products](http://localhost:8000/products)
* **หน้าเปรียบเทียบสินค้า (Compare)**: [http://localhost:8000/compare](http://localhost:8000/compare)
* **หน้ารายการติดตามและแจ้งเตือน (Watchlist)**: [http://localhost:8000/watchlist](http://localhost:8000/watchlist)
  * บัญชีผู้ใช้งานทดสอบ: `gamer@demo.com` / รหัสผ่าน: `password123`
* **เอกสาร API อัตโนมัติ (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
