import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Building2, Loader2, ExternalLink, TrendingUp, AlertTriangle, RefreshCw, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { venusService, CompanyIntel } from "@/services/venusService";
import { UsageMonitor } from "@/components/subscription/UsageMonitor";
import { useSubscription } from "@/context/SubscriptionContext";
import { getApiErrorMessage, isPlanLimitError } from "@/lib/utils";

function AvoidScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? "border-red-200 bg-red-50 text-red-700"
    : score >= 40 ? "border-amber-200 bg-amber-50 text-amber-700"
    : "border-emerald-200 bg-emerald-50 text-emerald-700";
  const label = score >= 70 ? "High Risk" : score >= 40 ? "Caution" : "Low Risk";
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${color}`}>
      <AlertTriangle className="h-4 w-4" />
      <span className="text-sm font-bold">{label}</span>
      <span className="text-xl font-black">{score}</span>
    </div>
  );
}

function IntelCard({ intel, onRefresh }: { intel: CompanyIntel; onRefresh: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-black text-gray-900">{intel.company_name}</h2>
          {intel.industry && <p className="text-sm text-gray-500 mt-0.5">{intel.industry}</p>}
          {intel.website && (
            <a href={intel.website} target="_blank" rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 mt-0.5 inline-block">
              {intel.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          {intel.description && <p className="text-sm text-gray-400 mt-2 leading-relaxed">{intel.description}</p>}
          {intel.last_updated && (
            <p className="text-[10px] text-gray-400 mt-2">
              Last enriched: {new Date(intel.last_updated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <AvoidScoreBadge score={intel.avoid_score} />
          <Button variant="outline" size="sm" onClick={onRefresh}
            className="border-gray-300 text-gray-500 hover:bg-gray-100" title="Refresh intelligence">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Headcount", value: intel.headcount ? intel.headcount.toLocaleString() : "—" },
          { label: "Growth 6m", value: intel.headcount_growth || "—" },
          { label: "Stage", value: intel.funding_stage || "—" },
          { label: "Founded", value: intel.founded_year ? String(intel.founded_year) : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center">
            <p className="text-lg font-black text-gray-900">{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Exec turnover signal */}
      {intel.exec_turnover_signal && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700">{intel.exec_turnover_signal}</p>
        </div>
      )}

      {/* News */}
      {intel.news?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Newspaper className="h-4 w-4 text-blue-600" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Recent News</p>
          </div>
          <div className="space-y-2">
            {intel.news.map((item, i) => (
              <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 hover:border-gray-300 p-3 transition-all group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.source} · {new Date(item.published_at).toLocaleDateString()}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-600 shrink-0 mt-0.5 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}

      {intel.website && (
        <div className="pt-1">
          <a href={intel.website} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold">
            <ExternalLink className="h-3.5 w-3.5" /> Visit website
          </a>
        </div>
      )}
    </motion.div>
  );
}

export default function CompanyIntelligence() {
  const [companyId, setCompanyId] = useState("");
  const [input, setInput] = useState("");
  const [intel, setIntel] = useState<CompanyIntel | null>(null);
  const [loading, setLoading] = useState(false);
  const { refreshSummary } = useSubscription();

  useEffect(() => { refreshSummary(); }, [refreshSummary]);

  const search = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setIntel(null);
    try {
      const data = await venusService.getCompanyIntel(input.trim());
      setIntel(data);
      setCompanyId(input.trim());
      refreshSummary();
    } catch (error: any) {
      if (isPlanLimitError(error)) {
        toast.error(getApiErrorMessage(error) || "Plan limit reached. Upgrade to continue.");
        return;
      }
      toast.error("Could not fetch company intel — API not yet connected.");
      setIntel({
        id: "demo",
        company_name: input.trim(),
        avoid_score: 32,
        industry: "Technology",
        headcount: 1200,
        headcount_growth: "+12% YoY",
        funding_stage: "Series C",
        founded_year: 2018,
        description: "Demo data shown — connect Hizorex API for live intelligence.",
        exec_turnover_signal: "2 C-Suite changes in the last 12 months.",
        news: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    if (!companyId) return;
    try {
      await venusService.refreshCompanyIntel(companyId);
      toast.success("Company intel refresh triggered.");
      refreshSummary();
      search();
    } catch (error: any) {
      if (isPlanLimitError(error)) {
        toast.error(getApiErrorMessage(error) || "Plan limit reached. Upgrade to continue.");
        return;
      }
      toast.error("Refresh failed — API not yet connected.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Phase 2 · Intelligence</p>
          <UsageMonitor featureKey="company_intel_access" compact />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mt-0.5">Company Intelligence</h1>
        <p className="text-sm text-gray-400 mt-1">Research any company before pursuing an opportunity.</p>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder="Company name or ID..."
            className="pl-9 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl h-11" />
        </div>
        <Button onClick={search} disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-6">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {/* Scoring legend */}
      <div className="flex gap-3 text-xs">
        {[
          { label: "Low Risk (0–39)", color: "text-emerald-600" },
          { label: "Caution (40–69)", color: "text-amber-600" },
          { label: "High Risk (70+)", color: "text-red-600" },
        ].map(({ label, color }) => (
          <span key={label} className={`font-semibold ${color}`}>{label}</span>
        ))}
        <span className="text-gray-400 ml-auto">Hizorex Avoid Score™</span>
      </div>

      {/* Result */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Fetching intelligence via Groq AI + NewsAPI...</span>
        </div>
      )}
      {intel && !loading && <IntelCard intel={intel} onRefresh={refresh} />}

      {!intel && !loading && (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <TrendingUp className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-semibold">Search a company to see funding, headcount, news & risk scores</p>
          <p className="text-xs text-gray-400 mt-1">Powered by Groq AI · results cached for speed, refresh to update</p>
        </div>
      )}
    </div>
  );
}
