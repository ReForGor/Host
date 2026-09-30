import React, { useState, useEffect } from 'react'
import { Zap, Shield, Cpu, Users, Eye, Sparkles, ExternalLink, Activity } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import { analyticsApi } from '../api/client'

export default function Footer() {
  const { t } = useLanguage()
  const [visitorCount, setVisitorCount] = useState(158421)
  const [onlineCount, setOnlineCount] = useState(1)

  useEffect(() => {
    const fetchRealStats = async () => {
      try {
        const res = await analyticsApi.getStats()
        if (res.data?.total_visitors) {
          setVisitorCount(res.data.total_visitors)
        }
        if (res.data?.online_now !== undefined) {
          setOnlineCount(res.data.online_now)
        }
      } catch (e) {
        // keep current
      }
    }

    fetchRealStats()
    const timer = setInterval(fetchRealStats, 20000)
    return () => clearInterval(timer)
  }, [])


  return (
    <footer className="bg-[#030712] border-t border-slate-800/80 mt-20 text-slate-400 text-sm">
      {/* Visitor Counter Trust Bar (Directly requested on PDF page 1: "จำนวนผู้เข้าชม (แสดงความน่าเชื่อถือ)") */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-blue-950/40 border-b border-slate-800/80 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">
                {t.footer.visitorCountLabel}
              </span>
              <span className="text-lg font-extrabold text-white tracking-wider font-mono">
                {visitorCount.toLocaleString()} <span className="text-xs font-normal text-blue-400">ครั้ง</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs">
            <div className="flex items-center space-x-2 bg-slate-950/80 px-3.5 py-1.5 rounded-full border border-slate-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-400">{t.footer.onlineNowLabel}</span>
              <span className="font-bold text-emerald-400 font-mono">{onlineCount}</span>
            </div>
            <div className="hidden md:flex items-center space-x-1.5 text-blue-300">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>{t.footer.guaranteePrice}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xl font-extrabold text-white tracking-tight">IT</span>
                <span className="text-xl font-extrabold text-blue-500">PRICE</span>
              </div>
            </div>
            <p className="text-slate-400 max-w-md text-sm leading-relaxed mb-4">
              {t.footer.desc}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                <Shield className="w-3.5 h-3.5 mr-1 text-blue-400" /> 100% Verified Prices
              </span>
              <span className="flex items-center bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                <Cpu className="w-3.5 h-3.5 mr-1 text-emerald-400" /> 26+ High-End Specs
              </span>
              <span className="flex items-center bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                <Activity className="w-3.5 h-3.5 mr-1 text-amber-400" /> Hourly Auto Scraper
              </span>
            </div>
          </div>

          {/* Quick Links: Supported Stores */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase text-blue-400">
              {t.footer.supportedStores}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://www.jib.co.th" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors flex items-center">
                  <span>JIB Computer Group</span>
                  <ExternalLink className="w-3 h-3 ml-1.5 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://www.advice.co.th" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors flex items-center">
                  <span>Advice IT Infinite</span>
                  <ExternalLink className="w-3 h-3 ml-1.5 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://www.bnn.in.th" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors flex items-center">
                  <span>BaNANA IT</span>
                  <ExternalLink className="w-3 h-3 ml-1.5 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://www.ihavecpu.com" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors flex items-center">
                  <span>iHaveCPU Thailand</span>
                  <ExternalLink className="w-3 h-3 ml-1.5 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase text-blue-400">
              {t.footer.systemArch}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              • <strong className="text-slate-300">Backend:</strong> FastAPI (Python 3.11+) REST API<br />
              • <strong className="text-slate-300">Database:</strong> Neon PostgreSQL Cloud (Singapore)<br />
              • <strong className="text-slate-300">Frontend:</strong> React + Vite + Tailwind CSS<br />
              • <strong className="text-slate-300">Scraper:</strong> Async HTTPX + BeautifulSoup4
            </p>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>{t.footer.copyright}</p>
          <p className="mt-2 sm:mt-0">
            {t.footer.builtFor}
          </p>
        </div>
      </div>
    </footer>
  )
}
