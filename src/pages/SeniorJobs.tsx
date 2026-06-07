import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, MapPin, Building2, Briefcase, Globe2,
  Loader2, Crown, TrendingUp, Users2, ChevronDown,
  SlidersHorizontal, CalendarDays, ExternalLink, ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { ApplyBotButton } from "@/components/jobs/ApplyBotButton";
import { toast } from "sonner";
import {
  SeniorJob,
  SeniorJobSearchFilters,
  fetchSeniorJobById,
  searchSeniorJobs,
} from "@/services/seniorJobService";

// ─── Static data ───────────────────────────────────────────────────────────────

const COUNTRIES = [
  { label: "United States", code: "US", value: "United States" },
  { label: "Canada",        code: "CA", value: "Canada" },
] as const;

const INDUSTRIES = [
  { label: "Aerospace & Aviation",                   key: "Aerospace" },
  { label: "AgTech & Precision Farming",             key: "AgTech" },
  { label: "Agriculture & Agri-Food",                key: "Agriculture" },
  { label: "Architecture & Design",                  key: "Architecture" },
  { label: "Automotive & Electric Vehicles",         key: "Automotive" },
  { label: "Banking & Financial Services",           key: "Banking" },
  { label: "Biotech & Genomics",                     key: "Biotech" },
  { label: "Capital Markets & Investment Banking",   key: "Capital Markets" },
  { label: "Clean Energy & Renewables",              key: "Clean Energy" },
  { label: "Construction & Infrastructure",          key: "Construction" },
  { label: "Consulting & Advisory",                  key: "Consulting" },
  { label: "Consumer Goods & FMCG",                  key: "Consumer Goods" },
  { label: "Cybersecurity",                           key: "Cybersecurity" },
  { label: "Defense & Government Contractors",       key: "Defense" },
  { label: "Education & EdTech",                     key: "Education" },
  { label: "Energy & Utilities",                     key: "Energy" },
  { label: "Environmental & Clean Tech",             key: "Environmental" },
  { label: "Fintech & Digital Banking",              key: "Fintech" },
  { label: "Food & Beverage Manufacturing",          key: "Food" },
  { label: "Government & Public Sector",             key: "Government" },
  { label: "Healthcare & Hospitals",                 key: "Healthcare" },
  { label: "HealthTech & Digital Health",            key: "HealthTech" },
  { label: "Hospitality & Tourism",                  key: "Hospitality" },
  { label: "Information Technology",                 key: "Technology" },
  { label: "Insurance & Risk Management",            key: "Insurance" },
  { label: "Legal & Professional Services",          key: "Legal" },
  { label: "Logistics & Supply Chain",               key: "Logistics" },
  { label: "Manufacturing",                           key: "Manufacturing" },
  { label: "Media, Entertainment & Advertising",     key: "Media" },
  { label: "Mining & Natural Resources",             key: "Mining" },
  { label: "Non-Profit & Social Services",           key: "Non-Profit" },
  { label: "Nuclear Energy",                         key: "Nuclear" },
  { label: "Pharmaceuticals & Life Sciences",        key: "Pharma" },
  { label: "Private Equity & Venture Capital",       key: "Private Equity" },
  { label: "PropTech & Smart Buildings",             key: "PropTech" },
  { label: "Real Estate & Property",                 key: "Real Estate" },
  { label: "Retail & E-commerce",                    key: "Retail" },
  { label: "Semiconductor & Electronics",            key: "Semiconductor" },
  { label: "Space & Satellite Technology",           key: "Space" },
  { label: "Sports & Recreation",                    key: "Sports" },
  { label: "Telecommunications",                     key: "Telecom" },
  { label: "Transportation & Warehousing",           key: "Transportation" },
  { label: "Waste Management & Recycling",           key: "Waste" },
];

const ROLES: Record<string, string[]> = {
  "C-Suite": [
    "Chief Executive Officer (CEO)",
    "Chief Operating Officer (COO)",
    "Chief Financial Officer (CFO)",
    "Chief Technology Officer (CTO)",
    "Chief Information Officer (CIO)",
    "Chief Marketing Officer (CMO)",
    "Chief Human Resources Officer (CHRO)",
    "Chief Revenue Officer (CRO)",
    "Chief Sales Officer (CSO)",
    "Chief Legal Officer (CLO)",
    "Chief Compliance Officer (CCO)",
    "Chief Risk Officer",
    "Chief Security Officer (CSO)",
    "Chief Information Security Officer (CISO)",
    "Chief Data Officer (CDO)",
    "Chief Analytics Officer (CAO)",
    "Chief Product Officer (CPO)",
    "Chief Innovation Officer (CINO)",
    "Chief Customer Officer",
    "Chief Experience Officer (CXO)",
    "Chief Transformation Officer",
    "Chief Growth Officer (CGO)",
    "Chief Sustainability Officer",
    "Chief Diversity & Inclusion Officer",
    "Chief People Officer",
    "Chief Talent Officer",
    "Chief Supply Chain Officer (CSCO)",
    "Chief Business Officer (CBO)",
    "Chief AI Officer (CAIO)",
    "Chief Digital Officer",
    "Chief Medical Officer (CMO)",
    "Chief Nursing Officer (CNO)",
    "Chief Scientific Officer",
    "Chief Strategy Officer",
    "Chief Commercial Officer",
    "Chief Procurement Officer",
    "Chief Administrative Officer",
    "General Counsel",
    "President",
    "Executive Vice President (EVP)",
    "Managing Director",
    "Group CEO",
    "Division President",
    "Regional President",
    "Country Manager",
  ],
  "VP": [
    // People & HR
    "VP Human Resources",
    "VP People & Culture",
    "VP Talent Acquisition",
    "VP Workforce Planning",
    "VP Employee Experience",
    "VP Learning & Development",
    "VP Total Rewards & Compensation",
    "VP Diversity, Equity & Inclusion",
    "VP HR Technology (HRIS)",
    "VP Organizational Development",
    // Operations
    "VP Operations",
    "VP Manufacturing",
    "VP Supply Chain",
    "VP Production",
    "VP Quality Assurance",
    "VP Engineering",
    "VP Continuous Improvement",
    "VP Environmental Health & Safety",
    "VP Facilities & Real Estate",
    "VP Procurement & Sourcing",
    "VP Logistics & Distribution",
    // Technology & Digital
    "VP Information Technology",
    "VP Technology",
    "VP Digital Transformation",
    "VP Enterprise Applications",
    "VP Cybersecurity",
    "VP Data & Analytics",
    "VP Artificial Intelligence & ML",
    "VP Engineering - Cloud & Infrastructure",
    "VP Engineering - Platform",
    "VP Software Engineering",
    "VP Product Management",
    "VP User Experience & Design",
    // Sales & Revenue
    "VP Sales",
    "VP Enterprise Sales",
    "VP Business Development",
    "VP Strategic Partnerships",
    "VP Channel Sales",
    "VP Customer Success",
    "VP Revenue Operations",
    "VP Account Management",
    "VP International Sales",
    "VP North America",
    // Marketing & Comms
    "VP Marketing",
    "VP Digital Marketing",
    "VP Brand & Communications",
    "VP Growth",
    "VP Corporate Communications",
    "VP Public Relations",
    "VP Investor Relations",
    // Finance, Legal & Risk
    "VP Finance",
    "VP Financial Planning & Analysis (FP&A)",
    "VP Corporate Development & M&A",
    "VP Procurement",
    "VP Risk Management",
    "VP Compliance & Regulatory Affairs",
    "VP Internal Audit",
    "VP Legal & Compliance",
    "VP Tax",
    "VP Treasury",
    // Customer & Service
    "VP Customer Experience",
    "VP Service Delivery",
    "VP Global Services",
    // Strategy
    "VP Strategy & Corporate Planning",
    "VP Government Relations",
    "VP Regulatory Affairs",
  ],
  "Director": [
    // Human Resources
    "Director, Human Resources",
    "Director, Talent Acquisition",
    "Director, Recruitment",
    "Director, Workforce Planning",
    "Director, People Operations",
    "Director, Employee Relations",
    "Director, Learning & Development",
    "Director, Organizational Development",
    "Director, Total Rewards & Compensation",
    "Director, Benefits & Wellness",
    "Director, Diversity, Equity & Inclusion",
    "Director, HR Technology (HRIS)",
    "Director, HR Business Partner",
    // Operations & Manufacturing
    "Director, Operations",
    "Director, Manufacturing",
    "Director, Plant Operations",
    "Director, Production",
    "Director, Engineering",
    "Director, Quality Assurance",
    "Director, Supply Chain",
    "Director, Maintenance & Reliability",
    "Director, Logistics & Distribution",
    "Director, Continuous Improvement",
    "Director, Lean Manufacturing",
    "Director, Environmental Health & Safety",
    "Director, Facilities Management",
    "Director, Fleet Operations",
    // Technology & Digital
    "Director, Information Technology",
    "Director, Enterprise Applications",
    "Director, ERP & Business Systems",
    "Director, SAP",
    "Director, Infrastructure & Cloud",
    "Director, Cybersecurity",
    "Director, Data Analytics & BI",
    "Director, AI & Automation",
    "Director, Software Engineering",
    "Director, DevOps & Platform",
    "Director, Digital Transformation",
    "Director, IT Project Management",
    // Sales & Business Development
    "Director, Sales",
    "Director, Enterprise Sales",
    "Director, Business Development",
    "Director, Channel Sales",
    "Director, Account Management",
    "Director, Revenue Operations",
    "Director, Technical Sales & Pre-Sales",
    "Director, Partnerships",
    "Director, Customer Success",
    "Director, Inside Sales",
    // Marketing
    "Director, Marketing",
    "Director, Digital Marketing",
    "Director, Brand Management",
    "Director, Growth Marketing",
    "Director, Content & Communications",
    "Director, Product Marketing",
    "Director, Demand Generation",
    "Director, Customer Experience & CX",
    // Finance & Legal
    "Director, Finance",
    "Director, Financial Planning & Analysis",
    "Director, Corporate Finance",
    "Director, Accounting & Reporting",
    "Director, Treasury",
    "Director, Tax",
    "Director, Internal Audit",
    "Director, Risk & Compliance",
    "Director, Regulatory Affairs",
    "Director, Procurement & Strategic Sourcing",
    "Director, Vendor Management",
    "Director, M&A & Corporate Development",
    "Director, Investor Relations",
    // Strategy & Corporate
    "Director, Strategy & Planning",
    "Director, PMO & Project Management",
    "Director, Program Management",
    "Director, Transformation & Change",
    "Director, Government Relations",
    "Director, Corporate Affairs",
    "Director, Corporate Communications",
    // Product & Design
    "Director, Product Management",
    "Director, UX & Product Design",
    "Director, Research & Development",
    "Director, Innovation",
    // Customer & Service
    "Director, Service Delivery",
    "Director, Field Operations",
    "Director, Customer Operations",
  ],
};

const WORKPLACE_TYPES = ["Remote", "Hybrid", "On-site"] as const;

const SENIORITY_ICONS: Record<string, React.ElementType> = {
  "C-Suite":  Crown,
  "VP":       TrendingUp,
  "Director": Users2,
};

const SENIORITY_BADGE: Record<string, string> = {
  "C-Suite":  "bg-amber-50 text-amber-700 border-amber-200",
  "VP":       "bg-purple-50 text-purple-700 border-purple-200",
  "Director": "bg-blue-50 text-blue-700 border-blue-200",
};

const SENIORITY_ICON_BG: Record<string, string> = {
  "C-Suite":  "bg-amber-50 border-amber-200 text-amber-600",
  "VP":       "bg-purple-50 border-purple-200 text-purple-600",
  "Director": "bg-blue-50 border-blue-200 text-blue-600",
};

function getSeniorityFromRole(role: string): string {
  const r = role.toLowerCase();
  if (r.startsWith("vp ") || r.startsWith("vice president")) return "VP";
  if (r.startsWith("director")) return "Director";
  return "C-Suite";
}

function stripLocationPrefix(s: string | null | undefined): string {
  return (s ?? "").replace(/^location\s+/i, "").trim();
}

// ─── Live-ish count helpers ────────────────────────────────────────────────────

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
  const drift = Math.floor(seededFloat(strHash(label) + timeSeed) * 40) - 20;
  return Math.max(min, base + drift);
}

function fmtCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

// ─── Filter state ──────────────────────────────────────────────────────────────

interface PageFilters {
  country: string;
  industry: string;
  seniority: string;
  role: string;
  workplace: string;
  text: string;
}

const EMPTY: PageFilters = {
  country: "", industry: "", seniority: "", role: "", workplace: "", text: "",
};

function toApiFilters(f: PageFilters): SeniorJobSearchFilters {
  return {
    q:               f.role || f.text || undefined,
    country:         f.country || undefined,
    industry:        f.industry || undefined,
    seniority_level: f.seniority || undefined,
    workplace_type:  f.workplace || undefined,
  };
}

// ─── Filter Section wrapper ───────────────────────────────────────────────────

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
          {Icon && <Icon className="h-3.5 w-3.5 text-blue-500" />}
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
  const SenIcon = SENIORITY_ICONS[job.seniority_level] ?? Crown;
  const iconBg = SENIORITY_ICON_BG[job.seniority_level] ?? SENIORITY_ICON_BG["Director"];
  const badge = SENIORITY_BADGE[job.seniority_level] ?? SENIORITY_BADGE["Director"];
  const postedDate = job.posted_at
    ? new Date(job.posted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Recent";
  const initial = job.company_name?.[0]?.toUpperCase() ?? "?";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(job)}
      className="group bg-white border border-gray-200 hover:border-blue-200 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md"
    >
      <div className="p-6">
        <div className="flex gap-4">
          {/* Company initial */}
          <div className={`shrink-0 w-14 h-14 rounded-xl border-2 flex items-center justify-center font-black text-xl ${iconBg}`}>
            {initial}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title + salary */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-gray-900 font-bold text-[18px] leading-snug group-hover:text-blue-600 transition-colors capitalize">
                {job.title}
              </h3>
              {job.salary && (
                <span className="shrink-0 text-emerald-700 text-xs font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg whitespace-nowrap">
                  {job.salary}
                </span>
              )}
            </div>

            {/* Company · location · date */}
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

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge}`}>
                <SenIcon className="h-3 w-3" />
                {job.seniority_level}
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

      {/* Apply bot footer */}
      {job.apply_url && (
        <div className="px-6 pb-5" onClick={(e) => e.stopPropagation()}>
          <div className="border-t border-gray-100 pt-4">
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
  const Icon = SENIORITY_ICONS[job.seniority_level] ?? Crown;
  const badge = SENIORITY_BADGE[job.seniority_level] ?? SENIORITY_BADGE["Director"];

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
            {/* Header */}
            <div className="p-6 border-b border-gray-100 shrink-0">
              <div className="flex items-start gap-4">
                <div className={`shrink-0 w-16 h-16 rounded-xl border-2 flex items-center justify-center font-black text-2xl ${SENIORITY_ICON_BG[job.seniority_level] ?? SENIORITY_ICON_BG["Director"]}`}>
                  {job.company_name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-gray-900 font-bold text-xl leading-snug capitalize">{job.title}</h2>
                  {job.company_name && (
                    <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />{job.company_name}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge}`}>
                      <Icon className="h-3 w-3" />{job.seniority_level}
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

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3">
                {([
                  ["Location",   location,             MapPin],
                  ["Salary",     data?.salary,         null],
                  ["Employment", data?.employment_type, Briefcase],
                  ["Workplace",  data?.workplace_type,  Globe2],
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

              {/* Skills */}
              {data?.skills && data.skills.length > 0 && (
                <div>
                  <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-2.5">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((s) => (
                      <span key={s} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
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

            {/* Footer */}
            {job.apply_url && (
              <div className="p-5 border-t border-gray-100 shrink-0 bg-gray-50/50 space-y-2.5">
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

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function FindJobs() {
  const [filters, setFilters] = useState<PageFilters>(EMPTY);
  const [textInput, setTextInput] = useState("");

  const [jobs, setJobs] = useState<SeniorJob[]>([]);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedJob, setSelectedJob] = useState<SeniorJob | null>(null);
  const [roleSearch, setRoleSearch] = useState("");
  const [industrySearch, setIndustrySearch] = useState("");
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [timeSeed, setTimeSeed] = useState(() => Math.floor(Date.now() / (1000 * 60 * 12)));
  const [showAllIndustries, setShowAllIndustries] = useState(false);
  const [expandedRoleLevels, setExpandedRoleLevels] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const id = setInterval(() => setTimeSeed(Math.floor(Date.now() / (1000 * 60 * 12))), 1000 * 60 * 12);
    return () => clearInterval(id);
  }, []);

  const runSearch = useCallback(async (f: PageFilters, pg: number, append: boolean) => {
    if (append) setLoadingMore(true); else setLoading(true);
    try {
      const res = await searchSeniorJobs({ ...toApiFilters(f), page: pg, page_size: 20 });
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

  const selectRole = (role: string) => {
    const seniority = getSeniorityFromRole(role);
    setFilters((f) => ({ ...f, role: f.role === role ? "" : role, seniority: f.role === role ? f.seniority : seniority, text: "" }));
    setTextInput("");
  };

  const submitText = (e: React.FormEvent) => { e.preventDefault(); setFilters((f) => ({ ...f, text: textInput.trim(), role: "" })); };

  const clearAll = () => {
    setFilters(EMPTY); setTextInput(""); setRoleSearch(""); setIndustrySearch("");
    setShowAllIndustries(false); setExpandedRoleLevels({});
  };

  const hasAnyFilter = Object.values(filters).some(Boolean);

  const filteredIndustries = industrySearch
    ? INDUSTRIES.filter((i) => i.label.toLowerCase().includes(industrySearch.toLowerCase()))
    : INDUSTRIES;

  const filteredRoles: Record<string, string[]> = roleSearch
    ? Object.fromEntries(
        Object.entries(ROLES)
          .map(([lvl, rs]) => [lvl, rs.filter((r) => r.toLowerCase().includes(roleSearch.toLowerCase()))])
          .filter(([, rs]) => (rs as string[]).length > 0)
      )
    : ROLES;

  const chips: { label: string; clear: () => void }[] = [
    ...(filters.country   ? [{ label: filters.country, clear: () => set("country", "") }] : []),
    ...(filters.seniority ? [{ label: filters.seniority, clear: () => set("seniority", "") }] : []),
    ...(filters.industry  ? [{ label: INDUSTRIES.find((i) => i.key === filters.industry)?.label ?? filters.industry, clear: () => set("industry", "") }] : []),
    ...(filters.role      ? [{ label: filters.role, clear: () => setFilters((f) => ({ ...f, role: "", seniority: "" })) }] : []),
    ...(filters.workplace ? [{ label: filters.workplace, clear: () => set("workplace", "") }] : []),
    ...(filters.text      ? [{ label: `"${filters.text}"`, clear: () => { set("text", ""); setTextInput(""); } }] : []),
  ];

  // ── Sidebar filter panel ──────────────────────────────────────────────────────
  // filterBody is just the scrollable sections; each container renders its own header.

  const filterBody = (
    <div>

        {/* Country */}
        <FilterSection title="Country" icon={MapPin}>
          <div className="space-y-1.5">
            {COUNTRIES.map((c) => {
              const active = filters.country === c.value;
              const cnt = c.code === "CA"
                ? fmtCount(liveCount("Canada", timeSeed, 100_000, 112_000))
                : fmtCount(liveCount("UnitedStates", timeSeed, 28_000, 33_000));
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => toggle("country", c.value)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    active
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200"
                      : "bg-white border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  <span className={`shrink-0 text-[10px] font-black w-7 text-center py-0.5 rounded-md ${
                    active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {c.code}
                  </span>
                  <span className="flex-1 text-left">{c.label}</span>
                  <span className={`text-[11px] tabular-nums font-medium ${active ? "text-blue-100" : "text-gray-400"}`}>{cnt}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Seniority */}
        <FilterSection title="Seniority Level" icon={Crown}>
          <div className="grid grid-cols-3 gap-1.5">
            {(["C-Suite", "VP", "Director"] as const).map((s) => {
              const SIcon = SENIORITY_ICONS[s];
              const active = filters.seniority === s;
              const colors: Record<string, string> = {
                "C-Suite":  active ? "bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-200" : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100",
                "VP":       active ? "bg-purple-600 border-purple-600 text-white shadow-sm shadow-purple-200" : "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100",
                "Director": active ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200" : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
              };
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle("seniority", s)}
                  className={`flex flex-col items-center gap-1.5 px-2 py-3.5 rounded-xl text-xs font-bold border transition-all ${colors[s]}`}
                >
                  <SIcon className="h-4 w-4" />
                  {s}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Workplace */}
        <FilterSection title="Workplace Type" icon={Globe2}>
          <div className="flex flex-col gap-1.5">
            {WORKPLACE_TYPES.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => toggle("workplace", w)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  filters.workplace === w
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-100"
                    : "bg-white border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50"
                }`}
              >
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
            <input
              value={industrySearch}
              onChange={(e) => { setIndustrySearch(e.target.value); setShowAllIndustries(false); }}
              placeholder="Search 43 industries…"
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
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
                  const cnt = fmtCount(liveCount(ind.key, timeSeed, 800, 4500));
                  const active = filters.industry === ind.key;
                  return (
                    <button
                      key={ind.key}
                      type="button"
                      onClick={() => toggle("industry", ind.key)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-center gap-2 ${
                        active
                          ? "bg-blue-600 text-white font-semibold"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${active ? "bg-white" : "bg-gray-300"}`} />
                      <span className="flex-1">{ind.label}</span>
                      <span className={`text-[10px] tabular-nums font-medium ${active ? "text-blue-100" : "text-gray-400"}`}>{cnt}</span>
                    </button>
                  );
                })}
                {filteredIndustries.length === 0 && (
                  <p className="text-gray-400 text-xs px-2 py-3 text-center">No match</p>
                )}
                {hidden > 0 && (
                  <button type="button" onClick={() => setShowAllIndustries(true)}
                    className="w-full text-left px-2.5 py-2 text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center gap-1.5">
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

        {/* Job Role */}
        <FilterSection title="Job Role" icon={Users2} defaultOpen={false}>
          <div className="relative mb-2.5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              value={roleSearch}
              onChange={(e) => { setRoleSearch(e.target.value); setExpandedRoleLevels({}); }}
              placeholder="Search 200+ roles…"
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>
          <div className="space-y-4">
            {Object.entries(filteredRoles).map(([level, roles]) => {
              const PREVIEW = 6;
              const LIcon = SENIORITY_ICONS[level] ?? Crown;
              const isSearching = roleSearch.length > 0;
              const isExpanded = !!expandedRoleLevels[level];
              const visible = isSearching || isExpanded ? (roles as string[]) : (roles as string[]).slice(0, PREVIEW);
              const hidden = !isSearching && !isExpanded ? Math.max(0, (roles as string[]).length - PREVIEW) : 0;
              const levelColors: Record<string, string> = {
                "C-Suite": "text-amber-600",
                "VP": "text-purple-600",
                "Director": "text-blue-600",
              };
              const levelBg: Record<string, string> = {
                "C-Suite": "bg-amber-50 border-amber-100",
                "VP": "bg-purple-50 border-purple-100",
                "Director": "bg-blue-50 border-blue-100",
              };
              return (
                <div key={level}>
                  <div className={`flex items-center gap-2 mb-2 px-2.5 py-1.5 rounded-lg border ${levelBg[level] ?? "bg-gray-50 border-gray-100"}`}>
                    <LIcon className={`h-3.5 w-3.5 ${levelColors[level] ?? "text-gray-400"}`} />
                    <span className={`text-[11px] font-black uppercase tracking-[0.12em] ${levelColors[level] ?? "text-gray-500"}`}>{level}</span>
                    <span className="ml-auto text-[10px] text-gray-400 font-medium">{(roles as string[]).length} roles</span>
                  </div>
                  <div className="space-y-0.5">
                    {visible.map((role) => {
                      const cnt = fmtCount(liveCount(role, timeSeed, 200, 1500));
                      const active = filters.role === role;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => selectRole(role)}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-center gap-2 ${
                            active
                              ? "bg-blue-600 text-white font-semibold"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${active ? "bg-white" : "bg-gray-300"}`} />
                          <span className="flex-1">{role}</span>
                          <span className={`text-[10px] tabular-nums font-medium ${active ? "text-blue-100" : "text-gray-400"}`}>{cnt}</span>
                        </button>
                      );
                    })}
                    {hidden > 0 && (
                      <button type="button" onClick={() => setExpandedRoleLevels((p) => ({ ...p, [level]: true }))}
                        className="w-full text-left px-2.5 py-2 text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center gap-1.5">
                        <ArrowRight className="h-3 w-3" /> +{hidden} more {level} roles
                      </button>
                    )}
                    {isExpanded && !isSearching && (roles as string[]).length > PREVIEW && (
                      <button type="button" onClick={() => setExpandedRoleLevels((p) => ({ ...p, [level]: false }))}
                        className="w-full text-left px-2.5 py-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                        Show less
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {Object.keys(filteredRoles).length === 0 && (
              <p className="text-gray-400 text-xs px-2 py-3 text-center">No match</p>
            )}
          </div>
        </FilterSection>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Hero search bar ── */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 pt-[64px]">
        <div className="max-w-3xl mx-auto px-5 pt-12 pb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-xs font-semibold mb-5 backdrop-blur-sm">
            <Crown className="h-3.5 w-3.5 text-amber-300" />
            Executive &amp; Senior Leadership Roles
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-2">
            Find Your Next Role
          </h1>
          <p className="text-blue-100 text-sm mb-8">
            {total > 0
              ? `${total.toLocaleString()} executive roles available right now`
              : "Over 100,000+ executive & senior leadership roles"}
          </p>

          <form onSubmit={submitText} className="flex gap-2 items-stretch shadow-xl shadow-blue-900/30">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  if (!e.target.value) setFilters((f) => ({ ...f, text: "", role: "" }));
                }}
                placeholder="Search by title, company, or keyword…"
                className="w-full h-full pl-12 pr-4 py-4 bg-white rounded-xl text-gray-900 placeholder:text-gray-400 text-base outline-none focus:ring-2 focus:ring-blue-300 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-gray-900 rounded-xl font-black text-sm transition-colors shrink-0 shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Active filter chips */}
          {chips.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-4">
              {chips.map((chip) => (
                <span key={chip.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/15 border border-white/25 text-white backdrop-blur-sm">
                  {chip.label}
                  <button type="button" aria-label="Remove filter" onClick={chip.clear}
                    className="hover:text-red-200 transition-colors">
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

      {/* ── Body ── */}
      <div className="max-w-[1340px] mx-auto px-4 py-6 flex gap-5 items-start">

        {/* Desktop sidebar — explicit h so h-full children work; min-h-0 on scroll div */}
        <aside className="hidden lg:flex flex-col w-[288px] shrink-0 sticky top-[72px] self-start bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm h-[calc(100vh-90px)]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 shrink-0">
            <span className="flex items-center gap-2 text-sm font-bold text-gray-800">
              <SlidersHorizontal className="h-4 w-4 text-blue-600" />
              Filters
              {chips.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-black">
                  {chips.length}
                </span>
              )}
            </span>
            {hasAnyFilter && (
              <button type="button" onClick={clearAll}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                Clear all
              </button>
            )}
          </div>
          {/* Scrollable body — min-h-0 is required for flex scroll to work */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {filterBody}
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
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
                {/* Mobile header */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 shrink-0">
                  <span className="flex items-center gap-2 font-bold text-gray-800 text-sm">
                    <SlidersHorizontal className="h-4 w-4 text-blue-600" />
                    Filters
                    {chips.length > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-black">
                        {chips.length}
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-3">
                    {hasAnyFilter && (
                      <button type="button" onClick={clearAll}
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                        Clear all
                      </button>
                    )}
                    <button type="button" onClick={() => setMobileSidebar(false)} aria-label="Close"
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {/* Scrollable body */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                  {filterBody}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Job list */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500 font-medium">
              {loading ? "Searching…" : total > 0 ? (
                <><span className="font-bold text-gray-900">{total.toLocaleString()}</span> roles found</>
              ) : null}
            </p>
            <button
              type="button"
              onClick={() => setMobileSidebar((p) => !p)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 text-sm font-semibold hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {chips.length > 0 && (
                <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                  {chips.length}
                </span>
              )}
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-36 gap-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
              <p className="text-gray-500 text-sm font-medium">Searching roles…</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-36">
              <div className="h-16 w-16 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-4">
                <Search className="h-7 w-7 text-gray-300" />
              </div>
              <p className="text-gray-700 text-base font-bold mb-1">No roles found</p>
              <p className="text-gray-400 text-sm mb-5">Try different keywords or remove a filter</p>
              {hasAnyFilter && (
                <button type="button" onClick={clearAll}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">
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
                    className="inline-flex items-center gap-2 px-12 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-600 font-semibold text-sm hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50 shadow-sm"
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
