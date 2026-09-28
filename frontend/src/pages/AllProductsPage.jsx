import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  RotateCcw, 
  Layers, 
  Check, 
  X, 
  ShoppingBag,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react'
import { productApi } from '../api/client'
import ProductCard from '../components/ProductCard'
import PriceChartModal from '../components/PriceChartModal'
import AlertModal from '../components/AlertModal'
import { useLanguage } from '../i18n/LanguageContext'

export default function AllProductsPage({ user, compareList, setCompareList }) {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter States initialized from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All')
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || 'All')
  const [selectedStore, setSelectedStore] = useState(searchParams.get('store') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'cheapest')
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '')

  // Modals
  const [activeChartProduct, setActiveChartProduct] = useState(null)
  const [activeAlertProduct, setActiveAlertProduct] = useState(null)

  // Mobile filter drawer state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // 9 Categories matching the user handwritten blueprint
  const categoryOptions = [
    { key: 'All', labelTh: 'ทั้งหมด', labelEn: 'All Categories' },
    { key: 'Graphics Cards (GPU)', labelTh: 'การ์ดจอ (GPU)', labelEn: 'Graphics Cards (GPU)' },
    { key: 'Processors (CPU)', labelTh: 'ซีพียู (CPU)', labelEn: 'Processors (CPU)' },
    { key: 'Memory (RAM)', labelTh: 'แรม (RAM)', labelEn: 'Memory (RAM)' },
    { key: 'Storage (SSD, HDD)', labelTh: 'ที่เก็บข้อมูล (SSD, HDD)', labelEn: 'Storage (SSD, HDD)' },
    { key: 'Monitors', labelTh: 'จอมอนิเตอร์', labelEn: 'Monitors' },
    { key: 'Motherboards', labelTh: 'เมนบอร์ด (Mainboard)', labelEn: 'Motherboards' },
    { key: 'Power Supplies (PSU)', labelTh: 'พาวเวอร์ซัพพลาย (PSU)', labelEn: 'Power Supplies (PSU)' },
    { key: 'Case & Cooling', labelTh: 'เคส & ระบายความร้อน', labelEn: 'Case & Cooling' },
    { key: 'Accessories', labelTh: 'อุปกรณ์เสริม', labelEn: 'Accessories' },
  ]

  const storeOptions = [
    { slug: '', label: t.filters.allStores },
    { slug: 'jib', label: 'JIB Computer' },
    { slug: 'advice', label: 'Advice IT Infinite' },
    { slug: 'banana', label: 'BaNANA IT' },
    { slug: 'ihavecpu', label: 'iHaveCPU' },
  ]

  useEffect(() => {
    loadMetadata()
  }, [])

  useEffect(() => {
    // Sync URL with filters
    const cat = searchParams.get('category')
    if (cat && cat !== selectedCategory) {
      setSelectedCategory(cat)
    }
  }, [searchParams])

  useEffect(() => {
    loadProducts()
  }, [selectedCategory, selectedBrand, selectedStore, sortBy, minPrice, maxPrice])

  const loadMetadata = async () => {
    try {
      const [catsRes, brandsRes] = await Promise.all([
        productApi.getCategories(),
        productApi.getBrands()
      ])
      setCategories(catsRes.data)
      setBrands(brandsRes.data)
    } catch (e) {
      console.error(e)
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      const params = {
        sort_by: sortBy,
        limit: 100
      }
      if (searchQuery.trim()) params.q = searchQuery.trim()
      if (selectedCategory !== 'All') params.category = selectedCategory
      if (selectedBrand !== 'All') params.brand = selectedBrand
      if (selectedStore) params.store_slug = selectedStore
      if (minPrice) params.min_price = parseFloat(minPrice)
      if (maxPrice) params.max_price = parseFloat(maxPrice)

      const res = await productApi.getProducts(params)
      setProducts(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadProducts()
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All')
    setSelectedBrand('All')
    setSelectedStore('')
    setSortBy('cheapest')
    setMinPrice('')
    setMaxPrice('')
    setSearchParams({})
  }

  const handleToggleCompare = (product) => {
    const exists = compareList.find(p => p.id === product.id)
    if (exists) {
      setCompareList(compareList.filter(p => p.id !== product.id))
    } else {
      if (compareList.length >= 4) {
        alert(t.compare.maxItemsNotice)
        return
      }
      setCompareList([...compareList, product])
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Page Title & Breadcrumb */}
      <div className="pb-6 mb-6 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-2">
          <span>{t.nav.home}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-blue-400 font-semibold">{t.nav.allProducts}</span>
          {selectedCategory !== 'All' && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white font-medium">{selectedCategory}</span>
            </>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center">
              <ShoppingBag className="w-7 h-7 mr-3 text-blue-500" />
              <span>{t.nav.allProducts} ({t.filters.foundProducts}: {products.length} {t.filters.items})</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {t.categories.subtitle}
            </p>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md"
          >
            <Filter className="w-4 h-4" />
            <span>{t.filters.filterTitle}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout (Wireframe on PDF Page 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Sidebar Filter (Column 1) */}
        <div className={`lg:block ${isMobileFilterOpen ? 'block' : 'hidden'} space-y-6 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 sticky top-20 shadow-xl`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {t.filters.filterTitle}
              </h3>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-slate-400 hover:text-rose-400 flex items-center transition-colors"
              title={t.filters.resetFilters}
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              <span>รีเซ็ต</span>
            </button>
          </div>

          {/* Search in Catalog */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">ค้นหาชื่อรุ่น</label>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="RTX 5090, i9, 32GB..."
                className="w-full bg-[#030712] border border-slate-700 rounded-xl px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </form>
          </div>

          {/* Category Filter Checklist (PDF 9 categories) */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">{t.filters.category}</label>
            <div className="space-y-1 max-h-52 overflow-y-auto pr-1 text-xs">
              {categoryOptions.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between ${
                    selectedCategory === cat.key
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{cat.labelTh}</span>
                  {selectedCategory === cat.key && <Check className="w-3.5 h-3.5 ml-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* Store Filter Checklist */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">{t.filters.store}</label>
            <div className="space-y-1 text-xs">
              {storeOptions.map((st) => (
                <button
                  key={st.slug}
                  onClick={() => setSelectedStore(st.slug)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between ${
                    selectedStore === st.slug
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{st.label}</span>
                  {selectedStore === st.slug && <Check className="w-3.5 h-3.5 ml-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter Checklist */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">{t.filters.brand}</label>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1 text-xs">
              <button
                onClick={() => setSelectedBrand('All')}
                className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                  selectedBrand === 'All' ? 'bg-blue-900/40 text-blue-300 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{t.filters.allBrands}</span>
                {selectedBrand === 'All' && <Check className="w-3 h-3" />}
              </button>
              {brands.map((b) => (
                <button
                  key={b.brand}
                  onClick={() => setSelectedBrand(b.brand)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                    selectedBrand === b.brand ? 'bg-blue-900/40 text-blue-300 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{b.brand}</span>
                  <span className="text-[10px] opacity-60">({b.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">{t.filters.priceRange}</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="ต่ำสุด"
                className="bg-[#030712] border border-slate-700 rounded-xl px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="สูงสุด"
                className="bg-[#030712] border border-slate-700 rounded-xl px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right Main Content Area (Column 2-4) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header Bar with Active Filter Badges & Sort Selector */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            {/* Active Filters Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30">
                  หมวดหมู่: {selectedCategory}
                  <button onClick={() => setSelectedCategory('All')} className="ml-1.5 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedBrand !== 'All' && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30">
                  แบรนด์: {selectedBrand}
                  <button onClick={() => setSelectedBrand('All')} className="ml-1.5 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedStore && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30">
                  ร้านค้า: {selectedStore.toUpperCase()}
                  <button onClick={() => setSelectedStore('')} className="ml-1.5 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30">
                  คำค้น: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-1.5 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2 bg-[#030712] px-3 py-1.5 rounded-xl border border-slate-800 text-xs ml-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400">{t.filters.sortBy}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-blue-400 font-bold focus:outline-none cursor-pointer"
              >
                <option value="cheapest" className="bg-slate-900 text-white">{t.filters.sortCheapest}</option>
                <option value="expensive" className="bg-slate-900 text-white">{t.filters.sortExpensive}</option>
                <option value="discount" className="bg-slate-900 text-white">{t.filters.sortDiscount}</option>
                <option value="name" className="bg-slate-900 text-white">{t.filters.sortName}</option>
                <option value="newest" className="bg-slate-900 text-white">{t.filters.sortNewest}</option>
              </select>
            </div>
          </div>

          {/* Floating Compare Tray if selected */}
          {compareList.length > 0 && (
            <div className="sticky top-20 z-30 bg-blue-950/90 border border-blue-500/40 backdrop-blur-md rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-blue-300 uppercase">
                  {t.compare.floatingTray.replace('{count}', compareList.length)}
                </span>
                <div className="flex items-center space-x-1.5 overflow-x-auto max-w-md">
                  {compareList.map(p => (
                    <div key={p.id} className="flex items-center bg-slate-900 px-2 py-1 rounded-lg border border-blue-700 text-xs text-white">
                      <span className="max-w-[100px] truncate mr-1">{p.name}</span>
                      <button onClick={() => handleToggleCompare(p)} className="text-slate-400 hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={`/compare?ids=${compareList.map(p => p.id).join(',')}`}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all whitespace-nowrap"
                >
                  {t.compare.openCompareBtn}
                </a>
                <button
                  onClick={() => setCompareList([])}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1"
                >
                  {t.compare.clearBtn}
                </button>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-slate-900/50 rounded-2xl animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800">
              <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">ไม่พบสินค้าที่ตรงกับเงื่อนไข</h3>
              <p className="text-sm text-slate-400 mb-4">ลองปรับตัวกรอง หรือล้างตัวกรองทั้งหมดดูครับ</p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenChart={(p) => setActiveChartProduct(p)}
                  onOpenAlert={(p) => setActiveAlertProduct(p)}
                  onToggleCompare={handleToggleCompare}
                  isSelectedForCompare={compareList.some(p => p.id === product.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart Modal */}
      {activeChartProduct && (
        <PriceChartModal
          product={activeChartProduct}
          onClose={() => setActiveChartProduct(null)}
          onSetAlert={(p) => {
            setActiveChartProduct(null)
            setActiveAlertProduct(p)
          }}
        />
      )}

      {/* Alert Modal */}
      {activeAlertProduct && (
        <AlertModal
          product={activeAlertProduct}
          user={user}
          onClose={() => setActiveAlertProduct(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  )
}
