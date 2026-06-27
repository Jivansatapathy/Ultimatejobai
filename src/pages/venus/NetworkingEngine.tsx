import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Network, Loader2, ArrowRight, Newspaper, RefreshCw, Lightbulb,
  ExternalLink, CalendarDays, MapPin, Flame, Users, Zap,
  TrendingUp, GraduationCap, Coffee, Mic, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { venusService, NetworkRecommendation } from "@/services/venusService";
import { careerService, JobFair } from "@/services/careerService";

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_META: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  warm_intro: { icon: <Coffee className="h-4 w-4" />, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  community:  { icon: <Users className="h-4 w-4" />,  color: "text-violet-700", bg: "bg-violet-50 border-violet-200" },
  alumni:     { icon: <GraduationCap className="h-4 w-4" />, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  conference: { icon: <Mic className="h-4 w-4" />,    color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  exec_move:  { icon: <TrendingUp className="h-4 w-4" />, color: "text-rose-700", bg: "bg-rose-50 border-rose-200" },
};

const DEMO_RECS: NetworkRecommendation[] = [
  { type: "warm_intro",  title: "Warm Intro via Sarah Kim", description: "Your contact at Sequoia knows the CEO of your #1 target company — 2 shared connections on LinkedIn.", action_label: "Draft intro message", action_url: "https://www.linkedin.com/messaging/compose/", priority: "high" },
  { type: "exec_move",   title: "Former Colleague Is Now a CEO", description: "Alex Chen (ex-AWS) just joined a Series B FinTech as CEO. Reconnect now before he's unreachable.", action_label: "Reach out", action_url: "https://www.linkedin.com/search/results/people/", priority: "high" },
  { type: "community",   title: "Join CTO Craft", description: "Highest ROI exec community for your stage. 3 of your target companies have CTOs who are active members.", action_label: "Apply to join", action_url: "https://ctocraft.com/community/", priority: "high" },
  { type: "conference",  title: "SaaStr Annual", description: "3 target companies are sponsors. Your network contacts already plan to attend — ideal for face-to-face intros.", action_label: "Register", action_url: "https://www.saastrannual.com/", priority: "medium" },
  { type: "alumni",      title: "Alumni Network — 3 Matches", description: "3 alumni from your background are now CEOs of Series A/B startups in your target sector.", action_label: "View profiles", action_url: "https://www.linkedin.com/alumni/", priority: "medium" },
];

const TABS = ["Recommendations", "Events", "Exec Moves"] as const;
type Tab = typeof TABS[number];

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatPill({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>
      <div>
        <p className="text-lg font-black text-gray-900 leading-none">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-700 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    high: "bg-rose-500",
    medium: "bg-amber-400",
    low: "bg-gray-300",
  };
  return (
    <span className={`inline-block h-2 w-2 rounded-full shrink-0 mt-1.5 ${colors[priority] ?? colors.low}`} />
  );
}

function RecommendationCard({ rec, index }: { rec: NetworkRecommendation; index: number }) {
  const meta = TYPE_META[rec.type] ?? TYPE_META.community;
  const hasUrl = rec.action_url?.startsWith("http");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`group relative rounded-2xl border p-5 transition-all hover:shadow-md hover:-translate-y-0.5 ${
        rec.priority === "high"
          ? "border-gray-200 bg-white shadow-sm"
          : "border-gray-200 bg-gray-50/60"
      }`}
    >
      {rec.priority === "high" && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-rose-600">
            <Flame className="h-2.5 w-2.5" /> Hot
          </span>
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${meta.bg} ${meta.color}`}>
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0 pr-12">
          <p className="text-sm font-black text-gray-900 mb-1">{rec.title}</p>
          <p className="text-sm text-gray-700 leading-relaxed">{rec.description}</p>
          {hasUrl ? (
            <a href={rec.action_url} target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
              {rec.action_label}
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-gray-800">
              {rec.action_label}
              <ArrowRight className="h-3 w-3" />
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ExecMoveCard({ move, index }: {
  move: { title: string; source: string; url: string; published_at: string };
  index: number;
}) {
  const validUrl = move.url?.startsWith("http");
  const date = move.published_at
    ? new Date(move.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      {validUrl ? (
        <a href={move.url} target="_blank" rel="noopener noreferrer"
          className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 border border-rose-200 text-rose-600 mt-0.5">
            <TrendingUp className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
              {move.title}
            </p>
            <p className="text-[10px] text-gray-700 mt-1.5 flex items-center gap-1.5">
              <span className="font-bold text-gray-800">{move.source}</span>
              {date && <><span>·</span><span>{date}</span></>}
              <ExternalLink className="h-2.5 w-2.5 ml-auto text-gray-700 group-hover:text-blue-600 transition-colors" />
            </p>
          </div>
        </a>
      ) : (
        <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 opacity-60">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 border border-gray-200 text-gray-700 mt-0.5">
            <TrendingUp className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">{move.title}</p>
            <p className="text-[10px] text-gray-700 mt-1.5">{move.source}{date && ` · ${date}`}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function EventCard({ ev, index }: { ev: JobFair; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group rounded-2xl border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-blue-700">
          {ev.source || "Event"}
        </span>
        <span className="text-[10px] font-bold text-gray-700 flex items-center gap-1 shrink-0">
          <CalendarDays className="h-3 w-3 text-blue-500" />
          {ev.date_text || "Date TBA"}
        </span>
      </div>

      <div>
        <p className="text-sm font-black text-gray-900 leading-snug mb-2 group-hover:text-blue-700 transition-colors">
          {ev.title}
        </p>
        <p className="text-xs text-gray-700 flex items-start gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-gray-700" />
          {ev.location || ev.city || "Online / Virtual"}
        </p>
      </div>

      {ev.link ? (
        <a href={ev.link} target="_blank" rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
          View event <ChevronRight className="h-3.5 w-3.5" />
        </a>
      ) : (
        <span className="mt-auto text-xs font-bold text-gray-700">No link available</span>
      )}
    </motion.div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function NetworkingEngine() {
  const [activeTab, setActiveTab] = useState<Tab>("Recommendations");
  const [recs, setRecs] = useState<NetworkRecommendation[]>([]);
  const [moves, setMoves] = useState<{ title: string; source: string; url: string; published_at: string }[]>([]);
  const [events, setEvents] = useState<JobFair[]>([]);
  const [loading, setLoading] = useState(true);
  const [movesLoading, setMovesLoading] = useState(true);
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
        { title: "Former Google VP joins Anthropic as CTO", source: "TechCrunch", url: "https://techcrunch.com/", published_at: new Date().toISOString() },
        { title: "Stripe appoints new CFO ahead of IPO", source: "Bloomberg", url: "https://www.bloomberg.com/", published_at: new Date().toISOString() },
        { title: "OpenAI names first-ever Chief Revenue Officer", source: "Reuters", url: "https://www.reuters.com/", published_at: new Date().toISOString() },
        { title: "Databricks COO departs to lead Series C AI startup", source: "Forbes", url: "https://www.forbes.com/", published_at: new Date().toISOString() },
        { title: "New CMO at Salesforce — ex-HubSpot growth lead", source: "WSJ", url: "https://www.wsj.com/", published_at: new Date().toISOString() },
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
  const datedEvents = events.filter(e => e.date);
  const cities = [...new Set(datedEvents.map(e => e.city).filter(Boolean))].sort();
  const filteredEvents = cityFilter ? datedEvents.filter(e => e.city === cityFilter) : datedEvents;

  const handleRefresh = () => {
    if (activeTab === "Recommendations") loadRecs(true);
    else if (activeTab === "Exec Moves") { setMovesLoading(true); loadMoves(); }
    else { loadEvents(); }
  };

  const isRefreshing =
    (activeTab === "Recommendations" && loading) ||
    (activeTab === "Exec Moves" && movesLoading) ||
    (activeTab === "Events" && eventsLoading);

  return (
    <div className="min-h-full bg-gray-50/40">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">Phase 3 · Network</p>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Networking Engine</h1>
            <p className="text-sm text-gray-700 mt-1.5">
              AI-matched introductions, curated communities & executive intelligence.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 h-9 px-4 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* ── Stats strip ── */}
        <div className="flex flex-wrap gap-3">
          <StatPill label="Recommendations" value={recs.length || "–"} icon={<Lightbulb className="h-4 w-4" />} />
          <StatPill label="High Priority" value={highPriority.length || "–"} icon={<Flame className="h-4 w-4" />} />
          <StatPill label="Exec Moves" value={moves.length || "–"} icon={<TrendingUp className="h-4 w-4" />} />
          <StatPill label="Upcoming Events" value={datedEvents.length || "–"} icon={<CalendarDays className="h-4 w-4" />} />
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1 w-fit">
          {TABS.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              {tab}
              {tab === "Recommendations" && highPriority.length > 0 && (
                <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white">
                  {highPriority.length}
                </span>
              )}
              {tab === "Events" && datedEvents.length > 0 && (
                <span className="ml-2 inline-flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-blue-500 text-[9px] font-black text-white">
                  {datedEvents.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >

            {/* RECOMMENDATIONS TAB */}
            {activeTab === "Recommendations" && (
              <div className="space-y-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">AI is generating your recommendations…</p>
                    <p className="text-xs text-gray-700">Analysing your profile and network signals</p>
                  </div>
                ) : recs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                      <Network className="h-6 w-6 text-gray-700" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">No recommendations yet</p>
                    <p className="text-xs text-gray-700">Complete your executive profile to unlock personalised suggestions.</p>
                  </div>
                ) : (
                  <>
                    {highPriority.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500">
                            <Flame className="h-3 w-3 text-white" />
                          </span>
                          <p className="text-xs font-black uppercase tracking-widest text-rose-600">Act Now — High Priority</p>
                        </div>
                        <div className="space-y-3">
                          {highPriority.map((r, i) => <RecommendationCard key={i} rec={r} index={i} />)}
                        </div>
                      </div>
                    )}

                    {others.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-gray-700" />
                          <p className="text-xs font-black uppercase tracking-widest text-gray-800">Explore When Ready</p>
                        </div>
                        <div className="space-y-3">
                          {others.map((r, i) => <RecommendationCard key={i} rec={r} index={i} />)}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* EVENTS TAB */}
            {activeTab === "Events" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-sm font-black text-gray-900">
                    {filteredEvents.length} upcoming {filteredEvents.length === 1 ? "event" : "events"}
                    {cityFilter && ` in ${cityFilter}`}
                  </p>
                  <div className="flex items-center gap-2">
                    {cities.length > 0 && (
                      <select
                        value={cityFilter}
                        onChange={e => setCityFilter(e.target.value)}
                        aria-label="Filter events by city"
                        className="h-9 rounded-xl border border-gray-300 bg-white px-3 pr-8 text-xs font-semibold text-gray-800 outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">All cities</option>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    )}
                  </div>
                </div>

                {eventsLoading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">Loading events…</p>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                      <CalendarDays className="h-6 w-6 text-gray-700" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      {events.length === 0 ? "No upcoming networking events found." : "No events match this city."}
                    </p>
                    {cityFilter && (
                      <button type="button" onClick={() => setCityFilter("")}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700">
                        Clear filter
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEvents.map((ev, i) => <EventCard key={ev.id || i} ev={ev} index={i} />)}
                  </div>
                )}
              </div>
            )}

            {/* EXEC MOVES TAB */}
            {activeTab === "Exec Moves" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-gray-900">Latest C-suite movements</p>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    Live feed
                  </span>
                </div>

                {movesLoading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50">
                      <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">Loading executive moves…</p>
                  </div>
                ) : moves.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                      <Newspaper className="h-6 w-6 text-gray-700" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">No exec moves found right now.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {moves.map((m, i) => <ExecMoveCard key={i} move={m} index={i} />)}
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
