import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import cartService from '../services/cartService'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const { user } = useAuth()
  const [cart,    setCart]    = useState({ items: [], totalPrice: 0, totalItems: 0 })
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!user) { setCart({ items: [], totalPrice: 0, totalItems: 0 }); return }
    try {
      setLoading(true)
      const res = await cartService.get()
      setCart(res.data.data.cart)
    } catch {} finally { setLoading(false) }
  }, [user])

  useEffect(() => { fetchCart() }, [fetchCart])

  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!user) { toast.error('Please login to add items'); return false }
    try {
      const res = await cartService.add({ productId, quantity })
      setCart(res.data.data.cart)
      toast.success('Added to cart!')
      return true
    } catch { return false }
  }, [user])

  const updateQuantity = useCallback(async (productId, quantity) => {
    try {
      const res = await cartService.update({ productId, quantity })
      setCart(res.data.data.cart)
    } catch {}
  }, [])

  const removeFromCart = useCallback(async (productId) => {
    try {
      const res = await cartService.remove(productId)
      setCart(res.data.data.cart)
      toast.success('Removed from cart')
    } catch {}
  }, [])

  const clearCart = useCallback(async () => {
    try { await cartService.clear(); setCart({ items: [], totalPrice: 0, totalItems: 0 }) } catch {}
  }, [])

  const itemCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0
  const total     = cart?.items?.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0

  return (
    <CartContext.Provider value={{ cart, loading, itemCount, total, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
