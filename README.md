# ⚡ IT PRICE - Thailand IT Equipment Price Aggregator & Comparator

A full-stack modern web application for real-time IT hardware price collection, comparison, and tracking across Thailand's top IT retailers: **JIB**, **iHaveCPU**, **BaNANA IT**, and **Advice IT Infinite**.

Built with a decoupled **React (Vite) Frontend** and a highly concurrent **FastAPI Backend** powered by **Neon Serverless PostgreSQL**.

---

## 🌟 Key Features

1. **Live Thai IT Retailer Price Comparison**:
   - Compares prices across 4 major stores. Highlights the **"🔥 Cheapest Store in Thailand"** and provides direct "Buy on Store" links.
2. **Real-Time Price Drop Email Alerts**:
   - Set a custom **Target Price (฿)** on any tracked component.
   - The backend scheduler automatically dispatches rich HTML **Email Notifications** via Gmail SMTP when the target price is met.
3. **Advanced Frontend Architecture (React + Vite)**:
   - **Lazy Loading & Code Splitting**: Optimized Initial Bundle Size for lightning-fast page loads.
   - **Global Error Handling**: Custom `ErrorBoundary` to prevent white screens during API failures.
   - **Responsive Dark Cyberpunk Theme**: Fully optimized for mobile with `theme-color` meta tags, un-scalable viewports, and native-feeling dialogs.
   - **SEO Optimized**: Dynamic meta tags and titles via `react-helmet-async`.
   - **Accessibility (a11y)**: Screen-reader ready with proper `aria-labels` across all UI elements.
4. **User Authentication & Watchlist**:
   - JWT-based authentication system with secure route protection.
   - Personal Watchlist dashboard to monitor price histories.
5. **Admin Management Backend (`/admin`)**:
   - Dedicated Admin Portal for running scraper jobs, checking API health, and managing products. Protected by `ProtectedAdminRoute`.

---

## 🏗️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM, React Helmet Async, Recharts (for price history), React Hot Toast.
- **Backend**: Python 3.10+, FastAPI, SQLAlchemy (Async), asyncpg, APScheduler.
- **Database**: Neon Serverless PostgreSQL.
- **Hosting / Deployment Ready**: 
  - **Frontend**: Pre-configured for **Vercel** with SPA routing (`vercel.json`).
  - **Backend**: Pre-configured for **Render** with deployment scripts (`render.yaml`).

---

## 🚀 Running the Project Locally

The project is split into two separate servers. You need to run both to get the full experience.

### 1. Backend API (FastAPI)
```bash
# Navigate to backend folder
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows: venv\Scripts\activate
# On macOS/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server (runs on http://localhost:8000)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend UI (React + Vite)
```bash
# Navigate to frontend folder (open a new terminal)
cd frontend

# Install Node.js dependencies
npm install

# Start the development server (runs on http://localhost:5173)
npm run dev
```

---

## 🌐 Production Deployment
The repository structure is tailored for modern PaaS platforms:

1. **Vercel (Frontend)**: Point Vercel to the `frontend/` directory. The included `vercel.json` ensures that deep-linking and page refreshes work perfectly for the React Single Page Application without throwing 404 errors.
2. **Render (Backend)**: Connect Render to your repository root. Render will automatically detect the `render.yaml` configuration file and deploy the FastAPI backend server on its Python native runtime.

---

*Project updated to version 2.1.0 - Production Ready.*
