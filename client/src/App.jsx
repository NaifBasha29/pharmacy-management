import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminRegister from './pages/auth/AdminRegister';
import ClinicRegister from './pages/auth/ClinicRegister';

// Landing Page
import LandingPage from './pages/LandingPage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ClinicList from './pages/admin/clinics/ClinicList';
import ClinicEnrollment from './pages/admin/clinics/ClinicEnrollment';
import UserList from './pages/admin/users/UserList';

// Pharmacist Pages
import PharmacistDashboard from './pages/pharmacist/Dashboard';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import Catalog from './pages/user/Catalog';
import Orders from './pages/user/Orders';
import Prescriptions from './pages/user/Prescriptions';
import Profile from './pages/user/Profile';
import Support from './pages/user/Support';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'pharmacist') return <Navigate to="/pharmacist" replace />;
    return <Navigate to="/user" replace />;
  }

  return children;
};

// Public Route - redirect if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'pharmacist') return <Navigate to="/pharmacist" replace />;
    return <Navigate to="/user" replace />;
  }

  return children;
};

// Home redirect based on role
const HomeRedirect = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'pharmacist') return <Navigate to="/pharmacist" replace />;
  return <Navigate to="/user" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Root - Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/register/admin" element={<PublicRoute><AdminRegister /></PublicRoute>} />
      <Route path="/register/clinic" element={<PublicRoute><ClinicRegister /></PublicRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/clinics" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <ClinicList />
        </ProtectedRoute>
      } />
      <Route path="/admin/clinics/enroll" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <ClinicEnrollment />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <UserList />
        </ProtectedRoute>
      } />
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* Pharmacist Routes */}
      <Route path="/pharmacist" element={
        <ProtectedRoute allowedRoles={['pharmacist', 'admin']}>
          <PharmacistDashboard />
        </ProtectedRoute>
      } />
      <Route path="/pharmacist/*" element={
        <ProtectedRoute allowedRoles={['pharmacist', 'admin']}>
          <PharmacistDashboard />
        </ProtectedRoute>
      } />

      {/* User Routes */}
      <Route path="/user" element={
        <ProtectedRoute allowedRoles={['user', 'pharmacist', 'admin']}>
          <UserDashboard />
        </ProtectedRoute>
      } />
      <Route path="/user/catalog" element={
        <ProtectedRoute allowedRoles={['user', 'pharmacist', 'admin']}>
          <Catalog />
        </ProtectedRoute>
      } />
      <Route path="/user/orders" element={
        <ProtectedRoute allowedRoles={['user', 'pharmacist', 'admin']}>
          <Orders />
        </ProtectedRoute>
      } />
      <Route path="/user/prescriptions" element={
        <ProtectedRoute allowedRoles={['user', 'pharmacist', 'admin']}>
          <Prescriptions />
        </ProtectedRoute>
      } />
      <Route path="/user/profile" element={
        <ProtectedRoute allowedRoles={['user', 'pharmacist', 'admin']}>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/user/support" element={
        <ProtectedRoute allowedRoles={['user', 'pharmacist', 'admin']}>
          <Support />
        </ProtectedRoute>
      } />
      <Route path="/user/*" element={
        <ProtectedRoute allowedRoles={['user', 'pharmacist', 'admin']}>
          <UserDashboard />
        </ProtectedRoute>
      } />

      {/* Catch all - 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1f2937',
                  color: '#f9fafb',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#f9fafb',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#f9fafb',
                  },
                },
              }}
            />
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
