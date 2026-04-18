import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { activityTracker } from "@/services/activityTracker";


export function ActivityAuditObserver() {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    activityTracker.trackPageView(location.pathname, location.search);
  }, [isAuthenticated, loading, location.pathname, location.search]);

  return null;
}
