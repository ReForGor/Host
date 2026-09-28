import React, { useState, useEffect } from 'react'
import { Bookmark, Bell, Trash2, ToggleLeft, ToggleRight, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react'
import { alertApi } from '../api/client'
import { useLanguage } from '../i18n/LanguageContext'

export default function WatchlistPage({ user }) {
  const { t } = useLanguage()
  const [alerts, setAlerts] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('alerts') // 'alerts' or 'notifications'

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [alertsRes, notifsRes] = await Promise.all([
        alertApi.getAlerts(user?.email),
        alertApi.getNotifications()
      ])
      setAlerts(alertsRes.data)
      setNotifications(notifsRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAlert = async (id) => {
    if (!window.confirm('คุณต้องการยกเลิกการติดตามสินค้ารายการนี้ใช่หรือไม่?')) return
    try {
      await alertApi.deleteAlert(id)
      setAlerts(alerts.filter(a => a.id !== id))
    } catch (e) {
      alert('ไม่สามารถลบการแจ้งเตือนได้')
    }
  }

  const handleToggleAlert = async (id) => {
    try {
      const res = await alertApi.toggleAlert(id)
      setAlerts(alerts.map(a => a.id === id ? { ...a, is_active: res.data.is_active } : a))
    } catch (e) {
      alert('ไม่สามารถเปลี่ยนสถานะการแจ้งเตือนได้')
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await alertApi.markRead(id)
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
            <Bookmark className="w-8 h-8 mr-3 text-blue-500" />
            <span>รายการติดตามราคา & ศูนย์การแจ้งเตือน</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            จัดการสินค้ารอซื้อ และดูประวัติการลดราคาที่ระบบแจ้งเตือนมาถึงคุณ
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'alerts'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            รายการติดตาม ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'notifications'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            แจ้งเตือนราคาลด ({notifications.filter(n => !n.is_read).length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm">
          กำลังโหลดข้อมูลรายการติดตามของคุณ...
        </div>
      ) : activeTab === 'alerts' ? (
        /* Alerts Tab */
        alerts.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">ยังไม่มีสินค้าที่กำลังติดตามราคา</h3>
            <p className="text-sm text-slate-400">
              กดที่ไอคอนกระดิ่ง <Bell className="w-4 h-4 inline text-amber-400" /> ในการ์ดสินค้าหน้าแรก เพื่อตั้งราคาเป้าหมายที่คุณต้องการซื้อได้เลยครับ
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alerts.map((alert) => {
              const diff = (alert.current_lowest_price || 0) - alert.target_price
              const reached = diff <= 0
              return (
                <div
                  key={alert.id}
                  className={`bg-slate-900/80 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                    reached ? 'border-emerald-500/50 shadow-lg shadow-emerald-950/20' : 'border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        📧 {alert.email}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        alert.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {alert.is_active ? 'กำลังติดตาม' : 'หยุดชั่วคราว'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 mb-4">
                      {alert.product_image && (
                        <img
                          src={alert.product_image}
                          alt={alert.product_name}
                          className="w-16 h-16 object-contain rounded-xl bg-[#030712] p-1 border border-slate-800"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                          {alert.product_name}
                        </h4>
                        <div className="mt-1 text-xs">
                          ราคาตลาดตอนนี้: <span className="text-white font-bold font-mono">฿{Number(alert.current_lowest_price || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress to target */}
                    <div className="bg-[#030712] p-3 rounded-xl border border-slate-800 mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">เป้าหมายที่คุณตั้งไว้:</span>
                        <span className="text-blue-400 font-bold font-mono">฿{Number(alert.target_price).toLocaleString()}</span>
                      </div>
                      <div className="text-[11px]">
                        {reached ? (
                          <span className="text-emerald-400 font-bold flex items-center">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> ถึงราคาเป้าหมายแล้ว! สั่งซื้อได้เลย
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            อีกเพียง <strong className="text-amber-400">฿{Number(diff).toLocaleString()}</strong> จะถึงเป้าหมาย
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleAlert(alert.id)}
                      className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                    >
                      {alert.is_active ? (
                        <>
                          <ToggleRight className="w-5 h-5 text-emerald-400" />
                          <span>เปิดอยู่</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5 text-slate-600" />
                          <span>ปิดอยู่</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                      title="ลบการแจ้งเตือน"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        /* Notifications Tab */
        notifications.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800">
            <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">ยังไม่มีประวัติการแจ้งเตือนราคาลด</h3>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between ${
                  notif.is_read
                    ? 'bg-slate-900/50 border-slate-800/80 text-slate-400'
                    : 'bg-blue-950/20 border-blue-500/40 text-slate-200 shadow-md shadow-blue-950/10'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2 rounded-xl mt-0.5 ${notif.is_read ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 text-white'}`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-400">
                      <span>ร้าน: <strong className="text-blue-400">{notif.store_name}</strong></span>
                      <span>ราคาใหม่: <strong className="text-white font-mono font-bold">฿{Number(notif.new_price).toLocaleString()}</strong></span>
                      <span>{new Date(notif.created_at).toLocaleString('th-TH')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {notif.product_url && (
                    <a
                      href={notif.product_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1 shadow-md shadow-blue-600/30"
                    >
                      <span>ซื้อเลย</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    >
                      อ่านแล้ว
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
