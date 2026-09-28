import React, { useState, useEffect } from 'react'
import { Server, RefreshCw, CheckCircle2, Play, Activity, ShieldCheck, Zap } from 'lucide-react'
import { scraperApi } from '../api/client'
import { useLanguage } from '../i18n/LanguageContext'

export default function PlatformsPage() {
  const { t } = useLanguage()
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [lastJob, setLastJob] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statusRes, jobRes] = await Promise.all([
        scraperApi.getStatuses(),
        scraperApi.getLastJob()
      ])
      setPlatforms(statusRes.data)
      setLastJob(jobRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleRunSync = async (platformSlug = null) => {
    setSyncing(true)
    try {
      const res = await scraperApi.runScraper({
        platform_slug: platformSlug,
        simulate_live: false
      })
      setLastJob(res.data)
      await loadData()
      alert(`ดึงข้อมูลเสร็จสิ้น! อัปเดตราคาแล้ว ${res.data.prices_updated} รายการ แจ้งเตือน ${res.data.triggered_alerts} ครั้ง`)
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + (e.response?.data?.detail || e.message))
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
            <Server className="w-8 h-8 mr-3 text-blue-500" />
            <span>สถานะระบบดึงราคา & ร้านค้าไอที (Retailer Platforms)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ตรวจสอบความพร้อมของระบบเชื่อมต่อ และสั่งดึงข้อมูลราคาสดจาก 4 ร้านค้าใหญ่ทันที
          </p>
        </div>

        <button
          onClick={() => handleRunSync(null)}
          disabled={syncing}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'กำลังดึงราคาทุกร้าน...' : 'ดึงราคาสดทุกร้านเดี๋ยวนี้'}</span>
        </button>
      </div>

      {/* Last Scrape Run Summary */}
      {lastJob && lastJob.status && (
        <div className="mb-8 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400">งานรอบล่าสุด:</span>
            <span className="text-white font-semibold">
              {lastJob.timestamp ? new Date(lastJob.timestamp).toLocaleString('th-TH') : 'เสร็จสมบูรณ์'}
            </span>
          </div>
          <div className="flex items-center space-x-6 text-slate-400">
            <span>ตรวจค้น: <strong className="text-white">{lastJob.products_scraped || 0}</strong> ชิ้น</span>
            <span>อัปเดตราคา: <strong className="text-blue-400">{lastJob.prices_updated || 0}</strong> จุด</span>
            <span>ส่งแจ้งเตือน: <strong className="text-amber-400">{lastJob.triggered_alerts || 0}</strong> ครั้ง</span>
            <span>สถานะ: <strong className="text-emerald-400">{lastJob.status}</strong></span>
          </div>
        </div>
      )}

      {/* Platform Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-900/60 rounded-2xl animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {platforms.map((p) => (
            <div
              key={p.slug}
              className="bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-6 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {p.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{p.name}</h3>
                <p className="text-xs text-slate-400 truncate mb-4">{p.base_url}</p>

                <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">วิธีดึงข้อมูล:</span>
                    <span className="text-slate-200 font-mono">{p.mode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Response Time:</span>
                    <span className="text-white font-mono">{p.response_time_ms}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ตรวจสอบล่าสุด:</span>
                    <span className="text-slate-300">
                      {p.last_scraped ? new Date(p.last_scraped).toLocaleTimeString('th-TH') : 'เพิ่งตรวจสอบ'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800">
                <button
                  onClick={() => handleRunSync(p.slug)}
                  disabled={syncing}
                  className="w-full py-2 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1"
                >
                  <Play className="w-3.5 h-3.5 mr-1" />
                  <span>ดึงราคาเฉพาะร้านนี้</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
