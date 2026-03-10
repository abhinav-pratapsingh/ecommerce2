import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, ShoppingCart, Minus, Plus, ArrowLeft, Package } from 'lucide-react'
import productService from '../../services/productService'
import { useCart } from '../../context/CartContext'
import { Loader, SkeletonLine } from '../../components/common/Loader'

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(s => (
      <Star key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-surface-muted'}`} />
    ))}
  </div>
)

const ProductDetails = () => {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [selectedImg, setSelectedImg] = useState(0)
  const [qty, setQty]           = useState(1)
  const [adding, setAdding]     = useState(false)

  useEffect(() => {
    setLoading(true)
    productService.getById(id)
      .then(res => { setProduct(res.data.data.product); setSelectedImg(0) })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleAdd = async () => {
    setAdding(true)
    await addToCart(id, qty)
    setAdding(false)
  }

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="skeleton aspect-square rounded-3xl" />
        <div className="space-y-5 pt-4">
          {[80, 50, 40, 90, 60].map((w, i) => <SkeletonLine key={i} className={`h-6 w-${w}%`} />)}
        </div>
      </div>
    </div>
  )

  if (!product) return (
    <div className="max-w-6xl mx-auto px-4 py-24 text-center">
      <div className="text-4xl mb-4">:(</div>
      <h2 className="font-display text-2xl font-bold mb-2">Product Not Found</h2>
      <Link to="/products" className="btn-primary inline-flex mt-4">Browse Products</Link>
    </div>
  )

  const images = product.images?.length
    ? product.images
    : [{ url: `https://placehold.co/600x600/1a1a1a/525252?text=${encodeURIComponent(product.name)}` }]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <Link to="/products" className="inline-flex items-center gap-2 text-ink-muted hover:text-ink text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-surface-card border border-surface-border">
            <img src={images[selectedImg]?.url} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImg(i)}
                  className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${i === selectedImg ? 'border-brand-500' : 'border-surface-border hover:border-surface-muted'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-gray font-mono">{product.brand}</span>
              {product.isFeatured && <span className="badge-orange">Featured</span>}
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl leading-tight">{product.name}</h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <StarRating rating={product.ratings} />
            <span className="text-ink font-semibold">{product.ratings?.toFixed(1)}</span>
            <span className="text-ink-muted text-sm">({product.numReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="font-display font-black text-4xl text-ink">${product.price?.toFixed(2)}</span>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-ink-muted" />
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Description */}
          <p className="text-ink-muted leading-relaxed border-t border-surface-border pt-5">{product.description}</p>

          {/* Quantity + Add */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center bg-surface-card border border-surface-border rounded-xl p-1">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-muted transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold tabular-nums">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-muted transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button onClick={handleAdd} disabled={adding} className="flex-1 btn-primary flex items-center justify-center gap-2">
                {adding ? <Loader size="sm" /> : <ShoppingCart className="w-4 h-4" />}
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          )}

          {/* Category */}
          {product.category && (
            <div className="pt-3 border-t border-surface-border">
              <span className="text-ink-faint text-xs">Category: </span>
              <Link to={`/products?category=${product.category._id}`} className="text-brand-400 text-xs hover:underline">
                {product.category.name}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {product.reviews?.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title mb-6">Customer Reviews</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {product.reviews.map(r => (
              <div key={r._id} className="card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center font-bold text-brand-400 text-sm">
                      {r.user?.name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{r.user?.name}</p>
                      <p className="text-ink-faint text-xs">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <StarRating rating={r.rating} />
                </div>
                <p className="text-ink-muted text-sm leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductDetails

