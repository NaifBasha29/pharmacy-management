import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Color Palettes ───────────────────────────────────────────────────────────

const darkColors = {
  // Brand
  primary: '#f97316',
  primaryDark: '#ea580c',
  primaryLight: '#fb923c',
  primaryMuted: 'rgba(249,115,22,0.15)',

  // Backgrounds — matches web [data-theme="dark"] vars
  background: '#000000',
  surface: '#0a0a0a',
  surfaceHighlight: '#1a1a1a',
  surfaceElevated: '#1a1a1a',
  card: '#0a0a0a',
  overlay: 'rgba(0,0,0,0.6)',

  // Navigation
  tabBar: '#050505',
  navBar: '#000000',

  // Text — matches web --text-primary / --text-secondary
  textPrimary: '#ffffff',
  textSecondary: '#9ca3af',
  textTertiary: '#6b7280',
  textInverse: '#000000',

  // Status
  success: '#22c55e',
  successMuted: 'rgba(34,197,94,0.15)',
  error: '#ef4444',
  errorMuted: 'rgba(239,68,68,0.15)',
  warning: '#f59e0b',
  warningMuted: 'rgba(245,158,11,0.15)',
  info: '#3b82f6',
  infoMuted: 'rgba(59,130,246,0.15)',

  // UI — border matches web --border-light (dark)
  border: 'rgba(255,255,255,0.08)',
  borderStrong: '#3f3f46',
  divider: '#1a1a1a',
  inputBackground: '#111111',
  placeholder: '#52525b',
  buttonText: '#ffffff',
  badge: '#ef4444',
  chip: '#1a1a1a',
  chipText: '#d4d4d8',
  disabled: '#3f3f46',
  disabledText: '#6b7280',

  // Shadow (for elevation effects)
  shadow: '#000000',
};

const lightColors = {
  // Brand
  primary: '#f97316',
  primaryDark: '#ea580c',
  primaryLight: '#fb923c',
  primaryMuted: 'rgba(249,115,22,0.1)',

  // Backgrounds — matches web :root vars
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  surfaceElevated: '#ffffff',
  card: '#ffffff',
  overlay: 'rgba(0,0,0,0.5)',

  // Navigation
  tabBar: '#ffffff',
  navBar: '#ffffff',

  // Text — matches web --text-primary / --text-secondary
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',
  textInverse: '#ffffff',

  // Status
  success: '#16a34a',
  successMuted: 'rgba(22,163,74,0.1)',
  error: '#dc2626',
  errorMuted: 'rgba(220,38,38,0.1)',
  warning: '#d97706',
  warningMuted: 'rgba(217,119,6,0.1)',
  info: '#2563eb',
  infoMuted: 'rgba(37,99,235,0.1)',

  // UI — border matches web --border-light (light)
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',
  divider: '#f1f5f9',
  inputBackground: '#f1f5f9',
  placeholder: '#94a3b8',
  buttonText: '#ffffff',
  badge: '#ef4444',
  chip: '#f1f5f9',
  chipText: '#334155',
  disabled: '#e2e8f0',
  disabledText: '#94a3b8',

  // Shadow
  shadow: '#64748b',
};

// ─── Typography ───────────────────────────────────────────────────────────────
export const typography = {
  // Display
  displayLarge: { fontSize: 36, fontWeight: '700', letterSpacing: -0.5, lineHeight: 44 },
  displayMedium: { fontSize: 28, fontWeight: '700', letterSpacing: -0.4, lineHeight: 36 },
  displaySmall: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3, lineHeight: 32 },

  // Headings
  h1: { fontSize: 22, fontWeight: '700', letterSpacing: -0.2, lineHeight: 30 },
  h2: { fontSize: 20, fontWeight: '700', letterSpacing: -0.1, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600', letterSpacing: 0, lineHeight: 26 },
  h4: { fontSize: 16, fontWeight: '600', letterSpacing: 0, lineHeight: 24 },

  // Body
  bodyLarge: { fontSize: 17, fontWeight: '400', lineHeight: 26 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 24 },
  bodySmall: { fontSize: 13, fontWeight: '400', lineHeight: 20 },

  // Labels / UI
  labelLarge: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '600', lineHeight: 18, letterSpacing: 0.1 },
  labelSmall: { fontSize: 11, fontWeight: '600', lineHeight: 16, letterSpacing: 0.3 },

  // Caption
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 18 },
  overline: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, lineHeight: 16 },
};

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
};

// ─── Border Radius ────────────────────────────────────────────────────────────
export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  full: 9999,
};

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const getShadow = (theme, level = 'md') => {
  const shadows = {
    sm: {
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 8,
    },
    primary: {
      shadowColor: '#f97316',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 6,
    },
  };
  return shadows[level] || shadows.md;
};

// ─── Context ──────────────────────────────────────────────────────────────────
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('theme_mode').then((val) => {
      if (val === 'light') setIsDark(false);
      if (val === 'dark') setIsDark(true);
    }).catch(() => {});
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    AsyncStorage.setItem('theme_mode', next ? 'dark' : 'light').catch(() => {});
  };

  const theme = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme, typography, spacing, radius, getShadow }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
