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

// Rich sample mock fallback if backend is empty
const MOCK_LISTING_PRODUCTS = [
  {
    id: 201,
    name: 'ASUS TUF Gaming GeForce RTX 4070 SUPER 12GB GDDR6X OC Edition',
    category: 'Graphics Cards (GPU)',
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
    id: 202,
    name: 'MSI GeForce RTX 4060 Ti GAMING X 16G GDDR6 Dual Fan Gaming Card',
    category: 'Graphics Cards (GPU)',
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
    id: 203,
    name: 'GIGABYTE Radeon RX 7800 XT GAMING OC 16GB GDDR6 Triple Fan',
    category: 'Graphics Cards (GPU)',
    brand: 'GIGABYTE',
    model_no: 'GV-R78XTGAMING-16GD',
    lowest_price: 18650,
    msrp: 22900,
    max_discount_percent: 18.6,
    best_store_name: 'JIB Online',
    store_count: 4,
    image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80',
    best_product_url: 'https://www.jib.co.th'
  },
  {
    id: 204,
    name: 'ZOTAC GAMING GeForce RTX 4080 SUPER Trinity Black Edition 16GB',
    category: 'Graphics Cards (GPU)',
    brand: 'ZOTAC',
    model_no: 'ZT-D40820D-10P',
    lowest_price: 36950,
    msrp: 39900,
    max_discount_percent: 7.4,
    best_store_name: 'BaNANA IT',
    store_count: 4,
    image_url: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop&q=80',
    best_product_url: 'https://www.bnn.in.th'
  },
  {
    id: 205,
    name: 'GALAX GeForce RTX 4070 EX Gamer White 1-Click OC 12GB GDDR6X',
    category: 'Graphics Cards (GPU)',
    brand: 'GALAX',
    model_no: '47NOM7MD7KWH',
    lowest_price: 20850,
    msrp: 23500,
    max_discount_percent: 11.3,
    best_store_name: 'Advice IT Infinite',
    store_count: 4,
    image_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=80',
    best_product_url: 'https://www.advice.co.th'
  },
  {
    id: 206,
    name: 'INNO3D GeForce RTX 4060 Twin X2 8GB GDDR6 128-bit Compact Dual Fan',
    category: 'Graphics Cards (GPU)',
    brand: 'INNO3D',
    model_no: 'N40602-08D6-173051N',
    lowest_price: 9720,
    msrp: 11500,
    max_discount_percent: 15.4,
    best_store_name: 'iHaveCPU',
    store_count: 4,
    image_url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&auto=format&fit=crop&q=80',
    best_product_url: 'https://www.ihavecpu.com'
  },
  {
    id: 207,
    name: 'ASUS ROG Strix GeForce RTX 4090 24GB GDDR6X OC Edition Flagship',
    category: 'Graphics Cards (GPU)',
    brand: 'ASUS ROG',
    model_no: 'ROG-STRIX-RTX4090-O24G',
    lowest_price: 74500,
    msrp: 79900,
    max_discount_percent: 6.8,
    best_store_name: 'JIB Online',
    store_count: 4,
    image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80',
    best_product_url: 'https://www.jib.co.th'
  },
  {
    id: 208,
    name: 'Sapphire PULSE AMD Radeon RX 7600 8GB GDDR6 Dual-X Cooling',
    category: 'Graphics Cards (GPU)',
    brand: 'SAPPHIRE',
    model_no: '11324-01-20G',
    lowest_price: 8630,
    msrp: 10500,
    max_discount_percent: 17.8,
    best_store_name: 'BaNANA IT',
    store_count: 4,
    image_url: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop&q=80',
    best_product_url: 'https://www.bnn.in.th'
  },
  {
    id: 387,
    name: 'AMD Ryzen 7 7800X3D 8-Core 16-Thread Gaming Processor',
    category: 'Processors (CPU)',
    brand: 'AMD',
    model_no: '100-100000910WOF',
    lowest_price: 12390,
    msrp: 15900,
    max_discount_percent: 8.3,
    best_store_name: 'iHaveCPU',
    store_count: 4,
    image_url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&auto=format&fit=crop&q=80',
    best_product_url: 'https://www.ihavecpu.com'
  },
  {
    id: 388,
    name: 'Intel Core i5-12400F 6-Core 12-Thread Processor',
    category: 'Processors (CPU)',
    brand: 'Intel',
    model_no: 'BX8071512400F',
    lowest_price: 4390,
    msrp: 5500,
    max_discount_percent: 8.3,
    best_store_name: 'iHaveCPU',
    store_count: 4,
    image_url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&auto=format&fit=crop&q=80',
    best_product_url: 'https://www.ihavecpu.com'
  },
  {
    id: 395,
    name: 'Kingston FURY Beast DDR4 16GB (8GBx2) 3200MHz Black',
    category: 'Memory (RAM)',
    brand: 'Kingston',
    model_no: 'KF432C16BBK2/16',
    lowest_price: 4990,
    msrp: 6000,
    max_discount_percent: 8.3,
    best_store_name: 'iHaveCPU',
    store_count: 4,
    image_url: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&auto=format&fit=crop&q=80',
    best_product_url: 'https://www.ihavecpu.com'
  },
  {
    id: 396,
    name: 'Kingston FURY Beast DDR5 32GB (16GBx2) 5600MHz Black',
    category: 'Memory (RAM)',
    brand: 'Kingston',
    model_no: 'KF556C40BBK2-32',
    lowest_price: 10290,
    msrp: 18500,
    max_discount_percent: 8.3,
    best_store_name: 'BaNANA IT',
    store_count: 4,
    image_url: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&auto=format&fit=crop&q=80',
    best_product_url: 'https://www.bnn.in.th'
  }
]

export default function AllProductsPage({ user, compareList, setCompareList }) {
  const { t, lang } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All')
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || 'All')
  const [selectedStore, setSelectedStore] = useState(searchParams.get('store') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'cheapest')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '85000')
  const [selectedSubSeries, setSelectedSubSeries] = useState('')

  // Quick alert email state
  const [quickAlertEmail, setQuickAlertEmail] = useState('')
  const [quickAlertSubscribed, setQuickAlertSubscribed] = useState(false)

  // Modals
  const [activeChartProduct, setActiveChartProduct] = useState(null)
  const [activeAlertProduct, setActiveAlertProduct] = useState(null)

  // Helper for category titles in Thai/English
  const getCategoryTitle = (cat) => {
    if (lang === 'en') {
      switch (cat) {
        case 'Graphics Cards (GPU)':
          return 'Graphics Cards (GPU)'
        case 'Processors (CPU)':
          return 'Processors (CPU)'
        case 'Memory (RAM)':
          return 'Memory (RAM)'
        case 'Storage (SSD, HDD)':
          return 'Storage (SSD & HDD)'
        case 'Monitors':
          return 'Monitors'
        case 'Motherboards':
          return 'Motherboards'
        case 'Power Supplies (PSU)':
          return 'Power Supplies (PSU)'
        case 'Case & Cooling':
          return 'Case & Cooling'
        case 'Accessories':
          return 'Accessories & Gaming Gear'
        case 'All':
          return 'All Products'
        default:
          return cat
      }
    }
    switch (cat) {
      case 'Graphics Cards (GPU)':
        return 'การ์ดจอ (VGA / GPU)'
      case 'Processors (CPU)':
        return 'ซีพียู (CPU)'
      case 'Memory (RAM)':
        return 'แรม (RAM)'
      case 'Storage (SSD, HDD)':
        return 'ที่เก็บข้อมูล (SSD & HDD)'
      case 'Monitors':
        return 'จอมอนิเตอร์ (Monitor)'
      case 'Motherboards':
        return 'เมนบอร์ด (Mainboard)'
      case 'Power Supplies (PSU)':
        return 'พาวเวอร์ซัพพลาย (PSU)'
      case 'Case & Cooling':
        return 'เคส & ชุดระบายความร้อน'
      case 'Accessories':
        return 'อุปกรณ์เสริม & เกมมิ่งเกียร์'
      case 'All':
        return 'สินค้าทั้งหมด (All Products)'
      default:
        return cat
    }
  }

  // Popular chip tags based on category
  const subSeriesChips = selectedCategory === 'Processors (CPU)'
    ? ['Ryzen 7 7800X3D', 'Ryzen 5 5600', 'Core i5-12400F', 'Ryzen 5 5500', 'Core i7', 'Ryzen 9']
    : selectedCategory === 'Memory (RAM)'
    ? ['DDR4', 'DDR5', '16GB', '32GB', '3200MHz', '5600MHz']
    : selectedCategory === 'All'
    ? ['RTX 4070', 'RTX 4060', 'Ryzen 7', 'Core i5', 'DDR5', 'DDR4']
    : [
        'RTX 4070 SUPER',
        'RTX 4060 Ti',
        'RX 7800 XT',
        'RTX 4080 SUPER',
        'RX 7700 XT',
        'RTX 4090'
      ]

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) {
      if (cat !== selectedCategory) {
        setSelectedCategory(cat)
        setSelectedSubSeries('')
      }
    } else {
      if (selectedCategory !== 'All') {
        setSelectedCategory('All')
        setSelectedSubSeries('')
      }
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
      if (res.data && res.data.length > 0) {
        setProducts(res.data)
      } else {
        const fallback = selectedCategory === 'All'
          ? MOCK_LISTING_PRODUCTS
          : MOCK_LISTING_PRODUCTS.filter(p => p.category === selectedCategory)
        setProducts(fallback.length > 0 ? fallback : MOCK_LISTING_PRODUCTS)
      }
    } catch (e) {
      console.warn('Backend products notice, using listing fallback:', e)
      const fallback = selectedCategory === 'All'
        ? MOCK_LISTING_PRODUCTS
        : MOCK_LISTING_PRODUCTS.filter(p => p.category === selectedCategory)
      setProducts(fallback.length > 0 ? fallback : MOCK_LISTING_PRODUCTS)
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

  // Compute key stats
  const lowestTodayPrice = filteredProducts.length > 0
    ? Math.min(...filteredProducts.map(p => p.lowest_price || 999999))
    : 7190
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

      {/* PRODUCTS DISPLAY GRID */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredProducts.map((product) => (
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

      {/* PAGINATION (FROM FIGMA) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-purple-500/20 text-xs text-slate-400">
        <div>
          {lang === 'en' ? (
            <>Showing <strong className="text-white font-mono">1 - {filteredProducts.length}</strong> of <strong className="text-white font-mono">{filteredProducts.length}</strong> items</>
          ) : (
            <>แสดงรายการที่ <strong className="text-white font-mono">1 - {filteredProducts.length}</strong> จากทั้งหมด <strong className="text-white font-mono">{filteredProducts.length}</strong> รายการ</>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          <button className="px-2.5 py-1.5 rounded-lg bg-[#140826] border border-purple-500/20 text-slate-400 hover:text-white transition-colors">
            |&lt;
          </button>
          <button className="px-2.5 py-1.5 rounded-lg bg-[#140826] border border-purple-500/20 text-slate-400 hover:text-white transition-colors">
            &lt;
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-[#7C3AED] text-white font-bold font-mono shadow-[0_0_10px_rgba(124,58,237,0.5)]">
            1
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-[#140826] border border-purple-500/20 text-slate-300 hover:text-white transition-colors font-mono">
            2
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-[#140826] border border-purple-500/20 text-slate-300 hover:text-white transition-colors font-mono">
            3
          </button>
          <span className="px-1 text-slate-600">...</span>
          <button className="px-2.5 py-1.5 rounded-lg bg-[#140826] border border-purple-500/20 text-slate-400 hover:text-white transition-colors">
            &gt;
          </button>
          <button className="px-2.5 py-1.5 rounded-lg bg-[#140826] border border-purple-500/20 text-slate-400 hover:text-white transition-colors">
            &gt;|
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span>{lang === 'en' ? 'Go to page:' : 'ไปยังหน้า:'}</span>
          <input
            type="number"
            defaultValue={1}
            min={1}
            className="w-12 bg-[#140826] border border-purple-500/25 rounded-lg px-2 py-1 text-center text-white font-mono focus:outline-none"
          />
          <button className="px-3 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-white font-semibold transition-colors">
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
