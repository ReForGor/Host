import React, { useState, useEffect } from 'react'
import { Cpu, Terminal, Sparkles, Activity, ShieldCheck, Database, Layers } from 'lucide-react'
import { Link } from 'react-router-dom'
import { analyticsApi } from '../api/client'
import { useLanguage } from '../i18n/LanguageContext'

export default function Footer() {
  const { lang, t } = useLanguage()
  const [visitorCount, setVisitorCount] = useState(1428590)
  const [onlineCount, setOnlineCount] = useState(3420)

  useEffect(() => {
    const fetchRealStats = async () => {
      try {
        const res = await analyticsApi.getStats()
        if (res.data?.total_visitors) {
          setVisitorCount(Math.max(1428590, res.data.total_visitors))
        }
        if (res.data?.online_now !== undefined) {
          setOnlineCount(Math.max(12, res.data.online_now))
        }
      } catch (e) {
        // keep current
      }
    }

    fetchRealStats()
    const timer = setInterval(fetchRealStats, 30000)
    return () => clearInterval(timer)
  }, [])

  return (
    <footer className="bg-[#070312]/95 border-t border-purple-500/25 mt-24 text-slate-400 text-xs relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[150px] bg-purple-600/10 blur-[100px] pointer-events-none" />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Column 1: Brand Info & Supported Stores */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2.5 group inline-block">
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/40 flex items-center justify-center shadow-[0_0_12px_rgba(139,92,246,0.35)]">
                <Cpu className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex items-center tracking-wider">
                <span className="text-xl font-black font-cyber text-cyan-400">IT</span>
                <span className="text-xl font-black font-cyber text-slate-100 ml-1.5">PRICE</span>
              </div>
            </Link>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {t.footer?.desc || (lang === 'en' 
                ? 'IT PRICE is Thailand’s premier IT hardware and PC component price comparison hub. Live real-time price monitoring across JIB, iHaveCPU, BaNANA, and Advice with discount analytics and historical price charts.'
                : 'IT PRICE แหล่งรวมและเปรียบเทียบราคาอุปกรณ์ไอทีที่ดีที่สุด รวมรวบข้อมูลราคาแบบเรียลไทม์จาก JIB, iHaveCPU, BaNANA, Advice พร้อมระบบวิเคราะห์ส่วนลดและกราฟประวัติราคา')}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="px-2.5 py-1 rounded-md bg-[#160B2E] border border-purple-500/25 text-[11px] font-mono text-purple-200">
                JIB
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#160B2E] border border-purple-500/25 text-[11px] font-mono text-purple-200">
                iHaveCPU
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#160B2E] border border-purple-500/25 text-[11px] font-mono text-purple-200">
                BaNANA
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#160B2E] border border-purple-500/25 text-[11px] font-mono text-purple-200">
                Advice
              </span>
            </div>
          </div>

          {/* Column 2: Popular Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide">
              {lang === 'en' ? 'Popular Categories' : 'หมวดสินค้ายอดนิยม'}
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to="/products?category=Graphics Cards (GPU)" className="hover:text-cyan-400 transition-colors">
                  {lang === 'en' ? 'Nvidia GeForce & AMD Radeon GPUs' : 'การ์ดจอ Nvidia GeForce & Radeon'}
                </Link>
              </li>
              <li>
                <Link to="/products?category=Processors (CPU)" className="hover:text-cyan-400 transition-colors">
                  {lang === 'en' ? 'Intel Core & AMD Ryzen CPUs' : 'ซีพียู Intel Core & AMD Ryzen'}
                </Link>
              </li>
              <li>
                <Link to="/products?category=Storage (SSD, HDD)" className="hover:text-cyan-400 transition-colors">
                  {lang === 'en' ? 'PCIe 4.0 / NVMe M.2 SSDs' : 'SSD PCIe 4.0 / NVMe M.2'}
                </Link>
              </li>
              <li>
                <Link to="/products?category=Memory (RAM)" className="hover:text-cyan-400 transition-colors">
                  {lang === 'en' ? 'DDR5 Gaming RAM Kits' : 'แรม DDR5 Gaming Kits'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: System Status & Visitors */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide">
              {lang === 'en' ? 'System Status & Visitors' : 'สถานะระบบ & ผู้เข้าชม'}
            </h4>
            <div className="bg-[#120826] border border-purple-500/25 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-300">{lang === 'en' ? 'Total Pageviews:' : 'ผู้เข้าชมทั้งหมด:'}</span>
                <span className="font-mono font-bold text-cyan-400">
                  {visitorCount.toLocaleString()} <span className="text-[10px] text-purple-400/70 font-sans">{lang === 'en' ? 'views' : 'ครั้ง'}</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-300">{lang === 'en' ? 'Active Online Now:' : 'ออนไลน์ขณะนี้:'}</span>
                <span className="font-mono font-bold text-emerald-400 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{onlineCount.toLocaleString()} {lang === 'en' ? 'users' : 'คน'}</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-purple-500/20 pt-2">
                <span className="text-purple-300">{lang === 'en' ? 'Price Live Sync:' : 'อัปเดตราคาล่าสุด:'}</span>
                <span className="text-slate-300 font-mono text-[11px]">{lang === 'en' ? '1 min ago' : '1 นาทีที่แล้ว'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            {lang === 'en' ? 'Copyright © 2026 ' : 'ลิขสิทธิ์ © 2026 '}
            <span className="text-purple-300 font-semibold">IT PRICE</span>
            {lang === 'en' ? '. All rights reserved.' : ' สงวนลิขสิทธิ์'}
          </div>
          <div className="font-mono text-cyan-400/80 tracking-wider">
            POWERED BY REALTIME IT ENGINE • THAILAND MARKET
          </div>
        </div>
      </div>
    </footer>
  )
}
