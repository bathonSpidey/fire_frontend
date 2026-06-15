import React from "react";
import { useTheme } from "../../hooks/useTheme";
import styles from "./Navbar.module.css";

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <span className={styles.logoIcon}>📊</span>
        <span>Smartory</span>
      </div>

      <div className={styles.navActions}>
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          <span className={styles.icon}>{theme === "light" ? "🌙" : "☀️"}</span>
        </button>
      </div>
    </nav>
  );
};
