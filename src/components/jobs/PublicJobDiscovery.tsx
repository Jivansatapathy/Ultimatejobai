import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bookmark,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronRight,
  Clock,
  Cpu,
  DollarSign,
  Globe2,
  GraduationCap,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
  Zap,
  Plus,
  Trash2,
  Wand2,
} from "lucide-react";
import { useResume } from "@/hooks/useResume";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

import {
  DefaultDiscoveryFilter,
  fetchJobFilterOptions,
  fetchJobLocationOptions,
  Job,
  JobSearchFilters,
  searchJobs,
  fetchAllCountries,
} from "@/services/jobService";
import { AutoApplyModal } from "@/components/jobs/AutoApplyModal";
import { JobDetailsSheet } from "@/components/jobs/JobDetailsSheet";
import { LoginRequiredModal } from "@/components/auth/LoginRequiredModal";

type DiscoveryMode = "landing" | "results";
type DiscoveryCard = DefaultDiscoveryFilter;
type CuratedLandingSection = {
  key: string;
  title: string;
  description: string;
  searchTerms: string[];
  filters: JobSearchFilters;
  icon: keyof typeof iconMap;
  accentClass: string;
};

const fallbackBrowseCards: DiscoveryCard[] = [
  { label: "Remote", icon: "globe", filters: { workplace_type: "remote" }, count: 0 },
  { label: "Analytics", icon: "chart", filters: { department: "analytics" }, count: 0 },
  { label: "Internship", icon: "graduation", filters: { employment_type: "internship" }, count: 0 },
  { label: "Data Science", icon: "cpu", filters: { department: "data science" }, count: 0 },
  { label: "Engineering", icon: "briefcase", filters: { department: "engineering" }, count: 0 },
  { label: "HR", icon: "users", filters: { department: "hr" }, count: 0 },
];

const normalizeValue = (value?: string) => (value || "").trim().toLowerCase();

const findOptionCount = (
  options: Array<{ value: string; label: string; count: number }>,
  target: string,
) => {
  const normalizedTarget = normalizeValue(target);
  const exact = options.find(
    (option) =>
      normalizeValue(option.value) === normalizedTarget ||
      normalizeValue(option.label) === normalizedTarget,
  );
  if (exact) return exact.count;

  const partial = options.find(
    (option) =>
      normalizeValue(option.value).includes(normalizedTarget) ||
      normalizeValue(option.label).includes(normalizedTarget) ||
      normalizedTarget.includes(normalizeValue(option.value)) ||
      normalizedTarget.includes(normalizeValue(option.label)),
  );
  return partial?.count ?? 0;
};

const iconMap = {
  globe: Globe2,
  chart: BarChart3,
  graduation: GraduationCap,
  cpu: Cpu,
  users: Users,
  briefcase: Briefcase,
  building: Building2,
  sparkles: Sparkles,
} as const;

const curatedLandingSections: CuratedLandingSection[] = [
  {
    key: "fashion",
    title: "Fashion Jobs",
    description: "Designer, stylist, merchandiser, luxury retail, and fashion brand openings.",
    searchTerms: ["Fashion Designer", "Stylist", "Merchandiser"],
    filters: { title: "fashion" },
    icon: "sparkles",
    accentClass: "from-rose-50 to-orange-50 border-rose-100",
  },
  {
    key: "actor",
    title: "Actor Jobs",
    description: "Acting, casting, performance, and talent-facing opportunities.",
    searchTerms: ["Actor", "Actress", "Casting"],
    filters: { title: "actor" },
    icon: "users",
    accentClass: "from-amber-50 to-yellow-50 border-amber-100",
  },
  {
    key: "film-world",
    title: "Film World Jobs",
    description: "Film production, direction, editing, and media crew roles.",
    searchTerms: ["Film", "Production", "Video Editor"],
    filters: { title: "film" },
    icon: "briefcase",
    accentClass: "from-violet-50 to-fuchsia-50 border-violet-100",
  },
  {
    key: "senior",
    title: "Senior Jobs",
    description: "Senior specialist, lead, principal, and leadership-track roles.",
    searchTerms: ["Senior", "Lead", "Principal"],
    filters: { title: "senior" },
    icon: "chart",
    accentClass: "from-sky-50 to-cyan-50 border-sky-100",
  },
  {
    key: "ceo",
    title: "CEO Jobs",
    description: "CEO, founder office, chief executive, and top executive openings.",
    searchTerms: ["CEO", "Chief Executive Officer", "Founder Office"],
    filters: { title: "CEO" },
    icon: "building",
    accentClass: "from-emerald-50 to-teal-50 border-emerald-100",
  },
];

interface PublicJobDiscoveryProps {
  mode?: DiscoveryMode;
}

export function PublicJobDiscovery({ mode = "results" }: PublicJobDiscoveryProps) {
  const { isAuthenticated } = useAuth();
  const { activeResume } = useResume();
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingMode = mode === "landing";

  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savedJobs, setSavedJobs] = useState<(string | number)[]>([]);
  const [sortBy] = useState("Best Match");
  const [totalResults, setTotalResults] = useState(0);
  const [autoApplyJob, setAutoApplyJob] = useState<Job | null>(null);
  const [autoApplyOpen, setAutoApplyOpen] = useState(false);
  const [selectedDetailsJob, setSelectedDetailsJob] = useState<Job | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [loginPromptCopy, setLoginPromptCopy] = useState({
    title: "Login to continue",
    description: "Sign in to view full job details, save jobs, and start applying with confidence.",
  });
  const CLEAN_FILTERS: JobSearchFilters = {
    title: "",
    department: "",
    location: "",
    employment_type: "",
    workplace_type: "",
    country: "",
    city: "",
  };
  const [filters, setFilters] = useState<JobSearchFilters>(CLEAN_FILTERS);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [discoveryCountryOptions, setDiscoveryCountryOptions] = useState<string[]>([]);
  const [filterCountryOptions, setFilterCountryOptions] = useState<Array<{ value: string; label: string; count: number }>>([]);
  const [cityOptions, setCityOptions] = useState<Array<{ value: string; label: string; count: number }>>([]);
  const [cityMap, setCityMap] = useState<Record<string, string[]>>({});
  const [departmentOptions, setDepartmentOptions] = useState<Array<{ value: string; label: string; count: number }>>([]);
  const [employmentOptions, setEmploymentOptions] = useState<Array<{ value: string; label: string; count: number }>>([]);
  const [workplaceOptions, setWorkplaceOptions] = useState<Array<{ value: string; label: string; count: number }>>([]);
  const [browseCards, setBrowseCards] = useState<DiscoveryCard[]>([]);
  const [curatedLandingJobs, setCuratedLandingJobs] = useState<Record<string, Job[]>>({});
  const [isLoadingCuratedLandingJobs, setIsLoadingCuratedLandingJobs] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isLoadingFilterOptions, setIsLoadingFilterOptions] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const parseDate = (dateStr: string) => {
    const now = new Date();
    const num = parseInt(dateStr.match(/\d+/)?.[0] || "0");
    if (dateStr.includes("hour")) return new Date(now.getTime() - num * 60 * 60 * 1000);
    if (dateStr.includes("day")) return new Date(now.getTime() - num * 24 * 60 * 60 * 1000);
    if (dateStr.includes("week")) return new Date(now.getTime() - num * 7 * 24 * 60 * 60 * 1000);
    if (dateStr.includes("month")) return new Date(now.getTime() - num * 30 * 24 * 60 * 60 * 1000);
    return now;
  };

  const sortJobs = (jobList: Job[], criteria: string) => {
    const list = [...jobList];
    if (criteria === "Most Recent") return list.sort((a, b) => parseDate(b.posted).getTime() - parseDate(a.posted).getTime());
    if (criteria === "Highest Salary") {
      const getSalaryValue = (s?: string) => (s?.match(/\d+/g) ? parseInt(s.match(/\d+/g)!.slice(-1)[0]) : 0);
      return list.sort((a, b) => getSalaryValue(b.salary) - getSalaryValue(a.salary));
    }
    return list.sort((a, b) => b.match - a.match);
  };

  const isFiltered = searchQuery.trim() !== "" || Object.values(filters).some(v => v !== "");

  const promptLogin = (title: string, description: string) => {
    setLoginPromptCopy({ title, description });
    setLoginPromptOpen(true);
  };

  const navigateToJobs = (nextQuery: string, nextFilters: JobSearchFilters, isPrimary: boolean = false) => {
    const params = new URLSearchParams();
    
    if (isPrimary) {
      params.set("primary_search", "true");
    }
    
    if (nextQuery.trim()) params.set("search", nextQuery.trim());
    if (nextFilters.title?.trim()) params.set("title", nextFilters.title.trim());
    if (nextFilters.department?.trim()) params.set("department", nextFilters.department.trim());
    if (nextFilters.location?.trim()) params.set("location", nextFilters.location.trim());
    if (nextFilters.employment_type?.trim()) params.set("employment_type", nextFilters.employment_type.trim());
    if (nextFilters.workplace_type?.trim()) {
      params.set("workplace_type", nextFilters.workplace_type.trim());
      if (nextFilters.workplace_type.trim().toLowerCase() === "remote") params.set("is_remote", "true");
    }
    if (nextFilters.country?.trim()) params.set("country", nextFilters.country.trim());
    if (nextFilters.city?.trim()) params.set("city", nextFilters.city.trim());
    
    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const fetchJobs = useCallback(async (query: string = "", currentFilters: JobSearchFilters = filters, p: number = 1, append: boolean = false) => {
    if (isLandingMode) return;

    if (append) setIsLoadingMore(true);
    else {
      setIsRefreshing(true);
      setIsLoadingFilterOptions(true);
    }

    try {
      const jobsPromise = searchJobs(query, p, { ...currentFilters, page_size: 10 });
      const optionsPromise = append ? Promise.resolve(null) : fetchJobFilterOptions(query, currentFilters);
      const [{ jobs: newJobs, hasNext, totalResults: total }, filterOptions] = await Promise.all([jobsPromise, optionsPromise]);

      if (append) {
        if (newJobs.length > 0) {
          setJobs((prev) => [...prev, ...newJobs]);
          setPage(p);
        }
      } else {
        setJobs(sortJobs(newJobs, sortBy));
        setPage(1);
        if (filterOptions) {
          setDepartmentOptions(filterOptions.departments);
          setEmploymentOptions(filterOptions.employmentTypes);
          setWorkplaceOptions(filterOptions.workplaceTypes);
          setBrowseCards(filterOptions.defaultFilters);
        }
      }

      setHasNextPage(hasNext);
      setTotalResults(total || (append ? jobs.length + newJobs.length : newJobs.length));
    } catch (error: any) {
      toast.error("Failed to fetch jobs: " + (error.response?.data?.message || error.message));
    } finally {
      setIsRefreshing(false);
      setIsLoadingMore(false);
      setIsLoadingFilterOptions(false);
    }
  }, [filters, isLandingMode, jobs.length, sortBy]);

  const resetFilters = () => {
    const cleared = {
      title: "",
      department: "",
      location: "",
      employment_type: "",
      workplace_type: "",
      country: "",
      city: "",
    };
    setSearchQuery("");
    setFilters(cleared);
    navigateToJobs("", cleared);
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setIsLoadingFilterOptions(true);
      try {
        const options = await fetchJobFilterOptions(searchQuery, filters);
        if (!mounted) return;
        setDepartmentOptions(options.departments);
        setEmploymentOptions(options.employmentTypes);
        setWorkplaceOptions(options.workplaceTypes);
        setFilterCountryOptions(options.countries);
        setCityOptions(options.cities);
        setBrowseCards(options.defaultFilters);
      } finally {
        if (mounted) setIsLoadingFilterOptions(false);
      }
    };

    run();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filters.country]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setIsLoadingLocations(true);
      try {
        const [options, fullCountries] = await Promise.all([
          fetchJobLocationOptions(),
          fetchAllCountries()
        ]);
        if (!mounted) return;
        const popularCountries = ["United States", "United Kingdom", "Canada", "India", "Germany", "France", "Singapore"];
        const others = fullCountries
          .map(c => c.name)
          .filter(name => !popularCountries.includes(name));
        
        // Discovery: Show EVERYTHING
        setDiscoveryCountryOptions(Array.from(new Set([...popularCountries, ...others])));
        
        // Filter Sidebar: ONLY show countries that have active jobs in the DB
        // (This is now redundant since useEffect above handles it, but keeping it for initial load)
        if (filterCountryOptions.length === 0) {
          const dbCountries = fullCountries
            .filter(c => c.has_jobs || c.job_count > 0)
            .map(c => ({ value: c.name, label: c.name, count: c.job_count }));
          setFilterCountryOptions(dbCountries);
        }

        setCityMap(options.cityMap);
      } finally {
        if (mounted) setIsLoadingLocations(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!isLandingMode) return;

    let mounted = true;

    const run = async () => {
      setIsLoadingCuratedLandingJobs(true);
      try {
        const responses = await Promise.all(
          curatedLandingSections.map((section) =>
            searchJobs("", 1, { ...section.filters, page_size: 4 }),
          ),
        );

        if (!mounted) return;

        const nextEntries = curatedLandingSections.map((section, index) => [
          section.key,
          responses[index].jobs.slice(0, 4),
        ] as const);

        setCuratedLandingJobs(Object.fromEntries(nextEntries));
      } catch {
        if (mounted) setCuratedLandingJobs({});
      } finally {
        if (mounted) setIsLoadingCuratedLandingJobs(false);
      }
    };

    run();
    return () => { mounted = false; };
  }, [isLandingMode, location.search]);

  // Legacy city validation based on static map removed to allow dynamic backend cities to load reliably.

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initial = {
      title: params.get("title") || "",
      department: params.get("department") || "",
      location: params.get("location") || "",
      employment_type: params.get("employment_type") || "",
      workplace_type: params.get("workplace_type") || (params.get("is_remote") === "true" ? "remote" : ""),
      country: params.get("country") || "",
      city: params.get("city") || "",
    };
    setSearchQuery(params.get("search") || "");
    setFilters(initial);

    const isPrimary = params.get("primary_search") === "true";
    if (!isLandingMode) {
      fetchJobs(params.get("search") || "", { ...initial, primary_search: isPrimary ? "true" : "false" } as any, 1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLandingMode, location.search]);

  const observerTarget = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isLandingMode) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isLoadingMore && !isRefreshing) {
        fetchJobs(searchQuery, filters, page + 1, true);
      }
    }, { threshold: 0.1, rootMargin: "100px" });
    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [fetchJobs, filters, hasNextPage, isLandingMode, isLoadingMore, isRefreshing, page, searchQuery]);

  const handlePrimarySearch = () => {
    // Top bar is for Discovery. We allow fallback if a query is present.
    const isPrimary = searchQuery.trim().length > 0;
    navigateToJobs(searchQuery, filters, isPrimary);
  };

  const handleSidebarFilterSubmit = () => {
    navigateToJobs(searchQuery, filters, false);
  };

  const handleBrowseCardSelect = (card: DiscoveryCard) => {
    const next = { ...filters, ...card.filters };
    setFilters(next);
    navigateToJobs(searchQuery, next);
  };

  const handleCuratedSectionSelect = (section: CuratedLandingSection, term?: string) => {
    const nextQuery = term || "";
    const nextFilters = {
      ...filters,
      ...section.filters,
      title: term || section.filters.title || "",
    };

    setSearchQuery(nextQuery);
    setFilters(nextFilters);
    navigateToJobs(nextQuery, nextFilters);
  };

  const toggleSave = (jobId: string | number) => {
    if (!isAuthenticated) {
      promptLogin("Login to save jobs", "Create an account to save jobs, track them, and come back to them anytime.");
      return;
    }
    setSavedJobs((prev) => prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]);
  };

  const openJobDetails = (job: Job) => {
    if (!isAuthenticated) {
      promptLogin("Login to view job details", "Sign in to unlock full job descriptions, application links, and job-by-job actions.");
      return;
    }
    setSelectedDetailsJob(job);
    setDetailsOpen(true);
  };

  const renderJobCard = (job: Job, index: number) => (
    <motion.div key={`${job.id}-${index}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * (index % 10) }} className={`rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.35)] relative ${job.source === 'employer' ? 'border-blue-100 ring-1 ring-blue-50' : ''}`}>
      {job.source === 'employer' ? (
        <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-700 border border-teal-100">
          <Zap className="h-3 w-3 fill-current" />
          Verified
        </div>
      ) : (
        <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-100">
          <Globe2 className="h-3 w-3" />
          External Discovery
        </div>
      )}
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-slate-50 border border-slate-100 shadow-sm"><Building2 className="h-8 w-8 text-slate-700" /></div>
          <div className="min-w-0">
            <button type="button" className="text-left text-2xl font-black text-slate-900 tracking-tight hover:text-teal-700 transition-colors" onClick={() => openJobDetails(job)}>{job.title}</button>
            {job.company_slug ? (
              <button
                type="button"
                className="block mt-1 text-lg font-bold text-slate-500 transition hover:text-teal-700"
                onClick={() => navigate(`/companies/${job.company_slug}`)}
              >
                {job.company}
              </button>
            ) : (
              <p className="mt-1 text-lg font-bold text-slate-500">{job.company}</p>
            )}
            <div className="mt-5 flex flex-wrap gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{job.location}</div>
              <div className="flex items-center gap-2"><DollarSign className="h-3.5 w-3.5" />{job.salary}</div>
              <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" />{job.posted}</div>
            </div>
            {isAuthenticated && job.match_reason ? (
              <p className="mt-4 max-w-2xl text-[13px] font-medium text-slate-500 leading-relaxed">{job.match_reason}</p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3 xl:justify-end">
          <Button variant="ghost" size="icon" onClick={() => toggleSave(job.id)} className={`h-11 w-11 rounded-xl border ${savedJobs.includes(job.id) ? "border-teal-200 bg-teal-50 text-teal-700" : "border-slate-100 bg-white text-slate-400 hover:text-slate-600"}`}><Bookmark className={`h-5 w-5 ${savedJobs.includes(job.id) ? "fill-current" : ""}`} /></Button>
          {job.hasEmail && <Button variant="hero" size="sm" className="h-11 gap-2 rounded-xl px-6 font-bold" onClick={() => { if (!isAuthenticated) { promptLogin("Login to apply", "Sign in to start applying, save your progress, and unlock guided job actions."); return; } setAutoApplyJob(job); setAutoApplyOpen(true); }}><Zap className="h-4 w-4" />Auto Apply</Button>}
          <Button variant="outline" size="sm" className="h-11 rounded-xl px-6 font-black uppercase tracking-widest text-[10px] border-slate-200" onClick={() => openJobDetails(job)}>View Details</Button>
        </div>
      </div>
    </motion.div>
  );

  const renderFilters = () => (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.35)] xl:sticky xl:top-24">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Search Engine</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900 tracking-tight">Refine Results</h3>
        </div>
        <button type="button" onClick={resetFilters} className="text-[10px] font-black text-slate-400 hover:text-teal-600 transition-colors uppercase tracking-[0.15em]">Reset All</button>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Search Keywords</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              value={filters.title || ""} 
              onChange={(e) => setFilters((p) => ({ ...p, title: e.target.value }))} 
              placeholder="Design, Engineering, etc..." 
              className="w-full rounded-[20px] border border-slate-100 bg-slate-50/50 py-4 pl-11 pr-4 text-sm font-bold text-slate-950 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 focus:bg-white transition-all shadow-sm" 
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Department</label>
          <select 
            value={filters.department || ""} 
            onChange={(e) => setFilters((p) => ({ ...p, department: e.target.value }))} 
            className="w-full rounded-[20px] border border-slate-100 bg-slate-50/50 px-4 py-4 text-sm font-bold text-slate-950 outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 focus:bg-white transition-all appearance-none cursor-pointer shadow-sm"
          >
            <option value="">All Categories</option>
            {departmentOptions.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Engagement</label>
          <select 
            value={filters.employment_type || ""} 
            onChange={(e) => setFilters((p) => ({ ...p, employment_type: e.target.value }))} 
            className="w-full rounded-[20px] border border-slate-100 bg-slate-50/50 px-4 py-4 text-sm font-bold text-slate-950 outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 focus:bg-white transition-all appearance-none cursor-pointer shadow-sm"
          >
            <option value="">Any Type</option>
            {employmentOptions.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Location</label>
          <select 
            value={filters.country || ""} 
            onChange={(e) => setFilters((p) => ({ ...p, country: e.target.value, city: "" }))} 
            disabled={isLoadingLocations} 
            className="w-full rounded-[20px] border border-slate-100 bg-slate-50/50 px-4 py-4 text-sm font-bold text-slate-950 outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 focus:bg-white transition-all appearance-none cursor-pointer shadow-sm"
          >
            <option value="">{isLoadingLocations ? "Loading..." : "Everywhere"}</option>
            {(filterCountryOptions || []).map((country) => (
              <option key={`country-${country.value}`} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </div>

        <Button 
          type="button" 
          className="mt-6 w-full h-16 rounded-[24px] bg-slate-950 hover:bg-slate-900 text-white font-black uppercase tracking-[0.25em] text-xs shadow-[0_20px_40px_-15px_rgba(15,23,42,0.4)] transition-all active:scale-[0.97] hover:-translate-y-0.5" 
          onClick={handleSidebarFilterSubmit}
        >
          {isLandingMode ? "Find Matches" : "Update Results"}
        </Button>
      </div>
    </div>
  );

  const activeCards = browseCards.length ? browseCards : fallbackBrowseCards;
  const resolvedCards = browseCards.length
    ? browseCards
    : fallbackBrowseCards.map((card) => {
        let count = 0;
        if (card.filters.workplace_type) {
          count = findOptionCount(workplaceOptions, card.filters.workplace_type);
        } else if (card.filters.department) {
          count = findOptionCount(departmentOptions, card.filters.department);
        } else if (card.filters.employment_type) {
          count = findOptionCount(employmentOptions, card.filters.employment_type);
        }
        return { ...card, count };
      });
  const showDiscoveryCards = !isAuthenticated && activeCards.length > 0;
  const renderCuratedShortcutBox = () => (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.35)] xl:sticky xl:top-24">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Special Categories</p>
        <h3 className="mt-1 text-lg font-semibold text-slate-900">Quick Job Picks</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Jump into curated searches for niche and senior-level roles.
        </p>
      </div>

      <div className="space-y-4">
        {curatedLandingSections.map((section) => {
          const Icon = iconMap[section.icon] || Briefcase;
          return (
            <div key={section.key} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <button
                type="button"
                onClick={() => handleCuratedSectionSelect(section)}
                className="flex w-full items-start gap-3 text-left"
              >
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{section.title}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">{section.description}</p>
                </div>
              </button>

              <div className="mt-3 flex flex-wrap gap-2">
                {section.searchTerms.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleCuratedSectionSelect(section, term)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700 hover:bg-teal-50"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <main className={isLandingMode ? "pt-16 bg-white" : "pt-16 bg-white"}>

        {/* ── Hero Section (landing only) ── */}
        {isLandingMode && (
          <section className="bg-white px-4 pt-14 pb-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Job Search
              </p>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 md:text-6xl leading-tight">
                Find your{" "}
                <span className="text-teal-600">dream job</span>{" "}
                now
              </h1>
              <p className="mt-5 text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
                Search thousands of roles, explore curated categories, and sign up to unlock AI-powered tools.
              </p>
            </div>

            {/* Search Bar */}
            <form
              onSubmit={(e) => { e.preventDefault(); handlePrimarySearch(); }}
              className="mx-auto mt-8 max-w-2xl flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Job title, skill, or keyword…"
                  className="w-full rounded-xl bg-slate-50 py-3 pl-10 pr-9 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <Button
                type="submit"
                className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold px-7 py-3 h-auto shrink-0"
              >
                {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
            </form>

            {/* Quick-filter tags & Magic Search */}
            <div className="mx-auto mt-5 max-w-2xl flex flex-wrap justify-center gap-2 items-center">
              {isAuthenticated && activeResume?.targetJobRole && (
                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => {
                    setSearchQuery(activeResume.targetJobRole || "");
                    navigateToJobs(activeResume.targetJobRole || "", filters, true);
                  }}
                  className="rounded-full bg-slate-900 border-slate-800 text-white hover:bg-slate-800 px-4 py-1.5 h-auto text-xs gap-2"
                >
                  <Wand2 className="h-3 w-3 text-teal-400" />
                  Match My Profile: {activeResume.targetJobRole}
                </Button>
              )}
              {["Remote", "Full-time", "Engineering", "Data Science", "Marketing"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => navigateToJobs(tag, { ...filters, title: tag })}
                  className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Browse Categories (landing only) ── */}
        {isLandingMode && showDiscoveryCards && (
          <section className="bg-[#0f0e0e] px-6 py-20">
            <div className="mx-auto max-w-6xl">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-orange-400 mb-4">
                    Categories
                  </span>
                  <h2 className="text-2xl font-black text-white tracking-tight">Browse by category</h2>
                </div>
                <p className="text-sm text-slate-500 max-w-xs sm:text-right">
                  Explore live openings by field — updated continuously.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {(isLoadingFilterOptions && !resolvedCards.length ? Array(6).fill({}) : (resolvedCards || []).slice(0, 6)).map((card, idx) => {
                  const Icon = card.icon ? (iconMap[card.icon as keyof typeof iconMap] || Briefcase) : Briefcase;
                  const isLoading = isLoadingFilterOptions;

                  return (
                    <motion.button
                      key={card.label || idx}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.04 }}
                      type="button"
                      onClick={() => card.label && handleBrowseCardSelect(card)}
                      disabled={isLoading}
                      className="group flex flex-col items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 text-center hover:border-orange-500/30 hover:bg-orange-500/5 transition-all duration-300"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 group-hover:border-orange-500/30 group-hover:bg-orange-500/10 transition-all duration-300">
                        {isLoading && !card.icon ? (
                          <div className="h-5 w-5 rounded-full bg-white/10 animate-pulse" />
                        ) : (
                          <Icon className="h-5 w-5 text-slate-400 group-hover:text-orange-400 transition-colors duration-300" />
                        )}
                      </div>

                      <div className="w-full">
                        {isLoading && !card.label ? (
                          <div className="h-4 w-16 bg-white/5 rounded-full mx-auto animate-pulse mb-1.5" />
                        ) : (
                          <p className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors leading-tight">{card.label}</p>
                        )}
                        {isLoading ? (
                          <div className="h-3 w-10 bg-white/5 rounded-full mx-auto mt-1.5 animate-pulse" />
                        ) : (
                          <p className="text-[10px] text-slate-600 font-semibold mt-1 uppercase tracking-wider">
                            {card.count ?? 0} roles
                          </p>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Curated Sections (landing only) ── */}
        {isLandingMode && (
          <>
            {/* ── Curated Roles ── */}
            <section className="relative overflow-hidden bg-[#0a0f1e] px-4 py-24">
              {/* Atmospheric background glows */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 left-1/4 h-[600px] w-[600px] rounded-full bg-violet-700/20 blur-[140px]" />
                <div className="absolute top-1/2 right-0 h-[400px] w-[400px] rounded-full bg-teal-500/15 blur-[120px]" />
                <div className="absolute bottom-0 left-0 h-[350px] w-[350px] rounded-full bg-rose-600/10 blur-[100px]" />
                <div
                  className="absolute inset-0 opacity-[0.025]"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
                />
              </div>

              <div className="relative mx-auto max-w-7xl">
                {/* Section header */}
                <motion.div
                  className="text-center mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold tracking-widest text-slate-400 uppercase backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
                    </span>
                    Live Curated Collections
                  </div>
                  <h2 className="text-5xl font-black tracking-tight text-white sm:text-6xl md:text-7xl">
                    Explore{" "}
                    <span className="relative inline-block">
                      <span className="bg-gradient-to-r from-teal-400 via-violet-400 to-rose-400 bg-clip-text text-transparent">
                        curated
                      </span>
                      <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-teal-400/50 via-violet-400/50 to-rose-400/50" />
                    </span>{" "}
                    roles
                  </h2>
                  <p className="mt-5 text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
                    Handpicked categories with live openings — from senior leadership to creative industries.
                  </p>
                </motion.div>

                {/* Bento grid */}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
                  {curatedLandingSections.map((section, idx) => {
                    const Icon = iconMap[section.icon] || Briefcase;
                    const sectionJobs = curatedLandingJobs[section.key] || [];

                    const palette = [
                      {
                        glow: "bg-rose-500/25",
                        border: "border-rose-500/20 hover:border-rose-400/40",
                        iconBg: "bg-rose-500/15",
                        iconText: "text-rose-300",
                        accent: "text-rose-400",
                        gradOverlay: "from-rose-600/10 via-transparent to-transparent",
                        pill: "border-rose-500/25 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:border-rose-400/40",
                        jobHover: "hover:bg-rose-500/8 hover:border-rose-500/20",
                        avatarBg: "bg-rose-500/20 text-rose-300",
                        matchBg: "bg-rose-500/15 text-rose-300 border-rose-500/20",
                        viewBtn: "from-rose-500/20 to-rose-600/10 border-rose-500/20 hover:border-rose-400/40 text-rose-300 hover:text-rose-200",
                        colSpan: "xl:col-span-5",
                      },
                      {
                        glow: "bg-amber-500/25",
                        border: "border-amber-500/20 hover:border-amber-400/40",
                        iconBg: "bg-amber-500/15",
                        iconText: "text-amber-300",
                        accent: "text-amber-400",
                        gradOverlay: "from-amber-600/10 via-transparent to-transparent",
                        pill: "border-amber-500/25 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400/40",
                        jobHover: "hover:bg-amber-500/8 hover:border-amber-500/20",
                        avatarBg: "bg-amber-500/20 text-amber-300",
                        matchBg: "bg-amber-500/15 text-amber-300 border-amber-500/20",
                        viewBtn: "from-amber-500/20 to-amber-600/10 border-amber-500/20 hover:border-amber-400/40 text-amber-300 hover:text-amber-200",
                        colSpan: "xl:col-span-7",
                      },
                      {
                        glow: "bg-violet-500/25",
                        border: "border-violet-500/20 hover:border-violet-400/40",
                        iconBg: "bg-violet-500/15",
                        iconText: "text-violet-300",
                        accent: "text-violet-400",
                        gradOverlay: "from-violet-600/10 via-transparent to-transparent",
                        pill: "border-violet-500/25 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:border-violet-400/40",
                        jobHover: "hover:bg-violet-500/8 hover:border-violet-500/20",
                        avatarBg: "bg-violet-500/20 text-violet-300",
                        matchBg: "bg-violet-500/15 text-violet-300 border-violet-500/20",
                        viewBtn: "from-violet-500/20 to-violet-600/10 border-violet-500/20 hover:border-violet-400/40 text-violet-300 hover:text-violet-200",
                        colSpan: "xl:col-span-4",
                      },
                      {
                        glow: "bg-sky-500/25",
                        border: "border-sky-500/20 hover:border-sky-400/40",
                        iconBg: "bg-sky-500/15",
                        iconText: "text-sky-300",
                        accent: "text-sky-400",
                        gradOverlay: "from-sky-600/10 via-transparent to-transparent",
                        pill: "border-sky-500/25 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 hover:border-sky-400/40",
                        jobHover: "hover:bg-sky-500/8 hover:border-sky-500/20",
                        avatarBg: "bg-sky-500/20 text-sky-300",
                        matchBg: "bg-sky-500/15 text-sky-300 border-sky-500/20",
                        viewBtn: "from-sky-500/20 to-sky-600/10 border-sky-500/20 hover:border-sky-400/40 text-sky-300 hover:text-sky-200",
                        colSpan: "xl:col-span-4",
                      },
                      {
                        glow: "bg-emerald-500/25",
                        border: "border-emerald-500/20 hover:border-emerald-400/40",
                        iconBg: "bg-emerald-500/15",
                        iconText: "text-emerald-300",
                        accent: "text-emerald-400",
                        gradOverlay: "from-emerald-600/10 via-transparent to-transparent",
                        pill: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400/40",
                        jobHover: "hover:bg-emerald-500/8 hover:border-emerald-500/20",
                        avatarBg: "bg-emerald-500/20 text-emerald-300",
                        matchBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
                        viewBtn: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 hover:border-emerald-400/40 text-emerald-300 hover:text-emerald-200",
                        colSpan: "xl:col-span-4",
                      },
                    ];

                    const p = palette[idx % palette.length];

                    return (
                      <motion.div
                        key={section.key}
                        initial={{ opacity: 0, y: 32, scale: 0.97 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.55, delay: idx * 0.09, ease: [0.22, 1, 0.36, 1] }}
                        className={`group relative flex flex-col overflow-hidden rounded-2xl border ${p.border} bg-white/[0.03] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)] ${p.colSpan}`}
                      >
                        {/* Corner glow */}
                        <div className={`pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full blur-3xl opacity-70 ${p.glow}`} />
                        {/* Gradient overlay */}
                        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${p.gradOverlay}`} />

                        {/* Card body */}
                        <div className="relative flex flex-col flex-1 p-6">
                          {/* Header row */}
                          <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-3.5">
                              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${p.iconBg}`}>
                                <Icon className={`h-6 w-6 ${p.iconText}`} />
                              </div>
                              <div>
                                <h3 className="text-lg font-black text-white tracking-tight leading-tight">{section.title}</h3>
                                <span className={`text-xs font-semibold ${p.accent} mt-0.5 block`}>
                                  {isLoadingCuratedLandingJobs ? (
                                    <span className="inline-flex items-center gap-1"><Loader2 className="h-2.5 w-2.5 animate-spin" /> loading…</span>
                                  ) : (
                                    `${sectionJobs.length > 0 ? sectionJobs.length : "0"}+ live openings`
                                  )}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleBrowseCardSelect({ label: section.title, icon: section.icon, filters: section.filters, count: sectionJobs.length })}
                              className="shrink-0 flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                            >
                              View all <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>

                          <p className="text-xs text-slate-500 mb-5 leading-relaxed">{section.description}</p>

                          {/* Search term pills */}
                          <div className="flex flex-wrap gap-1.5 mb-6">
                            {section.searchTerms.map((term) => (
                              <button
                                key={term}
                                type="button"
                                onClick={() => navigateToJobs(term, { ...filters, title: term })}
                                className={`rounded-full border px-3.5 py-1 text-[11px] font-semibold transition-all active:scale-95 ${p.pill}`}
                              >
                                {term}
                              </button>
                            ))}
                          </div>

                          {/* Divider */}
                          <div className="mb-4 h-px bg-white/[0.06]" />

                          {/* Job rows */}
                          <div className="flex flex-col gap-2 flex-1">
                            {isLoadingCuratedLandingJobs ? (
                              <div className="flex flex-col gap-2 py-2">
                                {[1, 2, 3].map((i) => (
                                  <div key={i} className="h-14 w-full rounded-xl bg-white/5 border border-white/5 animate-pulse flex items-center px-3.5 gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-white/5" />
                                    <div className="flex-1 space-y-2">
                                      <div className="h-2 w-24 bg-white/5 rounded" />
                                      <div className="h-1.5 w-16 bg-white/5 rounded" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : sectionJobs.length > 0 ? (
                              sectionJobs.slice(0, 3).map((job) => (
                                <button
                                  key={`${section.key}-${job.id}`}
                                  type="button"
                                  onClick={() => navigateToJobs(job.title, { ...filters, title: job.title })}
                                  className={`group/job w-full rounded-xl border border-white/[0.05] bg-white/[0.03] px-3.5 py-3 text-left transition-all duration-200 ${p.jobHover}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${p.avatarBg}`}>
                                      {(job.company || "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-bold text-slate-100 line-clamp-1 group-hover/job:text-white transition-colors">
                                        {job.title}
                                      </p>
                                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                        {job.company}{job.location ? ` · ${job.location}` : ""}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="flex flex-1 items-center justify-center py-8">
                                <p className="text-xs text-slate-600 text-center">No live openings right now.<br />Click to search.</p>
                              </div>
                            )}
                          </div>

                          {/* Bottom CTA */}
                          <button
                            type="button"
                            onClick={() => handleBrowseCardSelect({ label: section.title, icon: section.icon, filters: section.filters, count: sectionJobs.length })}
                            className={`mt-5 w-full flex items-center justify-center gap-1.5 rounded-xl border bg-gradient-to-r px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-[0.98] ${p.viewBtn}`}
                          >
                            Browse all {section.title}
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ── CTA Strip ── */}
            <section className="relative overflow-hidden bg-[#0a0f1e] px-4 py-20">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[600px] rounded-full bg-teal-600/10 blur-[80px]" />
              </div>
              <div className="relative mx-auto max-w-3xl text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-sm font-semibold text-teal-400 mb-3 uppercase tracking-[0.2em]">Start for free</p>
                  <h3 className="text-3xl font-black text-white mb-4 tracking-tight sm:text-4xl">
                    AI tools, resume scoring &<br className="hidden sm:block" /> smart matching — all free.
                  </h3>
                  <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
                    Join 50,000+ professionals who found their next role faster with UltimateJobAI.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button
                      className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-bold px-8 rounded-xl h-12 shadow-lg shadow-teal-500/25 text-sm"
                      onClick={() => navigate("/auth?mode=signup")}
                    >
                      Get Started Free
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20 hover:text-white rounded-xl px-8 h-12 text-sm"
                      onClick={() => navigateToJobs(searchQuery, filters)}
                    >
                      Explore All Jobs
                    </Button>
                  </div>
                </motion.div>
              </div>
            </section>
          </>
        )}


        {!isLandingMode && (
          <section className="px-2 pt-32 pb-20 sm:px-4 lg:px-6">
            <div className="mx-auto max-w-[1550px]">
              <div className="max-w-3xl mx-auto text-center mb-16">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-600 mb-4">Discovery Engine</p>
                <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight">
                  Explore jobs with <span className="text-teal-600">visible filters</span>
                </h2>
                <div className="mt-6 h-1 w-20 bg-slate-900 mx-auto rounded-full" />
              </div>

              <div className="mb-8 flex items-center justify-between gap-3 lg:hidden">
                <Button type="button" variant="outline" className="w-full gap-2 rounded-2xl bg-white h-12 font-bold" onClick={() => setShowMobileFilters((prev) => !prev)}>
                   <SlidersHorizontal className="h-4 w-4" />
                   {showMobileFilters ? "Hide Filters" : "Show Filters"}
                </Button>
              </div>

              {showMobileFilters && <div className="mb-5 lg:hidden">{renderFilters()}</div>}

              <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_280px]">
                <aside className="hidden lg:block">{renderFilters()}</aside>
                <div className="space-y-5">
                  <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white px-5 py-4 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.35)] sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      {isRefreshing ? <><Loader2 className="h-4 w-4 animate-spin" />Loading jobs...</> : <><span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-900">{jobs.length}</span><span>{totalResults > jobs.length ? `showing ${jobs.length} of ${totalResults} jobs` : `${jobs.length} jobs found`}</span></>}
                    </div>
                    {!isAuthenticated && <div className="rounded-full border border-teal-100 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">Sign in to unlock full job details & apply.</div>}
                  </div>

                  {isRefreshing && jobs.length === 0 ? (
                    <div className="space-y-6">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="rounded-[30px] border border-slate-100 bg-white p-8 shadow-sm animate-pulse">
                          <div className="flex gap-6">
                            <div className="h-14 w-14 rounded-2xl bg-slate-50" />
                            <div className="flex-1 space-y-4">
                              <div className="h-4 w-1/3 bg-slate-50 rounded" />
                              <div className="h-3 w-1/4 bg-slate-50 rounded" />
                              <div className="flex gap-2">
                                <div className="h-6 w-20 rounded-full bg-slate-50" />
                                <div className="h-6 w-24 rounded-full bg-slate-50" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : jobs.length > 0 ? (
                    <div className="space-y-10">
                      {/* Employer Jobs Section */}
                      {jobs.filter(j => j.source === 'employer').length > 0 && (
                        <div className="space-y-5">
                          <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-900">Our Verified Jobs <span className="mx-2 text-slate-300">|</span> <span className="text-blue-600">Posted by Employers</span></h3>
                            </div>
                            <span className="text-xs font-medium text-slate-400">{jobs.filter(j => j.source === 'employer').length} Jobs</span>
                          </div>
                          <div className="space-y-5">
                            {jobs.filter(j => j.source === 'employer').map((job, index) => renderJobCard(job, index))}
                          </div>
                        </div>
                      )}

                      {/* Global/Scraped Jobs Section */}
                      {jobs.filter(j => j.source !== 'employer').length > 0 && (
                        <div className="space-y-5">
                          <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                              <Globe2 className="h-4 w-4 text-slate-400" />
                              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-900">Global Discovery <span className="mx-2 text-slate-300">|</span> <span className="text-slate-500">External Sources</span></h3>
                            </div>
                            <span className="text-xs font-medium text-slate-400">{jobs.filter(j => j.source !== 'employer').length} Search Results</span>
                          </div>
                          <div className="space-y-5">
                            {jobs.filter(j => j.source !== 'employer').map((job, index) => renderJobCard(job, index))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-[30px] border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_30px_80px_-65px_rgba(15,23,42,0.35)]">
                      <Briefcase className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                      <h3 className="text-xl font-semibold text-slate-900">No jobs found</h3>
                      <p className="mt-2 text-sm text-slate-500">Try broadening your search or clearing some filters.</p>
                      <Button variant="outline" className="mt-6 rounded-full" onClick={resetFilters}><X className="mr-2 h-4 w-4" />Show All Jobs</Button>
                    </div>
                  )}

                  <div ref={observerTarget} className="flex w-full justify-center py-8">
                    {hasNextPage ? <div className="flex flex-col items-center gap-3"><div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin text-teal-600" />Loading more opportunities...</div><button onClick={() => fetchJobs(searchQuery, filters, page + 1, true)} className="text-xs font-medium text-teal-600 underline underline-offset-2">Click here if it doesn't load automatically</button></div> : jobs.length > 0 ? <div className="text-sm italic text-slate-500">You&apos;ve reached the end of the current results.</div> : null}
                  </div>
                </div>
                <aside className="hidden xl:block">
                  {renderCuratedShortcutBox()}
                </aside>
              </div>
            </div>
          </section>
        )}
      </main>

      <LoginRequiredModal open={loginPromptOpen} onOpenChange={setLoginPromptOpen} title={loginPromptCopy.title} description={loginPromptCopy.description} />
      <JobDetailsSheet job={selectedDetailsJob} open={detailsOpen} onOpenChange={setDetailsOpen} />
      <AutoApplyModal job={autoApplyJob ? {
        id: String(autoApplyJob.id),
        title: autoApplyJob.title,
        company: autoApplyJob.company,
        isDemoJob: autoApplyJob.isDemoJob,
        source: autoApplyJob.source,
        quick_apply_enabled: autoApplyJob.quick_apply_enabled,
        quick_apply_questions: autoApplyJob.quick_apply_questions,
      } : null} open={autoApplyOpen} onClose={() => { setAutoApplyOpen(false); setAutoApplyJob(null); }} />
    </>
  );
}
