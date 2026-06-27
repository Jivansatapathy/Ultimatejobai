import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Star, Building2, TrendingUp, ArrowRight, Loader2, RefreshCw, Briefcase, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { venusService, DailyBriefing, ExecutiveOpportunity } from "@/services/venusService";
import { useAuth } from "@/context/AuthContext";
import { getVenusBasePath } from "@/lib/venusBasePath";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-700">{label}</span>
        <div className={`h-8 w-8 flex items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <p className="text-3xl font-black text-gray-900 tabular-nums">{value}</p>
    </motion.div>
  );
}

function OpportunityCard({ opp, onClick }: { opp: ExecutiveOpportunity; onClick: () => void }) {
  const eosColor = (opp.eos_score ?? 0) >= 75 ? "text-emerald-600" : (opp.eos_score ?? 0) >= 50 ? "text-amber-600" : "text-red-600";
  return (
    <button type="button" onClick={onClick}
      className="w-full text-left rounded-xl border border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-gray-100 p-4 transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{opp.title}</p>
          <p className="text-xs text-gray-800 mt-0.5 truncate">{opp.company_name} · {opp.location || opp.country}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-800 capitalize">
              {(opp.type || "full_time").replace(/_/g, " ")}
            </span>
            {opp.is_remote && (
              <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-600">Remote</span>
            )}
          </div>
        </div>
        {opp.eos_score != null && (
          <div className="shrink-0 text-right">
            <p className={`text-2xl font-black tabular-nums ${eosColor}`}>{opp.eos_score}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-700">EOS™</p>
          </div>
        )}
      </div>
    </button>
  );
}

export default function VenusDashboard() {
  const { userEmail } = useAuth();
  const navigate = useNavigate();
  const basePath = getVenusBasePath(useLocation().pathname);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [topOpps, setTopOpps] = useState<ExecutiveOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [briefingLoading, setBriefingLoading] = useState(true);
  const [oppsLoading, setOppsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const firstName = userEmail?.split("@")[0]?.split(".")[0] || "Executive";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const [profileMissing, setProfileMissing] = useState(false);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setBriefingLoading(true);
    setOppsLoading(true);
    try {
      // Check profile first — redirect new users to onboarding
      const profile = await venusService.getProfile().catch(() => null);
      if (!profile || !profile.role) {
        setProfileMissing(true);
        setLoading(false);
        setBriefingLoading(false);
        setOppsLoading(false);
        setRefreshing(false);
        return;
      }
      setProfileMissing(false);
      setLoading(false);

      // Fire independently so the (slower, AI-backed) briefing doesn't hold up
      // stats/opportunities that are ready sooner.
      venusService.getDailyBriefing()
        .then(setBriefing)
        .catch(() => {})
        .finally(() => setBriefingLoading(false));

      venusService.getOpportunities({ page_size: 5 })
        .then(res => setTopOpps(res.results.slice(0, 5)))
        .catch(() => {})
        .finally(() => setOppsLoading(false));
    } catch {
      // API not yet connected — show empty state gracefully
      setLoading(false);
      setBriefingLoading(false);
      setOppsLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const stats = [
    { label: "Matched Roles", value: briefing?.opportunity_count ?? "—", icon: Star, color: "bg-blue-600" },
    { label: "Board Openings", value: briefing?.board_openings ?? "—", icon: Crown, color: "bg-amber-600" },
    { label: "Fractional Roles", value: briefing?.fractional_roles ?? "—", icon: Briefcase, color: "bg-teal-600" },
    { label: "Funding Alerts", value: briefing?.funding_alerts ?? "—", icon: TrendingUp, color: "bg-blue-600" },
  ];

  if (!loading && profileMissing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 mb-6">
          <Crown className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">Set up your Executive Profile</h2>
        <p className="text-sm text-gray-800 max-w-sm mb-6">
          Complete your profile so Hizorex AI can calculate EOS scores, generate your briefing, and match you to the right opportunities.
        </p>
        <Button onClick={() => navigate(`${basePath}/profile`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8">
          <Crown className="h-4 w-4 mr-2" /> Build My Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Hizorex AI · Executive OS</p>
          <h1 className="text-2xl font-black text-gray-900 mt-0.5">
            {greeting}, <span className="capitalize">{firstName}</span>.
          </h1>
          <p className="text-sm text-gray-700 mt-0.5">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => loadData(true)} disabled={refreshing}
          className="border-gray-300 text-gray-800 hover:bg-gray-50">
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* AI Briefing */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">AI Daily Briefing</p>
        </div>
        {briefingLoading ? (
          <div className="flex items-center gap-2 text-gray-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Generating your briefing...</span>
          </div>
        ) : briefing?.recommended_action ? (
          <div className="space-y-3">
            <p className="text-gray-900 font-medium leading-relaxed">{briefing.recommended_action}</p>
            {briefing.network_moves > 0 && (
              <p className="text-sm text-gray-800">
                <span className="text-blue-600 font-semibold">{briefing.network_moves} former colleague(s)</span> made executive moves this week.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-900 font-medium">Your AI briefing will appear here once the Hizorex API is connected.</p>
            <p className="text-sm text-gray-800">Today's focus: Review matched opportunities and update your EOS™ scores.</p>
          </div>
        )}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Opportunities */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">Top Matches</h3>
            <button type="button" onClick={() => navigate(`${basePath}/opportunities`)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {oppsLoading ? (
            <div className="flex items-center gap-2 text-gray-700 py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading opportunities...</span>
            </div>
          ) : topOpps.length > 0 ? (
            <div className="space-y-2">
              {topOpps.map(opp => (
                <OpportunityCard key={opp.id} opp={opp}
                  onClick={() => navigate(`${basePath}/opportunities?id=${opp.id}`)} />
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <Star className="h-8 w-8 text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-700">Opportunities load once the API is connected.</p>
              <Button size="sm" className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => navigate(`${basePath}/opportunities`)}>
                Explore Roles
              </Button>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "Benchmark your compensation", icon: TrendingUp, href: `${basePath}/compensation`, badge: "Ph2" },
              { label: "Model your equity scenarios", icon: Star, href: `${basePath}/equity`, badge: "Ph2" },
              { label: "Generate executive content", icon: Sparkles, href: `${basePath}/branding`, badge: "Ph3" },
              { label: "Build your network map", icon: Building2, href: `${basePath}/network`, badge: "Ph3" },
            ].map(({ label, icon: Icon, href, badge }) => (
              <button key={href} type="button" onClick={() => navigate(href)}
                className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-gray-100 px-4 py-3 transition-all group">
                <span className="flex items-center gap-3 text-sm font-medium text-gray-800 group-hover:text-gray-900">
                  <Icon className="h-4 w-4 text-blue-600" />
                  {label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{badge}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-700 group-hover:text-blue-600 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
