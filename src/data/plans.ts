import { BrainCircuit, Briefcase, Crown, Sparkles, Star, Video } from "lucide-react";

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
  free: {
    name: "Free",
    slug: "free",
    price: "Rs 0",
    subtitle: "Public Access",
    description: "Ideal for casual browsing and basic job discovery.",
    accent: "from-slate-900 to-slate-700",
    cta: "Start Free",
    icon: Sparkles,
    metrics: ["Public search", "Limited tracking"],
    highlights: [
      "Access to public job listings",
      "Standard search filters",
      "Manual application notes",
      "Basic profile visibility",
    ],
    limits: ["No AI tools", "No resume scoring"],
  },
  starter: {
    name: "Starter",
    slug: "starter",
    price: "Rs 199/mo",
    subtitle: "Job Seekers",
    description: "Upgrade from free with AI resume scoring and advanced job filters.",
    accent: "from-slate-700 to-slate-500",
    cta: "Start Starter",
    icon: Star,
    metrics: ["AI Resume Check", "100 saved jobs", "Pro filters"],
    highlights: [
      "Everything in Free",
      "AI Resume ATS scoring (10/mo)",
      "Advanced company & role filters",
      "Save and track up to 100 jobs",
      "Daily job match alerts",
    ],
    limits: ["Limited AI usage", "No interview practice"],
  },
  premium: {
    name: "Premium",
    slug: "premium",
    price: "Rs 599/mo",
    subtitle: "Power candidate",
    description: "Stand out with AI resume scoring and unlimited application tracking.",
    badge: "Most Popular",
    accent: "from-blue-600 to-cyan-500",
    cta: "Go Premium",
    icon: Briefcase,
    metrics: ["Unlimited search", "AI Resumes", "One-click apply"],
    highlights: [
      "Everything in Starter",
      "Unlimited saved jobs & tracking",
      "AI Resume ATS scoring (Daily)",
      "Automated job alerts",
      "One-click application tools",
    ],
    limits: ["Basic coaching only"],
  },
  professional: {
    name: "Professional",
    slug: "professional",
    price: "Rs 599/mo",
    subtitle: "Active job search",
    description: "The complete toolkit for candidates actively applying and stand out with AI.",
    badge: "Most Popular",
    accent: "from-blue-600 to-cyan-500",
    cta: "Go Pro",
    icon: Briefcase,
    metrics: ["Unlimited search", "AI Resumes", "One-click apply"],
    highlights: [
      "Everything in Free",
      "Unlimited saved jobs & tracking",
      "AI Resume ATS scoring",
      "Automated job alerts",
      "One-click application tools",
      "Priority industry intelligence",
    ],
    limits: [
      "Text practice only",
      "No human coaching",
    ],
  },
  premium_tier: {
    name: "Premium",
    slug: "premium_tier",
    price: "Rs 1,299/mo",
    subtitle: "Interview-ready",
    description: "Accelerate your interview prep with AI video reviews and career roadmapping.",
    accent: "from-emerald-500 to-teal-500",
    cta: "Go Accelerator",
    icon: Video,
    metrics: ["30 video reviews/mo", "3-year roadmap", "AI speech analysis"],
    highlights: [
      "Everything in Professional",
      "30 video interviews (+AI review)",
      "Unlimited AI text practice",
      "AI speech & presentation analysis",
      "3-year career roadmap builder",
      "Salary negotiation simulator",
      "Multi-resume variant management",
    ],
    limits: [
      "No human coach 1-on-1s",
    ],
  },
  executive: {
    name: "Executive",
    slug: "executive",
    price: "Rs 2,999/mo",
    subtitle: "Concierge strategy",
    description: "The ultimate edge with 1-on-1 human expert coaching and elite branding.",
    badge: "Leadership",
    accent: "from-amber-600 to-orange-500",
    cta: "Go Executive",
    icon: Crown,
    metrics: ["Unlimited video/text", "1-on-1 human coach", "5-year roadmap"],
    highlights: [
      "Everything in Premium",
      "Human coach 1-on-1 sessions",
      "Priority Concierge support",
      "Unlimited video/text interviews",
      "Executive personal branding suite",
      "5-year strategic career roadmap",
      "Exclusive strategic network access",
    ],
    limits: [
      "One 1-on-1 session per month",
      "Priority executive support",
    ],
  },
};

export const plans: PlanDefinition[] = [
  planUiConfig.free,
  planUiConfig.professional,
  planUiConfig.premium_tier,
  planUiConfig.executive,
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
