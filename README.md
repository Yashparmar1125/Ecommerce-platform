

# 🛍️ Modern E-Commerce Platform

<div align="center">

**A robust, scalable e-commerce solution featuring a RESTful Django backend and a dynamic React frontend.**

[Report Bug](https://www.google.com/search?q=https://github.com/yourusername/repo/issues) · [Request Feature](https://www.google.com/search?q=https://github.com/yourusername/repo/issues)

</div>

---

## 📚 Overview

This project is a fully-featured e-commerce platform designed for performance and scalability. The backend is powered by **Django Rest Framework (DRF)**, ensuring secure and efficient API endpoints, while the frontend is built with **React** to deliver a seamless, responsive user experience.

The system includes comprehensive modules for user authentication, product management, shopping carts, order processing, and payments.

---

## ✨ Key Features

### 🔌 Backend (Django API)

* **🔐 Authentication & Users**: Secure JWT Authentication (Access/Refresh tokens) via `simplejwt`.
* **📦 Product Management**: Full CRUD operations for products, SKUs, and categories.
* **⭐ Product Reviews & Ratings**: Rich review system with verified purchase badge, helpful votes, and rating breakdowns per product.
* **🏷️ Coupons & Discounts**: Powerful coupon engine with percentage/fixed discounts, validity windows, usage limits, and per-user tracking.
* **🛒 Shopping Cart**: Persistent cart management for authenticated and guest users.
* **❤️ Wishlist**: Functionality for users to save items for later.
* **💳 Payments & Orders**: Integrated order processing and payment gateways.
* **🩺 Health Checks**: Dedicated health endpoint with uptime, DB latency, resource usage, and feature flags.
* **📃 API Documentation**: Custom, human-friendly API docs UI served from the Django backend.

### 💻 Frontend (React)

* **⚡ Modern UI**: Built with React functional components and hooks.
* **📱 Responsive**: Mobile-first design for all devices.
* **🔄 State Management**: Efficient data handling for cart and user sessions.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| --- | --- | --- |
| **Backend Framework** | Django 5.2 | High-level Python web framework. |
| **API Toolkit** | DRF 3.16 | Powerful toolkit for Web APIs. |
| **Authentication** | SimpleJWT | JSON Web Token authentication. |
| **Database** | SQLite / PostgreSQL | Default SQLite for dev; pluggable for Prod. |
| **Documentation** | Custom Tailwind Docs | Static API docs UI powered by Django templates. |
| **Frontend** | React | JavaScript library for building user interfaces. |

---

## 📂 Project Structure

```ascii
Ecommerce-DRF/
│
├── ⚙️ Backend/                          # Django REST Framework API Server
│   ├── 📂 api/                          # API Layer
│   │   ├── __init__.py
│   │   └── 📂 v1/                       # API Version 1
│   │       ├── __init__.py
│   │       ├── views.py                 # API docs view handlers
│   │       ├── urls.py                  # Main API router
│   │       ├── 📂 admin/                # Admin API endpoints
│   │       │   ├── permissions.py      # Admin permission classes
│   │       │   ├── serializers.py      # Admin serializers
│   │       │   ├── services.py         # Admin business logic
│   │       │   ├── urls.py
│   │       │   └── views.py            # Admin CRUD views
│   │       ├── 📂 cart/                 # Shopping Cart API
│   │       │   ├── serializer.py
│   │       │   ├── urls.py
│   │       │   └── views.py
│   │       ├── 📂 health/               # Health Check API
│   │       │   ├── serializer.py
│   │       │   ├── urls.py
│   │       │   └── views.py            # System status endpoint
│   │       ├── 📂 orders/               # Order Management API
│   │       │   ├── serializer.py
│   │       │   ├── services.py         # Order processing logic
│   │       │   ├── urls.py
│   │       │   └── views.py
│   │       ├── 📂 payments/             # Payment Processing API
│   │       │   ├── serializer.py
│   │       │   ├── urls.py
│   │       │   └── views.py
│   │       ├── 📂 products/             # Product Catalog API
│   │       │   ├── serializer/         # Modular serializers
│   │       │   │   ├── category.py
│   │       │   │   ├── coupon.py
│   │       │   │   ├── product.py
│   │       │   │   ├── review.py
│   │       │   │   └── sku.py
│   │       │   ├── services.py         # Product business logic
│   │       │   ├── urls.py
│   │       │   └── 📂 views/           # View modules
│   │       │       ├── admin.py        # Admin product views
│   │       │       ├── coupons.py      # Coupon endpoints
│   │       │       ├── public.py       # Public product endpoints
│   │       │       ├── reviews.py      # Review endpoints
│   │       │       └── sku.py          # SKU management
│   │       └── 📂 users/                # User & Auth API
│   │           ├── serializer.py
│   │           ├── services.py         # Auth business logic
│   │           ├── urls.py
│   │           └── views.py
│   │
│   ├── 📂 apps/                          # Django Applications (Business Logic)
│   │   ├── __init__.py
│   │   ├── 📂 cart/                      # Shopping Cart App
│   │   │   ├── admin.py
│   │   │   ├── models.py                # Cart & CartItem models
│   │   │   ├── migrations/
│   │   │   └── tests.py
│   │   ├── 📂 orders/                    # Order Management App
│   │   │   ├── admin.py
│   │   │   ├── models.py                # Order & OrderItem models
│   │   │   ├── migrations/
│   │   │   └── tests.py
│   │   ├── 📂 payments/                  # Payment Processing App
│   │   │   ├── admin.py
│   │   │   ├── models.py                # Payment models
│   │   │   ├── migrations/
│   │   │   └── tests.py
│   │   ├── 📂 products/                  # Product Catalog App
│   │   │   ├── admin.py
│   │   │   ├── models.py                # Product, SKU, Category, Review, Coupon models
│   │   │   ├── migrations/
│   │   │   ├── 📂 management/commands/  # Django management commands
│   │   │   │   └── bulk_create_products.py
│   │   │   └── tests.py
│   │   ├── 📂 users/                     # User Management App
│   │   │   ├── admin.py
│   │   │   ├── models.py                # Custom User & Address models
│   │   │   ├── migrations/
│   │   │   └── tests.py
│   │   └── 📂 wishlist/                  # Wishlist App
│   │       ├── admin.py
│   │       ├── models.py                # Wishlist model
│   │       ├── migrations/
│   │       └── tests.py
│   │
│   ├── 📂 config/                        # Django Project Configuration
│   │   ├── __init__.py
│   │   ├── asgi.py                       # ASGI config
│   │   ├── urls.py                       # Root URL configuration
│   │   ├── wsgi.py                       # WSGI config
│   │   └── 📂 settings/                 # Environment-specific settings
│   │       ├── __init__.py
│   │       ├── base.py                  # Base settings (shared)
│   │       ├── local.py                 # Local development settings
│   │       └── production.py            # Production settings
│   │
│   ├── 📂 static/                        # Static Files (CSS, JS, Images)
│   │   ├── favicon.ico                  # API docs favicon
│   │   ├── 📂 js/
│   │   │   └── api-docs.js             # API docs JavaScript
│   │   └── 📂 sections/                 # API docs HTML sections
│   │       ├── admin.html
│   │       ├── authentication.html
│   │       ├── introduction.html
│   │       ├── orders.html
│   │       ├── products.html
│   │       └── users.html
│   │
│   ├── 📂 templates/                     # Django Templates
│   │   ├── base.html                    # API docs base template
│   │   └── 📂 sections/                 # API docs section templates
│   │       ├── admin.html
│   │       ├── authentication.html
│   │       ├── introduction.html
│   │       ├── orders.html
│   │       ├── products.html
│   │       └── users.html
│   │
│   ├── 📄 manage.py                      # Django management script
│   ├── 📄 db.sqlite3                     # SQLite database (dev)
│   ├── 📄 requirements.txt              # Python dependencies
│   ├── 📄 products_sample.json          # Sample product data
│   ├── 📄 health.html                    # Health check HTML
│   ├── 📄 BACKEND_FEATURES_SUMMARY.md   # Backend features documentation
│   └── 📄 BULK_PRODUCTS_README.md       # Bulk product creation guide
│
├── 💻 Client/                            # React Frontend Application
│   ├── 📂 public/                        # Static assets served as-is
│   │   ├── favicon.ico
│   │   ├── vite.svg
│   │   └── 📂 assets/images/            # Product images, banners, icons
│   │
│   ├── 📂 src/                           # React source code
│   │   ├── 📂 api/                      # API client configuration
│   │   │   └── axios.api.ts            # Axios instance & interceptors
│   │   ├── 📂 components/               # React components
│   │   │   ├── 📂 admin/               # Admin dashboard components
│   │   │   ├── AdminLogin.tsx
│   │   │   ├── BannerCarousel.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── CategorySection.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── LoginModal.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── ScrollToTop.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── SessionExpiredModal.tsx
│   │   │   └── SkeletonLoader.tsx
│   │   ├── 📂 context/                 # React Context providers
│   │   │   ├── AppProviders.tsx
│   │   │   ├── AuthContext.tsx         # Authentication state
│   │   │   ├── CartContext.tsx         # Shopping cart state
│   │   │   ├── CouponContext.tsx      # Coupon state
│   │   │   └── ProductsContext.tsx    # Products state
│   │   ├── 📂 layouts/                 # Layout components
│   │   │   └── Layout.tsx
│   │   ├── 📂 pages/                   # Page components
│   │   │   ├── AdminPage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── OrderDetailPage.tsx
│   │   │   ├── ProductDetailPage.tsx
│   │   │   ├── ProductListingPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── 📂 services/                # API service functions
│   │   │   ├── couponService.ts
│   │   │   └── productService.ts
│   │   ├── 📂 types/                    # TypeScript type definitions
│   │   │   ├── admin.ts
│   │   │   └── index.ts
│   │   ├── 📂 utils/                    # Utility functions
│   │   │   ├── animations.ts
│   │   │   └── errorHandler.ts         # Centralized error handling
│   │   ├── App.tsx                      # Root component
│   │   ├── main.tsx                     # Application entry point
│   │   └── style.css                   # Global styles
│   │
│   ├── 📄 index.html                    # HTML template
│   ├── 📄 package.json                  # Node.js dependencies
│   ├── 📄 package-lock.json
│   ├── 📄 tsconfig.json                 # TypeScript configuration
│   ├── 📄 vite.config.ts                # Vite build configuration
│   ├── 📄 tailwind.config.js           # Tailwind CSS configuration
│   ├── 📄 postcss.config.js            # PostCSS configuration
│   └── 📄 ERROR_HANDLING_SUMMARY.md     # Error handling documentation
│
├── 📄 README.md                         # Project documentation (this file)
├── 📄 FRONTEND_ADMIN_UPDATES_SUMMARY.md # Frontend admin features summary
└── 📄 .gitignore                        # Git ignore rules

```

### 📋 Key Directories Explained

**Backend (`Backend/`):**
- **`api/v1/`**: REST API endpoints organized by feature (products, users, orders, admin, etc.)
- **`apps/`**: Django apps containing models, migrations, and business logic
- **`config/`**: Django project settings split by environment (base, local, production)
- **`static/`**: Static files served by Django (JS, CSS, favicon, API docs sections)
- **`templates/`**: Django HTML templates for API documentation

**Frontend (`Client/`):**
- **`src/components/`**: Reusable React components
- **`src/pages/`**: Page-level components (routes)
- **`src/context/`**: React Context API for global state management
- **`src/services/`**: API service functions for backend communication
- **`src/utils/`**: Utility functions and helpers

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

* **Python 3.10+**
* **Node.js 18+** & **npm/yarn**

### 1️⃣ Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/Ecommerce-DRF.git
cd Ecommerce-DRF/Backend

```


2. **Create and activate a virtual environment**
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

```


3. **Install dependencies**
```bash
pip install -r ../requirements.txt

```


4. **Configure Environment Variables**
Create a `.env` file in the `Backend` directory:
```env
DEBUG=True
SECRET_KEY=your_secret_key_here
ALLOWED_HOSTS=localhost,127.0.0.1
# Add Database URL if using PostgreSQL

```


5. **Run Migrations & Start Server**
```bash
python manage.py migrate
python manage.py runserver

```


*The API will be available at `http://127.0.0.1:8000/*`

### 2️⃣ Frontend Setup

1. **Navigate to the Client directory**
```bash
cd ../Client

```


2. **Install dependencies**
```bash
npm install
# or
yarn install

```


3. **Start the Development Server**
```bash
npm run dev

```


*The app will run at `http://localhost:5173` (or your configured port)*

---

## 📖 API Documentation

The backend ships with a custom, interactive documentation site. Once the server is running, visit:

* **API Docs Home:** `http://localhost:8000/`

You can also inspect and explore the raw JSON responses directly from the API. Some commonly used endpoints:

### Key Public Endpoints

* `GET /api/v1/health/` – Check system and database status.
* `POST /api/v1/users/login/` – Obtain JWT access/refresh tokens.
* `POST /api/v1/users/register/` – Create a new account and receive tokens.
* `GET /api/v1/products/` – Fetch product catalog with filtering options.
* `GET /api/v1/products/<product_id>/` – Product detail including SKUs, rich details, and recent reviews.
* `GET /api/v1/products/<product_id>/reviews/` – List reviews for a product.
* `POST /api/v1/products/<product_id>/reviews/create/` – Create a review (authenticated).
* `GET /api/v1/products/coupons/` – List active and valid coupons.
* `POST /api/v1/products/coupons/validate/` – Validate a coupon and compute discount for a cart/order amount.

### Key Authenticated Endpoints

* `GET /api/v1/users/me/` – Get the current user profile.
* `GET /api/v1/users/addresses/` – Manage shipping addresses.
* `GET /api/v1/orders/` – List orders for the current user.
* `POST /api/v1/orders/` – Create a new order from cart items.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.