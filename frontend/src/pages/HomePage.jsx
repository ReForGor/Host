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
  ShieldCheck, 
  ExternalLink, 
  ArrowRight,
  Zap,
  BarChart2,
  Box,
  Wind,
  MousePointer,
  HelpCircle,
  BookOpen
} from 'lucide-react'
import { productApi } from '../api/client'
import ProductCard from '../components/ProductCard'
import PriceChartModal from '../components/PriceChartModal'
import AlertModal from '../components/AlertModal'
import { useLanguage } from '../i18n/LanguageContext'

export default function HomePage({ user, compareList, setCompareList }) {
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [hotDeals, setHotDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [popularCategory, setPopularCategory] = useState('Graphics Cards (GPU)')

  // Modals
  const [activeChartProduct, setActiveChartProduct] = useState(null)
  const [activeAlertProduct, setActiveAlertProduct] = useState(null)

  // 9 Categories as specifically requested on handwritten blueprint Page 1
  const allCategories = [
    { 
      key: 'Graphics Cards (GPU)', 
      nameTh: 'การ์ดจอ (GPU)', 
      nameEn: 'Graphics Cards (GPU)', 
      icon: Layers, 
      count: '8 รุ่นฮิต', 
      desc: 'RTX 5090, 5080, RX 7900' 
    },
    { 
      key: 'Processors (CPU)', 
      nameTh: 'ซีพียู (CPU)', 
      nameEn: 'Processors (CPU)', 
      icon: Cpu, 
      count: '6 รุ่นฮิต', 
      desc: 'Ryzen 7800X3D, Core i9' 
    },
    { 
      key: 'Memory (RAM)', 
      nameTh: 'แรม (RAM)', 
      nameEn: 'Memory (RAM)', 
      icon: Zap, 
      count: '4 รุ่นฮิต', 
      desc: 'DDR5 6000MHz, 32GB/64GB' 
    },
    { 
      key: 'Storage (SSD, HDD)', 
      nameTh: 'ที่เก็บข้อมูล (SSD, HDD)', 
      nameEn: 'Storage (SSD, HDD)', 
      icon: HardDrive, 
      count: '4 รุ่นฮิต', 
      desc: 'M.2 PCIe 4.0 / 5.0 2TB' 
    },
    { 
      key: 'Monitors', 
      nameTh: 'จอมอนิเตอร์', 
      nameEn: 'Monitors', 
      icon: Tv, 
      count: '2 รุ่นฮิต', 
      desc: '240Hz Fast IPS, OLED' 
    },
    { 
      key: 'Motherboards', 
      nameTh: 'เมนบอร์ด (Mainboard)', 
      nameEn: 'Motherboards', 
      icon: Server, 
      count: '2 รุ่นฮิต', 
      desc: 'X870, Z890, B650' 
    },
    { 
      key: 'Power Supplies (PSU)', 
      nameTh: 'พาวเวอร์ซัพพลาย (PSU)', 
      nameEn: 'Power Supplies (PSU)', 
      icon: Zap, 
      count: '850W - 1200W', 
      desc: 'PCIe 5.0 ATX 3.0 Gold/Plat' 
    },
    { 
      key: 'Case & Cooling', 
      nameTh: 'เคส & ระบายความร้อน', 
      nameEn: 'Case & Cooling', 
      icon: Wind, 
      count: 'ระบบน้ำปิด & เคส', 
      desc: 'AIO 360mm Liquid Coolers' 
    },
    { 
      key: 'Accessories', 
      nameTh: 'อุปกรณ์เสริม', 
      nameEn: 'Accessories', 
      icon: MousePointer, 
      count: 'เกมมิ่งเกียร์', 
      desc: 'Mechanical Keyboard, Mouse' 
    },
  ]

  // Retailers matching blueprint
  const partnerStores = [
    { name: 'JIB Computer Group', slug: 'jib', color: '#f59e0b', tag: 'ส่งฟรีทั่วไทย', status: 'Online 100%' },
    { name: 'Advice IT Infinite', slug: 'advice', color: '#3b82f6', tag: 'สาขามากที่สุด', status: 'Online 100%' },
    { name: 'BaNANA IT', slug: 'banana', color: '#10b981', tag: 'โปรโมชั่นบัตรเครดิต', status: 'Online 100%' },
    { name: 'iHaveCPU Thailand', slug: 'ihavecpu', color: '#f43f5e', tag: 'คอมประกอบยอดนิยม', status: 'Online 100%' },
  ]

  // Articles & Buying Guides
  const buyingGuides = [
    {
      id: 1,
      title: 'คู่มือเลือกการ์ดจอปี 2026: RTX 5000 vs Radeon 8000 รุ่นไหนคุ้มเงินที่สุด',
      summary: 'เจาะลึกความคุ้มค่าระหว่าง VRAM, DLSS 4, และประสิทธิภาพเรย์เทรซซิ่ง พร้อมตารางราคาเปรียบเทียบจาก 4 ร้าน',
      category: 'การ์ดจอ (GPU)',
      readTime: '5 นาที'
    },
    {
      id: 2,
      title: 'จัดสเปกคอมเล่นเกม 2026: งบ 30,000 - 60,000 บาท เลือกชิ้นส่วนไหนคุ้มสุด',
      summary: 'ส่องราคาสดชิ้นต่อชิ้น ซีพียู แรม และการ์ดจอ เพื่อประสิทธิภาพสูงสุดต่อบาท',
      category: 'จัดสเปกคอม',
      readTime: '7 นาที'
    },
    {
      id: 3,
      title: 'เทคนิคจับจังหวะซื้ออุปกรณ์ไอทีให้ได้ราคาถูกที่สุด พร้อมวิธีตั้งเตือนราคาลด',
      summary: 'วิเคราะห์กราฟราคาย้อนหลัง 30 วัน รู้วันที่ร้านค้าจัดโปรโมชั่น Flash Sale ลดสูงสุด 20%',
      category: 'เทคนิคประหยัด',
      readTime: '4 นาที'
    }
  ]

  useEffect(() => {
    loadHomeData()
  }, [])

  const loadHomeData = async () => {
    setLoading(true)
    try {
      const [prodsRes, dealsRes] = await Promise.all([
        productApi.getProducts({ limit: 100 }),
        productApi.getDeals({ limit: 8 })
      ])
      setProducts(prodsRes.data)
      setHotDeals(dealsRes.data)
    } catch (e) {
      console.error(e)
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
        alert(t.compare.maxItemsNotice)
        return
      }
      setCompareList([...compareList, product])
    }
  }

  // Filter popular items
  const popularItems = products.filter(p => p.category === popularCategory).slice(0, 4)

  return (
    <div className="animate-fade-in space-y-16 pb-12">
      {/* 1. HERO BANNER & SEARCH BAR (Drawn specifically on Page 1 wireframe) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950/60 via-[#030712] to-[#030712] pt-12 pb-16 border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-600/15 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Badge: "เปิดมาแล้วรู้เลยว่าเป็นเว็บอะไร" */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-600/15 border border-blue-500/30 text-blue-400 text-xs font-bold mb-6 glow-blue-sm">
            <Zap className="w-3.5 h-3.5" />
            <span>{t.hero.tag}</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4">
            {t.hero.title} <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-300 bg-clip-text text-transparent">
              {t.hero.titleHighlight}
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-8">
            {t.hero.subtitle}
          </p>

          {/* Prominent Search Bar (Matching bottom wireframe on PDF Page 1) */}
          <form 
            onSubmit={handleHeroSearch}
            className="max-w-2xl mx-auto flex items-center bg-[#030712] border-2 border-blue-600/60 hover:border-blue-500 rounded-2xl p-1.5 shadow-2xl shadow-blue-950/50 focus-within:ring-4 focus-within:ring-blue-600/20 transition-all"
          >
            <div className="pl-4 text-slate-400">
              <Search className="w-5 h-5 text-blue-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.hero.searchPlaceholder}
              className="w-full bg-transparent px-3 py-3 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-md shadow-blue-600/30 hover:scale-[1.02] flex items-center space-x-1.5 flex-shrink-0"
            >
              <span>{t.hero.searchBtn}</span>
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Key Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs font-semibold text-slate-400">
            <span className="flex items-center"><ShieldCheck className="w-4 h-4 mr-1.5 text-blue-400" /> {t.hero.statsStores}</span>
            <span className="flex items-center"><Zap className="w-4 h-4 mr-1.5 text-blue-400" /> {t.hero.statsProducts}</span>
            <span className="flex items-center"><Sparkles className="w-4 h-4 mr-1.5 text-amber-400" /> {t.hero.statsSavings}</span>
          </div>
        </div>
      </section>

      {/* 2. ALL 9 CATEGORIES (หมวดหมู่ทั้งหมด - Explicitly specified on PDF Page 1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center">
              <Layers className="w-6 h-6 mr-2.5 text-blue-500" />
              <span>{t.categories.title} (9 หมวดหมู่หลัก)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {t.categories.subtitle}
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center"
          >
            <span>ดูสินค้าทั้งหมดในระบบ</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {allCategories.map((c) => {
            const Icon = c.icon
            return (
              <div
                key={c.key}
                onClick={() => navigate(`/products?category=${encodeURIComponent(c.key)}`)}
                className="group p-5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-950/20 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/15 text-blue-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 group-hover:text-blue-300 transition-colors">
                    {c.count}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors mb-1">
                    {c.nameTh}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {c.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 3. HOT DEALS (สินค้า Hot Deal ลดราคาแรง - On PDF Page 1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[11px] font-bold mb-1 border border-rose-500/30">
              <Flame className="w-3.5 h-3.5" />
              <span>FLASH DEALS</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white flex items-center">
              <span>{t.deals.title}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {t.deals.subtitle}
            </p>
          </div>
          <Link
            to="/deals"
            className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center"
          >
            <span>{t.deals.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {hotDeals.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenChart={(p) => setActiveChartProduct(p)}
              onOpenAlert={(p) => setActiveAlertProduct(p)}
              onToggleCompare={handleToggleCompare}
              isSelectedForCompare={compareList.some(p => p.id === product.id)}
            />
          ))}
        </div>
      </section>

      {/* 4. POPULAR CATEGORIES (หมวดหมู่ยอดนิยม - On PDF Page 1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-white">
              {t.popular.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {t.popular.subtitle}
            </p>
          </div>

          {/* Quick Category Tabs */}
          <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setPopularCategory('Graphics Cards (GPU)')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                popularCategory === 'Graphics Cards (GPU)'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              การ์ดจอ (GPU)
            </button>
            <button
              onClick={() => setPopularCategory('Processors (CPU)')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                popularCategory === 'Processors (CPU)'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ซีพียู (CPU)
            </button>
            <button
              onClick={() => setPopularCategory('Memory (RAM)')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                popularCategory === 'Memory (RAM)'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              แรม (RAM)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {popularItems.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenChart={(p) => setActiveChartProduct(p)}
              onOpenAlert={(p) => setActiveAlertProduct(p)}
              onToggleCompare={handleToggleCompare}
              isSelectedForCompare={compareList.some(p => p.id === product.id)}
            />
          ))}
        </div>
      </section>

      {/* 5. BRANDS & RECOMMENDED RETAILERS (ยี่ห้อ, ร้านแนะนำ - On PDF Page 1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-white">
            {t.brandsStores.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t.brandsStores.subtitle}
          </p>
        </div>

        {/* 4 Retailers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {partnerStores.map((st) => (
            <div
              key={st.slug}
              className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: st.color }} />
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  ● {st.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                {st.name}
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                {st.tag}
              </p>
              <button
                onClick={() => navigate(`/products?store=${st.slug}`)}
                className="w-full py-2 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 text-xs font-semibold rounded-xl transition-all"
              >
                ดูสินค้าในร้าน {st.name.split(' ')[0]} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TECH ARTICLES / GUIDES (บทความเล็กน้อย - On PDF Page 1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-white flex items-center">
            <BookOpen className="w-6 h-6 mr-2.5 text-blue-500" />
            <span>{t.articles.title}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t.articles.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {buyingGuides.map((guide) => (
            <div
              key={guide.id}
              className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-blue-500/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="text-blue-400 font-semibold">{guide.category}</span>
                  <span>อ่าน {guide.readTime}</span>
                </div>
                <h3 className="text-base font-bold text-white mb-2 leading-snug">
                  {guide.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {guide.summary}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80">
                <span className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center cursor-pointer">
                  <span>{t.articles.readMore}</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </span>
              </div>
            </div>
          ))}
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
          onSuccess={() => {}}
        />
      )}
    </div>
  )
}
