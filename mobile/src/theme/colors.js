// Dark theme (default)
export const darkColors = {
  // Primary - Orange (matching --primary-500 from client)
  primary: '#f97316', 
  primaryDark: '#ea580c', // --primary-600
  primaryLight: '#fb923c', // --primary-400
  
  // Backgrounds - Dark Theme
  background: '#000000', // --bg-primary
  surface: '#0a0a0a', // --surface / --bg-tertiary
  surfaceHighlight: '#1a1a1a',

  // Text
  textPrimary: '#ffffff', // --text-primary
  textSecondary: '#9ca3af', // --text-secondary
  textLight: '#6b7280', // --text-tertiary
  
  // Status
  success: '#10B981', 
  error: '#ef4444', 
  warning: '#f59e0b', 
  info: '#3b82f6', 

  // UI Elements
  border: '#333333', // Darker border for dark theme
  buttonText: '#FFFFFF',
  inputBackground: '#171717', // Dark input background
  placeholder: '#525252',
};

// Light theme
export const lightColors = {
  primary: '#f97316',
  primaryDark: '#ea580c',
  primaryLight: '#fb923c',
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textLight: '#94a3b8',
  success: '#10B981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  border: '#e2e8f0',
  buttonText: '#FFFFFF',
  inputBackground: '#f1f5f9',
  placeholder: '#94a3b8',
};

// Default export for backward compatibility (dark theme)
export const colors = darkColors;
