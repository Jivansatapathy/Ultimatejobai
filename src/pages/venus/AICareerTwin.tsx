import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Crown, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { venusService, CareerTwinMessage, ExecutiveProfile } from "@/services/venusService";

const STORAGE_KEY = "venus_career_twin_history";
const MAX_HISTORY = 50;

const STARTER_PROMPTS = [
  "Should I take the fractional CTO role or wait for a full-time CEO opportunity?",
  "How do I position myself for board seats with no current board experience?",
  "My comp is 30% below market. How do I negotiate without souring the relationship?",
  "I'm being recruited by a PE-backed company. What should I diligence before saying yes?",
  "How do I build a personal brand as an executive without it feeling self-promotional?",
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

**The question I'd ask yourself:** In 3 years, when you're telling your next employer what you did, which story lands better?

One more thing: don't underestimate the identity impact. Full-time executives with a company affiliation tend to get more inbound than fractional executives, especially from PE sponsors. Fractional builds breadth; full-time builds depth. Neither is wrong — but they compound differently.`;
  }
  if (lower.includes("board")) {
    return `Board seats are a chicken-and-egg problem — companies want board members with board experience, but you need a first seat to get experience. Here's how executives break this cycle:

**Step 1: Non-profit boards first**
Spend 12 months on a non-profit board in your industry. You'll get governance experience, build the vocabulary, and get comfortable in a board dynamic. This removes the "no board experience" objection.

**Step 2: Become board-adjacent**
Serve as an observer or advisor to a board where you already have relationships. Ask a board member at a portfolio company of a VC you know — they often have advisory needs.

**Step 3: Position through operators, not boards**
Board seats come from CEOs, not other board members. Build 10 deep relationships with Series B/C CEOs in your sector. When they need a director with your background, you're the first call.

**Step 4: Be specific about your value-add**
Boards don't want generalists. Pick one or two specific contributions: "I've scaled GTM from $10M to $80M ARR twice" or "I've been through two PE ownership transitions." That specificity is what gets you the first meeting.

Where are you in this progression? That'll help me give you a more targeted path.`;
  }
  if (lower.includes("comp") || lower.includes("salary") || lower.includes("negotiat")) {
    return `Compensation negotiation is one of the most high-leverage skills an executive can develop — and most underperform because they're afraid of the awkward conversation.

**The core principle:** You're not asking for more money. You're establishing the market price for your role.

**The tactical approach:**
1. **Don't be the first to name a number.** Ask: "What have you budgeted for this role?" If they push back, say: "I want to make sure we're not wasting each other's time, so I'd like to understand the range before I share mine."

2. **Anchor high, with data.** When you do name a number, have market comps ready — Radford, Levels.fyi, or comparable recent hires. Frame it as: "Based on market data for this role at this stage, I'm targeting $X–$Y total comp."

3. **Negotiate the package, not just base.** Often you can get more in equity, bonus structure, or signing bonus even when base is "locked."

4. **The walk-away number matters.** Know it before the conversation. Executives who discover their walk-away in the room almost always accept below market.

**On souring the relationship:** The risk is lower than you think. A hiring manager who resents you for negotiating wasn't going to be a good boss anyway. Good leaders respect people who know their worth.

What's the gap between their offer and your target? I can help you structure the specific counter.`;
  }
  if (lower.includes("pe") || lower.includes("private equity")) {
    return `PE-backed roles are fundamentally different from VC-backed or public company roles, and executives who don't understand that difference get blindsided.

**What to diligence before saying yes:**

**1. The thesis**
"What has to be true for this investment to return 3x?" If they can't answer that cleanly, the operating plan doesn't exist yet — and you'll be building it under pressure with no runway.

**2. The management incentive plan (MIP)**
This is where most PE-backed execs leave money on the table. Get the MIP structure before you accept. Key questions: What multiple triggers the pool? What's your percentage of the pool? Is there a catch-up provision? What happens to unvested MIP if you're let go?

**3. The hold period**
Early-fund deals have more time; late-fund deals are being pushed to exit. That changes your operating latitude dramatically. Ask: "How many years into the fund is this investment?"

**4. The team**
Talk to 2–3 executives from other portfolio companies — without the firm present. Ask: "How does the firm operate when things go wrong?"

**5. The carve-out / co-invest**
Some firms allow management co-investment. If offered, take it seriously — it's often the best risk-adjusted return available to a senior exec.

What stage is the PE company and do you know the fund vintage?`;
  }
  if (lower.includes("brand") || lower.includes("thought leadership")) {
    return `Executive personal brand is uncomfortable for most operators because it feels like self-promotion. The reframe: you're not building a brand, you're creating a surface area for luck to land on.

**The framework that works:**

**1. One medium, one topic**
Pick one platform (LinkedIn for most executives) and one specific topic where you have a genuine edge. "Leadership" is not a topic. "How to build engineering teams that can scale from 10 to 100 without regressing" is a topic.

**2. The 80/20 rule**
80% of your content should make the reader smarter about something that doesn't directly mention you. 20% can be your story or your wins. People follow people who make them smarter, not people who brag.

**3. Consistency beats volume**
One high-quality post per week beats three mediocre ones. Quality signals that you have standards. Cadence signals that you're not going anywhere.

**4. The comment strategy**
For most executives, the fastest growth comes from thoughtful comments on posts by people with 10x their audience. A 3-paragraph comment that adds genuine value can drive hundreds of followers.

**5. The authenticity constraint**
Write as you speak. Executives who write how they think they should sound read as corporate and get ignored. The ones who write how they actually talk build real audiences.

What's your specific goal — building inbound for board seats, exec search visibility, or building a network in a new sector?`;
  }
  return DEMO_RESPONSES.default;
}

function MessageBubble({ msg }: { msg: CareerTwinMessage }) {
  const isUser = msg.role === "user";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`shrink-0 h-8 w-8 rounded-xl flex items-center justify-center ${
        isUser ? "bg-gray-100" : "bg-gradient-to-br from-blue-600 to-blue-800"
      }`}>
        {isUser ? <span className="text-xs font-bold text-gray-600">You</span> : <Crown className="h-4 w-4 text-white" />}
      </div>
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
        isUser ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white border border-gray-200 text-gray-700 rounded-tl-sm"
      }`}>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
            part.startsWith("**") && part.endsWith("**")
              ? <strong key={i} className={`font-bold ${isUser ? "text-white" : "text-gray-900"}`}>{part.slice(2, -2)}</strong>
              : part
          )}
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 h-8 w-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
        <Crown className="h-4 w-4 text-white" />
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-5">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="h-1.5 w-1.5 rounded-full bg-blue-500"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AICareerTwin() {
  const [messages, setMessages] = useState<CareerTwinMessage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ExecutiveProfile | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    venusService.getProfile().then(setProfile).catch(() => null);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)));
    } catch {}
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text = input.trim()) => {
    if (!text || loading) return;
    setInput("");

    const userMsg: CareerTwinMessage = { role: "user", content: text, timestamp: new Date().toISOString() };
    setMessages(m => [...m, userMsg]);
    setLoading(true);

    try {
      const history = [...messages, userMsg];
      const { reply } = await venusService.sendCareerTwinMessage({ message: text, history });
      setMessages(m => [...m, { role: "assistant", content: reply, timestamp: new Date().toISOString() }]);
    } catch {
      const reply = getDemoReply(text);
      setMessages(m => [...m, { role: "assistant", content: reply, timestamp: new Date().toISOString() }]);
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Priority 2 · AI</p>
          <h1 className="text-lg font-black text-gray-900">AI Career Twin</h1>
          {profile?.role && (
            <p className="text-xs text-gray-400">Personalized for {profile.role}{profile.growth_stage ? ` · ${profile.growth_stage}` : ""}</p>
          )}
        </div>
        {messages.length > 0 && (
          <Button size="sm" variant="outline" onClick={clearHistory}
            className="border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-red-600 h-7 text-xs">
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {isEmpty && (
          <div className="py-8">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-lg font-black text-gray-900">Venus Career Twin</h2>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">
                Your AI advisor trained on executive career strategy. Ask about comp negotiation, board positioning, role decisions, or PE diligence.
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Or start with a common question:</p>
              <div className="space-y-2">
                {STARTER_PROMPTS.map((prompt, i) => (
                  <button key={i} type="button" onClick={() => send(prompt)}
                    className="w-full text-left rounded-xl border border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-gray-100 px-4 py-3 text-sm text-gray-600 hover:text-gray-900 transition-all flex items-center gap-3">
                    <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        </AnimatePresence>
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200 shrink-0">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Venus anything about your executive career..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all max-h-32 overflow-y-auto"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <Button onClick={() => send()} disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white h-11 w-11 p-0 shrink-0 rounded-xl">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          Shift+Enter for new line · Enter to send · Conversation saved locally
        </p>
      </div>
    </div>
  );
}
