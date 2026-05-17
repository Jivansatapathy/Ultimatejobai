import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import {
  subscriptionService,
  SubscriptionPlan,
  SubscriptionSummary,
} from "@/services/subscriptionService";

interface SubscriptionContextType {
  plans: SubscriptionPlan[];
  summary: SubscriptionSummary | null;
  loadingPlans: boolean;
  loadingSummary: boolean;
  selectPlan: (planSlug: string) => Promise<SubscriptionSummary | null>;
  initiateCheckout: (planSlug: string) => Promise<void>;
  refreshPlans: () => Promise<void>;
  refreshSummary: () => Promise<void>;
  hasFeature: (featureKey: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const isEmployerRoute = typeof window !== "undefined" && window.location.pathname.startsWith("/employer");
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(Boolean(isAuthenticated));

  const refreshPlans = async () => {
    setLoadingPlans(true);
    try {
      const nextPlans = await subscriptionService.getPlans();
      setPlans(nextPlans);
    } catch (error) {
      console.error("Failed to load plans:", error);
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  const refreshSummary = async () => {
    if (!isAuthenticated) {
      setSummary(null);
      setLoadingSummary(false);
      return;
    }

    setLoadingSummary(true);
    try {
      const nextSummary = await subscriptionService.getSummary();
      setSummary(nextSummary);
    } catch (error) {
      console.error("Failed to load subscription summary:", error);
      setSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  const selectPlan = async (planSlug: string) => {
    if (!isAuthenticated) {
      return null;
    }

    const nextSummary = await subscriptionService.selectPlan(planSlug);
    setSummary(nextSummary);
    return nextSummary;
  };

  const initiateCheckout = async (planSlug: string) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const { url } = await subscriptionService.createCheckoutSession(planSlug);
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Failed to initiate checkout:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (isEmployerRoute) {
      setLoadingPlans(false);
      return;
    }
    refreshPlans();
  }, [isEmployerRoute]);

  useEffect(() => {
    if (isEmployerRoute) {
      setSummary(null);
      setLoadingSummary(false);
      return;
    }
    refreshSummary();
  }, [isAuthenticated, isEmployerRoute]);

  const value = useMemo(
    () => ({
      plans,
      summary,
      loadingPlans,
      loadingSummary,
      selectPlan,
      initiateCheckout,
      refreshPlans,
      refreshSummary,
      hasFeature: (_featureKey: string) => true, // All features unlocked for all users
    }),
    [plans, summary, loadingPlans, loadingSummary],
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
