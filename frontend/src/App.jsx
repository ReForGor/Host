import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LoginModal from './components/LoginModal'
import HomePage from './pages/HomePage'
import AllProductsPage from './pages/AllProductsPage'
import ComparePage from './pages/ComparePage'
import DealsPage from './pages/DealsPage'
import WatchlistPage from './pages/WatchlistPage'
import PlatformsPage from './pages/PlatformsPage'
import AdminPage from './pages/AdminPage'
import { authApi, analyticsApi } from './api/client'
import { LanguageProvider } from './i18n/LanguageContext'

export default function App() {
  const [user, setUser] = useState(null)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [compareList, setCompareList] = useState([])

  useEffect(() => {
    // 1. Authenticate if token exists
    const token = localStorage.getItem('techprice_token')
    if (token) {
      authApi.getMe()
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('techprice_token')
          setUser(null)
        })
    }

    // 2. Real Visitor Tracking in PostgreSQL Database
    let sessionId = localStorage.getItem('kptm_visitor_session')
    if (!sessionId) {
      sessionId = 'v_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36)
      localStorage.setItem('kptm_visitor_session', sessionId)
    }

    const pingVisitor = () => {
      analyticsApi.pingVisit({
        session_id: sessionId,
        path: window.location.pathname,
        user_id: user?.id || null
      }).catch(() => {})
    }

    pingVisitor()
    const interval = setInterval(pingVisitor, 60000) // heartbeat every 60s
    return () => clearInterval(interval)
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem('techprice_token')
    setUser(null)
  }


  return (
    <LanguageProvider>
      <div className="min-h-screen bg-transparent text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white relative">
        {/* Figma Celestial Orbital Grid Arcs & Ambient Nebula Texture (All Pages) */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <svg className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1600px] h-[850px] opacity-35" viewBox="0 0 1600 850" fill="none">
            {/* Concentric Coordinate Rings from Figma Design */}
            <circle cx="800" cy="180" r="680" stroke="url(#celestial-purple)" strokeWidth="1" strokeDasharray="6 10" />
            <circle cx="800" cy="180" r="520" stroke="url(#celestial-cyan)" strokeWidth="1.2" />
            <circle cx="800" cy="180" r="360" stroke="url(#celestial-purple)" strokeWidth="1" strokeDasharray="4 8" />
            <circle cx="800" cy="180" r="200" stroke="url(#celestial-cyan)" strokeWidth="0.8" />
            <circle cx="800" cy="180" r="70" stroke="#8B5CF6" strokeWidth="0.6" strokeDasharray="2 4" />
            {/* Axis Crosshairs */}
            <line x1="800" y1="0" x2="800" y2="850" stroke="url(#celestial-purple)" strokeWidth="0.75" strokeDasharray="3 6" />
            <line x1="0" y1="180" x2="1600" y2="180" stroke="url(#celestial-purple)" strokeWidth="0.75" strokeDasharray="3 6" />
            {/* Diagonal Sightlines */}
            <line x1="200" y1="0" x2="1400" y2="850" stroke="url(#celestial-purple)" strokeWidth="0.5" strokeDasharray="2 8" opacity="0.4" />
            <line x1="1400" y1="0" x2="200" y2="850" stroke="url(#celestial-purple)" strokeWidth="0.5" strokeDasharray="2 8" opacity="0.4" />
            <defs>
              <linearGradient id="celestial-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C084FC" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#4C1D95" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="celestial-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <Navbar
          user={user}
          onLogout={handleLogout}
          onOpenLogin={() => setIsLoginOpen(true)}
        />

        <main className="flex-1 relative z-10">
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  user={user} 
                  compareList={compareList} 
                  setCompareList={setCompareList} 
                />
              } 
            />
            {/* 'ทั้งหมด' - All Products Page matching blueprint Page 1 */}
            <Route 
              path="/products" 
              element={
                <AllProductsPage 
                  user={user} 
                  compareList={compareList} 
                  setCompareList={setCompareList} 
                />
              } 
            />
            {/* 'เปรียบเทียบสเปก' - Compare Specs Page */}
            <Route 
              path="/compare" 
              element={
                <ComparePage 
                  compareList={compareList} 
                  setCompareList={setCompareList} 
                />
              } 
            />
            {/* 'สินค้า Hot deal' - Deals Page */}
            <Route 
              path="/deals" 
              element={<DealsPage user={user} />} 
            />
            {/* 'รายการติดตาม' - Watchlist Page */}
            <Route 
              path="/watchlist" 
              element={<WatchlistPage user={user} />} 
            />
            {/* 'สถานะร้านค้า' - Platforms Page */}
            <Route 
              path="/platforms" 
              element={<PlatformsPage />} 
            />
            {/* 'แอดมิน' - Admin Management Page */}
            <Route 
              path="/admin" 
              element={<AdminPage user={user} />} 
            />
          </Routes>
        </main>

        <Footer />

        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={(u) => setUser(u)}
        />
      </div>
    </LanguageProvider>
  )
}
