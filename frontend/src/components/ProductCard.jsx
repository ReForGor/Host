import React from 'react'
import { TrendingDown, ExternalLink, ArrowRight, Scale, Check, ShoppingCart, Award } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

export default function ProductCard({ 
  product, 
  onOpenChart, 
  onOpenAlert, 
  onToggleCompare, 
  isSelectedForCompare 
}) {
  const { t } = useLanguage()

  const formatPrice = (p) => {
    if (!p) return '฿0'
    return `฿${Number(p).toLocaleString('th-TH')}`
  }

  const getStoreBadge = (storeName) => {
    const s = (storeName || '').toLowerCase()
    if (s.includes('jib')) {
      return { name: 'JIB Online', color: 'text-amber-300 bg-amber-500/10 border-amber-500/30' }
    }
    if (s.includes('ihavecpu')) {
      return { name: 'iHaveCPU', color: 'text-purple-300 bg-purple-500/10 border-purple-500/30' }
    }
    if (s.includes('banana')) {
      return { name: 'BaNANA IT', color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' }
    }
    return { name: 'Advice IT Infinite', color: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30' }
  }

  const storeInfo = getStoreBadge(product.best_store_name)
  const discountPercent = product.max_discount_percent || 
    (product.msrp && product.lowest_price && product.msrp > product.lowest_price
      ? Math.round(((product.msrp - product.lowest_price) / product.msrp) * 100)
      : 0)

  return (
    <div className={`group relative bg-[#120826]/90 backdrop-blur-md rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
      isSelectedForCompare 
        ? 'border-purple-400 ring-2 ring-purple-400/40 shadow-[0_0_25px_rgba(139,92,246,0.4)]' 
        : 'border-purple-500/20 hover:border-purple-400 hover:shadow-[0_8px_30px_rgba(0,0,0,0.8),0_0_25px_rgba(139,92,246,0.3)]'
    }`}>
      
      {/* Top Bar: Category Tag & Discount Pill */}
      <div className="pt-3 px-3.5 flex items-center justify-between z-10">
        <span className="text-[11px] font-medium text-slate-400 tracking-wide truncate max-w-[170px]">
          {product.category || 'อุปกรณ์คอมพิวเตอร์'}
        </span>
        {discountPercent > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-[#F97316] text-white font-display text-[11px] font-bold shadow-[0_0_10px_rgba(249,115,22,0.4)]">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Illuminated Product Image Recess */}
      <div 
        onClick={() => onOpenChart(product)}
        className="relative mx-3 mt-2 rounded-xl bg-[#0A0314]/90 border border-purple-500/20 p-4 h-44 flex items-center justify-center cursor-pointer group-hover:border-purple-400/40 transition-all overflow-hidden"
      >
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'}
          alt={product.name}
          className="max-h-32 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'
          }}
        />

        {/* 4-Store Sync Indicator */}
        <div className="absolute bottom-2 right-2.5 flex items-center space-x-1.5 bg-[#140826]/90 px-2 py-0.5 rounded-full border border-purple-500/30 text-[10px] text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>ครบทั้ง 4 ร้านค้า</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Model Code */}
          <div className="flex items-center space-x-2 text-[10px] font-mono tracking-wider text-slate-400 mb-1">
            <span className="font-bold text-cyan-400 uppercase">{product.brand || 'IT'}</span>
            {product.model_no && (
              <span className="text-slate-500 truncate">{product.model_no}</span>
            )}
          </div>

          {/* Product Name */}
          <h3 
            className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug cursor-pointer mb-3"
            onClick={() => onOpenChart(product)}
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Pricing Block */}
        <div className="pt-2 border-t border-purple-500/20 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block font-normal">
                ราคาต่ำสุดในไทย
              </span>
              <span className="text-lg sm:text-xl font-bold font-display text-white tracking-tight">
                {formatPrice(product.lowest_price)}
              </span>
            </div>
            {product.msrp && product.msrp > (product.lowest_price || 0) && (
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">ราคาเปิดตัว</span>
                <span className="text-xs text-slate-500 line-through font-display">
                  {formatPrice(product.msrp)}
                </span>
              </div>
            )}
          </div>

          {/* Best Store Tag + Quick Cart Action */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium ${storeInfo.color}`}>
              <Award className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{storeInfo.name}</span>
            </div>
            <a
              href={product.best_product_url || '#'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              title="ไปยังร้านค้าที่ถูกที่สุด"
            >
              <ShoppingCart className="w-3 h-3" />
              <span>ใส่ตะกร้า (ถูกสุด)</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
            </a>
          </div>

          {/* Action Buttons: Compare Price (CTA) & Spec Compare Toggle */}
          <div className="flex items-center space-x-1.5 pt-2">
            <button
              onClick={() => onOpenChart(product)}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
            >
              <span>เปรียบเทียบราคา</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onToggleCompare(product)}
              className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
                isSelectedForCompare
                  ? 'bg-purple-600 text-white border-purple-400 font-bold shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                  : 'bg-[#1C0F3A] text-slate-300 border-purple-500/25 hover:border-purple-400 hover:text-white'
              }`}
              title="เทียบสเปกเคียงข้าง"
            >
              {isSelectedForCompare ? <Check className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
