import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Cpu, 
  Layers, 
  HardDrive, 
  Tv, 
  Server, 
  Zap, 
  Box, 
  Wind, 
  MousePointer, 
  Scale, 
  LayoutGrid, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  ChevronDown, 
  ShieldCheck,
  Sparkles,
  Flame,
  Home
} from 'lucide-react'
import { alertApi } from '../api/client'
import { useLanguage } from '../i18n/LanguageContext'

export default function Navbar({ user, onLogout, onOpenLogin }) {
  const location = useLocation()
  const { lang, toggleLanguage, t } = useLanguage()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)

  useEffect(() => {
    fetchNotifications()
    const timer = setInterval(fetchNotifications, 30000)
    return () => clearInterval(timer)
  }, [user])

  const fetchNotifications = async () => {
    try {
      const res = await alertApi.getNotifications()
      const unread = res.data.filter(n => !n.is_read).length
      setUnreadCount(unread)
    } catch (e) {
      // ignore
    }
  }

  // 12 Categories from specifications
  const megaMenuCategories = [
    { name: 'หน้าหลัก', path: '/', icon: Home, highlight: false },
    { name: 'ทั้งหมด', path: '/products', icon: LayoutGrid, highlight: false },
    { name: 'การ์ดจอ (VGA/GPU)', path: '/products?category=Graphics Cards (GPU)', icon: Layers, highlight: true },
    { name: 'ซีพียู (CPU)', path: '/products?category=Processors (CPU)', icon: Cpu, highlight: true },
    { name: 'แรม (RAM)', path: '/products?category=Memory (RAM)', icon: Zap, highlight: true },
    { name: 'ที่เก็บข้อมูล (SSD, HDD)', path: '/products?category=Storage (SSD, HDD)', icon: HardDrive, highlight: false },
    { name: 'จอมอนิเตอร์ (Monitor)', path: '/products?category=Monitors', icon: Tv, highlight: false },
    { name: 'เมนบอร์ด (Motherboard)', path: '/products?category=Motherboards', icon: Server, highlight: false },
    { name: 'พาวเวอร์ซัพพลาย (PSU)', path: '/products?category=Power Supplies (PSU)', icon: Zap, highlight: false },
    { name: 'เคส & ชุดระบายความร้อน', path: '/products?category=Case & Cooling', icon: Wind, highlight: false },
    { name: 'อุปกรณ์เสริม & เกมมิ่งเกียร์', path: '/products?category=Accessories', icon: MousePointer, highlight: false },
    { name: 'เปรียบเทียบสเปก', path: '/compare', icon: Scale, highlight: true, special: true },
  ]

  // Quick navigation links
  const quickLinks = [
    { name: 'หน้าหลัก', path: '/' },
    { name: 'ทั้งหมด', path: '/products' },
    { name: 'การ์ดจอ', path: '/products?category=Graphics Cards (GPU)' },
    { name: 'ซีพียู', path: '/products?category=Processors (CPU)' },
    { name: 'แรม', path: '/products?category=Memory (RAM)' },
    { name: 'เปรียบเทียบสเปก', path: '/compare' },
    { name: 'Hot Deals', path: '/deals', isHotDeal: true },
    { name: 'สถานะร้านค้า', path: '/platforms' },
  ]

  const isLinkActive = (path) => {
    const currentPath = location.pathname
    const currentSearch = location.search
    const currentParams = new URLSearchParams(currentSearch)

    if (path === '/') {
      return currentPath === '/' && (!currentSearch || currentSearch === '')
    }

    const [targetPath, targetSearch] = path.split('?')

    if (currentPath !== targetPath) {
      return false
    }

    if (targetSearch) {
      const targetParams = new URLSearchParams(targetSearch)
      const targetCategory = targetParams.get('category')
      const currentCategory = currentParams.get('category')

      if (targetCategory) {
        return currentCategory === targetCategory
      }

      for (const [key, value] of targetParams.entries()) {
        if (currentParams.get(key) !== value) return false
      }
      return true
    }

    if (targetPath === '/products') {
      const currentCategory = currentParams.get('category')
      return !currentCategory || currentCategory === 'All'
    }

    return true
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0B0518]/90 backdrop-blur-md border-b border-purple-500/20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Left: Brand Logo & Mega Menu Button */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* IT PRICE Brand Logo */}
            <Link to="/" className="flex items-center space-x-2.5 group flex-shrink-0">
              <div className="w-9 h-9 rounded-lg bg-purple-500/15 border border-purple-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.35)] group-hover:border-purple-400 group-hover:scale-105 transition-all">
                <Cpu className="w-5 h-5 text-purple-400 group-hover:text-cyan-400 transition-colors" />
              </div>
              <div className="flex items-center tracking-wider">
                <span className="text-xl sm:text-2xl font-black font-cyber text-cyan-400 group-hover:text-cyan-300 transition-colors">
                  IT
                </span>
                <span className="text-xl sm:text-2xl font-black font-cyber text-slate-100 ml-1.5 group-hover:text-white transition-colors">
                  PRICE
                </span>
              </div>
            </Link>

            {/* Mega Menu Button */}
            <div className="relative">
              <button
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                onBlur={() => setTimeout(() => setIsMegaMenuOpen(false), 250)}
                className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isMegaMenuOpen
                    ? 'bg-purple-600/30 text-purple-200 border-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.35)]'
                    : 'bg-purple-950/30 text-purple-200 border-purple-500/30 hover:border-purple-400 hover:text-white hover:bg-purple-900/30'
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-purple-400" />
                <span>หมวดหมู่ทั้งหมด</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180 text-purple-400' : 'text-slate-400'}`} />
              </button>

              {/* Mega Menu Dropdown */}
              {isMegaMenuOpen && (
                <div className="absolute left-0 mt-2 w-[460px] glass-panel-elevated rounded-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider border-b border-purple-500/20 mb-2 flex items-center justify-between">
                    <span>12 หมวดหมู่ทั้งหมด</span>
                    <span className="text-purple-400 font-mono text-[10px]">REAL-TIME SYNC</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {megaMenuCategories.map((cat) => {
                      const Icon = cat.icon
                      const active = isLinkActive(cat.path)
                      return (
                        <Link
                          key={cat.path}
                          to={cat.path}
                          onClick={() => setIsMegaMenuOpen(false)}
                          className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            active
                              ? 'bg-purple-600/30 text-purple-200 border border-purple-400 shadow-[0_0_10px_rgba(139,92,246,0.25)]'
                              : cat.special
                              ? 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30'
                              : 'text-slate-300 hover:text-white hover:bg-purple-900/20'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg ${cat.special ? 'bg-purple-500/30 text-purple-300' : 'bg-purple-950/40 text-purple-300'}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="truncate">{cat.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Quick Links */}
          <nav className="hidden lg:flex items-center space-x-1.5 xl:space-x-2">
            {quickLinks.map((link) => {
              const active = isLinkActive(link.path)
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1 ${
                    active
                      ? 'bg-purple-600/25 text-purple-300 border border-purple-500/40 font-semibold shadow-[0_0_12px_rgba(139,92,246,0.25)]'
                      : link.isHotDeal
                      ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 border border-orange-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-purple-950/30'
                  }`}
                >
                  {link.isHotDeal && <Flame className="w-3.5 h-3.5 text-orange-400" />}
                  <span>{link.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right: Currency + Language Toggle + Alerts + User */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Currency Badge */}
            <div className="hidden sm:flex items-center px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] font-bold text-slate-300">
              <span className="text-cyan-400 font-mono mr-1">฿</span>
              <span>THB</span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-[#0B0F19] border border-white/[0.08] rounded-full p-0.5">
              <button
                onClick={() => lang !== 'th' && toggleLanguage()}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-full transition-all ${
                  lang === 'th'
                    ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                TH
              </button>
              <button
                onClick={() => lang !== 'en' && toggleLanguage()}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-full transition-all ${
                  lang === 'en'
                    ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Notification Bell */}
            <Link
              to="/watchlist"
              className="relative p-2 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/[0.05] transition-colors"
              title="รายการติดตาม & แจ้งเตือน"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
              )}
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full" />
              )}
            </Link>

            {/* Admin quick link if admin */}
            {user?.is_admin && (
              <Link
                to="/admin"
                className="hidden xl:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20"
                title="Admin Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}

            {/* User Session / Login Button */}
            {user ? (
              <div className="flex items-center space-x-2 bg-[#0B0F19] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-[11px] font-bold text-white">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-slate-200 font-semibold max-w-[90px] truncate">{user.username}</span>
                <button
                  onClick={onLogout}
                  className="text-slate-400 hover:text-rose-400 ml-1 transition-colors"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold rounded-xl btn-cyber-primary"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบ</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Scrollable Nav */}
        <div className="lg:hidden flex items-center space-x-2 py-2 border-t border-white/[0.06] overflow-x-auto text-xs scrollbar-none">
          {quickLinks.map((item) => {
            const active = isLinkActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1 whitespace-nowrap rounded-lg text-xs font-medium transition-colors ${
                  active ? 'bg-purple-600/25 text-purple-300 font-bold border border-purple-500/40 shadow-[0_0_10px_rgba(139,92,246,0.3)]' : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            )
          })}
          <Link
            to="/deals"
            className="px-3 py-1 whitespace-nowrap rounded-lg text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 flex items-center space-x-1"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Hot Deals</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
