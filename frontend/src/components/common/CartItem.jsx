import { Trash2, Minus, Plus } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart()
  const [updating, setUpdating] = useState(false)

  const handleQty = async (newQty) => {
    if (newQty < 1) return
    setUpdating(true)
    await updateQuantity(item.product._id || item.product, newQty)
    setUpdating(false)
  }

  const img = item.product?.images?.[0]?.url || `https://placehold.co/80x80/1a1a1a/525252?text=IMG`
  const name = item.product?.name || 'Product'
  const productId = item.product?._id || item.product

  return (
    <div className="flex items-center gap-4 py-4 border-b border-surface-border last:border-0 animate-fade-in">
      <Link to={`/products/${productId}`} className="shrink-0">
        <img src={img} alt={name} className="w-20 h-20 object-cover rounded-xl bg-surface-card" />
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/products/${productId}`}>
          <h4 className="font-display font-semibold text-sm text-ink hover:text-brand-400 transition-colors line-clamp-2">{name}</h4>
        </Link>
        <p className="text-brand-400 font-bold text-base mt-1">${item.price?.toFixed(2)}</p>
      </div>

      <div className="flex flex-col items-end gap-3 shrink-0">
        {/* Qty control */}
        <div className="flex items-center gap-1 bg-surface-card border border-surface-border rounded-lg p-0.5">
          <button
            onClick={() => handleQty(item.quantity - 1)}
            disabled={updating || item.quantity <= 1}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-muted disabled:opacity-40 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-6 text-center text-sm font-semibold tabular-nums">
            {updating ? <div className="w-3 h-3 border border-ink-muted border-t-transparent rounded-full animate-spin mx-auto" /> : item.quantity}
          </span>
          <button
            onClick={() => handleQty(item.quantity + 1)}
            disabled={updating}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-muted transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => removeFromCart(productId)}
          className="text-ink-faint hover:text-red-400 transition-colors p-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default CartItem
