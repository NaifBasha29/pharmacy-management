import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  // Clear all auth data from storage
  const clearAllAuthData = () => {
    // Clear sessionStorage (current tab session)
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('currentUser');
    // Clear localStorage (API tokens)
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const checkAuth = async () => {
    // NO AUTO-LOGIN from localStorage
    // Only check sessionStorage for CURRENT TAB session
    const sessionUser = sessionStorage.getItem('currentUser');
    const sessionToken = sessionStorage.getItem('accessToken');

    if (sessionToken && sessionUser) {
      try {
        setUser(JSON.parse(sessionUser));
      } catch (err) {
        console.error('Session parse failed:', err);
        clearAllAuthData();
      }
    }
    setLoading(false);
  };

  const handleLoginResponse = (response) => {
    const { user, accessToken, refreshToken } = response.data.data;
    // Store in sessionStorage for CURRENT TAB only (no auto-login on refresh)
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    // Also store in localStorage for API calls (axios interceptor uses this)
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return { success: true, user };
  };

  const loginAdmin = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.loginAdmin(credentials);
      return handleLoginResponse(response);
    } catch (err) {
      const message = err.response?.data?.message || 'Admin login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const loginClinic = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.loginClinic(credentials);
      return handleLoginResponse(response);
    } catch (err) {
      const message = err.response?.data?.message || 'Clinic login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const loginPatient = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.loginPatient(credentials);
      return handleLoginResponse(response);
    } catch (err) {
      const message = err.response?.data?.message || 'Patient login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      const { user, accessToken, refreshToken } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      // Ignore logout errors - still clear local data
      console.log('Logout API error (ignored):', err.message);
    } finally {
      // Clear all auth data
      clearAllAuthData();
      // Redirect to landing page (not login page)
      window.location.href = '/';
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    error,
    loginAdmin,
    loginClinic,
    loginPatient,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isPharmacist: user?.role === 'pharmacist',
    isClinicAdmin: user?.role === 'clinic_admin',
    isUser: user?.role === 'user'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;




