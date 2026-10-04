# สรุปการติดตั้งและ Deploy ระบบ IT PRICE THAILAND (Final)

เอกสารฉบับนี้สรุปขั้นตอนทั้งหมดที่เราได้ทำการแยกส่วนระบบ (Decouple) และนำขึ้นระบบจริง (Production) แบบฟรี 100% โดยใช้บริการ Cloud ยอดนิยมต่างๆ ดังนี้

## 🏗️ โครงสร้างสถาปัตยกรรม (Architecture)
1. **Frontend (หน้าบ้าน):** ใช้ **React (Vite)** โฮสต์บน **Vercel**
   - โฟกัสเรื่องความเร็วในการแสดงผล (SPA)
   - ดึงข้อมูลผ่านทาง API ของหลังบ้าน
2. **Backend (หลังบ้าน):** ใช้ **FastAPI (Python)** โฮสต์บน **Render (Free Tier)**
   - ทำหน้าที่คำนวณ เปรียบเทียบราคา ดึงข้อมูล (Scraping) และระบบส่งอีเมล (APScheduler)
3. **Database (ฐานข้อมูล):** ใช้ **Neon Serverless PostgreSQL**
   - เก็บข้อมูลสินค้า ผู้ใช้งาน และประวัติราคาแบบ Cloud-native
4. **Source Control:** เก็บโค้ดทั้งหมดไว้ที่ GitHub (`ReForGor/Host`)

---

## 🛠️ ขั้นตอนการตั้งค่าที่ทำสำเร็จแล้ว (Completed Steps)

### 1. การเตรียมโค้ดและการแยกส่วน (Decoupling)
- แยกโฟลเดอร์ `frontend` และ `backend` ออกจากกันชัดเจน
- สร้างไฟล์ `.env.example` เพื่อเป็นแบบฟอร์มการใส่ค่าคอนฟิก
- ปรับแก้ `vercel.json` เพื่อรองรับการทำงานของ React Router (SPA) บน Vercel 
- จัดทำไฟล์ `render.yaml` เตรียมพร้อมสำหรับการ Deploy หลังบ้าน

### 2. การแก้ปัญหาและตั้งค่า Backend (Render + Neon)
- สร้าง Web Service บน Render (ผูกกับ GitHub repo) แบบ Free Tier
- **Environment Variables** ที่ตั้งค่าบน Render:
  - `DATABASE_URL` (เชื่อมกับ Neon)
  - `JWT_SECRET`, `JWT_ALGORITHM`, `JWT_EXPIRATION_HOURS` (ระบบ Login)
  - `SMTP_...` (ระบบส่งอีเมลแจ้งเตือนผ่าน Gmail)
- **การแก้ปัญหา CORS:** ฝั่งหน้าบ้าน (Vercel) โดนบล็อกไม่ให้เชื่อมต่อหลังบ้าน (Render) จึงได้ทำการแก้ไฟล์ `backend/main.py` ให้ตั้งค่า `allow_origin_regex=r"https://.*"` เพื่ออนุญาตให้ Vercel ดึงข้อมูลได้

### 3. การแก้ปัญหาและตั้งค่า Frontend (Vercel)
- นำโฟลเดอร์ `frontend` ขึ้น Vercel
- **Environment Variables** ที่ตั้งค่าบน Vercel:
  - `VITE_API_BASE_URL` = `https://[ชื่อโปรเจกต์บน-render].onrender.com/api`

### 4. การจัดการฐานข้อมูล (Database Seeding)
- **ปัญหา:** Render แพ็กเกจฟรี ไม่อนุญาตให้ใช้คำสั่ง Shell จึงไม่สามารถรันคำสั่งเพิ่มข้อมูล (Seed) บนเซิร์ฟเวอร์ได้
- **การแก้ปัญหา:** เนื่องจาก Neon เป็น Cloud Database จึงทำการรันสคริปต์ `seed_data.py` จากเครื่อง Local (ผ่าน Virtual Environment) ยิงข้อมูลตรงเข้าสู่ Neon ทำให้ฐานข้อมูลมีข้อมูลสินค้าจำลองและบัญชีแอดมินพร้อมใช้งานทันที

---

## 🔑 ข้อมูลสำคัญสำหรับการใช้งาน

**Admin Login:**
- **Email:** `admin@techprice.com`
- **Password:** `admin123`

**ทริกสำคัญ: การป้องกัน Render หลับ (Sleep) 💤**
เนื่องจาก Render Free Tier จะหยุดทำงานเมื่อไม่มีการใช้งาน 15 นาที (ทำให้เข้าเว็บครั้งแรกช้า และระบบ Scraping/Email เบื้องหลังหยุดทำงาน)
👉 **วิธีแก้:** ให้ใช้บริการฟรีจาก [cron-job.org](https://cron-job.org) สร้าง Job ยิงมาที่ URL API ของ Render (เช่น `/api/products`) **ทุกๆ 14 นาที** เพื่อปลุกเซิร์ฟเวอร์ให้ตื่นตลอด 24 ชั่วโมง

---
*ระบบพร้อมใช้งาน 100% ทั้งการเปรียบเทียบราคา และการแจ้งเตือนอีเมล 🚀*
