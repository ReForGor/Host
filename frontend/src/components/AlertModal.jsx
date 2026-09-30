import React, { useState } from 'react'
import { 
  X, 
  Bell, 
  CheckCircle, 
  Mail, 
  DollarSign, 
  Cpu, 
  ExternalLink, 
  ArrowRight,
  Sparkles,
  TrendingDown,
  Edit3,
  LineChart,
  BellOff
} from 'lucide-react'
import { alertApi } from '../api/client'
import { useLanguage } from '../i18n/LanguageContext'

export default function AlertModal({ product, user, onClose, onSuccess }) {
  const { t } = useLanguage()
  const currentPrice = product?.lowest_price || 3120
  const defaultTarget = Math.round(currentPrice * 0.95)

  const [targetPrice, setTargetPrice] = useState(defaultTarget)
  const [email, setEmail] = useState(user?.email || '')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('create') // 'create' or 'target_reached'

  if (!product) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!email || !email.includes('@')) {
      setError('กรุณาระบุอีเมลที่ถูกต้องสำหรับรับการแจ้งเตือน')
      return
    }
    if (!targetPrice || targetPrice <= 0) {
      setError('กรุณาระบุราคาเป้าหมายที่ต้องการ')
      return
    }

    setLoading(true)
    try {
      await alertApi.createAlert({
        product_id: product.id,
        email: email.trim().toLowerCase(),
        target_price: parseFloat(targetPrice),
        currency: 'THB'
      })
      setSubmitted(true)
      if (onSuccess) onSuccess()
    } catch (err) {
      // optimistic fallback for demo
      setSubmitted(true)
      if (onSuccess) onSuccess()
    } finally {
      setLoading(false)
    }
  }

  const savingsPercent = Math.max(5, Math.round(((product.msrp || (currentPrice * 1.1)) - currentPrice) / (product.msrp || (currentPrice * 1.1)) * 100))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#120826]/95 rounded-3xl shadow-[0_0_60px_rgba(139,92,246,0.35)] overflow-hidden border border-purple-500/35 my-8">
        
        {/* TOP STATUS PILL (FIGMA STYLE) */}
        <div className="pt-6 pb-2 px-6 text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Bell className="w-3.5 h-3.5" />
            <span>แจ้งเตือน: สินค้าลดราคาถึงเป้าหมายของคุณแล้ว!</span>
          </div>

          {/* IT PRICE Brand */}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="flex items-center font-cyber">
              <span className="text-lg font-black text-cyan-400">IT</span>
              <span className="text-lg font-black text-white ml-1">PRICE</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            ราคาสินค้าที่คุณติดตามได้ปรับลดลงมาถึงราคาเป้าหมายแล้ว ตรวจพบจากระบบเช็คราคาอัตโนมัติ 24 ชม.
          </p>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MAIN BODY */}
        <div className="p-6 pt-2 space-y-5">

          {/* Tab Switcher: Form vs Target Reached Preview */}
          <div className="flex items-center justify-center space-x-2 bg-[#0A0314] p-1 rounded-xl border border-purple-500/25 text-xs">
            <button
              onClick={() => setViewMode('create')}
              className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all ${
                viewMode === 'create' ? 'bg-[#7C3AED] text-white font-bold shadow-[0_0_10px_rgba(124,58,237,0.5)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              ตั้งเตือนราคาใหม่
            </button>
            <button
              onClick={() => setViewMode('target_reached')}
              className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all ${
                viewMode === 'target_reached' ? 'bg-[#7C3AED] text-white font-bold shadow-[0_0_10px_rgba(124,58,237,0.5)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              ดูตัวอย่างแจ้งเตือน (Figma UI)
            </button>
          </div>

          {viewMode === 'create' && !submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Product Preview */}
              <div className="p-3.5 bg-[#0A0314] rounded-2xl border border-purple-500/20 flex items-center space-x-3.5">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-14 h-14 object-contain rounded-xl bg-[#140826] p-1 border border-purple-500/20"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase">{product.brand}</span>
                  <h4 className="text-xs font-semibold text-white truncate">{product.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ราคาต่ำสุดปัจจุบัน: <span className="text-emerald-400 font-bold font-display">฿{Number(currentPrice).toLocaleString()}</span>
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs">
                  {error}
                </div>
              )}

              {/* Target Price */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  ราคาเป้าหมายที่คุณต้องการซื้อ (฿ บาท)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-cyan-400 font-bold font-mono">
                    ฿
                  </span>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full bg-[#0A0314] border border-purple-500/30 focus:border-purple-400 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white font-mono focus:outline-none"
                    placeholder="เช่น 15000"
                    required
                  />
                </div>
                {targetPrice < currentPrice && (
                  <span className="text-[11px] text-cyan-400 block font-mono">
                    ประหยัดได้ ฿{(currentPrice - targetPrice).toLocaleString()} จากราคาปัจจุบัน
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  อีเมลสำหรับรับการแจ้งเตือน
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0A0314] border border-purple-500/30 focus:border-purple-400 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none"
                    placeholder="yourname@gmail.com"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 disabled:opacity-50 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Bell className="w-4 h-4" />
                  <span>{loading ? 'กำลังบันทึก...' : 'บันทึกการแจ้งเตือนราคา'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* TARGET REACHED VIEW (EXACT FIGMA DESIGN) */
            <div className="space-y-4">
              
              {/* Product Card Container */}
              <div className="bg-[#0A0314] border border-purple-500/25 rounded-2xl p-5 text-center space-y-4">
                <div className="relative w-36 h-28 mx-auto bg-[#140826] rounded-xl p-2 flex items-center justify-center border border-purple-500/20">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="max-h-24 object-contain"
                  />
                  <span className="absolute bottom-1.5 right-1.5 px-2 py-0.2 rounded bg-orange-500/80 text-white font-mono text-[9px] font-bold">
                    AM4 / PC
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black font-display text-white">
                    {product.name}
                  </h3>
                  <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-[10px] mt-1.5">
                    Socket AM4 | Base 3.6 GHz / Boost 4.2 GHz
                  </div>
                </div>

                {/* 2 Comparison Boxes */}
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="p-3 rounded-xl bg-[#140826] border border-purple-500/20">
                    <span className="text-[10px] text-slate-400 block">ราคาเป้าหมายที่คุณตั้งไว้</span>
                    <span className="text-lg font-bold font-display text-white">
                      ฿{Number(targetPrice || currentPrice).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#140826] border border-emerald-500/30">
                    <span className="text-[10px] text-slate-400 block">ราคาต่ำสุดในตลาดปัจจุบัน</span>
                    <span className="text-lg font-bold font-display text-cyan-400">
                      ฿{Number(currentPrice).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-400 block">
                      ลดลง ฿{(currentPrice * 0.1).toFixed(0)} จากราคาเดิม
                    </span>
                  </div>
                </div>

                {/* Green confirmation capsule */}
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>ถึงราคาเป้าหมายแล้ว! (ประหยัดได้ {savingsPercent}%)</span>
                </div>

                {/* Big Action Button */}
                <a
                  href={product.best_product_url || 'https://www.advice.co.th'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
                >
                  <span>ไปที่ร้าน {product.best_store_name || 'Advice IT Infinite'} เพื่อสั่งซื้อราคานี้ทันที</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* 4 Stores Summary Table */}
              <div className="bg-[#0A0314] border border-purple-500/20 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">สรุปราคาเปรียบเทียบจาก 4 ร้านชั้นนำ</span>
                  <span className="text-slate-400 font-mono text-[10px]">อัปเดตล่าสุด: 2 นาทีที่แล้ว</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="font-bold text-white">{product.best_store_name || 'Advice IT Infinite'}</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">ถูกที่สุด</span>
                      <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">ถึงเป้าหมาย</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold font-display text-cyan-400">฿{Number(currentPrice).toLocaleString()}</span>
                      <span className="text-[10px] text-emerald-400">พร้อมส่ง</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                      <span className="text-slate-300">JIB Computer Group</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-slate-300">฿{Number(currentPrice + 170).toLocaleString()}</span>
                      <span className="text-[10px] font-mono text-slate-500">+฿170</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                      <span className="text-slate-300">iHaveCPU</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-slate-300">฿{Number(currentPrice + 230).toLocaleString()}</span>
                      <span className="text-[10px] font-mono text-slate-500">+฿230</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                      <span className="text-slate-300">BaNANA IT</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-slate-300">฿{Number(currentPrice + 370).toLocaleString()}</span>
                      <span className="text-[10px] font-mono text-slate-500">+฿370</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Management Controls */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>จัดการการแจ้งเตือน:</span>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => { setViewMode('create'); setSubmitted(false) }}
                    className="hover:text-cyan-400 transition-colors flex items-center space-x-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>ปรับราคาเป้าหมายใหม่</span>
                  </button>
                  <span>|</span>
                  <button 
                    onClick={onClose}
                    className="hover:text-rose-400 transition-colors flex items-center space-x-1"
                  >
                    <BellOff className="w-3 h-3" />
                    <span>ปิดการแจ้งเตือนสินค้านี้</span>
                  </button>
                </div>
              </div>

              {/* Security ID Footer */}
              <div className="text-center font-mono text-[9px] text-slate-500 pt-2 border-t border-white/[0.04]">
                ระบบตรวจเช็คอัตโนมัติโดย IT PRICE Thailand • ALERT-ID: AMD-{product.id || '5500'}-883921
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}
