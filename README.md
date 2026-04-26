# 💊 PharmaCare – Pharmacy Management System

**PharmaCare** is a full-stack, multi-role pharmacy management platform built with the MERN stack (MongoDB, Express.js, React, Node.js) and a React Native mobile app. It connects **Admins**, **Clinics**, **Pharmacists**, and **Patients** into a single seamless system for medication ordering, prescription management, inventory tracking, and real-time notifications.

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#-architecture)
- [Folder Structure](#-folder-structure)
- [Technology Stack](#-technology-stack)
- [Features by Role](#-features-by-role)
- [Database Models](#-database-models)
- [API Endpoints](#-api-endpoints)
- [Getting Started](#-getting-started)
- [Test Credentials](#-test-credentials)
- [Diagrams](#-diagrams)
- [Roadmap (Next-Level Updates)](#-roadmap-next-level-updates)

---

## 🏥 Project Overview

PharmaCare digitises the complete pharmacy workflow:

| Stakeholder | Core Goal |
|-------------|-----------|
| **Admin** | Oversee clinics, inventory, orders, reports, and audit compliance |
| **Clinic** | Manage enrolled patients, create prescriptions, track orders |
| **Pharmacist** | Verify prescriptions, fulfil orders, manage stock |
| **Patient** | Browse medicines, place orders, upload prescriptions, track delivery |

**Key highlights:**

- Role-based access control (RBAC) with JWT authentication
- Real-time notifications and order updates via Socket.io
- Prescription upload and multi-stage verification workflow
- Inventory management with low-stock and expiry alerts
- Clinic enrolment and multi-tenant patient management
- Audit logging for compliance and security
- Support ticket system
- React Native mobile app for patients

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  React + Vite (port 5173)    Expo React Native (mobile)         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Admin   │  │  Clinic  │  │Pharmacist│  │ Patient  │        │
│  │  Portal  │  │  Portal  │  │  Portal  │  │  Portal  │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
└───────┼─────────────┼─────────────┼──────────────┼─────────────┘
        │             │             │              │
        └─────────────┴──── REST API + Socket.io ──┘
                                │
┌───────────────────────────────┼─────────────────────────────────┐
│                     SERVER LAYER (port 5005)                     │
│  Express.js  │  JWT Middleware  │  Role Auth  │  Rate Limiter    │
│  Multer (file upload)  │  Nodemailer (OTP/email)                 │
└───────────────────────────────┼─────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │    MongoDB Atlas       │
                    │  (Mongoose ODM)        │
                    └───────────────────────┘
```

---

## 📦 Folder Structure

```
pharmacy-management/
├── client/                        # React + Vite web frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── common/            # Sidebar, TopNav, LoadingScreen
│   │   ├── context/               # AuthContext, CartContext, NotificationContext
│   │   ├── hooks/                 # useSecurityHooks
│   │   ├── pages/
│   │   │   ├── admin/             # Dashboard, Clinics, Inventory, Orders,
│   │   │   │                      # Prescriptions, Reports, Audit Logs,
│   │   │   │                      # Support, Settings
│   │   │   ├── auth/              # Login, Register (all roles)
│   │   │   ├── clinic/            # Clinic dashboard
│   │   │   ├── pharmacist/        # Pharmacist dashboard, Patients
│   │   │   └── user/              # Catalog, Dashboard, Orders,
│   │   │                          # Prescriptions, Profile, Support
│   │   ├── services/
│   │   │   └── api.js             # Centralised Axios API service
│   │   └── styles/                # Global CSS
│   └── index.html
├── server/                        # Node.js / Express backend
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── socket.js              # Socket.io setup
│   ├── middleware/
│   │   ├── auth.js                # JWT verification
│   │   ├── errorHandler.js        # Centralised error handling
│   │   ├── rateLimiter.js         # Request rate limiting
│   │   └── roleAuth.js            # Role-based authorisation
│   ├── models/                    # Mongoose schemas (see Database Models)
│   ├── routes/                    # Express route handlers (see API Endpoints)
│   ├── utils/                     # Seeder, helpers
│   └── server.js                  # App entry point
├── mobile/                        # Expo React Native app
│   ├── src/
│   │   ├── screens/               # All mobile screens
│   │   ├── services/              # mobileApi.js
│   │   ├── context/               # Auth & Cart context
│   │   └── theme/                 # Design tokens
│   └── App.js
├── PHARMACY_FEATURE_LIST.md       # Detailed feature tracker
├── system_architecture_*.png      # Architecture diagrams
├── class_diagram_*.png            # Class/ER diagrams
└── README.md
```

---

## 📱 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Web Frontend** | React 18, Vite, React Router v6, Axios, Recharts, Socket.io-client |
| **Mobile** | React Native (Expo), React Navigation |
| **Backend** | Node.js 18+, Express.js, Socket.io |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Authentication** | JWT (access + refresh tokens), bcryptjs |
| **File Uploads** | Multer |
| **Email / OTP** | Nodemailer (Gmail SMTP) |
| **Security** | Helmet, express-rate-limit, express-validator, CORS |
| **Testing** | Jest, Supertest (backend); Vitest, React Testing Library (frontend) |
| **Dev Tools** | Nodemon, ESLint |

---

## ✨ Features by Role

### 🔑 Authentication (All Roles)

- Separate login flows for Admin, Clinic, Pharmacist, and Patient
- JWT access tokens + refresh token rotation
- Email OTP verification
- Forgot / reset password
- Role-based route protection on both client and server

---

### 🛡 Admin

| Module | Features |
|--------|---------|
| **Dashboard** | KPI cards (clinics, users, medicines, orders, revenue), low-stock alerts, expiring medicines, 7-day revenue chart, system overview |
| **Clinic Management** | Enrol new clinics, view/edit clinic profiles, enable/disable accounts, document uploads, verification workflow |
| **Inventory** | Full CRUD for medicines (name, generic name, brand, category, price, stock, min stock, expiry, batch, manufacturer), low-stock filter, expiry filter |
| **Orders** | View all orders, status updates (pending → processing → dispatched → delivered), order search |
| **Prescriptions** | Verification queue, approve/reject with notes, link prescriptions to orders |
| **Reports & Analytics** | Sales reports (daily/weekly/monthly), inventory reports, top-selling medicines, revenue charts |
| **Audit Logs** | Full activity trail, filter by user/action/date |
| **Support Tickets** | View/respond/resolve tickets, priority levels |
| **Settings** | System config, notification preferences, admin profile |

---

### 🏥 Clinic

| Module | Features |
|--------|---------|
| **Dashboard** | Overview of enrolled patients, pending prescriptions, recent orders |
| **Patient Management** | View/manage enrolled patients |
| **Prescriptions** | Create and submit prescriptions for patients |
| **Order Tracking** | Monitor orders placed by clinic patients |

---

### 💊 Pharmacist

| Module | Features |
|--------|---------|
| **Dashboard** | Pending orders count, pending prescriptions, low-stock alerts, dispensed-today count |
| **Order Processing** | Order queue, fulfilment workflow (verify → check stock → pack → mark dispensed) |
| **Prescription Verification** | Verification queue, view prescription image, approve/reject with notes |
| **Inventory Access** | View stock levels, request reorder, check expiry |
| **Patients** | Patient list, patient profile, medication history |

---

### 👤 Patient / User

| Module | Features |
|--------|---------|
| **Dashboard** | Personalised greeting, stats (orders, prescriptions, delivered), quick actions, recent orders, health summary, buy-again suggestions |
| **Medicine Catalog** | Browse/search/filter/sort medicines, category filter, price-range filter, stock badges, add to cart |
| **Shopping Cart** | Cart managed via CartContext, quantity controls, item removal, price breakdown, proceed to checkout |
| **Checkout** | Delivery address, prescription upload (if Rx required), payment method selection, order confirmation |
| **Order History** | Order list with status badges, expandable order details, visual timeline, cancel/reorder |
| **Prescriptions** | Upload prescription images, view history, status tracking (pending/approved/rejected) |
| **Profile** | Personal info, health info (blood group, allergies), account settings |
| **Support** | Submit and track support tickets |

---

### 📲 Mobile App (React Native / Expo)

| Screen | Description |
|--------|-------------|
| Login / Register | Patient authentication with OTP verify |
| Forgot / Reset Password | Email-based password reset |
| Home / Dashboard | Stats cards, quick actions |
| Catalog | Browse medicines, search, filters, add to cart |
| Medicine Detail | Full product details, add to cart |
| Cart | Cart items, quantity controls, checkout button |
| Checkout | Address + payment, order placement |
| Orders | Order list with status |
| Order Detail | Expanded order info |
| Prescriptions | Upload via camera, view history |
| Favourites | Saved medicines |
| Recommendations | Personalised medicine suggestions |
| Symptom Checker | Basic symptom-to-medicine mapping |
| Chatbot | In-app support chatbot |
| Home Medicine Delivery | Schedule home delivery |
| Profile | User info, logout |
| Support | Submit support tickets |

---

## 🗄 Database Models

| Model | Key Fields |
|-------|-----------|
| **User** | name, email, password (hashed), role, isActive, refreshToken |
| **Clinic** | name, code, address, contact, status, adminUser |
| **Patient** | userId, clinicId, bloodGroup, allergies, medicalHistory |
| **Medicine** | name, genericName, brand, category, price, stock, minStock, expiryDate, batchNumber, manufacturer, requiresPrescription |
| **Category** | name, description |
| **Supplier** | name, contact, email, medicines supplied |
| **Order** | patientId, items[ ], totalAmount, status, deliveryAddress, prescriptionId, paymentMethod |
| **Prescription** | patientId, clinicId, imageUrl, status, pharmacistNotes, medicines[ ] |
| **AuditLog** | userId, action, resource, resourceId, details, ipAddress, timestamp |
| **SupportTicket** | userId, subject, message, status, priority, responses[ ] |
| **Settings** | key, value, updatedBy |
| **Review** | userId, medicineId, rating, comment |
| **Favorite** | userId, medicineId |
| **HomeMedicine** | patientId, medicines[ ], scheduleDate, status |
| **Session** | userId, token, expiresAt |

---

## 🔌 API Endpoints

| Resource | Base Path | Auth Required | Roles |
|----------|-----------|---------------|-------|
| Authentication | `/api/auth` | Partial | All |
| Users | `/api/users` | ✅ | Admin |
| Medicines | `/api/medicines` | ✅ | All (read), Admin/Pharmacist (write) |
| Categories | `/api/categories` | ✅ | All |
| Suppliers | `/api/suppliers` | ✅ | Admin |
| Orders | `/api/orders` | ✅ | All |
| Prescriptions | `/api/prescriptions` | ✅ | All |
| Patients | `/api/patients` | ✅ | Admin, Clinic, Pharmacist |
| Clinics | `/api/clinics` | ✅ | Admin, Clinic |
| Analytics | `/api/analytics` | ✅ | Admin |
| Admin Stats | `/api/admin-stats` | ✅ | Admin |
| Audit Logs | `/api/audit-logs` | ✅ | Admin |
| Support Tickets | `/api/support` | ✅ | All |
| Settings | `/api/settings` | ✅ | Admin |
| Reviews | `/api/reviews` | ✅ | Patient |
| Favorites | `/api/favorites` | ✅ | Patient |
| Home Medicine | `/api/home-medicines` | ✅ | Patient |
| Refills | `/api/refills` | ✅ | Patient |
| Payments | `/api/payments` | ✅ | All |
| AI Features | `/api/ai` | ✅ | All |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local) or a MongoDB Atlas URI
- npm v9+
- (Mobile) Expo CLI + Android Studio or Expo Go on a physical device

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/NaifBasha29/pharmacy-management.git
cd pharmacy-management

# Backend
cd server && npm install

# Web Frontend
cd ../client && npm install

# Mobile (optional)
cd ../mobile && npm install
```

### 2. Configure Environment Variables

Create `server/.env`:

```env
PORT=5005
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/pharmacy
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:5173
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5005/api
```

### 3. Seed the Database

```bash
cd server
npm run seed
```

### 4. Run the Application

```bash
# Terminal 1 – Backend API
cd server && npm run dev        # http://localhost:5005

# Terminal 2 – Web Frontend
cd client && npm run dev        # http://localhost:5173

# Terminal 3 – Mobile (optional)
cd mobile && npx expo start
```

Open <http://localhost:5173> in your browser.

---

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pharmacy.com | Admin@123 |
| Pharmacist | pharmacist1@pharmacy.com | Pharma@123 |
| Patient | user1@example.com | User@123 |

---

## 🖼 Diagrams

The repository includes the following architectural and design diagrams:

| Diagram | File |
|---------|------|
| System Architecture | `system_architecture_*.png` |
| Class / ER Diagram | `class_diagram_*.png` |
| Use Case Diagram | `use_case_diagram_*.png` |
| Data Flow Diagram | `data_flow_diagram_*.png` |
| Sequence Diagram | `sequence_diagram_*.png` |
| State Diagram | `state_diagram_*.png` |
| Clinic Enrolment Flow | `clinic_enrollment_flow_*.png` |
| User Management Flow | `user_management_flow_*.png` |
| Admin Dashboard Mockup | `admin_dashboard_mockup_*.png` |

---

## 🗺 Roadmap (Next-Level Updates)

The following improvements are planned for the next development phase:

### Phase 2 – Workflow Completion

- [ ] Complete checkout wizard (address → prescription → payment → confirmation)
- [ ] Visual order-tracking timeline for patients
- [ ] Pharmacist order-fulfilment workflow (pick → pack → dispatch)
- [ ] Prescription verification queue with image viewer for pharmacists
- [ ] Cart persistence across sessions (server-side cart)

### Phase 3 – Enhancements

- [ ] PDF/Excel report export (sales, inventory, audit logs)
- [ ] Real-time push notifications (web + mobile via Socket.io & Expo Notifications)
- [ ] Drug interaction checker
- [ ] Refill reminders and medication adherence tracker
- [ ] Barcode / QR scanning for inventory management
- [ ] Advanced search with full-text and fuzzy matching

### Phase 4 – Mobile App Expansion

- [ ] Biometric login (fingerprint / Face ID via Expo LocalAuthentication)
- [ ] Camera capture for prescription uploads
- [ ] Offline mode with local catalogue cache
- [ ] Pull-to-refresh across all list screens
- [ ] Home medicine delivery scheduling

### Phase 5 – AI & Analytics

- [ ] AI-powered medicine recommendations
- [ ] Symptom-to-medicine mapping (chatbot integration)
- [ ] Predictive inventory restocking alerts
- [ ] Patient health analytics dashboard
- [ ] Revenue forecasting charts

### Phase 6 – Security & Compliance

- [ ] Two-factor authentication (2FA) for Admin and Pharmacist
- [ ] HIPAA-aligned data encryption at rest
- [ ] Session management with device tracking
- [ ] GDPR-compliant data export / deletion for patients
- [ ] Automated audit-log retention policies

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please follow the existing code style (ESLint), write tests for new features, and update this README if you add new modules or endpoints.

---

## 📜 License

This project is for academic and demonstration purposes. All rights reserved © PharmaCare 2025–2026.
