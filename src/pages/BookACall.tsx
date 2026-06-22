import { motion } from "framer-motion";
import { NavbarV2 as Navbar } from "@/components/landing2/NavbarV2";
import { Footer } from "@/components/layout/Footer";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import {
  Phone,
  Clock,
  CheckCircle2,
  Sparkles,
  Star,
  Shield,
  Users,
  ArrowRight,
  Calendar,
  Zap,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (opts: { url: string }) => void;
    };
  }
}

// ─── Plan definitions ──────────────────────────────────────────────────────────
// Replace the calendlyUrl values with your actual Calendly event links
const CALL_PLANS = [
  {
    id: "free",
    name: "Free Executive Assessment",
    price: "Free",
    priceNote: "No card required",
    duration: "15-Minute",
    sessionLabel: "Executive Career Consultation",
    sessionsPerMonth: 1,
    totalMinutes: 15,
    badge: null,
    accent: "border-gray-200",
    headerBg: "bg-gray-50",
    badgeCls: "",
    cta: "Book Free Consultation",
    ctaCls: "bg-gray-900 hover:bg-gray-800 text-white",
    calendlyUrl: "https://calendly.com/YOUR_TEAM/15-min-consultation",
    features: [
      "One 15-minute career consultation",
      "Resume quick-review overview",
      "Career direction guidance",
      "No commitment required",
    ],
    icon: Sparkles,
    iconCls: "bg-gray-100 text-gray-600",
  },
  {
    id: "beginner",
    name: "Beginner Executive Plan",
    price: "$199",
    priceNote: "per month",
    duration: "30-Minute",
    sessionLabel: "Executive Recruiter Session",
    sessionsPerMonth: 1,
    totalMinutes: 30,
    badge: null,
    accent: "border-teal-200",
    headerBg: "bg-teal-50",
    badgeCls: "",
    cta: "Book Your Session",
    ctaCls: "bg-teal-500 hover:bg-teal-600 text-white",
    calendlyUrl: "https://calendly.com/YOUR_TEAM/30-min-executive-session",
    features: [
      "One 30-minute executive recruiter session per month",
      "Personalized career strategy",
      "Resume & LinkedIn optimization tips",
      "Job search roadmap",
    ],
    icon: Phone,
    iconCls: "bg-teal-50 text-teal-600",
  },
  {
    id: "professional",
    name: "Professional Executive Plan",
    price: "$399",
    priceNote: "per month",
    duration: "2 × 30-Minute",
    sessionLabel: "Executive Recruiter Sessions",
    sessionsPerMonth: 2,
    totalMinutes: 60,
    badge: "Most Popular",
    accent: "border-teal-500 ring-2 ring-teal-500",
    headerBg: "bg-teal-500",
    badgeCls: "bg-teal-500 text-white",
    cta: "Book Your Sessions",
    ctaCls: "bg-teal-500 hover:bg-teal-600 text-white",
    calendlyUrl: "https://calendly.com/YOUR_TEAM/30-min-executive-session",
    features: [
      "Two 30-minute sessions per month (60 min total)",
      "Priority scheduling with senior recruiters",
      "Interview preparation coaching",
      "Salary negotiation strategy",
      "Bi-weekly progress check-ins",
    ],
    icon: Star,
    iconCls: "bg-white/20 text-white",
  },
  {
    id: "personal",
    name: "Personal Executive Search Plan",
    price: "$999",
    priceNote: "per month",
    duration: "3 × 30-Minute",
    sessionLabel: "Sessions + Dedicated Recruiter",
    sessionsPerMonth: 3,
    totalMinutes: 90,
    badge: "Premium",
    accent: "border-orange-300",
    headerBg: "bg-gradient-to-br from-orange-500 to-orange-600",
    badgeCls: "bg-orange-500 text-white",
    cta: "Book with Your Recruiter",
    ctaCls: "bg-orange-500 hover:bg-orange-600 text-white",
    calendlyUrl: "https://calendly.com/YOUR_TEAM/dedicated-executive-search",
    features: [
      "Three 30-minute sessions per month (90 min total)",
      "Dedicated executive recruiter assigned",
      "Proactive job matching & outreach",
      "C-suite & VP-level opportunities access",
      "Executive branding & positioning",
      "Weekly 1-on-1 recruiter touchpoints",
    ],
    icon: Shield,
    iconCls: "bg-white/20 text-white",
  },
];

// ─── Calendly helper ────────────────────────────────────────────────────────────
function openCalendly(url: string) {
  if (window.Calendly) {
    window.Calendly.initPopupWidget({ url });
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

// ─── Component ──────────────────────────────────────────────────────────────────
export default function BookACall() {
  const { isAuthenticated } = useAuth();
  const { summary } = useSubscription();

  const currentPlanSlug = summary?.plan_slug ?? "free";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="pt-24 pb-20 px-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-teal-600 mb-6">
            <Calendar className="h-3.5 w-3.5" /> Executive Recruiter Calls
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-5 leading-[1.1]">
            Book a Call with an<br />
            <span className="text-teal-600">Executive Recruiter</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Get real, personalized career advice from senior executive recruiters.
            Choose the plan that matches where you are in your career journey.
          </p>
        </motion.div>

        {/* Plan cards */}
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-start">
          {CALL_PLANS.map((plan, i) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentPlanSlug?.includes(plan.id);
            const isPro = plan.id === "professional";
            const isPremium = plan.id === "personal";
            const isDark = isPro || isPremium;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`relative rounded-2xl border bg-white overflow-hidden shadow-sm flex flex-col ${plan.accent} ${isCurrentPlan ? "ring-2 ring-offset-2 ring-teal-500" : ""}`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${plan.badgeCls}`}>
                    {plan.badge}
                  </div>
                )}

                {/* Header */}
                <div className={`${plan.headerBg} px-5 pt-6 pb-5`}>
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4 ${isDark ? "bg-white/20" : plan.iconCls}`}>
                    <Icon className={`h-5 w-5 ${isDark ? "text-white" : ""}`} />
                  </div>
                  <h3 className={`font-display text-base font-bold leading-tight mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className={`text-3xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ${isDark ? "text-white/70" : "text-gray-500"}`}>
                      {plan.priceNote}
                    </span>
                  </div>
                </div>

                {/* Session callout */}
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-teal-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">{plan.duration}</p>
                    <p className="text-[11px] text-gray-500">{plan.sessionLabel}</p>
                  </div>
                </div>

                {/* Features */}
                <ul className="px-5 py-4 space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="px-5 pb-5">
                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() => openCalendly(plan.calendlyUrl)}
                      className={`w-full h-10 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${plan.ctaCls}`}
                    >
                      <Calendar className="h-4 w-4" />
                      {plan.cta}
                    </button>
                  ) : (
                    <Link
                      to="/auth"
                      className={`w-full h-10 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${plan.ctaCls}`}
                    >
                      Sign in to Book
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  {isCurrentPlan && (
                    <p className="text-center text-xs text-teal-600 font-medium mt-2">✓ Your current plan</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-3xl mx-auto mt-16 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: Users, label: "Senior Recruiters", sub: "10+ years executive search experience" },
              { icon: Clock, label: "Flexible Scheduling", sub: "Morning, evening & weekend slots" },
              { icon: Zap, label: "Immediate Access", sub: "Book your slot within minutes" },
            ].map(({ icon: I, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 border border-teal-200">
                  <I className="h-5 w-5 text-teal-600" />
                </div>
                <p className="font-semibold text-gray-900 text-sm">{label}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-14">
          <h2 className="font-display text-2xl font-bold text-gray-900 text-center mb-8">Common Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "What happens in the free 15-minute consultation?",
                a: "A senior executive recruiter will review your current situation, understand your goals, and give you actionable next steps — completely free and with no obligation.",
              },
              {
                q: "Can I upgrade my plan later?",
                a: "Yes. You can upgrade at any time from the Plans page. Your Calendly booking quota resets on the 1st of each month.",
              },
              {
                q: "What platform do you use for calls?",
                a: "Calls are conducted via Google Meet or Zoom. The recruiter will send a link after you book via Calendly.",
              },
              {
                q: "Who are the executive recruiters?",
                a: "All recruiters on our team have 10+ years of executive search experience across tech, finance, and operations verticals.",
              },
            ].map(({ q, a }) => (
              <details key={q} className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between gap-3 font-semibold text-gray-900 text-sm list-none">
                  {q}
                  <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-90 shrink-0" />
                </summary>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
