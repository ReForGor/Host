import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Search, 
  Sparkles, 
  Flame, 
  TrendingDown, 
  Layers, 
  Cpu, 
  HardDrive, 
  Tv, 
  Server, 
  Zap, 
  Box, 
  Wind, 
  MousePointer, 
  Laptop,
  ArrowRight,
  TrendingUp,
  Award,
  Bell,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  BookOpen,
  Gamepad2,
  LayoutGrid,
  Activity
} from 'lucide-react'
import { productApi } from '../api/client'
import ProductCard from '../components/ProductCard'
import PriceChartModal from '../components/PriceChartModal'
import AlertModal from '../components/AlertModal'
import { useLanguage } from '../i18n/LanguageContext'

// Fallback high-fidelity sample data matching Figma reference
const MOCK_HOMEPAGE_PRODUCTS = [
  {
    id: 101,
    name: 'Logitech G102 Lightsync RGB Gaming Mouse (Black)',
    category: 'เกมมิ่งเกียร์ & อุปกรณ์เสริม',
    brand: 'LOGITECH',
    model_no: '910-005802',
    lowest_price: 495,
    msrp: 890,
    max_discount_percent: 7.4,
    best_store_name: 'Advice IT Infinite',
    store_count: 4,
    image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=80',
    best_product_url: 'https://www.advice.co.th'
  },
  {
    id: 102,
    name: 'Razer DeathAdder Essential Gaming Mouse (Black)',
    category: 'เกมมิ่งเกียร์ & อุปกรณ์เสริม',
    brand: 'RAZER',
    model_no: 'RZ01-03850100',
    lowest_price: 550,
    msrp: 890,
    max_discount_percent: 7.4,
    best_store_name: 'iHaveCPU',
    store_count: 4,
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=80',
    best_product_url: 'https://www.ihavecpu.com'
  },
  {
    id: 103,
    name: 'Razer DeathAdder Essential Gaming Mouse (Mercury White)',
    category: 'เกมมิ่งเกียร์ & อุปกรณ์เสริม',
    brand: 'RAZER',
    model_no: 'RZ01-03850200',
    lowest_price: 550,
    msrp: 890,
    max_discount_percent: 7.4,
    best_store_name: 'iHaveCPU',
    store_count: 4,
    image_url: 'https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=500&auto=format&fit=crop&q=80',
    best_product_url: 'https://www.ihavecpu.com'
  },
  {
    id: 104,
    name: 'Logitech G502 HERO High Performance Gaming Mouse',
    category: 'เกมมิ่งเกียร์ & อุปกรณ์เสริม',
    brand: 'LOGITECH',
    model_no: '910-005472',
    lowest_price: 1050,
    msrp: 1990,
    max_discount_percent: 7.4,
    best_store_name: 'Advice IT Infinite',
    store_count: 4,
    image_url: 'https://images.unsplash.com/photo-1588691896791-5f21d3fcaee3?w=500&auto=format&fit=crop&q=80',
    best_product_url: 'https://www.advice.co.th'
  },
  {
    id: 105,
    name: 'ASUS TUF Gaming GeForce RTX 4070 SUPER 12GB GDDR6X OC',
    category: 'การ์ดจอ (GPU)',
    brand: 'ASUS',
    model_no: 'TUF-RTX4070S-O12G',
    lowest_price: 25650,
    msrp: 29900,
    max_discount_percent: 14.2,
    best_store_name: 'Advice IT Infinite',
    store_count: 4,
    image_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=80',
    best_product_url: 'https://www.advice.co.th'
  },
  {
    id: 106,
    name: 'MSI GeForce RTX 4060 Ti GAMING X 16G GDDR6 Dual Fan',
    category: 'การ์ดจอ (GPU)',
    brand: 'MSI',
    model_no: 'G4060TGX-16G',
    lowest_price: 17100,
    msrp: 18900,
    max_discount_percent: 9.5,
    best_store_name: 'iHaveCPU',
    store_count: 4,
    image_url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&auto=format&fit=crop&q=80',
    best_product_url: 'https://www.ihavecpu.com'
  },
  {
    id: 107,
    name: 'AMD Ryzen 7 7800X3D 8-Core 16-Thread Socket AM5',
    category: 'ซีพียู (CPU)',
    brand: 'AMD',
    model_no: '100-100000910WOF',
    lowest_price: 14900,
    msrp: 16900,
    max_discount_percent: 11.8,
    best_store_name: 'iHaveCPU',
    store_count: 4,
    image_url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&auto=format&fit=crop&q=80',
    best_product_url: 'https://www.ihavecpu.com'
  },
  {
    id: 108,
    name: 'Intel Core i7-14700K 20 Cores (8P+12E) 28 Threads',
    category: 'ซีพียู (CPU)',
    brand: 'INTEL',
    model_no: 'BX8071514700K',
    lowest_price: 15200,
    msrp: 16800,
    max_discount_percent: 9.5,
    best_store_name: 'Advice IT Infinite',
    store_count: 4,
    image_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&auto=format&fit=crop&q=80',
    best_product_url: 'https://www.advice.co.th'
  }
]

export default function HomePage({ user, compareList, setCompareList }) {
  const { t, lang } = useLanguage()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('All')
  const [storeFilter, setStoreFilter] = useState('')
  const [brandFilter, setBrandFilter] = useState('')

  // Modals
  const [activeChartProduct, setActiveChartProduct] = useState(null)
  const [activeAlertProduct, setActiveAlertProduct] = useState(null)

  // 10 Main Categories Grid from Figma
  const figmaCategories = [
    { name: lang === 'en' ? 'Graphics Cards (GPU)' : 'การ์ดจอ (GPU)', path: '/products?category=Graphics Cards (GPU)', icon: Layers, count: lang === 'en' ? '540 Items' : '540 รายการ', color: 'from-cyan-500/20 to-blue-600/20 text-cyan-400' },
    { name: lang === 'en' ? 'Processors (CPU)' : 'ซีพียู (CPU)', path: '/products?category=Processors (CPU)', icon: Cpu, count: lang === 'en' ? '218 Items' : '218 รายการ', color: 'from-purple-500/20 to-indigo-600/20 text-purple-400' },
    { name: lang === 'en' ? 'Memory (RAM)' : 'แรม (RAM)', path: '/products?category=Memory (RAM)', icon: Zap, count: lang === 'en' ? '325 Items' : '325 รายการ', color: 'from-cyan-500/20 to-teal-600/20 text-cyan-300' },
    { name: lang === 'en' ? 'Storage (SSD, HDD)' : 'ที่เก็บข้อมูล (SSD)', path: '/products?category=Storage (SSD, HDD)', icon: HardDrive, count: lang === 'en' ? '410 Items' : '410 รายการ', color: 'from-blue-500/20 to-indigo-600/20 text-blue-400' },
    { name: lang === 'en' ? 'Monitors' : 'จอมอนิเตอร์', path: '/products?category=Monitors', icon: Tv, count: lang === 'en' ? '280 Items' : '280 รายการ', color: 'from-purple-500/20 to-pink-600/20 text-purple-300' },
    { name: lang === 'en' ? 'Motherboards' : 'เมนบอร์ด (Board)', path: '/products?category=Motherboards', icon: Server, count: lang === 'en' ? '195 Items' : '195 รายการ', color: 'from-cyan-500/20 to-blue-600/20 text-cyan-400' },
    { name: lang === 'en' ? 'Power Supplies' : 'พาวเวอร์ซัพพลาย', path: '/products?category=Power Supplies (PSU)', icon: Zap, count: lang === 'en' ? '160 Items' : '160 รายการ', color: 'from-amber-500/20 to-orange-600/20 text-amber-400' },
    { name: lang === 'en' ? 'Case & Cooling' : 'เคส & ระบายความร้อน', path: '/products?category=Case & Cooling', icon: Wind, count: lang === 'en' ? '310 Items' : '310 รายการ', color: 'from-teal-500/20 to-emerald-600/20 text-teal-400' },
    { name: lang === 'en' ? 'Gaming Gear' : 'เกมมิ่งเกียร์', path: '/products?category=Accessories', icon: MousePointer, count: lang === 'en' ? '480 Items' : '480 รายการ', color: 'from-rose-500/20 to-purple-600/20 text-rose-400' },
    { name: lang === 'en' ? 'Laptops & Notebooks' : 'โน้ตบุ๊กทำงาน & เล่นเกม', path: '/products?category=Notebooks', icon: Laptop, count: lang === 'en' ? '230 Items' : '230 รายการ', color: 'from-blue-500/20 to-cyan-600/20 text-cyan-400' },
  ]

  // Category filter tabs for the Deals/Products section
  const dealCategoryTabs = [
    { key: 'All', label: lang === 'en' ? 'All Products' : 'สินค้าทั้งหมด', count: 26 },
    { key: 'Graphics Cards (GPU)', label: lang === 'en' ? 'Graphics Cards (GPU)' : 'การ์ดจอ (GPU)', count: 1 },
    { key: 'Processors (CPU)', label: lang === 'en' ? 'Processors (CPU)' : 'ซีพียู (CPU)', count: 4 },
    { key: 'Memory (RAM)', label: lang === 'en' ? 'Memory (RAM)' : 'แรม (RAM)', count: 2 },
    { key: 'Storage (SSD, HDD)', label: lang === 'en' ? 'Storage (SSD & HDD)' : 'ที่เก็บข้อมูล (SSD & HDD)', count: 4 },
    { key: 'Monitors', label: lang === 'en' ? 'Monitors' : 'จอมอนิเตอร์ & หน้าจอ', count: 2 },
    { key: 'Motherboards', label: lang === 'en' ? 'Motherboards' : 'เมนบอร์ด (Mainboard)', count: 3 },
  ]

  useEffect(() => {
    loadHomeData()
  }, [])

  const loadHomeData = async () => {
    setLoading(true)
    try {
      const res = await productApi.getProducts({ limit: 100 })
      if (res.data && res.data.length > 0) {
        setProducts(res.data)
      } else {
        setProducts(MOCK_HOMEPAGE_PRODUCTS)
      }
    } catch (e) {
      console.warn('Backend products fetch notice, utilizing high-fidelity mock:', e)
      setProducts(MOCK_HOMEPAGE_PRODUCTS)
    } finally {
      setLoading(false)
    }
  }

  const handleHeroSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/products')
    }
  }

  const handleToggleCompare = (product) => {
    const exists = compareList.find(p => p.id === product.id)
    if (exists) {
      setCompareList(compareList.filter(p => p.id !== product.id))
    } else {
      if (compareList.length >= 4) {
        alert(t.compare?.maxItemsNotice || 'สามารถเปรียบเทียบได้สูงสุด 4 รายการ')
        return
      }
      setCompareList([...compareList, product])
    }
  }

  // Filter products for display in Deals grid
  const displayedProducts = products.filter(p => {
    if (selectedFilterCategory !== 'All' && p.category !== selectedFilterCategory) return false
    if (storeFilter && !((p.best_store_name || '').toLowerCase().includes(storeFilter.toLowerCase()))) return false
    if (brandFilter && !((p.brand || '').toLowerCase().includes(brandFilter.toLowerCase()))) return false
    return true
  })

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">

      {/* SECTION 1: HERO COMMAND CENTER - GALAXY PURPLE THEME */}
      <section className="relative pt-6 sm:pt-10 pb-6 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
        {/* Enclosing Galaxy Cosmic Card matching Figma */}
        <div className="relative rounded-3xl border border-purple-500/35 bg-[#0E061E]/80 backdrop-blur-xl p-6 sm:p-12 text-center overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.22)]">
          {/* Radiant Purple Nebula Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-b from-purple-600/40 via-violet-600/20 to-transparent blur-[85px] rounded-full pointer-events-none" />
          <div className="absolute -top-16 left-1/4 w-[350px] h-[250px] bg-indigo-600/20 blur-[90px] rounded-full pointer-events-none" />
          <div className="absolute -top-16 right-1/4 w-[350px] h-[250px] bg-purple-500/25 blur-[90px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            {/* Beacon pill */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#160B2E]/90 border border-purple-500/40 text-cyan-300 text-xs font-semibold mb-6 shadow-[0_0_15px_rgba(139,92,246,0.25)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>{lang === 'en' ? 'IT Hardware Price Tracker & Alert System in Thailand' : 'ระบบติดตามและแจ้งเตือนราคาอุปกรณ์ไอทีประเทศไทย'}</span>
            </div>

            {/* Huge futuristic title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display text-white leading-normal sm:leading-[1.35] lg:leading-[1.4] max-w-4xl mx-auto mb-4 py-1">
              {lang === 'en' ? (
                <>Compare <span className="text-cyan-400">IT Hardware Prices</span> Across<br className="hidden sm:inline" /> Leading Stores in Thailand</>
              ) : (
                <>เปรียบเทียบ <span className="text-cyan-400">ราคาอุปกรณ์ไอที</span> จาก<br className="hidden sm:inline" />ร้านค้าชั้นนำในไทย</>
              )}
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
              {lang === 'en'
                ? 'Real-time price comparison across GPUs, CPUs, Laptops, SSDs, and Monitors from JIB, iHaveCPU, BaNANA IT, and Advice.'
                : 'ระบบรวบรวมราคาแบบเรียลไทม์ เปรียบเทียบราคาการ์ดจอ ซีพียู โน้ตบุ๊ก SSD จอมอนิเตอร์ จาก JIB, iHaveCPU, BaNANA IT และ Advice'}
            </p>

            {/* Big Search Box with glowing input */}
            <div className="max-w-2xl mx-auto mb-10 text-left">
              <div className="flex items-center space-x-1.5 text-xs text-cyan-400 mb-2 font-medium">
                <Search className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'en' ? 'Search and compare product prices' : 'ค้นหาและเปรียบเทียบราคาสินค้า'}</span>
              </div>

              <form 
                onSubmit={handleHeroSearch}
                className="flex items-center bg-[#070312]/95 border-2 border-purple-500/40 hover:border-purple-400 focus-within:border-cyan-400 rounded-2xl p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_30px_rgba(139,92,246,0.3)] transition-all"
              >
                <div className="pl-3 sm:pl-4 text-cyan-400">
                  <Search className="w-5 h-5 text-cyan-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'en' ? 'Search GPUs (RTX 5090, 4070), CPUs (9800X3D), Laptops, SSDs...' : 'ค้นหาการ์ดจอ (RTX 5090, 4070), ซีพียู (9800X3D), โน้ตบุ๊ก, SSD...'}
                  className="w-full bg-transparent px-3 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 flex-shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                >
                  <span>{lang === 'en' ? 'Search' : 'ค้นหา'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick search tags */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] text-slate-300">
                <span className="font-semibold text-purple-300">{lang === 'en' ? 'Popular Keywords:' : 'คีย์เวิร์ดยอดนิยม:'}</span>
                {[
                  { tag: 'RTX 5080', query: 'RTX 5080' },
                  { tag: 'Ryzen 7 9800X3D', query: 'Ryzen 7 9800X3D' },
                  { tag: '990 PRO 2TB', query: '990 PRO 2TB' },
                  { tag: 'DDR5 32GB', query: 'DDR5 32GB' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => navigate(`/products?q=${encodeURIComponent(item.query)}`)}
                    className="px-2.5 py-0.5 rounded-full bg-[#160B2E] hover:bg-purple-600/30 border border-purple-500/25 hover:border-purple-400 text-purple-200 hover:text-white transition-all"
                  >
                    {item.tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Stat Counter Cards matching Figma */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
              <div className="bg-[#120826]/90 border border-purple-500/25 hover:border-purple-400/50 rounded-2xl p-4 text-left flex items-center space-x-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-display text-white">26+</div>
                  <div className="text-[11px] text-slate-400">{lang === 'en' ? 'Tracked Products' : 'สินค้าที่ติดตามในระบบ'}</div>
                </div>
              </div>

              <div className="bg-[#120826]/90 border border-purple-500/25 hover:border-purple-400/50 rounded-2xl p-4 text-left flex items-center space-x-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-display text-white">{lang === 'en' ? '4 Stores' : '4 ร้านค้า'}</div>
                  <div className="text-[11px] text-slate-400">JIB, iHaveCPU, BaNA...</div>
                </div>
              </div>

              <div className="bg-[#120826]/90 border border-purple-500/25 hover:border-purple-400/50 rounded-2xl p-4 text-left flex items-center space-x-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-display text-white">104</div>
                  <div className="text-[11px] text-slate-400">{lang === 'en' ? 'Price Comparisons' : 'รายการราคาเปรียบเทียบ'}</div>
                </div>
              </div>

              <div className="bg-[#120826]/90 border border-purple-500/25 hover:border-purple-400/50 rounded-2xl p-4 text-left flex items-center space-x-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-bold text-white">{lang === 'en' ? 'Alert System' : 'ระบบแจ้งเตือน'}</div>
                  <div className="text-[11px] text-slate-400">{lang === 'en' ? 'Alerts on price drops...' : 'ส่งสัญญาณเมื่อราคา...'}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: FEATURED CAMPAIGN 2026 BANNER */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-purple-500/35 bg-gradient-to-r from-[#1C0B36] via-[#130726] to-[#0A0314] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(139,92,246,0.22)]">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-purple-600/20 via-violet-600/10 to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left copy */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[11px] font-bold tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>FEATURED CAMPAIGN 2026</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black font-display text-white tracking-tight">
                Galaxy Tech Fest 2026
              </h2>

              <p className="text-base sm:text-lg font-semibold text-cyan-300">
                {lang === 'en' ? 'Top GPU deals up to 30% off across 4 leading retailers' : 'รวมดีลการ์ดจอลดสูงสุด 30% จาก 4 ร้านดัง'}
              </p>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
                {lang === 'en' ? 'Second-by-second stock verification, exclusive coupons for IT PRICE users, and 90-day lowest price trend analysis.' : 'ตรวจเช็คสต็อกแบบวินาทีต่อวินาที คูปองส่วนลดพิเศษเฉพาะผู้ใช้งาน IT PRICE พร้อมกราฟวิเคราะห์แนวโน้มราคาต่ำสุดในรอบ 90 วัน'}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/products?category=Graphics Cards (GPU)')}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center space-x-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>{lang === 'en' ? 'View All Campaign Deals' : 'ดูสินค้าจัดรายการทั้งหมด'}</span>
                </button>

                <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#140826] border border-purple-500/25 text-xs text-slate-300 font-mono">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>{lang === 'en' ? 'Campaign ends in 4d 12h' : 'สิ้นสุดแคมเปญในอีก 4 วัน 12 ชม.'}</span>
                </div>
              </div>
            </div>

            {/* Right GPU Graphic with badge */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-purple-500/30 bg-[#0B0418] p-4 shadow-[0_0_40px_rgba(139,92,246,0.25)]">
                <img
                  src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80"
                  alt="GeForce RTX Campaign"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <div className="absolute bottom-6 right-6 px-3 py-1 rounded-lg bg-[#0B0418]/90 border border-orange-500/50 text-[#F97316] font-display text-xs font-bold tracking-wider shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                  SAVE UP TO ฿12,400
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ALL CATEGORIES (10 TILES) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-400">
              <LayoutGrid className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                {lang === 'en' ? 'All Categories' : 'หมวดหมู่ทั้งหมด (All Categories)'}
              </h2>
              <p className="text-xs text-slate-400">{lang === 'en' ? 'Select a category to search and compare PC hardware specifications' : 'เลือกหมวดหมู่ที่ต้องการค้นหาและเปรียบเทียบสเปกคอมพิวเตอร์'}</p>
            </div>
          </div>

          <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-[#160B2E] border border-purple-500/30 text-xs font-mono text-purple-300">
            {lang === 'en' ? '10 Core Categories' : '10 หมวดหมู่หลัก'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {figmaCategories.map((c, i) => {
            const Icon = c.icon
            return (
              <Link
                key={i}
                to={c.path}
                className="bg-[#120826]/85 rounded-2xl p-4 flex flex-col items-center text-center group border border-purple-500/20 hover:border-purple-400 hover:bg-[#1A0B36] hover:shadow-[0_0_25px_rgba(139,92,246,0.35)] transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1C0F3A] border border-purple-500/30 flex items-center justify-center mb-3 group-hover:scale-110 text-cyan-400 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-purple-300 transition-colors">
                  {c.name}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono mt-1">
                  {c.count}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* SECTION 4: POPULAR CATEGORIES (3 SPOTLIGHT CARDS) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4 fill-rose-400" />
            <span>{lang === 'en' ? 'Popular Categories' : 'หมวดหมู่ยอดนิยม (Popular Categories)'}</span>
          </div>
          <p className="text-xs text-slate-400">{lang === 'en' ? 'Trending hardware searches and PC building picks this week' : 'ฮิตติดเทรนด์การค้นหาและประกอบคอมพิวเตอร์ในสัปดาห์นี้'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <Link
            to="/products?category=Graphics Cards (GPU)"
            className="bg-[#120826]/85 rounded-2xl p-5 border border-purple-500/25 hover:border-purple-400 hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] flex flex-col justify-between group transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold tracking-wider">
                  ↗ TRENDING #1
                </span>
              </div>
              <h3 className="text-base font-bold font-display text-white group-hover:text-cyan-300 transition-colors mb-2">
                {lang === 'en' ? 'RTX 50 Series GPUs' : 'การ์ดจอ RTX 50 Series'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {lang === 'en' ? 'Blackwell architecture with cutting-edge AI power. Daily price checks on RTX 5090, 5080, and 5070.' : 'สถาปัตยกรรม Blackwell ขุมพลัง AI รุ่นล่าสุด เช็คราคารายวัน ทั้ง RTX 5090, 5080 และ 5070'}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-purple-500/20 pt-3">
              <span className="text-cyan-400 font-mono font-bold">{lang === 'en' ? 'Starting at ฿24,900' : 'ราคาเริ่มต้น ฿24,900'}</span>
              <span className="text-slate-400 font-mono text-[11px] bg-[#1C0F3A] px-2 py-0.5 rounded border border-purple-500/20">{lang === 'en' ? '48 models' : '48 รุ่นย่อย'}</span>
            </div>
          </Link>

          {/* Card 2 */}
          <Link
            to="/products?category=Processors (CPU)"
            className="bg-[#120826]/85 rounded-2xl p-5 border border-purple-500/25 hover:border-purple-400 hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] flex flex-col justify-between group transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-bold tracking-wider flex items-center">
                  <Gamepad2 className="w-3 h-3 mr-1 text-purple-300" />
                  <span>GAMING KING</span>
                </span>
              </div>
              <h3 className="text-base font-bold font-display text-white group-hover:text-purple-300 transition-colors mb-2">
                {lang === 'en' ? 'AMD Ryzen 9000 & X3D' : 'AMD Ryzen 9000 & X3D'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {lang === 'en' ? 'Ultimate processor for gamers. Zen 5 with 3D V-Cache delivers smooth framerates in every title.' : 'สุดยอดชิปประมวลผลสำหรับเกมเมอร์ Zen 5 พร้อม 3D V-Cache ลื่นไหลทุกเฟรมเรต'}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-purple-500/20 pt-3">
              <span className="text-purple-400 font-mono font-bold">{lang === 'en' ? 'Starting at ฿11,500' : 'ราคาเริ่มต้น ฿11,500'}</span>
              <span className="text-slate-400 font-mono text-[11px] bg-[#1C0F3A] px-2 py-0.5 rounded border border-purple-500/20">{lang === 'en' ? '24 models' : '24 รุ่นย่อย'}</span>
            </div>
          </Link>

          {/* Card 3 */}
          <Link
            to="/products?category=Memory (RAM)"
            className="bg-[#120826]/85 rounded-2xl p-5 border border-purple-500/25 hover:border-purple-400 hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] flex flex-col justify-between group transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold tracking-wider inline-flex items-center">
                  <Award className="w-3 h-3 text-amber-400 mr-1" />
                  <span>BEST VALUE</span>
                </span>
              </div>
              <h3 className="text-base font-bold font-display text-white group-hover:text-amber-300 transition-colors mb-2">
                {lang === 'en' ? 'DDR5 6000MHz+ RAM' : 'แรม DDR5 6000MHz+'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {lang === 'en' ? 'New high-end PC standard. High frequency, ultra-low latency with EXPO & XMP 3.0 profiles.' : 'มาตรฐานใหม่ของพีซีไฮเอนด์ บัสสูง ค่า Latency ต่ำ พร้อมโปรไฟล์ EXPO & XMP 3.0'}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-purple-500/20 pt-3">
              <span className="text-cyan-400 font-mono font-bold">{lang === 'en' ? 'Starting at ฿3,690' : 'ราคาเริ่มต้น ฿3,690'}</span>
              <span className="text-slate-400 font-mono text-[11px] bg-[#1C0F3A] px-2 py-0.5 rounded border border-purple-500/20">{lang === 'en' ? '64 models' : '64 รุ่นย่อย'}</span>
            </div>
          </Link>
        </div>
      </section>

      {/* SECTION 5: LIVE DEALS & PRICE COMPARISON GRID */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-rose-400 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono text-[10px] flex items-center space-x-1">
                <Activity className="w-3 h-3 text-rose-400" />
                <span>LIVE DEALS</span>
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                {lang === 'en' ? 'Hot Deals & Latest Price Comparison' : 'สินค้า Hot Deal & เปรียบเทียบราคาล่าสุด'}
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              {lang === 'en' ? 'Special discounted hardware curated for the best prices in Thailand today' : 'สินค้าลดราคาพิเศษ คัดสรรราคาที่ถูกที่สุดในประเทศไทยประจำวันนี้'}
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <span>{lang === 'en' ? `Showing ${displayedProducts.length} items` : `แสดงสินค้า ${displayedProducts.length} รายการ`}</span>
            <span className="text-purple-400/40">|</span>
            <span className="text-cyan-400 font-medium">{lang === 'en' ? 'Sorted by: Lowest Price First' : 'เรียงตาม: ราคาถูกที่สุดก่อน'}</span>
          </div>
        </div>

        {/* Category Pills Bar matching Figma */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {dealCategoryTabs.map((tab) => {
            const active = selectedFilterCategory === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedFilterCategory(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  active
                    ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold shadow-[0_0_15px_rgba(124,58,237,0.6)]'
                    : 'bg-[#140826] text-slate-300 hover:text-white hover:bg-purple-900/30 border border-purple-500/20'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${active ? 'bg-white/20' : 'bg-purple-950/60 text-purple-300'}`}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Filter Toolbar (Store, Max Price, Brand) in Galaxy Purple */}
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-[#120826] border border-purple-500/25 text-xs">
          {/* Store select */}
          <div className="flex items-center space-x-2 bg-[#1C0F3A]/70 border border-purple-500/25 px-3 py-1.5 rounded-xl">
            <span className="text-purple-300">{lang === 'en' ? 'Store:' : 'ร้านค้า:'}</span>
            <select
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-[#120826] text-white">{lang === 'en' ? 'All Thai Stores (4 Major Stores)' : 'ทุกร้านค้าไทย (4 ร้านหลัก)'}</option>
              <option value="advice" className="bg-[#120826] text-white">Advice IT Infinite</option>
              <option value="ihavecpu" className="bg-[#120826] text-white">iHaveCPU</option>
              <option value="jib" className="bg-[#120826] text-white">JIB Online</option>
              <option value="banana" className="bg-[#120826] text-white">BaNANA IT</option>
            </select>
          </div>

          {/* Brand select */}
          <div className="flex items-center space-x-2 bg-[#1C0F3A]/70 border border-purple-500/25 px-3 py-1.5 rounded-xl">
            <span className="text-purple-300">{lang === 'en' ? 'Brand:' : 'แบรนด์:'}</span>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-[#120826] text-white">{lang === 'en' ? 'All Brands' : 'ทุกแบรนด์'}</option>
              <option value="logitech" className="bg-[#120826] text-white">Logitech</option>
              <option value="razer" className="bg-[#120826] text-white">Razer</option>
              <option value="asus" className="bg-[#120826] text-white">ASUS</option>
              <option value="msi" className="bg-[#120826] text-white">MSI</option>
              <option value="amd" className="bg-[#120826] text-white">AMD</option>
              <option value="intel" className="bg-[#120826] text-white">Intel</option>
            </select>
          </div>

          {(storeFilter || brandFilter) && (
            <button
              onClick={() => { setStoreFilter(''); setBrandFilter('') }}
              className="text-xs text-rose-400 hover:underline ml-auto"
            >
              {lang === 'en' ? 'Clear Filters' : 'ล้างตัวกรอง'}
            </button>
          )}
        </div>

        {/* Product Cards Grid (4 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenChart={(p) => setActiveChartProduct(p)}
              onOpenAlert={(p) => setActiveAlertProduct(p)}
              onToggleCompare={handleToggleCompare}
              isSelectedForCompare={compareList.some(c => c.id === product.id)}
            />
          ))}
        </div>
      </section>

      {/* SECTION 6: PARTNER SHOPS & BRANDS */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 mb-1">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-lg sm:text-xl font-bold font-display text-white">
              {lang === 'en' ? 'Partner Shops & Leading Brands' : 'ร้านค้าพันธมิตร & แบรนด์ชั้นนำ (Partner Shops & Brands)'}
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            {lang === 'en' ? 'Real-time stock and price synchronization from authorized computer hardware distributors' : 'ดึงข้อมูลสต็อกและราคาเรียลไทม์จากตัวแทนจำหน่ายอุปกรณ์คอมพิวเตอร์อย่างเป็นทางการ'}
          </p>
        </div>

        {/* 4 Partner Store Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#120826]/85 rounded-2xl p-4 flex items-center space-x-3.5 border border-purple-500/25 hover:border-purple-400/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs font-mono">
              JIB
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">JIB Computer</h4>
              <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{lang === 'en' ? 'Online Stock 99.4%' : 'สต็อกออนไลน์ 99.4%'}</span>
              </p>
            </div>
          </div>

          <div className="bg-[#120826]/85 rounded-2xl p-4 flex items-center space-x-3.5 border border-purple-500/25 hover:border-purple-400/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400 text-xs font-mono">
              iHAVE<br/>CPU
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">iHaveCPU</h4>
              <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{lang === 'en' ? 'Express Delivery BKK' : 'จัดส่งด่วนกทม.'}</span>
              </p>
            </div>
          </div>

          <div className="bg-[#120826]/85 rounded-2xl p-4 flex items-center space-x-3.5 border border-purple-500/25 hover:border-purple-400/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-xs font-mono">
              BNN
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">BaNANA IT</h4>
              <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{lang === 'en' ? '0% Installment Offers' : 'โปรโมชั่นผ่อน 0%'}</span>
              </p>
            </div>
          </div>

          <div className="bg-[#120826]/85 rounded-2xl p-4 flex items-center space-x-3.5 border border-purple-500/25 hover:border-purple-400/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 text-xs font-mono">
              ADVICE
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Advice IT Infinite</h4>
              <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{lang === 'en' ? 'Express 3-Hour Delivery' : 'จัดส่งด่วน 3 ชม.'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Brand ticker strip */}
        <div className="p-4 rounded-2xl bg-[#0D051C] border border-purple-500/20 flex flex-wrap items-center justify-around gap-6 text-purple-200/70 font-cyber font-bold text-xs sm:text-sm tracking-widest">
          <span className="hover:text-cyan-400 transition-colors cursor-pointer">ASUS ROG</span>
          <span className="hover:text-cyan-400 transition-colors cursor-pointer">MSI GAMING</span>
          <span className="hover:text-cyan-400 transition-colors cursor-pointer">GIGABYTE AORUS</span>
          <span className="hover:text-cyan-400 transition-colors cursor-pointer">CORSAIR</span>
          <span className="hover:text-cyan-400 transition-colors cursor-pointer">NZXT</span>
          <span className="hover:text-cyan-400 transition-colors cursor-pointer">ZOTAC GAMING</span>
        </div>
      </section>

      {/* SECTION 7: ARTICLES & TECH GUIDES */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 mb-1">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                {lang === 'en' ? 'Featured Articles & Tech Guides' : 'บทความ & ทริคไอทีแนะนำ (Articles & Tech Guides)'}
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              {lang === 'en' ? 'In-depth reviews, PC build guides, and smart purchasing tips' : 'รีวิวเจาะลึก คู่มือจัดสเปกคอมพิวเตอร์ และเทคนิคเลือกซื้อของคุ้มค่าเงิน'}
            </p>
          </div>

          <Link
            to="/products"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>{lang === 'en' ? 'View All' : 'อ่านทั้งหมด'}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Guide 1 */}
          <div className="bg-[#120826]/85 rounded-2xl overflow-hidden border border-purple-500/20 hover:border-purple-400 hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-all flex flex-col justify-between group">
            <div className="relative h-44 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop&q=80"
                alt="Guide 2026"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-cyan-500 text-black font-display text-[10px] font-bold">
                GUIDE 2026
              </span>
            </div>
            <div className="p-4 space-y-2">
              <div className="text-[11px] text-slate-500 font-mono">{lang === 'en' ? 'Feb 12, 2026 • 5 min read' : '12 ก.พ. 2026 • อ่าน 5 นาที'}</div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                {lang === 'en' ? '30,000 THB PC Build Guide 2026: Smooth 2K Gaming for All AAA Titles' : 'จัดสเปกคอมงบ 30,000 บาท ปี 2026 เล่นลื่นทุกเกม AAA ในระดับ 2K'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {lang === 'en' ? 'Balanced budget breakdown between RTX 4060 Ti / 5060 and next-gen Core i5, saving up to ฿3,500.' : 'วิเคราะห์การจัดงบสมดุลระหว่างการ์ดจอ RTX 4060 Ti / 5060 กับซีพียู Core i5 เจนใหม่ พร้อมวิธีเทียบราคาประหยัดได้ถึง 3,500'}
              </p>
              <div className="pt-2 text-xs font-semibold text-cyan-400 flex items-center space-x-1">
                <span>{lang === 'en' ? 'Read Full Article' : 'อ่านบทความฉบับเต็ม'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Guide 2 */}
          <div className="bg-[#120826]/85 rounded-2xl overflow-hidden border border-purple-500/20 hover:border-purple-400 hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-all flex flex-col justify-between group">
            <div className="relative h-44 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80"
                alt="Benchmark"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-purple-500 text-white font-display text-[10px] font-bold">
                BENCHMARK
              </span>
            </div>
            <div className="p-4 space-y-2">
              <div className="text-[11px] text-slate-500 font-mono">{lang === 'en' ? 'Feb 10, 2026 • 8 min read' : '10 ก.พ. 2026 • อ่าน 8 นาที'}</div>
              <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors leading-snug">
                {lang === 'en' ? 'RTX 5080 Deep Dive: Is Launch Price Worth It? Benchmark vs 4080 Super' : 'เจาะลึก RTX 5080 คุ้มไหมกับราคาเปิดตัว? เทียบผลทดสอบจริง vs 4080 Super'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {lang === 'en' ? 'Blackwell architecture efficiency, real power draw, and price-to-performance charts.' : 'เจาะลึกประสิทธิภาพสถาปัตยกรรม Blackwell อัตราการกินไฟจริง และกราฟเปรียบเทียบราคาต่อเฟรมเรตที่คุณต้องรู้ก่อนจ่ายเงิน'}
              </p>
              <div className="pt-2 text-xs font-semibold text-purple-400 flex items-center space-x-1">
                <span>{lang === 'en' ? 'Read Full Article' : 'อ่านบทความฉบับเต็ม'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Guide 3 */}
          <div className="bg-[#120826]/85 rounded-2xl overflow-hidden border border-purple-500/20 hover:border-purple-400 hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-all flex flex-col justify-between group">
            <div className="relative h-44 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=80"
                alt="Hardware 101"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-emerald-500 text-black font-display text-[10px] font-bold">
                HARDWARE 101
              </span>
            </div>
            <div className="p-4 space-y-2">
              <div className="text-[11px] text-slate-500 font-mono">{lang === 'en' ? 'Feb 08, 2026 • 4 min read' : '08 ก.พ. 2026 • อ่าน 4 นาที'}</div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                {lang === 'en' ? 'How to Choose DDR5 RAM for Intel & AMD Motherboards Without BSOD' : 'วิธีเลือก RAM DDR5 ให้เข้ากับเมนบอร์ด Intel & AMD ไม่ให้จอฟ้า'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {lang === 'en' ? 'Understanding XMP 3.0 vs AMD EXPO, checking QVL lists, and best stable frequencies.' : 'เข้าใจความแตกต่างระหว่างโปรไฟล์ XMP 3.0 กับ AMD EXPO, วิธีเช็ครายชื่อ QVL List และความเร็วบัสที่เสถียรที่สุดในปัจจุบัน'}
              </p>
              <div className="pt-2 text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                <span>{lang === 'en' ? 'Read Full Article' : 'อ่านบทความฉบับเต็ม'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      {activeChartProduct && (
        <PriceChartModal
          product={activeChartProduct}
          onClose={() => setActiveChartProduct(null)}
          onSetAlert={(p) => {
            setActiveChartProduct(null)
            setActiveAlertProduct(p)
          }}
        />
      )}

      {activeAlertProduct && (
        <AlertModal
          product={activeAlertProduct}
          user={user}
          onClose={() => setActiveAlertProduct(null)}
        />
      )}

    </div>
  )
}
