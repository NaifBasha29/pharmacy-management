import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    return useContext(ThemeContext);
};

// ThemeProvider now supports a global "admin" flag in addition to light/dark.
// - `theme` is either 'light' or 'dark' and is persisted to localStorage
// - `isAdminTheme` is a transient flag (not persisted) that adds the
//    document-level `theme-admin` class so admin styles apply globally.
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [isAdminTheme, setIsAdminTheme] = useState(false);

    useEffect(() => {
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

        // Save preference
        try {
            localStorage.setItem('theme', theme);
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
