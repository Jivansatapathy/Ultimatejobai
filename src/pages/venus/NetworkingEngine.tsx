import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Network, Loader2, ArrowRight, Newspaper, RefreshCw, Lightbulb, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { venusService, NetworkRecommendation } from "@/services/venusService";

const PRIORITY_COLORS: Record<string, string> = {
  high: "border-violet-500/30 bg-violet-950/30",
  medium: "border-zinc-700 bg-zinc-900",
  low: "border-zinc-800 bg-zinc-900/50",
};
const PRIORITY_BADGE: Record<string, string> = {
  high: "bg-violet-500/20 text-violet-300",
  medium: "bg-zinc-700 text-zinc-400",
  low: "bg-zinc-800 text-zinc-600",
};
const TYPE_ICONS: Record<string, string> = {
  warm_intro: "🤝", community: "🏛️", alumni: "🎓", conference: "🎤", exec_move: "🚀",
};

const DEMO_RECS: NetworkRecommendation[] = [
  { type: "warm_intro", title: "Warm Intro Available", description: "Your contact Sarah Kim (Sequoia) knows the CEO of your target company — 2 mutual connections on LinkedIn.", action_label: "Draft intro message", action_url: "https://www.linkedin.com/messaging/compose/", priority: "high" },
  { type: "community", title: "Join CTO Craft", description: "Based on your CTO profile and Series B focus, CTO Craft has the highest ROI exec community for your stage.", action_label: "Apply to join", action_url: "https://ctocraft.com/community/", priority: "high" },
  { type: "conference", title: "SaaStr Annual", description: "Your network contacts attend this. 3 target companies are sponsoring — ideal for warm intros.", action_label: "Register", action_url: "https://www.saastrannual.com/", priority: "medium" },
  { type: "alumni", title: "Alumni Network — 3 Matches", description: "3 alumni from your background are now CEOs of startups in your target stage.", action_label: "View profiles", action_url: "https://www.linkedin.com/alumni/", priority: "medium" },
  { type: "exec_move", title: "Former Colleague Update", description: "Alex Chen (ex-AWS) just became CEO of a Series B FinTech. Consider reconnecting.", action_label: "Reach out", action_url: "https://www.linkedin.com/search/results/people/", priority: "high" },
];

function RecommendationCard({ rec }: { rec: NetworkRecommendation }) {
  const hasUrl = rec.action_url && rec.action_url.startsWith("http");
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 transition-all hover:border-violet-500/30 ${PRIORITY_COLORS[rec.priority]}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5">{TYPE_ICONS[rec.type] || "💡"}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-bold text-white">{rec.title}</p>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${PRIORITY_BADGE[rec.priority]}`}>
              {rec.priority}
            </span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">{rec.description}</p>
          {hasUrl ? (
            <a href={rec.action_url} target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors">
              {rec.action_label} <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600">
              {rec.action_label} <ArrowRight className="h-3 w-3" />
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function NetworkingEngine() {
  const [recs, setRecs] = useState<NetworkRecommendation[]>([]);
  const [moves, setMoves] = useState<{ title: string; source: string; url: string; published_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [movesLoading, setMovesLoading] = useState(true);

  const loadRecs = async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    try {
      const data = await venusService.getNetworkRecommendations();
      setRecs(data);
    } catch {
      if (isRefresh) toast.error("API not connected — showing demo data.");
      setRecs(DEMO_RECS);
    } finally {
      setLoading(false);
    }
  };

  const loadMoves = async () => {
    try {
      const data = await venusService.getExecMoves();
      setMoves(data);
    } catch {
      setMoves([
        { title: "Former Google VP joins Anthropic as CTO", source: "TechCrunch", url: "https://techcrunch.com/search/?q=CTO+appointed", published_at: new Date().toISOString() },
        { title: "Stripe appoints new CFO ahead of IPO", source: "Bloomberg", url: "https://www.bloomberg.com/search?query=CFO+appointed", published_at: new Date().toISOString() },
        { title: "OpenAI names first-ever Chief Revenue Officer", source: "Reuters", url: "https://www.reuters.com/search/news?blob=CRO+appointed", published_at: new Date().toISOString() },
      ]);
    } finally {
      setMovesLoading(false);
    }
  };

  useEffect(() => { loadRecs(); loadMoves(); }, []);

  const highPriority = recs.filter(r => r.priority === "high");
  const others = recs.filter(r => r.priority !== "high");

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Phase 3 · Network</p>
          <h1 className="text-2xl font-black text-white mt-0.5">Networking Engine</h1>
          <p className="text-sm text-zinc-500 mt-1">AI-powered introductions, communities & executive moves.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => loadRecs(true)} disabled={loading}
          className="border-zinc-700 text-zinc-400 hover:bg-zinc-800">
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recommendations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-violet-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wide">Recommendations</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-zinc-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Generating recommendations...</span>
            </div>
          ) : (
            <>
              {highPriority.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                    High Priority
                  </p>
                  {highPriority.map((r, i) => <RecommendationCard key={i} rec={r} />)}
                </div>
              )}
              {others.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Other Opportunities</p>
                  {others.map((r, i) => <RecommendationCard key={i} rec={r} />)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Exec Moves sidebar */}
        <div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Newspaper className="h-4 w-4 text-zinc-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Executive Moves</h3>
            </div>
            {movesLoading ? (
              <div className="flex items-center gap-2 text-zinc-500 py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">Loading from NewsAPI...</span>
              </div>
            ) : moves.length === 0 ? (
              <p className="text-xs text-zinc-600 text-center py-4">No recent exec moves found.</p>
            ) : (
              <div className="space-y-3">
                {moves.map((m, i) => {
                  const validUrl = m.url && m.url !== "#" && m.url !== "[Removed]" && m.url.startsWith("http");
                  const Wrapper = validUrl ? "a" : "div";
                  const wrapperProps = validUrl
                    ? { href: m.url, target: "_blank", rel: "noopener noreferrer" }
                    : {};
                  return (
                    <Wrapper key={i} {...(wrapperProps as object)}
                      className={`block rounded-xl border border-zinc-800 bg-zinc-800/50 p-3 transition-all group ${validUrl ? "hover:border-zinc-700 cursor-pointer" : "opacity-70"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold text-white line-clamp-2 flex-1 ${validUrl ? "group-hover:text-violet-300 transition-colors" : ""}`}>
                          {m.title}
                        </p>
                        {validUrl && <ExternalLink className="h-3 w-3 shrink-0 text-zinc-600 group-hover:text-violet-400 transition-colors mt-0.5" />}
                      </div>
                      <p className="text-[10px] text-zinc-600 mt-1">{m.source} · {new Date(m.published_at).toLocaleDateString()}</p>
                    </Wrapper>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
