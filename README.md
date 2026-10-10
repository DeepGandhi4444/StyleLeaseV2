# StyleLease - Full MERN Stack Fashion Rental Platform

StyleLease is a full-stack MERN (MongoDB, Express, React, Node.js) web application designed for mobile fashion rentals.

---

## 🏗 Architecture

- **Database**: MongoDB (Local service running on `mongodb://127.0.0.1:27017/stylelease`)
- **Backend API**: Node.js & Express (`backend/`, port `5000`)
  - Mongoose models: `User`, `Product`, `Order`
  - Authentication: JWT (JSON Web Tokens) with `bcryptjs` password hashing
  - REST Endpoints for Authentication, Products, Orders, and Profile
- **Frontend**: React 18 (`frontend/`, port `3000`)
  - Mobile-first interface with PrimeReact UI components
  - Fuse.js client-side search integrated with live MongoDB products
  - Shopping cart with persistent state and checkout order creation
  - User profile with order history directly from MongoDB

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
*(Or run `npm install` inside both `backend/` and `frontend/`)*

### 3. Seed Database
Populate MongoDB with initial users, products, and a sample order:
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
  *(React app opens at http://localhost:3000)*

---

## 🔑 Demo Accounts

The database is pre-seeded with existing accounts (passwords securely hashed with bcrypt):

| Name | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| Deep | `deep@example.com` | `password123` | Admin |
| Mrunal | `mrunal@example.com` | `password456` | User |
| Dipanjan | `dipanjan@example.com` | `password789` | User |
| Tanishk | `tanishk@example.com` | `password101` | User |
| Yash | `yash@example.com` | `password202` | User |

*You can also register a new account on the Sign Up page.*

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user & get JWT token
- `GET /api/auth/profile` - Protected route returning current user profile

### Products (`/api/products`)
- `GET /api/products` - Fetch all products (supports query params: `keyword`, `category`, `isSpecial`, `isLatest`)
- `GET /api/products/:id` - Fetch single product details by MongoDB ID
- `POST /api/products` - Add product (admin)

### Orders (`/api/orders`)
- `POST /api/orders` - Place an order during checkout
- `GET /api/orders/myorders?email=...` - Get user order history

### Health
- `GET /api/health` - API and database health status
"# StyleLeaseV2" 
