import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useActiveUser } from "../../store/useUserStore";

export function AppShell() {
  const user = useActiveUser();

  // Redirect to profile selector if no user is active
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--color-bg)",
      }}
    >
      <Sidebar />

      <main
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
