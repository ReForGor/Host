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
      <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        <Navbar
          user={user}
          onLogout={handleLogout}
          onOpenLogin={() => setIsLoginOpen(true)}
        />

        <main className="flex-1">
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
