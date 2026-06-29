import api from "./api";

export interface SubscriptionPlanFeature {
  feature_key: string;
  feature_label?: string;
  is_enabled: boolean;
  monthly_limit: number | null;
  daily_limit?: number | null;
  limit_display?: string;
  notes: string;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  price_display: string;
  price_data?: {
    amount: number | null;
    currency: string;
    interval: string | null;
  } | null;
  description: string;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
  stripe_price_id?: string | null;
  features: SubscriptionPlanFeature[];
}

export interface SubscriptionUsageRow {
  feature_key: string;
  used_count: number;
  limit: number | null;
  remaining_count: number | null;
  is_unlimited: boolean;
  period_month: string;
}

export interface SubscriptionSummary {
  active_user_plan_id: number | null;
  status: string;
  start_at: string | null;
  end_at: string | null;
  plan: SubscriptionPlan | null;
  current_usage: SubscriptionUsageRow[];
  enabled_feature_keys: string[];
}

interface PaginatedPlansResponse {
  results?: SubscriptionPlan[];
}

export const subscriptionService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await api.get("/api/subscriptions/plans/");
    if (Array.isArray(response.data)) {
      return response.data;
    }

    const paginatedData = response.data as PaginatedPlansResponse;
    return Array.isArray(paginatedData?.results) ? paginatedData.results : [];
  },

  async getSummary(): Promise<SubscriptionSummary> {
    const response = await api.get("/api/subscriptions/summary/");
    return response.data;
  },

  async selectPlan(planSlug: string): Promise<SubscriptionSummary> {
    const response = await api.post("/api/subscriptions/select-plan/", { plan_slug: planSlug });
    return response.data;
  },

  async createCheckoutSession(planSlug: string): Promise<{ session_id: string; url: string }> {
    const response = await api.post("/api/subscriptions/stripe/checkout/", { plan_slug: planSlug });
    return response.data;
  },

  async upgradePlan(planSlug: string): Promise<SubscriptionSummary> {
    const response = await api.post("/api/subscriptions/stripe/upgrade/", { plan_slug: planSlug });
    return response.data;
  },
};
