import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../services/mobileApi';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        // Verify token and get user data
        const response = await authAPI.getCurrentUser();
        if (response.data.success) {
          setUser(response.data.data.user);
        } else {
          // Token invalid, clear it
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('refreshToken');
          setUser(null);
        }
      }
    } catch (e) {
      console.log('Failed to restore token', e);
      // Token expired or invalid - clear stored tokens
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('refreshToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (patientId, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.loginPatient({ patientId, password });
      
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        
        await SecureStore.setItemAsync('userToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshToken);
        
        setUser(user);
        return true;
      } else {
        setError(response.data.message || 'Login failed');
        return false;
      }
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || 'Network error');
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
      console.log('Logout API call failed', e);
    } finally {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('refreshToken');
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        checkLoginStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
