import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Building2, Loader2, ExternalLink, TrendingUp, AlertTriangle, RefreshCw, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { venusService, CompanyIntel } from "@/services/venusService";

function AvoidScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? "border-red-500/30 bg-red-500/10 text-red-400"
    : score >= 40 ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
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
      className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-black text-white">{intel.company_name}</h2>
          {intel.industry && <p className="text-sm text-zinc-400 mt-0.5">{intel.industry}</p>}
          {intel.website && (
            <a href={intel.website} target="_blank" rel="noopener noreferrer"
              className="text-xs text-violet-400 hover:text-violet-300 mt-0.5 inline-block">
              {intel.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          {intel.description && <p className="text-sm text-zinc-500 mt-2 leading-relaxed">{intel.description}</p>}
          {intel.last_updated && (
            <p className="text-[10px] text-zinc-600 mt-2">
              Last enriched: {new Date(intel.last_updated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <AvoidScoreBadge score={intel.avoid_score} />
          <Button variant="outline" size="sm" onClick={onRefresh}
            className="border-zinc-700 text-zinc-400 hover:bg-zinc-800" title="Refresh intelligence">
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
          <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-3 text-center">
            <p className="text-lg font-black text-white">{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Exec turnover signal */}
      {intel.exec_turnover_signal && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300">{intel.exec_turnover_signal}</p>
        </div>
      )}

      {/* News */}
      {intel.news?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Newspaper className="h-4 w-4 text-violet-400" />
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Recent News</p>
          </div>
          <div className="space-y-2">
            {intel.news.map((item, i) => (
              <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-800/50 hover:border-zinc-700 p-3 transition-all group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-2">{item.title}</p>
                  <p className="text-xs text-zinc-500 mt-1">{item.source} · {new Date(item.published_at).toLocaleDateString()}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-zinc-600 group-hover:text-violet-400 shrink-0 mt-0.5 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}

      {intel.website && (
        <div className="pt-1">
          <a href={intel.website} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-semibold">
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

  const search = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setIntel(null);
    try {
      const data = await venusService.getCompanyIntel(input.trim());
      setIntel(data);
      setCompanyId(input.trim());
    } catch {
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
        description: "Demo data shown — connect Venus API for live intelligence.",
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
      search();
    } catch {
      toast.error("Refresh failed — API not yet connected.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Phase 2 · Intelligence</p>
        <h1 className="text-2xl font-black text-white mt-0.5">Company Intelligence</h1>
        <p className="text-sm text-zinc-500 mt-1">Research any company before pursuing an opportunity.</p>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder="Company name or ID..."
            className="pl-9 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl h-11" />
        </div>
        <Button onClick={search} disabled={loading || !input.trim()}
          className="bg-violet-600 hover:bg-violet-700 text-white h-11 px-6">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {/* Scoring legend */}
      <div className="flex gap-3 text-xs">
        {[
          { label: "Low Risk (0–39)", color: "text-emerald-400" },
          { label: "Caution (40–69)", color: "text-amber-400" },
          { label: "High Risk (70+)", color: "text-red-400" },
        ].map(({ label, color }) => (
          <span key={label} className={`font-semibold ${color}`}>{label}</span>
        ))}
        <span className="text-zinc-600 ml-auto">Venus Avoid Score™</span>
      </div>

      {/* Result */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-2 text-zinc-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Fetching intelligence via Groq AI + NewsAPI...</span>
        </div>
      )}
      {intel && !loading && <IntelCard intel={intel} onRefresh={refresh} />}

      {!intel && !loading && (
        <div className="rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
          <TrendingUp className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 font-semibold">Search a company to see funding, headcount, news & risk scores</p>
          <p className="text-xs text-zinc-600 mt-1">Powered by Groq AI · results cached for speed, refresh to update</p>
        </div>
      )}
    </div>
  );
}
