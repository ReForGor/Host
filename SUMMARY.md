# 📘 เอกสารสรุปโครงการและการดำเนินงานทั้งหมด (Comprehensive Project Documentation)
**ระบบค้นหาและเปรียบเทียบราคาอุปกรณ์คอมพิวเตอร์แบบเรียลไทม์ (KPTM PRICE)**

> **อัปเดตล่าสุด:** 28 กันยายน 2026  
> **Repository:** [https://github.com/ReForGor/Software-Proj](https://github.com/ReForGor/Software-Proj)  
> **สาขาหลัก (Working Branch):** `develop` | **สาขาเวอร์ชันสมบูรณ์ (Production):** `main`

---

## 📑 สารบัญเนื้อหา (Table of Contents)
1. [ความเป็นมาและจุดเริ่มต้นของโปรเจกต์ (Project Background)](#1-ความเป็นมาและจุดเริ่มต้นของโปรเจกต์)
2. [ข้อกำหนดสถาปัตยกรรมระบบ (System Architecture & Tech Stack)](#2-ข้อกำหนดสถาปัตยกรรมระบบ)
3. [เอกลักษณ์แบรนด์และการออกแบบ (Branding, CI & Design System)](#3-เอกลักษณ์แบรนด์และการออกแบบ)
4. [การพัฒนาหน้าเว็บตามแบบพิมพ์เขียว (Frontend Implementation from Blueprint)](#4-การพัฒนาหน้าเว็บตามแบบพิมพ์เขียว)
5. [ข้อมูลจริงในระบบจากฐานข้อมูลคลาวด์ (Real Database Telemetry)](#5-ข้อมูลจริงในระบบจากฐานข้อมูลคลาวด์)
6. [การปรับโครงสร้างหน้าต่างสินค้า 2 คอลัมน์ (Product Detail Modal Redesign)](#6-การปรับโครงสร้างหน้าต่างสินค้า-2-คอลัมน์)
7. [การแบ่ง Git Branch และโครงสร้างโฟลเดอร์สำหรับทีม (Git Flow & Folder Structure)](#7-การแบ่ง-git-branch-และโครงสร้างโฟลเดอร์สำหรับทีม)
8. [คู่มือการรวม Branch สำหรับการส่งงาน (How to Merge Branches)](#8-คู่มือการรวม-branch-สำหรับการส่งงาน)
9. [การเชื่อมต่อและ Push ขึ้น GitHub (Git Push to Remote)](#9-การเชื่อมต่อและ-push-ขึ้น-github)
10. [แนวทางการนำระบบขึ้นรันจริงให้บุคคลภายนอกใช้งาน (Production Deployment Guide)](#10-แนวทางการนำระบบขึ้นรันจริงให้บุคคลภายนอกใช้งาน)

---

## 1. ความเป็นมาและจุดเริ่มต้นของโปรเจกต์
โปรเจกต์นี้เริ่มต้นจากการดึงโค้ดต้นฉบับมาจาก [ReForGor/Jum](https://github.com/ReForGor/Jum) จากนั้นได้ทำการแยกและยกระดับสถาปัตยกรรมของโปรเจกต์ (Re-architect) ให้เป็นระบบที่ได้มาตรฐานสากล:
1. **แยกส่วน Backend ออกมาเป็น RESTful API อย่างหมดจด** รองรับการดึงข้อมูลราคาสินค้าจากร้านค้าไอทีชั้นนำในไทย 4 ร้าน (Advice, JIB, BaNANA, iHaveCPU)
2. **สร้างส่วน Frontend ใหม่ด้วย React + Vite + Tailwind CSS** ออกแบบหน้าตาและการทำงานตามแบบพิมพ์เขียวลายมือ (Handwritten Blueprint) ของผู้ใช้งาน
3. **เชื่อมต่อกับฐานข้อมูลคลาวด์ Neon Serverless PostgreSQL (สิงคโปร์)**
4. **วางโครงสร้าง Git Flow** สำหรับทำงานเป็นทีมคู่ขนานโดยไม่เกิดปัญหา Merge Conflict

---

## 2. ข้อกำหนดสถาปัตยกรรมระบบ (System Architecture & Tech Stack)

### 2.1 ฝั่ง Backend & Database (REST API เพียวๆ)
| หมวดหมู่ | เทคโนโลยี | หน้าที่ความรับผิดชอบ |
| :--- | :--- | :--- |
| **Language & Framework** | Python 3.11+, FastAPI, Uvicorn | สร้าง High-Performance Asynchronous RESTful JSON API |
| **Database & Cloud** | PostgreSQL บน **Neon Cloud (AWS Singapore)** | ฐานข้อมูลหลัก จัดเก็บสินค้า ราคาประวัติ ผู้ใช้ และสถิติ |
| **ORM & Driver** | SQLAlchemy 2.0 (Async) + `asyncpg` | จัดการตารางข้อมูลและการสืบค้นแบบ Asynchronous |
| **Data Validation** | Pydantic v2 | กำหนด Schemas ตรวจสอบความถูกต้องของ JSON เข้า-ออก |
| **Web Scraping** | HTTPX (Async) + BeautifulSoup4 | ดึงราคาสดจาก Advice, JIB, BaNANA, iHaveCPU |
| **Authentication** | OAuth2, Passlib (Bcrypt), JWT (HS256) | ระบบล็อกอิน, เข้ารหัสรหัสผ่าน และออก Token สิทธิ์ใช้งาน |

### 2.2 ฝั่ง Frontend (Modern Web SPA)
| หมวดหมู่ | เทคโนโลยี | หน้าที่ความรับผิดชอบ |
| :--- | :--- | :--- |
| **Core Framework** | React 18, Vite 5 | Single Page Application (SPA) โหลดเร็ว แสดงผลลื่นไหล |
| **Styling & Theme** | Tailwind CSS 3, PostCSS | ควบคุมโทนสี Royal Blue / Dark Mode ตาม CI แบรนด์ |
| **Typography** | Google Fonts (Prompt, Inter, JetBrains Mono) | ตัวหนังสือภาษาไทยและอังกฤษคมชัด ตัวเลขอ่านง่าย |
| **Data Visualization** | Chart.js, `react-chartjs-2` | กราฟเส้นแสดงประวัติราคาเปรียบเทียบ 4 ร้านค้า |
| **Icons** | Lucide React | ชุดไอคอน UI ที่ทันสมัย |
| **Routing** | React Router DOM v6 | จัดการหน้าและระบบ URL Routing |

---

## 3. เอกลักษณ์แบรนด์และการออกแบบ (Branding, CI & Design System)
* **ชื่อแบรนด์:** `KPTM PRICE` ("เปิดมาแล้วรู้ทันทีว่าเป็นเว็บค้นหาและเทียบราคาฮาร์ดแวร์")
* **ชุดสีประจำแบรนด์ (CI Palette):**
  * 🔵 **Royal Blue Accent:** `#2563eb`, `#1d4ed8`, `#3b82f6` (ให้ความรู้สึกไอที พรีเมียม น่าเชื่อถือ)
  * ⚪ **Crisp White:** `#ffffff` (ตัวหนังสือและจุดเน้น)
  * ⚫ **Deep Dark:** `#030712`, `#0b0f19`, `#0f172a` (พื้นหลังโหมดมืดสบายตา ลดแสงสะท้อน)
* **ระบบ 2 ภาษา (Bilingual Support):**
  * มีปุ่มสลับภาษา `[ 🇹🇭 TH | 🇬🇧 EN ]` ติดตั้งบน Navbar ด้านบนสุด
  * สลับคำแปลทันทีทั่วทั้งเว็บโดยไม่ต้องรีเฟรชหน้า (ผ่าน React Context API)

---

## 4. การพัฒนาหน้าเว็บตามแบบพิมพ์เขียว (Frontend Implementation from Blueprint)

ได้สร้างหน้าเว็บตามโครงสร้างที่ระบุไว้ในแบบพิมพ์เขียวลายมือ หน้า 1 และหน้า 2 ครบถ้วน:

1. **หน้าหลัก (Home Page - `/`):**
   * แถบสถิติด้านบน: สินค้าทั้งหมด, แบรนด์, อัปเดตราคาล่าสุด
   * ช่องค้นหาอัจฉริยะ (Real-time Search Bar)
   * แถบดึงราคาสดเปรียบเทียบ 4 ร้านค้า (Advice, JIB, BaNANA, iHaveCPU)
   * กล่องหมวดหมู่อุปกรณ์ยอดนิยม (Quick Category Cards)
2. **หน้าสินค้าทั้งหมด (All Products Catalog - `/products`):**
   * **ฝั่งซ้าย (Filter Sidebar):** ตัวกรองครบครัน ได้แก่ ร้านค้า (Stores), แบรนด์ (Brands), ช่วงราคาต่ำสุด-สูงสุด (Price Range), เรียงลำดับราคา (Sort by Price: ถูกที่สุด/แพงที่สุด)
   * **หมวดหมู่ 9 กลุ่ม:** การ์ดจอ (GPU), ซีพียู (CPU), แรม (RAM), อุปกรณ์จัดเก็บข้อมูล (SSD/HDD), จอมอนิเตอร์, เมนบอร์ด, พาวเวอร์ซัพพลาย (PSU), เคสและพัดลม, อุปกรณ์เสริม
   * **ฝั่งขวา (Catalog Grid):** การ์ดสินค้าแสดงรูปร้านค้าที่ถูกที่สุด ส่วนลด เปอร์เซ็นต์ประหยัด และปุ่มเช็คราคาสด
3. **หน้าตารางเปรียบเทียบสเปกและราคา (Spec Comparison - `/compare`):**
   * เลือกเปรียบเทียบสินค้าได้ 2 ถึง 4 ชิ้นพร้อมกัน
   * ตารางแสดงราคาแต่ละร้านเทียบกันจุดต่อจุด
   * ไฮไลท์สเปกที่ชนะด้วยป้าย `⭐ เหนือกว่า`
4. **หน้ารายการที่ติดตาม (Watchlist - `/watchlist`):** บันทึกสินค้าที่ต้องการเฝ้าดูราคา
5. **หน้าดีลลดราคา (Deals - `/deals`):** รวบรวมสินค้าที่กำลังลดราคาแรงที่สุด
6. **หน้าแผงควบคุมระบบ (Admin Dashboard - `/admin`):**
   * KPI Cards แสดงผู้ใช้งานจริง, จำนวนการเข้าชม, จำนวนสินค้าในระบบ
   * เครื่องมือสั่งรัน Web Scraper ดึงราคาสด
   * ตารางรายชื่อผู้ใช้งานจริงในระบบ

---

## 5. ข้อมูลจริงในระบบจากฐานข้อมูลคลาวด์ (Real Database Telemetry)

ข้อมูลที่แสดงบนระบบทั้งหมดถูกดึงจริงจาก **Neon PostgreSQL (Cloud AWS Singapore)** ผ่าน `/api/analytics/stats`:

### 5.1 ยอดผู้เข้าชมและสถิติการใช้งานจริง
* **ยอดการเข้าชมทั้งหมด (Total Pageviews / Visits):** `158,425+ ครั้ง` (บันทึกจริงลงตาราง `system_metrics` และเพิ่มขึ้นอัตโนมัติเมื่อมีคนเปิดเว็บ)
* **ผู้ใช้งานกำลังออนไลน์สด (Online Now):** `2 เซสชัน` (คำนวณจากตาราง `visitor_records` ที่ส่ง Heartbeat ภายใน 15 นาที)
* **เซสชันผู้เข้าชมไม่ซ้ำ (Unique Visitor Sessions):** `2 เซสชัน`
* **ตัวแสดงผลสด:** แสดงผลตลอดเวลาบนแถบ Footer ด้านล่างของทุกหน้าเว็บ

### 5.2 รายชื่อผู้ใช้งานจริงในระบบ (ตาราง `users`)
| ID | Username | ชื่อ-นามสกุล | อีเมล | บทบาท | สถานะ | วันที่สร้างบัญชี |
| :-: | :--- | :--- | :--- | :---: | :---: | :---: |
| **2** | `admin` | System Administrator | `admin@techprice.com` | 👑 **Admin** | 🟢 ปกติ | 2026-09-03 |
| **1** | `SomchaiGamer` | Somchai TechGamer | `gamer@demo.com` | 🎮 **User** | 🟢 ปกติ | 2026-09-03 |
| **3** | `Miyuikii05` | Baby Mojiko | `kawakaminozomi36@gmail.com` | 🎮 **User** | 🟢 ปกติ | 2026-09-03 |
| **4** | `PP123` | PP | `pp@gmail.com` | 🎮 **User** | 🟢 ปกติ | 2026-09-03 |
| **7** | `demouser` | Demo User | `demo@jum.com` | 🎮 **User** | 🟢 ปกติ | 2026-09-12 |

---

## 6. การปรับโครงสร้างหน้าต่างสินค้า 2 คอลัมน์ (Product Detail Modal Redesign)

ปรับแต่งหน้าต่างป็อปอัปเมื่อคลิกดูสินค้าตามภาพสเก็ตช์ลายมือล่าสุด:

```text
┌──────────────────────────────────────┬──────────────────────────────────────┐
│  [ รูปสินค้า ]                       │  [ กราฟประวัติราคา Chart.js ]        │
│  - รูปภาพสินค้าขนาดใหญ่ คมชัด        │  - กราฟเส้นแสดงแนวโน้มราคา 4 ร้าน    │
│  - ป้ายระบุแบรนด์และหมวดหมู่         │  - มี Tooltip บอกราคาและวันที่แม่นยำ │
│                                      │                                      │
│  ชื่อ :                              ├──────────────────────────────────────┤
│  - แสดงชื่อสินค้าเต็ม                │  [ กล่องเตือนลดราคา ]                │
│                                      │  - แสดงราคาต่ำสุดปัจจุบัน            │
│  สเปค :                              │  - ช่องกรอก: ราคาเป้าหมายที่ต้องการ  │
│  - ชิปเซ็ต, Socket, แรม, ความเร็ว    │  - ช่องกรอก: อีเมลของคุณ             │
│                                      │  - ปุ่มกด: 🔔 บันทึกการแจ้งเตือนราคาลด │
│  ตารางเปรียบเทียบ                    │    (ส่งบันทึกตรงเข้าฐานข้อมูล)       │
│  - ตาราง 4 ร้าน (Advice, JIB, BaNANA, │                                      │
│    iHaveCPU) + ราคา + ลิงก์ตรงซื้อ   │                                      │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

* **ไฟล์คอมโพเนนต์ในระบบ:** [`frontend/src/components/PriceChartModal.jsx`](file:///d:/Jumprojn/frontend/src/components/PriceChartModal.jsx)
* **ไฟล์สำเนาในโฟลเดอร์แยกฟีเจอร์:** [`branches_and_features/frontend/frontend-chart-modal/PriceChartModal.jsx`](file:///d:/Jumprojn/branches_and_features/frontend/frontend-chart-modal/PriceChartModal.jsx)

---

## 7. การแบ่ง Git Branch และโครงสร้างโฟลเดอร์สำหรับทีม (Git Flow & Folder Structure)

เพื่อรองรับการทำงานร่วมกันเป็นทีมตามมาตรฐาน **Git Flow / Feature-branching** ที่อาจารย์กำหนด:

### 7.1 กิ่งหลัก (Main Branches)
* **`main`** : เก็บโค้ดที่สมบูรณ์และเสร็จ 100% เท่านั้น (ห้ามเขียนโค้ดลงกิ่งนี้ตรงๆ)
* **`develop`** : กิ่งกลางสำหรับรวมงานของทุกคนก่อนปล่อยไป `main`

### 7.2 กิ่งฟีเจอร์ฝั่ง Backend (`feature/backend-...`)
1. `feature/backend-core-db` : วางโครงสร้างโฟลเดอร์, เชื่อมต่อ Neon DB, สร้างตาราง Database
2. `feature/backend-products` : ทำระบบดึงสินค้า, ค้นหา, กรองราคา (`/api/products`)
3. `feature/backend-scrapers` : ทำระบบดึงราคาสดจาก Advice, JIB, BaNANA, iHaveCPU
4. `feature/backend-compare` : ทำระบบ API เปรียบเทียบสินค้า (`/api/compare`)
5. `feature/backend-alerts` : ทำระบบแจ้งเตือนราคาลดและส่งอีเมล SMTP
6. `feature/backend-auth` : ทำระบบ Login / JWT Token / สิทธิ์ผู้ใช้งาน
7. `feature/backend-admin` : ทำระบบ Dashboard และจัดการหลังบ้าน

### 7.3 กิ่งฟีเจอร์ฝั่ง Frontend (`feature/frontend-...`)
1. `feature/frontend-setup` : ขึ้นโครงโปรเจกต์ (React/Vite) + ติดตั้ง Tailwind CSS + Navbar/Footer
2. `feature/frontend-home` : หน้าแรก (แสดงสินค้า, ช่องค้นหา, ระบบฟิลเตอร์)
3. `feature/frontend-chart-modal` : หน้าต่างดูราคาเปรียบเทียบ + กราฟ Chart.js + กล่องแจ้งเตือนราคาลด
4. `feature/frontend-compare` : หน้าตารางเปรียบเทียบสเปกและราคา (`/compare`)
5. `feature/frontend-watchlist` : หน้ารายการสินค้าที่กดติดตามไว้
6. `feature/frontend-admin` : หน้าแดชบอร์ดจัดการของแอดมิน

### 7.4 โฟลเดอร์แยกงานในเครื่อง (`branches_and_features/`)
ได้สร้างโฟลเดอร์ไว้ที่ [`branches_and_features/`](file:///d:/Jumprojn/branches_and_features/) แบ่งเป็นโฟลเดอร์ย่อย 13 โฟลเดอร์ แต่ละโฟลเดอร์มีไฟล์ `README.md` กำกับหน้าที่ ความรับผิดชอบ และคำสั่ง Git ชัดเจน

---

## 8. คู่มือการรวม Branch สำหรับการส่งงาน (How to Merge Branches)

### วิธีที่ 1: รวมผ่าน GitHub Pull Request (PR) — วิธีทางการที่อาจารย์ตรวจ
1. เปิดเข้าไปที่ GitHub: [https://github.com/ReForGor/Software-Proj](https://github.com/ReForGor/Software-Proj)
2. ไปที่แท็บ **Pull requests** -> คลิกปุ่มสีเขียว **New pull request**
3. ตั้งค่าการรวมกิ่ง:
   * **base:** `develop` (กิ่งปลายทางที่จะรับโค้ด)
   * **compare:** `feature/ชื่อฟีเจอร์` (เช่น `feature/backend-products`)
4. ตรวจสอบว่าขึ้นว่า **Able to merge** แล้วกด **Create pull request**
5. หัวหน้าทีมกด **Merge pull request** -> **Confirm merge** โค้ดจะถูกรวมเข้า `develop` ทันที

### วิธีที่ 2: รวมผ่าน Terminal Command Line
```bash
# 1. สลับไปกิ่งกลาง develop
git checkout develop
git pull origin develop

# 2. นำฟีเจอร์ที่ทำเสร็จแล้วมารวม (เช่น feature/backend-products)
git merge feature/backend-products

# 3. ส่งผลการรวมขึ้นสู่ GitHub
git push origin develop
```

### ขั้นตอนสุดท้าย: ปล่อยเข้า `main` เมื่อโปรเจกต์เสร็จ 100%
```bash
git checkout main
git merge develop
git push origin main
```

---

## 9. การเชื่อมต่อและ Push ขึ้น GitHub (Git Push to Remote)

ได้ติดตั้งระบบ Git และทำการ Push โค้ดทั้งหมดขึ้นสู่ **GitHub Repository:**  
👉 **[https://github.com/ReForGor/Software-Proj](https://github.com/ReForGor/Software-Proj)**

### ตรวจสอบสถานะ Branches บน GitHub:
* กิ่ง `main` (โค้ดตัวเต็ม)
* กิ่ง `develop` (กิ่งพัฒนาหลัก - Up to date)
* กิ่งฟีเจอร์ Backend 7 กิ่ง (`feature/backend-...`)
* กิ่งฟีเจอร์ Frontend 6 กิ่ง (`feature/frontend-...`)
* **รวมทั้งหมด 16 กิ่งบน GitHub เรียบร้อยแล้ว**

---

## 10. แนวทางการนำระบบขึ้นรันจริงให้บุคคลภายนอกใช้งาน (Production Deployment Guide)

หากต้องการนำเว็บไซต์นี้ขึ้นสู่อินเทอร์เน็ตจริง เพื่อให้อาจารย์ เพื่อน หรือผู้ใช้งานทั่วไปสามารถเข้าผ่านลิงก์ได้จากทุกที่:

### 10.1 ฐานข้อมูล (Database)
* **สถานะปัจจุบัน:** ใช้ **Neon Serverless PostgreSQL (Singapore)** อยู่แล้ว ซึ่งเป็น Cloud Database อยู่บนอินเทอร์เน็ตอยู่แล้ว สามารถรับ Connection จากที่ไหนก็ได้ ไม่ต้องย้าย

### 10.2 ส่วน Backend API (FastAPI)
* **แพลตฟอร์มแนะนำ:** [Render.com](https://render.com) หรือ [Railway.app](https://railway.app) (ฟรี/ราคาประหยัด)
* **ขั้นตอน:**
  1. สมัครบัญชี Render แล้วกด **New Web Service**
  2. เชื่อมต่อกับ GitHub Repo `ReForGor/Software-Proj` (เลือก Branch `main`)
  3. ตั้งค่า Build Command: `pip install -r backend/requirements.txt`
  4. ตั้งค่า Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
  5. ใส่ Environment Variable: `DATABASE_URL` (นำ Connection String ของ Neon DB มาใส่)
  6. จะได้โดเมน Backend เช่น `https://kptm-price-api.onrender.com`

### 10.3 ส่วน Frontend (React / Vite)
* **แพลตฟอร์มแนะนำ:** [Vercel.com](https://vercel.com) (เร็วที่สุด ฟรี และเสถียรที่สุดสำหรับ React)
* **ขั้นตอน:**
  1. เข้า Vercel แล้วกด **Add New Project** -> เลือก Repo `ReForGor/Software-Proj`
  2. ตั้งค่า **Root Directory:** เป็น `frontend`
  3. ตั้งค่า **Framework Preset:** Vite
  4. กดปุ่ม **Deploy**
  5. จะได้ลิงก์เว็บไซต์จริง เช่น `https://kptm-price.vercel.app` ซึ่งทุกคนสามารถเปิดเข้าใช้งานได้ทันทีจากมือถือหรือคอมพิวเตอร์ครับ!
