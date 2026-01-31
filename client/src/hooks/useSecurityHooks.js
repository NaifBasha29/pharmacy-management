import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to prevent back button navigation after logout
 * This hook:
 * 1. Pushes a state to history on mount
 * 2. Listens for popstate (back button) events
 * 3. If user is not authenticated, redirects to home
 * 4. Prevents cached pages from being shown
 */
export const useBackButtonProtection = () => {
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        // Add a dummy state to history to detect back navigation
        window.history.pushState(null, '', window.location.href);

        const handlePopState = (event) => {
            // When back button is pressed
            if (!isAuthenticated) {
                // If not authenticated, push state again and redirect
                window.history.pushState(null, '', '/');
                window.location.replace('/');
            } else {
                // If authenticated, allow navigation but push state
                window.history.pushState(null, '', window.location.href);
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isAuthenticated]);
};

/**
 * Hook to add no-cache headers meta tags
 * This prevents browser from caching authenticated pages
 */
export const useNoCacheHeaders = () => {
    useEffect(() => {
        // Add meta tags to prevent caching
        const addMetaTag = (httpEquiv, content) => {
            let meta = document.querySelector(`meta[http-equiv="${httpEquiv}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.httpEquiv = httpEquiv;
                document.head.appendChild(meta);
            }
            meta.content = content;
        };

        addMetaTag('Cache-Control', 'no-cache, no-store, must-revalidate');
        addMetaTag('Pragma', 'no-cache');
        addMetaTag('Expires', '0');
    }, []);
};

/**
 * Hook to clear all auth data on mount (for login pages)
 * This ensures fresh credentials are required every time
 */
export const useClearAuthOnMount = () => {
    useEffect(() => {
        // Clear all stored session data immediately on mount
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }, []);
};

export default {
    useBackButtonProtection,
    useNoCacheHeaders,
    useClearAuthOnMount
};
