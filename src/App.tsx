import { Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./core/components/Navbar/Navbar";
import { UploadPage } from "./features/statement-upload/components/UploadPage";
import { StatementManagePage } from "./features/statement-manage/components/StatementManagePage";
import { MonthlyInventoryPage } from "./features/monthly-inventory/components/MonthlyInventoryPage";

export function App() {
  return (
    <>
      <Navbar />
      <main style={{ padding: "0 24px" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/manage" />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/manage" element={<StatementManagePage />} />
          <Route path="/inventory" element={<MonthlyInventoryPage />} />
          <Route path="*" element={<Navigate to="/manage" />} />
        </Routes>
      </main>
    </>
  );
}
