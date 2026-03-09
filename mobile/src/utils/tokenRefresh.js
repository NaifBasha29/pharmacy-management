import axios from 'axios';
import * as storage from './storage';

// Import BASE_URL from config
const API_PORT = 5005;
const { Platform } = require('react-native');
const Constants = require('expo-constants');

// Derive the dev-server host that Expo Go / dev-client is already connected to.
const getDevHost = () => {
  try {
    const debuggerHost =
      Constants.expoGoConfig?.debuggerHost ??
      Constants.expoConfig?.hostUri ??
      Constants.manifest?.debuggerHost ??
      Constants.manifest?.hostUri;
    if (debuggerHost) {
      return debuggerHost.split(':')[0];
    }
  } catch {
    // ignore
  }
  return null;
};

const devHost = getDevHost();
const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const apiHost = devHost || fallbackHost;
const BASE_URL = `http://${apiHost}:${API_PORT}/api`;

// Create a separate axios instance for token refresh to avoid interceptors
const refreshApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const refreshAccessToken = async () => {
  try {
    const refreshToken = await storage.getItemAsync('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await refreshApi.post('/auth/refresh-token', {
      refreshToken
    });

    if (response.data.success) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      await storage.setItemAsync('userToken', accessToken);
      await storage.setItemAsync('refreshToken', newRefreshToken);

      return accessToken;
    } else {
      throw new Error(response.data.message || 'Token refresh failed');
    }
  } catch (e) {
    console.log('Token refresh failed', e);
    // Clear tokens on refresh failure
    await storage.deleteItemAsync('userToken');
    await storage.deleteItemAsync('refreshToken');
    throw e;
  }
};
