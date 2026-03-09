import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from '../utils/storage';
import api from '../config/api';

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
        const response = await api.get('/auth/me');
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
      // Check if token expired
      if (e.response?.status === 401 && e.response?.data?.code === 'TOKEN_EXPIRED') {
        try {
          // Try to refresh the token
          await refreshToken();
          // Retry getting user data with new token
          const response = await api.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.data.user);
          } else {
            setUser(null);
          }
        } catch (refreshError) {
          // Refresh failed, user will be set to null by refreshToken
          console.log('Token refresh failed in checkLoginStatus');
        }
      } else {
        console.log('Failed to restore token', e);
        // Token expired or invalid - clear stored tokens
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('refreshToken');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password) => {
    setLoading(true);
    setError(null);
    try {
      // Use /auth/login/patient for end-user mobile app.
      // Identifier accepts either patient email or patient ID.
      const response = await api.post('/auth/login/patient', {
        identifier,
        password
      });
      
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

  const refreshToken = async () => {
    try {
      const storedRefreshToken = await SecureStore.getItemAsync('refreshToken');
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh-token', {
        refreshToken: storedRefreshToken
      });

      if (response.data.success) {
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        
        await SecureStore.setItemAsync('userToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', newRefreshToken);
        
        return accessToken;
      } else {
        throw new Error(response.data.message || 'Token refresh failed');
      }
    } catch (e) {
      console.log('Token refresh failed', e);
      // Clear tokens on refresh failure
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('refreshToken');
      setUser(null);
      throw e;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
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
        refreshToken,
        checkLoginStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
