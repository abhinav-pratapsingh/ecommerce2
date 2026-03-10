import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const BANNERS = [
  {
    id: 1,
    title: 'Shop the Latest\nTech & Gadgets',
    sub: 'Explore top brands at unbeatable prices',
    cta: 'Shop Now',
    href: '/products',
    gradient: 'from-blue-950 via-blue-900/80 to-surface',
    accent: 'text-blue-300',
    tag: 'New Arrivals',
  },
  {
    id: 2,
    title: 'Fashion That\nDefines You',
    sub: 'Curated styles from premium brands worldwide',
    cta: 'Explore Fashion',
    href: '/products?category=clothing',
    gradient: 'from-indigo-950 via-indigo-900/70 to-surface',
    accent: 'text-indigo-300',
    tag: 'Trending Now',
  },
  {
    id: 3,
    title: 'Mega Sale\nUp to 70% Off',
    sub: 'Limited time deals across all categories',
    cta: 'Grab Deals',
    href: '/products',
    gradient: 'from-cyan-950 via-cyan-900/60 to-surface',
    accent: 'text-cyan-300',
    tag: 'Hot Deals',
  },
]

const BannerSlider = () => {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % BANNERS.length), 5000)
    return () => clearInterval(t)
  }, [])

  const banner = BANNERS[current]

  return (
    <div className="relative overflow-hidden rounded-3xl h-[300px] sm:h-[360px] lg:h-[420px]">
      <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} transition-all duration-700`} />

      {/* Decorative mesh */}
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />
      {/* Glow orb */}
      <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center px-10 sm:px-16">
        <div className="max-w-lg animate-slide-up" key={current}>
          <span className="inline-block text-sm font-medium bg-brand-500/20 text-brand-300 border border-brand-500/30 px-3 py-1 rounded-full mb-4">
            {banner.tag}
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-ink leading-tight whitespace-pre-line mb-3">
            {banner.title}
          </h2>
          <p className={`font-body text-base sm:text-lg ${banner.accent} mb-6`}>{banner.sub}</p>
          <Link to={banner.href} className="inline-flex btn-primary text-sm sm:text-base shadow-glow-sm">
            {banner.cta} ->
          </Link>
        </div>
      </div>

      <button onClick={() => setCurrent(c => (c - 1 + BANNERS.length) % BANNERS.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/70 hover:bg-white rounded-full flex items-center justify-center transition-colors text-brand-700">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={() => setCurrent(c => (c + 1) % BANNERS.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/70 hover:bg-white rounded-full flex items-center justify-center transition-colors text-brand-700">
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {BANNERS.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-brand-500' : 'w-2 h-2 bg-brand-500/30'}`} />
        ))}
      </div>
    </div>
  )
}

export default BannerSlider


