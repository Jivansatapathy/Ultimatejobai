import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { EmployerProfile } from "@/types/employer";
import { getEmployerBootstrap, EmployerBootstrapResponse } from "@/services/employerService";
import { useAuth } from "@/context/AuthContext";

interface EmployerAuthContextValue {
  user: { email: string | null } | null;
  profile: EmployerProfile | null;
  bootstrap: EmployerBootstrapResponse | null;
  loading: boolean;
  isEmployer: boolean;
  logout: () => void | Promise<void>;
  refreshProfile: () => Promise<void>;
}

const EmployerAuthContext = createContext<EmployerAuthContextValue | undefined>(undefined);

export function EmployerAuthProvider({ children }: { children: React.ReactNode }) {
  const [bootstrap, setBootstrap] = useState<EmployerBootstrapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, userEmail, userRole, loading: authLoading, logout } = useAuth();
  const isEmployerFromAuth = userRole === "employer" || userRole === "admin";

  const refreshProfile = async () => {
    if (!isAuthenticated) {
      setBootstrap(null);
      return;
    }
    try {
      const data = await getEmployerBootstrap();
      setBootstrap(data);
    } catch (error) {
      console.error("Failed to bootstrap employer data:", error);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated || !isEmployerFromAuth) {
        setBootstrap(null);
        return;
      }

      setLoading(true);
      try {
        await refreshProfile();
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, isEmployerFromAuth]);

  const value = useMemo(
    () => ({
      user: isAuthenticated ? { email: userEmail } : null,
      profile: bootstrap?.profile || null,
      bootstrap: bootstrap,
      loading: authLoading || loading,
      isEmployer:
        bootstrap?.permissions?.workspace_role === "admin" ||
        bootstrap?.profile?.role === "admin" ||
        userRole === "employer" ||
        userRole === "admin",
      logout,
      refreshProfile,
    }),
    [authLoading, isAuthenticated, loading, logout, bootstrap, userEmail, userRole],
  );

  return <EmployerAuthContext.Provider value={value}>{children}</EmployerAuthContext.Provider>;
}

export function useEmployerAuth() {
  const context = useContext(EmployerAuthContext);
  if (!context) {
    throw new Error("useEmployerAuth must be used within EmployerAuthProvider");
  }
  return context;
}
