import axios from 'axios';
import * as SecureStore from '../utils/storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const API_PORT = 5005;

// Derive the dev-server host that Expo Go / dev-client is already connected to.
// This works because Expo sets the debuggerHost to "IP:PORT" of Metro.
const getDevHost = () => {
  try {
    // Expo SDK 49+ (expoGoConfig or expoConfig)
    const debuggerHost =
      Constants.expoGoConfig?.debuggerHost ??
      Constants.expoConfig?.hostUri ??
      Constants.manifest?.debuggerHost ??
      Constants.manifest?.hostUri;
    if (debuggerHost) {
      // debuggerHost is "192.168.x.x:PORT", strip the port
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

console.log(`🌐 API Base URL: ${BASE_URL}`);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error.message);
    return Promise.reject(error);
  }
);

// Add a response interceptor to log errors in detail
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ API ERROR DETAILS:');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (error.response) {
      // Server responded with error status
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('URL:', error.config?.url);
      console.error('Method:', error.config?.method?.toUpperCase());
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
    } else if (error.request) {
      // Request was made but no response received
      console.error('No Response Received');
      console.error('URL:', error.config?.url);
      console.error('Method:', error.config?.method?.toUpperCase());
      console.error('Request:', error.request._response || 'Network Error');
      console.error('Possible causes:');
      console.error('  - Server is not running');
      console.error('  - Wrong IP address or port');
      console.error('  - Network connectivity issues');
      console.error('  - CORS issues');
    } else {
      // Error setting up the request
      console.error('Request Setup Error:', error.message);
    }
    
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return Promise.reject(error);
  }
);

export default api;
