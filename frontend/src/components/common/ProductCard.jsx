import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Plus, Heart } from 'lucide-react'
import { useCart } from '../../context/CartContext'

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()
  const [adding, setAdding] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    setAdding(true)
    await addToCart(product._id)
    setAdding(false)
  }

  const img = product.images?.[0]?.url || `https://placehold.co/400x400/111827/475569?text=${encodeURIComponent(product.name)}`

  return (
    <Link to={`/products/${product._id}`} className="group card-hover overflow-hidden block animate-fade-in">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-surface-card">
        <img
          src={img}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-surface/70 flex items-center justify-center">
            <span className="badge-red text-xs font-bold">Out of Stock</span>
          </div>
        )}
        {/* Discount badge */}
        {product.isFeatured && (
          <div className="absolute top-2 left-2">
            <span className="badge-blue text-[10px] font-bold uppercase tracking-wider">Featured</span>
          </div>
        )}
        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); setWishlisted(w => !w) }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-card/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-surface-card"
        >
          <Heart className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-red-400 text-red-400' : 'text-ink-muted'}`} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-ink-faint text-xs font-mono uppercase tracking-wider mb-0.5">{product.brand}</p>
          <h3 className="font-display font-semibold text-sm text-ink line-clamp-2 leading-snug group-hover:text-brand-400 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs text-ink-muted">{product.ratings?.toFixed(1) || '-'}</span>
          <span className="text-ink-faint text-xs">({product.numReviews})</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="font-display font-bold text-lg text-ink">${product.price?.toFixed(2)}</span>
          <button
            onClick={handleAdd}
            disabled={adding || product.stock === 0}
            className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all active:scale-95"
          >
            {adding ? (
              <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            Add
          </button>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard

