import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { 
  BarChart2, 
  Plus, 
  X, 
  ExternalLink, 
  Check, 
  Trophy, 
  ShieldAlert, 
  ArrowLeft,
  Sparkles,
  Zap,
  TrendingDown
} from 'lucide-react'
import { compareApi, productApi } from '../api/client'
import { useLanguage } from '../i18n/LanguageContext'

export default function ComparePage({ compareList, setCompareList }) {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const idsParam = searchParams.get('ids')

  const [compareData, setCompareData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [allProducts, setAllProducts] = useState([])
  const [showAddDropdown, setShowAddDropdown] = useState(false)

  useEffect(() => {
    productApi.getProducts({ limit: 100 }).then(res => {
      setAllProducts(res.data)
      if (!idsParam && compareList.length === 0 && res.data.length >= 2) {
        fetchComparison([res.data[0].id, res.data[1].id])
      }
    }).catch(console.error)
  }, [])

  useEffect(() => {
    let ids = []
    if (idsParam) {
      ids = idsParam.split(',').filter(x => x.trim().length > 0)
    } else if (compareList.length > 0) {
      ids = compareList.map(p => p.id)
    }

    if (ids.length > 0) {
      fetchComparison(ids)
    }
  }, [idsParam, compareList])


  const fetchComparison = async (ids) => {
    setLoading(true)
    try {
      const res = await compareApi.compareProducts(ids)
      setCompareData(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveProduct = (productId) => {
    if (!compareData) return
    const updated = compareData.products.filter(p => p.id !== productId).map(p => p.id)
    if (updated.length > 0) {
      setSearchParams({ ids: updated.join(',') })
    } else {
      setSearchParams({})
      setCompareData(null)
    }
  }

  const handleAddProduct = (productId) => {
    setShowAddDropdown(false)
    if (!compareData) {
      setSearchParams({ ids: String(productId) })
      return
    }
    const current = compareData.products.map(p => p.id)
    if (current.includes(productId)) return
    if (current.length >= 4) {
      alert(t.compare.maxItemsNotice)
      return
    }
    const updated = [...current, productId]
    setSearchParams({ ids: updated.join(',') })
  }

  // Helper to determine winning spec value in a row for highlight feature
  const isWinningSpecValue = (rowKey, value, allValues) => {
    if (!value || value === '—') return false
    const valStr = String(value).toLowerCase()

    // 1. Memory / VRAM: Higher number is better
    if (rowKey.includes('vram') || rowKey.includes('capacity') || rowKey.includes('memory') || rowKey.includes('แรม')) {
      const numbers = allValues.map(v => {
        const m = String(v).match(/(\d+)\s*(gb|mb|tb)/i)
        return m ? parseInt(m[1], 10) : 0
      })
      const maxNum = Math.max(...numbers)
      const currentMatch = valStr.match(/(\d+)\s*(gb|mb|tb)/i)
      if (currentMatch && parseInt(currentMatch[1], 10) === maxNum && maxNum > 0) {
        return true
      }
    }

    // 2. Cores: More is better
    if (rowKey.includes('core') || rowKey.includes('คอร์')) {
      const numbers = allValues.map(v => {
        const m = String(v).match(/(\d+)/)
        return m ? parseInt(m[1], 10) : 0
      })
      const maxNum = Math.max(...numbers)
      const currentMatch = valStr.match(/(\d+)/)
      if (currentMatch && parseInt(currentMatch[1], 10) === maxNum && maxNum > 0) {
        return true
      }
    }

    // 3. Clock speed / Frequency: Higher is better
    if (rowKey.includes('clock') || rowKey.includes('frequency') || rowKey.includes('mhz') || rowKey.includes('ghz')) {
      const numbers = allValues.map(v => {
        const m = String(v).match(/([\d\.]+)\s*(ghz|mhz)/i)
        return m ? parseFloat(m[1]) : 0
      })
      const maxNum = Math.max(...numbers)
      const currentMatch = valStr.match(/([\d\.]+)\s*(ghz|mhz)/i)
      if (currentMatch && parseFloat(currentMatch[1]) === maxNum && maxNum > 0) {
        return true
      }
    }

    return false
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4 mb-8">
        <div>
          <Link to="/products" className="inline-flex items-center text-xs font-semibold text-blue-400 hover:text-blue-300 mb-2">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> {t.compare.backToProducts}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
            <BarChart2 className="w-7 h-7 mr-3 text-blue-500" />
            <span>{t.compare.pageTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t.compare.pageSubtitle}
          </p>
        </div>

        {/* Add Product Button */}
        <div className="relative">
          <button
            onClick={() => setShowAddDropdown(!showAddDropdown)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.compare.addProduct}</span>
          </button>

          {showAddDropdown && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl z-50 p-2 divide-y divide-slate-800">
              <div className="p-2 text-xs font-bold text-slate-400">{t.compare.selectToAdd}</div>
              {allProducts.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleAddProduct(p.id)}
                  className="p-2.5 hover:bg-slate-800/80 rounded-xl cursor-pointer flex items-center space-x-3 transition-colors"
                >
                  <img src={p.image_url} alt={p.name} className="w-8 h-8 object-contain rounded bg-[#030712] p-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                    <p className="text-[11px] text-blue-400 font-bold">฿{Number(p.lowest_price).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24 text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>กำลังประมวลผลตารางเปรียบเทียบสเปกและราคา...</span>
        </div>
      ) : !compareData || compareData.products.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 mt-8">
          <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">{t.compare.noProductsSelected}</h3>
          <p className="text-sm text-slate-400 mb-6">{t.compare.noProductsDesc}</p>
          <Link
            to="/products"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm"
          >
            {t.compare.browseAllBtn}
          </Link>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto bg-[#030712]/50 border border-slate-800 rounded-3xl p-4 shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[700px]">
            {/* Product Header Cards */}
            <thead>
              <tr>
                <th className="p-4 w-1/5 bg-[#030712] border border-slate-800 text-xs font-bold uppercase text-slate-400 rounded-tl-2xl">
                  {t.compare.comparedProducts}
                </th>
                {compareData.products.map(p => {
                  const isWinner = p.id === compareData.price_winner_id
                  return (
                    <th 
                      key={p.id} 
                      className={`p-5 w-1/4 border border-slate-800 align-top relative ${
                        isWinner ? 'bg-blue-950/20' : 'bg-slate-900/60'
                      }`}
                    >
                      <button
                        onClick={() => handleRemoveProduct(p.id)}
                        className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="นำออก"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Highlight Winner: Specifically requested on PDF Page 1: "ไฮไลต์จุดที่ดีกว่า" */}
                      {isWinner && (
                        <div className="inline-flex items-center space-x-1 px-2.5 py-1 mb-2 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                          <Trophy className="w-3.5 h-3.5" />
                          <span>{t.compare.bestValueBadge}</span>
                        </div>
                      )}

                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="h-28 mx-auto object-contain mb-3 bg-[#030712] p-2 rounded-xl"
                      />
                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight mb-2">
                        {p.name}
                      </h4>
                      <div className="text-lg font-extrabold text-white mb-1">
                        ฿{Number(p.lowest_price).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400 mb-3">
                        ร้านค้า: <span className="text-blue-400 font-semibold">{p.best_store}</span>
                      </div>
                      
                      {/* Direct Buy Link */}
                      <a
                        href={p.platforms?.[0]?.product_url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full text-center py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all"
                      >
                        {t.compare.buyAt} {p.best_store} <ExternalLink className="w-3 h-3 inline-block ml-1" />
                      </a>
                    </th>
                  )
                })}
              </tr>
            </thead>

            {/* Spec Rows */}
            <tbody className="divide-y divide-slate-800 text-sm">
              {compareData.spec_matrix.map((row, idx) => {
                const rowValues = compareData.products.map(p => row.values[p.id])
                return (
                  <tr key={row.spec_key} className={idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-[#030712]/40'}>
                    <td className="p-3.5 px-4 font-bold text-slate-300 border border-slate-800/80 bg-[#030712]/80 text-xs">
                      {row.spec_label}
                    </td>
                    {compareData.products.map(p => {
                      const val = row.values[p.id] || '—'
                      const isWinning = isWinningSpecValue(row.spec_key, val, rowValues)
                      return (
                        <td 
                          key={p.id} 
                          className={`p-3.5 px-4 text-xs border border-slate-800/80 ${
                            isWinning ? 'bg-blue-600/10 text-blue-300 font-bold' : 'text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{val}</span>
                            {isWinning && (
                              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                ⭐ เหนือกว่า
                              </span>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
