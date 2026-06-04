import { createContext, useContext, useEffect, useState } from 'react';

// Provide a safe default so consumers can destructure without the provider
// being present (avoids crashes during SSR/build where the provider may not
// be mounted). Functions are no-ops by default.
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  isAdminTheme: false,
  setAdminTheme: () => {},
});

export const useTheme = () => {
  return useContext(ThemeContext);
};

// ThemeProvider now supports a global "admin" flag in addition to light/dark.
// - `theme` is either 'light' or 'dark' and is persisted to localStorage
// - `isAdminTheme` is a transient flag (not persisted) that adds the
//    document-level `theme-admin` class so admin styles apply globally.
export const ThemeProvider = ({ children }) => {
  // Guard access to localStorage during SSR/build by resolving initial
  // value lazily and checking for window availability.
  const getInitialTheme = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('theme') || 'light';
      }
    } catch (e) {
      // ignore
    }
    return 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [isAdminTheme, setIsAdminTheme] = useState(false);

  useEffect(() => {
    // Do nothing during SSR
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Ensure only one of the light/dark classes exists on the root
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // Toggle admin theme class separately so legacy selectors like
    // `.theme-admin .foo` (and `.theme-admin` variable overrides) work
    if (isAdminTheme) {
      root.classList.add('theme-admin');
    } else {
      root.classList.remove('theme-admin');
    }

    // Keep the data-theme attribute in sync for attribute-based selectors
    root.setAttribute('data-theme', theme);

    // Save preference (guard for restricted environments)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('theme', theme);
      }
    } catch (e) {
      // ignore storage errors in some environments
    }
  }, [theme, isAdminTheme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const setAdminTheme = (enabled) => setIsAdminTheme(Boolean(enabled));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isAdminTheme, setAdminTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
