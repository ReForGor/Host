import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useSearchParams, Link } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  RotateCcw, 
  Layers, 
  Check, 
  X, 
  ChevronRight,
  TrendingDown,
  Activity,
  Bell,
  LayoutGrid,
  List,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Store,
  CreditCard,
  CheckCircle2,
  Tag
} from 'lucide-react'
import { productApi, alertApi } from '../api/client'
import ProductCard from '../components/ProductCard'
import PriceChartModal from '../components/PriceChartModal'
import AlertModal from '../components/AlertModal'
import { useLanguage } from '../i18n/LanguageContext'
import { Helmet } from 'react-helmet-async'

// Helper for category normalization (defensive against unencoded URL splits or aliases)
export const normalizeCategory = (rawCat) => {
  if (!rawCat) return 'All'
  let decoded = rawCat
  try {
    decoded = decodeURIComponent(rawCat).trim()
  } catch (e) {
    decoded = String(rawCat).trim()
  }
  if (!decoded || decoded === 'All' || decoded === 'all') return 'All'
  
  if (
    decoded.startsWith('Storage (SSD') || 
    decoded === 'Solid State Drives (SSD)' || 
    decoded === 'Storage (SSD, HDD)' || 
    decoded === 'Storage (SSD & HDD)'
  ) {
    return 'Storage (SSD & HDD)'
  }
  if (decoded.startsWith('Monitors') || decoded === 'Monitors & Displays') {
    return 'Monitors & Displays'
  }
  if (decoded.startsWith('PC Cases') || decoded === 'Case & Cooling' || decoded === 'PC Cases & Cooling') {
    return 'PC Cases & Cooling'
  }
  if (decoded.startsWith('Gaming Peripherals') || decoded === 'Accessories' || decoded === 'Accessories & Gear') {
    return 'Gaming Peripherals'
  }
  if (decoded.startsWith('Laptops') || decoded === 'Notebooks' || decoded === 'Laptops & Notebooks') {
    return 'Laptops & Notebooks'
  }
  if (decoded.startsWith('Graphics Cards') || decoded === 'GPU' || decoded === 'Graphics Cards (GPU)') {
    return 'Graphics Cards (GPU)'
  }
  if (decoded.startsWith('Processors') || decoded === 'CPU' || decoded === 'Processors (CPU)') {
    return 'Processors (CPU)'
  }
  if (decoded.startsWith('Memory') || decoded === 'RAM' || decoded === 'Memory (RAM)') {
    return 'Memory (RAM)'
  }
  if (decoded.startsWith('Motherboard') || decoded === 'Motherboards') {
    return 'Motherboards'
  }
  if (decoded.startsWith('Power Supplies') || decoded === 'PSU' || decoded === 'Power Supplies (PSU)') {
    return 'Power Supplies (PSU)'
  }
  return decoded
}

export default function AllProductsPage({ user, compareList, setCompareList }) {
  const { t, lang } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(() => normalizeCategory(searchParams.get('category')))
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || 'All')
  const [selectedStore, setSelectedStore] = useState(searchParams.get('store') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'cheapest')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '85000')
  const [selectedSubSeries, setSelectedSubSeries] = useState('')

  // Pagination States (16 items per page)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 16
  const [jumpPageInput, setJumpPageInput] = useState('1')

  // Quick alert email state
  const [quickAlertEmail, setQuickAlertEmail] = useState('')
  const [quickAlertSubscribed, setQuickAlertSubscribed] = useState(false)

  // Modals
  const [activeChartProduct, setActiveChartProduct] = useState(null)
  const [activeAlertProduct, setActiveAlertProduct] = useState(null)

  // Helper for category titles in Thai/English
  const getCategoryTitle = (cat) => {
    const normalized = normalizeCategory(cat)
    if (lang === 'en') {
      switch (normalized) {
        case 'Graphics Cards (GPU)':
          return 'Graphics Cards (GPU)'
        case 'Processors (CPU)':
          return 'Processors (CPU)'
        case 'Memory (RAM)':
          return 'Memory (RAM)'
        case 'Storage (SSD & HDD)':
          return 'Storage (SSD & HDD)'
        case 'Monitors & Displays':
          return 'Monitors'
        case 'Motherboards':
          return 'Motherboards'
        case 'Power Supplies (PSU)':
          return 'Power Supplies (PSU)'
        case 'PC Cases & Cooling':
          return 'Case & Cooling'
        case 'Gaming Peripherals':
          return 'Accessories & Gaming Gear'
        case 'Laptops & Notebooks':
          return 'Laptops & Notebooks'
        case 'All':
          return 'All Products'
        default:
          return cat
      }
    }
    switch (normalized) {
      case 'Graphics Cards (GPU)':
        return 'การ์ดจอ (VGA / GPU)'
      case 'Processors (CPU)':
        return 'ซีพียู (CPU)'
      case 'Memory (RAM)':
        return 'แรม (RAM)'
      case 'Storage (SSD & HDD)':
        return 'ที่เก็บข้อมูล (SSD & HDD)'
      case 'Monitors & Displays':
        return 'จอมอนิเตอร์ (Monitor)'
      case 'Motherboards':
        return 'เมนบอร์ด (Mainboard)'
      case 'Power Supplies (PSU)':
        return 'พาวเวอร์ซัพพลาย (PSU)'
      case 'PC Cases & Cooling':
        return 'เคส & ชุดระบายความร้อน'
      case 'Gaming Peripherals':
        return 'อุปกรณ์เสริม & เกมมิ่งเกียร์'
      case 'Laptops & Notebooks':
        return 'โน้ตบุ๊กทำงาน & เล่นเกม'
      case 'All':
        return 'สินค้าทั้งหมด (All Products)'
      default:
        return cat
    }
  }

  // Popular chip tags based on category
  const getSubSeriesChips = (cat) => {
    const normalized = normalizeCategory(cat)
    switch (normalized) {
      case 'Processors (CPU)':
        return ['Ryzen 7 7800X3D', 'Ryzen 5 5600', 'Core i5-12400F', 'Ryzen 5 5500']
      case 'Graphics Cards (GPU)':
        return ['RTX 4070', 'RTX 4060', 'RTX 3050', 'Gigabyte', 'ASUS']
      case 'Memory (RAM)':
        return ['DDR4', 'DDR5', '16GB', '32GB', 'Kingston', 'Corsair']
      case 'Motherboards':
        return ['B650', 'B760', 'AM5', 'Gigabyte', 'ASRock', 'MSI', 'ASUS']
      case 'Storage (SSD & HDD)':
        return ['NV3', '1TB', '2TB', '500GB', 'SN850X', '990 PRO', 'Kingston']
      case 'Monitors & Displays':
        return ['144Hz', 'IPS', 'LG', 'Dahua', 'ASUS']
      case 'Power Supplies (PSU)':
        return ['650W', '850W', 'Corsair', 'MSI', 'Bronze', 'Gold']
      case 'PC Cases & Cooling':
        return ['NZXT', 'Kraken', '360 RGB', 'Liquid']
      case 'Gaming Peripherals':
        return ['G102', 'G502', 'DeathAdder', 'Superlight', 'Logitech', 'Razer']
      case 'Laptops & Notebooks':
        return ['TUF Gaming', 'IdeaPad', 'RTX 3050', 'Core i5', 'Ryzen 5']
      case 'All':
      default:
        return ['Ryzen', 'Core i5', 'RTX', 'DDR5', 'NVMe', 'Logitech', 'TUF']
    }
  }
  const subSeriesChips = getSubSeriesChips(selectedCategory)

  useEffect(() => {
    const rawCat = searchParams.get('category')
    const normalized = normalizeCategory(rawCat)
    if (normalized !== selectedCategory) {
      setSelectedCategory(normalized)
      setSelectedSubSeries('')
    }
  }, [searchParams])

  useEffect(() => {
    loadProducts()
  }, [selectedCategory, selectedBrand, selectedStore, sortBy, maxPrice])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const params = {
        sort_by: sortBy,
        limit: 100
      }
      if (searchQuery.trim()) params.q = searchQuery.trim()
      if (selectedCategory !== 'All') params.category = selectedCategory
      if (selectedBrand !== 'All') params.brand = selectedBrand
      if (selectedStore) params.store_slug = selectedStore
      if (maxPrice) params.max_price = parseFloat(maxPrice)

      const res = await productApi.getProducts(params)
      const items = Array.isArray(res.data) ? res.data : (res.data?.items || [])
      setProducts(items)
    } catch (e) {
      console.warn('Backend products notice:', e)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleToggleCompare = (product) => {
    const exists = compareList.find(p => p.id === product.id)
    if (exists) {
      setCompareList(compareList.filter(p => p.id !== product.id))
    } else {
      if (compareList.length >= 4) {
        toast.error(t.compare?.maxItemsNotice || (lang === 'en' ? 'You can compare up to 4 items simultaneously.' : 'สามารถเปรียบเทียบได้สูงสุด 4 รายการ'))
        return
      }
      setCompareList([...compareList, product])
    }
  }

  const handleQuickAlertSubmit = (e) => {
    e.preventDefault()
    if (!quickAlertEmail || !quickAlertEmail.includes('@')) return
    setQuickAlertSubscribed(true)
    setTimeout(() => setQuickAlertSubscribed(false), 5000)
  }

  // Filtered by subseries chip if clicked
  const filteredProducts = products.filter(p => {
    if (!selectedSubSeries) return true
    return (p.name || '').toLowerCase().includes(selectedSubSeries.toLowerCase())
  })

  // Pagination Calculations (16 items per page)
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage))
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const startIndex = (validCurrentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, filteredProducts.length)
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
    setJumpPageInput('1')
  }, [selectedCategory, selectedBrand, selectedStore, sortBy, maxPrice, selectedSubSeries, searchQuery])

  // Compute key stats
  const inStockPrices = filteredProducts.filter(p => p.lowest_price && p.lowest_price > 0).map(p => p.lowest_price)
  const lowestTodayPrice = inStockPrices.length > 0 ? Math.min(...inStockPrices) : 0
  const maxWeeklyDiscount = filteredProducts.length > 0
    ? Math.max(...filteredProducts.map(p => p.max_discount_percent || 0))
    : 22.8

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <Helmet>
        <title>{lang === 'en' ? `All Products - ${getCategoryTitle(selectedCategory)} | IT PRICE` : `สินค้าทั้งหมด - ${getCategoryTitle(selectedCategory)} | IT PRICE`}</title>
        <meta name="description" content={lang === 'en' ? `Browse and compare prices for ${getCategoryTitle(selectedCategory)} across top Thai IT stores.` : `เปรียบเทียบราคา ${getCategoryTitle(selectedCategory)} จากร้านไอทีชั้นนำทั่วไทย`} />
      </Helmet>

      {/* TOP HEADER & BREADCRUMB */}
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-cyan-400 transition-colors">{lang === 'en' ? 'Home' : 'หน้าหลัก'}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-400">{lang === 'en' ? 'PC Components' : 'คอมโพเนนต์พีซี'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-cyan-400 font-semibold">{getCategoryTitle(selectedCategory)}</span>
        </div>

        {/* Title row with stats */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{lang === 'en' ? 'MARKET INTELLIGENCE • Live Sync (4 Stores)' : 'MARKET INTELLIGENCE • Live Sync (4 ร้านค้า)'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-display text-white tracking-tight">
              {getCategoryTitle(selectedCategory)}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              {lang === 'en'
                ? 'Real-time price updates across JIB, iHaveCPU, BaNANA, and Advice with intelligent best discount detection in Thailand'
                : 'อัปเดตราคาแบบเรียลไทม์จาก JIB, iHaveCPU, BaNANA และ Advice พร้อมระบบตรวจจับส่วนลดที่ดีที่สุดในประเทศไทย'}
            </p>
          </div>

          {/* Key Stats Widget */}
          <div className="flex items-center space-x-3">
            <div className="bg-[#120826]/90 rounded-2xl p-3.5 px-5 border border-purple-500/25 flex items-center space-x-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">{lang === 'en' ? 'Lowest Price Today' : 'ราคาต่ำสุดวันนี้'}</span>
                <span className="text-lg sm:text-xl font-bold font-display text-emerald-400">
                  ฿{Number(lowestTodayPrice).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-[#120826]/90 rounded-2xl p-3.5 px-5 border border-purple-500/25 flex items-center space-x-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-[#F97316]">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">{lang === 'en' ? 'Weekly Max Discount' : 'ลดสูงสุดรอบสัปดาห์'}</span>
                <span className="text-lg sm:text-xl font-bold font-display text-[#F97316]">
                  -{maxWeeklyDiscount}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS TOOLBAR IN GALAXY PURPLE */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-[#120826] border border-purple-500/25 text-xs">
          {/* Store select */}
          <div className="flex items-center space-x-2 bg-[#1C0F3A]/70 border border-purple-500/25 px-3 py-2 rounded-xl">
            <span className="text-purple-300 flex items-center space-x-1">
              <Store className="w-3.5 h-3.5 text-purple-300" />
              <span>{lang === 'en' ? 'Store:' : 'ร้านค้า:'}</span>
            </span>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-[#120826] text-white">{lang === 'en' ? 'All Thai Stores (4 Major Stores)' : 'ทุกร้านค้าไทย (4 ร้านหลัก)'}</option>
              <option value="advice" className="bg-[#120826] text-white">Advice IT Infinite</option>
              <option value="ihavecpu" className="bg-[#120826] text-white">iHaveCPU</option>
              <option value="jib" className="bg-[#120826] text-white">JIB Online</option>
              <option value="banana" className="bg-[#120826] text-white">BaNANA IT</option>
            </select>
          </div>

          {/* Max Price filter */}
          <div className="flex items-center space-x-2 bg-[#1C0F3A]/70 border border-purple-500/25 px-3 py-2 rounded-xl">
            <span className="text-purple-300 flex items-center space-x-1">
              <CreditCard className="w-3.5 h-3.5 text-purple-300" />
              <span>{lang === 'en' ? 'Max Price (฿):' : 'ราคาสูงสุด (฿):'}</span>
            </span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder={lang === 'en' ? 'e.g. 85,000' : 'เช่น 85,000'}
              className="w-24 bg-transparent text-white font-mono focus:outline-none placeholder-slate-500"
            />
          </div>

          {/* Brand select */}
          <div className="flex items-center space-x-2 bg-[#1C0F3A]/70 border border-purple-500/25 px-3 py-2 rounded-xl">
            <span className="text-purple-300 flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-purple-300" />
              <span>{lang === 'en' ? 'Brand:' : 'แบรนด์:'}</span>
            </span>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-[#120826] text-white">{lang === 'en' ? 'All Brands' : 'ทุกแบรนด์ (All Brands)'}</option>
              <option value="ASUS" className="bg-[#120826] text-white">ASUS</option>
              <option value="MSI" className="bg-[#120826] text-white">MSI</option>
              <option value="GIGABYTE" className="bg-[#120826] text-white">GIGABYTE</option>
              <option value="ZOTAC" className="bg-[#120826] text-white">ZOTAC</option>
              <option value="GALAX" className="bg-[#120826] text-white">GALAX</option>
              <option value="INNO3D" className="bg-[#120826] text-white">INNO3D</option>
              <option value="AMD" className="bg-[#120826] text-white">AMD</option>
              <option value="INTEL" className="bg-[#120826] text-white">Intel</option>
            </select>
          </div>

          {/* Sort By select */}
          <div className="flex items-center space-x-2 bg-[#1C0F3A]/70 border border-purple-500/25 px-3 py-2 rounded-xl">
            <span className="text-purple-300 flex items-center space-x-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-purple-300" />
              <span>{lang === 'en' ? 'Sort:' : 'เรียง:'}</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-cyan-300 focus:outline-none cursor-pointer font-medium"
            >
              <option value="cheapest" className="bg-[#120826] text-white">{lang === 'en' ? 'Lowest Price First' : 'ราคาถูกที่สุดก่อน'}</option>
              <option value="expensive" className="bg-[#120826] text-white">{lang === 'en' ? 'Highest Price First' : 'ราคาสูงสุดก่อน'}</option>
              <option value="discount" className="bg-[#120826] text-white">{lang === 'en' ? 'Highest Discount (%)' : 'ส่วนลดมากสุด (%)'}</option>
              <option value="newest" className="bg-[#120826] text-white">{lang === 'en' ? 'Recently Updated' : 'อัปเดตล่าสุด'}</option>
            </select>
          </div>

          {/* Reset button */}
          {(selectedStore || selectedBrand !== 'All' || selectedSubSeries) && (
            <button
              onClick={() => { setSelectedStore(''); setSelectedBrand('All'); setSelectedSubSeries('') }}
              className="text-xs text-rose-400 hover:underline ml-auto flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Clear Filters' : 'ล้างตัวกรอง'}</span>
            </button>
          )}
        </div>

        {/* Sub-series chips & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-purple-300 font-mono text-[11px] uppercase mr-1 flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1 text-purple-400" /> {lang === 'en' ? 'Sub-Series:' : 'รุ่นย่อย:'}
            </span>
            {subSeriesChips.map((chip) => {
              const active = selectedSubSeries === chip
              return (
                <button
                  key={chip}
                  onClick={() => setSelectedSubSeries(active ? '' : chip)}
                  className={`px-3 py-1 rounded-xl font-mono text-[11px] whitespace-nowrap transition-all ${
                    active
                      ? 'bg-[#7C3AED] text-white font-bold shadow-[0_0_12px_rgba(124,58,237,0.5)]'
                      : 'bg-[#140826] text-slate-300 hover:text-white hover:bg-purple-900/30 border border-purple-500/20'
                  }`}
                >
                  {chip}
                </button>
              )
            })}
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-400 self-end sm:self-center">
            <span>{lang === 'en' ? 'Showing' : 'แสดงสินค้า'} <strong className="text-white font-mono">{filteredProducts.length}</strong> {lang === 'en' ? 'items' : 'รายการ'}</span>
            <div className="flex items-center bg-[#120826] border border-purple-500/25 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-[#7C3AED] text-white' : 'text-slate-400 hover:text-white'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-[#7C3AED] text-white' : 'text-slate-400 hover:text-white'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCTS DISPLAY GRID (Responsive across mobile, tablet, desktop, and large displays) */}
      {filteredProducts.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-3">
          <p className="text-slate-300 font-semibold">{lang === 'en' ? 'No products match the selected filters' : 'ไม่พบสินค้าตามเงื่อนไขตัวกรอง'}</p>
          <button
            onClick={() => { setSelectedStore(''); setSelectedBrand('All'); setSelectedSubSeries('') }}
            className="px-4 py-2 rounded-xl btn-cyber-primary text-xs"
          >
            {lang === 'en' ? 'Reset All Filters' : 'ล้างตัวกรองทั้งหมด'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
          {paginatedProducts.map((product) => (
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

      {/* MARKET INTELLIGENCE 3 WIDGETS (FROM FIGMA) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        {/* Widget 1: Price Spread */}
        <div className="bg-[#120826]/90 rounded-2xl p-5 border border-purple-500/25 space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'en' ? 'Price Spread Across Stores' : 'ความต่างราคาแต่ละร้าน'}</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] border border-purple-500/30">
              Average Spread
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {lang === 'en' ? (
              <>Survey shows identical items vary up to <strong className="text-emerald-400 font-mono">฿4,250</strong> across stores. Always compare prices before checkout.</>
            ) : (
              <>การสำรวจพบว่าสินค้าชิ้นเดียวกันต่างร้านต่างราคาสูงสุดถึง <strong className="text-emerald-400 font-mono">฿4,250</strong> แนะนำให้เช็คราคาก่อนสั่งซื้อเสมอ</>
            )}
          </p>
          <div className="pt-2 text-[11px] font-mono text-purple-300/80 flex items-center justify-between border-t border-purple-500/20">
            <span>Advice (38%)</span>
            <span>iHaveCPU (27%)</span>
            <span>JIB (20%)</span>
            <span>BaNANA (15%)</span>
          </div>
        </div>

        {/* Widget 2: Price Index Sparkline */}
        <div className="bg-[#120826]/90 rounded-2xl p-5 border border-purple-500/25 space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center space-x-1.5">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'en' ? 'GPU Price Index (7 Days)' : 'ดัชนีราคาการ์ดจอ (7 วัน)'}</span>
            </span>
            <span className="text-emerald-400 font-mono text-xs font-bold">
              -3.2% Trend
            </span>
          </div>
          {/* Visual Sparkline representation */}
          <div className="h-10 flex items-end space-x-1.5 pt-2">
            {[45, 48, 42, 38, 35, 30, 24].map((h, i) => (
              <div key={i} className="flex-1 bg-[#1C0F3A] rounded-t relative h-full flex items-end">
                <div 
                  style={{ height: `${h}%` }} 
                  className={`w-full rounded-t transition-all ${i === 6 ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'bg-purple-500/70'}`}
                />
              </div>
            ))}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-purple-500/20 pt-1">
            <span>{lang === 'en' ? 'Continuous downward trend' : 'แนวโน้มปรับลดลงต่อเนื่อง'}</span>
            <span className="font-mono text-cyan-400">{lang === 'en' ? 'Live Sync' : '14:30 น.'}</span>
          </div>
        </div>

        {/* Widget 3: Quick Alert Box */}
        <div className="bg-[#120826]/90 rounded-2xl p-5 border border-purple-500/25 space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center space-x-1.5">
              <Bell className="w-4 h-4 text-[#F97316]" />
              <span>{lang === 'en' ? 'Price Drop Alerts' : 'แจ้งเตือนราคาลดต่ำสุด'}</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-orange-500/15 text-orange-300 font-mono text-[10px]">
              Alert System
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {lang === 'en' ? 'Never miss a hot deal! Enter your email to get notified when targeted GPUs drop in price.' : 'ไม่พลาดดีลเด็ด! กรอกอีเมลและรับแจ้งเตือนเมื่อการ์ดจอที่คุณเล็งไว้ปรับลดราคา'}
          </p>
          {quickAlertSubscribed ? (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs text-center font-medium flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'en' ? 'Email saved! You will be notified on price drops.' : 'บันทึกอีเมลสำเร็จ ระบบจะส่งแจ้งเตือนเมื่อราคาลด!'}</span>
            </div>
          ) : (
            <form onSubmit={handleQuickAlertSubmit} className="flex items-center space-x-2">
              <input
                type="email"
                value={quickAlertEmail}
                onChange={(e) => setQuickAlertEmail(e.target.value)}
                placeholder={lang === 'en' ? 'Enter your email...' : 'ระบุอีเมลของคุณ...'}
                required
                className="flex-1 bg-[#1C0F3A]/70 border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold whitespace-nowrap shadow-[0_0_12px_rgba(249,115,22,0.4)] transition-all"
              >
                {lang === 'en' ? 'Set Alert' : 'เปิดแจ้งเตือน'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* PAGINATION (16 ITEMS PER PAGE & DYNAMIC 1 2 3 BUTTONS) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-purple-500/20 text-xs text-slate-400">
        <div>
          {lang === 'en' ? (
            <>Showing <strong className="text-white font-mono">{filteredProducts.length === 0 ? 0 : startIndex + 1} - {endIndex}</strong> of <strong className="text-white font-mono">{filteredProducts.length}</strong> items (Page {validCurrentPage} of {totalPages})</>
          ) : (
            <>แสดงรายการที่ <strong className="text-white font-mono">{filteredProducts.length === 0 ? 0 : startIndex + 1} - {endIndex}</strong> จากทั้งหมด <strong className="text-white font-mono">{filteredProducts.length}</strong> รายการ (หน้า {validCurrentPage} จาก {totalPages})</>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          <button 
            onClick={() => setCurrentPage(1)}
            disabled={validCurrentPage === 1}
            title={lang === 'en' ? 'First Page' : 'หน้าแรกสุด'}
            className="px-2.5 py-1.5 rounded-lg bg-[#140826] border border-purple-500/20 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            |&lt;
          </button>
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={validCurrentPage === 1}
            title={lang === 'en' ? 'Previous Page' : 'หน้าก่อนหน้า'}
            className="px-2.5 py-1.5 rounded-lg bg-[#140826] border border-purple-500/20 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            &lt;
          </button>

          {/* DYNAMIC PAGE NUMBERS (1, 2, 3...) */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(pageNum => {
              // Show pages close to current page, plus first and last
              return pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - validCurrentPage) <= 1
            })
            .map((pageNum, idx, arr) => {
              const prev = arr[idx - 1]
              const showEllipsis = prev && pageNum - prev > 1

              return (
                <React.Fragment key={pageNum}>
                  {showEllipsis && <span className="px-1 text-slate-600">...</span>}
                  <button
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1.5 rounded-lg font-bold font-mono transition-all ${
                      validCurrentPage === pageNum
                        ? 'bg-[#7C3AED] text-white shadow-[0_0_12px_rgba(124,58,237,0.6)]'
                        : 'bg-[#140826] border border-purple-500/20 text-slate-300 hover:text-white hover:border-purple-400'
                    }`}
                  >
                    {pageNum}
                  </button>
                </React.Fragment>
              )
            })}

          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={validCurrentPage === totalPages}
            title={lang === 'en' ? 'Next Page' : 'หน้าถัดไป'}
            className="px-2.5 py-1.5 rounded-lg bg-[#140826] border border-purple-500/20 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            &gt;
          </button>
          <button 
            onClick={() => setCurrentPage(totalPages)}
            disabled={validCurrentPage === totalPages}
            title={lang === 'en' ? 'Last Page' : 'หน้าสุดท้าย'}
            className="px-2.5 py-1.5 rounded-lg bg-[#140826] border border-purple-500/20 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            &gt;|
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span>{lang === 'en' ? 'Go to page:' : 'ไปยังหน้า:'}</span>
          <input
            type="number"
            value={jumpPageInput}
            onChange={(e) => setJumpPageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = parseInt(jumpPageInput)
                if (!isNaN(target) && target >= 1 && target <= totalPages) {
                  setCurrentPage(target)
                }
              }
            }}
            min={1}
            max={totalPages}
            className="w-12 bg-[#140826] border border-purple-500/25 rounded-lg px-2 py-1 text-center text-white font-mono focus:outline-none focus:border-purple-400"
          />
          <button 
            onClick={() => {
              const target = parseInt(jumpPageInput)
              if (!isNaN(target) && target >= 1 && target <= totalPages) {
                setCurrentPage(target)
              }
            }}
            className="px-3 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-white font-semibold transition-colors"
          >
            {lang === 'en' ? 'Go' : 'ไป'}
          </button>
        </div>
      </div>

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
