# Pharmacy Management System

A comprehensive MERN stack pharmacy management application with role-based access control.

## 📦 Project Structure

```
pharmacy-management/
├── server/                 # Backend (Express.js + MongoDB)
│   ├── config/            # Database & Socket configuration
│   ├── middleware/        # Auth, validation, error handling
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API endpoints
│   ├── utils/             # Seeder and helpers
│   └── server.js          # Entry point
├── client/                # Frontend (React.js + Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Auth & Notification contexts
│   │   ├── pages/         # Admin, Pharmacist, User pages
│   │   ├── services/      # API service
│   │   └── styles/        # Global CSS
│   └── index.html
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)

### 1. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure Environment

Create `server/.env` (already done with defaults):

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pharmacy_management
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

### 3. Seed Database

```bash
cd server
npm run seed
```

### 4. Run Application

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Open <http://localhost:5173> in your browser.

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | <admin@pharmacy.com> | Admin@123 |
| Pharmacist | <pharmacist1@pharmacy.com> | Pharma@123 |
| User | <user1@example.com> | User@123 |

## ✨ Features

### Admin Dashboard

- User management (CRUD)
- Inventory oversight
- Sales analytics
- System settings
- Audit logs

### Pharmacist Dashboard

- Medicine dispensing
- Prescription verification
- Patient records
- Low-stock alerts
- Restock orders

### User Dashboard

- Medicine catalog
- Order placement
- Order tracking
- Prescription upload
- Profile management

## 🔌 API Endpoints

| Resource | Endpoint |
|----------|----------|
| Auth | `/api/auth` |
| Users | `/api/users` |
| Medicines | `/api/medicines` |
| Orders | `/api/orders` |
| Prescriptions | `/api/prescriptions` |
| Categories | `/api/categories` |
| Suppliers | `/api/suppliers` |
| Analytics | `/api/analytics` |
| Settings | `/api/settings` |

## 📱 Technology Stack

- **Frontend**: React.js, React Router, Axios, Socket.io-client
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB with Mongoose
- **Auth**: JWT tokens, bcryptjs
- **Styling**: Custom CSS with design system
