import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../auth/AuthContext";
import { useReviewQuestions } from "../../../features/review/hooks/useReviewQuestions";
import styles from "./Navbar.module.css";

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const { questions } = useReviewQuestions(30000); // badge: how many yes/no questions wait

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
          <NavLink to="/spending" className={getLinkClass}>
            Spending
          </NavLink>
          <NavLink to="/manage" className={getLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/inventory" className={getLinkClass}>
            Inventory
          </NavLink>
          <NavLink to="/categories" className={getLinkClass}>
            Categories
          </NavLink>
          <NavLink to="/questions" className={getLinkClass}>
            Questions{questions.length > 0 ? ` (${questions.length})` : ""}
          </NavLink>
          <NavLink to="/analytics" className={getLinkClass}>
            Analytics
          </NavLink>
        </div>
      </div>

      <div className={styles.navActions}>
        <button className={styles.signOut} onClick={signOut}>
          Sign out
        </button>
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
