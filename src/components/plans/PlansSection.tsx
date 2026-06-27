import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Check, Clock, Crown, Phone, Sparkles, Briefcase, X, Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { planUiConfig } from "@/data/plans";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import type { SubscriptionPlan } from "@/services/subscriptionService";

interface PlansSectionProps {
  compact?: boolean;
}

// ─── Plan definitions ─────────────────────────────────────────────────────────

const PLANS = [
  {
    slug: "free",
    name: "Free Executive Assessment",
    price: "Free",
    priceNote: "",
    callout: "15-min call · No commitment",
    description: "A complimentary 15-minute consultation with a senior executive recruiter.",
    icon: Sparkles,
    style: "light" as const,
    cta: "Start Free",
    highlights: [
      "One 15-minute executive career consultation",
      "AI-powered resume quick review",
      "Career direction guidance",
      "Access to job listings & basic search",
      "No credit card required",
    ],
  },
  {
    slug: "beginner",
    name: "Beginner Executive Plan",
    price: "$199",
    priceNote: "/month",
    callout: "1 session / mo · 30 min",
    description: "One 30-minute executive recruiter session per month with a personalised career strategy.",
    icon: Phone,
    style: "light" as const,
    cta: "Get Started",
    highlights: [
      "One 30-min executive recruiter session per month",
      "Personalised career strategy",
      "Resume & LinkedIn optimisation guidance",
      "Job search roadmap",
      "Full AI platform access",
    ],
  },
  {
    slug: "professional",
    name: "Professional Executive Plan",
    price: "$399",
    priceNote: "/month",
    callout: "2 sessions / mo · 60 min total",
    description: "Two 30-minute sessions per month — 60 minutes total — with priority recruiter scheduling.",
    icon: Briefcase,
    style: "dark" as const,
    badge: "Most Popular",
    cta: "Go Professional",
    highlights: [
      "Two 30-min executive recruiter sessions per month",
      "60 minutes of coaching per month",
      "Priority scheduling with senior recruiters",
      "Interview preparation coaching",
      "Salary negotiation strategy",
    ],
  },
  {
    slug: "personal",
    name: "Personal Executive Search Plan",
    price: "$999",
    priceNote: "/month",
    callout: "3 sessions / mo + dedicated recruiter",
    description: "Three monthly sessions plus a dedicated executive recruiter assigned exclusively to your search.",
    icon: Crown,
    style: "orange" as const,
    badge: "Most Valuable",
    cta: "Go Personal",
    highlights: [
      "Three 30-min sessions per month (90 min total)",
      "Dedicated executive recruiter assigned to you",
      "Proactive job matching & direct outreach",
      "C-suite & VP-level opportunity access",
      "Weekly 1-on-1 recruiter touchpoints",
    ],
  },
];

// ─── Static comparison table ──────────────────────────────────────────────────

const COMPARISON_ROWS = [
  {
    label: "Recruiter Sessions / month",
    values: ["1 × 15 min", "1 × 30 min", "2 × 30 min", "3 × 30 min"],
  },
  {
    label: "Total Monthly Call Time",
    values: ["15 minutes", "30 minutes", "60 minutes", "90 minutes"],
  },
  {
    label: "Dedicated Executive Recruiter",
    values: [false, false, false, true],
  },
  {
    label: "Priority Recruiter Scheduling",
    values: [false, false, true, true],
  },
  {
    label: "AI Resume Builder & ATS Scoring",
    values: [true, true, true, true],
  },
  {
    label: "AI Career Planner",
    values: [true, true, true, true],
  },
  {
    label: "Salary Negotiation Simulator",
    values: [true, true, true, true],
  },
  {
    label: "Mock Interview Practice",
    values: [true, true, true, true],
  },
  {
    label: "Job Fair Access",
    values: [true, true, true, true],
  },
  {
    label: "Auto-Apply Bot",
    values: [false, true, true, true],
  },
  {
    label: "Proactive Job Matching",
    values: [false, false, false, true],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CARD_STYLES = {
  light: {
    wrap: "bg-white border-gray-200 hover:border-gray-300 hover:shadow-xl",
    name: "text-gray-900",
    subtitle: "text-gray-400",
    price: "text-gray-900",
    priceNote: "text-gray-400",
    calloutWrap: "bg-gray-100",
    calloutIcon: "text-gray-500",
    calloutText: "text-gray-600",
    divider: "border-gray-100",
    desc: "text-gray-400",
    checkBg: "bg-gray-100",
    checkIcon: "text-gray-700",
    feat: "text-gray-600",
    btn: "bg-gray-900 hover:bg-gray-700 text-white",
    btnDisabled: "bg-gray-100 text-gray-400",
    iconWrap: "bg-gray-100 border-gray-200 text-gray-600",
  },
  dark: {
    wrap: "bg-gray-900 border-gray-900 shadow-[0_12px_40px_rgba(0,0,0,0.22)]",
    name: "text-white",
    subtitle: "text-white/50",
    price: "text-white",
    priceNote: "text-white/40",
    calloutWrap: "bg-white/10",
    calloutIcon: "text-white/60",
    calloutText: "text-white/80",
    divider: "border-white/10",
    desc: "text-white/45",
    checkBg: "bg-white/10",
    checkIcon: "text-white",
    feat: "text-white/75",
    btn: "bg-white hover:bg-gray-100 text-gray-900",
    btnDisabled: "bg-white/20 text-white/50",
    iconWrap: "bg-white/10 border-white/10 text-white",
  },
  orange: {
    wrap: "bg-orange-500 border-orange-500 shadow-[0_12px_40px_rgba(234,88,12,0.28)]",
    name: "text-white",
    subtitle: "text-white/50",
    price: "text-white",
    priceNote: "text-white/50",
    calloutWrap: "bg-white/15",
    calloutIcon: "text-white/60",
    calloutText: "text-white/85",
    divider: "border-white/15",
    desc: "text-white/50",
    checkBg: "bg-white/15",
    checkIcon: "text-white",
    feat: "text-white/80",
    btn: "bg-white hover:bg-orange-50 text-orange-600",
    btnDisabled: "bg-white/20 text-white/50",
    iconWrap: "bg-white/15 border-white/10 text-white",
  },
};

export function PlansSection({ compact = false }: PlansSectionProps) {
  const { isAuthenticated } = useAuth();
  const { plans, summary, loadingPlans, checkoutLoadingSlug, selectPlan, initiateCheckout } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSelectionFlow = searchParams.get("select") === "1";

  const apiBySlug = Object.fromEntries(plans.map(p => [p.slug, p]));

  const isPaidPlan = (slug: string) => {
    const p = plans.find(x => x.slug === slug) as Partial<SubscriptionPlan> | undefined;
    return Boolean(
      p?.stripe_price_id ||
      (p?.price_data?.amount && p.price_data.amount > 0) ||
      (slug !== "free" && slug !== "explorer"),
    );
  };

  const handlePlanAction = async (slug: string) => {
    if (!isAuthenticated) {
      const params = new URLSearchParams({ mode: "signup", plan: slug });
      if (isPaidPlan(slug)) params.set("checkout", "1");
      navigate(`/auth?${params.toString()}`);
      return;
    }
    try {
      if (isPaidPlan(slug)) {
        await initiateCheckout(slug);
      } else {
        await selectPlan(slug);
        toast.success("Plan updated successfully.");
        if (isSelectionFlow) navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to update plan.");
    }
  };

  return (
    <section className={`bg-white border-t border-gray-100 ${compact ? "py-16" : "py-24"}`}>
      <div className="mx-auto max-w-6xl px-6">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-5">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight mb-4">
            Executive Recruiter Access<br />
            <span className="text-gray-300">Built for Your Career Stage</span>
          </h2>
          <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
            From a free 15-minute consultation to a dedicated executive recruiter — every plan includes full AI platform access. Upgrade or cancel anytime.
          </p>
        </motion.div>

        {/* ── Plan cards ────────────────────────────────────────────────────── */}
        {loadingPlans ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-[520px] rounded-2xl border border-gray-100 bg-gray-50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-stretch">
            {PLANS.map((plan, index) => {
              const s = CARD_STYLES[plan.style];
              const Icon = plan.icon;
              const isCurrent = summary?.plan?.slug === plan.slug
                || summary?.plan_slug === plan.slug
                || apiBySlug[plan.slug] && summary?.plan?.slug === apiBySlug[plan.slug]?.slug;
              const isDark = plan.style !== "light";

              return (
                <motion.div
                  key={plan.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07 }}
                  className={`relative flex flex-col rounded-2xl border p-7 transition-all duration-200 ${s.wrap}`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      plan.style === "dark" ? "bg-white text-gray-900" : "bg-white text-orange-600"
                    }`}>
                      {plan.badge}
                    </div>
                  )}

                  {/* Icon + name */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border shrink-0 ${s.iconWrap}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className={`text-sm font-extrabold tracking-tight leading-tight ${s.name}`}>
                      {plan.name}
                    </h3>
                  </div>

                  {/* Callout pill */}
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 w-fit mb-5 ${s.calloutWrap}`}>
                    <Clock className={`h-3 w-3 shrink-0 ${s.calloutIcon}`} />
                    <span className={`text-[11px] font-bold ${s.calloutText}`}>{plan.callout}</span>
                  </div>

                  {/* Price */}
                  <div className={`mb-5 pb-5 border-b ${s.divider}`}>
                    <div className="flex items-baseline gap-0.5 mb-2">
                      <span className={`text-4xl font-extrabold tracking-tight ${s.price}`}>{plan.price}</span>
                      {plan.priceNote && (
                        <span className={`text-sm font-medium ml-1 ${s.priceNote}`}>{plan.priceNote}</span>
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${s.desc}`}>{plan.description}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.highlights.map(feat => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${s.checkBg}`}>
                          <Check className={`h-2.5 w-2.5 ${s.checkIcon}`} strokeWidth={3} />
                        </div>
                        <span className={`text-sm font-medium leading-snug ${s.feat}`}>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    type="button"
                    onClick={() => handlePlanAction(plan.slug)}
                    disabled={isCurrent || (checkoutLoadingSlug !== null && checkoutLoadingSlug !== plan.slug)}
                    className={`w-full h-12 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 ${
                      isCurrent ? s.btnDisabled + " cursor-default" : s.btn
                    }`}
                  >
                    {checkoutLoadingSlug === plan.slug ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Redirecting…
                      </>
                    ) : isCurrent ? (
                      "✓ Current Plan"
                    ) : (
                      plan.cta
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── Comparison table ──────────────────────────────────────────────── */}
        {!compact && (
          <div className="mt-24">
            <div className="text-center mb-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-300 mb-3">Full Breakdown</p>
              <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">Compare all plans</h3>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-sm font-bold text-gray-500 w-[35%]">Feature</th>
                    {PLANS.map(p => (
                      <th key={p.slug} className={`px-4 py-4 text-center text-[11px] font-black uppercase tracking-wider ${
                        p.style === "dark" ? "text-gray-900" : p.style === "orange" ? "text-orange-600" : "text-gray-500"
                      }`}>
                        {p.slug === "free" ? "Free" :
                         p.slug === "beginner" ? "Beginner" :
                         p.slug === "professional" ? "Professional" : "Personal"}
                      </th>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-6 py-3" />
                    {PLANS.map(p => (
                      <td key={p.slug} className="px-4 py-3 text-center">
                        <span className={`text-lg font-extrabold ${
                          p.style === "dark" ? "text-gray-900" : p.style === "orange" ? "text-orange-500" : "text-gray-700"
                        }`}>{p.price}</span>
                        {p.priceNote && <span className="text-xs text-gray-400 ml-0.5">{p.priceNote}</span>}
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, ri) => (
                    <tr key={row.label} className={`border-b border-gray-100 ${ri % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">{row.label}</td>
                      {row.values.map((val, vi) => (
                        <td key={vi} className="px-4 py-4 text-center">
                          {typeof val === "boolean" ? (
                            val
                              ? <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 mx-auto">
                                  <Check className="h-3 w-3 text-teal-600" strokeWidth={3} />
                                </span>
                              : <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 mx-auto">
                                  <X className="h-3 w-3 text-gray-400" strokeWidth={3} />
                                </span>
                          ) : (
                            <span className="text-sm font-semibold text-gray-700">{val}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <Link to={isAuthenticated ? "/dashboard" : "/auth?mode=signup"}>
            <button
              type="button"
              className="group inline-flex items-center gap-3 rounded-2xl bg-gray-900 px-10 py-4 text-base font-bold text-white shadow-lg shadow-gray-900/20 transition-all hover:bg-gray-800 hover:shadow-xl hover:shadow-gray-900/25 hover:-translate-y-0.5 active:translate-y-0"
            >
              Start Your Executive Journey
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/15 transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </Link>
          <p className="text-xs text-gray-400 font-medium tracking-wide">
            No credit card required · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
