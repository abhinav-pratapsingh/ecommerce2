import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react'
import BannerSlider from '../../components/common/BannerSlider'
import CategoryCard from '../../components/common/CategoryCard'
import ProductGrid from '../../components/common/ProductGrid'
import { useProducts } from '../../context/ProductContext'

const PERKS = [
  { icon: Truck,        title: 'Free Shipping',    desc: 'On orders over $50' },
  { icon: RotateCcw,    title: 'Easy Returns',     desc: '30-day return policy' },
  { icon: ShieldCheck,  title: 'Secure Payments',  desc: 'Protected by Razorpay' },
  { icon: Headphones,   title: '24/7 Support',     desc: 'Always here to help' },
]

const Home = () => {
  const { products, categories, loading, fetchProducts, fetchCategories } = useProducts()

  useEffect(() => {
    fetchCategories()
    fetchProducts({ limit: 8, sort: '-createdAt' })
  }, []) // eslint-disable-line

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 space-y-14">
      {/* Hero Banner */}
      <section className="pt-6">
        <BannerSlider />
      </section>

      {/* Perks strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {PERKS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-4 card px-5 py-4">
            <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <p className="font-display font-bold text-sm">{title}</p>
              <p className="text-ink-faint text-xs">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle mt-1">Find exactly what you're looking for</p>
            </div>
            <Link to="/products" className="text-brand-400 hover:text-brand-300 text-sm font-medium flex items-center gap-1 transition-colors">
              All categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.slice(0, 6).map((cat, i) => (
              <CategoryCard key={cat._id} category={cat} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-title">New Arrivals</h2>
            <p className="section-subtitle mt-1">The latest additions to our store</p>
          </div>
          <Link to="/products?sort=-createdAt" className="text-brand-400 hover:text-brand-300 text-sm font-medium flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <ProductGrid products={products} loading={loading} cols={4} />
      </section>

      {/* Best Sellers */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-title">Best Sellers</h2>
            <p className="section-subtitle mt-1">Most loved by our customers</p>
          </div>
          <Link to="/products?sort=-numReviews" className="text-brand-400 hover:text-brand-300 text-sm font-medium flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <ProductGrid products={[...products].reverse()} loading={loading} cols={4} />
      </section>

      {/* CTA Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 to-brand-900 px-8 sm:px-14 py-12">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="relative max-w-lg">
          <span className="inline-block text-xs font-mono bg-brand-500/30 text-brand-200 border border-brand-500/30 px-3 py-1 rounded-full mb-4 uppercase tracking-widest">Limited Time Offer</span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white mb-3">Get 20% Off Your First Order</h2>
          <p className="text-brand-200 mb-6">Use code <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">VAULT20</span> at checkout</p>
          <Link to="/register" className="inline-flex bg-white text-brand-700 font-bold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors shadow-glow-brand">
            Create Account ->
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home

