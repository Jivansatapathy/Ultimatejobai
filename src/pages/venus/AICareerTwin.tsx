import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Loader2, Crown, Trash2, Sparkles,
  DollarSign, Users, Building2, Megaphone, Briefcase,
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
    prompts: [
      "Should I take the fractional CTO role or wait for a full-time CEO opportunity?",
      "How do I evaluate a Series B offer vs staying at my current company?",
      "When is the right time to make a lateral move to gain a missing skill?",
    ],
  },
  {
    label: "Compensation",
    icon: DollarSign,
    prompts: [
      "My comp is 30% below market — how do I negotiate without souring the relationship?",
      "How should I think about equity vs. cash when joining a Series A?",
      "What MIP structure should I expect at a PE-backed company?",
    ],
  },
  {
    label: "Board & Advisory",
    icon: Users,
    prompts: [
      "How do I get my first board seat with no current board experience?",
      "What's the difference between an advisory role and a board observer seat?",
      "How do I negotiate an advisory equity grant fairly?",
    ],
  },
  {
    label: "PE / VC",
    icon: Building2,
    prompts: [
      "I'm being recruited by a PE-backed company — what should I diligence first?",
      "How is working for a PE sponsor different from a VC-backed startup?",
      "What should I ask about fund vintage and hold period?",
    ],
  },
  {
    label: "Personal Brand",
    icon: Megaphone,
    prompts: [
      "How do I build an executive brand without it feeling self-promotional?",
      "What LinkedIn content strategy actually works for C-suite executives?",
      "How do I become known in a new industry with no prior connections?",
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

What's the specific constraint you're trying to solve for?`,
};

function getDemoReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("fractional") || lower.includes("full-time") || lower.includes("series b offer")) {
    return `The fractional vs. full-time decision is one of the most consequential an executive makes — and most people frame it as a financial question when it's really a positioning question.

**Fractional makes sense if:**
- You want to build a portfolio of relationships across 2–4 companies simultaneously
- You're transitioning into a new industry and need to de-risk the learning curve
- Your market value is significantly above what one company would pay full-time

**Full-time makes sense if:**
- You want a singular P&L story for your next board seat or executive search
- The company is at an inflection point where presence and deep context matters
- You're 18–24 months from a liquidity event you want equity in

**The question to ask yourself:** In 3 years, which story lands better with your next employer?`;
  }
  if (lower.includes("board") || lower.includes("advisory")) {
    return `Board seats are a chicken-and-egg problem. Here's how executives break the cycle:

**Step 1: Non-profit boards first**
12 months on a non-profit board gives you governance experience and vocabulary — removes the "no board experience" objection.

**Step 2: Become board-adjacent**
Serve as an observer or advisor where you already have relationships.

**Step 3: Position through operators, not boards**
Board seats come from CEOs, not other board members. Build 10 deep relationships with Series B/C CEOs in your sector. When they need a director with your background, you're the first call.

**Step 4: Be specific about your value-add**
"I've scaled GTM from $10M to $80M ARR twice" beats "strong leader with broad experience" every time.

Where are you in this progression?`;
  }
  if (lower.includes("comp") || lower.includes("salary") || lower.includes("negotiat") || lower.includes("mip")) {
    return `Compensation negotiation is one of the most high-leverage skills an executive can develop.

**The core principle:** You're not asking for more money. You're establishing the market price for your role.

**Tactical approach:**
1. **Don't be the first to name a number.** Ask what they've budgeted before you anchor.
2. **Anchor high, with data.** Have Radford or comparable hires ready when you do name a number.
3. **Negotiate the package, not just base.** Equity, bonus structure, and signing bonus often have more flex than base.
4. **Know your walk-away before the room.** Executives who discover it mid-conversation almost always accept below market.

**On souring the relationship:** Good leaders respect people who know their worth. If they resent you for negotiating, that tells you something important about the culture.

What's the gap between their offer and your target?`;
  }
  if (lower.includes("pe") || lower.includes("private equity") || lower.includes("fund vintage")) {
    return `PE-backed roles are fundamentally different from VC-backed or public company roles — and executives who don't understand that get blindsided fast.

**What to diligence before saying yes:**

**1. The thesis** — "What has to be true for this investment to return 3x?" If they can't answer cleanly, the operating plan doesn't exist yet.

**2. The MIP structure** — Get it before you accept. Key: What multiple triggers the pool? What's your percentage? What happens to unvested MIP if you're let go?

**3. The hold period** — Early-fund deals have runway; late-fund deals are being pushed to exit. Ask: "How many years into the fund is this investment?"

**4. Talk to portfolio operators** — 2–3 executives from other portfolio companies, without the firm present. Ask: "How does the firm behave when things go wrong?"

What stage is the company and do you know the fund vintage?`;
  }
  if (lower.includes("brand") || lower.includes("linkedin") || lower.includes("thought leadership")) {
    return `Executive personal brand feels like self-promotion. The reframe: you're not building a brand, you're creating surface area for luck to land on.

**The framework that works:**

**1. One medium, one topic** — LinkedIn and one specific topic where you have a genuine edge. "Leadership" is not a topic. "How to scale engineering teams from 10 to 100 without regression" is.

**2. The 80/20 rule** — 80% of content makes the reader smarter about something that doesn't mention you. 20% is your story.

**3. Consistency beats volume** — One high-quality post per week beats three mediocre ones.

**4. The comment strategy** — Thoughtful comments on posts by people with 10x your audience often drive faster growth than original posts.

**5. Write as you speak** — Executives who write how they think they should sound get ignored.

What's your goal — board seat visibility, exec search inbound, or a new sector network?`;
  }
  return DEMO_RESPONSES.default;
}

// ── Components ─────────────────────────────────────────────────────────────────

function renderMarkdown(content: string, isUser: boolean) {
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.15) }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div className={`shrink-0 h-8 w-8 rounded-xl flex items-center justify-center mt-0.5 ${
        isUser
          ? "bg-blue-100 border border-blue-200"
          : "bg-gradient-to-br from-blue-600 to-blue-800 shadow-sm"
      }`}>
        {isUser
          ? <span className="text-[9px] font-black text-blue-700 tracking-wide">YOU</span>
          : <Crown className="h-4 w-4 text-white" />
        }
      </div>

      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-blue-600 text-white rounded-tr-sm"
            : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
        }`}>
          {renderMarkdown(msg.content, isUser)}
        </div>
        <span className="text-[10px] text-gray-500 px-1">{time}</span>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-sm shrink-0">
        <Crown className="h-4 w-4 text-white" />
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center h-5">
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              className="h-2 w-2 rounded-full bg-blue-400"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
            />
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

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-sm">
            <Crown className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900 leading-tight">AI Career Twin</p>
            {profile?.role && (
              <p className="text-[11px] text-gray-500 leading-tight">Personalised for {profile.role}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <UsageMonitor featureKey="career_twin_access" compact />
          {messages.length > 0 && (
            <button type="button" onClick={clearHistory}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all">
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Messages / Empty state ── */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          /* ── Empty state — full centre layout ── */
          <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl"
            >
              {/* Hero */}
              <div className="text-center mb-10">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-xl shadow-blue-500/25 mx-auto mb-5">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-2">Your Hizorex Career Twin</h1>
                <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                  Your AI advisor for C-suite decisions — compensation, board positioning, role transitions, and executive strategy.
                </p>
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {CATEGORIES.map((cat, i) => (
                  <button key={i} type="button" onClick={() => setActiveCategory(i)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                      activeCategory === i
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/30"
                        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-700"
                    }`}
                  >
                    <cat.icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Prompt cards */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="grid gap-3"
                >
                  {CATEGORIES[activeCategory].prompts.map((prompt, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      type="button"
                      onClick={() => send(prompt)}
                      className="group w-full text-left rounded-2xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-blue-300 hover:shadow-md px-5 py-4 transition-all flex items-center gap-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all">
                        <Sparkles className="h-3.5 w-3.5 text-blue-500 group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium leading-snug flex-1">
                        {prompt}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        ) : (
          /* ── Chat messages ── */
          <div className="max-w-3xl mx-auto w-full px-6 py-8 space-y-6">
            <AnimatePresence>
              {messages.map((msg, i) => <MessageBubble key={i} msg={msg} index={i} />)}
            </AnimatePresence>
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input ── */}
      <div className="shrink-0 px-6 py-5 border-t border-gray-100 bg-white">
        <div className="max-w-3xl mx-auto flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about compensation, board strategy, role decisions, or PE diligence..."
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all max-h-40 overflow-y-auto [field-sizing:content]"
          />
          <button
            type="button"
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mt-2.5 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
