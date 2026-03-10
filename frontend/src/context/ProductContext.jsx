import { createContext, useContext, useState, useCallback } from 'react'
import productService from '../services/productService'

const ProductContext = createContext(null)

export const ProductProvider = ({ children }) => {
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [meta,       setMeta]       = useState({ total: 0, pages: 1, page: 1, limit: 12 })
  const [loading,    setLoading]    = useState(false)

  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const res = await productService.getAll(params)
      setProducts(res.data.data.products)
      setMeta(res.data.meta)
    } catch {} finally { setLoading(false) }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await productService.getCategories()
      setCategories(res.data.data.categories)
    } catch {}
  }, [])

  const searchProducts = useCallback(async (params) => {
    setLoading(true)
    try {
      const res = await productService.search(params)
      setProducts(res.data.data.products)
      setMeta(res.data.meta)
    } catch {} finally { setLoading(false) }
  }, [])

  return (
    <ProductContext.Provider value={{ products, categories, meta, loading, fetchProducts, fetchCategories, searchProducts }}>
      {children}
    </ProductContext.Provider>
  )
}

export const useProducts = () => {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error('useProducts must be inside ProductProvider')
  return ctx
}
