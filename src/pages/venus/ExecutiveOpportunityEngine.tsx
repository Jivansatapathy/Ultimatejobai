import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Star, MapPin, Building2, Briefcase, ExternalLink, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { venusService, ExecutiveOpportunity, EOSResult } from "@/services/venusService";

const OPP_TYPES = ["full_time","fractional","advisory","board","consulting","interim"];
const SENIORITY = ["C-Suite","VP","Director"];
const COUNTRIES = [
  { label: "All Countries", value: "" },
  { label: "🇺🇸 United States", value: "United States" },
  { label: "🇨🇦 Canada", value: "Canada" },
];

function EOSBadge({ score }: { score?: number }) {
  if (score == null) return null;
  const color = score >= 75 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    : score >= 50 ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
    : "bg-red-500/10 text-red-400 border-red-500/20";
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border px-3 py-2 min-w-[56px] ${color}`}>
      <span className="text-xl font-black tabular-nums">{score}</span>
      <span className="text-[8px] font-black uppercase tracking-widest opacity-70">EOS™</span>
    </div>
  );
}

function OpportunityCard({ opp, onDecision }: { opp: ExecutiveOpportunity; onDecision: (opp: ExecutiveOpportunity) => void }) {
  const typeLabel = opp.type?.replace(/_/g, " ") || "Full Time";
  const typeColor: Record<string, string> = {
    full_time: "bg-blue-900/40 text-blue-300",
    fractional: "bg-teal-900/40 text-teal-300",
    advisory: "bg-amber-900/40 text-amber-300",
    board: "bg-violet-900/40 text-violet-300",
    consulting: "bg-pink-900/40 text-pink-300",
    interim: "bg-orange-900/40 text-orange-300",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900 hover:border-zinc-700 p-5 transition-all">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white">{opp.title}</h3>
              <p className="text-sm text-zinc-400 mt-0.5">{opp.company_name}</p>
            </div>
            <EOSBadge score={opp.eos_score} />
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${typeColor[opp.type || "full_time"] || typeColor.full_time}`}>
              {typeLabel}
            </span>
            {opp.is_remote && (
              <span className="inline-flex items-center rounded-full bg-teal-900/30 text-teal-400 px-2.5 py-0.5 text-[11px] font-bold">Remote</span>
            )}
            {opp.stage && (
              <span className="inline-flex items-center rounded-full bg-zinc-800 text-zinc-400 px-2.5 py-0.5 text-[11px] font-bold">{opp.stage}</span>
            )}
            {opp.industry && (
              <span className="inline-flex items-center rounded-full bg-zinc-800 text-zinc-400 px-2.5 py-0.5 text-[11px] font-bold">{opp.industry}</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-zinc-500">
            {(opp.city || opp.country) && (
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{[opp.city, opp.country].filter(Boolean).join(", ")}</span>
            )}
            {opp.compensation_cash_min && (
              <span className="flex items-center gap-1">
                <span className="font-semibold text-zinc-300">
                  ${(opp.compensation_cash_min / 1000).toFixed(0)}K–${((opp.compensation_cash_max || opp.compensation_cash_min) / 1000).toFixed(0)}K
                </span>
                base
              </span>
            )}
            {opp.equity_percent && (
              <span className="text-violet-400 font-semibold">{opp.equity_percent}% equity</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-800">
        <Button size="sm" onClick={() => onDecision(opp)}
          className="bg-violet-600 hover:bg-violet-700 text-white text-xs">
          <Star className="h-3.5 w-3.5 mr-1.5" />
          Should I Pursue?
        </Button>
        {opp.apply_url && (
          <Button size="sm" variant="outline" asChild
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs">
            <a href={opp.apply_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Apply
            </a>
          </Button>
        )}
        <span className="ml-auto text-[10px] text-zinc-600 capitalize">{opp.platform || opp.source}</span>
      </div>
    </motion.div>
  );
}

function DecisionModal({ opp, onClose }: { opp: ExecutiveOpportunity; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [eos, setEos] = useState<EOSResult | null>(null);
  const [decision, setDecision] = useState<{ verdict: string; reasoning: string; risks: string[]; upsides: string[]; action: string } | null>(null);

  useEffect(() => {
    Promise.allSettled([
      venusService.getEOS(opp.id),
      venusService.getDecision(opp.id),
    ]).then(([eosRes, decRes]) => {
      if (eosRes.status === "fulfilled") setEos(eosRes.value);
      if (decRes.status === "fulfilled") setDecision(decRes.value);
    }).finally(() => setLoading(false));
  }, [opp.id]);

  const eosColor = (eos?.score ?? 0) >= 75 ? "text-emerald-400" : (eos?.score ?? 0) >= 50 ? "text-amber-400" : "text-red-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-1">Executive Decision Engine</p>
            <h3 className="text-lg font-black text-white">{opp.title}</h3>
            <p className="text-sm text-zinc-400">{opp.company_name}</p>
          </div>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 gap-2 text-zinc-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">AI is evaluating this opportunity...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {eos && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">EOS™ Score</span>
                  <span className={`text-3xl font-black tabular-nums ${eosColor}`}>{eos.score}<span className="text-sm text-zinc-500">/100</span></span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {Object.entries(eos.breakdown).map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-zinc-900 p-2">
                      <p className="text-lg font-black text-white">{v}</p>
                      <p className="text-[9px] uppercase tracking-widest text-zinc-500 capitalize">{k}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {decision ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-4">
                  <p className="text-sm font-bold text-white mb-1">AI Verdict</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">{decision.verdict}</p>
                </div>
                {decision.upsides?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Upsides</p>
                    {decision.upsides.map((u, i) => (
                      <p key={i} className="text-xs text-zinc-400 flex gap-2 mb-1"><span className="text-emerald-500">+</span>{u}</p>
                    ))}
                  </div>
                )}
                {decision.risks?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">Risks</p>
                    {decision.risks.map((r, i) => (
                      <p key={i} className="text-xs text-zinc-400 flex gap-2 mb-1"><span className="text-red-500">!</span>{r}</p>
                    ))}
                  </div>
                )}
                <div className="rounded-xl border border-violet-500/20 bg-violet-950/30 p-3">
                  <p className="text-sm font-semibold text-violet-300">{decision.action}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-500 text-center py-4">Decision engine will respond once the API is connected.</p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function ExecutiveOpportunityEngine() {
  const [opps, setOpps] = useState<ExecutiveOpportunity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [seniorityFilter, setSeniorityFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [selectedOpp, setSelectedOpp] = useState<ExecutiveOpportunity | null>(null);

  const load = useCallback(async (q: string, type: string, seniority: string, country: string, pg: number, append: boolean) => {
    if (!append) setLoading(true);
    try {
      const params: Record<string, string | number> = { page: pg, page_size: 20 };
      if (q) params.q = q;
      if (type) params.type = type;
      if (seniority) params.seniority = seniority;
      if (country) params.country = country;
      const res = await venusService.getOpportunities(params);
      setOpps(prev => append ? [...prev, ...res.results] : res.results);
      setTotal(res.count);
      setHasNext(res.has_next);
    } catch {
      toast.error("Could not load opportunities — API not yet connected.");
      setOpps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { setPage(1); load(search, typeFilter, seniorityFilter, countryFilter, 1, false); }, [search, typeFilter, seniorityFilter, countryFilter, load]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {selectedOpp && <DecisionModal opp={selectedOpp} onClose={() => setSelectedOpp(null)} />}

      {/* Header */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Phase 1 · Opportunity Engine</p>
        <h1 className="text-2xl font-black text-white mt-0.5">Executive Opportunities</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {loading ? "Loading..." : `${total.toLocaleString()} roles across full-time, fractional, board & advisory`}
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search roles, companies..."
              className="pl-9 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl h-10" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-violet-500">
            <option value="">All Types</option>
            {OPP_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
          </select>
          <select value={seniorityFilter} onChange={e => setSeniorityFilter(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-violet-500">
            <option value="">All Levels</option>
            {SENIORITY.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {(typeFilter || seniorityFilter || countryFilter) && (
            <Button variant="outline" size="sm" onClick={() => { setTypeFilter(""); setSeniorityFilter(""); setCountryFilter(""); }}
              className="border-zinc-700 text-zinc-400 hover:bg-zinc-800">
              <X className="h-3.5 w-3.5 mr-1" /> Clear
            </Button>
          )}
        </div>
        {/* Country filter */}
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-widest mr-1">Country:</span>
          {COUNTRIES.map(c => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCountryFilter(c.value)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                countryFilter === c.value
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-500/30"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-zinc-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading opportunities...</span>
        </div>
      ) : opps.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 py-16 text-center">
          <Briefcase className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400 font-semibold">No opportunities found</p>
          <p className="text-sm text-zinc-600 mt-1">Try adjusting filters or connecting the Venus API.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {opps.map(opp => (
            <OpportunityCard key={opp.id} opp={opp} onDecision={setSelectedOpp} />
          ))}
          {hasNext && (
            <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              onClick={() => { const next = page + 1; setPage(next); load(search, typeFilter, seniorityFilter, countryFilter, next, true); }}>
              Load more
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
