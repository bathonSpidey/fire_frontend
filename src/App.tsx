import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "./components/layouts/AppShell";
import { ProfileSelectorPage } from "./pages/ProfileSelectorPage";
import { UploadPage } from "./pages/UploadPage";

// Placeholder pages — built page by page
const DashboardPage = () => <ComingSoon title="Dashboard" />;
const TransactionsPage = () => <ComingSoon title="Transactions" />;
const InsightsPage = () => <ComingSoon title="Insights" />;

function ComingSoon({ title }: { title: string }) {
  return (
    <div style={{ padding: "var(--space-8)" }}>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text-2)",
          fontSize: "var(--text-2xl)",
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
      <Route path="/" element={<ProfileSelectorPage />} />

      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/insights" element={<InsightsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
