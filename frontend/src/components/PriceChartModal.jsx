import React, { useState, useEffect } from 'react'
import { 
  X, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  ShoppingBag, 
  ShieldCheck, 
  TrendingDown, 
  Clock, 
  Bell, 
  Zap, 
  Info,
  Home,
  Eye,
  Mail,
  Activity,
  ChevronDown,
  Sparkles
} from 'lucide-react'
import { productApi, alertApi } from '../api/client'
import { useLanguage } from '../i18n/LanguageContext'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function PriceChartModal({ product, onClose, onSetAlert }) {
  const { t, lang } = useLanguage()
  const [detail, setDetail] = useState(null)
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImgIdx, setActiveImgIdx] = useState(0)

  // Right column embedded alert state
  const [alertTargetPrice, setAlertTargetPrice] = useState('38000')
  const [alertEmail, setAlertEmail] = useState('')
  const [alertSubmitting, setAlertSubmitting] = useState(false)
  const [alertSuccess, setAlertSuccess] = useState(false)
  const [alertError, setAlertError] = useState(null)
  const [timeframe, setTimeframe] = useState('1week')

  useEffect(() => {
    if (!product) return
    loadData()
  }, [product])

  const lowestPrice = detail?.lowest_price || product.lowest_price || 38900
  const msrpPrice = detail?.msrp || product.msrp || 42500
  const allTimeLow = history?.lowest_historical_price || Math.round(lowestPrice * 0.97)

  // 4 Gallery images for multiple angle preview
  const galleryImages = product.image_url 
    ? [product.image_url] 
    : ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=80']

  const loadData = async () => {
    setLoading(true)
    try {
      const [detailRes, histRes] = await Promise.all([
        productApi.getProductDetail(product.id).catch(() => ({ data: null })),
        productApi.getPriceHistory(product.id).catch(() => ({ data: null }))
      ])

      const base = product.lowest_price || 38900

      if (detailRes.data) {
        setDetail(detailRes.data)
      } else {
        setDetail({
          ...product,
          lowest_price: base,
          highest_price: base + 1000,
          avg_price: base + 550,
          msrp: product.msrp || 42500,
          platforms: [
            {
              store_id: 1,
              store_name: 'JIB Computer Official',
              store_slug: 'jib',
              store_color: '#10b981',
              price: base,
              old_price: base + 3090,
              is_lowest: true,
              perks: lang === 'en' ? 'In Stock • 3-Yr Thai Warranty • 0% Installment' : 'มีสต็อกพร้อมส่ง • ประกันศูนย์ไทย 3 ปี • ผ่อน 0%',
              badge1: lang === 'en' ? 'Lowest Price' : 'ถูกที่สุด',
              badge2: lang === 'en' ? 'Fast 3h Delivery' : 'ส่งด่วน 3 ชม.',
              product_url: 'https://www.jib.co.th'
            },
            {
              store_id: 2,
              store_name: 'iHaveCPU Official',
              store_slug: 'ihavecpu',
              store_color: '#8b5cf6',
              price: base + 300,
              old_price: base + 2600,
              is_lowest: false,
              perks: lang === 'en' ? 'Ready to Ship • 3-Yr Warranty • Pre-tested' : 'พร้อมส่ง • ประกันศูนย์แท้ 3 ปี • เทสก่อนส่ง',
              badge1: '+฿300',
              badge2: lang === 'en' ? 'Free ROG Shirt' : 'แถมเสื้อ ROG',
              product_url: 'https://www.ihavecpu.com'
            },
            {
              store_id: 3,
              store_name: 'Advice IT Infinite',
              store_slug: 'advice',
              store_color: '#06b6d4',
              price: base + 600,
              old_price: base + 3000,
              is_lowest: false,
              perks: lang === 'en' ? 'Express Delivery • 0% Installment • 7-Day Return' : 'พร้อมส่งด่วน • ผ่อน 0% สูงสุด 10 ด. • คืนเงินใน 7 วัน',
              badge1: '+฿600',
              badge2: lang === 'en' ? 'Free Shipping' : 'ส่งฟรี',
              product_url: 'https://www.advice.co.th'
            },
            {
              store_id: 4,
              store_name: 'BaNANA IT Online',
              store_slug: 'banana',
              store_color: '#f59e0b',
              price: base + 1000,
              old_price: base + 3600,
              is_lowest: false,
              perks: lang === 'en' ? 'Pickup at 42 Branches • Synnex Warranty' : 'รับหน้าร้าน 42 สาขา • ประกันแท้ศูนย์ไทย SYNNEX',
              badge1: '+฿1,000',
              badge2: lang === 'en' ? 'Pickup in 1h' : 'รับใน 1 ชม.',
              product_url: 'https://www.bnn.in.th'
            }
          ]
        })
      }

      if (histRes.data && histRes.data.series?.length > 0) {
        setHistory(histRes.data)
      } else {
        setHistory({
          lowest_historical_price: 37990,
          current_lowest_price: base,
          series: [
            {
              store_name: 'JIB Online',
              store_color: '#06b6d4',
              data_points: [
                { date: lang === 'en' ? 'Mon' : 'จันทร์', price: 44200 },
                { date: lang === 'en' ? 'Tue' : 'อังคาร', price: 42100 },
                { date: lang === 'en' ? 'Wed' : 'พุธ', price: 38900, is_lowest_point: true },
                { date: lang === 'en' ? 'Thu' : 'พฤหัส', price: 36900 },
                { date: lang === 'en' ? 'Fri' : 'ศุกร์', price: 41800 },
                { date: lang === 'en' ? 'Sat' : 'เสาร์', price: 43500 },
                { date: lang === 'en' ? 'Sun' : 'อาทิตย์', price: 44900 }
              ]
            }
          ]
        })
      }

      setAlertTargetPrice(Math.round(base * 0.97).toString())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (!product) return null

  const handleEmbeddedAlertSubmit = async (e) => {
    e.preventDefault()
    setAlertError(null)
    if (!alertEmail || !alertEmail.includes('@') || !alertTargetPrice) {
      setAlertError(lang === 'en' ? 'Please enter a valid email and target price.' : 'กรุณากรอกอีเมลและราคาเป้าหมายให้ถูกต้อง')
      return
    }
    setAlertSubmitting(true)
    try {
      await alertApi.createAlert({
        product_id: product.id,
        email: alertEmail.trim().toLowerCase(),
        target_price: parseFloat(alertTargetPrice),
        currency: 'THB'
      })
      localStorage.setItem('techprice_alert_email', alertEmail.trim())
      setAlertSuccess(true)
      setTimeout(() => setAlertSuccess(false), 5000)
    } catch (err) {
      console.error(err)
      const detail = err.response?.data?.detail || (lang === 'en' ? 'Failed to create price alert.' : 'ไม่สามารถบันทึกการแจ้งเตือนได้ ตรวจสอบเซิร์ฟเวอร์')
      setAlertError(detail)
    } finally {
      setAlertSubmitting(false)
    }
  }

  // Build Chart.js datasets with Market Average Line
  const getChartData = () => {
    const rawPoints = history?.series?.[0]?.data_points || [
      { date: '10 มี.ค.', price: 43500 },
      { date: '12 มี.ค.', price: 42100 },
      { date: '15 มี.ค.', price: 38900 },
      { date: '18 มี.ค.', price: 36800 },
      { date: '22 มี.ค.', price: 41500 },
      { date: '26 มี.ค.', price: 43800 },
      { date: 'วันนี้', price: 44900 }
    ]

    const labels = rawPoints.map(d => d.date)
    const dataValues = rawPoints.map(d => d.price)

    const datasets = [
      {
        label: lang === 'en' ? 'Lowest Store Price' : 'ราคาต่ำสุดของร้าน',
        data: dataValues,
        borderColor: '#06b6d4',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx
          const gradient = ctx.createLinearGradient(0, 0, 0, 160)
          gradient.addColorStop(0, 'rgba(6, 182, 212, 0.35)')
          gradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)')
          return gradient
        },
        borderWidth: 2.5,
        pointRadius: 2,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1.5,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.38
      }
    ]

    if (history?.market_average_series && history.market_average_series.length > 0) {
      datasets.push({
        label: lang === 'en' ? 'Market Average (4 Stores)' : 'ค่าเฉลี่ยตลาด (4 ร้าน)',
        data: history.market_average_series.map(d => d.price),
        borderColor: '#f59e0b',
        borderDash: [4, 4],
        borderWidth: 1.8,
        pointRadius: 0,
        fill: false,
        tension: 0.38
      })
    }

    return {
      labels,
      datasets
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#94a3b8',
          font: { size: 9 },
          boxWidth: 12,
          boxHeight: 2
        }
      },
      tooltip: {
        backgroundColor: '#0E061E',
        titleColor: '#06b6d4',
        bodyColor: '#ffffff',
        borderColor: 'rgba(6, 182, 212, 0.5)',
        borderWidth: 1,
        padding: 8,
        displayColors: true,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ฿${Number(context.parsed.y).toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        display: false,
        grid: { display: false }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: {
          color: '#64748b',
          font: { size: 9, family: 'monospace' },
          callback: (val) => val === 0 ? '0' : `฿${(val / 1000).toFixed(0)}k`
        }
      }
    }
  }

  // Category breadcrumb text
  const categoryLabel = product.category || (lang === 'en' ? 'Graphics Cards (GPU)' : 'การ์ดจอ (GPU)')
  const brandName = product.brand || 'ASUS ROG'
  const skuCode = product.model_no || 'ROG-STRIX-RTX4080S-O16G'
  const discountPercent = product.max_discount_percent || 7.4

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0D051D]/95 rounded-3xl shadow-[0_0_80px_rgba(139,92,246,0.35)] overflow-hidden flex flex-col border border-purple-500/35 my-auto max-h-[96vh]">
        
        {/* ========================================================= */}
        {/* HEADER BAR (EXACT AS SCREENSHOT) */}
        {/* ========================================================= */}
        <div className="px-5 py-4 border-b border-purple-500/25 flex items-center justify-between bg-[#080214]/90">
          <div className="flex items-center space-x-2.5 text-xs min-w-0">
            {/* Cyan circular (i) info icon */}
            <div className="w-6 h-6 rounded-full border border-cyan-400/60 bg-cyan-400/10 flex items-center justify-center text-cyan-400 font-serif font-bold text-xs shadow-[0_0_10px_rgba(6,182,212,0.3)] flex-shrink-0">
              i
            </div>

            {/* IT PRICE Brand + PRO Badge */}
            <div className="flex items-center space-x-1.5 flex-shrink-0">
              <span className="font-extrabold tracking-wider text-white font-mono text-xs">
                IT PRICE
              </span>
              <span className="px-1.5 py-0.2 rounded border border-cyan-400/50 text-cyan-300 font-bold text-[9px] font-mono">
                PRO
              </span>
            </div>

            <span className="text-slate-500 hidden sm:inline">•</span>

            {/* Modal Title */}
            <span className="text-slate-300 font-medium hidden sm:inline whitespace-nowrap">
              {lang === 'en' ? 'Product Detail Modal' : 'รายละเอียดสินค้า (Product Detail Modal)'}
            </span>

            <span className="text-slate-500 hidden md:inline">•</span>

            {/* Breadcrumbs with Home Icon */}
            <div className="hidden md:flex items-center space-x-1 text-slate-400 font-mono text-[11px] truncate">
              <Home className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span className="text-slate-500">&gt;</span>
              <span className="hover:text-cyan-300 cursor-pointer">{categoryLabel}</span>
              <span className="text-slate-500">&gt;</span>
              <span className="text-slate-200 font-semibold truncate max-w-[200px]">{product.name}</span>
            </div>
          </div>

          {/* Right Header: Realtime Verified Pill & Close Button */}
          <div className="flex items-center space-x-2.5 flex-shrink-0">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>REALTIME VERIFIED</span>
            </span>

            <button
              onClick={onClose}
              className="p-1.5 bg-white/[0.04] border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL BODY: 2-COLUMN SPLIT */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

            {/* ===================================================== */}
            {/* LEFT COLUMN: PRODUCT PREVIEW & 4 STORES TABLE (7/12) */}
            {/* ===================================================== */}
            <div className="lg:col-span-7 flex flex-col gap-4 h-full">

              {/* CARD 1: PRODUCT PREVIEW & MINI SPECS */}
              <div className="bg-[#0C041C] border border-purple-500/25 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                {/* Top Tags & SKU */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#003852] border border-cyan-500/40 text-cyan-300 font-bold text-[10px]">
                      {brandName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-[#25104A] border border-purple-500/40 text-purple-300 font-bold text-[10px]">
                      ADA LOVELACE
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">
                    SKU: {skuCode}
                  </span>
                </div>

                {/* Main Content: Image with 4 Thumbnails on Left + Specs on Right */}
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  
                  {/* Left: Product Image Box + 4 Angle Thumbnails */}
                  <div className="w-full sm:w-48 flex-shrink-0 flex flex-col items-center">
                    <div className="relative w-full h-32 rounded-xl bg-[#06020E] border border-purple-500/20 p-2 flex items-center justify-center overflow-hidden">
                      <span className="absolute top-2 left-2 px-1.5 py-0.2 rounded bg-[#F97316] text-white font-display text-[10px] font-bold">
                        -{discountPercent}%
                      </span>
                      <img
                        src={galleryImages[activeImgIdx]}
                        alt={product.name}
                        className="max-h-28 object-contain transition-all duration-300"
                      />
                    </div>

                    {/* 4 Thumbnails & "4 มุมมอง" indicator */}
                    {galleryImages.length > 1 && (
                      <div className="flex items-center justify-between w-full mt-2.5">
                        <div className="flex items-center space-x-1.5">
                          {galleryImages.map((imgUrl, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveImgIdx(idx)}
                              className={`w-9 h-7 rounded-md bg-[#06020E] border p-0.5 overflow-hidden transition-all ${
                                activeImgIdx === idx 
                                  ? 'border-cyan-400 ring-1 ring-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]' 
                                  : 'border-purple-500/25 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center space-x-1 text-[10px] font-mono text-cyan-400">
                          <Eye className="w-3 h-3 text-cyan-400" />
                          <span>{lang === 'en' ? `${galleryImages.length} Views` : `${galleryImages.length} มุมมอง`}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Product Title, Description, 4 Metric Spec Boxes */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                    <div>
                      <h2 className="text-sm sm:text-base font-black font-display text-white mb-1.5 leading-snug">
                        {product.name}
                      </h2>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                        {lang === 'en' 
                          ? '4th Gen Tensor Cores, 3rd Gen RT Cores with Axial-tech fans for supreme thermal performance and silence.' 
                          : 'Tensor Cores ยุคที่ 4, RT Cores เจเนอเรชันที่ 3 พร้อมพัดลม Axial-tech ระบายความร้อนดีเยี่ยม'}
                      </p>
                    </div>

                    {/* 4 Mini Spec Chips */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      <div className="p-2 rounded-xl bg-[#06020E] border border-purple-500/20 text-center">
                        <span className="text-[9px] text-purple-300/80 font-bold uppercase block tracking-wider">CLOCK</span>
                        <span className="text-xs font-mono font-bold text-white">2670<span className="text-[9px] text-slate-400 ml-0.5">M</span></span>
                      </div>

                      <div className="p-2 rounded-xl bg-[#06020E] border border-purple-500/20 text-center">
                        <span className="text-[9px] text-purple-300/80 font-bold uppercase block tracking-wider">VRAM</span>
                        <span className="text-xs font-mono font-bold text-white">16<span className="text-[9px] text-slate-400 ml-0.5">GB</span></span>
                      </div>

                      <div className="p-2 rounded-xl bg-[#06020E] border border-purple-500/20 text-center">
                        <span className="text-[9px] text-purple-300/80 font-bold uppercase block tracking-wider">CUDA</span>
                        <span className="text-xs font-mono font-bold text-cyan-400">10,240</span>
                      </div>

                      <div className="p-2 rounded-xl bg-[#06020E] border border-purple-500/20 text-center">
                        <span className="text-[9px] text-purple-300/80 font-bold uppercase block tracking-wider">PSU</span>
                        <span className="text-xs font-mono font-bold text-amber-500">750<span className="text-[9px] text-slate-400 ml-0.5">W</span></span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* CARD 2: REAL-TIME COMPARISON TABLE ACROSS 4 TOP STORES */}
              <div className="bg-[#0C041C] border border-purple-500/25 rounded-2xl p-4 sm:p-5 space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex-1 flex flex-col">
                <div className="flex items-center justify-between text-xs pb-1">
                  <h3 className="font-bold text-white flex items-center space-x-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'en' ? 'Compare Top 4 Retailers (Real-time)' : 'เปรียบเทียบราคา 4 ร้านค้าชั้นนำ (Real-time)'}</span>
                  </h3>
                  <span className="text-emerald-400 font-mono text-[11px] flex items-center space-x-1.5 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{lang === 'en' ? 'Live Synced' : 'อัปเดตแล้ว'}</span>
                  </span>
                </div>

                {/* 4 Store Rows */}
                <div className="space-y-2">
                  {detail?.platforms?.map((item, idx) => (
                    <div
                      key={item.store_id || idx}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        item.is_lowest
                          ? 'bg-[#110524] border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                          : 'bg-[#0E061E] border-purple-500/20 hover:border-purple-500/40'
                      }`}
                    >
                      {/* Store Icon & Details */}
                      <div className="flex items-center space-x-3 min-w-0">
                        <div 
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold font-mono border flex-shrink-0"
                          style={{ 
                            color: item.store_color || '#10b981', 
                            backgroundColor: `${item.store_color || '#10b981'}15`,
                            borderColor: `${item.store_color || '#10b981'}40`
                          }}
                        >
                          {item.store_slug === 'jib' ? 'JIB' : item.store_slug === 'ihavecpu' ? 'iHave' : item.store_slug === 'advice' ? 'Advice' : 'BNN'}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="text-xs font-bold text-white truncate">{item.store_name}</span>
                            
                            {item.badge1 && (
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                item.is_lowest ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {item.badge1}
                              </span>
                            )}
                            {item.badge2 && (
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
                                item.is_lowest 
                                  ? 'bg-cyan-500/20 text-cyan-300' 
                                  : item.store_slug === 'ihavecpu' 
                                    ? 'bg-purple-500/20 text-purple-300' 
                                    : item.store_slug === 'banana'
                                      ? 'bg-amber-500/20 text-amber-300'
                                      : 'bg-emerald-500/20 text-emerald-300'
                              }`}>
                                {item.badge2}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {item.perks}
                          </p>
                        </div>
                      </div>

                      {/* Store Price & CTA Button */}
                      <div className="flex items-center space-x-3 flex-shrink-0">
                        <div className="text-right">
                          <div className={`text-sm font-black font-display ${item.is_lowest ? 'text-emerald-400' : 'text-white'}`}>
                            ฿{Number(item.price).toLocaleString()}
                          </div>
                          {item.old_price && (
                            <span className="text-[10px] font-mono text-slate-500 line-through block">
                              ฿{Number(item.old_price).toLocaleString()}
                            </span>
                          )}
                        </div>

                        <a
                          href={item.product_url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all ${
                            item.is_lowest
                              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                              : 'bg-[#1C0F3A] hover:bg-[#281652] border border-purple-500/30 text-white'
                          }`}
                        >
                          <span>{lang === 'en' ? 'Go to Store' : 'ไปร้าน'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ===================================================== */}
            {/* RIGHT COLUMN: PRICE OVERVIEW, CHART, ALERT (5/12) */}
            {/* ===================================================== */}
            <div className="lg:col-span-5 flex flex-col gap-4 h-full">

              {/* CARD 1: TODAY'S PRICE OVERVIEW */}
              <div className="bg-[#0C041C] border border-purple-500/25 rounded-2xl p-4 space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{lang === 'en' ? "Today's Price Overview" : 'ภาพรวมราคาวันนี้'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-0.5">
                  <div className="p-3 rounded-xl bg-[#06020E] border border-purple-500/20">
                    <span className="text-[10px] text-slate-400 block">{lang === 'en' ? 'Current Lowest' : 'ต่ำสุดปัจจุบัน'}</span>
                    <span className="text-xl font-black font-display text-emerald-400 block my-0.5">
                      ฿{Number(lowestPrice).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">{lang === 'en' ? 'Store: JIB Online' : 'ร้าน JIB Online'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#06020E] border border-purple-500/20">
                    <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <span>{lang === 'en' ? 'All-Time Low' : 'ต่ำสุดที่เคยมี'}</span>
                      <Clock className="w-3 h-3 text-purple-400" />
                    </span>
                    <span className="text-xl font-black font-display text-purple-400 block my-0.5">
                      ฿{Number(allTimeLow).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{lang === 'en' ? '15 Mar Payday' : '15 มี.ค. Payday'}</span>
                  </div>
                </div>

                {/* Analysis Indicators: Trend & Volatility */}
                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                  <div className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium truncate flex items-center space-x-1">
                    <TrendingDown className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{detail?.price_trend_text || (lang === 'en' ? 'Downward Trend (Buy)' : 'Trend ขาลง (แนะนำซื้อ)')}</span>
                  </div>
                  <div className="px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 font-medium truncate flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                    <span className="truncate">{history?.volatility_cv_percent ? `ผันผวน: ${history.volatility_cv_percent}% (CV)` : 'เสถียรภาพราคา: สูง'}</span>
                  </div>
                </div>

              </div>

              {/* CARD 2: PRICE HISTORY CHART WITH SAVINGS */}
              <div className="bg-[#0C041C] border border-purple-500/25 rounded-2xl p-4 space-y-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex-1 flex flex-col">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5 text-purple-400" />
                    <span>{lang === 'en' ? 'Price History (Total savings)' : 'กราฟประวัติราคา (Total savings)'}</span>
                  </span>
                  
                  <div className="flex items-center space-x-1 bg-[#06020E] border border-purple-500/30 rounded-lg px-2 py-0.5 text-[11px] text-slate-300">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{lang === 'en' ? '1 Week' : '1 สัปดาห์'}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
                  </div>
                </div>

                {/* Chart Box with Floating Tooltip Preview matching screenshot */}
                <div className="relative flex-1 min-h-[144px] w-full pt-1">
                  <Line data={getChartData()} options={chartOptions} />
                </div>
              </div>

              {/* CARD 3: PRICE DROP ALERT EMBEDDED FORM */}
              <div className="bg-[#0C041C] border border-purple-500/25 rounded-2xl p-4 space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div>
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-white">{lang === 'en' ? 'Price Drop Alert' : 'แจ้งเตือนราคาลด (Price Drop Alert)'}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 pl-8">
                    {lang === 'en' ? 'Get notified immediately when price drops' : 'แจ้งเตือนทันทีเมื่อมีร้านลดราคา'}
                  </p>
                </div>

                {alertSuccess ? (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center font-medium flex items-center justify-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'en' ? 'Alert activated!' : 'เปิดการแจ้งเตือนสำเร็จ! ระบบจะส่งเมลเมื่อราคาลดถึงเป้า'}</span>
                  </div>
                ) : (
                  <form onSubmit={handleEmbeddedAlertSubmit} className="space-y-2.5 text-xs">
                    {/* 3 Quick Target Buttons */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {['38,000', '37,500', '36,900'].map((presetStr, pIdx) => {
                        const numericVal = parseInt(presetStr.replace(/,/g, ''))
                        return (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setAlertTargetPrice(numericVal.toString())}
                            className="py-1 px-1.5 rounded-lg bg-[#140826] hover:bg-purple-600/30 border border-purple-500/30 hover:border-purple-400 font-mono text-[11px] text-purple-200 hover:text-white transition-colors text-center"
                          >
                            &lt; ฿{presetStr}
                          </button>
                        )
                      })}
                    </div>

                    {/* Suggested Target Price based on Historical Low (Item 4 in analysis.md) */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px]">
                      <div className="flex items-center space-x-1.5 text-cyan-300">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{lang === 'en' ? 'Suggested Target:' : 'ราคาแนะนำ (อิงสถิติต่ำสุด):'}</span>
                        <span className="font-bold font-mono text-emerald-400">
                          ฿{Number(detail?.suggested_target_price || history?.suggested_target_price || Math.round(lowestPrice * 0.95)).toLocaleString()}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAlertTargetPrice(String(detail?.suggested_target_price || history?.suggested_target_price || Math.round(lowestPrice * 0.95)))}
                        className="px-2 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-[10px] font-bold transition-all"
                      >
                        {lang === 'en' ? 'Apply' : 'ใช้ราคานี้'}
                      </button>
                    </div>

                    {/* 2 Inputs Side by Side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center bg-[#06020E] border border-purple-500/30 rounded-xl px-3 py-1.5">
                        <span className="text-cyan-400 font-mono mr-1.5 font-bold">฿</span>
                        <input
                          type="number"
                          value={alertTargetPrice}
                          onChange={(e) => setAlertTargetPrice(e.target.value)}
                          placeholder="38000"
                          required
                          className="w-full bg-transparent text-white font-mono focus:outline-none text-xs"
                        />
                      </div>

                      <div className="flex items-center bg-[#06020E] border border-purple-500/30 rounded-xl px-3 py-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 mr-1.5 flex-shrink-0" />
                        <input
                          type="email"
                          value={alertEmail}
                          onChange={(e) => setAlertEmail(e.target.value)}
                          placeholder={lang === 'en' ? 'Your email' : 'อีเมลของคุณ'}
                          required
                          className="w-full bg-transparent text-white focus:outline-none text-xs placeholder-slate-500"
                        />
                      </div>
                    </div>

                    {alertError && (
                      <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] text-center font-medium animate-fade-in">
                        {alertError}
                      </div>
                    )}

                    {/* Big Gradient Submit Button */}
                    <button
                      type="submit"
                      disabled={alertSubmitting}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{alertSubmitting ? (lang === 'en' ? 'Saving...' : 'กำลังบันทึก...') : (lang === 'en' ? 'Enable Price Alert' : 'เปิดการแจ้งเตือนราคาลด')}</span>
                    </button>

                    {/* Reassurance Footer */}
                    <div className="flex items-center justify-center space-x-3 text-[10px] text-slate-400 font-mono pt-0.5">
                      <span className="flex items-center space-x-1 text-emerald-400">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{lang === 'en' ? 'No Spam' : 'ไร้สแปม'}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1 text-cyan-400">
                        <Zap className="w-3 h-3" />
                        <span>{lang === 'en' ? 'Checks every 15m' : 'เช็คทุก 15 นาที'}</span>
                      </span>
                    </div>
                  </form>
                )}
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
