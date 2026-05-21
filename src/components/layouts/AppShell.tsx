import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useActiveUser } from "../../store/useUserStore";

export function AppShell() {
  const user = useActiveUser();

  if (!user) return <Navigate to="/" replace />;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden", // prevent the shell itself from scrolling
        background: "var(--color-bg)",
      }}
    >
      <Sidebar />

      {/* main is THE scroll container for all pages */}
      <main
        style={{
          flex: 1,
          overflowY: "auto", // scroll happens here
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
