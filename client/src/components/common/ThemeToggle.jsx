import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = ({ className = '' }) => {
    const { theme, toggleTheme } = useTheme();

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
        </button>
    );
};

export default ThemeToggle;
