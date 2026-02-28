# Project Custom Instructions for GitHub Copilot

This is a **React + Node.js + React Native** project called **"PharmaCare - Pharmacy Management System"**.

## Project Overview
- **Goal**: A comprehensive pharmacy management system connecting patients, clinics, pharmacists, and administrators for seamless medication ordering, prescription management, and inventory tracking.
- **Main features**: 
  - Multi-role authentication (Admin, Clinic, Pharmacist, Patient)
  - Prescription upload and management
  - Medication catalog and ordering
  - Inventory management with stock tracking
  - Clinic enrollment and management
  - Order tracking and notifications
  - Real-time dashboard analytics
  - Support ticket system
  - Audit logs and compliance reporting
- **Target users**: Pharmacy administrators, clinic staff, pharmacists, and patients in healthcare settings

## Architecture & Structure

### Folder Structure
```
pharmacy-management/
├── client/                    # React web frontend (Vite)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   └── common/        # Sidebar, TopNav, LoadingScreen
│   │   ├── context/           # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── useSecurityHooks.js
│   │   ├── pages/             # Page components by role
│   │   │   ├── admin/         # Admin dashboard & management
│   │   │   ├── auth/          # Login/Register pages
│   │   │   ├── clinic/        # Clinic-specific pages
│   │   │   ├── pharmacist/    # Pharmacist pages
│   │   │   └── user/          # Patient/user pages
│   │   ├── services/          # API service layer
│   │   │   └── api.js
│   │   ├── styles/            # Global styles
│   │   ├── App.jsx            # Main app with routing
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   └── package.json
├── server/                    # Node.js/Express backend
│   ├── config/                # Configuration files
│   │   ├── db.js              # MongoDB connection
│   │   └── socket.js          # Socket.io setup
│   ├── middleware/            # Express middleware
│   │   ├── auth.js            # JWT authentication
│   │   ├── errorHandler.js    # Error handling
│   │   ├── rateLimiter.js     # Rate limiting
│   │   └── roleAuth.js        # Role-based authorization
│   ├── models/                # Mongoose models
│   ├── routes/                # API routes
│   ├── server.js              # Express app entry
│   └── package.json
└── mobile/                    # React Native mobile app
    ├── src/
    │   ├── components/        # Mobile components
    │   ├── config/            # Mobile API config
    │   ├── context/           # Mobile contexts
    │   ├── screens/           # Screen components
    │   ├── services/          # Mobile API services
    │   └── theme/             # Theme configuration
    ├── App.js
    └── package.json
```

### Key Patterns
- **Frontend**: Functional components with React hooks, Context API for state management, React Router for navigation
- **Backend**: Express.js REST API, Mongoose ODM for MongoDB, JWT authentication, Socket.io for real-time features
- **Mobile**: React Native with Expo, similar structure to web client
- **State Management**: React Context (AuthContext, CartContext, NotificationContext)
- **API Pattern**: Centralized API service in `client/src/services/api.js` and `mobile/src/services/mobileApi.js`

### Database
- **MongoDB** with Mongoose ODM
- Collections: Users, Clinics, Prescriptions, Orders, Inventory, AuditLogs, SupportTickets

### Authentication
- **JWT (JSON Web Tokens)** for authentication
- Role-based access control (RBAC): admin, clinic, pharmacist, patient
- Middleware: `server/middleware/auth.js` and `server/middleware/roleAuth.js`

## Coding Standards & Preferences

### Language & Framework
- **Frontend**: JavaScript (React 18+), Vite build tool
- **Backend**: JavaScript (Node.js 18+, Express.js)
- **Mobile**: JavaScript (React Native with Expo)
- **Database**: MongoDB with Mongoose

### Code Style
- **Naming Conventions**:
  - Components: PascalCase (e.g., `Dashboard.jsx`, `Sidebar.jsx`)
  - Functions/Variables: camelCase (e.g., `fetchOrders`, `userProfile`)
  - Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
  - Files: kebab-case for utilities, PascalCase for components
- **Components**: Functional components with hooks (no class components)
- **Async/Await**: Prefer async/await over Promise chains
- **Destructuring**: Use object/array destructuring for cleaner code
- **Arrow Functions**: Use for callbacks and short functions

### File Organization
- Keep components under 300 lines when possible
- Separate concerns: components, hooks, services, contexts
- Co-locate related styles with components (e.g., `Dashboard.jsx` + `Dashboard.css`)
- Use barrel exports for related modules

### Comments & Documentation
- **JSDoc style** for functions:
  ```javascript
  /**
   * Fetches orders for the current user
   * @param {string} userId - The user ID
   * @param {Object} filters - Optional filters (status, date range)
   * @returns {Promise<Array>} Array of order objects
   */
  const fetchOrders = async (userId, filters = {}) => { ... }
  ```
- Comment complex logic and business rules
- Document API endpoints in route files
- Keep comments concise and meaningful

### Error Handling
- Use try-catch blocks for async operations
- Implement proper error boundaries in React
- Log errors with context (user ID, action, timestamp)
- Provide user-friendly error messages
- Use the centralized error handler middleware

### Security Best Practices
- **NEVER** commit sensitive data (API keys, passwords, tokens)
- Use environment variables for configuration (`.env` files)
- Validate all inputs on both client and server
- Sanitize user inputs to prevent XSS
- Use parameterized queries (Mongoose handles this)
- Implement rate limiting on API endpoints
- Use HTTPS in production
- Implement CORS properly
- Hash passwords (bcrypt) before storing

### Testing
- **Frontend**: Vitest for unit testing, React Testing Library for component tests
- **Backend**: Jest/Mocha for API testing
- **Mobile**: Jest for unit tests, Detox for E2E
- Aim for 80%+ test coverage on critical paths
- Test authentication flows thoroughly
- Mock external dependencies (API calls, database)

### Performance
- Use React.memo() for expensive components
- Implement lazy loading for routes (React.lazy)
- Optimize images and assets
- Use pagination for large data sets
- Implement caching where appropriate
- Debounce search inputs and API calls

### Clean Code Principles
- **Single Responsibility**: Each function/component does one thing well
- **DRY**: Extract common logic to reusable functions/hooks
- **KISS**: Keep solutions simple and readable
- **YAGNI**: Don't over-engineer for future features
- Keep functions under 50 lines when possible
- Use descriptive variable and function names
- Avoid nested ternary operators
- Prefer early returns over deep nesting

### API Integration
- Use the centralized API service: `client/src/services/api.js`
- Handle loading states and errors consistently
- Implement request cancellation for unmounted components
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Include proper error messages from API responses

### State Management
- Use Context API for global state (auth, cart, notifications)
- Use useState for local component state
- Use useEffect for side effects and data fetching
- Use useCallback and useMemo for performance optimization
- Keep state as close to where it's used as possible

### Styling
- Use CSS modules or co-located CSS files
- Follow BEM naming convention for CSS classes
- Use responsive design with media queries
- Maintain consistent color scheme and spacing
- Use semantic HTML elements

### Git Workflow
- Use descriptive commit messages (conventional commits)
- Create feature branches for new features
- Write meaningful pull request descriptions
- Review code before merging
- Keep main branch stable at all times

## Role-Specific Guidelines

### Admin Features
- Dashboard with analytics and metrics
- Clinic enrollment and management
- Inventory oversight
- Audit log viewing
- System settings and configuration
- Support ticket management

### Clinic Features
- Clinic dashboard
- Patient management
- Prescription creation
- Order tracking for patients

### Pharmacist Features
- Prescription verification
- Order fulfillment
- Inventory management
- Patient communication

### Patient/User Features
- Medication catalog browsing
- Prescription upload
- Order placement and tracking
- Profile management
- Support requests

## When Answering

1. **Always reference the actual file structure and existing code** - Check the project structure before suggesting changes
2. **Suggest code that matches existing style and patterns** - Follow the established conventions
3. **If suggesting changes, explain why and show diff-style** - Provide clear rationale for modifications
4. **Ask clarifying questions if the request is unclear** - Don't make assumptions about requirements
5. **Consider all three platforms** (web, mobile, backend) when making architectural decisions
6. **Test authentication flows** - Auth is critical and affects all features
7. **Check for existing components** - Reuse before creating new ones

## Do NOT

- ❌ Assume external libraries unless already in `package.json`
- ❌ Create class components (use functional components with hooks)
- ❌ Use hardcoded API endpoints (use the centralized API service)
- ❌ Commit sensitive data or credentials
- ❌ Skip error handling in async operations
- ❌ Ignore accessibility (ARIA labels, keyboard navigation)
- ❌ Create overly complex solutions for simple problems
- ❌ Mix concerns (keep UI, logic, and data separate)
- ❌ Use console.log for debugging in production code
- ❌ Skip input validation and sanitization

## DO

- ✅ Use existing Context providers (AuthContext, CartContext, NotificationContext)
- ✅ Follow the established folder structure
- ✅ Implement proper error handling and loading states
- ✅ Write descriptive commit messages
- ✅ Add comments for complex logic
- ✅ Test authentication and authorization
- ✅ Use environment variables for configuration
- ✅ Implement proper logging
- ✅ Follow security best practices
- ✅ Keep components small and focused
- ✅ Reuse existing components and utilities

## Common Patterns

### API Call Pattern
```javascript
import { api } from '../services/api';

const fetchData = async () => {
  try {
    setLoading(true);
    const response = await api.get('/endpoint');
    setData(response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
    setError(error.message || 'Failed to fetch data');
  } finally {
    setLoading(false);
  }
};
```

### Context Usage Pattern
```javascript
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { user, logout } = useAuth();
  // ... component logic
};
```

### Protected Route Pattern
```javascript
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};
```

## Project-Specific Notes

- The project uses **MongoDB** - ensure all database operations use Mongoose models
- **Socket.io** is configured for real-time features (notifications, order updates)
- **Multi-tenant architecture** - clinics are separate entities with their own data
- **Prescription workflow** involves multiple roles (patient upload → clinic create → pharmacist verify)
- **Inventory management** is critical - always check stock before allowing orders
- **Audit logging** is required for compliance - log all sensitive operations

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Setup Commands
```bash
# Install dependencies
cd client && npm install
cd ../server && npm install
cd ../mobile && npm install

# Start development servers
cd server && npm run dev
cd client && npm run dev
cd mobile && npx expo start
```

### Environment Variables
Create `.env` files in both `client/` and `server/` directories:
```
# Server .env
MONGODB_URI=mongodb://localhost:27017/pharmacy
JWT_SECRET=your-secret-key
PORT=5000

# Client .env
VITE_API_URL=http://localhost:5000/api
```

---

**Remember**: This is a healthcare application - security, reliability, and data privacy are paramount. Always follow HIPAA-like guidelines when handling patient data.