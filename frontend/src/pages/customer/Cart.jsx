import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react'
import CartItem from '../../components/common/CartItem'
import { useCart } from '../../context/CartContext'
import { Loader } from '../../components/common/Loader'

const TAX_RATE = 0.08
const SHIPPING  = 10
const FREE_SHIPPING_THRESHOLD = 100

const Cart = () => {
  const { cart, loading, total, clearCart } = useCart()
  const items = cart?.items || []

  const tax          = +(total * TAX_RATE).toFixed(2)
  const shipping     = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING
  const grandTotal   = +(total + tax + shipping).toFixed(2)

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader size="lg" /></div>

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <h1 className="font-display font-black text-3xl mb-8">Your Cart</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <ShoppingBag className="w-20 h-20 text-surface-muted" />
          <h2 className="font-display text-xl font-bold text-ink-muted">Your cart is empty</h2>
          <p className="text-ink-faint text-sm">Start adding items to see them here</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-surface-border">
              <h2 className="font-display font-semibold">{items.length} item{items.length !== 1 ? 's' : ''}</h2>
              <button onClick={clearCart} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Clear cart
              </button>
            </div>
            {items.map(item => <CartItem key={item.product?._id || item.product} item={item} />)}
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="card p-6 space-y-4 sticky top-20">
              <h2 className="font-display font-bold text-lg">Order Summary</h2>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-ink-muted">
                  <span>Subtotal</span><span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Tax (8%)</span><span>${tax}</span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-emerald-400">Free</span> : `$${shipping}`}</span>
                </div>
                {total < FREE_SHIPPING_THRESHOLD && (
                  <p className="text-xs text-brand-400 bg-brand-500/10 rounded-lg px-3 py-2">
                    Add ${(FREE_SHIPPING_THRESHOLD - total).toFixed(2)} more for free shipping!
                  </p>
                )}
              </div>

              <div className="border-t border-surface-border pt-4 flex justify-between font-display font-black text-xl">
                <span>Total</span>
                <span className="text-brand-400">${grandTotal}</span>
              </div>

              <Link to="/checkout" className="btn-primary flex items-center justify-center gap-2 w-full">
                Checkout <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/products" className="btn-ghost flex items-center justify-center text-sm w-full">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart
