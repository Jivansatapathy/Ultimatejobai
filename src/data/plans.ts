import { BrainCircuit, Briefcase, Crown, Phone, Sparkles, Star } from "lucide-react";

export interface PlanDefinition {
  name: string;
  slug: string;
  price: string;
  subtitle: string;
  description: string;
  badge?: string;
  accent: string;
  cta: string;
  icon: typeof Sparkles;
  metrics: string[];
  highlights: string[];
  limits: string[];
}

export const planUiConfig: Record<string, PlanDefinition> = {
  // ── Active subscription tiers ──────────────────────────────────────────────
  free: {
    name: "Free Executive Assessment",
    slug: "free",
    price: "Free",
    subtitle: "No card required",
    description: "A complimentary 15-minute career consultation with a senior executive recruiter — no commitment needed.",
    accent: "from-slate-900 to-slate-700",
    cta: "Start Free",
    icon: Sparkles,
    metrics: ["15-min consultation", "No commitment", "Free forever"],
    highlights: [
      "One 15-minute executive career consultation",
      "AI-powered resume quick review",
      "Career direction guidance",
      "Access to job listings & basic search",
      "No credit card required",
    ],
    limits: [],
  },
  beginner: {
    name: "Beginner Executive Plan",
    slug: "beginner",
    price: "$199",
    subtitle: "per month",
    description: "One 30-minute executive recruiter session per month — personalized career strategy and job search roadmap.",
    accent: "from-teal-600 to-teal-500",
    cta: "Get Started",
    icon: Phone,
    metrics: ["1 session/mo", "30 min", "AI tools"],
    highlights: [
      "One 30-minute executive recruiter session per month",
      "Personalized career strategy",
      "Resume & LinkedIn optimization guidance",
      "Job search roadmap",
      "Full AI platform access",
    ],
    limits: [],
  },
  professional: {
    name: "Professional Executive Plan",
    slug: "professional",
    price: "$399",
    subtitle: "per month",
    description: "Two 30-minute executive recruiter sessions per month — 60 minutes total — with priority scheduling.",
    badge: "Most Popular",
    accent: "from-blue-600 to-indigo-700",
    cta: "Go Professional",
    icon: Briefcase,
    metrics: ["2 sessions/mo", "60 min total", "Priority scheduling"],
    highlights: [
      "Two 30-minute executive recruiter sessions per month",
      "60 minutes of coaching per month",
      "Priority scheduling with senior recruiters",
      "Interview preparation coaching",
      "Salary negotiation strategy",
    ],
    limits: [],
  },
  personal: {
    name: "Personal Executive Search Plan",
    slug: "personal",
    price: "$999",
    subtitle: "per month",
    description: "Three 30-minute sessions per month plus a dedicated executive recruiter assigned exclusively to your search.",
    badge: "Premium",
    accent: "from-orange-600 to-orange-500",
    cta: "Go Personal",
    icon: Crown,
    metrics: ["3 sessions/mo", "90 min total", "Dedicated recruiter"],
    highlights: [
      "Three 30-minute sessions per month (90 min total)",
      "Dedicated executive recruiter assigned to you",
      "Proactive job matching & direct outreach",
      "C-suite & VP-level opportunity access",
      "Weekly 1-on-1 recruiter touchpoints",
    ],
    limits: [],
  },

  // ── Legacy slugs (kept for backwards compat) ───────────────────────────────
  starter: {
    name: "Beginner Executive Plan",
    slug: "starter",
    price: "$199",
    subtitle: "per month",
    description: "One 30-minute executive recruiter session per month.",
    accent: "from-teal-600 to-teal-500",
    cta: "Get Started",
    icon: Phone,
    metrics: ["1 session/mo", "30 min", "AI tools"],
    highlights: [
      "One 30-minute executive recruiter session per month",
      "Personalized career strategy",
      "Resume & LinkedIn optimization guidance",
      "Job search roadmap",
      "Full AI platform access",
    ],
    limits: [],
  },
  premium: {
    name: "Professional Executive Plan",
    slug: "premium",
    price: "$399",
    subtitle: "per month",
    description: "Two 30-minute executive recruiter sessions per month — 60 minutes total.",
    badge: "Most Popular",
    accent: "from-blue-600 to-indigo-700",
    cta: "Go Professional",
    icon: Briefcase,
    metrics: ["2 sessions/mo", "60 min total", "Priority scheduling"],
    highlights: [
      "Two 30-minute executive recruiter sessions per month",
      "60 minutes of coaching per month",
      "Priority scheduling with senior recruiters",
      "Interview preparation coaching",
      "Salary negotiation strategy",
    ],
    limits: [],
  },
  premium_tier: {
    name: "Personal Executive Search Plan",
    slug: "premium_tier",
    price: "$999",
    subtitle: "per month",
    description: "Three 30-minute sessions per month plus a dedicated executive recruiter.",
    badge: "Premium",
    accent: "from-orange-600 to-orange-500",
    cta: "Go Personal",
    icon: Crown,
    metrics: ["3 sessions/mo", "90 min total", "Dedicated recruiter"],
    highlights: [
      "Three 30-minute sessions per month (90 min total)",
      "Dedicated executive recruiter assigned to you",
      "Proactive job matching & direct outreach",
      "C-suite & VP-level opportunity access",
      "Weekly 1-on-1 recruiter touchpoints",
    ],
    limits: [],
  },
  executive: {
    name: "Personal Executive Search Plan",
    slug: "executive",
    price: "$999",
    subtitle: "per month",
    description: "Three 30-minute sessions per month plus a dedicated executive recruiter.",
    badge: "Premium",
    accent: "from-orange-600 to-orange-500",
    cta: "Go Personal",
    icon: Crown,
    metrics: ["3 sessions/mo", "90 min total", "Dedicated recruiter"],
    highlights: [
      "Three 30-minute sessions per month (90 min total)",
      "Dedicated executive recruiter assigned to you",
      "Proactive job matching & direct outreach",
      "C-suite & VP-level opportunity access",
      "Weekly 1-on-1 recruiter touchpoints",
    ],
    limits: [],
  },
};

export const plans: PlanDefinition[] = [
  planUiConfig.free,
  planUiConfig.beginner,
  planUiConfig.professional,
  planUiConfig.personal,
];

export const premiumActionMeter = [
  "Comprehensive job detail access",
  "Application submission through portal",
  "Resume ATS optimization checks",
  "Mock interview practice starts",
];

export const planFeatureColumns = [
  {
    title: "Discovery",
    icon: Star,
    items: [
      "Access to 50,000+ active roles",
      "Advanced company & location filters",
      "Saved job tracking (up to 50 on Free)",
      "Daily job matches (Professional+)",
    ],
  },
  {
    title: "Execution",
    icon: Briefcase,
    items: [
      "AI Resume Builder & ATS scoring",
      "One-click auto-apply tools",
      "Application status tracking dashboard",
      "Job fair exclusive access",
    ],
  },
  {
    title: "Interview & Career",
    icon: BrainCircuit,
    items: [
      "AI text & video interview practice",
      "3-year/5-year career roadmap builder",
      "AI speech & body language analysis",
      "1-on-1 career strategy (Executive)",
    ],
  },
];
