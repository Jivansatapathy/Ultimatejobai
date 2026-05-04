import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Crown, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { planUiConfig, plans as fallbackPlans } from "@/data/plans";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import type { SubscriptionPlan, SubscriptionPlanFeature } from "@/services/subscriptionService";
import { PlanComparisonTable } from "./PlanComparisonTable";

interface PlansSectionProps {
  compact?: boolean;
}

const formatPlanPrice = (plan: Partial<SubscriptionPlan> & { price?: string }) => {
  if (plan.price_display) {
    return plan.price_display;
  }

  const priceData = plan.price_data;
  if (priceData?.amount !== null && priceData?.amount !== undefined) {
    const currency = (priceData.currency || "usd").toUpperCase();
    const symbol = currency === "USD" ? "$" : `${currency} `;
    const amount = Number.isInteger(priceData.amount) ? priceData.amount.toFixed(0) : priceData.amount.toFixed(2);
    const interval = priceData.interval === "month" ? "/mo" : priceData.interval ? `/${priceData.interval}` : "";
    return `${symbol}${amount}${interval}`;
  }

  return plan.price || "";
};

const formatFeatureText = (feature: SubscriptionPlanFeature) => {
  const label = feature.feature_label || feature.feature_key.replace(/_/g, " ");
  if (!feature.limit_display || feature.limit_display === "Unlimited") return label;
  return `${label}: ${feature.limit_display}`;
};

const getEnabledFeatureText = (plan: Partial<SubscriptionPlan>) => {
  if (!("features" in plan) || !Array.isArray(plan.features)) return [];
  return plan.features.filter((feature) => feature.is_enabled).map(formatFeatureText);
};

export function PlansSection({ compact = false }: PlansSectionProps) {
  const { isAuthenticated } = useAuth();
  const { plans, summary, loadingPlans, selectPlan, initiateCheckout } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSelectionFlow = searchParams.get("select") === "1";
  const isWelcomeFlow = searchParams.get("welcome") === "1";
  const executiveApiPlan = plans.find((plan) => plan.slug === "executive" || plan.slug === "enterprise");
  const executivePrice = executiveApiPlan ? formatPlanPrice(executiveApiPlan) : planUiConfig.executive.price;
  const executivePlanSlug = executiveApiPlan?.slug || "executive";
  const planSource = plans.length > 0 ? plans : fallbackPlans;
  const primaryPlans = planSource
    .filter((plan) => !["explorer", "enterprise", "executive"].includes(plan.slug))
    .slice(0, 3);

  const handlePlanAction = async (planSlug: string) => {
    if (!isAuthenticated) {
      return;
    }

    const plan = plans.find((p) => p.slug === planSlug);
    // Robust check for paid plans: either price_data indicates a price, or it's a known paid slug and not the free one
    const isPaid = (plan?.price_data?.amount && plan.price_data.amount > 0) || (planSlug !== "free" && planSlug !== "explorer");

    try {
      if (isPaid) {
        await initiateCheckout(planSlug);
      } else {
        await selectPlan(planSlug);
        toast.success("Plan updated successfully.");
        if (isSelectionFlow) {
          navigate("/resume");
        }
      }
    } catch (error: any) {
      console.error("Failed to handle plan action:", error);
      toast.error(error?.response?.data?.error || "Failed to update plan.");
    }
  };

  return (
    <section className={compact ? "py-20 bg-[#0f0e0e]" : "py-28 bg-[#0f0e0e]"}>
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-orange-400 mb-6">
            Pricing
          </span>
          <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl leading-tight mb-4">
            Invest in your{" "}
            <span className="text-orange-400">next big move.</span>
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            Transparent pricing for every stage — from early discovery to executive transitions.
          </p>
        </motion.div>

        {/* Main Tiers */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {primaryPlans
            .map((plan, index) => {
              const ui = planUiConfig[plan.slug] || planUiConfig.free;
              const isPopular = plan.slug === "starter" || plan.slug === "premium" || index === 1;
              const PlanIcon = ui?.icon || Sparkles;
              const displayPrice = formatPlanPrice(plan);
              const featureHighlights = getEnabledFeatureText(plan);
              const visibleFeatures = featureHighlights.length ? featureHighlights.slice(0, 5) : (ui?.highlights || []).slice(0, 5);

              return (
                <motion.div
                  key={plan.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className={`relative flex flex-col rounded-2xl border p-7 transition-all duration-300 ${
                    isPopular
                      ? "border-orange-500/40 bg-orange-500/5 ring-1 ring-orange-500/20"
                      : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.14]"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest">
                      Most Popular
                    </div>
                  )}

                  {/* Plan name & icon */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${isPopular ? "border-orange-500/40 bg-orange-500/15 text-orange-400" : "border-white/10 bg-white/5 text-slate-400"}`}>
                      <PlanIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white tracking-tight">{plan.name || ui?.name}</h3>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${isPopular ? "text-orange-400" : "text-slate-500"}`}>{ui?.subtitle || ""}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-white/[0.06]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white tracking-tight">{displayPrice}</span>
                      {displayPrice && !displayPrice.includes('/mo') && displayPrice !== "Rs 0" && displayPrice !== "Free" && (
                        <span className="text-xs font-medium text-slate-500">/month</span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                      {"description" in plan && plan.description ? plan.description : ui?.description || ""}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-7 flex-1">
                    {visibleFeatures.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${isPopular ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-slate-400"}`}>
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        </div>
                        <span className="text-sm text-slate-300 font-medium leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handlePlanAction(plan.slug)}
                    className={`w-full h-11 rounded-xl text-sm font-bold transition-all ${
                      isPopular
                        ? "bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/20"
                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20"
                    }`}
                  >
                    {!isAuthenticated ? (
                      <Link to="/auth?mode=signup" className="flex items-center justify-center w-full h-full">
                        {ui?.cta || "Get Started"}
                      </Link>
                    ) : (
                      summary?.plan?.slug === plan.slug ? "Current Plan" : (ui?.cta || "Select Plan")
                    )}
                  </Button>
                </motion.div>
              );
            })}
        </div>

        {/* Executive Tier */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8"
        >
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-5">
                <Crown className="h-3 w-3 text-orange-400" />
                White Glove Service
              </span>
              <h3 className="text-2xl font-black text-white tracking-tight mb-3">
                {executiveApiPlan?.name || "Executive Roadmap"}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-md">
                {executiveApiPlan?.description || "Personalized career strategy with 1-on-1 human coaching, unlimited interview simulations, and white-glove personal branding."}
              </p>
              <div className="flex flex-wrap gap-2">
                {(executiveApiPlan ? getEnabledFeatureText(executiveApiPlan).slice(0, 3) : ["Human Coaching", "Priority Intake", "Concierge"]).map(tag => (
                  <span key={tag} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tag}</span>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-72 rounded-xl border border-white/10 bg-white/5 p-7 text-center">
              <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Starting at</p>
              <div className="flex justify-center items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-white tracking-tight">{executivePrice}</span>
                {!executivePrice.includes("/mo") && <span className="text-xs font-medium text-slate-500">/mo</span>}
              </div>
              <Button
                onClick={() => handlePlanAction(executivePlanSlug)}
                className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/20"
              >
                Contact Strategy Team
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Feature Comparison Section */}
        {!compact && (
          <div className="mt-32">
            <div className="text-center mb-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-400 mb-4">Full Breakdown</p>
              <h3 className="text-3xl font-black text-white tracking-tight">Compare all features</h3>
            </div>
            <PlanComparisonTable plans={plans} />
          </div>
        )}

        <div className="mt-20 text-center">
          <Link to={isAuthenticated ? "/dashboard" : "/auth?mode=signup"}>
            <Button className="h-14 px-12 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-black text-base shadow-lg shadow-orange-500/20 transition-all group">
              {loadingPlans ? "Loading..." : "Start Your Career"}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="mt-4 text-xs text-slate-600 uppercase tracking-widest font-bold">
            No credit card required for Free tier
          </p>
        </div>
      </div>
    </section>
  );
}
