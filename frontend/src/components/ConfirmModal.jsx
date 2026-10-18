import React, { useEffect } from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'ยืนยันการทำรายการ',
  message = 'คุณแน่ใจว่าต้องการดำเนินการนี้ใช่หรือไม่?',
  confirmText = 'ยืนยันการลบ',
  cancelText = 'ยกเลิก',
  confirmVariant = 'danger', // 'danger' | 'primary'
  loading = false,
  icon: Icon = Trash2
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#0E061E]/95 border border-purple-500/35 rounded-3xl shadow-[0_0_50px_rgba(139,92,246,0.3)] backdrop-blur-xl p-6 sm:p-8 text-center animate-scale-up"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-purple-900/30 transition-colors"
          title="ปิด"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg ${
          confirmVariant === 'danger'
            ? 'bg-rose-500/15 border border-rose-500/35 text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.3)]'
            : 'bg-purple-500/15 border border-purple-500/35 text-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.3)]'
        }`}>
          <Icon className="w-7 h-7" />
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold font-display text-white mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto mb-6">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#1C0F3A] hover:bg-purple-900/40 border border-purple-500/30 text-slate-300 hover:text-white text-xs font-bold transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${
              confirmVariant === 'danger'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)]'
                : 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]'
            }`}
          >
            {loading ? 'กำลังดำเนินการ...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
