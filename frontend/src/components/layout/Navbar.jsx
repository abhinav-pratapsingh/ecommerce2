import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Package, LogOut, LayoutDashboard, ChevronDown, Store } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import SearchBar from '../common/SearchBar'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-xl border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link to="/" className="shrink-0 flex items-center gap-2 font-display font-extrabold text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:block">Shop<span className="text-brand-400">Vault</span></span>
          </Link>

          {/* Search  desktop */}
          <div className="flex-1 max-w-xl hidden md:block">
            <SearchBar />
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* Cart */}
            <Link to="/cart" className="relative p-2.5 rounded-xl hover:bg-surface-card transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce-in">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface-card transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 font-bold text-xs">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">{user.name?.split(' ')[0]}</span>
                  <ChevronDown className={`w-4 h-4 hidden sm:block text-ink-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 card shadow-card z-20 overflow-hidden animate-slide-up">
                      <div className="px-4 py-3 border-b border-surface-border">
                        <p className="font-display font-semibold text-sm">{user.name}</p>
                        <p className="text-ink-faint text-xs truncate">{user.email}</p>
                      </div>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-surface-muted transition-colors text-sm text-brand-400">
                          <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      )}
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-surface-muted transition-colors text-sm">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-surface-muted transition-colors text-sm">
                        <Package className="w-4 h-4" /> My Orders
                      </Link>
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-surface-muted transition-colors text-sm text-red-400 border-t border-surface-border">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm py-2 px-3 hidden sm:block">Log in</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign up</Link>
              </div>
            )}

            <button onClick={() => setMobileOpen(o => !o)} className="p-2 rounded-xl hover:bg-surface-card transition-colors md:hidden">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-32 pb-3' : 'max-h-0'}`}>
          <SearchBar className="mt-1" />
          {!user && (
            <div className="flex gap-2 mt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 text-sm py-2 text-center">Log in</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 text-sm py-2 text-center">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar

