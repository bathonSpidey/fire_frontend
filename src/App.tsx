import { Routes, Route, Navigate } from "react-router-dom";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
    </Routes>
  );
}
