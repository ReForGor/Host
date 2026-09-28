import React, { useState, useEffect } from 'react'
import { Flame, TrendingDown, ExternalLink, LineChart, Sparkles, Bell } from 'lucide-react'
import { productApi } from '../api/client'
import PriceChartModal from '../components/PriceChartModal'
import AlertModal from '../components/AlertModal'
import { useLanguage } from '../i18n/LanguageContext'

export default function DealsPage({ user }) {
  const { t } = useLanguage()
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeChartProduct, setActiveChartProduct] = useState(null)
  const [activeAlertProduct, setActiveAlertProduct] = useState(null)

  useEffect(() => {
    loadDeals()
  }, [])

  const loadDeals = async () => {
    setLoading(true)
    try {
      const res = await productApi.getProducts({ sort_by: 'discount', limit: 40 })
      setDeals(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-slate-800">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold mb-3">
          <Flame className="w-3.5 h-3.5 fill-rose-500" />
          <span>Hot Flash Sales & Price Drops</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          ดีลเด็ดลดราคา & โปรโมชั่นแรงที่สุดวันนี้ 🔥
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
          รวบรวมฮาร์ดแวร์ไอทีที่ปรับลดราคาลงมาคุ้มค่าที่สุด เทียบราคาเรียบร้อยระหว่าง JIB, Advice, BaNANA IT และ iHaveCPU
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-900/60 rounded-2xl animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800">
          <Flame className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">ยังไม่มีดีลลดราคาพิเศษในขณะนี้</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((prod) => {
            const savings = (prod.highest_price || prod.msrp || prod.lowest_price) - prod.lowest_price
            return (
              <div
                key={prod.id}
                className="bg-slate-900/70 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-blue-950/20"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-blue-400 tracking-wider uppercase">
                      {prod.category}
                    </span>
                    {prod.max_discount_percent > 0 && (
                      <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center space-x-1">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>ลด {prod.max_discount_percent}%</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-20 h-20 object-contain rounded-xl bg-[#030712] p-1.5 border border-slate-800"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                        {prod.name}
                      </h3>
                      <div className="text-xs text-slate-400 mt-1">
                        วางจำหน่ายที่: <strong className="text-blue-400">📍 {prod.best_store_name}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">ราคาโปรโมชั่น</span>
                    <span className="text-lg font-extrabold text-white">
                      ฿{Number(prod.lowest_price).toLocaleString()}
                    </span>
                    {savings > 0 && (
                      <span className="text-[11px] text-amber-400 block font-semibold">
                        ประหยัดได้ ฿{Number(savings).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActiveChartProduct(prod)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-blue-400 rounded-xl transition-colors border border-slate-700/60"
                      title="ดูกราฟราคา"
                    >
                      <LineChart className="w-4 h-4" />
                    </button>
                    <a
                      href={prod.best_product_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center space-x-1"
                    >
                      <span>ซื้อทันที</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

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
