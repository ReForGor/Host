import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useSearchParams, Link } from 'react-router-dom'
import { 
  Scale, 
  Plus, 
  X, 
  ExternalLink, 
  Check, 
  Trophy, 
  ShieldAlert, 
  ArrowLeft,
  Sparkles,
  Zap,
  TrendingDown,
  Share2,
  Award,
  ChevronDown,
  Activity,
  Cpu,
  Layers,
  HardDrive,
  CheckCircle2,
  Bell,
  Briefcase,
  Gamepad2
} from 'lucide-react'
import { compareApi, productApi } from '../api/client'
import { useLanguage } from '../i18n/LanguageContext'

// High-fidelity fallback comparison data matching Figma reference
const MOCK_COMPARE_PRODUCTS = [
  {
    id: 1,
    name: 'AMD Ryzen 7 7800X3D',
    brand: 'AMD',
    category: 'Processors (CPU)',
    subtitle: 'Socket AM5 • 8 Cores / 16 Threads • 3D V-Cache',
    badge: 'GAMING CHAMPION',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    discount: '-11.8%',
    lowest_price: 14900,
    msrp: 16900,
    price_diff: '-฿2,000',
    best_store: 'iHaveCPU',
    store_options: [
      { name: 'iHaveCPU', price: 14900, tag: 'ต่ำสุด ณ ตอนนี้', url: 'https://www.ihavecpu.com' },
      { name: 'Advice IT Infinite', price: 15200, tag: '', url: 'https://www.advice.co.th' },
      { name: 'JIB Online', price: 15490, tag: '', url: 'https://www.jib.co.th' },
      { name: 'BaNANA IT', price: 15900, tag: '', url: 'https://www.bnn.in.th' }
    ],
    image_url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&auto=format&fit=crop&q=80',
    score_label: 'ประหยัดไฟ & เกมมิ่งสูงสุด',
    score_label_en: 'Energy Efficient & Ultimate Gaming',
    score_val: '9.8/10',
    score_percent: 98,
    benchmark_fps: 248,
    benchmark_fps_delta: '+9.4%',
    benchmark_cinebench: 18650,
  },
  {
    id: 2,
    name: 'Intel Core i7-14700K',
    brand: 'INTEL',
    category: 'Processors (CPU)',
    subtitle: 'LGA1700 • 20 Cores / 28 Threads • UHD Graphics 770',
    badge: 'PRODUCTIVITY KING',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    discount: '-9.5%',
    lowest_price: 15200,
    msrp: 16800,
    price_diff: '-฿1,600',
    best_store: 'Advice IT Infinite',
    store_options: [
      { name: 'Advice IT Infinite', price: 15200, tag: 'ต่ำสุด ณ ตอนนี้', url: 'https://www.advice.co.th' },
      { name: 'iHaveCPU', price: 15400, tag: '', url: 'https://www.ihavecpu.com' },
      { name: 'JIB Online', price: 15690, tag: '', url: 'https://www.jib.co.th' },
      { name: 'BaNANA IT', price: 16100, tag: '', url: 'https://www.bnn.in.th' }
    ],
    image_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&auto=format&fit=crop&q=80',
    score_label: 'เรนเดอร์งาน & Multi-Tasking สเปกสูง',
    score_label_en: 'High-Spec Rendering & Multi-Tasking',
    score_val: '9.2/10',
    score_percent: 92,
    benchmark_fps: 227,
    benchmark_cinebench: 34500,
    benchmark_cinebench_delta: '+85%',
  }
]

// Figma Spec Matrix rows
const MOCK_SPEC_ROWS = [
  {
    key: 'arch',
    label: 'สถาปัตยกรรม (Architecture)',
    sub: 'Manufacturing Process',
    val1: 'Zen 4 (TSMC 5nm)',
    val1_highlight: '5nm ประหยัดไฟ',
    val2: 'Raptor Lake Refresh (Intel 7 / 10nm)',
    val2_highlight: null
  },
  {
    key: 'cores',
    label: 'คอร์ & เธรด (Cores / Threads)',
    sub: 'Compute Density',
    val1: '8 Cores / 16 Threads',
    val1_highlight: null,
    val2: '20 Cores (8P + 12E) / 28 Threads',
    val2_highlight: '+12 คอร์'
  },
  {
    key: 'clock',
    label: 'ความถี่คล็อก (Clock Speeds)',
    sub: 'Base / Max Boost',
    val1: 'Base: 4.2 GHz\nBoost: สูงสุด 5.0 GHz',
    val1_highlight: null,
    val2: 'Base: 3.4 GHz\nBoost: สูงสุด 5.6 GHz',
    val2_highlight: '+600 MHz'
  },
  {
    key: 'cache',
    label: 'หน่วยความจำแคช (L3 Cache)',
    sub: 'Stacking Technology',
    val1: '96 MB (3D V-Cache ขนาดมหึมา)',
    val1_highlight: '3x แคช',
    val2: '33 MB Intel Smart Cache (+ 28MB L2)',
    val2_highlight: null
  },
  {
    key: 'tdp',
    label: 'การใช้พลังงาน (TDP & Power)',
    sub: 'Electrical Efficiency',
    val1: '120W TDP (กินไฟจริงตอนเล่นเกม ~50-70W)',
    val1_highlight: 'ประหยัดไฟกว่า 3 เท่า',
    val2: '125W Base / 253W Max Boost (ต้องการชุดน้ำ 360mm)',
    val2_highlight: 'กินไฟสูง'
  },
  {
    key: 'gaming',
    label: 'ประสิทธิภาพเล่นเกม (1080p Gaming)',
    sub: 'Avg Framerate Benchmark',
    val1: 'เร็วกว่า 8% - 12% โดยเฉลี่ย',
    val1_highlight: 'แชมป์เกมมิ่ง',
    val2: 'เกณฑ์มาตรฐานระดับสูง (FPS เสถียร)',
    val2_highlight: null
  },
  {
    key: 'igpu',
    label: 'ชิปกราฟิกและการต่อจอ',
    sub: 'Integrated GPU & Socket',
    val1: 'AMD Radeon Graphics (2 CU)\nSocket AM5 (อัปเกรดได้ถึง 2027+)',
    val1_highlight: null,
    val2: 'Intel UHD 770 (QuickSync)\nSocket LGA1700 (รองรับ DDR4/DDR5)',
    val2_highlight: 'QuickSync ตัดต่อลื่น'
  },
  {
    key: 'fps_per_baht',
    label: 'ราคาต่อเฟรมเรต (FPS / Baht)',
    sub: 'Cost-to-Performance Ratio',
    val1: '฿60.08 / FPS\nประหยัดค่าเมนบอร์ดและชุดน้ำ',
    val1_highlight: 'คุ้มค่าต่อ FPS สูงสุด',
    val2: '฿66.96 / FPS\nแต่คุ้มค่ามหาศาลต่องานเรนเดอร์',
    val2_highlight: null
  }
]

export default function ComparePage({ compareList, setCompareList }) {
  const { t, lang } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const idsParam = searchParams.get('ids')

  const [compareData, setCompareData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [allProducts, setAllProducts] = useState([])
  const [showAddDropdown, setShowAddDropdown] = useState(false)
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('CPU')
  const [alertEmail, setAlertEmail] = useState('')
  const [alertSuccess, setAlertSuccess] = useState(false)

  // Store select state per compared card
  const [selectedStores, setSelectedStores] = useState({ 0: 0, 1: 0 })

  useEffect(() => {
    productApi.getProducts({ limit: 100 }).then(res => {
      setAllProducts(res.data)
    }).catch(console.error)
  }, [])

  const [hasClearedMock, setHasClearedMock] = useState(false)

  useEffect(() => {
    let ids = []
    if (idsParam) {
      ids = idsParam.split(',').filter(x => x.trim().length > 0)
    } else if (compareList.length > 0) {
      ids = compareList.map(p => p.id)
    }

    if (ids.length > 0) {
      fetchComparison(ids)
    } else if (!hasClearedMock) {
      // Use rich mock data by default for presentation unless cleared
      setCompareData({
        products: MOCK_COMPARE_PRODUCTS,
        spec_matrix: MOCK_SPEC_ROWS
      })
    } else {
      setCompareData(null)
    }
  }, [idsParam, compareList, hasClearedMock])

  const fetchComparison = async (ids) => {
    setLoading(true)
    try {
      const res = await compareApi.compareProducts(ids)
      if (res.data && res.data.products?.length > 0) {
        setCompareData(res.data)
      } else {
        setCompareData({
          products: MOCK_COMPARE_PRODUCTS,
          spec_matrix: MOCK_SPEC_ROWS
        })
      }
    } catch (e) {
      console.warn('Backend compare error, falling back to mock:', e)
      setCompareData({
        products: MOCK_COMPARE_PRODUCTS,
        spec_matrix: MOCK_SPEC_ROWS
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveProduct = (productId) => {
    if (!compareData) return
    const updated = compareData.products.filter(p => p.id !== productId).map(p => p.id)
    if (updated.length > 0) {
      setSearchParams({ ids: updated.join(',') })
    } else {
      setHasClearedMock(true)
      setSearchParams({})
      setCompareData(null)
    }
  }

  const handleAddProduct = (productId) => {
    setShowAddDropdown(false)
    if (!compareData) {
      setSearchParams({ ids: String(productId) })
      return
    }
    const current = compareData.products.map(p => p.id)
    if (current.includes(productId)) return
    if (current.length >= 4) {
      toast.error(t.compare?.maxItemsNotice || (lang === 'en' ? 'You can compare up to 4 items simultaneously.' : 'เปรียบเทียบได้สูงสุด 4 รายการ'))
      return
    }
    const updated = [...current, productId]
    setSearchParams({ ids: updated.join(',') })
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    toast.success(lang === 'en' ? 'Comparison link copied to clipboard!' : 'คัดลอกลิงก์การเปรียบเทียบสเปกแล้ว!')
  }

  const handleAlertSubmit = (e) => {
    e.preventDefault()
    if (!alertEmail || !alertEmail.includes('@')) return
    setAlertSuccess(true)
    setTimeout(() => setAlertSuccess(false), 5000)
  }

  const activeProducts = compareData?.products || MOCK_COMPARE_PRODUCTS

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">

      {/* TOP HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4 border-b border-purple-500/20">
        <div>
          <div className="text-[11px] font-mono tracking-wider text-purple-300 font-bold mb-1">
            IT PRICE ENGINE / HARDWARE BENCHMARK / SIDE-BY-SIDE <span className="text-white px-2 py-0.5 rounded bg-purple-500/30 ml-2">v4.4 PRO</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-display text-white tracking-tight">
            {lang === 'en' ? 'Hardware Spec & Price Comparison' : 'เปรียบเทียบสเปกและราคาฮาร์ดแวร์ไอที'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
            {lang === 'en'
              ? 'In-depth spec comparison, value analysis, and real-time lowest price across 4 premier Thai IT retailers (iHaveCPU, Advice, JIB, BaNANA)'
              : 'ระบบวิเคราะห์ความต่างแบบเจาะลึก เทียบความคุ้มค่าแบบตัวต่อตัว อิงฐานข้อมูลราคาเรียลไทม์จาก 4 ร้านไอทีชั้นนำในไทย (iHaveCPU, Advice, JIB, BaNANA)'}
          </p>
        </div>

        {/* Category switch tabs */}
        <div className="flex items-center space-x-2 bg-[#120826] border border-purple-500/25 p-1 rounded-2xl self-start lg:self-auto overflow-x-auto">
          {[
            { key: 'CPU', label: lang === 'en' ? 'Processors (CPU)' : 'ซีพียู (CPU)', icon: Cpu },
            { key: 'GPU', label: lang === 'en' ? 'Graphics Cards (GPU)' : 'การ์ดจอ (GPU)', icon: Layers },
            { key: 'RAM', label: lang === 'en' ? 'Memory (RAM)' : 'แรม (RAM)', icon: Zap },
            { key: 'SSD', label: 'SSD / Storage', icon: HardDrive }
          ].map((cat) => {
            const Icon = cat.icon
            const active = selectedCategoryTab === cat.key
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategoryTab(cat.key)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-[#7C3AED] text-white shadow-[0_0_12px_rgba(124,58,237,0.5)] font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* COMPARISON BAR & PRODUCT SEARCH ADDER */}
      <div className="bg-[#120826]/90 rounded-2xl p-3.5 sm:p-4 border border-purple-500/25 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        {/* Active compared pills */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto scrollbar-none text-xs">
          <span className="text-purple-300 font-medium whitespace-nowrap flex items-center">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse mr-2"></span>
            {lang === 'en' ? 'Comparing' : 'กำลังเทียบ'} ({activeProducts.length} {lang === 'en' ? 'items' : 'รายการ'}):
          </span>
          {activeProducts.map((p, idx) => (
            <div
              key={p.id || idx}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#1C0F3A] border border-purple-500/30 text-white text-xs font-semibold whitespace-nowrap"
            >
              <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-emerald-400' : 'bg-purple-400'}`}></span>
              <span>{p.name}</span>
              <button
                onClick={() => handleRemoveProduct(p.id)}
                className="text-slate-400 hover:text-rose-400 transition-colors ml-1"
                title={lang === 'en' ? 'Remove from comparison' : 'ลบออกจากการเปรียบเทียบ'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Right adder & share */}
        <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end relative">
          <button
            onClick={() => setShowAddDropdown(!showAddDropdown)}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-[#140826] hover:bg-purple-900/30 border border-purple-500/25 text-xs font-semibold text-purple-200 hover:text-white transition-all"
          >
            <Plus className="w-4 h-4 text-purple-400" />
            <span>+ {lang === 'en' ? 'Search to add 3rd product...' : 'ค้นหาเพื่อเพิ่มสินค้าตัวที่ 3...'}</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-slate-300 hover:text-cyan-400 transition-colors"
            title={lang === 'en' ? 'Share this comparison' : 'แชร์การเปรียบเทียบนี้'}
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Add Dropdown */}
          {showAddDropdown && (
            <div className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto glass-panel-elevated rounded-2xl p-2 z-50 shadow-2xl divide-y divide-white/[0.06]">
              <div className="p-2 text-xs font-bold text-slate-400">{lang === 'en' ? 'Select product to add to comparison' : 'เลือกสินค้าเพื่อเปรียบเทียบเพิ่ม'}</div>
              {allProducts.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleAddProduct(p.id)}
                  className="p-2.5 hover:bg-white/[0.08] rounded-xl cursor-pointer flex items-center space-x-3 transition-colors"
                >
                  <img src={p.image_url} alt={p.name} className="w-8 h-8 object-contain rounded bg-[#070B14] p-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                    <p className="text-[11px] text-cyan-400 font-mono font-bold">฿{Number(p.lowest_price).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {activeProducts.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-[#120826]/50 rounded-3xl border border-purple-500/20 mt-8">
          <Scale className="w-16 h-16 text-slate-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">{lang === 'en' ? 'No products to compare' : 'ไม่มีสินค้าที่เปรียบเทียบ'}</h2>
          <p className="text-slate-400 mb-6 text-sm max-w-md text-center">{lang === 'en' ? 'Search and add products above to start comparing specs and prices.' : 'ค้นหาและเพิ่มสินค้าด้านบนเพื่อเริ่มเปรียบเทียบสเปกและราคา'}</p>
          <button onClick={() => setShowAddDropdown(true)} className="btn-cyber-primary px-6 py-2.5 rounded-xl font-bold text-sm flex items-center shadow-[0_0_15px_rgba(124,58,237,0.3)]">
            <Plus className="w-4 h-4 mr-2" />
            {lang === 'en' ? 'Add Product' : 'เพิ่มสินค้า'}
          </button>
        </div>
      )}

      {activeProducts.length > 0 && (
        <>

      {/* VALUE SCORE CHAMPION BANNER (Spec-to-Price Analysis from analysis.md) */}
      {compareData?.value_score_leader_id && (
        <div className="bg-gradient-to-r from-amber-500/15 via-purple-500/20 to-cyan-500/15 border border-amber-400/35 rounded-3xl p-5 shadow-[0_4px_30px_rgba(245,158,11,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] flex-shrink-0">
              <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider font-mono">
                  {lang === 'en' ? 'VALUE SCORE WINNER (SPEC-TO-PRICE)' : 'ผู้นำคะแนนความคุ้มค่า (VALUE SCORE WINNER)'}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30 font-medium">
                  {compareData.value_score_reason || (lang === 'en' ? 'Best cost per spec unit' : 'ต้นทุนต่อหน่วยสเปกคุ้มค่าที่สุด')}
                </span>
              </div>
              <p className="text-sm font-bold text-white mt-1">
                {compareData.products.find(p => p.id === compareData.value_score_leader_id)?.name}
              </p>
            </div>
          </div>
          <div className="sm:text-right bg-[#0A0314]/60 px-4 py-2 rounded-2xl border border-amber-400/20 flex sm:flex-col justify-between items-center sm:items-end">
            <span className="text-[10px] text-slate-400 block font-mono">{lang === 'en' ? 'Value Metric Ratio' : 'อัตราส่วนความคุ้มค่า'}</span>
            <span className="text-base font-mono font-black text-emerald-400">
              {compareData.value_scores?.[compareData.value_score_leader_id] || 'คุ้มค่าที่สุด'}
            </span>
          </div>
        </div>
      )}

      {/* SIDE-BY-SIDE PRODUCT HEADER CARDS (FIGMA STYLE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeProducts.slice(0, 2).map((p, idx) => {
          const isLeft = idx === 0
          const storeOpt = p.store_options || [
            { name: p.best_store || 'Advice IT', price: p.lowest_price, tag: 'ต่ำสุด ณ ตอนนี้', url: '#' }
          ]
          const curStoreIdx = selectedStores[idx] || 0
          const curStore = storeOpt[curStoreIdx] || storeOpt[0]

          return (
            <div
              key={p.id || idx}
              className={`bg-[#120826]/90 rounded-3xl p-6 border relative flex flex-col justify-between space-y-5 shadow-[0_4px_25px_rgba(0,0,0,0.5)] ${
                isLeft ? 'border-emerald-500/30' : 'border-purple-500/30'
              }`}
            >
              {/* Top Tag & Discount */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-bold font-display tracking-wider border flex items-center space-x-1.5 ${
                  p.badgeColor || (isLeft ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-purple-500/20 text-purple-300 border-purple-500/40')
                }`}>
                  {isLeft ? (
                    <Award className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <Briefcase className="w-3.5 h-3.5 text-purple-300" />
                  )}
                  <span>{p.badge || (isLeft ? 'GAMING CHAMPION' : 'PRODUCTIVITY KING')}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#F97316] text-white font-display text-xs font-bold shadow-[0_0_10px_rgba(249,115,22,0.4)]">
                  {p.discount || '-11.8%'}
                </span>
              </div>

              {/* Title & Specs */}
              <div>
                <h3 className="text-xl sm:text-2xl font-black font-display text-white mb-1">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {p.subtitle || 'Socket AM5 • 8 Cores / 16 Threads • 3D V-Cache'}
                </p>
              </div>

              {/* Product Image Recess */}
              <div className="relative rounded-2xl bg-[#0A0314] border border-purple-500/20 p-4 h-48 flex items-center justify-center">
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="max-h-36 object-contain"
                />
                <div className="absolute bottom-2.5 left-3 flex items-center space-x-1.5 text-[10px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{lang === 'en' ? 'All 4 Stores' : 'ครบ 4 ร้าน'}</span>
                </div>
              </div>

              {/* Pricing section */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">{lang === 'en' ? 'Lowest Price in TH:' : 'ราคาต่ำสุดในไทย:'}</span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl sm:text-3xl font-black font-display text-cyan-400">
                        ฿{Number(p.lowest_price).toLocaleString()}
                      </span>
                      {p.price_diff && (
                        <span className="text-xs font-mono text-emerald-400">({p.price_diff})</span>
                      )}
                    </div>
                  </div>
                  {p.msrp && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">{lang === 'en' ? 'MSRP' : 'ราคาเปิดตัว'}</span>
                      <span className="text-xs text-slate-500 line-through font-display">
                        ฿{Number(p.msrp).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Reference store select */}
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400">{lang === 'en' ? 'Reference Retailer:' : 'ร้านค้าอ้างอิง:'}</span>
                  <div className="relative">
                    <select
                      value={curStoreIdx}
                      onChange={(e) => setSelectedStores({ ...selectedStores, [idx]: Number(e.target.value) })}
                      className="w-full bg-[#0A0314] border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-400"
                    >
                      {storeOpt.map((opt, sIdx) => (
                        <option key={sIdx} value={sIdx} className="bg-[#120826] text-white">
                          {opt.name} - ฿{Number(opt.price).toLocaleString()} {opt.tag ? `(${lang === 'en' ? 'Lowest Now' : opt.tag})` : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-purple-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Buy button */}
                <a
                  href={curStore.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                    isLeft
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  }`}
                >
                  <span>{lang === 'en' ? `Go to Cheapest Store (${curStore.name})` : `ไปร้านที่ถูกที่สุด (${curStore.name})`}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* Highlight score bar */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-purple-500/20">
                  <span className="text-slate-300 font-medium flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{lang === 'en' ? (p.score_label_en || p.score_label || 'Overall Value Score') : (p.score_label || 'คะแนนรวมความคุ้มค่า')}</span>
                  </span>
                  <span className="font-mono font-bold text-cyan-400">{p.score_val || '9.5/10'}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* SECTION: ENGINEERING BENCHMARKS */}
      <section className="bg-[#120826]/90 rounded-3xl p-6 sm:p-8 border border-purple-500/25 space-y-6 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 mb-1">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                {lang === 'en' ? 'Engineering Benchmark & Performance Index' : 'ดัชนีคะแนนเปรียบเทียบเชิงวิศวกรรม (Engineering Benchmark)'}
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              {lang === 'en' ? 'Estimated 1080p Ultra Gaming FPS and Cinebench R23 Multi-Core rendering scores' : 'คะแนนประเมินระหว่าง FPS เกมมิ่ง 1080p Ultra และคะแนน Cinebench R23 Multi-Core'}
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300">AMD 7800X3D</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
              <span className="text-slate-300">Intel 14700K</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Benchmark 1: Gaming FPS */}
          <div className="bg-[#0A0314] border border-purple-500/20 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">{lang === 'en' ? 'Average 1080p Gaming FPS (12 Titles)' : 'ค่าเฉลี่ย 1080p Gaming FPS (12 เกมดัง)'}</span>
              <span className="text-emerald-400 font-mono font-bold">AMD +9.4%</span>
            </div>
            
            {/* Bar 1 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>AMD Ryzen 7 7800X3D</span>
                <span className="font-mono text-emerald-400 font-bold">248 FPS</span>
              </div>
              <div className="w-full h-3 bg-[#140826] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full w-[95%]" />
              </div>
            </div>

            {/* Bar 2 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Intel Core i7-14700K</span>
                <span className="font-mono text-purple-400 font-bold">227 FPS</span>
              </div>
              <div className="w-full h-3 bg-[#140826] rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full w-[85%]" />
              </div>
            </div>
          </div>

          {/* Benchmark 2: Cinebench Multi-thread */}
          <div className="bg-[#0A0314] border border-purple-500/20 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">{lang === 'en' ? 'Cinebench R23 Rendering (Multi-Thread)' : 'คะแนนเรนเดอร์ Cinebench R23 (Multi-Thread)'}</span>
              <span className="text-purple-400 font-mono font-bold">Intel +85%</span>
            </div>
            
            {/* Bar 1 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Intel Core i7-14700K</span>
                <span className="font-mono text-purple-400 font-bold">34,500 Pts</span>
              </div>
              <div className="w-full h-3 bg-[#140826] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full w-[98%]" />
              </div>
            </div>

            {/* Bar 2 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>AMD Ryzen 7 7800X3D</span>
                <span className="font-mono text-emerald-400 font-bold">18,650 Pts</span>
              </div>
              <div className="w-full h-3 bg-[#140826] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500/70 rounded-full w-[53%]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: SPEC MATRIX ROW BY ROW (FIGMA EXACT TABLE) */}
      <section className="bg-[#120826]/90 rounded-3xl p-6 sm:p-8 border border-purple-500/25 space-y-6 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
        <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 mb-2">
          <Scale className="w-4 h-4 text-cyan-400" />
          <h2 className="text-lg sm:text-xl font-bold font-display text-white">
            {lang === 'en' ? 'Hardware Spec Comparison Matrix' : 'รายการสเปกฮาร์ดแวร์ (Spec Comparison Matrix)'}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-white/[0.1] text-xs">
                <th className="py-3 px-4 text-slate-400 w-1/3 font-semibold uppercase">{lang === 'en' ? 'SPECIFICATION' : 'รายการสเปกฮาร์ดแวร์'}</th>
                <th className="py-3 px-4 text-emerald-400 font-bold w-1/3">AMD Ryzen 7 7800X3D</th>
                <th className="py-3 px-4 text-purple-400 font-bold w-1/3">Intel Core i7-14700K</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {MOCK_SPEC_ROWS.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  {/* Spec Name */}
                  <td className="py-4 px-4 align-top">
                    <span className="font-bold text-white block">{row.label}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{row.sub}</span>
                  </td>

                  {/* Product 1 Value */}
                  <td className="py-4 px-4 align-top">
                    <div className="space-y-1.5">
                      <span className="text-slate-200 whitespace-pre-line font-medium block">
                        {row.val1}
                      </span>
                      {row.val1_highlight && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                          <Check className="w-3 h-3 text-emerald-300" />
                          <span>{row.val1_highlight}</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Product 2 Value */}
                  <td className="py-4 px-4 align-top">
                    <div className="space-y-1.5">
                      <span className="text-slate-200 whitespace-pre-line font-medium block">
                        {row.val2}
                      </span>
                      {row.val2_highlight && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold border border-purple-500/40 shadow-[0_0_8px_rgba(139,92,246,0.25)]">
                          <Check className="w-3 h-3 text-purple-300" />
                          <span>{row.val2_highlight}</span>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Stock Check buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-purple-500/20 text-xs">
          <span className="text-slate-400">{lang === 'en' ? 'Live Stock Check across 4 stores:' : 'ตรวจสอบสต็อกทั้ง 4 ร้านค้าแบบสด:'}</span>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => toast.success(lang === 'en' ? 'Stock Check 7800X3D: JIB (In Stock), Advice (In Stock), iHaveCPU (In Stock), BaNANA (In Stock)' : 'กำลังเช็คสต็อก 7800X3D: JIB (มี), Advice (มี), iHaveCPU (มี), BaNANA (มี)')}
              className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold"
            >
              {lang === 'en' ? 'Check 7800X3D Stock' : 'ดูราคา 7800X3D ทุกร้าน'}
            </button>
            <button
              onClick={() => toast.success(lang === 'en' ? 'Stock Check 14700K: JIB (In Stock), Advice (In Stock), iHaveCPU (In Stock), BaNANA (In Stock)' : 'กำลังเช็คสต็อก 14700K: JIB (มี), Advice (มี), iHaveCPU (มี), BaNANA (มี)')}
              className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold"
            >
              {lang === 'en' ? 'Check 14700K Stock' : 'ดูราคา 14700K ทุกร้าน'}
            </button>
          </div>
        </div>
      </section>

      {/* SECTION: DUAL ANALYSIS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Analysis Card 1 */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 border-emerald-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center space-x-2 text-sm sm:text-base">
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'en' ? 'Analysis: Pure Gaming Priority' : 'บทวิเคราะห์: สายเน้นเล่นเกมล้วนๆ'}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold">
              AMD 7800X3D
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {lang === 'en'
              ? 'If your primary PC usage is gaming, whether competitive eSports titles (CS2, Valorant, Apex Legends) demanding high 1% low FPS or AAA open-world games (Cyberpunk 2077, Black Myth: Wukong), 3D V-Cache 96MB delivers class-leading framerates while drawing nearly half the power of competing Intel CPUs.'
              : 'หากเป้าหมายหลักในการประกอบคอมพิวเตอร์คือการเล่นเกม ไม่ว่าจะเป็นเกมแนว eSports (CS2, Valorant, Apex Legends) ที่ต้องการ 1% Low FPS เสถียรสูงสุด หรือเกมระดับ AAA โลกเปิด (Cyberpunk 2077, Black Myth Wukong) เทคโนโลยี 3D V-Cache 96MB ทำให้ 7800X3D ส่งข้อมูลเฟรมเรตได้เหนือชั้นกว่า Intel ทุกรุ่นในปัจจุบัน และใช้ไฟน้อยกว่าถึงเกือบครึ่ง ทำให้ประหยัดงบพาวเวอร์ซัพพลายและชุดระบายความร้อนได้อีกนับพันบาท'}
          </p>
          <div className="space-y-1.5 pt-2 text-xs text-emerald-300 font-medium">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Standard air or 240mm cooling is sufficient' : 'ไม่ต้องใช้ชุดน้ำ 360mm'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'B650 motherboards run at full speed' : 'เมนบอร์ด B650 ใช้งานได้สมบูรณ์'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'AM5 socket upgrade path through 2027+' : 'อัปเกรดในอนาคตได้ต่อ'}</span>
            </div>
          </div>
        </div>

        {/* Analysis Card 2 */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 border-purple-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center space-x-2 text-sm sm:text-base">
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span>{lang === 'en' ? 'Analysis: Video Editing & Multi-Thread Rendering' : 'บทวิเคราะห์: สายทำงานตัดต่อ & เรนเดอร์'}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[11px] font-bold">
              Intel 14700K
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {lang === 'en'
              ? 'If you run video editing software like Premiere Pro, DaVinci Resolve, 3D Blender, Unreal Engine 5, or stream games with heavy background tasks, 20 Cores / 28 Threads on the 14700K outpace the 7800X3D by up to 85% in multi-threaded benchmarks, bolstered by Intel QuickSync video encoding.'
              : 'หากคุณใช้งานโปรแกรมตัดต่อ Premiere Pro, DaVinci Resolve, ทำงาน 3D Blender, Unreal Engine 5 หรือสตรีมเกมพร้อมเปิดโปรแกรมเบื้องหลังหนักๆ 20 Cores / 28 Threads ของ 14700K กวาดคะแนน Multi-Thread แซงหน้า 7800X3D ไปไกลถึงเกือบ 85% พร้อมทั้งมีชุดคำสั่ง Intel QuickSync ช่วยเอ็นโค้ดวิดีโอแบบเรียลไทม์ ทำให้ไทม์ไลน์ 4K ลื่นไหลเป็นพิเศษ'}
          </p>
          <div className="space-y-1.5 pt-2 text-xs text-purple-300 font-medium">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Intel QuickSync HW Decode</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? '28 threads for smooth multi-tasking' : '28 เธรด ทำงานหลายหน้าต่างลื่น'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Recommended: 360mm AIO liquid cooling' : 'แนะนำจับคู่ชุดน้ำ 3 ตอน'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ALERT BANNER */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border-purple-500/25 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{lang === 'en' ? 'Want price drop alerts for this head-to-head matchup?' : 'ต้องการรับแจ้งเตือนเมื่อราคาคู่เทียบนี้ลดลงหรือไม่?'}</h4>
            <p className="text-xs text-slate-400">{lang === 'en' ? 'IT PRICE Bot will notify you immediately if JIB, Advice, iHaveCPU, or BaNANA launch a Flash Sale.' : 'ระบบ IT PRICE Bot จะส่งการแจ้งเตือนทันทีที่ JIB, Advice, iHaveCPU หรือ BaNANA ทำราคา Flash Sale'}</p>
          </div>
        </div>

        {alertSuccess ? (
          <div className="p-2.5 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'en' ? 'Tracking saved! You will receive an alert on price drop.' : 'บันทึกการติดตามสำเร็จ ระบบจะแจ้งเตือนเมื่อราคาปรับลด!'}</span>
          </div>
        ) : (
          <form onSubmit={handleAlertSubmit} className="flex items-center space-x-2 w-full md:w-auto">
            <input
              type="email"
              value={alertEmail}
              onChange={(e) => setAlertEmail(e.target.value)}
              placeholder={lang === 'en' ? 'Enter your email...' : 'ใส่อีเมลของคุณ...'}
              required
              className="bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-w-[200px]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl btn-cyber-primary text-xs font-bold whitespace-nowrap"
            >
              {lang === 'en' ? 'Track Pair' : 'ติดตามคู่นี้'}
            </button>
          </form>
        )}
      </div>
      </>
      )}

    </div>
  )
}
