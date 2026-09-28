import React, { useState, useEffect } from 'react'
import { X, ExternalLink, Calendar, CheckCircle2, AlertCircle, ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react'
import { productApi } from '../api/client'
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
  const { t } = useLanguage()
  const [detail, setDetail] = useState(null)
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)

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
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (!product) return null

  // Build Chart.js datasets with Royal Blue CI
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
          font: { family: 'Prompt, Inter', size: 12 }
        }
      },
      tooltip: {
        backgroundColor: '#030712',
        titleColor: '#60a5fa',
        bodyColor: '#ffffff',
        borderColor: '#1e3a8a',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ฿${Number(context.parsed.y).toLocaleString('th-TH')}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: '#1e293b' },
        ticks: { color: '#94a3b8', font: { size: 11 } }
      },
      y: {
        grid: { color: '#1e293b' },
        ticks: {
          color: '#94a3b8',
          callback: (value) => `฿${Number(value).toLocaleString()}`
        }
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-[#030712]/90">
          <div className="flex items-center space-x-4">
            <img 
              src={product.image_url || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'} 
              alt={product.name}
              className="w-14 h-14 object-contain rounded-xl bg-slate-950 p-1 border border-slate-800"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  {product.brand} • {product.category}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-900/40 text-blue-300 rounded border border-blue-700/40">
                  LIVE 4 STORES
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5 line-clamp-1">
                {product.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
              <span>กำลังดึงข้อมูลราคา Real-Time จาก 4 ร้านค้า...</span>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-[#030712]/70 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">
                    {t.productModal.lowestPriceNow}
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold text-white">
                    ฿{Number(detail?.lowest_price || 0).toLocaleString()}
                  </span>
                </div>
                <div className="bg-[#030712]/70 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">
                    {t.productModal.bestStore}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-blue-400 truncate block">
                    📍 {detail?.best_store || 'JIB / Advice'}
                  </span>
                </div>
                <div className="bg-[#030712]/70 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">
                    {t.productModal.maxSavings}
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold text-amber-400">
                    ฿{Number(detail?.total_savings || 0).toLocaleString()}
                  </span>
                </div>
                <div className="bg-[#030712]/70 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">
                    {t.productModal.avgPrice}
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-300">
                    ฿{Number(detail?.avg_price || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Price Comparison Table (4 Stores) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center">
                    <ShoppingBag className="w-4 h-4 mr-2 text-blue-400" />
                    <span>{t.productModal.storeComparisonTable}</span>
                  </h3>
                  <span className="text-xs text-slate-400">เช็คราคาสดเรียบร้อย</span>
                </div>
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-[#030712]/50">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#030712] text-slate-400 text-xs uppercase border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">{t.productModal.storeName}</th>
                        <th className="py-3 px-4 hidden sm:table-cell">{t.productModal.stockStatus}</th>
                        <th className="py-3 px-4 text-right">{t.productModal.salePrice}</th>
                        <th className="py-3 px-4 text-right">{t.productModal.diff}</th>
                        <th className="py-3 px-4 text-center">{t.productModal.goToStore}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {detail?.platforms?.map((item) => (
                        <tr 
                          key={item.store_id} 
                          className={`hover:bg-slate-800/50 transition-colors ${
                            item.is_lowest ? 'bg-blue-950/20 font-medium' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 flex items-center space-x-2">
                            <span 
                              className="w-2.5 h-2.5 rounded-full" 
                              style={{ backgroundColor: item.store_color }} 
                            />
                            <span className="text-white font-semibold">{item.store_name}</span>
                            {item.is_lowest && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
                                {t.productModal.bestPriceBadge}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-400 hidden sm:table-cell">
                            {item.stock_status === 'in_stock' ? (
                              <span className="text-emerald-400 flex items-center">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> มีสินค้าพร้อมส่ง
                              </span>
                            ) : (
                              <span className="text-amber-400 flex items-center">
                                <AlertCircle className="w-3.5 h-3.5 mr-1" /> สั่งจองล่วงหน้า
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="text-base font-bold text-white">
                              ฿{Number(item.price).toLocaleString()}
                            </span>
                            {item.original_price && item.original_price > item.price && (
                              <span className="block text-xs text-slate-500 line-through">
                                ฿{Number(item.original_price).toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right text-xs">
                            {item.is_lowest ? (
                              <span className="text-blue-400 font-bold">฿0 (ถูกที่สุด)</span>
                            ) : (
                              <span className="text-slate-400">
                                +฿{Number(item.price_diff_from_lowest).toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <a
                              href={item.product_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm"
                            >
                              <span>{t.productModal.buyDirect}</span>
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Price History Line Chart */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                    <span>{t.productModal.priceTrendChart}</span>
                  </h3>
                </div>
                <div className="h-64 bg-[#030712]/70 p-4 rounded-2xl border border-slate-800">
                  <Line data={getChartData()} options={chartOptions} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-[#030712]/90 flex items-center justify-between">
          <button
            onClick={() => {
              onClose()
              if (onSetAlert) onSetAlert(product)
            }}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
          >
            {t.productModal.setAlertBtn}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {t.productModal.closeBtn}
          </button>
        </div>
      </div>
    </div>
  )
}
