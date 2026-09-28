import React from 'react'
import { TrendingDown, ExternalLink, LineChart, Bell, Layers, Check } from 'lucide-react'
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

  const getStoreBadgeColor = (storeName) => {
    const s = (storeName || '').toLowerCase()
    if (s.includes('jib')) return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    if (s.includes('advice')) return 'bg-blue-600/15 text-blue-300 border-blue-500/30'
    if (s.includes('banana')) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    if (s.includes('ihavecpu')) return 'bg-rose-500/15 text-rose-300 border-rose-500/30'
    return 'bg-blue-500/15 text-blue-300 border-blue-500/30'
  }

  return (
    <div className={`group relative bg-slate-900/70 hover:bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-blue-950/30 ${
      isSelectedForCompare ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-slate-800 hover:border-blue-500/50'
    }`}>
      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
        <span className="px-2.5 py-0.5 text-[11px] font-bold tracking-wide rounded-full bg-[#030712]/80 backdrop-blur-md text-white border border-slate-700/80">
          {product.brand}
        </span>
        {product.max_discount_percent > 0 && (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <TrendingDown className="w-3 h-3" />
            <span>-{product.max_discount_percent}%</span>
          </span>
        )}
      </div>

      {/* Image */}
      <div 
        onClick={() => onOpenChart(product)}
        className="relative pt-10 pb-4 px-6 flex items-center justify-center bg-[#030712]/40 h-48 cursor-pointer overflow-hidden group-hover:bg-[#030712]/60 transition-colors"
      >
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'}
          alt={product.name}
          className="max-h-36 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider block mb-1">
            {product.category}
          </span>
          <h3 
            className="text-xs sm:text-sm font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-2 leading-snug mb-3 cursor-pointer"
            onClick={() => onOpenChart(product)}
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Pricing & Store Info */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">
                {t.productCard.lowestPrice}
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {formatPrice(product.lowest_price)}
              </span>
            </div>
            {product.msrp && product.msrp > (product.lowest_price || 0) && (
              <span className="text-xs text-slate-500 line-through">
                {formatPrice(product.msrp)}
              </span>
            )}
          </div>

          {/* Store badge */}
          <div className="flex items-center justify-between text-xs mb-3">
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getStoreBadgeColor(product.best_store_name)}`}>
              📍 {product.best_store_name || '4 ร้านค้า'}
            </span>
            <span className="text-[11px] text-slate-400">
              {t.productCard.comparedStores.replace('{count}', product.store_count || 4)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            <button
              onClick={() => onOpenChart(product)}
              className="col-span-1 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-blue-400 rounded-xl flex items-center justify-center transition-colors border border-slate-700/50"
              title={t.productCard.chartTooltip}
            >
              <LineChart className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenAlert(product)}
              className="col-span-1 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 rounded-xl flex items-center justify-center transition-colors border border-slate-700/50"
              title={t.productCard.alertTooltip}
            >
              <Bell className="w-4 h-4" />
            </button>

            <button
              onClick={() => onToggleCompare(product)}
              className={`col-span-1 p-2 rounded-xl flex items-center justify-center transition-all border ${
                isSelectedForCompare
                  ? 'bg-blue-600 text-white font-bold border-blue-500 shadow-md shadow-blue-600/30'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/50'
              }`}
              title={t.productCard.compareTooltip}
            >
              {isSelectedForCompare ? <Check className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            </button>

            <a
              href={product.best_product_url || '#'}
              target="_blank"
              rel="noreferrer"
              className="col-span-1 p-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center transition-all shadow-md shadow-blue-600/20"
              title={t.productCard.buyTooltip}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
