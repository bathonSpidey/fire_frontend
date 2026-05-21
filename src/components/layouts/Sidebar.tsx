import { NavLink } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActiveUser } from "../../store/useUserStore";
import { configApi } from "../../api/config";

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", icon: "◈", label: "Dashboard" },
  { to: "/upload", icon: "↑", label: "Upload" },
  { to: "/transactions", icon: "≡", label: "Transactions" },
  { to: "/items", icon: "🧾", label: "Items" },
  { to: "/insights", icon: "◉", label: "Insights" },
];

export function Sidebar() {
  const user = useActiveUser();

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        height: "100vh",
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        position: "sticky",
        top: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "var(--space-6)",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>🔥</span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "var(--text-xl)",
            color: "var(--color-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          FIRE
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "var(--space-4) var(--space-3)" }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-3) var(--space-4)",
              borderRadius: "var(--radius-md)",
              marginBottom: "var(--space-1)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "var(--color-primary)" : "var(--color-text-2)",
              background: isActive ? "rgba(245,158,11,0.08)" : "transparent",
              textDecoration: "none",
              transition: "all var(--duration-fast) var(--ease-out)",
            })}
          >
            <span
              style={{ fontSize: "1rem", width: "20px", textAlign: "center" }}
            >
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Active user */}
      {user && (
        <div
          style={{
            padding: "var(--space-4) var(--space-6)",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "var(--color-primary-dim)",
              color: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "var(--text-sm)",
              flexShrink: 0,
            }}
          >
            {user.name[0].toUpperCase()}
          </div>
          <span
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-text-2)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.name}
          </span>
        </div>
      )}
      {/* Model picker */}
      <ModelPicker />
    </aside>
  );
}

function ModelPicker() {
  const queryClient = useQueryClient();
  const { data: config } = useQuery({
    queryKey: ["config"],
    queryFn: configApi.get,
  });
  const mutation = useMutation({
    mutationFn: (model: string) => configApi.setModel(model),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["config"] }),
  });

  if (!config) return null;

  return (
    <div
      style={{
        padding: "var(--space-3) var(--space-4)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <p
        style={{
          fontSize: "10px",
          color: "var(--color-text-3)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: "var(--space-2)",
        }}
      >
        Vision model
      </p>
      <select
        value={config.gemini_model}
        onChange={(e) => mutation.mutate(e.target.value)}
        style={{
          width: "100%",
          padding: "4px 8px",
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-sm)",
          color: mutation.isPending
            ? "var(--color-text-3)"
            : "var(--color-text-2)",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          cursor: "pointer",
          outline: "none",
        }}
      >
        {config.gemini_available_models.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
