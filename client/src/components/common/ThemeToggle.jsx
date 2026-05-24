import { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

const ThemeToggle = ({ className = "" }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <button
      onClick={toggleTheme}
      className={`nav-link theme-toggle-btn ${className}`}
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: "0.6rem 0.8rem",
        borderRadius: "8px",
        color: "var(--text-secondary)",
      }}
    >
      <span className="nav-icon" style={{ fontSize: "1.15rem", display: "flex", alignItems: "center" }}>
        {theme === "dark" ? <FiSun /> : <FiMoon />}
      </span>
      <span className="nav-label" style={{ whiteSpace: "nowrap" }}>
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
};

export default ThemeToggle;
