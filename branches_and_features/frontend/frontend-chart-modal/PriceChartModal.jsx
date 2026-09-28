import React, { useState, useEffect } from 'react'
import { 
  X, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ShoppingBag, 
  Bell, 
  Cpu, 
  Layers, 
  TrendingDown,
  Check
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

export default function PriceChartModal({ product, onClose, user }) {
  const { t, language } = useLanguage()
  const [detail, setDetail] = useState(null)
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)

  // In-modal Alert Box State
  const [targetPrice, setTargetPrice] = useState('')
  const [alertEmail, setAlertEmail] = useState(user?.email || '')
  const [submittingAlert, setSubmittingAlert] = useState(false)
  const [alertSuccess, setAlertSuccess] = useState(false)
  const [alertError, setAlertError] = useState('')

  useEffect(() => {
    if (!product) return
    loadData()
  }, [product])

  const loadData = async () => {
    setLoading(true)
    try {
      const [detailRes, histRes] = await Promise.all([
        productApi.getProductDetail(product.id),
        productApi.getPriceHistory(product.id)
      ])
      setDetail(detailRes.data)
      setHistory(histRes.data)
      
      // Auto pre-fill target price 5% lower than current lowest price
      if (detailRes.data?.lowest_price) {
        const discountTarget = Math.floor(detailRes.data.lowest_price * 0.95)
        setTargetPrice(discountTarget.toString())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAlert = async (e) => {
    e.preventDefault()
    setAlertError('')
    setAlertSuccess(false)

    if (!alertEmail || !alertEmail.includes('@')) {
      setAlertError(language === 'th' ? 'กรุณากรอกอีเมลที่ถูกต้อง' : 'Please enter a valid email')
      return
    }

    const priceNum = parseFloat(targetPrice)
    if (!priceNum || priceNum <= 0) {
      setAlertError(language === 'th' ? 'กรุณาระบุราคาเป้าหมายที่ถูกต้อง' : 'Please enter a valid target price')
      return
    }

    setSubmittingAlert(true)
    try {
      await alertApi.createAlert({
        product_id: product.id,
        email: alertEmail,
        target_price: priceNum,
        currency: 'THB'
      })
      setAlertSuccess(true)
      setTimeout(() => {
        setAlertSuccess(false)
      }, 5000)
    } catch (err) {
      setAlertError(
        err.response?.data?.detail || 
        (language === 'th' ? 'เกิดข้อผิดพลาดในการบันทึกแจ้งเตือน' : 'Failed to create alert')
      )
    } finally {
      setSubmittingAlert(false)
    }
  }

  if (!product) return null

  // Build Chart.js datasets with vibrant royal colors
  const getChartData = () => {
    if (!history || !history.series || history.series.length === 0) {
      return { labels: [], datasets: [] }
    }

    const dateSet = new Set()
    history.series.forEach(s => {
      s.data_points.forEach(dp => dateSet.add(dp.date))
    })
    const labels = Array.from(dateSet).sort()

    const datasets = history.series.map(s => {
      const priceMap = {}
      s.data_points.forEach(dp => { priceMap[dp.date] = dp.price })
      const data = labels.map(d => priceMap[d] !== undefined ? priceMap[d] : null)

      return {
        label: s.store_name,
        data: data,
        borderColor: s.store_color || '#2563eb',
        backgroundColor: `${s.store_color || '#2563eb'}22`,
        borderWidth: 2.5,
        pointRadius: 3,
        pointHoverRadius: 6,
        tension: 0.2,
        spanGaps: true
      }
    })

    return { labels, datasets }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#cbd5e1',
          font: { family: 'Prompt, Inter', size: 11 },
          boxWidth: 12
        }
      },
      tooltip: {
        backgroundColor: '#030712',
        titleColor: '#60a5fa',
        bodyColor: '#ffffff',
        borderColor: '#1e3a8a',
        borderWidth: 1,
        padding: 8,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ฿${Number(context.parsed.y).toLocaleString('th-TH')}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: '#1e293b' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      },
      y: {
        grid: { color: '#1e293b' },
        ticks: {
          color: '#94a3b8',
          font: { size: 10 },
          callback: (value) => `฿${Number(value).toLocaleString()}`
        }
      }
    }
  }

  // Render specs list helper
  const renderSpecs = () => {
    const specs = detail?.specs || product.specs || {}
    const entries = Object.entries(specs)
    if (entries.length === 0) {
      return (
        <p className="text-xs text-slate-400 italic">
          {product.description || (language === 'th' ? 'ไม่มีข้อมูลสเปคเพิ่มเติม' : 'No extra specs available')}
        </p>
      )
    }

    return (
      <div className="grid grid-cols-2 gap-2 text-xs">
        {entries.slice(0, 6).map(([key, val]) => (
          <div key={key} className="bg-slate-950/70 border border-slate-800 rounded-lg p-2">
            <span className="text-slate-400 block text-[11px] font-medium capitalize truncate">
              {key.replace(/_/g, ' ')}
            </span>
            <span className="text-white font-semibold truncate block mt-0.5">
              {String(val)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-[#030712]/90">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              {language === 'th' ? 'หน้าต่างข้อมูลสินค้า & เช็คราคาเปรียบเทียบ' : 'Product Details & Comparison'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body (2 Columns Layout matching the handwritten sketch) */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center text-slate-400">
              <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
              <span className="text-sm font-medium">กำลังโหลดข้อมูลราคาสดจาก 4 ร้านค้า...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
              
              {/* ==================== LEFT COLUMN (ฝั่งซ้าย) ==================== */}
              {/* 1. รูป | 2. ชื่อ : | 3. สเปค : | 4. ตารางเปรียบเทียบ */}
              <div className="p-5 sm:p-6 space-y-5 flex flex-col justify-between">
                
                {/* 1. รูป (Product Image) */}
                <div className="relative w-full h-52 sm:h-56 bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex items-center justify-center group overflow-hidden">
                  <div className="absolute top-3 left-3 flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
                      {product.brand}
                    </span>
                    <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-slate-800/80 text-slate-300">
                      {product.category}
                    </span>
                  </div>

                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'}
                    alt={product.name}
                    className="max-h-44 max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'
                    }}
                  />
                </div>

                {/* 2. ชื่อ : (Product Name) */}
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                  <span className="text-xs font-bold text-blue-400 block mb-1">
                    {language === 'th' ? 'ชื่อสินค้า :' : 'Product Name :'}
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {product.name}
                  </h2>
                </div>

                {/* 3. สเปค : (Specs) */}
                <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
                  <div className="flex items-center space-x-1.5 mb-2.5">
                    <Cpu className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {language === 'th' ? 'สเปค :' : 'Specifications :'}
                    </span>
                  </div>
                  {renderSpecs()}
                </div>

                {/* 4. ตารางเปรียบเทียบ (Store Comparison Table) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5">
                      <ShoppingBag className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {language === 'th' ? 'ตารางเปรียบเทียบราคา' : 'Price Comparison Table'}
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center">
                      <Check className="w-3 h-3 mr-0.5" /> 4 ร้านค้าสด
                    </span>
                  </div>

                  <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#030712] text-slate-400 text-[11px] uppercase border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">ร้านค้า</th>
                          <th className="py-2.5 px-3 text-right">ราคา</th>
                          <th className="py-2.5 px-3 text-right">ส่วนต่าง</th>
                          <th className="py-2.5 px-3 text-center">ซื้อ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {detail?.platforms?.map((item) => (
                          <tr 
                            key={item.store_id} 
                            className={`hover:bg-slate-800/40 transition-colors ${
                              item.is_lowest ? 'bg-blue-950/30' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3 flex items-center space-x-2">
                              <span 
                                className="w-2 h-2 rounded-full shrink-0" 
                                style={{ backgroundColor: item.store_color }} 
                              />
                              <span className="text-white font-medium truncate max-w-[90px] sm:max-w-[120px]">
                                {item.store_name}
                              </span>
                              {item.is_lowest && (
                                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-blue-600/30 text-blue-300 border border-blue-500/40">
                                  ถูกสุด
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-white whitespace-nowrap">
                              ฿{Number(item.price).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right text-[11px] whitespace-nowrap">
                              {item.is_lowest ? (
                                <span className="text-emerald-400 font-bold">฿0</span>
                              ) : (
                                <span className="text-slate-400">
                                  +฿{Number(item.price_diff_from_lowest).toLocaleString()}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <a
                                href={item.product_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center px-2 py-1 text-[11px] font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm"
                              >
                                <span>ไปร้าน</span>
                                <ExternalLink className="w-2.5 h-2.5 ml-1" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* ==================== RIGHT COLUMN (ฝั่งขวา) ==================== */}
              {/* 1. กราฟ (Price History) | 2. กล่องเตือนลดราคา (Price Drop Alert) */}
              <div className="p-5 sm:p-6 space-y-6 flex flex-col justify-between bg-slate-900/60">
                
                {/* 1. กราฟ (Price History Line Chart) */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        {language === 'th' ? 'กราฟแนวโน้มราคา (Price Trend)' : 'Price History Graph'}
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {detail?.lowest_price ? `ถูกสุดวันนี้ ฿${Number(detail.lowest_price).toLocaleString()}` : ''}
                    </span>
                  </div>

                  <div className="h-60 sm:h-64 bg-[#030712]/80 p-3 rounded-2xl border border-slate-800">
                    <Line data={getChartData()} options={chartOptions} />
                  </div>
                </div>

                {/* 2. กล่องเตือนลดราคา (Price Drop Alert Box as drawn in sketch) */}
                <div className="bg-[#030712]/90 border-2 border-blue-600/40 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {language === 'th' ? 'กล่องแจ้งเตือนราคาลด' : 'Price Drop Alert Box'}
                        </h4>
                        <span className="text-[11px] text-slate-400 block">
                          {language === 'th' ? 'รับอีเมลทันทีเมื่อสินค้าราคาลงถึงเป้าหมาย' : 'Get notified when price drops'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">ราคาต่ำสุดตอนนี้</span>
                      <span className="text-sm font-extrabold text-blue-400 font-mono">
                        ฿{Number(detail?.lowest_price || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {alertSuccess && (
                    <div className="mb-3 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{language === 'th' ? 'ตั้งค่าแจ้งเตือนสำเร็จ! ระบบจะส่งอีเมลแจ้งเตือนเมื่อราคาลด' : 'Alert set successfully!'}</span>
                    </div>
                  )}

                  {alertError && (
                    <div className="mb-3 p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center space-x-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{alertError}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateAlert} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] text-slate-300 font-medium block mb-1">
                          {language === 'th' ? 'ราคาเป้าหมายที่ต้องการ (฿)' : 'Target Price (฿)'}
                        </label>
                        <input
                          type="number"
                          value={targetPrice}
                          onChange={(e) => setTargetPrice(e.target.value)}
                          placeholder="เช่น 24500"
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-300 font-medium block mb-1">
                          {language === 'th' ? 'อีเมลสำหรับรับการแจ้งเตือน' : 'Notification Email'}
                        </label>
                        <input
                          type="email"
                          value={alertEmail}
                          onChange={(e) => setAlertEmail(e.target.value)}
                          placeholder="your-email@example.com"
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingAlert}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-900/30 flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {submittingAlert ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>กำลังบันทึก...</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-3.5 h-3.5" />
                          <span>{language === 'th' ? 'บันทึกการแจ้งเตือนราคาลด' : 'Set Price Drop Alert'}</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Bottom Close Action */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={onClose}
                    className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {language === 'th' ? 'ปิดหน้าต่าง' : 'Close'}
                  </button>
                </div>

              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  )
}
