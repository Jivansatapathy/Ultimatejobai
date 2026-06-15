import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Crown, TrendingUp, Users2, Briefcase, Search, ChevronRight,
  MapPin, Clock, ArrowRight, Flame,
} from "lucide-react";
import { API_BASE_URL } from "@/config";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SeniorJob {
  id: string;
  title: string;
  company_name: string;
  location: string;
  employment_type: string;
  seniority_level: string;
  industry: string;
  posted_at: string;
  apply_url: string;
  is_remote: boolean;
  workplace_type: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COLOR_RING = [
  { bg: "bg-blue-100",   icon: "text-blue-600",   border: "border-blue-200"   },
  { bg: "bg-violet-100", icon: "text-violet-600", border: "border-violet-200" },
  { bg: "bg-emerald-100",icon: "text-emerald-600",border: "border-emerald-200"},
  { bg: "bg-amber-100",  icon: "text-amber-600",  border: "border-amber-200"  },
  { bg: "bg-rose-100",   icon: "text-rose-600",   border: "border-rose-200"   },
  { bg: "bg-teal-100",   icon: "text-teal-600",   border: "border-teal-200"   },
  { bg: "bg-indigo-100", icon: "text-indigo-600", border: "border-indigo-200" },
  { bg: "bg-orange-100", icon: "text-orange-600", border: "border-orange-200" },
];

function companyColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0x7fffffff;
  return COLOR_RING[h % COLOR_RING.length];
}

function seniorityIcon(level: string) {
  const l = (level || "").toLowerCase();
  if (l.includes("c-suite") || l.includes("chief") || l.includes("ceo") || l.includes("cfo") || l.includes("cto"))
    return Crown;
  if (l.includes("vp") || l.includes("vice"))
    return TrendingUp;
  if (l.includes("director"))
    return Users2;
  return Briefcase;
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const CATEGORIES = [
  { label: "C-Suite",   icon: Crown,      href: "/find-jobs?seniority_level=C-Suite"  },
  { label: "VP Level",  icon: TrendingUp, href: "/find-jobs?seniority_level=VP"       },
  { label: "Director",  icon: Users2,     href: "/find-jobs?seniority_level=Director" },
  { label: "All Roles", icon: Briefcase,  href: "/find-jobs"                          },
];

// ─── Job card ─────────────────────────────────────────────────────────────────

function JobCard({ job, index }: { job: SeniorJob; index: number }) {
  const color = companyColor(job.company_name || "x");
  const Icon = seniorityIcon(job.seniority_level);
  const isNew = job.posted_at && Date.now() - new Date(job.posted_at).getTime() < 3 * 86_400_000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
    >
      <Link
        to={`/find-jobs`}
        className="group flex items-start gap-3 sm:gap-5 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 hover:shadow-md hover:border-blue-200 transition-all duration-200"
      >
        {/* Company icon — deterministic color + seniority icon */}
        <div className={`shrink-0 h-12 w-12 sm:h-16 sm:w-16 rounded-2xl border flex items-center justify-center ${color.bg} ${color.border}`}>
          <Icon className={`h-5 w-5 sm:h-7 sm:w-7 ${color.icon}`} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Company name + "NEW" badge */}
          <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
            <span className="text-blue-600 font-bold text-base sm:text-lg truncate">{job.company_name}</span>
            {isNew && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-600">
                <Flame className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> New
              </span>
            )}
          </div>

          {/* Job title */}
          <p className="text-gray-900 font-extrabold text-base sm:text-xl leading-snug mb-2 sm:mb-3 group-hover:text-blue-700 transition-colors line-clamp-2">
            {job.title}
          </p>

          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {job.seniority_level && (
              <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-500">
                {job.seniority_level}
              </span>
            )}
            {(job.employment_type || job.workplace_type) && (
              <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-bold uppercase tracking-wide text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                {job.employment_type || job.workplace_type}
              </span>
            )}
            {job.location && (
              <span className="flex items-center gap-1 text-xs sm:text-sm text-gray-400 font-medium">
                <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                {job.location.split(",")[0]}
              </span>
            )}
            {/* Date inline on mobile */}
            {job.posted_at && (
              <span className="sm:hidden flex items-center gap-1 text-xs text-gray-400 font-medium ml-auto">
                {timeAgo(job.posted_at)}
              </span>
            )}
          </div>
        </div>

        {/* Date + arrow — hidden on mobile, shown on sm+ */}
        <div className="shrink-0 hidden sm:flex flex-col items-end gap-3 ml-2">
          <span className="text-sm text-gray-400 font-medium whitespace-nowrap">
            {timeAgo(job.posted_at)}
          </span>
          <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export const LatestJobsV2 = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<SeniorJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const base = API_BASE_URL.replace(/\/$/, "");
    axios
      .get(`${base}/api/search/senior/?page_size=6&ordering=-posted_at`)
      .then(r => setJobs((r.data.results ?? r.data.jobs ?? []).slice(0, 6)))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/find-jobs${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ""}`);
  };

  return (
    <section className="bg-white py-12 sm:py-16 px-4 sm:px-6 border-t border-gray-100">
      <div className="mx-auto max-w-6xl">

        {/* Section title */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Latest{" "}
            <span className="relative inline-block text-blue-600">
              executive jobs
              <svg className="absolute -bottom-1 left-0 w-full" height="4" viewBox="0 0 200 4" fill="none" preserveAspectRatio="none">
                <path d="M0 3 Q100 0 200 3" stroke="#2563EB" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              </svg>
            </span>
          </h2>
          <Link
            to="/find-jobs"
            className="hidden sm:inline-flex items-center gap-1.5 text-base font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            View all jobs <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left — job list (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-[90px] rounded-2xl border border-gray-100 bg-gray-50 animate-pulse" />
              ))
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Briefcase className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No jobs found right now — check back soon.</p>
              </div>
            ) : (
              jobs.map((job, i) => <JobCard key={job.id} job={job} index={i} />)
            )}

            <div className="mt-2 sm:hidden text-center">
              <Link to="/find-jobs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                View all jobs <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right — sidebar (1/3 width) */}
          <div className="flex flex-col gap-5">

            {/* Search box */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-base font-bold text-gray-900 mb-3">Search jobs</p>
              <form onSubmit={handleSearch}>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:border-blue-400 focus-within:bg-white transition-all">
                  <Search className="h-4 w-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search for jobs"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 bg-transparent text-base text-gray-700 placeholder:text-gray-400 outline-none"
                  />
                </div>
              </form>
            </div>

            {/* Categories */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-base font-bold text-gray-900 mb-3">Categories</p>
              <ul className="space-y-1">
                {CATEGORIES.map(cat => (
                  <li key={cat.label}>
                    <Link
                      to={cat.href}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                    >
                      <span className="flex items-center gap-2.5">
                        <cat.icon className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        {cat.label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA card */}
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white">
              <p className="font-bold text-lg mb-1">Let Apex™ apply for you</p>
              <p className="text-blue-100 text-sm leading-relaxed mb-4">
                Your AI delegate fills and submits every application automatically — while you focus on leading.
              </p>
              <Link
                to="/auth?mode=signup"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white text-blue-700 font-bold text-xs px-4 py-2 hover:bg-blue-50 transition-colors"
              >
                Get started free <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
