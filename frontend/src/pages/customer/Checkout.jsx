import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useOrders } from '../../context/OrderContext'
import orderService from '../../services/orderService'
import { Loader } from '../../components/common/Loader'
import { ShieldCheck, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error('Failed to load Razorpay'))
    document.body.appendChild(script)
  })

const CheckoutForm = ({ shippingAddress }) => {
  const { cart, total, clearCart } = useCart()
  const { placeOrder } = useOrders()
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)

  const TAX = +(total * 0.08).toFixed(2)
  const SHIP = total >= 100 ? 0 : 10
  const GRAND = +(total + TAX + SHIP).toFixed(2)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const fields = ['fullName', 'street', 'city', 'state', 'zipCode', 'country', 'phone']
    for (const f of fields) {
      if (!shippingAddress[f]?.trim()) { toast.error(`Please fill in ${f}`); return }
    }

    setProcessing(true)
    try {
      await loadRazorpayScript()

      // 1. Place the order
      const { success, order } = await placeOrder({ shippingAddress })
      if (!success || !order) throw new Error('Order failed')

      // 2. Create Razorpay order
      const payRes = await orderService.processPayment({ orderId: order._id })
      const { keyId, razorpayOrderId, amount, currency } = payRes.data.data

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'ShopVault',
        description: `Order #${order._id}`,
        order_id: razorpayOrderId,
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
        },
        notes: {
          orderId: order._id,
        },
        handler: async (response) => {
          await orderService.verifyPayment({
            orderId: order._id,
            ...response,
          })
          await clearCart()
          toast.success('Payment successful!')
          navigate(`/orders/${order._id}`)
        },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled')
          },
        },
        theme: { color: '#3b82f6' },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (resp) => {
        const msg = resp?.error?.description || 'Payment failed'
        toast.error(msg)
      })
      rzp.open()
    } catch (err) {
      toast.error(err.message || 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="card p-4 space-y-2">
        <p className="text-xs font-mono uppercase tracking-wider text-ink-faint mb-3">Payment</p>
        <div className="bg-surface-card border border-surface-border rounded-xl p-4 text-sm text-ink-muted">
          You'll be redirected to Razorpay Checkout to complete the payment securely.
        </div>
        <div className="flex items-center gap-1.5 text-xs text-ink-faint mt-2">
          <Lock className="w-3 h-3" /> Secured by Razorpay
        </div>
      </div>

      {/* Order total recap */}
      <div className="card p-4 space-y-2 text-sm">
        <div className="flex justify-between text-ink-muted"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
        <div className="flex justify-between text-ink-muted"><span>Tax</span><span>${TAX}</span></div>
        <div className="flex justify-between text-ink-muted"><span>Shipping</span><span>{SHIP === 0 ? 'Free' : `$${SHIP}`}</span></div>
        <div className="flex justify-between font-display font-black text-lg border-t border-surface-border pt-3">
          <span>Total</span><span className="text-brand-400">${GRAND}</span>
        </div>
      </div>

      <button type="submit" disabled={processing || cart?.items?.length === 0}
        className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4 disabled:opacity-50 shadow-glow-sm">
        {processing ? <><Loader size="sm" /> Processing...</> : <><ShieldCheck className="w-5 h-5" /> Pay ${GRAND}</>}
      </button>
    </form>
  )
}

const Checkout = () => {
  const { cart } = useCart()
  const [shipping, setShipping] = useState({
    fullName: '', street: '', city: '', state: '',
    zipCode: '', country: 'US', phone: '',
  })

  const updateField = (k, v) => setShipping(s => ({ ...s, [k]: v }))

  const FIELDS = [
    { key: 'fullName', label: 'Full Name',    span: 2 },
    { key: 'phone',    label: 'Phone',        span: 2 },
    { key: 'street',   label: 'Street Address', span: 2 },
    { key: 'city',     label: 'City',         span: 1 },
    { key: 'state',    label: 'State',        span: 1 },
    { key: 'zipCode',  label: 'ZIP Code',     span: 1 },
    { key: 'country',  label: 'Country',      span: 1 },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <h1 className="font-display font-black text-3xl mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping */}
        <div className="space-y-5">
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg mb-5">Shipping Address</h2>
            <div className="grid grid-cols-2 gap-4">
              {FIELDS.map(({ key, label, span }) => (
                <div key={key} className={span === 2 ? 'col-span-2' : 'col-span-1'}>
                  <label className="text-xs text-ink-muted mb-1.5 block">{label}</label>
                  <input
                    value={shipping[key]}
                    onChange={e => updateField(key, e.target.value)}
                    className="input-field text-sm"
                    placeholder={label}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Cart items mini-list */}
          <div className="card p-5">
            <h2 className="font-display font-bold text-sm mb-4 text-ink-muted uppercase tracking-wider">Items ({cart?.items?.length})</h2>
            <div className="space-y-3">
              {cart?.items?.map(item => (
                <div key={item.product?._id || item.product} className="flex items-center gap-3 text-sm">
                  <img src={item.product?.images?.[0]?.url || 'https://placehold.co/40x40/1a1a1a/525252?text=IMG'}
                    alt="" className="w-10 h-10 rounded-lg object-cover bg-surface-card" />
                  <span className="flex-1 text-ink-muted truncate">{item.product?.name} x {item.quantity}</span>
                  <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment */}
        <div>
          <CheckoutForm shippingAddress={shipping} />
        </div>
      </div>
    </div>
  )
}

export default Checkout


