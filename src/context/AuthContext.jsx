import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("netops_token"));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("netops_token")));

  useEffect(() => {
    const stored = localStorage.getItem("netops_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }

    if (!token) { setLoading(false); return; }

    let alive = true;
    api.get("/auth/me")
      .then((res) => {
        if (!alive) return;
        const u = res.data?.data?.user;
        if (u) {
          setUser(u);
          localStorage.setItem("netops_user", JSON.stringify(u));
        }
      })
      .catch(() => {
        if (!alive) return;
        localStorage.removeItem("netops_token");
        localStorage.removeItem("netops_user");
        setToken(null);
        setUser(null);
      })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [token]);

  const persist = useCallback((tokenValue, userValue) => {
    if (tokenValue) {
      localStorage.setItem("netops_token", tokenValue);
      setToken(tokenValue);
    }
    if (userValue) {
      localStorage.setItem("netops_user", JSON.stringify(userValue));
      setUser(userValue);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const data = res.data?.data || {};
    persist(data.token, data.user);
    return data;
  }, [persist]);

  const register = useCallback(async (payload) => {
    const res = await api.post("/auth/register", payload);
    const data = res.data?.data || {};
    persist(data.token, data.user);
    return data;
  }, [persist]);

  const logout = useCallback(() => {
    localStorage.removeItem("netops_token");
    localStorage.removeItem("netops_user");
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = Boolean(token && user);
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "it_manager";
  const isTechnician = user?.role === "technician";
  const isStaff = user?.role === "staff";
  const canManage = isAdmin || isManager;

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      isAuthenticated, isAdmin, isManager, isTechnician, isStaff, canManage,
      login, register, logout, setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
