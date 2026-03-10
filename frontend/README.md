# ⚡ SwiftBasket Frontend

Modern eCommerce frontend for SwiftBasket, built with React + Vite + TailwindCSS.

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary color | `#f97316` (brand-500) |
| Surface | `#0f0f0f` dark background |
| Card | `#1a1a1a` |
| Display font | **Syne** (headings) |
| Body font | **DM Sans** |
| Mono font | **DM Mono** |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env

# Start dev server (localhost:3000)
npm run dev

# Build for production
npm run build
```

### Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📁 Project Structure

```
src/
├── App.jsx                    # Route tree
├── AdminLayout.jsx            # Admin shell with sidebar
├── index.css                  # Global styles + Tailwind layers
├── context/
│   ├── AuthContext.jsx        # Auth state + login/logout
│   ├── CartContext.jsx        # Cart state + API sync
│   ├── ProductContext.jsx     # Product list + search
│   └── OrderContext.jsx       # Orders state
├── services/
│   ├── api.js                 # Axios instance + interceptors
│   ├── authService.js
│   ├── productService.js
│   ├── cartService.js
│   └── orderService.js
├── components/
│   ├── common/
│   │   ├── Loader.jsx         # Spinner + skeletons
│   │   ├── Pagination.jsx
│   │   ├── SearchBar.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── CategoryCard.jsx
│   │   ├── CartItem.jsx
│   │   ├── BannerSlider.jsx
│   │   └── ProtectedRoute.jsx
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   └── admin/
│       └── AdminSidebar.jsx
├── pages/
│   ├── customer/
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx       # Razorpay integration
│   │   ├── Auth.jsx           # Login + Register
│   │   ├── Orders.jsx         # List + Detail
│   │   └── Profile.jsx
│   └── admin/
│       ├── AdminDashboard.jsx # Charts + stats
│       ├── AdminProducts.jsx
│       ├── ProductForm.jsx    # Create + Edit
│       ├── AdminOrders.jsx
│       └── AdminUsers.jsx
└── hooks/
    └── index.js               # Re-exports useAuth, useCart
```

---

## 🔐 Authentication Flow

1. User logs in → JWT stored in `localStorage` + HTTP-only cookie
2. `AuthContext` attaches token to every Axios request via interceptor
3. 401 responses trigger `auth:logout` event → context clears state
4. `ProtectedRoute` checks `user` and redirects to `/login` if null
5. `AdminRoute` additionally checks `user.role === 'admin'`

---

## 🛒 Cart Flow

1. Cart is synced with backend on every user session
2. `CartContext` exposes `addToCart`, `updateQuantity`, `removeFromCart`
3. Item count badge on Navbar updates reactively
4. Cart is cleared after successful checkout

---

## 💳 Razorpay Payment Flow

1. Customer fills shipping form in Checkout
2. On submit: `POST /api/orders` to create order
3. Then: `POST /api/payment/process` to get `razorpayOrderId`
4. Razorpay Checkout completes payment
5. Redirects to `/orders/:id` on success

---

## 🎛️ Admin Features

| Feature | Route |
|---|---|
| Dashboard + charts | `/admin` |
| Product list | `/admin/products` |
| Create product | `/admin/products/create` |
| Edit product | `/admin/products/edit/:id` |
| All orders + status update | `/admin/orders` |
| User management | `/admin/users` |

---

## 🧩 Key Component Patterns

### Skeleton Loading
```jsx
import { ProductSkeleton, TableSkeleton } from './components/common/Loader'

{loading ? <ProductSkeleton /> : <ProductCard product={p} />}
```

### Protected Routes
```jsx
<Route path="/orders" element={
  <ProtectedRoute><Orders /></ProtectedRoute>
} />
```

### Toast notifications
```jsx
import toast from 'react-hot-toast'
toast.success('Item added!')
toast.error('Something went wrong')
```




