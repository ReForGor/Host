# 🚀 แผนผังการแบ่งโฟลเดอร์และ Git Branch ตามหน้าที่ (Branching Strategy)

อ้างอิงตามมาตรฐาน **Git Flow / Feature-branching** เพื่อให้ทุกคนในทีมสามารถทำงานคู่ขนานกันได้โดยไม่มีปัญหา Merge Conflict

---

## 📌 1. กิ่งหลัก (Main Branches)
* **`main`** : เก็บโค้ดที่สมบูรณ์และเสร็จ 100% เท่านั้น (ห้ามเขียนโค้ดลงกิ่งนี้ตรงๆ)
* **`develop`** : กิ่งกลางสำหรับรวมงานของทุกคนก่อนปล่อยไป main

---

## ⚙️ 2. กิ่งฟีเจอร์ฝั่ง Backend (`feature/backend-...`)

| โฟลเดอร์ / ชื่อ Git Branch | หน้าที่ความรับผิดชอบ | ไฟล์โค้ดหลักในโปรเจกต์ |
| :--- | :--- | :--- |
| **`feature/backend-core-db`** | วางโครงสร้างโฟลเดอร์, เชื่อมต่อ Neon DB, สร้างตาราง Database | `backend/core/database.py`, `backend/core/config.py` |
| **`feature/backend-products`** | ทำระบบดึงสินค้า, ค้นหา, กรองราคา (`/api/products`) | `backend/features/products/` |
| **`feature/backend-scrapers`** | ทำระบบดึงราคาสดจาก Advice, JIB, BaNANA, iHaveCPU | `backend/features/scrapers/` |
| **`feature/backend-compare`** | ทำระบบ API เปรียบเทียบสินค้า (`/api/compare`) | `backend/features/compare/` |
| **`feature/backend-alerts`** | ทำระบบแจ้งเตือนราคาลดและส่งอีเมล SMTP | `backend/features/alerts/` |
| **`feature/backend-auth`** | ทำระบบ Login / JWT Token / สิทธิ์ผู้ใช้งาน | `backend/features/auth/`, `backend/core/security.py` |
| **`feature/backend-admin`** | ทำระบบ Dashboard และจัดการหลังบ้าน | `backend/features/admin/`, `backend/features/analytics/` |

---

## 🎨 3. กิ่งฟีเจอร์ฝั่ง Frontend (`feature/frontend-...`)

| โฟลเดอร์ / ชื่อ Git Branch | หน้าที่ความรับผิดชอบ | ไฟล์โค้ดหลักในโปรเจกต์ |
| :--- | :--- | :--- |
| **`feature/frontend-setup`** | ขึ้นโครงโปรเจกต์ (React/Vite) + ติดตั้ง Tailwind CSS + Navbar/Footer | `frontend/src/App.jsx`, `frontend/src/components/Navbar.jsx`, `Footer.jsx` |
| **`feature/frontend-home`** | หน้าแรก (แสดงสินค้า, ช่องค้นหา, ระบบฟิลเตอร์) | `frontend/src/pages/HomePage.jsx` |
| **`feature/frontend-chart-modal`**| หน้าต่างดูราคาเปรียบเทียบ + กราฟ Chart.js/Recharts | `frontend/src/components/PriceChartModal.jsx` |
| **`feature/frontend-compare`** | หน้าตารางเปรียบเทียบสเปกและราคา (`/compare`) | `frontend/src/pages/ComparePage.jsx` |
| **`feature/frontend-watchlist`** | หน้ารายการสินค้าที่กดติดตามไว้ | `frontend/src/pages/WatchlistPage.jsx` |
| **`feature/frontend-admin`** | หน้าแดชบอร์ดจัดการของแอดมิน | `frontend/src/pages/AdminPage.jsx` |

---

## 🛠️ คู่มือคำสั่ง Git พื้นฐานสำหรับเพื่อนในทีม

### 1. วิธีเริ่มทำงานในกิ่งของตัวเอง:
```bash
# อัปเดตโค้ดล่าสุดจาก develop
git checkout develop
git pull origin develop

# สลับไปยัง branch งานของตัวเอง
git checkout feature/backend-products
# (หรือถ้าสร้างใหม่: git checkout -b feature/backend-products)
```

### 2. บันทึกงานและส่งขึ้น GitHub:
```bash
git add .
git commit -m "feat(products): add price filter and category search"
git push origin feature/backend-products
```

### 3. รวมงานเข้ากิ่งกลาง (develop):
เปิด Pull Request (PR) บน GitHub จาก branch ของตัวเองเข้าสู่ `develop` ให้หัวหน้าทีมหรือเพื่อน Review ก่อน Merge
