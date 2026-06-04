import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = ({ className = '' }) => {
    const { theme, toggleTheme, isAdminTheme, setAdminTheme } = useTheme();

    return (
        <button
            type="button"
            className={`theme-toggle-btn ${className}`}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            aria-pressed={theme === 'dark'}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
            {/* Small admin toggle for power users (visible when sidebar is expanded) */}
            <div style={{ marginLeft: 8, display: 'inline-flex', gap: 6 }}>
                <button
                    type="button"
                    className={`theme-toggle-btn admin-toggle ${isAdminTheme ? 'active' : ''}`}
                    onClick={() => setAdminTheme(!isAdminTheme)}
                    title={isAdminTheme ? 'Disable admin theme' : 'Enable admin theme'}
                    aria-pressed={isAdminTheme}
                    style={{ padding: '6px', borderRadius: 8 }}
                >
                    ⚜
                </button>
            </div>
        </button>
    );
};

export default ThemeToggle;
