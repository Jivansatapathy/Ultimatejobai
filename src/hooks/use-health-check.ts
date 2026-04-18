import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/interview-api";

export function useHealthCheck() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    const healthy = await api.checkHealth();
    setIsHealthy(healthy);
    setIsChecking(false);
  }, []);

  useEffect(() => {
    checkHealth();

    // Re-check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return { isHealthy, isChecking, checkHealth };
}
