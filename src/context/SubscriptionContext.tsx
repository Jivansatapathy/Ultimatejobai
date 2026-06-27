import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

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
  checkoutLoadingSlug: string | null;
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
  const [checkoutLoadingSlug, setCheckoutLoadingSlug] = useState<string | null>(null);

  const refreshPlans = useCallback(async () => {
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
  }, []);

  const refreshSummary = useCallback(async () => {
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
  }, [isAuthenticated]);

  const selectPlan = useCallback(async (planSlug: string) => {
    if (!isAuthenticated) {
      return null;
    }

    const nextSummary = await subscriptionService.selectPlan(planSlug);
    setSummary(nextSummary);
    return nextSummary;
  }, [isAuthenticated]);

  const initiateCheckout = useCallback(async (planSlug: string) => {
    if (!isAuthenticated) {
      return;
    }

    setCheckoutLoadingSlug(planSlug);
    try {
      const { url } = await subscriptionService.createCheckoutSession(planSlug);
      if (url) {
        // Leave the loader on — the browser is about to navigate to Stripe,
        // clearing it here would flash the buttons back to normal first.
        window.location.href = url;
        return;
      }
      setCheckoutLoadingSlug(null);
    } catch (error) {
      console.error("Failed to initiate checkout:", error);
      setCheckoutLoadingSlug(null);
      throw error;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isEmployerRoute) {
      setLoadingPlans(false);
      return;
    }
    refreshPlans();
  }, [isEmployerRoute, refreshPlans]);

  useEffect(() => {
    if (isEmployerRoute) {
      setSummary(null);
      setLoadingSummary(false);
      return;
    }
    refreshSummary();
  }, [isAuthenticated, isEmployerRoute, refreshSummary]);

  const value = useMemo(
    () => ({
      plans,
      summary,
      loadingPlans,
      loadingSummary,
      checkoutLoadingSlug,
      selectPlan,
      initiateCheckout,
      refreshPlans,
      refreshSummary,
      hasFeature: (_featureKey: string) => true, // All features unlocked for all users
    }),
    [plans, summary, loadingPlans, loadingSummary, checkoutLoadingSlug],
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
