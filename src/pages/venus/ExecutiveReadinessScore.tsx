import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Loader2, TrendingUp, AlertCircle, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { venusService, ReadinessScoreResult } from "@/services/venusService";
import { UsageMonitor } from "@/components/subscription/UsageMonitor";
import { useSubscription } from "@/context/SubscriptionContext";
import { getApiErrorMessage, isPlanLimitError } from "@/lib/utils";

const DIMENSIONS = [
  { key: "strategic_vision", label: "Strategic Vision", desc: "Ability to define and communicate 3–5 year direction", weight: 0.20 },
  { key: "pl_ownership", label: "P&L Ownership", desc: "Track record of owning revenue and margin outcomes", weight: 0.20 },
  { key: "team_leadership", label: "Team Leadership", desc: "Building, developing, and retaining executive talent", weight: 0.20 },
  { key: "exec_presence", label: "Executive Presence", desc: "Board, investor, and public communications", weight: 0.15 },
  { key: "industry_network", label: "Industry Network", desc: "Depth of relevant executive relationships", weight: 0.15 },
  { key: "board_experience", label: "Board Experience", desc: "Direct experience with boards and governance", weight: 0.10 },
] as const;

type DimensionKey = typeof DIMENSIONS[number]["key"];

const ROLE_OPTIONS = [
  "CEO", "COO", "CTO", "CFO", "CPO", "CMO", "CRO", "Board Director",
  "Fractional CXO", "PE Operating Partner", "Startup Advisor",
];

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : score >= 40 ? "text-orange-600" : "text-red-600";
  const bgColor = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : score >= 40 ? "bg-orange-500" : "bg-red-500";
  const label = score >= 80 ? "Ready" : score >= 60 ? "Nearly Ready" : score >= 40 ? "Building" : "Early Stage";

  return (
    <div className="flex flex-col items-center py-6">
      <div className="relative flex items-center justify-center w-36 h-36">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="12" />
          <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor"
            strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 326.7} 326.7`}
            className={color} />
        </svg>
        <div className="text-center z-10">
          <p className={`text-4xl font-black tabular-nums ${color}`}>{score}</p>
          <p className="text-xs text-gray-700 font-bold">/100</p>
        </div>
      </div>
      <div className={`mt-3 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${bgColor}/20 ${color}`}>
        {label}
      </div>
    </div>
  );
}

function DimensionBar({ dim, score }: { dim: typeof DIMENSIONS[number]; score: number }) {
  const barWidth = `${score * 10}%`;
  const color = score >= 8 ? "bg-emerald-500" : score >= 6 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">{dim.label}</p>
          <p className="text-xs text-gray-700">{dim.desc}</p>
        </div>
        <span className="text-sm font-black text-gray-800 tabular-nums">{score}/10</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: barWidth }} transition={{ duration: 0.6, delay: 0.1 }}
          className={`h-full rounded-full ${color}`} />
      </div>
    </div>
  );
}

function buildDemoResult(targetRole: string, scores: Record<string, number>): ReadinessScoreResult {
  const weightedSum = DIMENSIONS.reduce((acc, d) => acc + (scores[d.key] ?? 5) * d.weight, 0);
  const overall = Math.round(weightedSum * 10);

  const lowestDims = [...DIMENSIONS]
    .sort((a, b) => (scores[a.key] ?? 5) - (scores[b.key] ?? 5))
    .slice(0, 3);

  return {
    overall_score: overall,
    target_role: targetRole || "Executive",
    dimensions: DIMENSIONS.map(d => ({
      name: d.label,
      score: scores[d.key] ?? 5,
      weight: d.weight,
      insight: scores[d.key] >= 8
        ? `Strong — this is a clear differentiator in ${targetRole} searches.`
        : scores[d.key] >= 6
        ? `Solid foundation. One high-visibility win in the next 6 months would elevate this score.`
        : `This dimension needs active development before you're competitive for ${targetRole} roles at target-stage companies.`,
    })),
    key_gaps: lowestDims.map(d => `${d.label}: score ${scores[d.key] ?? 5}/10 — below threshold for top-quartile ${targetRole} candidates`),
    action_plan: [
      { week: 1, action: `Map the 10 people who directly influence ${targetRole} searches in your target sector`, priority: "high" },
      { week: 2, action: `Identify 2 stretch projects or visible wins to close the ${lowestDims[0]?.label} gap`, priority: "high" },
      { week: 4, action: "Request board/investor feedback on one recent decision — direct input builds presence", priority: "high" },
      { week: 6, action: "Publish one piece of thought leadership content positioning you for the target role", priority: "medium" },
      { week: 8, action: "Schedule 3 conversations with executives who made the same transition in the last 18 months", priority: "medium" },
      { week: 10, action: "Do a dry run interview with a trusted peer — record and debrief on presence and framing", priority: "medium" },
      { week: 12, action: "Reassess readiness score — track improvement on gap dimensions, adjust action plan", priority: "high" },
    ],
    verdict: overall >= 80
      ? `You are ready to pursue ${targetRole} roles competitively. Focus on selectivity — target the right company stage and sector fit.`
      : overall >= 60
      ? `You are close to ${targetRole} readiness. Close 1–2 gap dimensions in the next 90 days and you'll be competitive in most searches.`
      : `You have a strong foundation but 2–3 material gaps to close before being competitive for ${targetRole}. Use the 90-day plan to prioritize.`,
  };
}

export default function ExecutiveReadinessScore() {
  const [targetRole, setTargetRole] = useState("");
  const [scores, setScores] = useState<Record<DimensionKey, number>>({
    strategic_vision: 5, pl_ownership: 5, team_leadership: 5,
    exec_presence: 5, industry_network: 5, board_experience: 5,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReadinessScoreResult | null>(null);
  const { refreshSummary } = useSubscription();

  useEffect(() => { refreshSummary(); }, [refreshSummary]);

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await venusService.calculateReadinessScore({ target_role: targetRole, dimensions: scores });
      setResult(res);
      refreshSummary();
    } catch (error: any) {
      if (isPlanLimitError(error)) {
        toast.error(getApiErrorMessage(error) || "Plan limit reached. Upgrade to continue.");
        return;
      }
      toast.info("Showing local assessment — connect Hizorex API for AI-enhanced analysis.");
      setResult(buildDemoResult(targetRole, scores));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Priority 2 · Assessment</p>
          <UsageMonitor featureKey="readiness_score_access" compact />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mt-0.5">Executive Readiness Score</h1>
        <p className="text-sm text-gray-700 mt-1">Rate yourself on 6 executive dimensions. Get a score, gap analysis, and 90-day action plan.</p>
      </div>

      {/* Assessment panel */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-5">
        {/* Target role */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-800 mb-2 block">Target Role</label>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {ROLE_OPTIONS.map(r => (
              <button key={r} type="button" onClick={() => setTargetRole(r)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  targetRole === r ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900"
                }`}>
                {r}
              </button>
            ))}
          </div>
          <Input value={targetRole} onChange={e => setTargetRole(e.target.value)}
            placeholder="Or type a custom role..."
            className="bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-700 rounded-xl" />
        </div>

        {/* Sliders */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-800 mb-3">Self-Assessment (1 = beginner, 10 = world-class)</p>
          <div className="space-y-5">
            {DIMENSIONS.map(dim => (
              <div key={dim.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{dim.label}</p>
                    <p className="text-xs text-gray-700">{dim.desc}</p>
                  </div>
                  <span className="text-lg font-black text-blue-600 w-8 text-right tabular-nums">
                    {scores[dim.key]}
                  </span>
                </div>
                <input type="range" min={1} max={10} step={1}
                  value={scores[dim.key]}
                  onChange={e => setScores(s => ({ ...s, [dim.key]: Number(e.target.value) }))}
                  className="w-full accent-blue-500 cursor-pointer" />
                <div className="flex justify-between text-[10px] text-gray-700">
                  <span>1 — Beginner</span>
                  <span className="text-gray-700">weight {Math.round(dim.weight * 100)}%</span>
                  <span>10 — World-class</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={calculate} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11">
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Calculating your score...</>
            : <><Target className="h-4 w-4 mr-2" />Calculate Readiness Score</>}
        </Button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Score + verdict */}
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ScoreGauge score={result.overall_score} />
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">
                    Readiness for {result.target_role}
                  </p>
                  <p className="text-gray-900 font-medium leading-relaxed">{result.verdict}</p>
                </div>
              </div>
            </div>

            {/* Dimension breakdown */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-black text-gray-900 uppercase tracking-wide">Dimension Breakdown</p>
              </div>
              <div className="space-y-5">
                {result.dimensions.map((dim, i) => {
                  const raw = DIMENSIONS.find(d => d.label === dim.name);
                  return raw ? <DimensionBar key={i} dim={raw} score={dim.score} /> : null;
                })}
              </div>
            </div>

            {/* Insights per dimension */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-black text-gray-900 uppercase tracking-wide mb-4">Dimension Insights</p>
              <div className="space-y-3">
                {result.dimensions.map((dim, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className={`shrink-0 mt-0.5 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      dim.score >= 8 ? "bg-emerald-100 text-emerald-700" : dim.score >= 6 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                    }`}>
                      {dim.score}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{dim.name}</p>
                      <p className="text-xs text-gray-800 mt-0.5">{dim.insight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key gaps */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-black text-gray-900 uppercase tracking-wide">Key Gaps</p>
              </div>
              <ul className="space-y-2">
                {result.key_gaps.map((gap, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-800">
                    <span className="text-amber-500 shrink-0 mt-0.5">⚠</span>
                    {gap}
                  </li>
                ))}
              </ul>
            </div>

            {/* 90-day action plan */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-black text-gray-900 uppercase tracking-wide">90-Day Action Plan</p>
              </div>
              <div className="space-y-2">
                {result.action_plan.map((item, i) => (
                  <div key={i} className="flex gap-3 items-start rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
                    <div className="shrink-0">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                        item.priority === "high" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-800"
                      }`}>
                        Wk {item.week}
                      </span>
                    </div>
                    <div className="flex-1 flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-gray-700 shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-800">{item.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !loading && (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <Target className="h-10 w-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold">Rate yourself across 6 dimensions above</p>
          <p className="text-xs text-gray-700 mt-1">Get your readiness score, gap analysis, and a 12-week action plan</p>
        </div>
      )}
    </div>
  );
}
