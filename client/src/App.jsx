import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "react-hot-toast";
import LoadingScreen from "./components/common/LoadingScreen";

// Auth Pages
import AdminLogin from "./pages/auth/AdminPortal";
import ClinicLogin from "./pages/auth/ClinicLogin";
import PatientLogin from "./pages/auth/PatientLogin";

// Landing Page
import LandingPage from "./pages/LandingPage";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import ClinicList from "./pages/admin/clinics/ClinicList";
import ClinicEnrollment from "./pages/admin/clinics/ClinicEnrollment";
import ClinicView from "./pages/admin/clinics/ClinicView";
import Inventory from "./pages/admin/inventory/Inventory";
import AdminOrders from "./pages/admin/orders/AdminOrders";
import AdminPrescriptions from "./pages/admin/prescriptions/AdminPrescriptions";
import Reports from "./pages/admin/reports/Reports";
import AuditLogs from "./pages/admin/compliance/AuditLogs";
import AdminSupport from "./pages/admin/support/AdminSupport";
import AdminSettings from "./pages/admin/settings/AdminSettings";

// Pharmacist Pages
import PharmacistDashboard from "./pages/pharmacist/Dashboard";
import Patients from "./pages/pharmacist/Patients";
import PharmacistOrders from "./pages/pharmacist/Orders";
import PharmacistPrescriptions from "./pages/pharmacist/Prescriptions";
import PharmacistInventory from "./pages/pharmacist/Inventory";
import PharmacistAIDrugCheck from "./pages/pharmacist/AIDrugCheck";
import PharmacistBilling from "./pages/pharmacist/PharmacistBilling";
import PharmacistReports from "./pages/pharmacist/PharmacistReports";
import PharmacistOrders from './pages/pharmacist/Orders';
import PharmacistPrescriptions from './pages/pharmacist/Prescriptions';

// Clinic Pages
import ClinicDashboard from "./pages/clinic/ClinicDashboard";
import ClinicPatients from "./pages/clinic/Patients";
import ClinicMedicines from "./pages/clinic/Medicines";
import ClinicOrders from "./pages/clinic/ClinicOrders";
import ClinicStaff from "./pages/clinic/ClinicStaff";
import ClinicSettings from "./pages/clinic/ClinicSettings";

// User Pages
import UserDashboard from './pages/user/Dashboard';
import Catalog from './pages/user/Catalog';
import Orders from './pages/user/Orders';
import Prescriptions from './pages/user/Prescriptions';
import Profile from './pages/user/Profile';
import Support from './pages/user/Support';

// Protected Route Component - Only allows authenticated users
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    if (loading) {
      return <LoadingScreen />;
    }
  }

  // Not authenticated - redirect to landing page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === "admin") return <Navigate to="/admin" replace />;
    if (user?.role === "clinic_admin") return <Navigate to="/clinic" replace />;
    if (user?.role === "pharmacist")
      return <Navigate to="/pharmacist" replace />;
    return <Navigate to="/user" replace />;
  }

  return (
    <div className={user?.role === "admin" ? "theme-admin" : ""}>
      {children}
    </div>
  );
};

// Public Route - redirect authenticated users to their dashboard
const PublicRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    if (loading) {
      return <LoadingScreen />;
    }
  }

  // If authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    if (user?.role === "admin") return <Navigate to="/admin" replace />;
    if (user?.role === "clinic_admin") return <Navigate to="/clinic" replace />;
    if (user?.role === "pharmacist")
      return <Navigate to="/pharmacist" replace />;
    return <Navigate to="/user" replace />;
  }

  return children;
};

// Home redirect based on role
const HomeRedirect = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    if (loading) {
      return <LoadingScreen />;
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/user/login" replace />; // Default to user login
  }

  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  if (user?.role === "clinic_admin") return <Navigate to="/clinic" replace />;
  if (user?.role === "pharmacist") return <Navigate to="/pharmacist" replace />;
  return <Navigate to="/user" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Root - Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Routes */}
      <Route
        path="/admin/login"
        element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        }
      />
      <Route
        path="/clinic/login"
        element={
          <PublicRoute>
            <ClinicLogin />
          </PublicRoute>
        }
      />
      <Route
        path="/user/login"
        element={
          <PublicRoute>
            <PatientLogin />
          </PublicRoute>
        }
      />

      {/* Legacy Login Redirect */}
      <Route path="/login" element={<Navigate to="/user/login" replace />} />

      {/* Redirect register to login - patients get credentials from clinic admin */}
      <Route path="/register" element={<Navigate to="/user/login" replace />} />
      <Route
        path="/register/*"
        element={<Navigate to="/user/login" replace />}
      />

      <Route
        path="/admin/clinics"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ClinicList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/clinics/enroll"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ClinicEnrollment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/clinics/:id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ClinicView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Inventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/prescriptions"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminPrescriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AuditLogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/support"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminSupport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Pharmacist Routes */}
      <Route path="/pharmacist" element={
        <ProtectedRoute allowedRoles={['pharmacist', 'admin']}>
          <PharmacistDashboard />
        </ProtectedRoute>
      } />
      <Route path="/pharmacist/patients" element={
        <ProtectedRoute allowedRoles={['pharmacist', 'admin']}>
          <Patients />
        </ProtectedRoute>
      } />
      <Route path="/pharmacist/*" element={
        <ProtectedRoute allowedRoles={['pharmacist', 'admin']}>
          <PharmacistDashboard />
        </ProtectedRoute>
      } />

      {/* Clinic Routes */}
      <Route
        path="/clinic/patients"
        element={
          <ProtectedRoute allowedRoles={["clinic_admin"]}>
            <ClinicPatients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clinic/medicines"
        element={
          <ProtectedRoute allowedRoles={["clinic_admin"]}>
            <ClinicMedicines />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clinic/orders"
        element={
          <ProtectedRoute allowedRoles={["clinic_admin"]}>
            <ClinicOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clinic/staff"
        element={
          <ProtectedRoute allowedRoles={["clinic_admin"]}>
            <ClinicStaff />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clinic/settings"
        element={
          <ProtectedRoute allowedRoles={["clinic_admin"]}>
            <ClinicSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clinic"
        element={
          <ProtectedRoute allowedRoles={["clinic_admin"]}>
            <ClinicDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clinic/*"
        element={
          <ProtectedRoute allowedRoles={["clinic_admin"]}>
            <ClinicDashboard />
          </ProtectedRoute>
        }
      />

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
                  background: "#1f2937",
                  color: "#f9fafb",
                },
                success: {
                  iconTheme: {
                    primary: "#f97316",
                    secondary: "#f9fafb",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#f9fafb",
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
