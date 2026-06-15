import { Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./core/components/Navbar/Navbar";
import { UploadPage } from "./features/statement-upload/components/UploadPage";

export function App() {
  return (
    <>
      <Navbar />
      <main style={{ padding: "0 24px" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/upload" />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="*" element={<Navigate to="/upload" />} />
        </Routes>
      </main>
    </>
  );
}
