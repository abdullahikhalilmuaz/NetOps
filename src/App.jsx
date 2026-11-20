import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import api from "./api";
import "./modules.css";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import Equipment from "./pages/equipment/Equipment";
import EquipmentDetail from "./pages/equipment/EquipmentDetail";
import Tickets from "./pages/tickets/Tickets";
import TicketDetail from "./pages/tickets/TicketDetail";
import Maintenance from "./pages/maintenance/Maintenance";
import Team from "./pages/team/Team";
import Reports from "./pages/reports/Reports";
import Notifications from "./pages/notifications/Notifications";
import Settings from "./pages/settings/Settings";

function Layout() {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const location = useLocation();

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get("/notifications")
      .then((res) => setUnread(res.data?.data?.unread || 0))
      .catch(() => {});
  }, [isAuthenticated, location.pathname]);

  if (loading) {
    return (
      <div className="page-content" style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <div className="stat-card" style={{ minWidth: 240, textAlign: "center" }}>
          <p className="stat-title">Loading NetOps…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      {sidebarOpen && <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} unread={unread} />
      <main className="main-area">
        <Topbar onMenu={() => setSidebarOpen(true)} unread={unread} />
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="equipment" element={<Equipment />} />
          <Route path="equipment/:id" element={<EquipmentDetail />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets/:id" element={<TicketDetail />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="team" element={<Team />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
