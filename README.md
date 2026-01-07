

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
Ecommerce-Platform/
├── ⚙️ Backend/                 # Django API Server
│   ├── 📂 api/v1/              # API Version 1 Endpoints
│   │   ├── 🩺 health/          # System Health Checks
│   │   ├── 📦 products/        # Product Catalog API
│   │   └── 👤 users/           # User Auth API
│   ├── 📂 apps/                # Core Business Logic
│   │   ├── cart/               # Shopping Cart Logic
│   │   ├── orders/             # Order Processing
│   │   ├── payments/           # Payment Integration
│   │   └── wishlist/           # User Wishlist
│   ├── 📂 config/              # Project Settings (Base, Local, Prod)
│   └── 📄 manage.py            # Django Entry Point
│
├── 💻 Client/                  # React Frontend Application
│   ├── 📂 src/
│   └── 📂 public/
│
└── 📄 requirements.txt         # Python Dependencies

```

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