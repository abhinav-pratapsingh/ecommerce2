import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import ProductGrid from '../../components/common/ProductGrid'
import Pagination from '../../components/common/Pagination'
import { useProducts } from '../../context/ProductContext'

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price',      label: 'Price: Low -> High' },
  { value: '-price',     label: 'Price: High -> Low' },
  { value: '-ratings',   label: 'Top Rated' },
]

const Products = () => {
  const [params, setParams] = useSearchParams()
  const { products, categories, meta, loading, fetchProducts, fetchCategories } = useProducts()
  const [filterOpen, setFilterOpen] = useState(false)

  const query    = params.get('q')        || ''
  const category = params.get('category') || ''
  const sort     = params.get('sort')     || '-createdAt'
  const page     = parseInt(params.get('page') || '1', 10)

  const buildQuery = useCallback((overrides = {}) => {
    const q = { page, limit: 12, sort, ...(query && { search: query }), ...(category && { category }), ...overrides }
    return q
  }, [page, sort, query, category])

  useEffect(() => { fetchCategories() }, []) // eslint-disable-line

  useEffect(() => {
    fetchProducts(buildQuery())
  }, [params]) // eslint-disable-line

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    next.delete('page')
    setParams(next)
  }

  const clearAll = () => setParams({})

  const hasFilters = query || category || sort !== '-createdAt'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className={`lg:w-56 shrink-0 ${filterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="card p-5 sticky top-20 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold">Filters</h3>
              {hasFilters && <button onClick={clearAll} className="text-xs text-brand-400 hover:text-brand-300 transition-colors">Clear all</button>}
            </div>

            {/* Category filter */}
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-ink-faint mb-3">Category</p>
              <div className="space-y-1">
                <button onClick={() => setParam('category', '')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-brand-500/10 text-brand-400' : 'text-ink-muted hover:text-ink hover:bg-surface-muted'}`}>
                  All Categories
                </button>
                {categories.map(cat => (
                  <button key={cat._id} onClick={() => setParam('category', cat._id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === cat._id ? 'bg-brand-500/10 text-brand-400' : 'text-ink-muted hover:text-ink hover:bg-surface-muted'}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-ink-faint mb-3">Sort By</p>
              <div className="space-y-1">
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setParam('sort', opt.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${sort === opt.value ? 'bg-brand-500/10 text-brand-400' : 'text-ink-muted hover:text-ink hover:bg-surface-muted'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <div>
              <h1 className="section-title">
                {query ? `Results for "${query}"` : category ? categories.find(c => c._id === category)?.name || 'Products' : 'All Products'}
              </h1>
              <p className="section-subtitle mt-1">{meta.total} items found</p>
            </div>

            <div className="flex items-center gap-2">
              {hasFilters && (
                <button onClick={clearAll} className="flex items-center gap-1.5 text-xs bg-brand-500/10 text-brand-400 border border-brand-500/20 px-3 py-1.5 rounded-full hover:bg-brand-500/20 transition-colors">
                  <X className="w-3 h-3" /> Clear filters
                </button>
              )}
              <button onClick={() => setFilterOpen(o => !o)} className="flex items-center gap-2 btn-secondary text-sm py-2 lg:hidden">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
            </div>
          </div>

          <ProductGrid products={products} loading={loading} cols={3} />

          {meta.pages > 1 && (
            <div className="mt-10">
              <Pagination page={meta.page} pages={meta.pages} onChange={p => setParam('page', String(p))} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Products

