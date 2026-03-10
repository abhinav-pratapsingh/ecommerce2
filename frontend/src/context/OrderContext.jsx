import { createContext, useContext, useState, useCallback } from 'react'
import orderService from '../services/orderService'
import toast from 'react-hot-toast'

const OrderContext = createContext(null)

export const OrderProvider = ({ children }) => {
  const [orders,  setOrders]  = useState([])
  const [meta,    setMeta]    = useState({ total: 0, pages: 1, page: 1 })
  const [loading, setLoading] = useState(false)

  const placeOrder = useCallback(async (data) => {
    try {
      const res = await orderService.create(data)
      toast.success('Order placed!')
      return { success: true, order: res.data.data.order }
    } catch { return { success: false } }
  }, [])

  const fetchMyOrders = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const res = await orderService.getMyOrders(params)
      setOrders(res.data.data.orders)
      setMeta(res.data.meta)
    } catch {} finally { setLoading(false) }
  }, [])

  return (
    <OrderContext.Provider value={{ orders, meta, loading, placeOrder, fetchMyOrders }}>
      {children}
    </OrderContext.Provider>
  )
}

export const useOrders = () => {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrders must be inside OrderProvider')
  return ctx
}
