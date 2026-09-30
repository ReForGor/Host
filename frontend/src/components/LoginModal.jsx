import React, { useState } from 'react'
import { X, Lock, Mail, User, ShieldCheck, Zap, Cpu } from 'lucide-react'
import { authApi } from '../api/client'
import { useLanguage } from '../i18n/LanguageContext'

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { t } = useLanguage()
  const [isRegister, setIsRegister] = useState(false)
  const [emailOrUser, setEmailOrUser] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await authApi.login({
        email_or_username: emailOrUser.trim(),
        password: password
      })
      localStorage.setItem('techprice_token', res.data.access_token)
      onLoginSuccess(res.data.user)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await authApi.register({
        email: email.trim(),
        username: username.trim(),
        password: password,
        full_name: fullName.trim() || username.trim()
      })
      localStorage.setItem('techprice_token', res.data.access_token)
      onLoginSuccess(res.data.user)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'ไม่สามารถลงทะเบียนได้')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (demoEmail, demoPass) => {
    setIsRegister(false)
    setEmailOrUser(demoEmail)
    setPassword(demoPass)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0E061E]/95 border border-purple-500/35 rounded-3xl shadow-[0_0_50px_rgba(139,92,246,0.3)] backdrop-blur-xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-purple-900/30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/40 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(139,92,246,0.35)]">
            <Cpu className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex items-center justify-center space-x-1.5 text-2xl font-black font-cyber mb-1">
            <span className="text-cyan-400">IT</span>
            <span className="text-white">PRICE</span>
          </div>
          <p className="text-xs text-slate-400">
            {isRegister ? 'สร้างบัญชีเพื่อติดตามราคาและรับการแจ้งเตือน' : 'เข้าถึงข้อมูลราคาและรายการติดตามส่วนตัวของคุณ'}
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {isRegister ? (
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">ชื่อผู้ใช้ (Username)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#070312] border border-purple-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">อีเมล (Email)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#070312] border border-purple-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">ชื่อ-นามสกุล (ไม่บังคับ)</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#070312] border border-purple-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">รหัสผ่าน (Password)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#070312] border border-purple-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all"
            >
              {loading ? 'กำลังลงทะเบียน...' : 'สมัครสมาชิกทันที'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">อีเมล หรือ ชื่อผู้ใช้</label>
              <input
                type="text"
                value={emailOrUser}
                onChange={(e) => setEmailOrUser(e.target.value)}
                placeholder="admin@techprice.com หรือ gamer@demo.com"
                className="w-full bg-[#070312] border border-purple-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#070312] border border-purple-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        )}

        {/* Demo Fast Login Buttons */}
        <div className="mt-6 pt-5 border-t border-purple-500/25 text-xs">
          <p className="text-slate-400 mb-2 font-medium">กดปุ่มเพื่อทดสอบระบบทันที (Demo Accounts):</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@techprice.com', 'admin123')}
              className="p-2 rounded-xl bg-[#160B2E] hover:bg-[#231248] text-amber-300 font-semibold border border-amber-500/30 text-center transition-all shadow-[0_0_10px_rgba(245,158,11,0.15)] flex items-center justify-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>บัญชี Admin</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('gamer@demo.com', 'demo1234')}
              className="p-2 rounded-xl bg-[#160B2E] hover:bg-[#231248] text-purple-300 font-semibold border border-purple-500/30 text-center transition-all shadow-[0_0_10px_rgba(139,92,246,0.15)] flex items-center justify-center space-x-1.5"
            >
              <User className="w-4 h-4 text-purple-400" />
              <span>บัญชี User ทั่วไป</span>
            </button>
          </div>
        </div>

        {/* Switch Login / Register */}
        <div className="mt-4 text-center text-xs text-slate-400">
          {isRegister ? (
            <span>
              มีบัญชีอยู่แล้ว?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-purple-400 hover:text-purple-300 hover:underline font-bold"
              >
                เข้าสู่ระบบที่นี่
              </button>
            </span>
          ) : (
            <span>
              ยังไม่มีบัญชี?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-purple-400 hover:text-purple-300 hover:underline font-bold"
              >
                สมัครสมาชิกฟรี
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
