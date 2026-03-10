import { useEffect, useState } from 'react'
import { Users, Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts'
import orderService from '../../services/orderService'
import { Loader } from '../../components/common/Loader'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="stat-card">
    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 blur-2xl" style={{ background: color }} />
    <div className="flex items-start justify-between">
      <p className="text-ink-muted text-sm">{label}</p>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
    </div>
    <p className="font-display font-black text-3xl mt-2">{value}</p>
    {sub && <p className="text-xs text-ink-faint">{sub}</p>}
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-3 text-sm shadow-card">
      <p className="text-ink-muted mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-bold">
          {p.name}: {p.name.includes('Revenue') ? `$${p.value?.toFixed(0)}` : p.value}
        </p>
      ))}
    </div>
  )
}

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService.getStats()
      .then(res => setStats(res.data.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader size="lg" /></div>
  if (!stats)  return <div className="text-center text-ink-muted py-20">Failed to load stats</div>

  const { overview, ordersByStatus, recentOrders, topProducts, monthlySales } = stats

  const chartData = monthlySales?.map(m => ({
    month: MONTHS[m._id.month - 1],
    Revenue: m.revenue,
    Orders: m.orders,
  })) || []

  const statusData = Object.entries(ordersByStatus || {}).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-black text-2xl">Dashboard</h1>
        <p className="text-ink-muted text-sm">ShopVault store performance overview</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={overview.totalUsers}    icon={Users}       color="#3b82f6" />
        <StatCard label="Total Products"  value={overview.totalProducts} icon={Package}     color="#8b5cf6" />
        <StatCard label="Total Orders"    value={overview.totalOrders}   icon={ShoppingBag} color="#06b6d4" />
        <StatCard label="Total Revenue"   value={`$${overview.totalRevenue?.toFixed(0)}`} icon={DollarSign} color="#10b981" sub="From paid orders" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold">Monthly Revenue</h2>
              <p className="text-ink-muted text-xs mt-0.5">Last 6 months performance</p>
            </div>
            <TrendingUp className="w-5 h-5 text-brand-400" />
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-ink-faint text-sm">No data yet</div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-display font-bold mb-6">Orders by Status</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData} layout="vertical">
                <XAxis type="number" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-ink-faint text-sm">No data yet</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-display font-bold mb-5">Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders?.map(order => (
              <div key={order._id} className="flex items-center gap-3 py-2 border-b border-surface-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{order.user?.name || '-'}</p>
                  <p className="text-ink-faint text-xs font-mono">#{order._id.slice(-6)}</p>
                </div>
                <span className={`badge text-[10px] ${
                  order.orderStatus === 'delivered' ? 'badge-green' :
                  order.orderStatus === 'shipped'   ? 'badge-orange' :
                  order.orderStatus === 'cancelled' ? 'badge-red' : 'badge-gray'
                }`}>{order.orderStatus}</span>
                <span className="font-bold text-brand-400 text-sm">${order.totalPrice?.toFixed(0)}</span>
              </div>
            ))}
            {!recentOrders?.length && <p className="text-ink-faint text-sm text-center py-8">No orders yet</p>}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display font-bold mb-5">Top Selling Products</h2>
          <div className="space-y-3">
            {topProducts?.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3 py-2 border-b border-surface-border last:border-0">
                <span className="font-mono text-xs text-ink-faint w-5 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{p.name}</p>
                </div>
                <span className="badge-blue">{p.totalSold} sold</span>
              </div>
            ))}
            {!topProducts?.length && <p className="text-ink-faint text-sm text-center py-8">No sales data yet</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

