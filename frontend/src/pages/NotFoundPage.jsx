import React from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import { Helmet } from 'react-helmet-async'

export default function NotFoundPage() {
  const { lang } = useLanguage()
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-32 text-center animate-fade-in flex flex-col items-center justify-center min-h-[60vh]">
      <Helmet>
        <title>{lang === 'en' ? '404 Page Not Found | IT PRICE' : '404 ไม่พบหน้าเว็บ | IT PRICE'}</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 mb-4 drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
        404
      </h1>
      <h2 className="text-2xl font-bold text-white mb-6">
        {lang === 'en' ? 'Page Not Found' : 'ไม่พบหน้าที่คุณต้องการ'}
      </h2>
      <p className="text-slate-400 max-w-md mb-8">
        {lang === 'en' 
          ? "The page you are looking for doesn't exist or has been moved." 
          : 'หน้าที่คุณกำลังค้นหาไม่มีอยู่จริง หรือถูกลบออกไปแล้ว'}
      </p>
      <Link 
        to="/"
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all flex items-center gap-2"
      >
        <Home className="w-5 h-5" />
        {lang === 'en' ? 'Back to Home' : 'กลับสู่หน้าแรก'}
      </Link>
    </div>
  )
}
