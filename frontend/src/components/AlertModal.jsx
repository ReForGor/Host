import React, { useState } from 'react'
import { X, Bell, CheckCircle, Mail, DollarSign } from 'lucide-react'
import { alertApi } from '../api/client'
import { useLanguage } from '../i18n/LanguageContext'

export default function AlertModal({ product, user, onClose, onSuccess }) {
  const { t } = useLanguage()
  const currentPrice = product?.lowest_price || 0
  const defaultTarget = Math.round(currentPrice * 0.95)

  const [targetPrice, setTargetPrice] = useState(defaultTarget)
  const [email, setEmail] = useState(user?.email || '')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

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
      setError(err.response?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกการแจ้งเตือน')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#030712]/90">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">ตั้งเตือนราคาลด (Price Drop Alert)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white">บันทึกการแจ้งเตือนสำเร็จ!</h4>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                ระบบ KPTM PRICE ส่งอีเมลยืนยันไปยัง <strong>{email}</strong> แล้ว และจะส่งแจ้งเตือนทันทีเมื่อราคาต่ำกว่า ฿{Number(targetPrice).toLocaleString()}
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all"
              >
                เสร็จสิ้น
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Product Info */}
              <div className="p-3 bg-[#030712] rounded-2xl border border-slate-800 flex items-center space-x-3">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-12 h-12 object-contain rounded-xl bg-slate-950 p-1 border border-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate">{product.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ราคาต่ำสุดตอนนี้: <span className="text-white font-bold font-mono">฿{Number(currentPrice).toLocaleString()}</span>
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {error}
                </div>
              )}

              {/* Target Price */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  ราคาเป้าหมายที่คุณต้องการซื้อ (฿ บาท)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-bold">
                    ฿
                  </span>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-700 focus:border-blue-500 rounded-xl py-2.5 pl-8 pr-3 text-sm text-white focus:outline-none"
                    placeholder="เช่น 15000"
                    required
                  />
                </div>
                {targetPrice < currentPrice && (
                  <span className="text-[11px] text-blue-400 mt-1 block">
                    ประหยัดได้ ฿{(currentPrice - targetPrice).toLocaleString()} จากราคาปัจจุบัน
                  </span>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  อีเมลสำหรับรับการแจ้งเตือน
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-700 focus:border-blue-500 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none"
                    placeholder="yourname@gmail.com"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
                >
                  {loading ? 'กำลังบันทึก...' : 'บันทึกการแจ้งเตือนราคา'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
