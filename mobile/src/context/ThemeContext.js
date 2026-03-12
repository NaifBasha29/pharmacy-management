import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Color Palettes ───────────────────────────────────────────────────────────

const darkColors = {
  // Brand
  primary: '#f97316',
  primaryDark: '#ea580c',
  primaryLight: '#fb923c',
  primaryMuted: 'rgba(249,115,22,0.15)',

  // Backgrounds
  background: '#0f0f0f',
  surface: '#1a1a1a',
  surfaceHighlight: '#242424',
  surfaceElevated: '#2a2a2a',
  card: '#1e1e1e',
  overlay: 'rgba(0,0,0,0.6)',

  // Navigation
  tabBar: '#141414',
  navBar: '#0f0f0f',

  // Text
  textPrimary: '#f4f4f5',
  textSecondary: '#a1a1aa',
  textTertiary: '#71717a',
  textInverse: '#0f0f0f',

  // Status
  success: '#22c55e',
  successMuted: 'rgba(34,197,94,0.15)',
  error: '#ef4444',
  errorMuted: 'rgba(239,68,68,0.15)',
  warning: '#f59e0b',
  warningMuted: 'rgba(245,158,11,0.15)',
  info: '#3b82f6',
  infoMuted: 'rgba(59,130,246,0.15)',

  // UI
  border: '#2e2e2e',
  borderStrong: '#3f3f46',
  divider: '#262626',
  inputBackground: '#1c1c1c',
  placeholder: '#52525b',
  buttonText: '#ffffff',
  badge: '#ef4444',
  chip: '#27272a',
  chipText: '#d4d4d8',
  disabled: '#3f3f46',
  disabledText: '#71717a',

  // Shadow (for elevation effects)
  shadow: '#000000',
};

const lightColors = {
  // Brand
  primary: '#f97316',
  primaryDark: '#ea580c',
  primaryLight: '#fb923c',
  primaryMuted: 'rgba(249,115,22,0.1)',

  // Backgrounds
  background: '#f4f4f5',
  surface: '#ffffff',
  surfaceHighlight: '#f9fafb',
  surfaceElevated: '#ffffff',
  card: '#ffffff',
  overlay: 'rgba(0,0,0,0.5)',

  // Navigation
  tabBar: '#ffffff',
  navBar: '#ffffff',

  // Text
  textPrimary: '#18181b',
  textSecondary: '#52525b',
  textTertiary: '#a1a1aa',
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

  // UI
  border: '#e4e4e7',
  borderStrong: '#d4d4d8',
  divider: '#f1f1f1',
  inputBackground: '#f9fafb',
  placeholder: '#a1a1aa',
  buttonText: '#ffffff',
  badge: '#ef4444',
  chip: '#f4f4f5',
  chipText: '#3f3f46',
  disabled: '#e4e4e7',
  disabledText: '#a1a1aa',

  // Shadow
  shadow: '#71717a',
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
