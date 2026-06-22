import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Loader2, ChevronDown, ChevronUp, AlertTriangle, HelpCircle, Lightbulb, Sparkles, MessageSquare, Video, Crown, RefreshCw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { venusService, InterviewPrepPack, InterviewQuestion } from "@/services/venusService";
import { subscriptionService, SubscriptionSummary } from "@/services/subscriptionService";

// Lazy-load heavy interview components (they pull in TensorFlow, MediaPipe, etc.)
const TextInterview = lazy(() =>
  import("@/components/interview/TextInterview").then(m => ({ default: m.TextInterview }))
);
const VideoInterview = lazy(() =>
  import("@/components/interview/VideoInterview").then(m => ({ default: m.VideoInterview }))
);

// ── Constants ─────────────────────────────────────────────────────────────────

const INTERVIEW_TYPES = [
  { key: "board",            label: "Board Interview",   emoji: "🏛️", desc: "Board seat candidacy" },
  { key: "investor",         label: "Investor Meeting",  emoji: "💰", desc: "VC/PE first meeting" },
  { key: "founder",          label: "Founder Interview", emoji: "🚀", desc: "CEO hiring decision" },
  { key: "pe_deal_team",     label: "PE Deal Team",      emoji: "📊", desc: "PE due diligence" },
  { key: "comp_negotiation", label: "Comp Negotiation",  emoji: "💼", desc: "Salary & equity talk" },
] as const;
type InterviewType = typeof INTERVIEW_TYPES[number]["key"];

const DEMO_PACKS: Record<InterviewType, (company: string, role: string) => InterviewPrepPack> = {
  board: (company, role) => ({
    interview_type: "board",
    company: company || "Acme Corp",
    role: role || "Board Director",
    likely_questions: [
      {
        question: `What unique perspective would you bring to the ${company || "Acme"} board that existing directors don't have?`,
        model_answer: "I'd bring a perspective shaped by three operational exits and deep pattern recognition in scaling B2B SaaS past $100M ARR — something the current board lacks from what I understand of your director composition. My specific value is in go-to-market architecture and international expansion, where I've made and learned from expensive mistakes so the company doesn't have to.",
        difficulty: "hard",
      },
      {
        question: "Walk me through a board-level decision you influenced and the outcome.",
        model_answer: "At Series C, I pushed the board to delay our IPO by 18 months and use that window to improve net dollar retention from 108% to 127%. The pushback was significant — two investors wanted liquidity. I modeled the valuation impact: each NRR point at IPO was worth roughly $40M at our expected multiple. We delayed. The improved metrics added over $600M to market cap at debut.",
        difficulty: "medium",
      },
      {
        question: "How do you handle disagreement with management in the boardroom?",
        model_answer: "I separate the decision from the relationship. Before any board meeting I signal concerns directly to the CEO — never ambush publicly. In the room, I frame disagreement as questions: 'Help me understand the assumption behind X.' This preserves the CEO's authority in front of observers while ensuring the issue gets surfaced. If a decision is serious enough, I request it be tabled for an executive session.",
        difficulty: "medium",
      },
      {
        question: "What are your expectations for board compensation and committee involvement?",
        model_answer: "I typically take equity only for early-stage companies — usually 0.1–0.25% with a 3-year vest — and shift to cash retainer plus equity for later-stage. Committee involvement should match where I add most value: I'd gravitate toward the Audit or Compensation committee given my CFO background, but I'm flexible based on where the board needs the most reinforcement.",
        difficulty: "easy",
      },
    ],
    red_flags: [
      "Board that doesn't have a defined CEO succession plan",
      "No independent directors or all-insider board",
      "Reluctance to share board minutes or committee composition",
      "CEO who also chairs the board — governance red flag at this stage",
    ],
    questions_to_ask: [
      "What's the biggest strategic decision the board got wrong in the last 3 years, and what did you learn?",
      "How does the board handle underperformance at the CEO level?",
      "What does the board need most right now that it doesn't currently have?",
      "How much time per month realistically do active board members commit?",
    ],
    prep_tips: [
      "Read the last 3 annual reports or investor decks before the meeting",
      "Research each current board member — know their backgrounds and potential blind spots",
      "Have 2–3 specific, contrarian observations about the company's strategy ready",
      "Prepare a 90-day onboarding plan for how you'd get up to speed quickly",
    ],
  }),
  investor: (company, role) => ({
    interview_type: "investor",
    company: company || "VentureCapital Partners",
    role: role || "CEO",
    likely_questions: [
      { question: "Why are you the right person to build this company at this moment?", model_answer: "My unfair advantage is 8 years running operations inside this exact customer segment. I know the buyer's psychology, the procurement cycle, and the integration points that competitors consistently underestimate. I've also recruited 3 of the 5 people on my founding team before — we've built together under pressure.", difficulty: "hard" },
      { question: "What's the one assumption in your model that scares you most?", model_answer: "Our 18-month sales cycle assumption. If it extends to 24 months — which happened to two of our pilot customers — our Series B runway math breaks. I'd rather name this risk now than have you discover it at the board level in 18 months.", difficulty: "hard" },
      { question: "Who else are you talking to? Why us?", model_answer: "We're in conversations with three other firms. I'm specific about why I want you: your portfolio includes two companies that went through the exact regulatory gauntlet we'll face — your operational network is worth more to me than the check.", difficulty: "medium" },
    ],
    red_flags: ["Investor who doesn't ask hard questions", "No portfolio companies in adjacent space", "Valuation conversation before thesis alignment", "Partner attendance without the decision-making GP"],
    questions_to_ask: ["Tell me about a portfolio company that went sideways — what was the board's role?", "What does your typical involvement look like between board meetings?", "Who in your portfolio should I be talking to right now?", "What would make you pass on this deal even if the numbers work?"],
    prep_tips: ["Know their entire portfolio — find 2 portfolio CEOs to call before the meeting", "Understand their fund cycle — early vs. late fund means very different return pressures", "Prepare a crisp narrative on why this market, why now, why you — under 90 seconds", "Have a specific ask ready: amount, use of funds, timeline to next milestone"],
  }),
  founder: (company, role) => ({
    interview_type: "founder",
    company: company || "StartupCo",
    role: role || "CTO",
    likely_questions: [
      { question: "What's your operating style, and where have you clashed with founders before?", model_answer: "I'm a high-context communicator — I prefer to know the why behind a directive before I execute it. At my last company, I told the CEO directly: 'I'll move faster if you loop me in on the strategy.' We built a weekly alignment ritual that fixed it.", difficulty: "hard" },
      { question: "How do you build teams in an environment where you can't compete on salary?", model_answer: "Mission and growth density. My pitch is specific: 'In your first year you'll own X, have budget for Y, and present to the board on Z.' I never oversell equity — I give them the honest dilution math.", difficulty: "medium" },
      { question: "We're an early-stage company — you've run large orgs. Why do you want to go back to zero?", model_answer: "I've learned that I'm most energized before the playbook is written. I also bring scale-awareness that most early-stage hires lack — I've seen where the organizational debt created at 10 people destroys teams at 100.", difficulty: "medium" },
    ],
    red_flags: ["Founder who won't share cap table or financial model", "Culture described as 'work hard play hard' without substance", "No clear delineation of your authority vs. the founder's", "Previous exec tenure at the company was under 12 months"],
    questions_to_ask: ["What decision have you made in the last 6 months that you'd make differently?", "What does success look like for this role in 90 days, 6 months, and 2 years?", "Who on the team will push back hardest on me, and why?", "What's the one thing about working here that you wish you'd known before starting?"],
    prep_tips: ["Research the founders deeply — understand their backgrounds and previous companies", "Have specific examples of cultural fit from your past that match their stated values", "Know the company's current metrics — ARR, burn, runway, team size", "Prepare your 90-day plan: what you'd learn, what you'd change, what you'd leave alone"],
  }),
  pe_deal_team: (company, role) => ({
    interview_type: "pe_deal_team",
    company: company || "PE Firm",
    role: role || "CEO",
    likely_questions: [
      { question: "Walk us through the value creation plan you'd execute in the first 100 days.", model_answer: "Days 1–30 are pure listening: every department head, top 10 customers, 5 churned customers, and the full P&L. I don't move until I've mapped the real constraint. Days 31–60 I draft a 3-year value creation thesis. Days 61–100 I'm executing on the highest-confidence levers — usually pricing and sales process.", difficulty: "hard" },
      { question: "How do you approach EBITDA margin expansion without breaking the growth engine?", model_answer: "I look first at vendor contracts (usually 15–20% savings without capability loss), then org structure, then pricing (most PE-backed companies are underpriced by 10–15%). Growth spend is the last thing I touch.", difficulty: "hard" },
      { question: "Have you worked in a PE-backed environment before? How was it different?", model_answer: "Yes — two portfolio companies over 6 years. The primary difference is the discipline of the operating cadence. Monthly financial reviews with board-level rigor forced me to build better internal reporting than any VC-backed company I'd run.", difficulty: "medium" },
    ],
    red_flags: ["Deal team that can't articulate the investment thesis clearly", "Unclear on exit timeline or target multiple", "No management incentive plan (MIP) structure defined yet", "Previous management team left immediately post-close"],
    questions_to_ask: ["What's the investment thesis, and what has to be true for you to hit your target return?", "How do you handle management teams that miss operating plan?", "What does the management incentive plan look like?", "What's your standard for co-investment alongside management?"],
    prep_tips: ["Know the firm's fund vintage and target hold period", "Understand the specific deal: entry multiple, leverage ratio, EBITDA at close", "Prepare metrics on the businesses you've run: revenue, EBITDA margins, growth rates", "Research portfolio exits — the deals they've done tell you how they operate as owners"],
  }),
  comp_negotiation: (company, role) => ({
    interview_type: "comp_negotiation",
    company: company || "Target Company",
    role: role || "Executive",
    likely_questions: [
      { question: "What are your compensation expectations?", model_answer: "Based on my research into market rates for this role at a company at your stage and location, I'm targeting a total package in the range of $X–$Y. I'm flexible on the mix if we can align on the overall number. Can you share what you've budgeted for this role?", difficulty: "medium" },
      { question: "Your current comp is lower than what you're asking. Why the jump?", model_answer: "Two reasons: the market has moved, and my role has expanded significantly since my last comp review. I've been operating at the next level for 18 months — I just haven't been paid for it yet. What I'm asking reflects what comparable roles pay externally, not a premium.", difficulty: "hard" },
      { question: "We can't hit your base number. Would you take more equity instead?", model_answer: "Potentially, if the equity is priced right. To evaluate that trade, I need: current 409A valuation, total shares outstanding, your last 12 months of growth rate, and the board's exit timeline. Can you share that data?", difficulty: "hard" },
    ],
    red_flags: ["Offer expires in 24–48 hours — artificial pressure tactic", "Vague equity structure with no 409A or cap table access", "Benefits significantly below market with no comp offset", "Signing bonus instead of fixing below-market base"],
    questions_to_ask: ["What's the current 409A valuation and when was the last 409A?", "How does the bonus target work — what's the performance basis and historical payout?", "Is there a clawback provision on the signing bonus?", "When is the next anticipated equity repricing or funding round?"],
    prep_tips: ["Know your walk-away number before the conversation starts", "Research comps: Levels.fyi, Radford, LinkedIn Salary for this exact role and stage", "Never be the first to name a number — ask for their range first", "Negotiate everything at once, not sequentially"],
  }),
};

// ── Sub-components ────────────────────────────────────────────────────────────

function QuestionCard({ q, index }: { q: InterviewQuestion; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const diffColor = q.difficulty === "hard"
    ? "text-red-700 bg-red-50"
    : q.difficulty === "medium"
    ? "text-amber-700 bg-amber-50"
    : "text-emerald-700 bg-emerald-50";

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-gray-100 transition-colors">
        <div className="flex-1">
          <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${diffColor}`}>{q.difficulty}</span>
          <p className="text-sm font-semibold text-gray-900 leading-snug mt-1">{q.question}</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" /> : <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-gray-200">
            <div className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">Model Answer</p>
              <p className="text-sm text-gray-600 leading-relaxed">{q.model_answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Usage meter component ─────────────────────────────────────────────────────

interface UsageInfo {
  used: number;
  limit: number | null;
  isUnlimited: boolean;
  planName: string;
}

function UsageMeter({ usage, onRefresh, loading }: { usage: UsageInfo | null; onRefresh: () => void; loading: boolean }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center gap-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
        <span className="text-xs text-gray-400">Loading usage...</span>
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-xs text-gray-500">Could not load usage data</span>
        <button type="button" onClick={onRefresh} className="ml-auto text-xs text-blue-600 hover:text-blue-700">Retry</button>
      </div>
    );
  }

  const pct = usage.isUnlimited || usage.limit === null ? 100 : Math.min((usage.used / usage.limit) * 100, 100);
  const remaining = usage.isUnlimited || usage.limit === null ? null : Math.max(usage.limit - usage.used, 0);
  const isExhausted = !usage.isUnlimited && remaining !== null && remaining <= 0;
  const barColor = isExhausted ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-blue-500";

  return (
    <div className={`rounded-xl border px-4 py-3 ${isExhausted ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Crown className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-xs font-bold text-gray-600 capitalize">{usage.planName} Plan</span>
          {usage.isUnlimited && (
            <span className="rounded-full bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">Unlimited</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {usage.isUnlimited
              ? `${usage.used} sessions used`
              : `${usage.used} / ${usage.limit} sessions used this month`}
          </span>
          <button type="button" onClick={onRefresh} className="text-gray-400 hover:text-gray-500 transition-colors">
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>
      {!usage.isUnlimited && usage.limit !== null && (
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`h-full rounded-full ${barColor}`}
          />
        </div>
      )}
      {isExhausted && (
        <p className="text-xs text-red-600 mt-2 font-semibold">
          Monthly limit reached. Upgrade your plan to continue practicing.
        </p>
      )}
      {!isExhausted && remaining !== null && remaining <= 3 && (
        <p className="text-xs text-amber-600 mt-2 font-semibold">
          {remaining} session{remaining !== 1 ? "s" : ""} remaining this month.
        </p>
      )}
    </div>
  );
}

// ── Plan limits reference ─────────────────────────────────────────────────────

const PLAN_LIMITS: { plan: string; color: string; badge: string; textLimit: string; audioLimit: string }[] = [
  { plan: "Free",         color: "border-gray-300",         badge: "bg-gray-100 text-gray-500",           textLimit: "3 / mo",      audioLimit: "—" },
  { plan: "Professional", color: "border-blue-200",      badge: "bg-blue-100 text-blue-700",        textLimit: "20 / mo",     audioLimit: "10 / mo" },
  { plan: "Accelerator",  color: "border-blue-200",    badge: "bg-blue-100 text-blue-700",    textLimit: "50 / mo",     audioLimit: "25 / mo" },
  { plan: "Executive",    color: "border-amber-200",     badge: "bg-amber-100 text-amber-700",      textLimit: "Unlimited",   audioLimit: "Unlimited" },
];

// ── Live interview loader ─────────────────────────────────────────────────────

function InterviewLoader() {
  return (
    <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">Loading interview engine...</span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type TabKey = "prep" | "practice";
type PracticeMode = "text" | "audio" | null;

export default function ExecInterviewPrep() {
  // Prep Pack state
  const [interviewType, setInterviewType] = useState<InterviewType>("board");
  const [company, setCompany]             = useState("");
  const [role, setRole]                   = useState("");
  const [loading, setLoading]             = useState(false);
  const [pack, setPack]                   = useState<InterviewPrepPack | null>(null);

  // Tab + practice mode state
  const [tab, setTab]               = useState<TabKey>("prep");
  const [practiceMode, setPracticeMode] = useState<PracticeMode>(null);

  // Usage state
  const [summary, setSummary]       = useState<SubscriptionSummary | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);

  const loadUsage = useCallback(async () => {
    setUsageLoading(true);
    try {
      const s = await subscriptionService.getSummary();
      setSummary(s);
    } catch {
      // silent — usage meter will show "could not load"
    } finally {
      setUsageLoading(false);
    }
  }, []);

  useEffect(() => { loadUsage(); }, [loadUsage]);

  // Re-fetch usage when returning from a practice session
  const handleBackFromInterview = useCallback(() => {
    setPracticeMode(null);
    loadUsage();
  }, [loadUsage]);

  // Derive usage info from subscription summary
  const usageInfo: UsageInfo | null = summary ? (() => {
    const usageRow = summary.current_usage?.find(u => u.feature_key === "text_interview_access");
    const planFeature = summary.plan?.features?.find(f => f.feature_key === "text_interview_access");
    return {
      used:        usageRow?.used_count ?? 0,
      limit:       planFeature?.monthly_limit ?? usageRow?.limit ?? null,
      isUnlimited: usageRow?.is_unlimited ?? (planFeature?.monthly_limit === null),
      planName:    summary.plan?.name ?? "Free",
    };
  })() : null;

  const isExhausted = usageInfo
    ? (!usageInfo.isUnlimited && usageInfo.limit !== null && usageInfo.used >= usageInfo.limit)
    : false;

  // Build job description context for pre-filling the interview
  const interviewJD = (() => {
    const type = INTERVIEW_TYPES.find(t => t.key === interviewType);
    const parts = [type?.label ?? "Executive Interview"];
    if (company) parts.push(`at ${company}`);
    if (role)    parts.push(`for ${role} role`);
    return parts.join(" ");
  })();

  // Generate prep pack
  const generate = async () => {
    setLoading(true);
    try {
      const result = await venusService.generateInterviewPrep({ interview_type: interviewType, company, role });
      setPack(result);
    } catch {
      toast.info("Using demo prep pack — connect Venus API for AI-personalized content.");
      setPack(DEMO_PACKS[interviewType](company, role));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Priority 2 · Intelligence</p>
        <h1 className="text-2xl font-black text-gray-900 mt-0.5">Interview Prep AI</h1>
        <p className="text-sm text-gray-400 mt-1">Executive-specific prep for board, investor, founder, PE, and comp negotiation interviews.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white border border-gray-200 w-fit">
        {([
          { key: "prep",     label: "Prep Pack",       Icon: Lightbulb },
          { key: "practice", label: "Live Practice",   Icon: Mic },
        ] as const).map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
              tab === key
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Prep Pack ──────────────────────────────────────────────────── */}
      {tab === "prep" && (
        <>
          {/* Config panel */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Interview Type</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {INTERVIEW_TYPES.map(t => (
                  <button key={t.key} type="button" onClick={() => setInterviewType(t.key)}
                    className={`rounded-xl border p-3 text-left transition-all ${interviewType === t.key ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}>
                    <span className="text-lg">{t.emoji}</span>
                    <p className="text-xs font-bold text-gray-900 mt-1">{t.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Company (optional)</label>
                <Input value={company} onChange={e => setCompany(e.target.value)}
                  placeholder="e.g. Stripe, KKR, Benchmark"
                  className="bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Your Role (optional)</label>
                <Input value={role} onChange={e => setRole(e.target.value)}
                  placeholder="e.g. CTO, Board Director"
                  className="bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl" />
              </div>
            </div>

            <Button onClick={generate} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11">
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating prep pack...</>
                : <><Sparkles className="h-4 w-4 mr-2" />Generate Prep Pack</>}
            </Button>
          </div>

          {/* Results */}
          <AnimatePresence>
            {pack && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-black text-gray-900 uppercase tracking-wide">Likely Questions + Model Answers</p>
                  </div>
                  <div className="space-y-2">
                    {pack.likely_questions.map((q, i) => <QuestionCard key={i} q={q} index={i} />)}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <p className="text-sm font-black text-gray-900 uppercase tracking-wide">Red Flags to Watch</p>
                    </div>
                    <ul className="space-y-2">
                      {pack.red_flags.map((flag, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-600">
                          <span className="text-amber-500 shrink-0 mt-0.5">⚠</span>{flag}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-4 w-4 text-emerald-600" />
                      <p className="text-sm font-black text-gray-900 uppercase tracking-wide">Smart Questions to Ask</p>
                    </div>
                    <ul className="space-y-2">
                      {pack.questions_to_ask.map((q, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-600">
                          <span className="text-emerald-500 shrink-0">→</span>{q}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-black text-gray-900 uppercase tracking-wide">Prep Tips</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {pack.prep_tips.map((tip, i) => (
                      <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600">{tip}</div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!pack && !loading && (
            <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
              <Mic className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-semibold">Select interview type and generate your prep pack</p>
              <p className="text-xs text-gray-400 mt-1">AI generates tailored questions, model answers, and strategy in seconds</p>
            </div>
          )}
        </>
      )}

      {/* ── Tab: Live Practice ──────────────────────────────────────────────── */}
      {tab === "practice" && (
        <div className="space-y-5">

          {/* If a mode is active, show the full interview UI */}
          {practiceMode && (
            <Suspense fallback={<InterviewLoader />}>
              {practiceMode === "text" ? (
                <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                  <TextInterview
                    onBack={handleBackFromInterview}
                    initialJobDescription={interviewJD}
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                  <VideoInterview
                    onBack={handleBackFromInterview}
                    initialJobDescription={interviewJD}
                  />
                </div>
              )}
            </Suspense>
          )}

          {/* Mode selection screen (shown when no mode is active) */}
          {!practiceMode && (
            <>
              {/* Usage meter */}
              <UsageMeter usage={usageInfo} onRefresh={loadUsage} loading={usageLoading} />

              {/* Mode cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Text Interview */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                  <button
                    type="button"
                    disabled={isExhausted}
                    onClick={() => !isExhausted && setPracticeMode("text")}
                    className={`w-full rounded-2xl border p-6 text-left transition-all group ${
                      isExhausted
                        ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 border border-blue-200">
                        <MessageSquare className="h-6 w-6 text-blue-600" />
                      </div>
                      {isExhausted
                        ? <Lock className="h-4 w-4 text-gray-400" />
                        : <span className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Start →</span>
                      }
                    </div>
                    <h3 className="text-base font-black text-gray-900 mb-1">Text Interview</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      AI asks questions, you type your answers. Real-time validation, feedback panel, and full transcript export.
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      <span className="rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5">Chat-based</span>
                      <span className="rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5">AI Feedback</span>
                      <span className="rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5">Export Transcript</span>
                    </div>
                  </button>
                </motion.div>

                {/* Audio Interview */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <button
                    type="button"
                    disabled={isExhausted}
                    onClick={() => !isExhausted && setPracticeMode("audio")}
                    className={`w-full rounded-2xl border p-6 text-left transition-all group ${
                      isExhausted
                        ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                        : "border-gray-200 bg-white hover:border-teal-300 hover:bg-gray-50 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 border border-teal-200">
                        <Video className="h-6 w-6 text-teal-600" />
                      </div>
                      {isExhausted
                        ? <Lock className="h-4 w-4 text-gray-400" />
                        : <span className="text-xs font-bold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">Start →</span>
                      }
                    </div>
                    <h3 className="text-base font-black text-gray-900 mb-1">Audio Interview</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Speak your answers aloud. Voice-to-text transcription, presence detection, and AI-powered coaching after each response.
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      <span className="rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5">Voice-to-Text</span>
                      <span className="rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5">Presence Check</span>
                      <span className="rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5">AI Coaching</span>
                    </div>
                  </button>
                </motion.div>
              </div>

              {/* Context note */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex items-center gap-3">
                <Lightbulb className="h-4 w-4 text-blue-600 shrink-0" />
                <p className="text-xs text-gray-500">
                  The interview AI will be pre-loaded with context from your selected type
                  {company ? ` at <strong>${company}</strong>` : ""}. Switch to <strong>Prep Pack</strong> tab to customize the interview context.
                </p>
              </div>

              {/* Plan limits table */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Interview Session Limits by Plan</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left text-gray-400 font-bold pb-2 pr-4">Plan</th>
                        <th className="text-center text-gray-400 font-bold pb-2 px-4">Text Sessions</th>
                        <th className="text-center text-gray-400 font-bold pb-2 px-4">Audio Sessions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/60">
                      {PLAN_LIMITS.map(p => {
                        const isCurrent = summary?.plan?.name?.toLowerCase() === p.plan.toLowerCase();
                        return (
                          <tr key={p.plan} className={isCurrent ? "bg-blue-50" : ""}>
                            <td className="py-2 pr-4">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${p.color} ${p.badge}`}>
                                {p.plan}
                              </span>
                              {isCurrent && <span className="ml-2 text-[9px] text-blue-600 font-bold">← current</span>}
                            </td>
                            <td className="py-2 px-4 text-center font-semibold text-gray-600">{p.textLimit}</td>
                            <td className="py-2 px-4 text-center font-semibold text-gray-600">{p.audioLimit}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {isExhausted && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-xs text-red-600 font-semibold">You've used all sessions for this month.</p>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8">
                      <Crown className="h-3 w-3 mr-1.5" /> Upgrade Plan
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
