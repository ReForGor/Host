# 🚀 คู่มือการนำระบบ IT PRICE ขึ้นโฮสติ้ง (Deployment Guide)

เนื่องจากระบบออกแบบให้ **FastAPI (Backend)** เป็นตัวเสิร์ฟ **React (Frontend)** ในตัวเดียว (Single-Server Architecture) ทำให้การนำขึ้น Host ทำได้ง่ายมาก ไม่ต้องแยกเซิร์ฟเวอร์

## 📦 สิ่งที่จัดเตรียมไว้ให้แล้ว
1. **`Procfile`**: สำหรับ Deploy ขึ้น Heroku, Railway หรือ Render
2. **`render.yaml`**: สำหรับใช้ Blueprint Deploy ขึ้น Render.com แบบรวดเร็ว
3. **`requirements.txt`**: สำหรับติดตั้ง Python Dependencies
4. **`frontend/dist`**: ไฟล์ Frontend ที่ถูก Build ล่าสุดไว้เรียบร้อยแล้ว (แต่อาจจะถูก Build ใหม่อัตโนมัติบนเซิร์ฟเวอร์)

---

## 🌐 ตัวเลือกที่ 1: การ Deploy ขึ้น Render.com (แนะนำ ฟรี/ราคาถูก และเสถียร)

Render.com เป็นแพลตฟอร์มที่เหมาะสำหรับ Python + React มากที่สุด

1. นำโค้ดทั้งหมด (โฟลเดอร์นี้) ขึ้น **GitHub Repository**
2. สมัครบัญชีและล็อกอินที่ [Render.com](https://render.com)
3. ไปที่ Dashboard คลิก **"New"** -> **"Blueprint"**
4. เชื่อมต่อ GitHub และเลือก Repository ของคุณ
5. Render จะอ่านไฟล์ `render.yaml` และตั้งค่า Server ให้โดยอัตโนมัติ!
6. **(สำคัญ)** ไปกำหนดค่าตัวแปร (Environment Variables) ในหน้า Dashboard ของ Render (ดูหัวข้อ Environment Variables ด้านล่าง)

---

## 🚂 ตัวเลือกที่ 2: การ Deploy ขึ้น Railway.app

1. นำโค้ดทั้งหมดขึ้น **GitHub Repository**
2. สมัครและล็อกอินที่ [Railway.app](https://railway.app)
3. กด **"New Project"** -> **"Deploy from GitHub repo"**
4. เลือก Repository ของคุณ
5. Railway จะตรวจจับ `Procfile` และ `requirements.txt` และเริ่ม Build
6. หาก Railway ไม่ยอมรันคำสั่ง Build ของ Frontend ให้ไปตั้งค่า "Custom Build Command" ใน Railway เป็น:
   `pip install -r requirements.txt && cd frontend && npm install && npm run build`
7. กำหนดค่า Environment Variables

---

## ⚙️ Environment Variables (สิ่งที่ต้องตั้งค่าบน Host)
คุณต้องคัดลอกค่าจากไฟล์ `.env` ของคุณไปใส่ในช่อง Environment Variables หรือ Config Vars บนหน้าเว็บของ Host:

```env
# ตั้งค่า Database เป็นฐานข้อมูล Neon Cloud ของคุณ
DATABASE_URL=postgresql+asyncpg://...

# ความปลอดภัย
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# อีเมล (สำหรับแจ้งเตือน)
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=your_email@gmail.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
```

## ✅ สรุปขั้นตอน
ตอนนี้ไฟล์ทุกอย่างพร้อมนำขึ้น Host แล้ว เพียงแค่ `git add .`, `git commit -m "Prepare for deployment"`, และ `git push` ขึ้น GitHub จากนั้นผูกกับ Render หรือ Railway ได้เลยครับ!
