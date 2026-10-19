import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Mail, User, Cpu, ArrowLeft, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react'
import { authApi } from '../api/client'
import { useLanguage } from '../i18n/LanguageContext'
import { Helmet } from 'react-helmet-async'

export default function LoginPage({ user, onLoginSuccess }) {
  const { t, lang } = useLanguage()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectPath = searchParams.get('redirect') || (user?.is_admin ? '/admin' : '/')

  const [isRegister, setIsRegister] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Login form state
  const [emailOrUser, setEmailOrUser] = useState('')
  const [password, setPassword] = useState('')

  // Register form state
  const [regEmail, setRegEmail] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regFullName, setRegFullName] = useState('')
  const [regPassword, setRegPassword] = useState('')

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // If already logged in, redirect away
  useEffect(() => {
    if (user) {
      navigate(redirectPath, { replace: true })
    }
  }, [user, navigate, redirectPath])

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
      if (onLoginSuccess) {
        onLoginSuccess(res.data.user)
      }
      navigate(res.data.user.is_admin ? (searchParams.get('redirect') || '/admin') : redirectPath, { replace: true })
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        (lang === 'en' ? 'Invalid username/email or password' : 'ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง')
      )
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
        email: regEmail.trim(),
        username: regUsername.trim(),
        password: regPassword,
        full_name: regFullName.trim() || regUsername.trim()
      })
      localStorage.setItem('techprice_token', res.data.access_token)
      if (onLoginSuccess) {
        onLoginSuccess(res.data.user)
      }
      navigate(redirectPath, { replace: true })
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        (lang === 'en' ? 'Registration failed. Please check your details.' : 'การลงทะเบียนไม่สำเร็จ กรุณาตรวจสอบข้อมูล')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>{isRegister ? 'Register - TechPrice' : 'Sign In - TechPrice'}</title>
        <meta name="description" content="Sign in or register to TechPrice hardware price comparison platform" />
      </Helmet>

      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative z-10">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md relative">
          {/* Back to home link */}
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-cyan-400 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>{lang === 'en' ? 'Back to Home' : 'กลับสู่หน้าหลัก'}</span>
          </Link>

          {/* Main Card */}
          <div className="bg-[#0c081e]/90 border border-purple-500/30 rounded-3xl p-7 sm:p-9 shadow-[0_0_50px_rgba(139,92,246,0.25)] backdrop-blur-2xl relative overflow-hidden">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />

            {/* Header Icon & Title */}
            <div className="text-center mb-7">
              <div className="w-14 h-14 bg-purple-500/15 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                <Cpu className="w-7 h-7 text-purple-400" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white mb-2">
                {isRegister 
                  ? (lang === 'en' ? 'Create an Account' : 'สมัครสมาชิกใหม่') 
                  : (lang === 'en' ? 'Welcome Back' : 'เข้าสู่ระบบ TechPrice')}
              </h1>
              <p className="text-xs text-slate-400">
                {isRegister
                  ? (lang === 'en' ? 'Track real hardware prices across top Thai retailers' : 'ติดตามราคาอุปกรณ์ไอทีจาก 4 ร้านชั้นนำแบบเรียลไทม์')
                  : (lang === 'en' ? 'Access your watchlist, alert notifications, and admin portal' : 'เข้าถึงรายการติดตาม การแจ้งเตือนราคา และระบบจัดการ')}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start space-x-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Forms */}
            {!isRegister ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {lang === 'en' ? 'Username or Email' : 'ชื่อผู้ใช้ หรือ อีเมล'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={emailOrUser}
                      onChange={(e) => setEmailOrUser(e.target.value)}
                      placeholder={lang === 'en' ? 'admin or username@example.com' : 'admin หรือ อีเมลของคุณ'}
                      className="w-full bg-[#160d33]/80 border border-purple-500/25 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {lang === 'en' ? 'Password' : 'รหัสผ่าน'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#160d33]/80 border border-purple-500/25 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{lang === 'en' ? 'Sign In' : 'เข้าสู่ระบบ'}</span>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {lang === 'en' ? 'Full Name' : 'ชื่อ-นามสกุล'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder={lang === 'en' ? 'John Doe' : 'สมชาย สายเกม'}
                      className="w-full bg-[#160d33]/80 border border-purple-500/25 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {lang === 'en' ? 'Username' : 'ชื่อผู้ใช้ (Username)'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="gamer123"
                      className="w-full bg-[#160d33]/80 border border-purple-500/25 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {lang === 'en' ? 'Email Address' : 'อีเมล'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full bg-[#160d33]/80 border border-purple-500/25 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {lang === 'en' ? 'Password' : 'รหัสผ่าน'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#160d33]/80 border border-purple-500/25 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.35)] transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{lang === 'en' ? 'Create Account' : 'ยืนยันสมัครสมาชิก'}</span>
                  )}
                </button>
              </form>
            )}

            {/* Switch between Login and Register */}
            <div className="mt-6 pt-5 border-t border-purple-500/15 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister)
                  setError(null)
                }}
                className="text-xs text-slate-400 hover:text-cyan-400 font-medium transition-colors"
              >
                {!isRegister ? (
                  <span>
                    {lang === 'en' ? "Don't have an account? " : 'ยังไม่มีบัญชีใช่หรือไม่? '}
                    <strong className="text-cyan-400 underline underline-offset-4">
                      {lang === 'en' ? 'Register here' : 'สมัครสมาชิกที่นี่'}
                    </strong>
                  </span>
                ) : (
                  <span>
                    {lang === 'en' ? 'Already have an account? ' : 'มีบัญชีอยู่แล้ว? '}
                    <strong className="text-purple-400 underline underline-offset-4">
                      {lang === 'en' ? 'Sign in' : 'เข้าสู่ระบบ'}
                    </strong>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
