import { Link } from 'react-router-dom'
import { Store } from 'lucide-react'

const Footer = () => (
  <footer className="bg-surface text-ink border-t border-surface-border mt-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-xl mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            Shop<span className="text-brand-400">Vault</span>
          </Link>
          <p className="text-ink-muted text-sm leading-relaxed">Premium shopping experience with thousands of products across every category.</p>
        </div>
        {[
          { title: 'Shop',    links: [['All Products', '/products'], ['New Arrivals', '/products?sort=-createdAt'], ['Best Sellers', '/products?sort=-numReviews']] },
          { title: 'Account', links: [['Login', '/login'], ['Register', '/register'], ['My Orders', '/orders'], ['Profile', '/profile']] },
          { title: 'Company', links: [['About', '#'], ['Careers', '#'], ['Privacy Policy', '#'], ['Terms of Service', '#']] },
        ].map(col => (
          <div key={col.title}>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-ink-muted mb-4">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map(([label, href]) => (
                <li key={label}><Link to={href} className="text-sm text-ink-muted hover:text-brand-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-surface-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-ink-faint text-sm">(c) {new Date().getFullYear()} ShopVault. All rights reserved.</p>
        <p className="text-ink-faint text-xs font-mono">v1.0.0</p>
      </div>
    </div>
  </footer>
)

export default Footer


