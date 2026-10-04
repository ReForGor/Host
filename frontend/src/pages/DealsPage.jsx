import React, { useState, useEffect } from 'react'
import { Flame, TrendingDown, ExternalLink, LineChart, Sparkles, Bell, ArrowRight } from 'lucide-react'
import { productApi } from '../api/client'
import PriceChartModal from '../components/PriceChartModal'
import AlertModal from '../components/AlertModal'
import { useLanguage } from '../i18n/LanguageContext'

export default function DealsPage({ user }) {
  const { t, lang } = useLanguage()
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
      if (res.data && res.data.length > 0) {
        setDeals(res.data)
      } else {
        setDeals([])
      }
    } catch (e) {
      console.warn('Deals notice:', e)
      setDeals([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-6 border-b border-purple-500/25">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-[#F97316] text-xs font-bold mb-3 font-display">
          <Flame className="w-3.5 h-3.5 fill-[#F97316]" />
          <span>HOT FLASH SALES & PRICE DROPS</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black font-display text-white tracking-tight flex items-center space-x-2">
          <span>{lang === 'en' ? "Today's Best IT Deals & Promotions" : 'ดีลเด็ดลดราคา & โปรโมชั่นแรงที่สุดวันนี้'}</span>
          <Flame className="w-7 h-7 text-orange-500 fill-orange-500/20" />
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
          {lang === 'en' 
            ? 'Curated top hardware price drops compared across JIB, Advice, BaNANA IT, and iHaveCPU.' 
            : 'รวบรวมฮาร์ดแวร์ไอทีที่ปรับลดราคาลงมาคุ้มค่าที่สุด เทียบราคาเรียบร้อยระหว่าง JIB, Advice, BaNANA IT และ iHaveCPU'}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-[#120826] rounded-2xl animate-pulse border border-purple-500/25" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-20 bg-[#120826]/80 rounded-3xl border border-purple-500/25">
          <Flame className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">{lang === 'en' ? 'No special promotional deals right now' : 'ยังไม่มีดีลลดราคาพิเศษในขณะนี้'}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {deals.map((prod) => {
            const savings = (prod.highest_price || prod.msrp || prod.lowest_price) - prod.lowest_price
            return (
              <div
                key={prod.id}
                className="bg-[#120826]/90 border border-purple-500/25 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-400 hover:shadow-[0_8px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(139,92,246,0.3)] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase">
                      {prod.category}
                    </span>
                    {prod.max_discount_percent > 0 && (
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#F97316] text-white font-display flex items-center space-x-1 shadow-[0_0_8px_rgba(249,115,22,0.4)]">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>-{prod.max_discount_percent}%</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-20 h-20 object-contain rounded-xl bg-[#0A0314]/90 p-1.5 border border-purple-500/20"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                        {prod.name}
                      </h3>
                      <div className="text-xs text-slate-400 mt-1">
                        {lang === 'en' ? 'Available at: ' : 'วางจำหน่ายที่: '}<strong className="text-cyan-400 font-semibold">{prod.best_store_name}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">{lang === 'en' ? 'Promo Price' : 'ราคาโปรโมชั่น'}</span>
                    <span className="text-lg font-bold font-display text-white">
                      ฿{Number(prod.lowest_price).toLocaleString()}
                    </span>
                    {savings > 0 && (
                      <span className="text-[11px] text-emerald-400 block font-semibold">
                        {lang === 'en' ? `Save ฿${Number(savings).toLocaleString()}` : `ประหยัดได้ ฿${Number(savings).toLocaleString()}`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setActiveChartProduct(prod)}
                      className="p-2 bg-[#1C0F3A] hover:bg-[#25154D] text-slate-300 hover:text-cyan-400 rounded-xl transition-colors border border-purple-500/30"
                      title={lang === 'en' ? 'View Price Chart' : 'ดูกราฟราคา'}
                    >
                      <LineChart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveAlertProduct(prod)}
                      className="p-2 bg-[#1C0F3A] hover:bg-[#25154D] text-slate-300 hover:text-amber-400 rounded-xl transition-colors border border-purple-500/30"
                      title={lang === 'en' ? 'Set Price Drop Alert' : 'ตั้งเตือนราคาลด'}
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                    <a
                      href={prod.best_product_url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.35)] text-xs font-bold rounded-xl flex items-center space-x-1 transition-all"
                    >
                      <span>{lang === 'en' ? 'Buy Now' : 'ซื้อทันที'}</span>
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
