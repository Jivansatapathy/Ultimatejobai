import api from "./api";

export interface SubscriptionPlanFeature {
  feature_key: string;
  is_enabled: boolean;
  monthly_limit: number | null;
  notes: string;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  price_display: string;
  description: string;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
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

export const subscriptionService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await api.get("/api/subscriptions/plans/");
    return Array.isArray(response.data) ? response.data : [];
  },

  async getSummary(): Promise<SubscriptionSummary> {
    const response = await api.get("/api/subscriptions/summary/");
    return response.data;
  },

  async selectPlan(planSlug: string): Promise<SubscriptionSummary> {
    const response = await api.post("/api/subscriptions/select-plan/", { plan_slug: planSlug });
    return response.data;
  },
};
