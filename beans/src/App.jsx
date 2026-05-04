import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { apiJson } from "../frontend/api.js";
import Login from "../frontend/pages/login.jsx";
import Register from "../frontend/pages/register.jsx";
import Dashboard from "../frontend/pages/dashboard.jsx";

function RequireAuth({ children }) {
  const [ok, setOk] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        await apiJson("/auth/me");
        setOk(true);
      } catch {
        setOk(false);
      }
    })();
  }, []);

  if (ok === null) return null;
  if (!ok) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
