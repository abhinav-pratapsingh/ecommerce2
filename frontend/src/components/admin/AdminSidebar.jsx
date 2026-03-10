import { NavLink, Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, ChevronRight, Store } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/admin',          icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package,          label: 'Products' },
  { to: '/admin/orders',   icon: ShoppingBag,      label: 'Orders' },
  { to: '/admin/users',    icon: Users,             label: 'Users' },
]

const AdminSidebar = ({ onClose }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <aside className="flex flex-col h-full bg-surface-card border-r border-surface-border w-64">
      <div className="flex items-center justify-between p-5 border-b border-surface-border">
        <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-lg">
          <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
            <Store className="w-3.5 h-3.5 text-white" />
          </div>
          Shop<span className="text-brand-400">Vault</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-muted transition-colors lg:hidden">
            X
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-mono uppercase tracking-widest text-ink-faint px-3 mb-3">Admin Panel</p>
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                  : 'text-ink-muted hover:text-ink hover:bg-surface-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-500' : ''}`} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-500" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-surface-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 font-bold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{user?.name}</p>
            <p className="text-[10px] text-ink-faint font-mono uppercase tracking-wider">{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar

