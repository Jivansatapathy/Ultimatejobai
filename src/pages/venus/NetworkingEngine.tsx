import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Network, Loader2, ArrowRight, Newspaper, RefreshCw, Lightbulb, ExternalLink, CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { venusService, NetworkRecommendation } from "@/services/venusService";
import { careerService, JobFair } from "@/services/careerService";

const PRIORITY_COLORS: Record<string, string> = {
  high: "border-blue-300 bg-blue-50",
  medium: "border-gray-300 bg-white",
  low: "border-gray-200 bg-white/50",
};
const PRIORITY_BADGE: Record<string, string> = {
  high: "bg-blue-100 text-blue-700",
  medium: "bg-gray-100 text-gray-500",
  low: "bg-gray-100 text-gray-400",
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
      className={`rounded-xl border p-4 transition-all hover:border-blue-500/30 ${PRIORITY_COLORS[rec.priority]}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5">{TYPE_ICONS[rec.type] || "💡"}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-bold text-gray-900">{rec.title}</p>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${PRIORITY_BADGE[rec.priority]}`}>
              {rec.priority}
            </span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">{rec.description}</p>
          {hasUrl ? (
            <a href={rec.action_url} target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
              {rec.action_label} <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-gray-400">
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
  const [events, setEvents] = useState<JobFair[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("");

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

  const loadEvents = async () => {
    setEventsLoading(true);
    try {
      const data = await careerService.getJobFairs();
      setEvents(data);
    } catch {
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => { loadRecs(); loadMoves(); loadEvents(); }, []);

  const highPriority = recs.filter(r => r.priority === "high");
  const others = recs.filter(r => r.priority !== "high");

  // Only events with a confirmed date are shown — the API also returns rows with no
  // parseable date (scraper junk like "Filters" or "34,089results" has no real date
  // either), and those should never be treated as "upcoming".
  const datedEvents = events.filter(e => e.date);
  const cities = [...new Set(datedEvents.map(e => e.city).filter(Boolean))].sort();
  const filteredEvents = cityFilter
    ? datedEvents.filter(e => e.city === cityFilter)
    : datedEvents;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Phase 3 · Network</p>
          <h1 className="text-2xl font-black text-gray-900 mt-0.5">Networking Engine</h1>
          <p className="text-sm text-gray-400 mt-1">AI-powered introductions, communities & executive moves.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => loadRecs(true)} disabled={loading}
          className="border-gray-300 text-gray-500 hover:bg-gray-100">
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recommendations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Recommendations</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Generating recommendations...</span>
            </div>
          ) : (
            <>
              {highPriority.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                    High Priority
                  </p>
                  {highPriority.map((r, i) => <RecommendationCard key={i} rec={r} />)}
                </div>
              )}
              {others.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Other Opportunities</p>
                  {others.map((r, i) => <RecommendationCard key={i} rec={r} />)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Exec Moves sidebar */}
        <div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <Newspaper className="h-4 w-4 text-gray-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Executive Moves</h3>
            </div>
            {movesLoading ? (
              <div className="flex items-center gap-2 text-gray-400 py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">Loading from NewsAPI...</span>
              </div>
            ) : moves.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No recent exec moves found.</p>
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
                      className={`block rounded-xl border border-gray-200 bg-gray-50 p-3 transition-all group ${validUrl ? "hover:border-gray-300 cursor-pointer" : "opacity-70"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold text-gray-900 line-clamp-2 flex-1 ${validUrl ? "group-hover:text-blue-600 transition-colors" : ""}`}>
                          {m.title}
                        </p>
                        {validUrl && <ExternalLink className="h-3 w-3 shrink-0 text-gray-400 group-hover:text-blue-600 transition-colors mt-0.5" />}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">{m.source} · {new Date(m.published_at).toLocaleDateString()}</p>
                    </Wrapper>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Networking Events */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Networking Events</h2>
            {events.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-700">
                {filteredEvents.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="h-9 rounded-xl border border-gray-300 bg-gray-100 px-3 pr-8 text-xs text-gray-600 outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="">All cities</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <Button variant="outline" size="sm" onClick={loadEvents} disabled={eventsLoading}
              className="border-gray-300 text-gray-500 hover:bg-gray-100">
              <RefreshCw className={`h-3.5 w-3.5 ${eventsLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {eventsLoading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading events...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">
            {events.length === 0 ? "No upcoming networking events found." : "No events match this city — try a different filter."}
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredEvents.map((ev, i) => (
              <div key={ev.id || i}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 hover:border-blue-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest">
                      {ev.source || "Event"}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0">
                      <CalendarDays className="h-3 w-3" />
                      {ev.date_text || "Date TBA"}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 leading-snug mb-1.5">{ev.title}</p>
                  <p className="text-xs text-gray-400 flex items-start gap-1.5 mb-3">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    {ev.location || ev.city || "Online/Virtual"}
                  </p>
                </div>
                {ev.link ? (
                  <a href={ev.link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                    View event <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-xs font-bold text-gray-400">No link available</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
