import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Contexts
import { AuthProvider }    from './context/AuthContext'
import { CartProvider }    from './context/CartContext'
import { ProductProvider } from './context/ProductContext'
import { OrderProvider }   from './context/OrderContext'

// Guards
import { ProtectedRoute, AdminRoute } from './components/common/ProtectedRoute'

// Layout
import Navbar      from './components/layout/Navbar'
import Footer      from './components/layout/Footer'
import AdminLayout from './AdminLayout'

// Customer pages
import Home           from './pages/customer/Home'
import Products       from './pages/customer/Products'
import ProductDetails from './pages/customer/ProductDetails'
import Cart           from './pages/customer/Cart'
import Checkout       from './pages/customer/Checkout'
import { Login, Register } from './pages/customer/Auth'
import { Orders, OrderDetails } from './pages/customer/Orders'
import Profile        from './pages/customer/Profile'

// Admin pages
import AdminDashboard  from './pages/admin/AdminDashboard'
import AdminProducts   from './pages/admin/AdminProducts'
import { CreateProduct, EditProduct } from './pages/admin/ProductForm'
import AdminOrders     from './pages/admin/AdminOrders'
import AdminUsers      from './pages/admin/AdminUsers'

// Customer layout wrapper
const CustomerLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
)

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <ProductProvider>
          <OrderProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: { background: '#1a1a1a', color: '#f5f5f5', border: '1px solid #2a2a2a', fontFamily: "'DM Sans', sans-serif" },
                success: { iconTheme: { primary: '#3b82f6', secondary: '#fff' } },
                error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                duration: 3000,
              }}
            />

            <Routes>
              {/*  Customer routes  */}
              <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
              <Route path="/products" element={<CustomerLayout><Products /></CustomerLayout>} />
              <Route path="/products/:id" element={<CustomerLayout><ProductDetails /></CustomerLayout>} />
              <Route path="/cart" element={<CustomerLayout><Cart /></CustomerLayout>} />
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected customer routes */}
              <Route path="/checkout" element={
                <ProtectedRoute><CustomerLayout><Checkout /></CustomerLayout></ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute><CustomerLayout><Orders /></CustomerLayout></ProtectedRoute>
              } />
              <Route path="/orders/:id" element={
                <ProtectedRoute><CustomerLayout><OrderDetails /></CustomerLayout></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><CustomerLayout><Profile /></CustomerLayout></ProtectedRoute>
              } />

              {/*  Admin routes  */}
              <Route path="/admin" element={
                <AdminRoute><AdminLayout /></AdminRoute>
              }>
                <Route index         element={<AdminDashboard />} />
                <Route path="products"               element={<AdminProducts />} />
                <Route path="products/create"        element={<CreateProduct />} />
                <Route path="products/edit/:id"      element={<EditProduct />} />
                <Route path="orders"                 element={<AdminOrders />} />
                <Route path="users"                  element={<AdminUsers />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={
                <CustomerLayout>
                  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <p className="font-mono text-8xl text-brand-500 font-black">404</p>
                    <h2 className="font-display text-2xl font-bold">Page not found</h2>
                    <a href="/" className="btn-primary">Go Home</a>
                  </div>
                </CustomerLayout>
              } />
            </Routes>
          </OrderProvider>
        </ProductProvider>
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App

