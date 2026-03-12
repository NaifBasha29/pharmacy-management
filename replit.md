# PharmaCare - Pharmacy Management System

## Overview
A full-stack pharmacy management system with:
- **Frontend**: React + Vite (client/) - runs on port 5000
- **Backend**: Express.js + Socket.io (server/) - runs on port 5005
- **Database**: MongoDB Atlas (cloud-hosted)
- **Mobile**: Expo (mobile/) - not configured in Replit workflows

## Architecture
- Multi-role system: Super Admin, Pharmacist, Clinic, Patient
- Real-time notifications via Socket.io
- JWT authentication with refresh tokens
- File uploads (prescriptions) via Multer
- Email OTP via Gmail SMTP

## Project Structure
```
client/       React + Vite frontend
server/       Express.js backend API
mobile/       Expo React Native app (not set up in Replit)
```

## Workflows
- **Start application**: `cd client && npm run dev` → port 5000 (webview)
- **Backend API**: `cd server && npm run dev` → port 5005 (console)

## Key Configuration
- **Vite proxy**: `/api` → `http://localhost:5005`
- **MongoDB**: Atlas cluster (credentials in `server/.env`)
- **CORS**: Set to `origin: true` to accept all origins (Replit proxy compatible)
- **Vite host**: `0.0.0.0` with `allowedHosts: true` for Replit iframe proxy

## Server Environment (`server/.env`)
- PORT=5005
- MONGODB_URI=mongodb+srv://... (Atlas)
- JWT_SECRET / JWT_REFRESH_SECRET
- GMAIL_USER / GMAIL_APP_PASSWORD (for OTP emails)

## API Routes
- `/api/auth` - Authentication
- `/api/users` - User management
- `/api/medicines` - Medicine inventory
- `/api/orders` - Orders
- `/api/prescriptions` - Prescriptions
- `/api/categories` - Categories
- `/api/suppliers` - Suppliers
- `/api/patients` - Patient records
- `/api/analytics` - Analytics/reports
- `/api/settings` - System settings
- `/api/audit-logs` - Audit trail
- `/api/support` - Support tickets
- `/api/clinics` - Clinic management
- `/api/favorites` - Favorites
- `/api/reviews` - Reviews
- `/api/home-medicines` - Home medicine delivery
- `/api/refills` - Prescription refills
- `/api/ai` - AI features
- `/api/payments` - Payments
