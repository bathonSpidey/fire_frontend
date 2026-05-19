import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "./components/layouts/AppShell";
import { ProfileSelectorPage } from "./pages/ProfileSelectorPage";

// Placeholder pages — will be built page by page
const DashboardPage = () => <ComingSoon title="Dashboard" />;
const UploadPage = () => <ComingSoon title="Upload" />;
const TransactionsPage = () => <ComingSoon title="Transactions" />;
const InsightsPage = () => <ComingSoon title="Insights" />;

function ComingSoon({ title }: { title: string }) {
  return (
    <div style={{ padding: "var(--space-8)" }}>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text-2)",
        }}
      >
        {title} — coming soon
      </h2>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      {/* Profile selector — public, no shell */}
      <Route path="/" element={<ProfileSelectorPage />} />

      {/* App shell — requires active user */}
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/insights" element={<InsightsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
