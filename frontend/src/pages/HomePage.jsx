import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
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
  Activity,
  RotateCw,
  ExternalLink,
  Store,
  Tag,
  Info,
  Check
} from 'lucide-react'
import { productApi } from '../api/client'
import ProductCard from '../components/ProductCard'
import PriceChartModal from '../components/PriceChartModal'
import AlertModal from '../components/AlertModal'
import { useLanguage } from '../i18n/LanguageContext'

import { Helmet } from 'react-helmet-async'

// 14 Recommended Official Hardware Brands (2 rows x 7 cols) per SUMMARY_CHANGES.md
const RECOMMENDED_BRANDS = [
  { name: 'Kingston', url: 'https://www.kingston.com/th', logoText: 'Kingston' },
  { name: 'Logitech', url: 'https://www.logitech.com/th-th', logoText: 'logitech' },
  { name: 'AMD', url: 'https://www.amd.com/th', logoText: 'AMD' },
  { name: 'Corsair', url: 'https://www.corsair.com', logoText: 'CORSAIR' },
  { name: 'GIGABYTE', url: 'https://www.gigabyte.com/th', logoText: 'GIGABYTE' },
  { name: 'Razer', url: 'https://www.razer.com/th-th', logoText: 'RAZER' },
  { name: 'ASUS', url: 'https://www.asus.com/th/', logoText: 'ASUS' },
  { name: 'Intel', url: 'https://www.intel.co.th', logoText: 'intel' },
  { name: 'MSI', url: 'https://th.msi.com', logoText: 'msi' },
  { name: 'ASRock', url: 'https://www.asrock.com', logoText: 'ASRock' },
  { name: 'Western Digital', url: 'https://www.westerndigital.com/th-th', logoText: 'Western Digital' },
  { name: 'NZXT', url: 'https://nzxt.com', logoText: 'NZXT' },
  { name: 'LG', url: 'https://www.lg.com/th', logoText: 'LG' },
  { name: 'Dahua', url: 'https://www.dahuasecurity.com/th', logoText: 'dahua' }
]

// 4 Leading Thai IT Stores per SUMMARY_CHANGES.md
const RECOMMENDED_STORES = [
  {
    name: 'Advice IT Infinite',
    slug: 'advice',
    url: 'https://www.advice.co.th',
    color: '#06B6D4',
    badge: 'ADVICE',
    descEn: 'Over 350 branches nationwide • Express 3-hr delivery',
    descTh: 'กว่า 350 สาขาทั่วประเทศ • จัดส่งด่วน 3 ชม. • สต็อกครบ'
  },
  {
    name: 'JIB Online',
    slug: 'jib',
    url: 'https://www.jib.co.th',
    color: '#F59E0B',
    badge: 'JIB',
    descEn: 'Online stock 99.4% • Instant store pickup & delivery',
    descTh: 'สต็อกออนไลน์เรียลไทม์ 99.4% • รับสินค้าที่สาขาใน 2 ชม.'
  },
  {
    name: 'iHaveCPU',
    slug: 'ihavecpu',
    url: 'https://www.ihavecpu.com',
    color: '#8B5CF6',
    badge: 'iHAVE',
    descEn: 'Premier PC build specialist • Expert hardware testing',
    descTh: 'ผู้เชี่ยวชาญการจัดสเปกคอมพิวเตอร์ • เทสอุปกรณ์ก่อนส่ง'
  },
  {
    name: 'BaNANA IT',
    slug: 'banana',
    url: 'https://www.bnn.in.th',
    color: '#10B981',
    badge: 'BNN',
    descEn: '600+ store branches • 0% installment up to 24 months',
    descTh: 'สาขาครอบคลุมทั่วไทย • โปรโมชั่นผ่อน 0% นานสูงสุด 24 ด.'
  }
]

export default function HomePage({ user, compareList, setCompareList }) {
  const { t, lang } = useLanguage()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(16) // Initial 16 items (4 rows x 4 items)
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
    { key: 'All', label: lang === 'en' ? 'All Products' : 'สินค้าทั้งหมด', count: products.length || 31 },
    { key: 'Graphics Cards (GPU)', label: lang === 'en' ? 'Graphics Cards (GPU)' : 'การ์ดจอ (GPU)', count: products.filter(p => p.category === 'Graphics Cards (GPU)').length || 4 },
    { key: 'Processors (CPU)', label: lang === 'en' ? 'Processors (CPU)' : 'ซีพียู (CPU)', count: products.filter(p => p.category === 'Processors (CPU)').length || 6 },
    { key: 'Memory (RAM)', label: lang === 'en' ? 'Memory (RAM)' : 'แรม (RAM)', count: products.filter(p => p.category === 'Memory (RAM)').length || 4 },
    { key: 'Storage (SSD & HDD)', label: lang === 'en' ? 'Storage (SSD & HDD)' : 'ที่เก็บข้อมูล (SSD & HDD)', count: products.filter(p => p.category === 'Storage (SSD & HDD)').length || 5 },
    { key: 'Monitors & Displays', label: lang === 'en' ? 'Monitors & Displays' : 'จอมอนิเตอร์ & หน้าจอ', count: products.filter(p => p.category === 'Monitors & Displays').length || 4 },
    { key: 'Motherboards', label: lang === 'en' ? 'Motherboards' : 'เมนบอร์ด (Mainboard)', count: products.filter(p => p.category === 'Motherboards').length || 4 },
  ]

  useEffect(() => {
    loadHomeData()
  }, [])

  const loadHomeData = async () => {
    setLoading(true)
    try {
      const res = await productApi.getProducts({ limit: 100 })
      const items = res?.data?.items || (Array.isArray(res?.data) ? res.data : [])
      setProducts(items)
    } catch (e) {
      console.warn('Backend products fetch notice:', e)
      setProducts([])
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
        toast.error(t.compare?.maxItemsNotice || 'สามารถเปรียบเทียบได้สูงสุด 4 รายการ')
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

  // Paginated display slice: initial 16, +8 on click
  const visibleProducts = displayedProducts.slice(0, visibleCount)

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      <Helmet>
        <title>{lang === 'en' ? 'IT PRICE | Compare PC Hardware Prices in Thailand' : 'IT PRICE | เปรียบเทียบราคาอุปกรณ์คอมพิวเตอร์ในไทย'}</title>
        <meta name="description" content={lang === 'en' ? 'Compare prices for GPUs, CPUs, RAM, SSDs, and Monitors from leading Thai IT stores. Real-time updates and price drop alerts.' : 'เปรียบเทียบราคาการ์ดจอ ซีพียู แรม SSD จาก Advice, JIB, BaNANA, iHaveCPU พร้อมระบบแจ้งเตือนราคาลด'} />
        <meta property="og:title" content="IT PRICE | สแกนราคาฮาร์ดแวร์ที่ดีที่สุด" />
        <meta property="og:description" content="ระบบเปรียบเทียบราคาและแจ้งเตือนอุปกรณ์ไอทีอันดับ 1 ของไทย" />
      </Helmet>

      {/* SECTION 1: HERO COMMAND CENTER - GALAXY PURPLE THEME */}
      <section className="relative pt-6 sm:pt-10 pb-6 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
        {/* Enclosing Galaxy Cosmic Card matching Figma */}
        <div className="relative rounded-3xl border border-purple-500/35 bg-[#0E061E]/80 backdrop-blur-xl p-6 sm:p-12 text-center overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.22)]">
          {/* Radiant Purple Nebula Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-b from-purple-600/40 via-violet-600/20 to-transparent blur-[85px] rounded-full pointer-events-none" />
          <div className="absolute -top-16 left-1/4 w-[350px] h-[250px] bg-indigo-600/20 blur-[90px] rounded-full pointer-events-none" />
          <div className="absolute -top-16 right-1/4 w-[350px] h-[250px] bg-purple-500/25 blur-[90px] rounded-full pointer-events-none" />

          <div className="relative z-10">


            {/* Huge futuristic title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display text-white leading-normal sm:leading-[1.35] lg:leading-[1.4] max-w-4xl mx-auto mb-4 py-1">
              {lang === 'en' ? (
                <>Compare <span className="text-cyan-400">IT Hardware Prices</span> Across<br className="hidden sm:inline" /> Leading Stores in Thailand</>
              ) : (
                <>เปรียบเทียบ <span className="text-cyan-400">ราคาอุปกรณ์ไอที</span> จาก<br className="hidden sm:inline" />ร้านค้าชั้นนำในไทย</>
              )}
            </h1>



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
                  placeholder={lang === 'en' ? 'Search GPUs (RTX 4070, 3050), CPUs (9800X3D, 7800X3D), SSDs, RAM...' : 'ค้นหาการ์ดจอ (RTX 4070, 3050), ซีพียู (9800X3D, 7800X3D), SSD, แรม...'}
                  className="w-full bg-transparent px-3 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 flex-shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
                >
                  <span>{lang === 'en' ? 'Search' : 'ค้นหา'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick search tags */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] text-slate-300">
                <span className="font-semibold text-purple-300">{lang === 'en' ? 'Popular Keywords:' : 'คีย์เวิร์ดยอดนิยม:'}</span>
                {[
                  { tag: 'Ryzen 7 9800X3D', query: 'Ryzen 7 9800X3D' },
                  { tag: 'Ryzen 7 7800X3D', query: 'Ryzen 7 7800X3D' },
                  { tag: 'RTX 4070 SUPER', query: 'RTX 4070 SUPER' },
                  { tag: 'Samsung 990 PRO 2TB', query: '990 PRO' },
                  { tag: 'DDR5 32GB', query: 'DDR5' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => navigate(`/products?q=${encodeURIComponent(item.query)}`)}
                    className="px-2.5 py-0.5 rounded-full bg-[#160B2E] hover:bg-purple-600/30 border border-purple-500/25 hover:border-purple-400 text-purple-200 hover:text-white transition-all cursor-pointer"
                  >
                    {item.tag}
                  </button>
                ))}
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
            10 Categories
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
          {figmaCategories.map((cat, idx) => {
            const Icon = cat.icon
            return (
              <Link
                key={idx}
                to={cat.path}
                className="group relative rounded-2xl bg-[#120826]/80 hover:bg-[#1C0F3A] border border-purple-500/20 hover:border-cyan-400/50 p-4 transition-all duration-300 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_30px_rgba(6,182,212,0.25)] hover:-translate-y-1"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} border border-purple-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-tight mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {cat.count}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* SECTION 4: 3 CURATED RECOMMENDATION CARDS */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            to="/products?category=Graphics Cards (GPU)"
            className="group relative rounded-2xl bg-gradient-to-br from-[#1C0F3A]/90 to-[#0F0720]/90 border border-purple-500/30 hover:border-cyan-400/60 p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_40px_rgba(6,182,212,0.25)] transition-all hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-display text-[10px] font-bold">
                  BEST FOR 1440P
                </span>
                <span className="text-[11px] text-slate-400 font-mono">RTX 4070 SUPER</span>
              </div>
              <h3 className="text-base font-bold font-display text-white group-hover:text-cyan-300 transition-colors mb-2">
                {lang === 'en' ? 'GeForce RTX 4070 SUPER' : 'การ์ดจอ GeForce RTX 4070 SUPER'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {lang === 'en' ? 'King of 1440p High Refresh Gaming with DLSS 3 Frame Generation.' : 'ราชาแห่งการเล่นเกมความละเอียด 2K 1440p ปรับสุดทุกเกมด้วยพลังของ DLSS 3'}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-purple-500/20 pt-3">
              <span className="text-cyan-400 font-mono font-bold">{lang === 'en' ? 'Starting at ฿22,500' : 'ราคาเริ่มต้น ฿22,500'}</span>
              <span className="text-slate-400 font-mono text-[11px] bg-[#1C0F3A] px-2 py-0.5 rounded border border-purple-500/20">{lang === 'en' ? '4 Stores' : '4 ร้านค้า'}</span>
            </div>
          </Link>

          <Link
            to="/products?category=Processors (CPU)"
            className="group relative rounded-2xl bg-gradient-to-br from-[#1C0F3A]/90 to-[#0F0720]/90 border border-purple-500/30 hover:border-purple-400/60 p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_40px_rgba(139,92,246,0.25)] transition-all hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-display text-[10px] font-bold">
                  FLAGSHIP GAMING CPU
                </span>
                <span className="text-[11px] text-slate-400 font-mono">AMD ZEN 4</span>
              </div>
              <h3 className="text-base font-bold font-display text-white group-hover:text-purple-300 transition-colors mb-2">
                {lang === 'en' ? 'AMD Ryzen 7 7800X3D' : 'ซีพียู AMD Ryzen 7 7800X3D'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {lang === 'en' ? '96MB 3D V-Cache delivering unparalleled 1% low frame rates in esports and AAA titles.' : 'เทคโนโลยี 3D V-Cache ขนาด 96MB เฟรมเรตต่ำสุดนิ่งสนิทที่สุดในโลก'}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-purple-500/20 pt-3">
              <span className="text-purple-300 font-mono font-bold">{lang === 'en' ? 'Starting at ฿12,390' : 'ราคาเริ่มต้น ฿12,390'}</span>
              <span className="text-slate-400 font-mono text-[11px] bg-[#1C0F3A] px-2 py-0.5 rounded border border-purple-500/20">{lang === 'en' ? 'Save ฿2,600' : 'ประหยัด ฿2,600'}</span>
            </div>
          </Link>

          <Link
            to="/products?category=Storage (SSD & HDD)"
            className="group relative rounded-2xl bg-gradient-to-br from-[#1C0F3A]/90 to-[#0F0720]/90 border border-purple-500/30 hover:border-amber-400/60 p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_40px_rgba(245,158,11,0.25)] transition-all hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-display text-[10px] font-bold">
                  BEST VALUE GEN4 SSD
                </span>
                <span className="text-[11px] text-slate-400 font-mono">6,000 MB/s</span>
              </div>
              <h3 className="text-base font-bold font-display text-white group-hover:text-amber-300 transition-colors mb-2">
                {lang === 'en' ? 'Kingston NV3 1TB PCIe 4.0' : 'SSD Kingston NV3 1TB PCIe 4.0'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {lang === 'en' ? 'High-speed PCIe Gen 4 storage with up to 6,000 MB/s read at an unbeatable Thai price.' : 'ความเร็วอ่านสูงสุด 6,000 MB/s ในราคาสุดคุ้มสำหรับคอมประกอบและโน้ตบุ๊ก'}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-purple-500/20 pt-3">
              <span className="text-cyan-400 font-mono font-bold">{lang === 'en' ? 'Starting at ฿2,190' : 'ราคาเริ่มต้น ฿2,190'}</span>
              <span className="text-slate-400 font-mono text-[11px] bg-[#1C0F3A] px-2 py-0.5 rounded border border-purple-500/20">{lang === 'en' ? 'In Stock' : 'มีสินค้า'}</span>
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
              {lang === 'en' ? 'Real-time verified pricing curated from Advice, JIB, BaNANA, and iHaveCPU' : 'ราคาสดจริงที่ตรวจสอบตรงกับหน้าเว็บ Advice, JIB, BaNANA IT และ iHaveCPU'}
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <span>{lang === 'en' ? `Showing ${visibleProducts.length} of ${displayedProducts.length} items` : `แสดง ${visibleProducts.length} จาก ${displayedProducts.length} รายการ`}</span>
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
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
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
              <option value="amd" className="bg-[#120826] text-white">AMD</option>
              <option value="intel" className="bg-[#120826] text-white">Intel</option>
              <option value="gigabyte" className="bg-[#120826] text-white">Gigabyte</option>
              <option value="asus" className="bg-[#120826] text-white">ASUS</option>
              <option value="kingston" className="bg-[#120826] text-white">Kingston</option>
              <option value="corsair" className="bg-[#120826] text-white">Corsair</option>
              <option value="msi" className="bg-[#120826] text-white">MSI</option>
              <option value="western digital" className="bg-[#120826] text-white">Western Digital</option>
              <option value="logitech" className="bg-[#120826] text-white">Logitech</option>
              <option value="razer" className="bg-[#120826] text-white">Razer</option>
            </select>
          </div>

          {(storeFilter || brandFilter) && (
            <button
              onClick={() => { setStoreFilter(''); setBrandFilter('') }}
              className="text-xs text-rose-400 hover:underline ml-auto cursor-pointer"
            >
              {lang === 'en' ? 'Clear Filters' : 'ล้างตัวกรอง'}
            </button>
          )}
        </div>

        {/* Product Cards Grid (4 columns) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-[#120826] rounded-2xl animate-pulse border border-purple-500/20" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {visibleProducts.map((product) => (
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
        )}

        {/* Pagination: Load More (+8) Button per SUMMARY_CHANGES.md */}
        {visibleCount < displayedProducts.length && (
          <div className="flex justify-center pt-8">
            <button
              onClick={() => setVisibleCount(prev => prev + 8)}
              className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center space-x-2.5 shadow-[0_4px_25px_rgba(255,255,255,0.25)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.45)] transition-all cursor-pointer group"
            >
              <RotateCw className="w-4 h-4 text-slate-900 group-hover:rotate-180 transition-transform duration-500" />
              <span>{lang === 'en' ? 'Show More Products (+8)' : 'แสดงสินค้าเพิ่มเติม (+8)'}</span>
            </button>
          </div>
        )}
      </section>

      {/* SECTION 6: RECOMMENDED STORES (4 Cards with direct links) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 mb-1">
            <Store className="w-4 h-4 text-cyan-400" />
            <h2 className="text-lg sm:text-xl font-bold font-display text-white">
              {lang === 'en' ? 'Recommended Stores' : 'ร้านค้าแนะนำ (Recommended Stores)'}
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            {lang === 'en' ? 'Direct links to official Thai retail stores tracked in our comparison database' : 'ลิงก์ตรงไปยังเว็บไซต์ทางการของ 4 ร้านค้าไอทีชั้นนำในไทย'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RECOMMENDED_STORES.map((s) => (
            <a
              key={s.slug}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#120826]/85 rounded-2xl p-4 flex items-center justify-between border border-purple-500/25 hover:border-purple-400/60 hover:shadow-[0_4px_25px_rgba(139,92,246,0.3)] transition-all group"
            >
              <div className="flex items-center space-x-3.5">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs font-mono border"
                  style={{ 
                    backgroundColor: `${s.color}15`, 
                    borderColor: `${s.color}40`,
                    color: s.color 
                  }}
                >
                  {s.badge}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center space-x-1">
                    <span>{s.name}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {lang === 'en' ? s.descEn : s.descTh}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* SECTION 7: RECOMMENDED BRANDS (2 Rows of 7 = 14 Brands with White Rounded Backgrounds) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 mb-1">
            <Award className="w-4 h-4 text-purple-400" />
            <h2 className="text-lg sm:text-xl font-bold font-display text-white">
              {lang === 'en' ? 'Recommended Brands' : 'ยี่ห้อแนะนำ (Recommended Brands)'}
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            {lang === 'en' ? 'Official global manufacturers with certified Thai distributors and warranty' : '14 แบรนด์ผู้ผลิตอุปกรณ์ไอทีชั้นนำระดับโลก พร้อมลิงก์เข้าชมเว็บไซต์ทางการ'}
          </p>
        </div>

        {/* 2 rows x 7 columns grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-3.5">
          {RECOMMENDED_BRANDS.map((b, idx) => (
            <a
              key={idx}
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-3 sm:p-4 h-16 sm:h-20 flex items-center justify-center text-center shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_25px_rgba(255,255,255,0.4)] hover:scale-105 transition-all duration-300 group"
              title={`Visit ${b.name} Official Website`}
            >
              <span className="text-slate-900 font-extrabold text-xs sm:text-sm tracking-tight group-hover:text-blue-600 transition-colors uppercase font-display">
                {b.logoText}
              </span>
            </a>
          ))}
        </div>
      </section>


      {/* SECTION 9: SEO & BUYING GUIDE SECTION (Item 6 in SUMMARY_CHANGES.md) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-purple-500/25 bg-[#120826]/80 p-6 sm:p-10 space-y-8 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center space-x-3 pb-4 border-b border-purple-500/20">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                {lang === 'en' ? 'IT Hardware Price Comparison & Buying Guide in Thailand' : 'คู่มือการเลือกซื้อและเปรียบเทียบราคาฮาร์ดแวร์ไอทีในประเทศไทย (IT PRICE)'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'en' ? 'Empirical market insights, price-to-performance recommendations, and smart alerts' : 'ระบบวิเคราะห์เปรียบเทียบราคาเพื่อผู้บริโภค ประหยัดเงินได้จริงทุกครั้งที่อัปเกรดคอมพิวเตอร์'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300 leading-relaxed">
            {/* Column 1 */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#090314] border border-purple-500/20">
              <div className="flex items-center space-x-2 font-bold text-white text-sm">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'en' ? 'Real-Time Price Spread' : 'เปรียบเทียบราคาเรียลไทม์ 4 ร้าน'}</span>
              </div>
              <p className="text-slate-400">
                {lang === 'en'
                  ? 'Hardware prices in Thailand can vary by 5% to 25% across retailers on any given day. IT PRICE crawls verified listings from JIB, Advice, BaNANA, and iHaveCPU to highlight the single best store with instant stock.'
                  : 'สินค้าไอทีในตลาดไทยมีส่วนต่างราคาระหว่างร้านค้าตั้งแต่ 5% ถึง 25% จากการจัดโปรโมชั่นที่แตกต่างกัน ระบบ IT PRICE รวบรวมข้อมูลราคาจริงจาก Advice, JIB, iHaveCPU และ BaNANA ช่วยให้คุณทราบทันทีว่าร้านไหนขายถูกที่สุด'}
              </p>
            </div>

            {/* Column 2 */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#090314] border border-purple-500/20">
              <div className="flex items-center space-x-2 font-bold text-white text-sm">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'en' ? 'Price Drop Alerts & Trends' : 'แจ้งเตือนราคาลด & ประวัติย้อนหลัง'}</span>
              </div>
              <p className="text-slate-400">
                {lang === 'en'
                  ? 'Track time-series price graphs to spot whether a product is on a downward trend. Set your custom target price and receive instant email notifications the moment any store drops below your threshold.'
                  : 'ดูกราฟประวัติราคาย้อนหลังเพื่อตัดสินใจจังหวะซื้อที่เหมาะสม ไม่ต้องกลัวซื้อแพง พร้อมฟังก์ชันตั้งราคาเป้าหมาย (Price Alert) แจ้งเตือนเข้าอีเมลทันทีเมื่อมีร้านค้าปรับราคาลดลงถึงเกณฑ์ที่คุณต้องการ'}
              </p>
            </div>

            {/* Column 3 */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#090314] border border-purple-500/20">
              <div className="flex items-center space-x-2 font-bold text-white text-sm">
                <Scale className="w-4 h-4 text-purple-400" />
                <span>{lang === 'en' ? 'Price-to-Performance Value' : 'ความคุ้มค่าสเปกต่อราคา'}</span>
              </div>
              <p className="text-slate-400">
                {lang === 'en'
                  ? 'Our Spec Comparison Matrix calculates tangible value metrics like ฿/Core for CPUs, ฿/GB for Memory and NVMe Storage, and ฿/Hz for Gaming Monitors so you get the highest possible computing power per Baht.'
                  : 'ตารางวิเคราะห์สเปกละเอียดของเราคำนวณ Value Score เชิงปริมาณ เช่น ราคาต่อคอร์ (฿/Core) สำหรับ CPU, ราคาต่อกิกะไบต์ (฿/GB) สำหรับ RAM/SSD และราคาต่อเฮิรตซ์ (฿/Hz) เพื่อความคุ้มค่าต่อบาทสูงสุด'}
              </p>
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
