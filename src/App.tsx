import { Routes, Route, Navigate } from "react-router-dom";
import { UploadPage } from "./features/statement-upload/components/UploadPage";

export function App() {
  return (
    <Routes>
      {/* Redirect root to the upload page for current feature building */}
      <Route path="/" element={<Navigate to="/upload" />} />

      {/* Core Statement Upload Route */}
      <Route path="/upload" element={<UploadPage />} />

      {/* Catch-all fallback redirecting back to upload */}
      <Route path="*" element={<Navigate to="/upload" />} />
    </Routes>
  );
}
