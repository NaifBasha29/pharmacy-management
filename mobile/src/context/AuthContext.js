import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/mobileApi';
import TokenStorage from '../utils/tokenStorage'; // .native.js on device, .web.js on browser

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => { checkLoginStatus(); }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await TokenStorage.get('userToken');
      if (token) {
        const response = await authAPI.getCurrentUser();
        if (response.data.success) {
          setUser(response.data.data.user);
        } else {
          await TokenStorage.remove('userToken');
          await TokenStorage.remove('refreshToken');
          setUser(null);
        }
      }
    } catch (e) {
      console.log('Failed to restore token', e);
      try {
        await TokenStorage.remove('userToken');
        await TokenStorage.remove('refreshToken');
      } catch {}
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.loginPatient({ email, password });

      if (response.data.success) {
        const { user: userData, accessToken, refreshToken } = response.data.data;
        await TokenStorage.set('userToken', accessToken);
        await TokenStorage.set('refreshToken', refreshToken);
        setUser(userData);
        return true;
      } else {
        setError(response.data.message || 'Login failed');
        return false;
      }
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || 'Network error. Please check your connection.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authAPI.logout();
    } catch (e) {
      console.log('Logout API call failed (non-critical)', e);
    } finally {
      try {
        await TokenStorage.remove('userToken');
        await TokenStorage.remove('refreshToken');
      } catch {}
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, checkLoginStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
