# 📋 สรุปภาพรวมการพัฒนาโปรเจกต์ KPTM PRICE (Project Summary)

> **วันที่บันทึก:** 28 กันยายน 2026  
> **Repository ปลายทาง:** [https://github.com/ReForGor/Software-Proj](https://github.com/ReForGor/Software-Proj)  
> **สาขาหลักสำหรับการพัฒนา (Working Branch):** `develop`

---

## 🌟 1. ข้อมูลภาพรวมของระบบ (Project Overview)
* **ชื่อแบรนด์ / เว็บไซต์:** `KPTM PRICE` (ระบบค้นหาและเปรียบเทียบราคาอุปกรณ์คอมพิวเตอร์แบบเรียลไทม์)
* **คู่สีหลัก (Brand CI):** 
  * Royal Blue (`#2563eb`, `#1d4ed8`, `#3b82f6`)
  * Crisp White (`#ffffff`)
  * Deep Black (`#030712`, `#0f172a`)
* **ฟอนต์แสดงผล:** `Prompt` (ภาษาไทย) + `Inter` (ภาษาอังกฤษ) + `JetBrains Mono` (ตัวเลขและราคา)
* **ระบบ 2 ภาษา (Bilingual Support):** รองรับการสลับภาษาแบบทันที `[ 🇹🇭 TH | 🇬🇧 EN ]` ทั่วทั้งเว็บไซต์

---

## 🛠️ 2. สถาปัตยกรรมระบบ (Technology Stack)

### 🟢 2.1 ฝั่ง Backend & Database (REST API)
* **ภาษาและเฟรมเวิร์ก:** Python 3.11+, FastAPI, Uvicorn
* **ฐานข้อมูลคลาวด์:** PostgreSQL บน Neon Cloud (AWS Singapore)
* **ORM & Database Driver:** SQLAlchemy 2.0 (Async) + `asyncpg`
* **Data Validation:** Pydantic v2
* **Web Scraping:** HTTPX (Async) + BeautifulSoup4 (รองรับ Advice, JIB, BaNANA, iHaveCPU)
* **ความปลอดภัย:** OAuth2 Password Bearer, JWT Token (HS256), Passlib (Bcrypt)

### 🔵 2.2 ฝั่ง Frontend (SPA Client)
* **เฟรมเวิร์ก:** React 18, Vite 5
* **การจัดสไตล์:** Tailwind CSS, PostCSS
* **ไอคอน:** Lucide React
* **กราฟแสดงผลราคา:** Chart.js, `react-chartjs-2`
* **การนำทาง (Routing):** React Router DOM v6

---

## 📊 3. ข้อมูลจริงในระบบ (Real Production Telemetry)
ดึงข้อมูลสดโดยตรงจากฐานข้อมูล **Neon PostgreSQL (Cloud Singapore)** ผ่าน Endpoint `/api/analytics/stats`:

### 👥 ผู้ใช้งานจริงในระบบ (Real Users List - 5 บัญชี)
1. **`admin`** (`admin@techprice.com`) - 👑 ผู้ดูแลระบบ (Admin)
2. **`SomchaiGamer`** (`gamer@demo.com`) - 🎮 ผู้ใช้งานทั่วไป (User)
3. **`Miyuikii05`** (`kawakaminozomi36@gmail.com`) - 🎮 ผู้ใช้งานทั่วไป (User)
4. **`PP123`** (`pp@gmail.com`) - 🎮 ผู้ใช้งานทั่วไป (User)
5. **`demouser`** (`demo@jum.com`) - 🎮 ผู้ใช้งานทั่วไป (User)

### 📈 สถิติการเข้าชมจริง (Visitor Metrics)
* **ยอดการเข้าชมทั้งหมด (Total Pageviews):** `158,425+ ครั้ง` (บันทึกจริงลงตาราง `system_metrics`)
* **กำลังออนไลน์สด (Online Now):** `2 เซสชัน` (คำนวณจากตาราง `visitor_records` ภายใน 15 นาที)
* **ระบบ Tracking:** มีสคริปต์ส่ง Heartbeat ปิงสถิติทุก 60 วินาที พร้อมแสดงผลสดที่ Footer ด้านล่างของทุกหน้า

---

## 🎨 4. การปรับแต่งหน้าต่างดูสินค้า (Product Detail Modal)
ปรับโครงสร้างหน้าต่าง Popup/Modal สินค้าตาม **แบบสเก็ตช์ลายมือ 2 คอลัมน์ (2-Column Layout)** อย่างสมบูรณ์:

```text
┌──────────────────────────────────────┬──────────────────────────────────────┐
│  [ รูปสินค้า ]                       │  [ กราฟประวัติราคา Chart.js ]        │
│  - รูปภาพสินค้าคมชัด พร้อมป้ายแบรนด์ │  - กราฟเส้นแสดงราคาแต่ละร้านตามเวลา  │
│                                      │                                      │
│  ชื่อ :                              ├──────────────────────────────────────┤
│  - แสดงชื่อเต็มของสินค้า             │  [ กล่องเตือนลดราคา ]                │
│                                      │  - แสดงราคาต่ำสุดปัจจุบัน            │
│  สเปค :                              │  - ช่องกรอก: ราคาเป้าหมายที่ต้องการ  │
│  - ชิปเซ็ต, Socket, แรม, TDP ฯลฯ     │  - ช่องกรอก: อีเมลของคุณ             │
│                                      │  - ปุ่ม: 🔔 บันทึกการแจ้งเตือนราคาลด │
│  ตารางเปรียบเทียบ                    │    (บันทึกเข้า DB และส่งแจ้งเตือน)   │
│  - ตารางราคา 4 ร้านค้าสด + ลิงก์ซื้อ │                                      │
└──────────────────────────────────────┴──────────────────────────────────────┘
```
* **ไฟล์คอมโพเนนต์หลัก:** `frontend/src/components/PriceChartModal.jsx`
* **สำเนาในโฟลเดอร์แยกฟีเจอร์:** `branches_and_features/frontend/frontend-chart-modal/PriceChartModal.jsx`

---

## 🌿 5. การจัดการ Git Flow และ Branching Strategy

### 📁 5.1 โครงสร้างโฟลเดอร์แยกงานสำหรับทีม (`branches_and_features/`)
สร้างโฟลเดอร์สำหรับแจกจ่ายงานให้เพื่อนในทีมแต่ละคน พร้อมไฟล์ `README.md` กำกับหน้าที่และโค้ดที่ต้องรับผิดชอบ:
* **Backend:**
  * `backend-core-db` : วางโครงสร้างโฟลเดอร์, เชื่อมต่อ Neon DB, สร้างตาราง Database
  * `backend-products` : ทำระบบดึงสินค้า, ค้นหา, กรองราคา (`/api/products`)
  * `backend-scrapers` : ทำระบบดึงราคาสดจาก Advice, JIB, BaNANA, iHaveCPU
  * `backend-compare` : ทำระบบ API เปรียบเทียบสินค้า (`/api/compare`)
  * `backend-alerts` : ทำระบบแจ้งเตือนราคาลดและส่งอีเมล SMTP
  * `backend-auth` : ทำระบบ Login / JWT Token / สิทธิ์ผู้ใช้งาน
  * `backend-admin` : ทำระบบ Dashboard และจัดการหลังบ้าน
* **Frontend:**
  * `frontend-setup` : ขึ้นโครงโปรเจกต์ React/Vite + Tailwind CSS + Navbar/Footer
  * `frontend-home` : หน้าแรก (แสดงสินค้า, ช่องค้นหา, ระบบฟิลเตอร์)
  * `frontend-chart-modal` : หน้าต่างดูราคาเปรียบเทียบ + กราฟ Chart.js + กล่องแจ้งเตือน
  * `frontend-compare` : หน้าตารางเปรียบเทียบสเปกและราคา (`/compare`)
  * `frontend-watchlist` : หน้ารายการสินค้าที่กดติดตามไว้
  * `frontend-admin` : หน้าแดชบอร์ดจัดการของแอดมิน

---

### 🚀 5.2 สถานะ Branches บน GitHub (`ReForGor/Software-Proj`)
ได้ทำการ Push ทุกกิ่งขึ้นสู่ GitHub เรียบร้อยแล้ว (รวมทั้งหมด 15 กิ่งหลัก):

| หมวดหมู่ | รายชื่อ Branch บน GitHub | สถานะบน GitHub |
| :--- | :--- | :---: |
| **Main Branches** | `main` (กิ่งสมบูรณ์ 100%) | ✅ อัปโหลดแล้ว |
| | `develop` (กิ่งกลางสำหรับรวมงาน) | ✅ อัปโหลดแล้ว |
| **Backend Features** | `feature/backend-core-db` | ✅ อัปโหลดแล้ว |
| | `feature/backend-products` | ✅ อัปโหลดแล้ว |
| | `feature/backend-scrapers` | ✅ อัปโหลดแล้ว |
| | `feature/backend-compare` | ✅ อัปโหลดแล้ว |
| | `feature/backend-alerts` | ✅ อัปโหลดแล้ว |
| | `feature/backend-auth` | ✅ อัปโหลดแล้ว |
| | `feature/backend-admin` | ✅ อัปโหลดแล้ว |
| **Frontend Features** | `feature/frontend-setup` | ✅ อัปโหลดแล้ว |
| | `feature/frontend-home` | ✅ อัปโหลดแล้ว |
| | `feature/frontend-chart-modal` | ✅ อัปโหลดแล้ว |
| | `feature/frontend-compare` | ✅ อัปโหลดแล้ว |
| | `feature/frontend-watchlist` | ✅ อัปโหลดแล้ว |
| | `feature/frontend-admin` | ✅ อัปโหลดแล้ว |

🔗 **ลิงก์ตรวจสอบบน GitHub:** [https://github.com/ReForGor/Software-Proj/branches](https://github.com/ReForGor/Software-Proj/branches)

---

## 🔄 6. คู่มือการรวมโค้ด (How to Merge Branches)

### วิธีที่ 1: รวมผ่าน GitHub Pull Request (PR) — แนะนำสำหรับการส่งงาน
1. เข้าไปที่ [https://github.com/ReForGor/Software-Proj](https://github.com/ReForGor/Software-Proj)
2. กดแถบ **Pull requests** -> **New pull request**
3. เลือก **base: `develop`** <- **compare: `feature/ชื่อฟีเจอร์`**
4. กด **Create pull request** จากนั้นหัวหน้าทีมกด **Merge pull request**
5. เมื่อรวมทุกฟีเจอร์เข้า `develop` ครบและทดสอบผ่านแล้ว ค่อยเปิด PR จาก `develop` เข้า `main`

### วิธีที่ 2: รวมผ่านคำสั่ง Terminal
```bash
# สลับไปกิ่งกลาง develop และดึงโค้ดล่าสุด
git checkout develop
git pull origin develop

# รวมฟีเจอร์ที่ทำเสร็จเข้ามา
git merge feature/backend-products

# Push อัปเดตขึ้น GitHub
git push origin develop
```

### วิธีที่ 3: ปล่อยงานสมบูรณ์เข้า `main` (Final Release)
```bash
git checkout main
git merge develop
git push origin main
```
