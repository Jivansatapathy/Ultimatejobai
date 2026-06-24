import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config";

// Venus uses its own localStorage keys so the session is fully independent
// from the main Hizorex session.
const KEYS = {
  access:  "venus_access_token",
  refresh: "venus_refresh_token",
  email:   "venus_user_email",
  name:    "venus_user_name",
} as const;

interface VenusUser {
  email: string;
  name:  string;
}

interface VenusAuthContextValue {
  user:            VenusUser | null;
  isAuthenticated: boolean;
  loading:         boolean;
  login:           (email: string, password: string) => Promise<void>;
  logout:          () => void;
  getToken:        () => string | null;
}

const VenusAuthContext = createContext<VenusAuthContextValue | undefined>(undefined);

export function VenusAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<VenusUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(KEYS.access);
    const email = localStorage.getItem(KEYS.email);
    if (token && email) {
      setUser({ email, name: localStorage.getItem(KEYS.name) || email.split("@")[0] });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await axios.post(`${API_BASE_URL}/api/auth/token/`, { email, password });
    const { access, refresh } = res.data;
    localStorage.setItem(KEYS.access,  access);
    localStorage.setItem(KEYS.refresh, refresh);
    localStorage.setItem(KEYS.email,   email);
    const name = email.split("@")[0];
    localStorage.setItem(KEYS.name, name);
    setUser({ email, name });
  };

  const logout = () => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    setUser(null);
  };

  const getToken = () => localStorage.getItem(KEYS.access);

  return (
    <VenusAuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout, getToken }}>
      {children}
    </VenusAuthContext.Provider>
  );
}

export function useVenusAuth() {
  const ctx = useContext(VenusAuthContext);
  if (!ctx) throw new Error("useVenusAuth must be used within VenusAuthProvider");
  return ctx;
}
