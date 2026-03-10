import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import orderService from '../../services/orderService'
import { TableSkeleton } from '../../components/common/Loader'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_COLORS = {
  pending:    'badge-gray', processing: 'badge-blue',
  shipped:    'badge-orange', delivered: 'badge-green', cancelled: 'badge-red',
}

const AdminOrders = () => {
  const [orders,  setOrders]  = useState([])
  const [meta,    setMeta]    = useState({ total: 0, pages: 1, page: 1 })
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [updating, setUpdating] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await orderService.adminGetAll({ page, limit: 15, ...(statusFilter && { status: statusFilter }) })
      setOrders(res.data.data.orders)
      setMeta(res.data.meta)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page, statusFilter]) // eslint-disable-line

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      await orderService.adminUpdate(orderId, { orderStatus: newStatus })
      toast.success(`Order marked as ${newStatus}`)
      load()
    } finally { setUpdating(null) }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-black text-2xl">Orders</h1>
          <p className="text-ink-muted text-sm mt-0.5">{meta.total} total orders</p>
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setStatusFilter(''); setPage(1) }}
            className={`pill-tab ${!statusFilter ? 'pill-tab-active' : 'pill-tab-inactive'}`}>All</button>
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`pill-tab capitalize ${statusFilter === s ? 'pill-tab-active' : 'pill-tab-inactive'}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={10} cols={5} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Update'].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-mono uppercase tracking-wider text-ink-faint">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-ink-faint">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm">{order.user?.name || '-'}</p>
                      <p className="text-ink-faint text-xs">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{order.orderItems?.length}</td>
                    <td className="px-4 py-3 font-bold text-brand-400">${order.totalPrice?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'badge-gray'} capitalize`}>{order.orderStatus}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="relative group">
                        <select
                          value={order.orderStatus}
                          disabled={updating === order._id || order.orderStatus === 'cancelled' || order.orderStatus === 'delivered'}
                          onChange={e => handleStatusUpdate(order._id, e.target.value)}
                          className="appearance-none bg-surface-card border border-surface-border rounded-lg px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-brand-500 pr-7 disabled:opacity-40 cursor-pointer"
                        >
                          {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-faint pointer-events-none" />
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-16 text-ink-muted">No orders found</td></tr>
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

export default AdminOrders

