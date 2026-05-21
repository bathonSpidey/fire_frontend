import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "./components/layouts/AppShell";
import { ProfileSelectorPage } from "./pages/ProfileSelectorPage";
import { UploadPage } from "./pages/UploadPage";
import { TransactionsPage } from "./pages/TransactionPage";
import { TransactionDetailPage } from "./pages/TransactionDetailPage";
import { ItemsPage } from "./pages/ItemsPage";
import { BanksPage } from "./pages/BanksPage";

const DashboardPage = () => <ComingSoon title="Dashboard" />;
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
        <Route path="/transactions/:id" element={<TransactionDetailPage />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/banks" element={<BanksPage />} />
        <Route path="/insights" element={<InsightsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
