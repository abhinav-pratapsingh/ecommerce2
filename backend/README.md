# 🛒 eCommerce Backend API

Production-ready eCommerce REST API built with the MERN stack (Node.js, Express, MongoDB, Mongoose).

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 18 |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + HTTP-only Cookies |
| Payments | Razorpay |
| Images | Cloudinary |
| Security | Helmet, Rate Limiting, CORS, XSS, HPP, Mongo Sanitize |

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in your values in .env
```

### 3. Seed sample data (optional)
```bash
node utils/seeder.js --seed
```

### 4. Start the server
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

---

## 📁 Project Structure

```
backend/
├── server.js              # Entry point — starts HTTP server
├── app.js                 # Express app — middleware & routes
├── config/
│   ├── database.js        # MongoDB connection
│   ├── cloudinary.js      # Cloudinary SDK setup
│   └── razorpay.js        # Razorpay SDK setup
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Order.js
│   ├── Cart.js
│   └── Review.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── productController.js
│   ├── cartController.js
│   ├── orderController.js
│   ├── reviewController.js
│   ├── paymentController.js
│   └── adminController.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── productRoutes.js
│   ├── categoryRoutes.js
│   ├── cartRoutes.js
│   ├── orderRoutes.js
│   ├── reviewRoutes.js
│   ├── paymentRoutes.js
│   └── adminRoutes.js
├── middleware/
│   ├── authMiddleware.js  # protect + authorize
│   ├── errorHandler.js    # Global error handler
│   ├── asyncHandler.js    # Async wrapper
│   └── uploadMiddleware.js
├── services/
│   ├── orderService.js
│   └── productService.js
└── utils/
    ├── jwtUtils.js
    ├── apiUtils.js        # ApiError + ApiResponse
    ├── queryBuilder.js    # Filter/sort/paginate helper
    └── seeder.js
```

---

## 🔐 Authentication

JWT tokens are stored in **HTTP-only cookies** (not accessible from JavaScript).

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/register` | POST | ❌ | Register new account |
| `/api/auth/login` | POST | ❌ | Login |
| `/api/auth/logout` | POST | ✅ | Logout |
| `/api/auth/profile` | GET | ✅ | Get own profile |

### Request body examples

**Register**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass123"
}
```

**Login**
```json
{
  "email": "jane@example.com",
  "password": "SecurePass123"
}
```

---

## 🛍️ Customer API

### Products
| Endpoint | Method | Description |
|---|---|---|
| `/api/products` | GET | List products (filter, sort, paginate) |
| `/api/products/:id` | GET | Get product details |
| `/api/products/search` | GET | Search products |

**Query params for /api/products:**
- `page`, `limit` — Pagination
- `sort` — Field sort (e.g. `-price`, `ratings`)
- `category` — Filter by category ID
- `price[gte]`, `price[lte]` — Price range
- `search` — Text search

### Cart
| Endpoint | Method | Body | Description |
|---|---|---|---|
| `/api/cart` | GET | — | Get cart |
| `/api/cart/add` | POST | `{ productId, quantity }` | Add item |
| `/api/cart/update` | PUT | `{ productId, quantity }` | Update quantity |
| `/api/cart/remove/:productId` | DELETE | — | Remove item |
| `/api/cart/clear` | DELETE | — | Clear cart |

### Orders
| Endpoint | Method | Description |
|---|---|---|
| `/api/orders` | POST | Place order from cart |
| `/api/orders/myorders` | GET | Get own orders |
| `/api/orders/:id` | GET | Get order details |

### Reviews
| Endpoint | Method | Description |
|---|---|---|
| `/api/reviews` | POST | Submit review (must have purchased) |
| `/api/reviews/:productId` | GET | Get product reviews |
| `/api/reviews/:id` | DELETE | Delete own review |

---

## 🔧 Admin API

All admin endpoints require `Authorization: Bearer <token>` or cookie, and `role: admin`.

### Products
| Endpoint | Method | Description |
|---|---|---|
| `/api/admin/products` | GET | List all products |
| `/api/admin/products` | POST | Create product |
| `/api/admin/products/:id` | PUT | Update product |
| `/api/admin/products/:id` | DELETE | Delete product + images |
| `/api/admin/products/:id/images` | POST | Upload images (multipart) |
| `/api/admin/products/images/remove` | DELETE | Remove specific image |

### Categories
| Endpoint | Method | Description |
|---|---|---|
| `/api/admin/categories` | GET/POST | List / Create |
| `/api/admin/categories/:id` | PUT/DELETE | Update / Delete |

### Orders
| Endpoint | Method | Description |
|---|---|---|
| `/api/admin/orders` | GET | All orders |
| `/api/admin/orders/:id` | PUT | Update order status |

### Users
| Endpoint | Method | Description |
|---|---|---|
| `/api/admin/users` | GET | All users |
| `/api/admin/users/:id` | PUT/DELETE | Update / Deactivate |

### Analytics
| Endpoint | Method | Description |
|---|---|---|
| `/api/admin/stats` | GET | Dashboard stats |

**Stats response includes:**
- Total users, products, orders, revenue
- Orders grouped by status
- 5 most recent orders
- Top 5 selling products
- Monthly sales for last 6 months

---

## 💳 Payment Flow

1. Customer creates an order: `POST /api/orders`
2. Frontend requests a payment order: `POST /api/payment/process` with `{ orderId }`
3. Backend returns `razorpayOrderId` + `keyId`
4. Frontend opens Razorpay Checkout
5. Razorpay sends webhook to `POST /api/payment/webhook`
6. Backend updates order status to `processing`

---

## 🖼️ Image Upload

Images are uploaded via `multipart/form-data`.

**Upload product images:**
```
POST /api/admin/products/:id/images
Content-Type: multipart/form-data
Field: images (up to 10 files)
```

Each image is stored on Cloudinary; the database stores `{ url, public_id }`.  
Images are automatically deleted from Cloudinary when a product is deleted.

---

## 🛡️ Security Features

- **bcrypt** password hashing (12 salt rounds)
- **JWT** in HTTP-only cookies (not accessible to JS)
- **Helmet** HTTP security headers
- **Rate limiting** — 100 req/15min globally, 20 req/15min on auth routes
- **CORS** restricted to configured frontend URL
- **XSS Clean** — sanitizes input against script injection
- **Mongo Sanitize** — prevents NoSQL injection
- **HPP** — prevents HTTP parameter pollution
- **Role-based access control** — `protect` + `authorize` middleware chain

---

## ⚙️ Environment Variables

```env
PORT=5000
NODE_ENV=development

DB_URI=mongodb://localhost:27017/ecommerce

JWT_SECRET=your_secret_here
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
RAZORPAY_CURRENCY=INR

CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:3000
```

---

## 🌱 Seeder

```bash
# Seed sample data (admin + categories + products)
node utils/seeder.js --seed

# Clear all data
node utils/seeder.js --destroy
```

**Default admin credentials after seeding:**
- Email: `admin@ecommerce.com`
- Password: `Admin@123456`
