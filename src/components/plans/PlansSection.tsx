import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Crown, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { planUiConfig } from "@/data/plans";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import type { SubscriptionPlan, SubscriptionPlanFeature } from "@/services/subscriptionService";
import { PlanComparisonTable } from "./PlanComparisonTable";

interface PlansSectionProps {
  compact?: boolean;
}

const formatPlanPrice = (plan: Partial<SubscriptionPlan> & { price?: string }) => {
  if (plan.slug === "free" || plan.is_default) return plan.price_display || "Free";
  const priceData = plan.price_data;
  if (priceData?.amount !== null && priceData?.amount !== undefined) {
    const currency = (priceData.currency || "usd").toUpperCase();
    const amount = new Intl.NumberFormat(undefined, {
      style: "currency", currency,
      maximumFractionDigits: Number.isInteger(priceData.amount) ? 0 : 2,
    }).format(priceData.amount);
    const interval = priceData.interval === "month" ? "/mo" : priceData.interval ? `/${priceData.interval}` : "";
    return `${amount}${interval}`;
  }
  return plan.price_display || plan.price || "";
};

const formatFeatureText = (feature: SubscriptionPlanFeature) => {
  const label = feature.feature_label || feature.feature_key.replace(/_/g, " ");
  if (!feature.limit_display || feature.limit_display === "Unlimited") return label;
  return `${label}: ${feature.limit_display}`;
};

const getEnabledFeatureText = (plan: Partial<SubscriptionPlan>) => {
  if (!("features" in plan) || !Array.isArray(plan.features)) return [];
  return plan.features.filter((f) => f.is_enabled).map(formatFeatureText);
};

export function PlansSection({ compact = false }: PlansSectionProps) {
  const { isAuthenticated } = useAuth();
  const { plans, summary, loadingPlans, selectPlan, initiateCheckout } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSelectionFlow = searchParams.get("select") === "1";

  const executiveApiPlan = plans.find((p) => p.slug === "executive" || p.slug === "enterprise");
  const executivePrice = executiveApiPlan ? formatPlanPrice(executiveApiPlan) : "";
  const executivePlanSlug = executiveApiPlan?.slug || "executive";

  const primaryPlans = plans
    .filter((p) => !["explorer", "enterprise", "executive"].includes(p.slug))
    .slice(0, 3);

  const isPaidPlan = (slug: string) => {
    const plan = plans.find((p) => p.slug === slug);
    return Boolean(plan?.stripe_price_id || (plan?.price_data?.amount && plan.price_data.amount > 0) || (slug !== "free" && slug !== "explorer"));
  };

  const signupUrlForPlan = (slug: string) => {
    const params = new URLSearchParams({ mode: "signup", plan: slug });
    if (isPaidPlan(slug)) params.set("checkout", "1");
    return `/auth?${params.toString()}`;
  };

  const handlePlanAction = async (slug: string) => {
    if (!isAuthenticated) { navigate(signupUrlForPlan(slug)); return; }
    try {
      if (isPaidPlan(slug)) {
        await initiateCheckout(slug);
      } else {
        await selectPlan(slug);
        toast.success("Plan updated successfully.");
        if (isSelectionFlow) navigate("/resume");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to update plan.");
    }
  };

  return (
    <section className={`bg-white border-t border-black/[0.07] ${compact ? "py-20" : "py-28"}`}>
      <div className="mx-auto max-w-6xl px-6">

        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-black/50 mb-5">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-black leading-tight mb-4">
            Invest in Your<br />
            <span className="text-black/30">Next Executive Move</span>
          </h2>
          <p className="text-black/40 text-base max-w-xl mx-auto leading-relaxed">
            Transparent pricing for every stage — from early discovery to full C-Suite transition.
          </p>
        </motion.div>

        {loadingPlans && (
          <div className="mb-6 rounded-2xl border border-black/[0.08] bg-black/[0.02] p-8 text-center text-sm font-bold text-black/40">
            Loading pricing…
          </div>
        )}

        {!loadingPlans && primaryPlans.length === 0 && (
          <div className="mb-6 rounded-2xl border border-black/10 bg-black/[0.03] p-8 text-center">
            <p className="text-sm font-bold text-black">Pricing unavailable right now.</p>
            <p className="mt-2 text-xs text-black/40">Please check the subscription API configuration.</p>
          </div>
        )}

        {/* Plan cards */}
        {primaryPlans.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6 items-stretch">
            {primaryPlans.map((plan, index) => {
              const ui = planUiConfig[plan.slug] || planUiConfig.free;
              const isPopular = plan.slug === "starter" || plan.slug === "premium" || index === 1;
              const PlanIcon = ui?.icon || Sparkles;
              const displayPrice = formatPlanPrice(plan);
              const featureHighlights = getEnabledFeatureText(plan);
              const visibleFeatures = featureHighlights.length
                ? featureHighlights.slice(0, 6)
                : (ui?.highlights || []).slice(0, 6);
              const isCurrent = summary?.plan?.slug === plan.slug;

              return (
                <motion.div
                  key={plan.slug}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className={`relative flex flex-col rounded-2xl border p-7 transition-all duration-200 ${
                    isPopular
                      ? "bg-black border-black text-white shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
                      : "bg-white border-black/[0.10] hover:border-black/25 hover:shadow-lg"
                  }`}
                >
                  {/* Popular badge */}
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest shadow-sm">
                      Most Popular
                    </div>
                  )}

                  {/* Plan header */}
                  <div className="flex items-center gap-3 mb-7">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                      isPopular ? "border-white/20 bg-white/10 text-white" : "border-black/10 bg-black/[0.04] text-black/60"
                    }`}>
                      <PlanIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className={`text-base font-extrabold tracking-tight ${isPopular ? "text-white" : "text-black"}`}>
                        {plan.name || ui?.name}
                      </h3>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${isPopular ? "text-white/50" : "text-black/35"}`}>
                        {ui?.subtitle || ""}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className={`mb-7 pb-7 border-b ${isPopular ? "border-white/10" : "border-black/[0.07]"}`}>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className={`text-4xl font-extrabold tracking-tight ${isPopular ? "text-white" : "text-black"}`}>
                        {displayPrice}
                      </span>
                      {displayPrice && !displayPrice.includes("/mo") && displayPrice !== "Rs 0" && displayPrice !== "Free" && (
                        <span className={`text-xs font-medium ${isPopular ? "text-white/40" : "text-black/35"}`}>/month</span>
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${isPopular ? "text-white/45" : "text-black/40"}`}>
                      {"description" in plan && plan.description ? plan.description : ui?.description || ""}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8 flex-1">
                    {visibleFeatures.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                          isPopular ? "bg-white/15 text-white" : "bg-black/[0.06] text-black/70"
                        }`}>
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </div>
                        <span className={`text-sm font-medium leading-snug ${isPopular ? "text-white/80" : "text-black/65"}`}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    type="button"
                    onClick={() => handlePlanAction(plan.slug)}
                    className={`w-full h-12 rounded-xl text-sm font-bold transition-all ${
                      isPopular
                        ? "bg-white hover:bg-white/90 text-black"
                        : "bg-black hover:bg-black/80 text-white"
                    } ${isCurrent ? "opacity-60 cursor-default" : ""}`}
                    disabled={isCurrent}
                  >
                    {isCurrent ? "Current Plan" : (ui?.cta || "Get Started")}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Executive / Enterprise tier */}
        {executiveApiPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 rounded-2xl border border-black/[0.08] bg-[#f9f9f9] p-8 md:p-10"
          >
            <div className="flex flex-col lg:flex-row items-center gap-10">
              <div className="flex-1">
                <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.05] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black/50 mb-5">
                  <Crown className="h-3 w-3 text-black/60" />
                  White Glove Service
                </span>
                <h3 className="text-2xl font-extrabold text-black tracking-tight mb-3">
                  {executiveApiPlan.name || "Executive Roadmap"}
                </h3>
                <p className="text-black/45 text-sm leading-relaxed mb-6 max-w-md">
                  {executiveApiPlan.description || "Personalized career strategy with 1-on-1 human coaching, unlimited Apex™ applications, and white-glove personal branding for senior leaders."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(getEnabledFeatureText(executiveApiPlan).slice(0, 3).length
                    ? getEnabledFeatureText(executiveApiPlan).slice(0, 3)
                    : ["Human Coaching", "Priority Intake", "Concierge Support"]
                  ).map((tag) => (
                    <span key={tag} className="rounded-lg border border-black/10 bg-black/[0.04] px-3 py-1 text-[10px] font-bold text-black/50 uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-72 rounded-2xl border border-black/10 bg-white p-7 text-center shadow-sm">
                <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">Starting at</p>
                <div className="flex justify-center items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-black tracking-tight">{executivePrice}</span>
                  {!executivePrice.includes("/mo") && !/contact/i.test(executivePrice) && (
                    <span className="text-xs font-medium text-black/35">/mo</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handlePlanAction(executivePlanSlug)}
                  className="w-full h-12 rounded-xl bg-black hover:bg-black/80 text-white font-bold text-sm transition-all"
                >
                  Contact Strategy Team
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Comparison table */}
        {!compact && (
          <div className="mt-24">
            <div className="text-center mb-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/30 mb-4">Full Breakdown</p>
              <h3 className="text-3xl font-extrabold text-black tracking-tight">Compare all features</h3>
            </div>
            <PlanComparisonTable plans={plans} />
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Link to={isAuthenticated ? "/dashboard" : "/auth?mode=signup"}>
            <button type="button" className="inline-flex items-center gap-2 h-13 px-12 rounded-xl bg-black hover:bg-black/80 text-white font-bold text-base transition-all group">
              {loadingPlans ? "Loading…" : "Start Your Executive Journey"}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </Link>
          <p className="mt-4 text-xs text-black/25 uppercase tracking-widest font-bold">
            No credit card required for Free tier
          </p>
        </div>
      </div>
    </section>
  );
}
