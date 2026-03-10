import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import productService from '../../services/productService'
import { TableSkeleton } from '../../components/common/Loader'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [meta, setMeta]         = useState({ total: 0, pages: 1, page: 1 })
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')
  const [deleting, setDeleting] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await productService.adminGetAll({ page, limit: 15, ...(search && { search }) })
      setProducts(res.data.data.products)
      setMeta(res.data.meta)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page]) // eslint-disable-line
  
  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    load()
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await productService.delete(id)
      toast.success('Product deleted')
      load()
    } finally { setDeleting(null) }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-black text-2xl">Products</h1>
          <p className="text-ink-muted text-sm mt-0.5">{meta.total} total products</p>
        </div>
        <Link to="/admin/products/create" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 text-sm" placeholder="Search products..." />
        </div>
        <button type="submit" className="btn-secondary text-sm">Search</button>
      </form>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={8} cols={5} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Product', 'Category', 'Price', 'Stock', 'Rating', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-mono uppercase tracking-wider text-ink-faint">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {products.map(p => (
                  <tr key={p._id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0]?.url || 'https://placehold.co/40x40/1a1a1a/525252?text=P'}
                          alt="" className="w-10 h-10 rounded-lg object-cover bg-surface-card shrink-0" />
                        <span className="font-medium line-clamp-1 max-w-[160px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{p.category?.name || '-'}</td>
                    <td className="px-4 py-3 font-bold text-brand-400">${p.price?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={p.stock > 0 ? 'badge-green' : 'badge-red'}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{p.ratings?.toFixed(1) || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link to={`/admin/products/edit/${p._id}`}
                          className="p-2 rounded-lg hover:bg-surface-muted transition-colors text-ink-muted hover:text-brand-400">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(p._id, p.name)} disabled={deleting === p._id}
                          className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-ink-muted hover:text-red-400 disabled:opacity-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-16 text-ink-muted">No products found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {meta.pages > 1 && (
          <div className="p-4 border-t border-surface-border">
            <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminProducts

