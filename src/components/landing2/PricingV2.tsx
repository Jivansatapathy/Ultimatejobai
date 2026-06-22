import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, Sparkles, Briefcase, Crown, Phone, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { planUiConfig, plans as staticPlans } from "@/data/plans";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPrice = (plan: any, annual: boolean): string => {
  if (plan.slug === "free" || plan.is_default) return "Free";
  const pd = plan.price_data;
  if (pd?.amount != null) {
    const amount = annual ? Math.round(pd.amount * 0.8) : pd.amount;
    const cur = (pd.currency || "usd").toUpperCase();
    return new Intl.NumberFormat(undefined, {
      style: "currency", currency: cur,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return plan.price_display || plan.price || "";
};

const getFeatures = (plan: any, ui: any): string[] => {
  const fromApi = Array.isArray(plan.features)
    ? plan.features.filter((f: any) => f.is_enabled).map((f: any) =>
        f.feature_label || f.feature_key.replace(/_/g, " ")
      )
    : [];
  return (fromApi.length ? fromApi : ui?.highlights || []).slice(0, 5);
};

// ─── Plan config ──────────────────────────────────────────────────────────────

const PLAN_CONFIG: Record<string, {
  icon: React.ElementType;
  badge?: string;
  featured?: boolean;
  callout?: string;
}> = {
  free:         { icon: Sparkles, callout: "15-min call · Free forever" },
  beginner:     { icon: Phone, callout: "1 session/mo · 30 min" },
  professional: { icon: Briefcase, featured: true, badge: "Most Popular", callout: "2 sessions/mo · 60 min total" },
  personal:     { icon: Crown, badge: "Premium", callout: "3 sessions/mo + dedicated recruiter" },
  // legacy slugs
  starter:      { icon: Phone, callout: "1 session/mo · 30 min" },
  premium:      { icon: Briefcase, featured: true, badge: "Most Popular", callout: "2 sessions/mo · 60 min total" },
  premium_tier: { icon: Crown, badge: "Premium", callout: "3 sessions/mo + dedicated recruiter" },
  executive:    { icon: Crown, badge: "Premium", callout: "3 sessions/mo + dedicated recruiter" },
};

const fallbackConfig = { icon: Phone };

// ─── Card ─────────────────────────────────────────────────────────────────────

function PricingCard({
  plan, index, annual, onSelect, isCurrent,
}: {
  plan: any; index: number; annual: boolean; onSelect: () => void; isCurrent: boolean;
}) {
  const ui       = planUiConfig[plan.slug] || planUiConfig.free;
  const config   = PLAN_CONFIG[plan.slug] || fallbackConfig;
  const Icon     = config.icon;
  const price    = formatPrice(plan, annual);
  const isFree   = price === "Free";
  const features = getFeatures(plan, ui);

  if (config.featured) {
    // Dark inverted featured card
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.07 }}
        className="relative flex flex-col w-full rounded-3xl px-6 py-10 sm:px-8 sm:py-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-500/30 z-10"
      >
        {/* Badge */}
        {config.badge && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-white text-blue-700 shadow-lg">
            {config.badge}
          </div>
        )}

        {/* Icon */}
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <Icon className="h-6 w-6 text-white" />
        </div>

        {/* Name */}
        <h3 className="text-xl font-extrabold tracking-tight">{ui.name}</h3>

        {/* Session callout */}
        {config.callout && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 w-fit">
            <Clock className="h-3 w-3 text-white/80" />
            <span className="text-[11px] font-semibold text-white/90">{config.callout}</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-5 mb-1 flex items-end gap-1">
          <span className="text-5xl font-black tracking-tight leading-none">{price}</span>
          {!isFree && <span className="text-blue-300 text-base font-semibold mb-1">/{ui.subtitle || "mo"}</span>}
        </div>
        {annual && !isFree && (
          <p className="text-blue-200 text-xs font-semibold mb-3">Billed annually · 20% off</p>
        )}

        {/* Divider */}
        <p className="text-blue-100/80 text-sm leading-relaxed mt-3 mb-6 pb-6 border-b border-white/20">
          {ui.description || ""}
        </p>

        {/* Features */}
        <ul className="space-y-3 mb-8 flex-1">
          {features.map((feat: string) => (
            <li key={feat} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/25">
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              </div>
              <span className="text-sm text-blue-50 font-medium leading-snug">{feat}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          type="button"
          onClick={onSelect}
          disabled={isCurrent}
          className={`group flex items-center justify-center gap-2 w-full h-12 rounded-2xl font-bold text-sm transition-all ${
            isCurrent
              ? "bg-white/20 text-white/60 cursor-default"
              : "bg-white text-blue-700 hover:bg-blue-50 shadow-lg"
          }`}
        >
          {isCurrent ? "Current Plan" : (ui.cta || "Get Started")}
          {!isCurrent && <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />}
        </button>
      </motion.div>
    );
  }

  // Standard card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="relative flex flex-col w-full rounded-3xl border border-gray-200 bg-white p-8 hover:shadow-xl hover:border-gray-300 transition-all duration-300"
    >
      {/* Badge for non-featured plans */}
      {config.badge && (
        <div className="absolute -top-3.5 left-6 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
          {config.badge}
        </div>
      )}

      {/* Icon */}
      <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
        <Icon className="h-6 w-6 text-gray-600" />
      </div>

      {/* Name */}
      <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">{ui.name}</h3>

      {/* Session callout */}
      {config.callout && (
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 w-fit">
          <Clock className="h-3 w-3 text-gray-500" />
          <span className="text-[11px] font-semibold text-gray-600">{config.callout}</span>
        </div>
      )}

      {/* Price */}
      <div className="mt-5 mb-1 flex items-end gap-1">
        <span className="text-4xl font-black text-gray-900 tracking-tight leading-none">{price}</span>
        {!isFree && <span className="text-gray-400 text-base font-semibold mb-1">/{ui.subtitle || "mo"}</span>}
      </div>
      {annual && !isFree && (
        <p className="text-emerald-600 text-xs font-semibold mb-1">Billed annually · save 20%</p>
      )}

      {/* Description */}
      <p className="text-gray-500 text-sm leading-relaxed mt-3 mb-6 pb-6 border-b border-gray-100">
        {ui.description || ""}
      </p>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feat: string) => (
          <li key={feat} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50">
              <Check className="h-3 w-3 text-blue-600" strokeWidth={3} />
            </div>
            <span className="text-sm text-gray-600 font-medium leading-snug">{feat}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        type="button"
        onClick={onSelect}
        disabled={isCurrent}
        className={`group flex items-center justify-center gap-2 w-full h-12 rounded-2xl font-bold text-sm transition-all ${
          isCurrent
            ? "bg-gray-100 text-gray-400 cursor-default"
            : "border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-lg hover:shadow-blue-100"
        }`}
      >
        {isCurrent ? "Current Plan" : (ui.cta || "Get Started")}
        {!isCurrent && <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />}
      </button>
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export const PricingV2 = () => {
  const [annual, setAnnual] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { plans, summary, loadingPlans, selectPlan, initiateCheckout } = useSubscription();

  // Prefer the 4 canonical slugs in order; fall back to static definitions
  const CANONICAL = ["free", "beginner", "professional", "personal"];
  const apiBySlug = Object.fromEntries(plans.map(p => [p.slug, p]));
  const displayPlans = CANONICAL.map(slug => apiBySlug[slug]).filter(Boolean).length === 4
    ? CANONICAL.map(slug => apiBySlug[slug])
    : staticPlans.map(p => ({ slug: p.slug, name: p.name, price_display: p.price, features: [], price_data: null, is_default: p.slug === "free" }));

  const gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-7xl";

  const isPaid = (slug: string) => {
    const p = plans.find(x => x.slug === slug);
    return Boolean(p?.stripe_price_id || (p?.price_data?.amount && p.price_data.amount > 0) || (slug !== "free" && slug !== "explorer"));
  };

  const handleSelect = async (slug: string) => {
    if (!isAuthenticated) {
      const params = new URLSearchParams({ mode: "signup", plan: slug });
      if (isPaid(slug)) params.set("checkout", "1");
      navigate(`/auth?${params.toString()}`);
      return;
    }
    try {
      if (isPaid(slug)) {
        await initiateCheckout(slug);
      } else {
        await selectPlan(slug);
        toast.success("Plan updated.");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to update plan.");
    }
  };

  return (
    <section id="pricing" className="relative bg-white py-16 sm:py-28 px-4 sm:px-6 overflow-hidden">
      {/* Subtle background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-blue-50 blur-3xl opacity-70" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-indigo-50 blur-3xl opacity-60" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700 mb-5">
            Pricing
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
            Executive recruiter access,{" "}
            <span className="text-blue-600">built for your career stage</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
            From a free 15-minute career consultation to a dedicated executive recruiter — every plan includes full AI platform access.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-4 rounded-2xl bg-gray-100 p-1.5">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                !annual ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                annual ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Annual
              <span className="rounded-full bg-emerald-100 text-emerald-700 text-xs font-black px-2 py-0.5">
                −20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Loading skeletons */}
        {loadingPlans && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 py-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`rounded-3xl border border-gray-100 bg-gray-50 animate-pulse ${i === 2 ? "h-[540px]" : "h-[480px]"}`} />
            ))}
          </div>
        )}

        {/* Cards */}
        {!loadingPlans && displayPlans.length > 0 && (
          <div className={`mx-auto grid gap-5 items-stretch py-6 w-full ${gridCols}`}>
            {displayPlans.map((plan, i) => (
              <PricingCard
                key={plan.slug}
                plan={plan}
                index={i}
                annual={annual}
                onSelect={() => handleSelect(plan.slug)}
                isCurrent={summary?.plan?.slug === plan.slug}
              />
            ))}
          </div>
        )}

        {!loadingPlans && displayPlans.length === 0 && (
          <p className="text-center text-gray-400 py-16">Pricing unavailable right now.</p>
        )}

        {/* Footer */}
        <motion.div
          className="mt-12 text-center space-y-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 }}
        >
          <p className="text-sm text-gray-400 font-medium">
            No credit card required for the free consultation · Cancel anytime · Secure payments via Stripe
          </p>
        </motion.div>
      </div>
    </section>
  );
};
