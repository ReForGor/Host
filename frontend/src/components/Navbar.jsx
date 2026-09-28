import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Zap, 
  BarChart2, 
  Flame, 
  Bookmark, 
  ShieldCheck, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  ChevronDown, 
  Layers, 
  Cpu, 
  HardDrive, 
  Tv, 
  Server, 
  Globe 
} from 'lucide-react'
import { alertApi } from '../api/client'
import { useLanguage } from '../i18n/LanguageContext'

export default function Navbar({ user, onLogout, onOpenLogin }) {
  const location = useLocation()
  const { lang, toggleLanguage, t } = useLanguage()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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

  // Primary categories explicitly requested on PDF page 1 wireframe
  const mainNavLinks = [
    { name: t.nav.home, path: '/' },
    { name: t.nav.allProducts, path: '/products' },
    { name: t.nav.gpu, path: '/products?category=Graphics Cards (GPU)' },
    { name: t.nav.cpu, path: '/products?category=Processors (CPU)' },
    { name: t.nav.ram, path: '/products?category=Memory (RAM)' },
    { name: t.nav.compare, path: '/compare', icon: BarChart2, highlight: true },
  ]

  // Remaining categories from the list
  const extraCategories = [
    { name: t.nav.storage, path: '/products?category=Storage (SSD, HDD)' },
    { name: t.nav.monitor, path: '/products?category=Monitors' },
    { name: t.nav.mainboard, path: '/products?category=Motherboards' },
    { name: t.nav.psu, path: '/products?category=Power Supplies (PSU)' },
    { name: t.nav.caseCooling, path: '/products?category=Case & Cooling' },
    { name: t.nav.accessories, path: '/products?category=Accessories' },
  ]

  const isLinkActive = (path) => {
    if (path === '/') return location.pathname === '/' && !location.search
    if (path.includes('?')) return location.pathname + location.search === path
    return location.pathname === path
  }

  return (
    <header className="sticky top-0 z-40 bg-[#030712]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo as requested in PDF: "Web name: KPTM PRICE" */}
          <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  KPTM
                </span>
                <span className="text-xl font-extrabold tracking-tight text-blue-500">
                  PRICE
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider -mt-1 hidden sm:block">
                TECH PRICE COMPARISON
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            {mainNavLinks.map((item) => {
              const active = isLinkActive(item.path)
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                      : item.highlight
                      ? 'text-blue-300 hover:text-white hover:bg-blue-900/30 border border-blue-800/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{item.name}</span>
                </Link>
              )
            })}

            {/* More Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <span>{t.nav.moreCategories}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-50">
                  {extraCategories.map((c) => (
                    <Link
                      key={c.path}
                      to={c.path}
                      className="block px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-blue-600/20 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {c.name}
                    </Link>
                  ))}
                  <div className="border-t border-slate-800 my-1 pt-1">
                    <Link
                      to="/deals"
                      className="block px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      🔥 {t.nav.deals}
                    </Link>
                    <Link
                      to="/platforms"
                      className="block px-3.5 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      🏬 {t.nav.stores}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Controls: TH/EN Toggle + Bell + User */}
          <div className="flex items-center space-x-2.5">
            {/* Language Switcher - Toggle Switch as requested in PDF */}
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-full p-0.5 shadow-inner">
              <button
                onClick={() => lang !== 'th' && toggleLanguage()}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all ${
                  lang === 'th'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="สลับเป็นภาษาไทย"
              >
                🇹🇭 TH
              </button>
              <button
                onClick={() => lang !== 'en' && toggleLanguage()}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all ${
                  lang === 'en'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to English"
              >
                🇬🇧 EN
              </button>
            </div>

            {/* Notification Bell */}
            <Link
              to="/watchlist"
              className="relative p-2 text-slate-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-900"
              title={t.nav.watchlist}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Admin quick link if admin */}
            {user?.is_admin && (
              <Link
                to="/admin"
                className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20"
                title={t.nav.admin}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}

            {/* User Session */}
            {user ? (
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
                <UserIcon className="w-4 h-4 text-blue-400" />
                <span className="text-slate-200 font-semibold max-w-[100px] truncate">{user.username}</span>
                <button
                  onClick={onLogout}
                  className="text-slate-400 hover:text-rose-400 ml-1 transition-colors"
                  title={t.nav.logout}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/30 hover:scale-[1.02]"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{t.nav.login}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Navigation Bar */}
        <div className="xl:hidden flex items-center space-x-2 py-2 border-t border-slate-900 overflow-x-auto text-xs scrollbar-none">
          {mainNavLinks.map((item) => {
            const active = isLinkActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1 whitespace-nowrap rounded-lg text-xs font-medium transition-colors ${
                  active ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            )
          })}
          <Link
            to="/deals"
            className="px-3 py-1 whitespace-nowrap rounded-lg text-xs font-bold text-rose-400 bg-rose-500/10"
          >
            🔥 {t.nav.deals}
          </Link>
        </div>
      </div>
    </header>
  )
}
