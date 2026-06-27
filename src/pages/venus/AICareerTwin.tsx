import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Loader2, Crown, Trash2, Sparkles, Bot,
  DollarSign, Users, Building2, Megaphone, Briefcase,
  ChevronRight, RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { venusService, CareerTwinMessage, ExecutiveProfile } from "@/services/venusService";
import { UsageMonitor } from "@/components/subscription/UsageMonitor";
import { useSubscription } from "@/context/SubscriptionContext";
import { getApiErrorMessage, isPlanLimitError } from "@/lib/utils";

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "venus_career_twin_history";
const MAX_HISTORY = 50;

const CATEGORIES = [
  {
    label: "Role Decisions",
    icon: Briefcase,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    prompts: [
      "Should I take the fractional CTO role or wait for a full-time CEO opportunity?",
      "How do I evaluate a Series B offer vs staying at my current Series D company?",
      "When is the right time to make a lateral move to gain a missing skill?",
    ],
  },
  {
    label: "Compensation",
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    prompts: [
      "My comp is 30% below market. How do I negotiate without souring the relationship?",
      "How should I think about equity vs. cash when joining a Series A?",
      "What MIP structure should I expect at a PE-backed company?",
    ],
  },
  {
    label: "Board & Advisory",
    icon: Users,
    color: "text-violet-600",
    bg: "bg-violet-50 border-violet-200",
    prompts: [
      "How do I position myself for board seats with no current board experience?",
      "What's the difference between an advisory role and a board observer seat?",
      "How do I negotiate an advisory equity grant fairly?",
    ],
  },
  {
    label: "PE / VC",
    icon: Building2,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    prompts: [
      "I'm being recruited by a PE-backed company. What should I diligence before saying yes?",
      "How is working for a PE sponsor different from a VC-backed company?",
      "What questions should I ask about the fund vintage and hold period?",
    ],
  },
  {
    label: "Branding",
    icon: Megaphone,
    color: "text-rose-600",
    bg: "bg-rose-50 border-rose-200",
    prompts: [
      "How do I build a personal brand as an executive without it feeling self-promotional?",
      "What content strategy works best for C-suite executives on LinkedIn?",
      "How do I become known in a new industry without prior connections there?",
    ],
  },
];

const DEMO_RESPONSES: Record<string, string> = {
  default: `That's a great question for an executive at your stage. Here's how I'd think through it:

**The core tension** is between short-term positioning and long-term leverage. Most executives optimize for the wrong one.

**What I'd suggest:**
1. Map the decision against your 3-year target state, not your current situation
2. Identify which option builds the capability or relationship that's hardest to replicate later
3. Talk to 2–3 people who've made the same decision in the last 18 months — their regrets are more useful than their successes

**The pattern I see most often:** Executives underweight network value and overweight comp. The relationships you build in the next role compound; the salary delta doesn't.

What's the specific constraint you're trying to solve for? That'll help me give you sharper advice.`,
};

function getDemoReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("fractional") || lower.includes("full-time")) {
    return `The fractional vs. full-time decision is one of the most consequential an executive makes — and most people get it wrong because they frame it as a financial question when it's really a positioning question.

**Fractional makes sense if:**
- You want to build a portfolio of relationships across 2–4 companies simultaneously
- You're transitioning into a new industry or function and need to de-risk the learning curve
- Your market value is significantly above what a single company would pay full-time

**Full-time makes sense if:**
- You want a singular P&L story for your next board seat or executive search process
- The company is at an inflection point where presence and deep context will multiply your impact
- You're 18–24 months from a liquidity event you want to be part of

**The question I'd ask yourself:** In 3 years, when you're telling your next employer what you did, which story lands better?`;
  }
  if (lower.includes("board")) {
    return `Board seats are a chicken-and-egg problem — companies want members with board experience, but you need a first seat to get experience. Here's how executives break this cycle:

**Step 1: Non-profit boards first**
Spend 12 months on a non-profit board in your industry. You'll get governance experience and the vocabulary.

**Step 2: Become board-adjacent**
Serve as an observer or advisor to a board where you already have relationships.

**Step 3: Position through operators, not boards**
Board seats come from CEOs, not other board members. Build 10 deep relationships with Series B/C CEOs in your sector.

**Step 4: Be specific about your value-add**
Boards don't want generalists. Pick one or two specific contributions: "I've scaled GTM from $10M to $80M ARR twice."

Where are you in this progression?`;
  }
  if (lower.includes("comp") || lower.includes("salary") || lower.includes("negotiat")) {
    return `Compensation negotiation is one of the most high-leverage skills an executive can develop.

**The core principle:** You're not asking for more money. You're establishing the market price for your role.

**The tactical approach:**
1. **Don't be the first to name a number.** Ask: "What have you budgeted for this role?"
2. **Anchor high, with data.** When you do name a number, have market comps ready.
3. **Negotiate the package, not just base.** Often you can get more in equity, bonus, or signing even when base is locked.
4. **The walk-away number matters.** Know it before the conversation.

**On souring the relationship:** The risk is lower than you think. Good leaders respect people who know their worth.

What's the gap between their offer and your target?`;
  }
  if (lower.includes("pe") || lower.includes("private equity")) {
    return `PE-backed roles are fundamentally different from VC-backed or public company roles.

**What to diligence before saying yes:**

**1. The thesis** — "What has to be true for this investment to return 3x?"

**2. The management incentive plan (MIP)** — Get the structure before you accept. Key questions: What multiple triggers the pool? What's your percentage?

**3. The hold period** — Early-fund deals have more time; late-fund deals are being pushed to exit.

**4. The team** — Talk to 2–3 executives from other portfolio companies without the firm present.

**5. The co-invest opportunity** — Some firms allow management co-investment. If offered, take it seriously.

What stage is the PE company and do you know the fund vintage?`;
  }
  if (lower.includes("brand") || lower.includes("thought leadership")) {
    return `Executive personal brand is uncomfortable because it feels like self-promotion. The reframe: you're not building a brand, you're creating a surface area for luck to land on.

**The framework that works:**

**1. One medium, one topic** — Pick LinkedIn and one specific topic where you have a genuine edge.

**2. The 80/20 rule** — 80% of your content should make the reader smarter. 20% can be your story.

**3. Consistency beats volume** — One high-quality post per week beats three mediocre ones.

**4. The comment strategy** — Thoughtful comments on posts by people with 10x your audience can drive hundreds of followers fast.

**5. Write as you speak** — Executives who write how they think they should sound get ignored.

What's your specific goal — board seats, exec search visibility, or building a network in a new sector?`;
  }
  return DEMO_RESPONSES.default;
}

// ── Message rendering ──────────────────────────────────────────────────────────

function renderContent(content: string, isUser: boolean) {
  return content.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} className={`font-bold ${isUser ? "text-white" : "text-gray-900"}`}>{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
}

function MessageBubble({ msg, index }: { msg: CareerTwinMessage; index: number }) {
  const isUser = msg.role === "user";
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div className={`shrink-0 h-8 w-8 rounded-xl flex items-center justify-center mt-0.5 ${
        isUser
          ? "bg-gray-200"
          : "bg-gradient-to-br from-blue-600 to-blue-800 shadow-md shadow-blue-500/20"
      }`}>
        {isUser
          ? <span className="text-[10px] font-black text-gray-800">YOU</span>
          : <Crown className="h-4 w-4 text-white" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] space-y-1 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-blue-600 text-white rounded-tr-sm"
            : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
        }`}>
          <p className="whitespace-pre-wrap">{renderContent(msg.content, isUser)}</p>
        </div>
        <span className="text-[10px] text-gray-700 px-1">{time}</span>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 h-8 w-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 shadow-md shadow-blue-500/20">
        <Crown className="h-4 w-4 text-white" />
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center h-5">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="h-2 w-2 rounded-full bg-blue-400"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function AICareerTwin() {
  const [messages, setMessages] = useState<CareerTwinMessage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ExecutiveProfile | null>(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { refreshSummary } = useSubscription();

  useEffect(() => { refreshSummary(); }, [refreshSummary]);
  useEffect(() => { venusService.getProfile().then(setProfile).catch(() => null); }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_HISTORY))); } catch {}
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text = input.trim()) => {
    if (!text || loading) return;
    setInput("");
    const userMsg: CareerTwinMessage = { role: "user", content: text, timestamp: new Date().toISOString() };
    setMessages(m => [...m, userMsg]);
    setLoading(true);
    try {
      const { reply } = await venusService.sendCareerTwinMessage({ message: text, history: [...messages, userMsg] });
      setMessages(m => [...m, { role: "assistant", content: reply, timestamp: new Date().toISOString() }]);
      refreshSummary();
    } catch (error: any) {
      if (isPlanLimitError(error)) {
        toast.error(getApiErrorMessage(error) || "Plan limit reached. Upgrade to continue.");
        return;
      }
      setMessages(m => [...m, { role: "assistant", content: getDemoReply(text), timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Conversation cleared.");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const isEmpty = messages.length === 0;
  const cat = CATEGORIES[activeCategory];

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden bg-gray-50/40">

      {/* ── Left Sidebar ── */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-gray-200 bg-white overflow-y-auto">

        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-500/25">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">Hizorex AI</p>
              <p className="text-sm font-black text-gray-900">Career Twin</p>
            </div>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">
            Your personal AI advisor trained on executive career strategy, comp negotiation & board positioning.
          </p>
        </div>

        {/* Profile context */}
        {profile?.role && (
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-2">Personalised for</p>
            <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-3 py-2.5">
              <Bot className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-blue-800 truncate">{profile.role}</p>
                {profile.growth_stage && (
                  <p className="text-[10px] text-blue-600 capitalize">{profile.growth_stage.replace(/_/g, " ")} stage</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Usage */}
        <div className="px-5 py-4 border-b border-gray-100">
          <UsageMonitor featureKey="career_twin_access" compact />
        </div>

        {/* Category tabs */}
        <div className="px-5 py-4 flex-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-3">Quick Prompts</p>
          <div className="space-y-1 mb-4">
            {CATEGORIES.map((c, i) => (
              <button key={i} type="button" onClick={() => setActiveCategory(i)}
                className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  activeCategory === i
                    ? "bg-blue-600 text-white"
                    : "text-gray-800 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <c.icon className="h-3.5 w-3.5 shrink-0" />
                {c.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeCategory}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-2"
            >
              {cat.prompts.map((prompt, i) => (
                <button key={i} type="button" onClick={() => send(prompt)}
                  className={`w-full text-left rounded-xl border px-3 py-2.5 text-xs font-medium text-gray-800 hover:text-gray-900 transition-all hover:shadow-sm flex items-start gap-2 group ${cat.bg} hover:border-blue-300`}
                >
                  <ChevronRight className={`h-3 w-3 shrink-0 mt-0.5 ${cat.color} group-hover:translate-x-0.5 transition-transform`} />
                  <span className="leading-snug">{prompt}</span>
                </button>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Clear */}
        {messages.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100">
            <button type="button" onClick={clearHistory}
              className="w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all">
              <RotateCcw className="h-3.5 w-3.5" />
              Clear conversation
            </button>
          </div>
        )}
      </aside>

      {/* ── Chat Area ── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Chat header */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900">AI Career Twin</p>
              <p className="text-[10px] text-gray-700 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
                Ready to advise
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile clear */}
            {messages.length > 0 && (
              <button type="button" onClick={clearHistory}
                className="lg:hidden flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all">
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

          {isEmpty && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-12">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-xl shadow-blue-500/25">
                <Crown className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-2">Your Hizorex Career Twin</h2>
                <p className="text-sm text-gray-700 max-w-md leading-relaxed">
                  Ask anything about executive career decisions — comp negotiation, board positioning, PE diligence, or building your personal brand.
                </p>
              </div>

              {/* Mobile quick prompts */}
              <div className="lg:hidden w-full max-w-lg space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-700">Try a question</p>
                {CATEGORIES[0].prompts.map((p, i) => (
                  <button key={i} type="button" onClick={() => send(p)}
                    className="w-full text-left rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 px-4 py-3 text-sm text-gray-800 hover:text-gray-900 transition-all flex items-center gap-3">
                    <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    {p}
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-700">← Pick a topic from the left panel to get started</p>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} index={i} />)}
          </AnimatePresence>

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white shrink-0">
          <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your executive career — compensation, board strategy, role decisions..."
                rows={1}
                className="w-full resize-none rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 pr-12 text-sm text-gray-900 placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all max-h-36 overflow-y-auto [field-sizing:content]"
              />
            </div>
            <button
              type="button"
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-500/25"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-[10px] text-gray-700 mt-2 text-center">
            Enter to send · Shift+Enter for new line · Conversation saved locally
          </p>
        </div>
      </div>
    </div>
  );
}
