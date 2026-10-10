# StyleLease - Full MERN Stack Fashion Rental Platform

StyleLease is a full-stack MERN (MongoDB, Express, React, Node.js) web application designed for online footwear and fashion rentals.

---

## 🏗 Architecture

- **Database**: MongoDB (Local service running on `mongodb://127.0.0.1:27017/stylelease`)
- **Backend API**: Node.js & Express (`backend/`, port `5000`)
  - Mongoose models: `User`, `Product`, `Order`
  - Authentication: JWT (JSON Web Tokens) with `bcryptjs` password hashing
  - Dynamic in-memory & database Admin Access Whitelist
  - REST Endpoints for Authentication, Products, Orders, and Profile
- **Frontend**: React 18 + Vite 5 (`frontend/`, port `3000`)
  - Centralized Axios client (`src/services/api.js`) with automatic JWT interceptors
  - Mobile-first, responsive interface with Lucide React icons
  - Keyboard navigation for product search with arrow-key traversal
  - Shoe rental booking with INR (`₹`) pricing, duration selector (3–14 days), condition tracking, and return date calculation
  - Delivery pincode serviceability checker
  - Saved multi-address checkout with OTP verification (`123456`) and demo payment processing

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18+ or v20+)
- **MongoDB** (v4.4+ installed and running on port 27017)
  - Verify MongoDB service is running:
    ```powershell
    Get-Service -Name MongoDB
    ```

### 2. Install Dependencies
Run from the project root:
```bash
npm run install-all
```
*(Or run `npm install` inside root, `backend/`, and `frontend/`)*

### 3. Seed Database
Populate MongoDB with initial footwear products, users, and authorized admin accounts:
```bash
npm run seed
```

### 4. Start the Application
Run both backend and frontend concurrently with a single command from the project root:
```bash
npm run dev
```

Or run them individually in separate terminals:
- **Backend**:
  ```bash
  npm run server:dev
  ```
  *(API runs at http://localhost:5000)*
- **Frontend**:
  ```bash
  npm run client
  ```
  *(Vite React app opens at http://localhost:3000)*

---

## 🔑 Demo & Admin Accounts

The database is pre-seeded with existing accounts (passwords securely hashed with bcrypt):

| Name | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| Deep (Admin) | `deep@stylelease.com` | `password123` | Authorized Admin |
| Tanvi (Admin) | `tanvi@stylelease.com` | `password123` | Authorized Admin |
| Deep | `deep@example.com` | `password123` | Admin |
| Mrunal | `mrunal@example.com` | `password456` | User |
| Dipanjan | `dipanjan@example.com` | `password789` | User |
| Tanishk | `tanishk@example.com` | `password101` | User |
| Yash | `yash@example.com` | `password202` | User |

*You can also register a new account on the Sign Up page.*

---

## 🛡️ Admin Portal (`/admin`)

- **Direct URL Access Only**: The admin console is protected and accessible exclusively at `/admin` (no UI navigation buttons exposed).
- **Authorized Root Admins**:
  - `deep@stylelease.com` (`password123`)
  - `tanvi@stylelease.com` (`password123`)
- **Capabilities**:
  - **Catalog Management**: Add, edit, and delete footwear items.
  - **Rental & Return Tracking**: Mark item returns, inspect shoe wear & age, and calculate overdue penalties dynamically.
  - **MIS & Sales Analytics**: Live revenue metrics, active rental count, and return status indicators.
  - **Access Control**: Add or remove authorized admin email addresses directly from the console.

---

## ⚡ Real-Time Concurrent Load Testing

A standalone load testing suite is included to simulate multi-user concurrent logins under heavy load:

```bash
npm run test:load
```

- Simulates virtual concurrent users against the live authentication endpoint.
- Measures response times, error rates, and server throughput.
- Visual interactive dashboard available at `load_test/dashboard.html`.

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user & get JWT token
- `GET /api/auth/profile` - Protected route returning current user profile
- `GET /api/auth/admin-whitelist` - List authorized admin emails (Admin protected)
- `POST /api/auth/admin-whitelist` - Grant admin privileges to an email
- `DELETE /api/auth/admin-whitelist/:email` - Revoke admin privileges

### Products (`/api/products`)
- `GET /api/products` - Fetch all products (supports query params: `keyword`, `category`, `isSpecial`, `isLatest`)
- `GET /api/products/:id` - Fetch single product details by MongoDB ID
- `POST /api/products` - Add product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders (`/api/orders`)
- `POST /api/orders` - Place an order during checkout
- `GET /api/orders/myorders?email=...` - Get user order history
- `GET /api/orders` - Fetch all orders (admin)
- `PUT /api/orders/:id/return` - Mark rented footwear as returned & calculate penalty (admin)

### Health
- `GET /api/health` - API and database health status