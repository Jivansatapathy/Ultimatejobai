import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, TrendingUp, BookOpen, Send, Loader2, Lightbulb,
  ArrowRight, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getCareerAdvice } from "@/services/aiService";
import { careerService } from "@/services/careerService";
import { useResume } from "@/hooks/useResume";
import { activityService } from "@/services/activityService";

// ─── Quick prompt chips ────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  "I have an offer from a Fortune 500 at $350k. Should I take it or hold out for equity-heavy startups?",
  "I'm a VP considering a move to a board role. What are the trade-offs?",
  "Two offers: one fully remote senior role, one hybrid C-suite with relocation. How do I decide?",
  "I've been in my role 3 years with no promotion. Should I look externally?",
];

export default function VenusAIInsights() {
  const navigate = useNavigate();
  const { activeResume } = useResume();
  const [offerText, setOfferText] = useState("");
  const [advice, setAdvice] = useState("");
  const [isAdvising, setIsAdvising] = useState(false);
  const [savedHistory, setSavedHistory] = useState<{ q: string; a: string }[]>([]);

  const handleGetAdvice = async () => {
    if (!offerText.trim()) return;
    setIsAdvising(true);
    setAdvice("");
    try {
      const resumeContent = activeResume ? JSON.stringify(activeResume) : "";
      const resp = await getCareerAdvice(offerText, resumeContent);
      setAdvice(resp);

      // Save to backend + local history
      await careerService.createAdvice(offerText, resp).catch(() => {});
      setSavedHistory(prev => [{ q: offerText, a: resp }, ...prev].slice(0, 5));

      activityService.logActivity({
        activity_type: "CAREER_ADVICE",
        description: "Requested AI career insight",
        metadata: { hasAdvice: !!resp },
      });
    } catch {
      setAdvice("Unable to generate advice right now. Please try again.");
    } finally {
      setIsAdvising(false);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await careerService.getAdvices();
      if (data.length > 0) {
        setSavedHistory(data.slice(0, 5).map((d: any) => ({ q: d.offer_text || "Career query", a: d.advice })));
      }
    } catch { /* silent */ }
  };

  // Load history on mount
  useState(() => { loadHistory(); });

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Hizorex AI · Strategic Intelligence</p>
        <h1 className="text-2xl font-black text-gray-900 mt-0.5">AI Insights</h1>
        <p className="text-sm text-gray-400 mt-1">Paste any offer, dilemma, or career decision — Hizorex AI gives executive-level strategic analysis.</p>
      </div>

      {/* Career Strategic Planner CTA */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-white">
          <TrendingUp className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-0.5">AI-Powered</p>
          <h3 className="text-sm font-black text-gray-900">Career Strategic Planner</h3>
          <p className="text-xs text-gray-500 mt-0.5">Build a concrete 12–24 month roadmap with your AI career advisor.</p>
        </div>
        <Button
          onClick={() => navigate("/career-planner")}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 h-9 rounded-xl text-sm gap-2"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Start Session
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </motion.div>

      {/* Career Move Analyzer */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-200 bg-blue-50">
            <Sparkles className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900">Career Move Analyzer</h3>
            <p className="text-xs text-gray-400">AI weighs the pros, cons, and executive fit of your decision</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Quick prompts */}
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setOfferText(p)}
                className="text-[11px] font-medium px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all"
              >
                {p.length > 48 ? p.slice(0, 48) + "…" : p}
              </button>
            ))}
          </div>

          <textarea
            placeholder="Paste your offer letter, describe a career dilemma, or ask for strategic advice…"
            className="w-full min-h-[120px] p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all resize-none text-sm leading-relaxed placeholder:text-gray-400"
            value={offerText}
            onChange={e => setOfferText(e.target.value)}
          />

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400">Your executive profile is used as context automatically.</p>
            <Button
              onClick={handleGetAdvice}
              disabled={isAdvising || !offerText.trim()}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-9 px-5 text-sm disabled:opacity-50"
            >
              {isAdvising ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Analyze
            </Button>
          </div>
        </div>

        {/* AI Response */}
        <AnimatePresence>
          {advice && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-5 mb-5 rounded-xl border border-blue-200 bg-blue-50 overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-blue-100">
                <Lightbulb className="h-4 w-4 text-blue-600 shrink-0" />
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Hizorex AI Analysis</p>
              </div>
              <div className="px-4 py-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {advice}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Past Insights */}
      {savedHistory.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">Recent Analyses</h3>
            <button type="button" onClick={loadHistory}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors">
              <RefreshCw className="h-3 w-3" /> Refresh
            </button>
          </div>

          <div className="space-y-3">
            {savedHistory.map((item, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-semibold text-gray-600 mb-2 line-clamp-2">{item.q}</p>
                <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{item.a}</p>
                <button
                  type="button"
                  onClick={() => { setOfferText(item.q); setAdvice(item.a); }}
                  className="mt-2 text-[11px] text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Load →
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tips card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="grid sm:grid-cols-2 gap-4">
        {[
          {
            icon: Lightbulb,
            color: "bg-amber-50 border-amber-200 text-amber-600",
            title: "For Best Results",
            tips: [
              "Include specific numbers (salary, equity %)",
              "Mention competing offers if you have them",
              "Describe the company stage and sector",
            ],
          },
          {
            icon: Sparkles,
            color: "bg-blue-50 border-blue-200 text-blue-600",
            title: "What Venus Analyzes",
            tips: [
              "Total comp vs. market benchmarks",
              "Career trajectory & title progression",
              "Company risk, growth, and culture fit",
            ],
          },
        ].map(({ icon: Icon, color, title, tips }) => (
          <div key={title} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl border mb-3 ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-black text-gray-900 mb-2">{title}</h4>
            <ul className="space-y-1">
              {tips.map(t => (
                <li key={t} className="text-xs text-gray-500 flex items-start gap-1.5">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-gray-300 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
