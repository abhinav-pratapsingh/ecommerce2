import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Store } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Loader } from '../../components/common/Loader'

export const Login = () => {
  const { login, loading } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/'
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form)
    if (result?.success) navigate(result.role === 'admin' ? '/admin' : from, { replace: true })
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-brand-900 via-brand-800 to-surface-card items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #60a5fa 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative text-center">
          <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur">
            <Store className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-display font-black text-4xl text-white mb-4">Shop<span className="text-brand-300">Vault</span></h2>
          <p className="text-brand-200 text-lg max-w-xs">Premium shopping experience with thousands of products</p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-left">
            {['Free Returns', 'Secure Checkout', '24/7 Support', 'Top Brands'].map(f => (
              <div key={f} className="flex items-center gap-2 text-brand-200 text-sm">
                <div className="w-5 h-5 rounded-full bg-brand-500/40 flex items-center justify-center text-xs">OK</div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2 font-display font-extrabold text-2xl">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              Shop<span className="text-brand-400">Vault</span>
            </Link>
          </div>

          <h1 className="font-display font-bold text-2xl mb-1">Welcome back</h1>
          <p className="text-ink-muted text-sm mb-8">Sign in to your account to continue shopping</p>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm text-ink-muted mb-1.5 block">Email address</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required className="input-field" placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-sm text-ink-muted mb-1.5 block">Password</label>
                <div className="relative">
                  <input type={show ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required className="input-field pr-11" placeholder="********" />
                  <button type="button" onClick={() => setShow(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 shadow-glow-sm">
              {loading ? <><Loader size="sm" /> Signing in...</> : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-ink-muted text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Create one free</Link>
              </p>
            </div>
          </div>

          <div className="mt-4 card p-4 border-dashed">
            <p className="text-xs text-ink-faint font-mono text-center">
              Demo admin: <span className="text-brand-400">admin@ecommerce.com</span> / <span className="text-brand-400">Admin@123456</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Register = () => {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [show, setShow] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) return
    const result = await register(form)
    if (result?.success) navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-extrabold text-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            Shop<span className="text-brand-400">Vault</span>
          </Link>
          <h1 className="font-display font-bold text-2xl mt-6 mb-1">Create your account</h1>
          <p className="text-ink-muted text-sm">Join millions of happy shoppers</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { key: 'name',  label: 'Full Name',     type: 'text',  placeholder: 'Jane Doe' },
              { key: 'email', label: 'Email address', type: 'email', placeholder: 'you@example.com' },
              { key: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+1 555 000 0000' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="text-sm text-ink-muted mb-1.5 block">{label}</label>
                <input type={type} value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  required={key !== 'phone'} className="input-field" placeholder={placeholder} />
              </div>
            ))}

            <div>
              <label className="text-sm text-ink-muted mb-1.5 block">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required minLength={8} className="input-field pr-11" placeholder="Min. 8 characters" />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 shadow-glow-sm">
              {loading ? <><Loader size="sm" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-ink-muted text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

