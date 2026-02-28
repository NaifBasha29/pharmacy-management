import axios from 'axios';
import { Platform } from 'react-native';
// Metro automatically resolves tokenStorage.native.js on iOS/Android
// and tokenStorage.web.js on web — no conditional requires needed.
import TokenStorage from '../utils/tokenStorage';

export { TokenStorage };

// ── Server URL ─────────────────────────────────────────────────────────────────
// Update SERVER_IP to your machine's LAN IP when testing on a physical device.
const SERVER_IP = '192.168.29.190';
const PORT      = '5005';

export const SERVER_URL =
  Platform.OS === 'web'
    ? `http://localhost:${PORT}`       // browser dev → always localhost
    : `http://${SERVER_IP}:${PORT}`;   // Android / iOS physical device

const BASE_URL = `${SERVER_URL}/api`;
// ──────────────────────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ── Request interceptor: attach stored auth token ─────────────────────────────
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await TokenStorage.get('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // If token retrieval fails, continue without auth header
    }
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error.message);
    return Promise.reject(error);
  }
);

// ── Response interceptor: detailed error logging ──────────────────────────────
api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`
    );
    return response;
  },
  (error) => {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ API ERROR DETAILS:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('URL:', error.config?.url);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response — server not running, wrong IP, or CORS issue');
      console.error('URL:', error.config?.url);
    } else {
      console.error('Request Setup Error:', error.message);
    }
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return Promise.reject(error);
  }
);

export default api;
