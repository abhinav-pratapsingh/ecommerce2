import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'
import { useOrders } from '../../context/OrderContext'
import orderService from '../../services/orderService'
import { Loader, TableSkeleton } from '../../components/common/Loader'
import Pagination from '../../components/common/Pagination'

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    className: 'badge-gray',   icon: Clock },
  processing: { label: 'Processing', className: 'badge-blue',   icon: Package },
  shipped:    { label: 'Shipped',    className: 'badge-orange', icon: Truck },
  delivered:  { label: 'Delivered',  className: 'badge-green',  icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  className: 'badge-red',    icon: XCircle },
}

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const Icon = cfg.icon
  return <span className={`${cfg.className} flex items-center gap-1`}><Icon className="w-3 h-3" />{cfg.label}</span>
}

//  Orders List 
export const Orders = () => {
  const { orders, meta, loading, fetchMyOrders } = useOrders()
  const [page, setPage] = useState(1)

  useEffect(() => { fetchMyOrders({ page, limit: 10 }) }, [page]) // eslint-disable-line

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <h1 className="font-display font-black text-3xl mb-8">My Orders</h1>

      {loading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <Package className="w-20 h-20 text-surface-muted" />
          <h2 className="font-display text-xl font-bold text-ink-muted">No orders yet</h2>
          <Link to="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Link key={order._id} to={`/orders/${order._id}`}
              className="card-hover p-5 flex flex-col sm:flex-row sm:items-center gap-4 block">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-mono text-xs text-ink-faint">#{order._id.slice(-8).toUpperCase()}</p>
                  <StatusBadge status={order.orderStatus} />
                </div>
                <p className="font-display font-semibold mt-1">{order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}</p>
                <p className="text-ink-faint text-xs mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="font-display font-black text-xl text-brand-400">${order.totalPrice?.toFixed(2)}</span>
                <ChevronRight className="w-5 h-5 text-ink-faint" />
              </div>
            </Link>
          ))}

          <div className="pt-4">
            <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />
          </div>
        </div>
      )}
    </div>
  )
}

//  Order Details 
export const OrderDetails = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService.getById(id)
      .then(res => setOrder(res.data.data.order))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader size="lg" /></div>
  if (!order)  return <div className="text-center py-20 text-ink-muted">Order not found</div>

  const addr = order.shippingAddress

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <Link to="/orders" className="text-ink-muted hover:text-ink text-sm transition-colors">Back to My Orders</Link>
        <div className="h-4 w-px bg-surface-border" />
        <h1 className="font-display font-black text-2xl">Order #{order._id.slice(-8).toUpperCase()}</h1>
        <StatusBadge status={order.orderStatus} />
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {/* Items */}
        <div className="card p-5 sm:col-span-2">
          <h2 className="font-display font-bold mb-4">Items</h2>
          <div className="space-y-3">
            {order.orderItems?.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <img src={item.image || 'https://placehold.co/56x56/1a1a1a/525252?text=IMG'} alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover bg-surface-card" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                  <p className="text-ink-muted text-xs">Qty: {item.quantity}</p>
                </div>
                <span className="font-bold text-brand-400">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping */}
        <div className="card p-5">
          <h2 className="font-display font-bold mb-3">Shipping Address</h2>
          <div className="text-sm text-ink-muted space-y-1">
            <p className="text-ink font-semibold">{addr?.fullName}</p>
            <p>{addr?.street}</p>
            <p>{addr?.city}, {addr?.state} {addr?.zipCode}</p>
            <p>{addr?.country}</p>
            <p className="text-ink-faint">{addr?.phone}</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="card p-5">
          <h2 className="font-display font-bold mb-3">Payment Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-ink-muted"><span>Items</span><span>${order.itemsPrice?.toFixed(2)}</span></div>
            <div className="flex justify-between text-ink-muted"><span>Tax</span><span>${order.taxPrice?.toFixed(2)}</span></div>
            <div className="flex justify-between text-ink-muted"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : `$${order.shippingPrice}`}</span></div>
            <div className="flex justify-between font-display font-black text-lg border-t border-surface-border pt-2 mt-2">
              <span>Total</span><span className="text-brand-400">${order.totalPrice?.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-ink-faint">
            Payment: <span className={order.paymentInfo?.status === 'paid' ? 'text-emerald-400' : 'text-red-400'}>{order.paymentInfo?.status || 'pending'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

