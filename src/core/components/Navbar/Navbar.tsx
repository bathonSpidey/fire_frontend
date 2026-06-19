import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import styles from "./Navbar.module.css";

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  // Helper to cleanly apply active classes from the CSS module
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navLink} ${isActive ? styles.activeLink : ""}`;

  return (
    <nav className={styles.navbar}>
      <div className={styles.leftSection}>
        <Link to="/manage" className={styles.brand}>
          <span className={styles.logoIcon}>📊</span>
          <span>Smartory</span>
        </Link>

        <div className={styles.navLinks}>
          <NavLink to="/upload" className={getLinkClass}>
            Upload
          </NavLink>
          <NavLink to="/manage" className={getLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/inventory" className={getLinkClass}>
            Inventory
          </NavLink>
        </div>
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
