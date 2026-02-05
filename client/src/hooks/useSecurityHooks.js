import { useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to prevent back button navigation after logout
 */
export const useBackButtonProtection = () => {
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        window.history.pushState(null, '', window.location.href);

        const handlePopState = () => {
            if (!isAuthenticated) {
                window.history.pushState(null, '', '/');
                window.location.replace('/');
            } else {
                window.history.pushState(null, '', window.location.href);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isAuthenticated]);
};

/**
 * Hook to add no-cache headers meta tags
 */
export const useNoCacheHeaders = () => {
    useEffect(() => {
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
 * Also clears browser history to prevent back-button attacks
 */
export const useClearAuthOnMount = () => {
    useEffect(() => {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        // Replace history state to prevent back navigation
        window.history.replaceState(null, '', window.location.href);
    }, []);
};

/**
 * Hook to handle session expiry from API responses
 */
export const useSessionValidator = () => {
    const handleSessionExpiry = useCallback((error) => {
        if (error?.response?.data?.code === 'SESSION_INVALID' ||
            error?.response?.data?.code === 'TOKEN_EXPIRED' ||
            error?.response?.status === 401) {
            sessionStorage.clear();
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.replace('/');
        }
    }, []);

    return { handleSessionExpiry };
};

/**
 * Hook to setup session timeout warning
 */
export const useSessionTimeout = (timeoutMs = 15 * 60 * 1000) => {
    const { isAuthenticated, logout } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) return;

        let timeoutId;
        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                console.warn('[Session] Timed out due to inactivity');
                logout();
            }, timeoutMs);
        };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetTimer));
        resetTimer();

        return () => {
            clearTimeout(timeoutId);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [isAuthenticated, logout, timeoutMs]);
};

export default {
    useBackButtonProtection,
    useNoCacheHeaders,
    useClearAuthOnMount,
    useSessionValidator,
    useSessionTimeout
};
