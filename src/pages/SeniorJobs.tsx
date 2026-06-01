import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, X, MapPin, Building2, Briefcase,
  Globe2, ChevronDown, ExternalLink, Loader2, Crown, TrendingUp, Users2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { toast } from "sonner";
import {
  SeniorJob,
  SeniorJobFilterOptions,
  SeniorJobSearchFilters,
  fetchSeniorJobById,
  fetchSeniorJobFilterOptions,
  searchSeniorJobs,
} from "@/services/seniorJobService";

// ─── Constants ────────────────────────────────────────────────────────────────

const SENIORITY_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  "C-Suite": { label: "C-Suite",  color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",  icon: Crown },
  "VP":      { label: "VP",       color: "bg-purple-500/20 text-purple-300 border-purple-500/30",   icon: TrendingUp },
  "Director":{ label: "Director", color: "bg-teal-500/20   text-teal-300   border-teal-500/30",     icon: Users2 },
};

const INDUSTRY_COLORS: Record<string, string> = {
  "Technology & IT":           "bg-blue-500/15 text-blue-300 border-blue-500/25",
  "Finance & Banking":         "bg-green-500/15 text-green-300 border-green-500/25",
  "Healthcare":                "bg-red-500/15 text-red-300 border-red-500/25",
  "Pharma & Biotech":          "bg-pink-500/15 text-pink-300 border-pink-500/25",
  "Marketing & Advertising":   "bg-orange-500/15 text-orange-300 border-orange-500/25",
  "Legal & Compliance":        "bg-slate-400/15 text-slate-300 border-slate-400/25",
  "Education":                 "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
  "Sales":                     "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  "Human Resources":           "bg-violet-500/15 text-violet-300 border-violet-500/25",
  "Consulting":                "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
  "Manufacturing":             "bg-amber-500/15 text-amber-300 border-amber-500/25",
  "Energy & Utilities":        "bg-yellow-600/15 text-yellow-300 border-yellow-600/25",
  "Media & Entertainment":     "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/25",
  "Aerospace & Defense":       "bg-sky-500/15 text-sky-300 border-sky-500/25",
};
const DEFAULT_INDUSTRY_COLOR = "bg-white/10 text-white/60 border-white/15";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SeniorityBadge({ level }: { level: string }) {
  const cfg = SENIORITY_CONFIG[level] ?? SENIORITY_CONFIG["Director"];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function IndustryBadge({ industry }: { industry: string }) {
  const color = INDUSTRY_COLORS[industry] ?? DEFAULT_INDUSTRY_COLOR;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${color}`}>
      {industry}
    </span>
  );
}

function JobCard({ job, onSelect }: { job: SeniorJob; onSelect: (j: SeniorJob) => void }) {
  const location = [job.city, job.country].filter(Boolean).join(", ") || job.location || "—";
  const postedDate = job.posted_at ? new Date(job.posted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-5 transition-all duration-200 cursor-pointer"
      onClick={() => onSelect(job)}
    >
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-teal-300 transition-colors">
              {job.title}
            </h3>
            {job.company_name && (
              <p className="text-white/50 text-xs mt-1 flex items-center gap-1">
                <Building2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{job.company_name}</span>
              </p>
            )}
          </div>
          {job.salary && (
            <span className="shrink-0 text-teal-300 text-xs font-semibold bg-teal-500/10 border border-teal-500/20 px-2 py-1 rounded-lg whitespace-nowrap">
              {job.salary}
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <SeniorityBadge level={job.seniority_level} />
          <IndustryBadge industry={job.industry} />
          {job.workplace_type && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border bg-white/5 text-white/50 border-white/10">
              <Globe2 className="h-3 w-3" />
              {job.workplace_type}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.06]">
          <span className="text-white/40 text-xs flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {location}
          </span>
          <div className="flex items-center gap-2">
            {postedDate && <span className="text-white/30 text-xs">{postedDate}</span>}
            {job.apply_url && (
              <a
                href={job.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-teal-500 hover:bg-teal-400 text-white rounded-lg font-medium transition-colors"
              >
                Apply <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Detail drawer
function JobDetailDrawer({ job, onClose }: { job: SeniorJob | null; onClose: () => void }) {
  const [detail, setDetail] = useState<SeniorJob | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!job) { setDetail(null); return; }
    setDetail(null);
    setLoadingDetail(true);
    fetchSeniorJobById(job.id)
      .then((d) => setDetail(d ?? job))
      .catch(() => setDetail(job))
      .finally(() => setLoadingDetail(false));
  }, [job?.id]);

  const data = detail ?? job;
  if (!job) return null;

  const location = [data?.city, data?.region, data?.country].filter(Boolean).join(", ") || data?.location || "—";

  return (
    <AnimatePresence>
      {job && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[#0d1424] border-l border-white/10 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/[0.08] shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-bold text-lg leading-snug">{job.title}</h2>
                  {job.company_name && (
                    <p className="text-white/50 text-sm mt-1 flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      {job.company_name}
                    </p>
                  )}
                </div>
                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors mt-1">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <SeniorityBadge level={job.seniority_level} />
                <IndustryBadge industry={job.industry} />
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Location",   value: location },
                  { label: "Employment", value: data?.employment_type },
                  { label: "Workplace",  value: data?.workplace_type },
                  { label: "Salary",     value: data?.salary || "—" },
                  { label: "Platform",   value: data?.platform },
                  { label: "Source",     value: data?.source },
                ].map(({ label, value }) =>
                  value ? (
                    <div key={label} className="bg-white/[0.04] rounded-xl p-3">
                      <p className="text-white/40 text-xs mb-0.5">{label}</p>
                      <p className="text-white text-sm font-medium capitalize">{value}</p>
                    </div>
                  ) : null
                )}
              </div>

              {data?.skills && data.skills.length > 0 && (
                <div>
                  <p className="text-white/40 text-xs mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-white/60 border border-white/10">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-white/40 text-xs mb-2">Job Description</p>
                {loadingDetail ? (
                  <div className="flex items-center gap-2 text-white/30 text-sm py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading description…
                  </div>
                ) : data?.description ? (
                  <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                    {data.description}
                  </p>
                ) : (
                  <p className="text-white/30 text-sm italic">No description available.</p>
                )}
              </div>
            </div>

            {/* CTA */}
            {job.apply_url && (
              <div className="p-4 border-t border-white/[0.08] shrink-0">
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-semibold transition-colors"
                >
                  Apply Now <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Filter Select ─────────────────────────────────────────────────────────────

interface FilterSelectProps {
  label: string;
  value: string;
  options: { label: string; count: number }[];
  onChange: (v: string) => void;
  icon?: React.ElementType;
}

function FilterSelect({ label, value, options, onChange, icon: Icon }: FilterSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.label === value);

  return (
    <div className="relative overflow-visible">
      <button
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${
          value
            ? "bg-teal-500/15 border-teal-500/40 text-teal-300"
            : "bg-white/[0.04] border-white/10 text-white/60 hover:border-white/20 hover:text-white/80"
        }`}
      >
        {Icon && <Icon className="h-3.5 w-3.5" />}
        <span>{selected?.label || label}</span>
        {value && (
          <button
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="ml-1 text-teal-300/60 hover:text-teal-300"
          >
            <X className="h-3 w-3" />
          </button>
        )}
        {!value && <ChevronDown className="h-3.5 w-3.5 opacity-50" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-full mt-1 left-0 z-50 bg-[#131929] border border-white/10 rounded-xl shadow-2xl min-w-[200px] max-h-64 overflow-y-auto"
            onMouseLeave={() => setOpen(false)}
          >
            {options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => { onChange(opt.label); setOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-white/[0.06] transition-colors ${
                  opt.label === value ? "text-teal-300" : "text-white/70"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                <span className="text-white/30 text-xs ml-3">{opt.count.toLocaleString()}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sidebar Filter Section ───────────────────────────────────────────────────

interface SidebarFilterSectionProps {
  title: string;
  icon: React.ElementType;
  options: { label: string; count: number }[];
  selected: string;
  onChange: (v: string) => void;
}

function SidebarFilterSection({ title, icon: Icon, options, selected, onChange }: SidebarFilterSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const visible = expanded ? options : options.slice(0, 5);

  return (
    <div>
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between mb-2.5 group"
      >
        <span className="flex items-center gap-1.5 text-white/70 text-xs font-semibold uppercase tracking-wider">
          <Icon className="h-3.5 w-3.5 text-white/40" />
          {title}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-white/30 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-0.5"
          >
            {visible.map((opt) => (
              <button
                key={opt.label}
                onClick={() => onChange(selected === opt.label ? "" : opt.label)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                  selected === opt.label
                    ? "bg-teal-500/15 text-teal-300 border border-teal-500/30"
                    : "text-white/55 hover:bg-white/[0.05] hover:text-white/80"
                }`}
              >
                <span className="truncate text-left">{opt.label}</span>
                <span className="text-white/25 text-xs ml-2 shrink-0">{opt.count.toLocaleString()}</span>
              </button>
            ))}
            {options.length > 5 && (
              <button
                onClick={() => setExpanded((p) => !p)}
                className="text-xs text-white/30 hover:text-teal-400 px-3 py-1 transition-colors"
              >
                {expanded && options.length > visible.length
                  ? `+${options.length - visible.length} more`
                  : expanded ? "Show less" : `+${options.length - 5} more`}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SeniorJobs() {
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<SeniorJobSearchFilters>({});
  const [jobs, setJobs] = useState<SeniorJob[]>([]);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterOptions, setFilterOptions] = useState<SeniorJobFilterOptions | null>(null);
  const [selectedJob, setSelectedJob] = useState<SeniorJob | null>(null);

  // Load filter options once
  useEffect(() => {
    fetchSeniorJobFilterOptions()
      .then(setFilterOptions)
      .catch(() => toast.error("Failed to load filter options"));
  }, []);

  // Search when filters/page change
  const runSearch = useCallback(async (currentFilters: SeniorJobSearchFilters, currentPage: number, append: boolean) => {
    if (append) setLoadingMore(true); else setLoading(true);
    try {
      const res = await searchSeniorJobs({ ...currentFilters, page: currentPage, page_size: 20 });
      setJobs((prev) => append ? [...prev, ...res.results] : res.results);
      setTotal(res.count);
      setHasNext(res.has_next);
    } catch {
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      runSearch(filters, 1, false);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [filters, runSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, q: searchInput.trim() || undefined }));
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    runSearch(filters, nextPage, true);
  };

  const setFilter = (key: keyof SeniorJobSearchFilters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value || undefined }));
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const toOptions = (arr: any[], key: string) =>
    (arr || []).map((item) => ({ label: item[key], count: item.count }));

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <Navbar />

      {/* Hero */}
      <div className="pt-24 pb-8 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs font-semibold mb-4">
              <Crown className="h-3.5 w-3.5" />
              Executive & Senior Leadership Roles
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
              Senior Jobs by Industry
            </h1>
            <p className="text-white/50 text-sm mb-6">
              {total > 0 ? `${total.toLocaleString()} C-Suite, VP & Director roles` : "C-Suite, VP & Director roles"} — filtered by industry
            </p>
          </motion.div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by title, company, keyword…"
                className="w-full pl-10 pr-4 py-3 bg-white/[0.06] border border-white/10 focus:border-teal-500/50 rounded-xl text-white placeholder:text-white/30 text-sm outline-none transition-colors"
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(""); setFilter("q", ""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" className="bg-teal-500 hover:bg-teal-400 text-white px-6 rounded-xl shrink-0">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Main layout: left sidebar + right content */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6 items-start">

        {/* ── Left Filter Sidebar ── */}
        <aside className="w-64 shrink-0 sticky top-24 self-start">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-white font-semibold text-sm">
                <SlidersHorizontal className="h-4 w-4 text-teal-400" />
                Filters
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => setFilters({})}
                  className="text-xs text-white/40 hover:text-teal-400 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Each filter section */}
            {filterOptions && (
              <>
                <SidebarFilterSection
                  title="Seniority"
                  icon={Crown}
                  options={toOptions(filterOptions.seniority_levels, "seniority_level")}
                  selected={filters.seniority_level || ""}
                  onChange={(v) => setFilter("seniority_level", v)}
                />
                <SidebarFilterSection
                  title="Industry"
                  icon={Briefcase}
                  options={toOptions(filterOptions.industries, "industry")}
                  selected={filters.industry || ""}
                  onChange={(v) => setFilter("industry", v)}
                />
                <SidebarFilterSection
                  title="Country"
                  icon={MapPin}
                  options={toOptions(filterOptions.countries, "country")}
                  selected={filters.country || ""}
                  onChange={(v) => setFilter("country", v)}
                />
                <SidebarFilterSection
                  title="Workplace"
                  icon={Globe2}
                  options={toOptions(filterOptions.workplace_types, "workplace_type")}
                  selected={filters.workplace_type || ""}
                  onChange={(v) => setFilter("workplace_type", v)}
                />
                <SidebarFilterSection
                  title="Employment"
                  icon={Briefcase}
                  options={toOptions(filterOptions.employment_types, "employment_type")}
                  selected={filters.employment_type || ""}
                  onChange={(v) => setFilter("employment_type", v)}
                />
              </>
            )}

            {!filterOptions && (
              <div className="flex items-center gap-2 text-white/30 text-xs py-4">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading filters…
              </div>
            )}
          </div>
        </aside>

        {/* ── Right: Jobs ── */}
        <div className="flex-1 min-w-0">
          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-4">
              {Object.entries(filters).map(([key, val]) =>
                val ? (
                  <span key={key} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-teal-500/15 border border-teal-500/30 text-teal-300">
                    {val}
                    <button onClick={() => setFilter(key as keyof SeniorJobSearchFilters, "")}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ) : null
              )}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="h-8 w-8 text-teal-400 animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-32">
              <Briefcase className="h-12 w-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No jobs match your filters.</p>
              <button onClick={() => setFilters({})} className="mt-3 text-teal-400 text-sm hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-white/30 text-xs mb-4">
                Showing {jobs.length.toLocaleString()} of {total.toLocaleString()} jobs
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} onSelect={setSelectedJob} />
                ))}
              </div>

              {hasNext && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    variant="outline"
                    className="bg-white/[0.04] border-white/10 text-white/70 hover:bg-white/[0.08] hover:text-white rounded-xl px-8"
                  >
                    {loadingMore ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail drawer */}
      <JobDetailDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
