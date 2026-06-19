import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, MapPin, Building2, Briefcase, Globe2,
  Loader2, Zap, ChevronDown, SlidersHorizontal,
  CalendarDays, ExternalLink, ArrowRight, Clock,
  Crown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { NavbarV2 as Navbar } from "@/components/landing2/NavbarV2";
import { ApplyBotButton } from "@/components/jobs/ApplyBotButton";
import { toast } from "sonner";
import {
  SeniorJob,
  fetchSeniorJobById,
  searchSeniorJobs,
} from "@/services/seniorJobService";

// ─── Static data ───────────────────────────────────────────────────────────────

const COUNTRIES = [
  { label: "United States", code: "US", value: "United States" },
  { label: "Canada",        code: "CA", value: "Canada" },
] as const;

const INDUSTRIES = [
  { label: "Aerospace & Aviation",                key: "Aerospace" },
  { label: "AgTech & Precision Farming",          key: "AgTech" },
  { label: "Agriculture & Agri-Food",             key: "Agriculture" },
  { label: "Automotive & Electric Vehicles",      key: "Automotive" },
  { label: "Banking & Financial Services",        key: "Banking" },
  { label: "Biotech & Genomics",                  key: "Biotech" },
  { label: "Capital Markets & Inv. Banking",      key: "Capital Markets" },
  { label: "Clean Energy & Renewables",           key: "Clean Energy" },
  { label: "Construction & Infrastructure",       key: "Construction" },
  { label: "Consulting & Advisory",               key: "Consulting" },
  { label: "Consumer Goods & FMCG",               key: "Consumer Goods" },
  { label: "Cybersecurity",                        key: "Cybersecurity" },
  { label: "Defense & Government",                key: "Defense" },
  { label: "Education & EdTech",                  key: "Education" },
  { label: "Energy & Utilities",                  key: "Energy" },
  { label: "Fintech & Digital Banking",           key: "Fintech" },
  { label: "Food & Beverage",                     key: "Food" },
  { label: "Healthcare & Hospitals",              key: "Healthcare" },
  { label: "HealthTech & Digital Health",         key: "HealthTech" },
  { label: "Hospitality & Tourism",               key: "Hospitality" },
  { label: "Information Technology",              key: "Technology" },
  { label: "Insurance & Risk Management",         key: "Insurance" },
  { label: "Legal & Professional Services",       key: "Legal" },
  { label: "Logistics & Supply Chain",            key: "Logistics" },
  { label: "Manufacturing",                        key: "Manufacturing" },
  { label: "Media, Entertainment & Ads",          key: "Media" },
  { label: "Non-Profit & Social Services",        key: "Non-Profit" },
  { label: "Pharmaceuticals & Life Sciences",     key: "Pharma" },
  { label: "Private Equity & VC",                 key: "Private Equity" },
  { label: "Real Estate & Property",              key: "Real Estate" },
  { label: "Retail & E-commerce",                 key: "Retail" },
  { label: "SaaS & Cloud Computing",              key: "SaaS" },
  { label: "Semiconductor & Electronics",         key: "Semiconductor" },
  { label: "Telecommunications",                  key: "Telecom" },
  { label: "Transportation & Warehousing",        key: "Transportation" },
];

const FRACTIONAL_ROLES = [
  { label: "CEO",        keyword: "CEO" },
  { label: "CFO",        keyword: "CFO" },
  { label: "CTO",        keyword: "CTO" },
  { label: "CMO",        keyword: "CMO" },
  { label: "COO",        keyword: "COO" },
  { label: "CPO",        keyword: "CPO" },
  { label: "CHRO",       keyword: "CHRO" },
  { label: "CRO",        keyword: "CRO" },
  { label: "CISO",       keyword: "CISO" },
  { label: "Controller", keyword: "Controller" },
  { label: "VP Sales",   keyword: "VP Sales" },
  { label: "VP Mktg",    keyword: "VP Marketing" },
  { label: "VP Eng",     keyword: "VP Engineering" },
  { label: "VP Finance", keyword: "VP Finance" },
  { label: "HR Director",keyword: "HR Director" },
  { label: "IT Director",keyword: "IT Director" },
];

const WORKPLACE_TYPES = ["Remote", "Hybrid", "On-site"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripLocationPrefix(s: string | null | undefined): string {
  return (s ?? "").replace(/^location\s+/i, "").trim();
}

function strHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function seededFloat(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function liveCount(label: string, timeSeed: number, min: number, max: number): number {
  const base = strHash(label) % (max - min) + min;
  const drift = Math.floor(seededFloat(strHash(label) + timeSeed) * 30) - 15;
  return Math.max(min, base + drift);
}

function fmtCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

// ─── Filter Section ───────────────────────────────────────────────────────────

function FilterSection({
  title, icon: Icon, defaultOpen = true, children,
}: {
  title: string; icon?: React.ElementType; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500">
          {Icon && <Icon className="h-3.5 w-3.5 text-teal-500" />}
          {title}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────

function JobCard({ job, onSelect }: { job: SeniorJob; onSelect: (j: SeniorJob) => void }) {
  const rawLoc = [job.city, job.country].filter(Boolean).join(", ") || job.location || "";
  const location = stripLocationPrefix(rawLoc) || null;
  const postedDate = job.posted_at
    ? new Date(job.posted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Recent";
  const initial = job.company_name?.[0]?.toUpperCase() ?? "?";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(job)}
      className="group bg-white border border-gray-200 hover:border-teal-200 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md"
    >
      <div className="p-4 sm:p-6">
        <div className="flex gap-3 sm:gap-4">
          <div className="shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-xl border-2 bg-teal-50 border-teal-200 text-teal-600 flex items-center justify-center font-black text-base sm:text-xl">
            {initial}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-gray-900 font-bold text-[15px] sm:text-[18px] leading-snug group-hover:text-teal-600 transition-colors capitalize">
                {job.title}
              </h3>
              {job.salary && (
                <span className="shrink-0 text-emerald-700 text-xs font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg whitespace-nowrap">
                  {job.salary}
                </span>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500 mb-3.5">
              {job.company_name && (
                <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  {job.company_name}
                </span>
              )}
              {location && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    {location}
                  </span>
                </>
              )}
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                {postedDate}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-teal-50 text-teal-700 border-teal-200">
                <Zap className="h-3 w-3" />
                Fractional
              </span>
              {job.workplace_type && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border bg-gray-50 text-gray-600 border-gray-200 font-medium">
                  <Globe2 className="h-3 w-3" />
                  {job.workplace_type}
                </span>
              )}
              {job.industry && (
                <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs border bg-gray-50 text-gray-500 border-gray-200 font-medium">
                  {job.industry}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {job.apply_url && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-5" onClick={(e) => e.stopPropagation()}>
          <div className="border-t border-gray-100 pt-3 sm:pt-4">
            <ApplyBotButton
              variant="light"
              jobUrl={job.apply_url}
              jobTitle={job.title}
              company={job.company_name ?? ""}
              jobId={String(job.id)}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

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

  const rawLoc = [data?.city, data?.region, data?.country].filter(Boolean).join(", ") || data?.location || "";
  const location = stripLocationPrefix(rawLoc) || "—";

  return (
    <AnimatePresence>
      {job && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[560px] bg-white border-l border-gray-200 z-50 flex flex-col shadow-2xl"
          >
            <div className="p-4 sm:p-6 border-b border-gray-100 shrink-0">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl border-2 bg-teal-50 border-teal-200 text-teal-600 flex items-center justify-center font-black text-xl sm:text-2xl">
                  {job.company_name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-gray-900 font-bold text-base sm:text-xl leading-snug capitalize">{job.title}</h2>
                  {job.company_name && (
                    <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />{job.company_name}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-teal-50 text-teal-700 border-teal-200">
                      <Zap className="h-3 w-3" /> Fractional
                    </span>
                    {job.industry && (
                      <span className="px-3 py-1 rounded-full text-xs border bg-gray-50 text-gray-500 border-gray-200 font-medium">
                        {job.industry}
                      </span>
                    )}
                  </div>
                </div>
                <button type="button" aria-label="Close" onClick={onClose}
                  className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {([
                  ["Location",   location,              MapPin],
                  ["Salary",     data?.salary,          null],
                  ["Employment", data?.employment_type,  Briefcase],
                  ["Workplace",  data?.workplace_type,   Globe2],
                ] as [string, string | null | undefined, React.ElementType | null][]).map(([lbl, val, LIcon]) =>
                  val ? (
                    <div key={lbl} className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                      <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-1.5">{lbl}</p>
                      <p className="text-gray-700 text-sm font-semibold capitalize flex items-center gap-1.5">
                        {LIcon && <LIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />}{val}
                      </p>
                    </div>
                  ) : null
                )}
              </div>

              {data?.skills && data.skills.length > 0 && (
                <div>
                  <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-2.5">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((s) => (
                      <span key={s} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-2.5">Description</p>
                {loadingDetail ? (
                  <div className="flex items-center gap-2 text-gray-400 text-sm py-8 justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                  </div>
                ) : data?.description ? (
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{data.description}</p>
                ) : (
                  <p className="text-gray-400 text-sm italic">No description available.</p>
                )}
              </div>
            </div>

            {job.apply_url && (
              <div className="p-4 sm:p-5 border-t border-gray-100 shrink-0 bg-gray-50/50 space-y-2.5">
                <ApplyBotButton
                  variant="light"
                  jobUrl={job.apply_url}
                  jobTitle={job.title}
                  company={job.company_name ?? ""}
                  jobId={String(job.id)}
                />
                <a href={job.apply_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm font-medium hover:border-gray-300 hover:text-gray-700 transition-colors">
                  Apply manually <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Filter state ──────────────────────────────────────────────────────────────

interface PageFilters {
  country: string;
  industry: string;
  role: string;
  workplace: string;
  text: string;
}

const EMPTY: PageFilters = { country: "", industry: "", role: "", workplace: "", text: "" };

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function FractionalJobs() {
  const [filters, setFilters] = useState<PageFilters>(EMPTY);
  const [textInput, setTextInput] = useState("");
  const [jobs, setJobs] = useState<SeniorJob[]>([]);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedJob, setSelectedJob] = useState<SeniorJob | null>(null);
  const [industrySearch, setIndustrySearch] = useState("");
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [timeSeed] = useState(() => Math.floor(Date.now() / (1000 * 60 * 12)));
  const [showAllIndustries, setShowAllIndustries] = useState(false);

  const runSearch = useCallback(async (f: PageFilters, pg: number, append: boolean) => {
    if (append) setLoadingMore(true); else setLoading(true);
    try {
      const res = await searchSeniorJobs({
        q:             f.role || f.text || undefined,
        country:       f.country   || undefined,
        industry:      f.industry  || undefined,
        workplace_type:f.workplace || undefined,
        fractional:    true,
        page:          pg,
        page_size:     20,
      });
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
    debounceRef.current = setTimeout(() => { setPage(1); runSearch(filters, 1, false); }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [filters, runSearch]);

  const set = (key: keyof PageFilters, value: string) => setFilters((f) => ({ ...f, [key]: value }));
  const toggle = (key: keyof PageFilters, value: string) => setFilters((f) => ({ ...f, [key]: f[key] === value ? "" : value }));
  const clearAll = () => { setFilters(EMPTY); setTextInput(""); setIndustrySearch(""); setShowAllIndustries(false); };
  const hasAnyFilter = Object.values(filters).some(Boolean);

  const filteredIndustries = industrySearch
    ? INDUSTRIES.filter((i) => i.label.toLowerCase().includes(industrySearch.toLowerCase()))
    : INDUSTRIES;

  const chips: { label: string; clear: () => void }[] = [
    ...(filters.country   ? [{ label: filters.country, clear: () => set("country", "") }] : []),
    ...(filters.role      ? [{ label: `Fractional ${filters.role}`, clear: () => set("role", "") }] : []),
    ...(filters.industry  ? [{ label: INDUSTRIES.find((i) => i.key === filters.industry)?.label ?? filters.industry, clear: () => set("industry", "") }] : []),
    ...(filters.workplace ? [{ label: filters.workplace, clear: () => set("workplace", "") }] : []),
    ...(filters.text      ? [{ label: `"${filters.text}"`, clear: () => { set("text", ""); setTextInput(""); } }] : []),
  ];

  const filterBody = (
    <div>
      {/* Country */}
      <FilterSection title="Country" icon={MapPin}>
        <div className="space-y-1.5">
          {COUNTRIES.map((c) => {
            const active = filters.country === c.value;
            return (
              <button key={c.value} type="button" onClick={() => toggle("country", c.value)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  active
                    ? "bg-teal-600 border-teal-600 text-white shadow-sm shadow-teal-200"
                    : "bg-white border-gray-200 text-gray-600 hover:border-teal-200 hover:bg-teal-50"
                }`}>
                <span className={`shrink-0 text-[10px] font-black w-7 text-center py-0.5 rounded-md ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {c.code}
                </span>
                <span className="flex-1 text-left">{c.label}</span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Fractional Role */}
      <FilterSection title="Role Type" icon={Zap}>
        <div className="flex flex-wrap gap-1.5">
          {FRACTIONAL_ROLES.map((r) => {
            const active = filters.role === r.keyword;
            return (
              <button key={r.keyword} type="button"
                onClick={() => setFilters(f => ({ ...f, role: f.role === r.keyword ? "" : r.keyword, text: "" }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  active
                    ? "bg-teal-600 border-teal-600 text-white shadow-sm shadow-teal-100"
                    : "bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100"
                }`}>
                {r.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Workplace */}
      <FilterSection title="Workplace Type" icon={Globe2}>
        <div className="flex flex-col gap-1.5">
          {WORKPLACE_TYPES.map((w) => (
            <button key={w} type="button" onClick={() => toggle("workplace", w)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                filters.workplace === w
                  ? "bg-teal-600 border-teal-600 text-white shadow-sm shadow-teal-100"
                  : "bg-white border-gray-200 text-gray-600 hover:border-teal-200 hover:bg-teal-50"
              }`}>
              <span>{w}</span>
              {filters.workplace === w && <X className="h-3.5 w-3.5 opacity-70" />}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Industry */}
      <FilterSection title="Industry" icon={Briefcase} defaultOpen={false}>
        <div className="relative mb-2.5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          <input value={industrySearch}
            onChange={(e) => { setIndustrySearch(e.target.value); setShowAllIndustries(false); }}
            placeholder="Search industries…"
            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 placeholder:text-gray-400 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all"
          />
        </div>
        {(() => {
          const PREVIEW = 8;
          const isSearching = industrySearch.length > 0;
          const visible = isSearching || showAllIndustries ? filteredIndustries : filteredIndustries.slice(0, PREVIEW);
          const hidden = !isSearching && !showAllIndustries ? Math.max(0, filteredIndustries.length - PREVIEW) : 0;
          return (
            <div className="space-y-0.5">
              {visible.map((ind) => {
                const active = filters.industry === ind.key;
                return (
                  <button key={ind.key} type="button" onClick={() => toggle("industry", ind.key)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-center gap-2 ${
                      active ? "bg-teal-600 text-white font-semibold" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}>
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${active ? "bg-white" : "bg-gray-300"}`} />
                    <span className="flex-1">{ind.label}</span>
                    <span className={`text-[10px] tabular-nums font-medium ${active ? "text-teal-100" : "text-gray-400"}`}>
                      {fmtCount(liveCount(ind.key, timeSeed, 80, 600))}
                    </span>
                  </button>
                );
              })}
              {filteredIndustries.length === 0 && (
                <p className="text-gray-400 text-xs px-2 py-3 text-center">No match</p>
              )}
              {hidden > 0 && (
                <button type="button" onClick={() => setShowAllIndustries(true)}
                  className="w-full text-left px-2.5 py-2 text-xs text-teal-600 hover:text-teal-700 font-semibold transition-colors flex items-center gap-1.5">
                  <ArrowRight className="h-3 w-3" /> Show all {filteredIndustries.length} industries
                </button>
              )}
              {showAllIndustries && !isSearching && filteredIndustries.length > PREVIEW && (
                <button type="button" onClick={() => setShowAllIndustries(false)}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  Show less
                </button>
              )}
            </div>
          );
        })()}
      </FilterSection>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-700 pt-[64px]">
        <div className="max-w-3xl mx-auto px-4 sm:px-5 pt-8 sm:pt-12 pb-8 sm:pb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-xs font-semibold mb-5 backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5 text-yellow-300" />
            Part-Time · High-Impact · Executive
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-2">
            Fractional Executive Roles
          </h1>
          <p className="text-teal-100 text-sm mb-8">
            {total > 0
              ? `${total.toLocaleString()} fractional roles available right now`
              : "Fractional CFO, CTO, CMO, COO & more — flexible high-impact leadership"}
          </p>

          <form onSubmit={(e) => { e.preventDefault(); setFilters(f => ({ ...f, text: textInput.trim(), role: "" })); }}
            className="flex gap-2 items-stretch shadow-xl shadow-teal-900/30">
            <div className="flex-1 relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-gray-400 pointer-events-none" />
              <input value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  if (!e.target.value) setFilters(f => ({ ...f, text: "", role: "" }));
                }}
                placeholder="Search by title, company…"
                className="w-full h-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-3.5 sm:py-4 bg-white rounded-xl text-gray-900 placeholder:text-gray-400 text-sm sm:text-base outline-none focus:ring-2 focus:ring-teal-300 transition-all"
              />
            </div>
            <button type="submit"
              className="px-4 sm:px-8 py-3.5 sm:py-4 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-gray-900 rounded-xl font-black text-sm transition-colors shrink-0 shadow-sm">
              Search
            </button>
          </form>

          {chips.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-4">
              {chips.map((chip) => (
                <span key={chip.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/15 border border-white/25 text-white backdrop-blur-sm">
                  {chip.label}
                  <button type="button" onClick={chip.clear} className="hover:text-red-200 transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button type="button" onClick={clearAll}
                className="px-3 py-1 rounded-full text-xs text-white/60 hover:text-white border border-white/15 hover:border-white/30 transition-colors">
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── What is fractional strip ── */}
      <div className="bg-teal-50 border-b border-teal-100">
        <div className="max-w-[1340px] mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 text-sm text-teal-800">
            <Clock className="h-4 w-4 text-teal-600 shrink-0" />
            <span>
              <span className="font-bold">Fractional roles</span> are part-time senior positions (typically 10–20 hrs/week) where executives serve multiple companies — higher flexibility, executive-level impact.
            </span>
          </div>
          <Link to="/find-jobs"
            className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors shrink-0">
            <Crown className="h-3.5 w-3.5" />
            Full-time exec roles →
          </Link>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-[1340px] mx-auto px-3 sm:px-4 py-4 sm:py-6 flex gap-4 sm:gap-5 items-start">

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-[288px] shrink-0 sticky top-[72px] self-start bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm h-[calc(100vh-90px)]">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 shrink-0">
            <span className="flex items-center gap-2 text-sm font-bold text-gray-800">
              <SlidersHorizontal className="h-4 w-4 text-teal-600" />
              Filters
              {chips.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-white text-[10px] font-black">
                  {chips.length}
                </span>
              )}
            </span>
            {hasAnyFilter && (
              <button type="button" onClick={clearAll}
                className="text-xs text-teal-600 hover:text-teal-700 font-semibold transition-colors">
                Clear all
              </button>
            )}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">{filterBody}</div>
        </aside>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {mobileSidebar && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                onClick={() => setMobileSidebar(false)}
              />
              <motion.div
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed left-0 top-0 bottom-0 w-80 z-50 lg:hidden bg-white border-r border-gray-200 flex flex-col"
              >
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 shrink-0">
                  <span className="flex items-center gap-2 font-bold text-gray-800 text-sm">
                    <SlidersHorizontal className="h-4 w-4 text-teal-600" />
                    Filters
                    {chips.length > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-white text-[10px] font-black">
                        {chips.length}
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-3">
                    {hasAnyFilter && (
                      <button type="button" onClick={clearAll}
                        className="text-xs text-teal-600 hover:text-teal-700 font-semibold transition-colors">
                        Clear all
                      </button>
                    )}
                    <button type="button" onClick={() => setMobileSidebar(false)} aria-label="Close"
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto">{filterBody}</div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Job list */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500 font-medium">
              {loading ? "Searching…" : total > 0 ? (
                <><span className="font-bold text-gray-900">{total.toLocaleString()}</span> fractional roles found</>
              ) : null}
            </p>
            <button type="button" onClick={() => setMobileSidebar((p) => !p)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 text-sm font-semibold hover:border-teal-300 hover:text-teal-600 transition-colors">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {chips.length > 0 && (
                <span className="h-5 w-5 rounded-full bg-teal-600 text-white text-[10px] font-black flex items-center justify-center">
                  {chips.length}
                </span>
              )}
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-36 gap-3">
              <div className="h-12 w-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-teal-600 animate-spin" />
              </div>
              <p className="text-gray-500 text-sm font-medium">Searching fractional roles…</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-36">
              <div className="h-16 w-16 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-4">
                <Zap className="h-7 w-7 text-gray-300" />
              </div>
              <p className="text-gray-700 text-base font-bold mb-1">No fractional roles found</p>
              <p className="text-gray-400 text-sm mb-5">Try different keywords or remove a filter</p>
              {hasAnyFilter && (
                <button type="button" onClick={clearAll}
                  className="px-5 py-2 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors">
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {jobs.map((job, idx) => (
                  <JobCard key={`${job.id}-${idx}`} job={job} onSelect={setSelectedJob} />
                ))}
              </div>
              {hasNext && (
                <div className="flex justify-center mt-8">
                  <button
                    type="button"
                    onClick={() => { const next = page + 1; setPage(next); runSearch(filters, next, true); }}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 px-12 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-600 font-semibold text-sm hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50 transition-all disabled:opacity-50 shadow-sm"
                  >
                    {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loadingMore ? "Loading more…" : "Load more roles"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <JobDetailDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
