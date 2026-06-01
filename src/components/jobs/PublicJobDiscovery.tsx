import { useState, useEffect, useCallback, useRef } from "react";
import { getPrefetchedSync, waitForPrefetch } from "@/services/jobsPreloadCache";
import { hasCached } from "@/services/api";
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
  CheckCircle2,
  LayoutDashboard,
  Bot,
} from "lucide-react";
import { useResume } from "@/hooks/useResume";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { notificationService } from "@/services/notificationService";

import {
  DefaultDiscoveryFilter,
  fetchJobFilterOptions,
  fetchJobLocationOptions,
  fetchJobById,
  fetchLeverJobDetails,
  fetchGreenhouseJobDetails,
  Job,
  JobSearchFilters,
  ApifySearchStatus,
  createApifySearch,
  searchJobs,
  fetchAllCountries,
  fetchApifySearchStatus,
  isJobFinderSearchEnabled,
  JOB_SEARCH_MAX_RESULTS,
  mapApifyResultToJob,
  subscribeApifySearch,
  serpApiSearch,
} from "@/services/jobService";
import { JobDetailsSheet } from "@/components/jobs/JobDetailsSheet";
import { ApplyBotButton } from "@/components/jobs/ApplyBotButton";
import { BotMultiApplyPanel } from "@/components/jobs/BotMultiApplyPanel";
import { LoginRequiredModal } from "@/components/auth/LoginRequiredModal";
import { careerService } from "@/services/careerService";
import api from "@/services/api";

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

const parseJobDate = (dateStr: string) => {
  const now = new Date();
  const num = parseInt(dateStr.match(/\d+/)?.[0] || "0");
  if (dateStr.includes("hour")) return new Date(now.getTime() - num * 60 * 60 * 1000);
  if (dateStr.includes("day")) return new Date(now.getTime() - num * 24 * 60 * 60 * 1000);
  if (dateStr.includes("week")) return new Date(now.getTime() - num * 7 * 24 * 60 * 60 * 1000);
  if (dateStr.includes("month")) return new Date(now.getTime() - num * 30 * 24 * 60 * 60 * 1000);
  return now;
};

const sortJobList = (jobList: Job[], criteria: string) => {
  const list = [...jobList];
  if (criteria === "Most Recent") return list.sort((a, b) => parseJobDate(b.posted).getTime() - parseJobDate(a.posted).getTime());
  if (criteria === "Highest Salary") {
    const getSalaryValue = (s?: string) => (s?.match(/\d+/g) ? parseInt(s.match(/\d+/g)!.slice(-1)[0]) : 0);
    return list.sort((a, b) => getSalaryValue(b.salary) - getSalaryValue(a.salary));
  }
  return list.sort((a, b) => b.match - a.match);
};

const getRequestErrorMessage = (error: unknown) => {
  if (error && typeof error === "object") {
    const maybeAxiosError = error as { response?: { data?: { message?: string } }; message?: string };
    return maybeAxiosError.response?.data?.message || maybeAxiosError.message || "Unknown error";
  }
  return "Unknown error";
};

const splitKeywordAndLocation = (query: string) => {
  const trimmed = query.trim().replace(/\s+/g, " ");
  const match = trimmed.match(/^(.+?)\s+in\s+(.+)$/i);

  if (!match) {
    return { keyword: trimmed, location: "" };
  }

  const keyword = match[1].trim();
  const location = match[2].trim();

  if (!keyword || !location) {
    return { keyword: trimmed, location: "" };
  }

  return { keyword, location };
};

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

// ---------------------------------------------------------------------------
// Module-level Jobs page cache — survives route changes so back-navigation
// never re-triggers a loading state.
// ---------------------------------------------------------------------------
const _JOBS_CACHE_TTL = 5 * 60 * 1000;
interface JobsPageCache {
  jobs: Job[];
  totalResults: number;
  hasNextPage: boolean;
  searchQuery: string;
  filters: JobSearchFilters;
  page: number;
  discoveryCountryOptions: string[];
  filterCountryOptions: Array<{ value: string; label: string; count: number }>;
  cityMap: Record<string, string[]>;
  departmentOptions: Array<{ value: string; label: string; count: number }>;
  employmentOptions: Array<{ value: string; label: string; count: number }>;
  workplaceOptions: Array<{ value: string; label: string; count: number }>;
  browseCards: DiscoveryCard[];
  ts: number;
}
let _jobsPageCache: JobsPageCache | null = null;
const _isJobsCacheFresh = () => !!_jobsPageCache && Date.now() - _jobsPageCache.ts < _JOBS_CACHE_TTL;

interface PublicJobDiscoveryProps {
  mode?: DiscoveryMode;
}

export function PublicJobDiscovery({ mode = "results" }: PublicJobDiscoveryProps) {
  const { isAuthenticated } = useAuth();
  const { activeResume } = useResume();
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingMode = mode === "landing";

  const targetRole = activeResume?.targetJobRole || notificationService.getPrefs().targetRole || "";

  // Use page-level module cache first, then prefetch cache, then empty
  const _jpc = _isJobsCacheFresh() ? _jobsPageCache! : null;
  const _syncJobs = _jpc ? _jpc.jobs : (getPrefetchedSync(targetRole)?.jobs ?? []);
  const _syncTotal = _jpc ? _jpc.totalResults : (getPrefetchedSync(targetRole) ? Math.min(getPrefetchedSync(targetRole)!.totalResults, JOB_SEARCH_MAX_RESULTS) : 0);

  const CLEAN_FILTERS: JobSearchFilters = {
    title: "", department: "", location: "", employment_type: "",
    workplace_type: "", country: "", city: "",
  };

  const [searchQuery, setSearchQuery] = useState(_jpc?.searchQuery ?? (targetRole || ""));
  const [jobs, setJobs] = useState<Job[]>(_syncJobs.length ? sortJobList(_syncJobs, "Best Match").slice(0, JOB_SEARCH_MAX_RESULTS) : []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(_syncJobs.length === 0);
  const [savedJobs, setSavedJobs] = useState<(string | number)[]>([]);
  const [sortBy] = useState("Best Match");
  const [totalResults, setTotalResults] = useState(_syncTotal);
  const [selectedDetailsJob, setSelectedDetailsJob] = useState<Job | null>(null);
  const [botMultiTasks, setBotMultiTasks] = useState<Array<{ taskId: string; jobTitle: string; company: string }> | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [loginPromptCopy, setLoginPromptCopy] = useState({
    title: "Login to continue",
    description: "Sign in to view full job details, save jobs, and start applying with confidence.",
  });
  const [filters, setFilters] = useState<JobSearchFilters>(_jpc?.filters ?? CLEAN_FILTERS);
  const [page, setPage] = useState(_jpc?.page ?? 1);
  const [hasNextPage, setHasNextPage] = useState(_jpc?.hasNextPage ?? false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [discoveryCountryOptions, setDiscoveryCountryOptions] = useState<string[]>(_jpc?.discoveryCountryOptions ?? []);
  const [filterCountryOptions, setFilterCountryOptions] = useState<Array<{ value: string; label: string; count: number }>>(_jpc?.filterCountryOptions ?? []);
  const [cityOptions, setCityOptions] = useState<Array<{ value: string; label: string; count: number }>>([]);
  const [cityMap, setCityMap] = useState<Record<string, string[]>>(_jpc?.cityMap ?? {});
  const [departmentOptions, setDepartmentOptions] = useState<Array<{ value: string; label: string; count: number }>>(_jpc?.departmentOptions ?? []);
  const [employmentOptions, setEmploymentOptions] = useState<Array<{ value: string; label: string; count: number }>>(_jpc?.employmentOptions ?? []);
  const [workplaceOptions, setWorkplaceOptions] = useState<Array<{ value: string; label: string; count: number }>>(_jpc?.workplaceOptions ?? []);
  const [browseCards, setBrowseCards] = useState<DiscoveryCard[]>(_jpc?.browseCards ?? []);
  const [curatedLandingJobs, setCuratedLandingJobs] = useState<Record<string, Job[]>>({});
  const [isLoadingCuratedLandingJobs, setIsLoadingCuratedLandingJobs] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(!_jpc && (!hasCached('/api/search/locations/') || !hasCached('/api/search/countries/')));
  const [isLoadingFilterOptions, setIsLoadingFilterOptions] = useState(!_jpc && !hasCached('/api/search/filters/'));
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [apifyStatus, setApifyStatus] = useState<ApifySearchStatus>("idle");
  const [apifyResultCount, setApifyResultCount] = useState(0);

  // ── SerpAPI Google Jobs toggle ──
  const [serpApiEnabled, setSerpApiEnabled] = useState(false);
  const [serpApiJobs, setSerpApiJobs] = useState<Job[]>([]);
  const [serpApiLoading, setSerpApiLoading] = useState(false);
  const [serpApiCount, setSerpApiCount] = useState(0);
  const [serpApiStart, setSerpApiStart] = useState(0);
  const [serpApiHasMore, setSerpApiHasMore] = useState(false);
  const [isSerpApiLoadingMore, setIsSerpApiLoadingMore] = useState(false);

  const loadMoreSerpApiJobs = useCallback(async () => {
    if (serpApiJobs.length >= JOB_SEARCH_MAX_RESULTS) {
      setSerpApiHasMore(false);
      return;
    }
    if (isSerpApiLoadingMore || !serpApiHasMore) return;

    setIsSerpApiLoadingMore(true);
    try {
      const activeKeyword = (searchQuery || filters.title || "").trim();
      const parsed = splitKeywordAndLocation(activeKeyword);
      const result = await serpApiSearch(
        parsed.keyword || activeKeyword, 
        parsed.location || filters.location || filters.city || filters.country || "",
        serpApiStart
      );

      if (result.jobs.length > 0) {
        setSerpApiJobs(prev => {
          const merged = [...prev, ...result.jobs].slice(0, JOB_SEARCH_MAX_RESULTS);
          setSerpApiHasMore(result.jobs.length >= 10 && merged.length < JOB_SEARCH_MAX_RESULTS);
          return merged;
        });
        setSerpApiStart(prev => prev + result.jobs.length);
      } else {
        setSerpApiHasMore(false);
      }
    } catch (err) {
      toast.error("Failed to load more Google Jobs.");
    } finally {
      setIsSerpApiLoadingMore(false);
    }
  }, [isSerpApiLoadingMore, serpApiHasMore, serpApiJobs.length, searchQuery, filters, serpApiStart]);

  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [dismissedJobIds, setDismissedJobIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("dismissed_bot_jobs");
      return stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });
  const [appliedHistoryItems, setAppliedHistoryItems] = useState<{ id: string | number; job_id?: string | number; job_title?: string; company?: string; job_url?: string; created_at?: string }[]>([]);
  const [appliedResolvedJobs, setAppliedResolvedJobs] = useState<Map<string, Job>>(new Map());
  const [feedTab, setFeedTab] = useState<"discover" | "applied">("discover");
  const apifyUnsubscribeRef = useRef<(() => void) | null>(null);
  const apifyPollTimerRef = useRef<number | null>(null);
  const activeApifyDocIdRef = useRef<string | null>(null);
  const apifySearchSeqRef = useRef(0);

  const loadAppliedHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/api/bot/history/');
      const ids = new Set<string>();
      const items: typeof appliedHistoryItems = [];
      const applications = res.data?.applications ?? [];
      applications.forEach((a: any) => {
        items.push(a);
        ids.add(a.job_id ? String(a.job_id) : String(a.id));
      });
      setAppliedJobIds(ids);
      setAppliedHistoryItems(items);
    } catch {
      // non-fatal
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (feedTab !== "applied" || appliedHistoryItems.length === 0) return;

    const toResolve = appliedHistoryItems.filter(item => !appliedResolvedJobs.has(String(item.id)));
    if (toResolve.length === 0) return;

    Promise.allSettled(
      toResolve.map(async (item): Promise<{ itemId: string; job: Job } | null> => {
        // 1. Try DB lookup by job_id
        if (item.job_id) {
          const id = String(item.job_id);
          const fromDisplay = displayJobs.find(j => String(j.id) === id);
          if (fromDisplay) return { itemId: String(item.id), job: fromDisplay };
          const fetched = await fetchJobById(id);
          if (fetched) return { itemId: String(item.id), job: fetched };
        }

        // 2. Lever / Greenhouse public API fallback — gives us the real job title from the URL
        if (item.job_url) {
          const leverMatch = item.job_url.match(/jobs\.lever\.co\/([^/]+)\/([^/?#\s]+)/);
          if (leverMatch) {
            const details = await fetchLeverJobDetails(leverMatch[1], leverMatch[2]);
            if (details?.text) {
              return {
                itemId: String(item.id),
                job: {
                  id: item.job_id || item.id,
                  title: details.text,
                  company: item.company || leverMatch[1],
                  location: "",
                  salary: "",
                  posted: item.created_at ? new Date(item.created_at).toLocaleDateString() : "Applied",
                  match: 0,
                  tags: [],
                  saved: false,
                  hasEmail: false,
                  apply_url: item.job_url,
                  url: item.job_url,
                  source: "external",
                },
              };
            }
          }

          const ghMatch = item.job_url.match(/greenhouse\.io\/([^/]+)\/jobs\/(\d+)/);
          if (ghMatch) {
            const details = await fetchGreenhouseJobDetails(ghMatch[1], ghMatch[2]);
            if (details?.title) {
              return {
                itemId: String(item.id),
                job: {
                  id: item.job_id || item.id,
                  title: details.title,
                  company: item.company || ghMatch[1],
                  location: details.location?.name || "",
                  salary: "",
                  posted: item.created_at ? new Date(item.created_at).toLocaleDateString() : "Applied",
                  match: 0,
                  tags: [],
                  saved: false,
                  hasEmail: false,
                  apply_url: item.job_url,
                  url: item.job_url,
                  source: "external",
                },
              };
            }
          }
        }

        return null;
      })
    ).then(results => {
      setAppliedResolvedJobs(prev => {
        const next = new Map(prev);
        results.forEach(r => {
          if (r.status === "fulfilled" && r.value) next.set(r.value.itemId, r.value.job);
        });
        return next;
      });
    });
  }, [feedTab, appliedHistoryItems]);

  const loadSavedJobs = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await import("@/services/api").then(m => m.default.get("/api/search/saved/"));
      const ids: (string | number)[] = (res.data?.results ?? res.data ?? []).map((j: { id: string | number }) => j.id);
      setSavedJobs(ids);
    } catch {
      // non-fatal
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadAppliedHistory();
    loadSavedJobs();
  }, [loadAppliedHistory, loadSavedJobs]);

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
    
    // Explicitly check state or a passed-in override
    const isSerp = serpApiEnabled || params.get("serpapi") === "true";
    if (isSerp) params.set("serpapi", "true");
    
    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const stopApifySubscription = () => {
    apifyUnsubscribeRef.current?.();
    apifyUnsubscribeRef.current = null;
    activeApifyDocIdRef.current = null;
    if (apifyPollTimerRef.current) {
      window.clearInterval(apifyPollTimerRef.current);
      apifyPollTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopApifySubscription();
      apifySearchSeqRef.current += 1;
    };
  }, []);

  const buildApifyRequest = (query: string, currentFilters: JobSearchFilters, p: number) => {
    const keyword = (currentFilters.title || query || currentFilters.department || "").trim();
    if (keyword.length < 2) return null;

    const locationValue = (
      currentFilters.city ||
      currentFilters.location ||
      currentFilters.country ||
      (currentFilters.workplace_type?.toLowerCase() === "remote" ? "Remote" : "United States")
    ).trim();

    return {
      keywords: [keyword],
      locations: [locationValue || "United States"],
      is_remote: currentFilters.workplace_type?.toLowerCase() === "remote",
      page: p,
      page_size: Number(currentFilters.page_size || 10),
    };
  };

  const startApifySearch = useCallback(async (query: string, currentFilters: JobSearchFilters, p: number) => {
    const payload = buildApifyRequest(query, currentFilters, p);
    const seq = apifySearchSeqRef.current + 1;
    apifySearchSeqRef.current = seq;
    stopApifySubscription();
    setApifyResultCount(0);
    setJobs([]);
    setTotalResults(0);
    setHasNextPage(false);

    if (!payload) {
      setApifyStatus("idle");
      return;
    }

    setApifyStatus("pending");

    try {
      const search = await createApifySearch(payload);
      if (apifySearchSeqRef.current !== seq) return;

      activeApifyDocIdRef.current = search.firestore_doc_id;
      setApifyStatus(search.status || "pending");

      const applyApifySnapshot = (snapshot: Awaited<ReturnType<typeof fetchApifySearchStatus>>) => {
        if (apifySearchSeqRef.current !== seq) return;
        if (activeApifyDocIdRef.current !== search.firestore_doc_id) return;
        const results = Array.isArray(snapshot.results) ? snapshot.results : [];
        setApifyStatus(snapshot.status);
        setApifyResultCount(snapshot.results_count || results.length);
        setTotalResults(snapshot.total_results || snapshot.results_count || results.length);

        const apifyJobs = results.map(mapApifyResultToJob);
        setJobs(sortJobList(apifyJobs, sortBy));

        if (snapshot.status === "completed" || snapshot.status === "failed") {
          if (apifyPollTimerRef.current) {
            window.clearInterval(apifyPollTimerRef.current);
            apifyPollTimerRef.current = null;
          }
        }

        if (snapshot.status === "failed" && snapshot.error_message) {
          toast.error(`Apify search failed: ${snapshot.error_message}`);
        }
      };

      apifyUnsubscribeRef.current = subscribeApifySearch(
        search.firestore_doc_id,
        applyApifySnapshot,
        (error) => {
        },
      );

      const pollStatus = async () => {
        try {
          const snapshot = await fetchApifySearchStatus(search.firestore_doc_id);
          applyApifySnapshot(snapshot);
        } catch {
          // polling failed — will retry on next interval
        }
      };

      void pollStatus();
      apifyPollTimerRef.current = window.setInterval(pollStatus, 3000);
    } catch (error) {
      if (apifySearchSeqRef.current !== seq) return;
      setApifyStatus("failed");
    }
  }, [sortBy]);

  const fetchJobs = useCallback(async (query: string = "", currentFilters: JobSearchFilters = filters, p: number = 1, append: boolean = false) => {
    if (isLandingMode) return;

    const params = new URLSearchParams(location.search);
    const useJobFinderSearch = isJobFinderSearchEnabled();
    const isSerpApiActive = !useJobFinderSearch && (currentFilters.serpapi === "true" || serpApiEnabled || params.get("serpapi") === "true");
    const isPrimaryApifySearch = !useJobFinderSearch && (currentFilters.primary_search === "true" || params.get("primary_search") === "true");


    if (isPrimaryApifySearch && !append && p === 1 && !isSerpApiActive) {
      setIsRefreshing(true);
      setIsLoadingFilterOptions(false);

      try {
        await startApifySearch(query, currentFilters, 1);
      } catch (error: unknown) {
        toast.error("Failed to start Apify search: " + getRequestErrorMessage(error));
      } finally {
        setIsRefreshing(false);
        setIsLoadingMore(false);
        setIsLoadingFilterOptions(false);
      }
      return;
    }

    // If SerpAPI is enabled, we treat it as the primary live source and skip Apify
    if (isPrimaryApifySearch && !append && p === 1 && isSerpApiActive) {
      stopApifySubscription();
      setApifyStatus("idle");
      setApifyResultCount(0);
      
      setIsRefreshing(true);
      setSerpApiLoading(true);
      setSerpApiJobs([]);
      setSerpApiCount(0);
      setSerpApiStart(0);
      setSerpApiHasMore(false);

      const activeKeyword = (query || currentFilters.title || "").trim();
      const parsed = splitKeywordAndLocation(activeKeyword);
      const serpPromise = serpApiSearch(parsed.keyword || activeKeyword, parsed.location || currentFilters.location || currentFilters.city || currentFilters.country || "")
        .then((serpResult) => {
          const cappedJobs = serpResult.jobs.slice(0, JOB_SEARCH_MAX_RESULTS);
          setSerpApiJobs(cappedJobs);
          setSerpApiCount(Math.min(serpResult.totalResults, JOB_SEARCH_MAX_RESULTS));
          setSerpApiHasMore(serpResult.jobs.length >= 10 && cappedJobs.length < JOB_SEARCH_MAX_RESULTS);
          setSerpApiStart(10);
          return serpResult;
        })
        .catch((err) => { 
          toast.error("SerpAPI search failed."); 
          throw err;
        })
        .finally(() => {
          setSerpApiLoading(false);
          // If this was the main thing we were waiting for, stop the big spinner
          setIsRefreshing(false);
        });
      
      // Load DB results in the background, but don't let it block the "refreshing" state
      searchJobs(query, p, currentFilters).then(result => {
        const cappedJobs = sortJobList(result.jobs, sortBy).slice(0, JOB_SEARCH_MAX_RESULTS);
        setJobs(cappedJobs);
        setTotalResults(Math.min(result.totalResults, JOB_SEARCH_MAX_RESULTS));
        setHasNextPage(result.hasNext && cappedJobs.length < JOB_SEARCH_MAX_RESULTS);
      }).catch(err => {
      });
      
      return;
    }

    stopApifySubscription();
    setApifyStatus("idle");
    setApifyResultCount(0);

    // Synchronous cache hit → set jobs with zero loading state
    if (!append && p === 1) {
      const cached = getPrefetchedSync(query);
      if (cached?.jobs?.length) {
        const cappedJobs = sortJobList(cached.jobs, sortBy).slice(0, JOB_SEARCH_MAX_RESULTS);
        // Skip setState if jobs haven't changed — prevents redundant re-render
        setJobs(prev => (prev.length === cappedJobs.length && prev[0]?.id === cappedJobs[0]?.id) ? prev : cappedJobs);
        setTotalResults(Math.min(cached.totalResults, JOB_SEARCH_MAX_RESULTS));
        setHasNextPage(cached.hasNext && cappedJobs.length < JOB_SEARCH_MAX_RESULTS);
        setPage(1);
        setIsRefreshing(false);
        return;
      }
      // In-flight prefetch → wait for it (spinner only shown while fetch is still running)
      const inflight = waitForPrefetch(query);
      if (inflight) {
        setIsRefreshing(true);
        try {
          const result = await inflight;
          if (result?.jobs?.length) {
            const cappedJobs = sortJobList(result.jobs, sortBy).slice(0, JOB_SEARCH_MAX_RESULTS);
            setJobs(cappedJobs);
            setTotalResults(Math.min(result.totalResults, JOB_SEARCH_MAX_RESULTS));
            setHasNextPage(result.hasNext && cappedJobs.length < JOB_SEARCH_MAX_RESULTS);
            setPage(1);
            return;
          }
        } catch {
          // fall through to normal fetch
        } finally {
          setIsRefreshing(false);
        }
      }
    }

    if (append || p > 1) {
      setIsLoadingMore(true);
    } else {
      setIsRefreshing(true);
    }
    setIsLoadingFilterOptions(false);

    try {
      const result = await searchJobs(query, p, currentFilters);
      const nextJobs = sortJobList(result.jobs, sortBy);

      const cappedTotalResults = Math.min(result.totalResults, JOB_SEARCH_MAX_RESULTS);
      if (append) {
        setJobs((prev) => {
          const merged = sortJobList([...prev, ...nextJobs], sortBy).slice(0, JOB_SEARCH_MAX_RESULTS);
          setHasNextPage(result.hasNext && merged.length < JOB_SEARCH_MAX_RESULTS);
          return merged;
        });
      } else {
        const cappedJobs = nextJobs.slice(0, JOB_SEARCH_MAX_RESULTS);
        setJobs(cappedJobs);
        setHasNextPage(result.hasNext && cappedJobs.length < JOB_SEARCH_MAX_RESULTS);
        // Save to page-level cache so back-navigation is instant
        _jobsPageCache = {
          jobs: cappedJobs,
          totalResults: cappedTotalResults,
          hasNextPage: result.hasNext && cappedJobs.length < JOB_SEARCH_MAX_RESULTS,
          searchQuery: query,
          filters: currentFilters,
          page: p,
          discoveryCountryOptions: [],
          filterCountryOptions: [],
          cityMap: {},
          departmentOptions: [],
          employmentOptions: [],
          workplaceOptions: [],
          browseCards: [],
          ts: Date.now(),
        };
      }
      setTotalResults(cappedTotalResults);
      setPage(p);

      // ── SerpAPI side-search (non-blocking) ──
      const activeKeyword = (query || currentFilters.title || "").trim();
      if (isSerpApiActive && activeKeyword.length >= 2 && !append) {
        setSerpApiLoading(true);
        setSerpApiJobs([]);
        setSerpApiCount(0);
        setSerpApiStart(0);
        setSerpApiHasMore(false);
        const parsed = splitKeywordAndLocation(activeKeyword);
        serpApiSearch(parsed.keyword || activeKeyword, parsed.location || currentFilters.location || currentFilters.city || currentFilters.country || "")
          .then((serpResult) => {
            const cappedJobs = serpResult.jobs.slice(0, JOB_SEARCH_MAX_RESULTS);
            setSerpApiJobs(cappedJobs);
            setSerpApiCount(Math.min(serpResult.totalResults, JOB_SEARCH_MAX_RESULTS));
            setSerpApiHasMore(serpResult.jobs.length >= 10 && cappedJobs.length < JOB_SEARCH_MAX_RESULTS);
            setSerpApiStart(10);
          })
          .catch(() => { toast.error("SerpAPI search failed."); })
          .finally(() => setSerpApiLoading(false));
      } else if (!isSerpApiActive) {
        setSerpApiJobs([]);
        setSerpApiCount(0);
        setSerpApiStart(0);
        setSerpApiHasMore(false);
      }
    } catch (error: unknown) {
      toast.error("Failed to load jobs: " + getRequestErrorMessage(error));
    } finally {
      setIsRefreshing(false);
      setIsLoadingMore(false);
      setIsLoadingFilterOptions(false);
      setIsInitialLoad(false);
    }
  }, [filters, isLandingMode, sortBy, startApifySearch, serpApiEnabled]);

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




  const displayJobs = jobs.filter(j => !dismissedJobIds.has(String(j.id)));
  const isApifySearching = apifyStatus === "pending" || apifyStatus === "processing";

  // Client-side pagination — 10 jobs per page
  const JOBS_PER_PAGE = 10;
  const [displayPage, setDisplayPage] = useState(1);
  const totalDisplayPages = Math.max(1, Math.ceil(displayJobs.length / JOBS_PER_PAGE));
  const pagedJobs = displayJobs.slice((displayPage - 1) * JOBS_PER_PAGE, displayPage * JOBS_PER_PAGE);

  // Reset to page 1 whenever the jobs list changes (new search/filter)
  const prevJobsLenRef = useRef(0);
  if (prevJobsLenRef.current !== displayJobs.length) {
    prevJobsLenRef.current = displayJobs.length;
    if (displayPage !== 1) setDisplayPage(1);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Only show spinner if we have nothing cached for this query
      if (!hasCached('/api/search/filters/', { search: searchQuery, ...filters })) {
        setIsLoadingFilterOptions(true);
      }
      try {
        const options = await fetchJobFilterOptions(searchQuery, filters);
        if (!mounted) return;
        setDepartmentOptions(options.departments);
        setEmploymentOptions(options.employmentTypes);
        setWorkplaceOptions(options.workplaceTypes);
        setFilterCountryOptions(options.countries);
        setCityOptions(options.cities);
        setBrowseCards(options.defaultFilters);
        // Persist to page cache so back-navigation skips loading
        if (_jobsPageCache) {
          _jobsPageCache.departmentOptions = options.departments;
          _jobsPageCache.employmentOptions = options.employmentTypes;
          _jobsPageCache.workplaceOptions = options.workplaceTypes;
          _jobsPageCache.filterCountryOptions = options.countries;
          _jobsPageCache.browseCards = options.defaultFilters;
        }
      } finally {
        if (mounted) setIsLoadingFilterOptions(false);
      }
    })();
    return () => { mounted = false; };
  }, [searchQuery, filters.country, filters.department, filters.employment_type, filters.workplace_type]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!hasCached('/api/search/locations/') || !hasCached('/api/search/countries/')) {
        setIsLoadingLocations(true);
      }
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
        
        const allCountries = Array.from(new Set([...popularCountries, ...others]));
        setDiscoveryCountryOptions(allCountries);

        if (filterCountryOptions.length === 0) {
          const dbCountries = fullCountries
            .filter(c => c.has_jobs || c.job_count > 0)
            .map(c => ({ value: c.name, label: c.name, count: c.job_count }));
          setFilterCountryOptions(dbCountries);
          if (_jobsPageCache) _jobsPageCache.filterCountryOptions = dbCountries;
        }

        setCityMap(options.cityMap);
        // Persist location data to page cache
        if (_jobsPageCache) {
          _jobsPageCache.discoveryCountryOptions = allCountries;
          _jobsPageCache.cityMap = options.cityMap;
        }
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

  // Auto-navigate to target role with quick-apply filter on first visit
  useEffect(() => {
    if (!isAuthenticated || isLandingMode) return;
    const params = new URLSearchParams(location.search);
    if (params.toString()) return; // already has search params — don't override
    if (!targetRole) return;
    const next = new URLSearchParams();
    next.set("search", targetRole);
    navigate(`/jobs?${next.toString()}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLandingMode, targetRole]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search") || "";
    const initial = {
      title: params.get("title") || "",
      department: params.get("department") || "",
      location: params.get("location") || "",
      employment_type: params.get("employment_type") || "",
      workplace_type: params.get("workplace_type") || (params.get("is_remote") === "true" ? "remote" : ""),
      country: params.get("country") || "",
      city: params.get("city") || "",
      serpapi: params.get("serpapi") || "",
    };

    // Only call setters when values actually change to avoid spurious re-renders
    setSearchQuery(prev => prev !== searchParam ? searchParam : prev);
    setFilters(prev => JSON.stringify(prev) !== JSON.stringify(initial) ? initial : prev);
    const serpFromUrl = params.get("serpapi") === "true";
    setSerpApiEnabled(serpFromUrl);

    const isPrimary = params.get("primary_search") === "true";
    if (!isLandingMode) {
      // Skip if redirect is about to change the URL anyway
      const aboutToRedirect = !params.toString() && !!notificationService.getPrefs().targetRole;
      // Skip only if cache has fresh data for the exact same query AND filters
      const pageCacheHit = _isJobsCacheFresh()
        && _jobsPageCache?.searchQuery === searchParam
        && JSON.stringify(_jobsPageCache?.filters) === JSON.stringify(initial);
      if (!aboutToRedirect && !pageCacheHit) {
        fetchJobs(searchParam, { ...initial, primary_search: isPrimary ? "true" : "false", serpapi: serpFromUrl ? "true" : "false" }, 1, false);
      }
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
    const parsed = splitKeywordAndLocation(searchQuery);
    const nextFilters = parsed.location ? { ...filters, location: parsed.location } : filters;
    const isPrimary = parsed.keyword.length > 0;

    setSearchQuery(parsed.keyword);
    if (parsed.location) setFilters(nextFilters);
    navigateToJobs(parsed.keyword, nextFilters, isPrimary);
  };

  const handleSidebarFilterSubmit = () => {
    const parsed = splitKeywordAndLocation(searchQuery);
    const nextFilters = parsed.location ? { ...filters, location: parsed.location } : filters;

    setSearchQuery(parsed.keyword);
    if (parsed.location) setFilters(nextFilters);
    navigateToJobs(parsed.keyword, nextFilters, false);
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

  const toggleSave = async (jobId: string | number) => {
    if (!isAuthenticated) {
      promptLogin("Login to save jobs", "Create an account to save jobs, track them, and come back to them anytime.");
      return;
    }
    const isSaved = savedJobs.includes(jobId);
    // Optimistic update
    setSavedJobs((prev) => isSaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]);
    try {
      const api = (await import("@/services/api")).default;
      if (isSaved) {
        await api.delete(`/api/search/saved/${jobId}/delete/`);
      } else {
        await api.post("/api/search/saved/", { job_id: jobId });
      }
    } catch {
      // Revert optimistic update on failure
      setSavedJobs((prev) => isSaved ? [...prev, jobId] : prev.filter((id) => id !== jobId));
      toast.error("Failed to update saved jobs.");
    }
  };

  const handleBulkBotApply = async (jobs: Job[]) => {
    if (!isAuthenticated) {
      promptLogin("Login to use Bot Apply", "Sign in to let the bot apply to jobs on your behalf.");
      return;
    }
    const botJobs = jobs.filter((j) => j.apply_url && j.apply_url !== "#" && j.source !== "employer");
    if (!botJobs.length) return;

    try {
      const res = await api.post<{ task_ids: string[] }>("/api/bot/apply/bulk/", {
        job_urls: botJobs.map((j) => j.apply_url),
      });
      setBotMultiTasks(
        res.data.task_ids.map((taskId, i) => ({
          taskId,
          jobTitle: botJobs[i].title,
          company: botJobs[i].company,
        }))
      );
    } catch {
      toast.error("Failed to start bot apply. Please try again.");
    } finally {
      setBulkSelectMode(false);
      setSelectedJobIds(new Set());
    }
  };

  const enterBulkSelectMode = () => {
    if (!isAuthenticated) {
      promptLogin("Login to use Bot Apply", "Sign in to let the bot apply to jobs on your behalf.");
      return;
    }
    setBulkSelectMode(true);
    setSelectedJobIds(new Set());
  };

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobIds(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  const openJobDetails = (job: Job) => {
    if (!isAuthenticated) {
      promptLogin("Login to view job details", "Sign in to unlock full job descriptions, application links, and job-by-job actions.");
      return;
    }
    setSelectedDetailsJob(job);
    setDetailsOpen(true);
  };

  const renderJobCard = (job: Job, index: number) => {
    const isApplied = appliedJobIds.has(String(job.id));
    const historyItem = appliedHistoryItems.find(item => String(item.job_id) === String(job.id));
    const isQueued = historyItem ? historyItem.status === "queued" : false;
    const isSaved = savedJobs.includes(job.id);
    const isSelectable = bulkSelectMode && job.apply_url && job.apply_url !== '#' && job.source !== 'employer';
    const isSelected = selectedJobIds.has(String(job.id));

    return (
    <motion.div
      key={`${job.id}-${index}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.03 * (index % 10) }}
      onClick={isSelectable ? () => toggleJobSelection(String(job.id)) : undefined}
      className={`group relative rounded-[28px] border bg-white/[0.03] backdrop-blur-md p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)] ${isSelectable ? 'cursor-pointer' : ''} ${isSelected ? 'border-teal-500/60 bg-teal-500/[0.07] ring-1 ring-teal-500/30' : job.source === 'employer' ? 'border-teal-500/25 hover:border-teal-500/40' : 'border-white/[0.08] hover:border-white/[0.15]'} ${isApplied && !bulkSelectMode ? 'opacity-60' : ''}`}
    >
      {/* Selection checkbox */}
      {isSelectable && (
        <div className={`absolute top-4 left-4 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-teal-500 border-teal-500' : 'border-white/30 bg-white/5'}`}>
          {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
        </div>
      )}
      <div className="flex items-center gap-5">
        {/* Company icon */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-white/[0.06] border border-white/10">
          <Building2 className="h-7 w-7 text-slate-400" />
        </div>

        {/* Job info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <button type="button" className="text-left text-lg font-black text-white tracking-tight hover:text-teal-400 transition-colors leading-snug" onClick={() => openJobDetails(job)}>{job.title}</button>
            {isApplied && (
              <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                isQueued
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-teal-500/10 text-teal-400 border border-teal-500/20"
              }`}>
                {isQueued ? (
                  <>
                    <Clock className="h-3 w-3 animate-pulse" />
                    Queued
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    Applied
                  </>
                )}
              </div>
            )}
            {job.source === 'employer' && (
              <div className="flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-400 border border-teal-500/20">
                <Zap className="h-3 w-3 fill-current" />
                Verified
              </div>
            )}
          </div>
          {job.company_slug ? (
            <button type="button" className="text-sm font-bold text-slate-400 hover:text-teal-400 transition-colors" onClick={() => navigate(`/companies/${job.company_slug}`)}>{job.company}</button>
          ) : (
            <p className="text-sm font-bold text-slate-400">{job.company}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
            {job.location && <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-600" />{job.location}</div>}
            {job.salary && <div className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-slate-600" />{job.salary}</div>}
            {job.posted && <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-600" />{job.posted}</div>}
          </div>
          {isAuthenticated && job.match_reason ? (
            <p className="mt-1.5 text-[13px] font-medium text-slate-500 leading-relaxed">{job.match_reason}</p>
          ) : null}
        </div>

        {/* Right side: bookmark + action buttons */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => toggleSave(job.id)} className={`h-8 w-8 rounded-xl border ${isSaved ? "border-teal-500/40 bg-teal-500/10 text-teal-400" : "border-white/10 bg-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10"}`}>
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          </Button>
          <div className="flex flex-col gap-2 mt-1">
            {job.source !== 'employer' && job.apply_url && job.apply_url !== '#' && (
              <ApplyBotButton
                jobUrl={job.apply_url}
                jobTitle={job.title}
                company={job.company}
                jobId={String(job.id)}
                alreadyApplied={appliedJobIds.has(String(job.id))}
                onApplied={(id) => {
                  setAppliedJobIds(prev => new Set(prev).add(id));
                  setAppliedHistoryItems(prev => {
                    if (prev.some(a => String(a.job_id) === id)) return prev;
                    return [{ id, job_id: id, job_title: job.title, company: job.company, status: "submitted", delivery_method: "bot", job_url: job.apply_url, created_at: new Date().toISOString() }, ...prev];
                  });
                }}
                onDismiss={() => setDismissedJobIds(prev => {
                  const next = new Set(prev).add(String(job.id));
                  try { localStorage.setItem("dismissed_bot_jobs", JSON.stringify([...next])); } catch {}
                  return next;
                })}
              />
            )}
            <Button variant="outline" size="sm" className="h-10 rounded-xl px-5 font-black uppercase tracking-widest text-[10px] border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white" onClick={() => openJobDetails(job)}>View Details</Button>
          </div>
        </div>
      </div>
    </motion.div>
    );
  };

  const getFilteredCityOptions = () => {
    if (!filters.country) {
      return cityOptions || [];
    }

    const countryKey = Object.keys(cityMap).find(
      (key) => key.toLowerCase() === filters.country!.toLowerCase()
    );

    if (!countryKey) {
      return cityOptions || [];
    }

    const countryCities = cityMap[countryKey] || [];

    const mapped = countryCities.map((cityName) => {
      const found = (cityOptions || []).find(
        (co) => co.value.toLowerCase() === cityName.toLowerCase()
      );
      return {
        value: cityName,
        label: cityName,
        count: found ? found.count : 0,
      };
    });

    return mapped.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.label.localeCompare(b.label);
    });
  };

  const renderFilters = () => {
    const filteredCities = getFilteredCityOptions();
    
    return (
      <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-5 xl:sticky xl:top-24">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Search Engine</p>
            <h3 className="mt-1 text-lg font-semibold text-white tracking-tight">Refine Results</h3>
          </div>
          <button type="button" onClick={resetFilters} className="text-[10px] font-black text-slate-500 hover:text-teal-400 transition-colors uppercase tracking-[0.15em]">Reset All</button>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Search Keywords</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={filters.title || ""}
                onChange={(e) => setFilters((p) => ({ ...p, title: e.target.value }))}
                placeholder="Design, Engineering, etc..."
                className="w-full rounded-[20px] border border-white/10 bg-white/[0.05] py-4 pl-11 pr-4 text-sm font-bold text-slate-100 placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/40 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="filter-department" className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Department</label>
            <select
              id="filter-department"
              value={filters.department || ""}
              onChange={(e) => setFilters((p) => ({ ...p, department: e.target.value }))}
              className="w-full rounded-[20px] border border-white/10 bg-white/[0.05] px-4 py-4 text-sm font-bold text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/40 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#0a0f1e]">All Categories</option>
              {departmentOptions.map((choice) => <option key={choice.value} value={choice.value} className="bg-[#0a0f1e]">{choice.label}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="filter-employment" className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Engagement</label>
            <select
              id="filter-employment"
              value={filters.employment_type || ""}
              onChange={(e) => setFilters((p) => ({ ...p, employment_type: e.target.value }))}
              className="w-full rounded-[20px] border border-white/10 bg-white/[0.05] px-4 py-4 text-sm font-bold text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/40 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#0a0f1e]">Any Type</option>
              {employmentOptions.map((choice) => <option key={choice.value} value={choice.value} className="bg-[#0a0f1e]">{choice.label}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="filter-country" className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Country</label>
            <select
              id="filter-country"
              value={filters.country || ""}
              onChange={(e) => setFilters((p) => ({ ...p, country: e.target.value, city: "" }))}
              disabled={isLoadingLocations}
              className="w-full rounded-[20px] border border-white/10 bg-white/[0.05] px-4 py-4 text-sm font-bold text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/40 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#0a0f1e]">{isLoadingLocations ? "Loading..." : "Everywhere"}</option>
              {(filterCountryOptions || []).map((country) => (
                <option key={`country-${country.value}`} value={country.value} className="bg-[#0a0f1e]">
                  {country.label} ({country.count})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="filter-city" className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">City</label>
            <select
              id="filter-city"
              value={filters.city || ""}
              onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}
              disabled={isLoadingFilterOptions || filteredCities.length === 0}
              className="w-full rounded-[20px] border border-white/10 bg-white/[0.05] px-4 py-4 text-sm font-bold text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/40 transition-all appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="" className="bg-[#0a0f1e]">
                {isLoadingFilterOptions ? "Loading cities..." : filters.country ? "All Cities" : "All Cities Worldwide"}
              </option>
              {filteredCities.map((city) => (
                <option key={`city-${city.value}`} value={city.value} className="bg-[#0a0f1e]">
                  {city.label} ({city.count})
                </option>
              ))}
            </select>
            <p className="ml-1 text-[11px] font-semibold text-slate-600">
              {filters.country ? `Showing cities with jobs in ${filters.country}.` : "Choose a country to narrow city counts."}
            </p>
          </div>

        <Button
          type="button"
          className="mt-2 w-full h-14 rounded-[24px] bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-teal-500/20 transition-all active:scale-[0.97] hover:-translate-y-0.5"
          onClick={handleSidebarFilterSubmit}
        >
          {isLandingMode ? "Find Matches" : "Update Results"}
        </Button>
      </div>
    </div>
  );
};

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
    <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-5 xl:sticky xl:top-24">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Special Categories</p>
        <h3 className="mt-1 text-lg font-semibold text-white">Quick Job Picks</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Jump into curated searches for niche and senior-level roles.
        </p>
      </div>

      <div className="space-y-3">
        {curatedLandingSections.map((section) => {
          const Icon = iconMap[section.icon] || Briefcase;
          return (
            <div key={section.key} className="rounded-[20px] border border-white/[0.06] bg-white/[0.03] p-4">
              <button
                type="button"
                onClick={() => handleCuratedSectionSelect(section)}
                className="flex w-full items-start gap-3 text-left"
              >
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/10 text-slate-400">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-200">{section.title}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">{section.description}</p>
                </div>
              </button>

              <div className="mt-3 flex flex-wrap gap-2">
                {section.searchTerms.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleCuratedSectionSelect(section, term)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:border-teal-500/40 hover:text-teal-300 hover:bg-teal-500/10"
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
      <main className="pt-16 bg-[#0a0f1e] min-h-screen">

        {/* ── Hero Section (landing only) ── */}
        {isLandingMode && (
          <section className="relative overflow-hidden bg-[#0a0f1e] px-4 pt-20 pb-16">
            {/* Atmospheric glows */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-teal-600/15 blur-[120px]" />
              <div className="absolute top-1/3 -left-20 h-[300px] w-[300px] rounded-full bg-violet-700/15 blur-[100px]" />
              <div className="absolute top-1/3 -right-20 h-[300px] w-[300px] rounded-full bg-rose-600/10 blur-[100px]" />
              <div
                className="absolute inset-0 opacity-[0.025]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
              />
            </div>

            <div className="relative mx-auto max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                  AI-Powered Job Search
                </p>
                <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-7xl leading-tight">
                  Find your{" "}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-teal-400 via-violet-400 to-rose-400 bg-clip-text text-transparent">
                      dream job
                    </span>
                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-teal-400/50 via-violet-400/50 to-rose-400/50" />
                  </span>{" "}
                  now
                </h1>
                <p className="mt-6 text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
                  Search thousands of roles, explore curated categories, and sign up to unlock AI-powered tools.
                </p>
              </motion.div>
            </div>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={(e) => { e.preventDefault(); handlePrimarySearch(); }}
              className="relative mx-auto mt-10 max-w-2xl flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-md p-2 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Python developer in USA"
                  className="w-full rounded-xl bg-white/[0.05] py-3 pl-10 pr-9 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-teal-500/40 focus:bg-white/10 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 text-slate-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <Button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold px-7 py-3 h-auto shrink-0 shadow-lg shadow-teal-500/25"
              >
                {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
            </motion.form>

            {/* Quick-filter tags & Magic Search */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mx-auto mt-5 max-w-2xl flex flex-wrap justify-center gap-2 items-center"
            >
              {isAuthenticated && activeResume?.targetJobRole && (
                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => {
                    setSearchQuery(activeResume.targetJobRole || "");
                    navigateToJobs(activeResume.targetJobRole || "", filters, true);
                  }}
                  className="rounded-full bg-white/10 border-white/15 text-white hover:bg-white/15 px-4 py-1.5 h-auto text-xs gap-2"
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
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-400 hover:border-teal-500/40 hover:text-teal-300 hover:bg-teal-500/10 transition-all"
                >
                  {tag}
                </button>
              ))}
            </motion.div>
          </section>
        )}

        {/* ── Browse Categories (landing only) ── */}
        {isLandingMode && showDiscoveryCards && (
          <section className="relative overflow-hidden bg-[#0a0f1e] border-t border-white/[0.06] px-6 py-20">
            {/* Subtle glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[200px] w-[600px] rounded-full bg-teal-500/8 blur-[80px]" />
            </div>
            <div className="relative mx-auto max-w-6xl">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 backdrop-blur-sm">
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
                      className="group flex flex-col items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-6 text-center hover:border-teal-500/40 hover:bg-teal-500/[0.06] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_-8px_rgba(20,184,166,0.2)]"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 group-hover:border-teal-500/40 group-hover:bg-teal-500/15 transition-all duration-300">
                        {isLoading && !card.icon ? (
                          <div className="h-5 w-5 rounded-full bg-white/10 animate-pulse" />
                        ) : (
                          <Icon className="h-5 w-5 text-slate-400 group-hover:text-teal-400 transition-colors duration-300" />
                        )}
                      </div>

                      <div className="w-full">
                        {isLoading && !card.label ? (
                          <div className="h-4 w-16 bg-white/10 rounded-full mx-auto animate-pulse mb-1.5" />
                        ) : (
                          <p className="text-sm font-bold text-slate-200 group-hover:text-teal-300 transition-colors leading-tight">{card.label}</p>
                        )}
                        {isLoading ? (
                          <div className="h-3 w-10 bg-white/10 rounded-full mx-auto mt-1.5 animate-pulse" />
                        ) : (
                          <p className="text-[10px] text-slate-600 font-semibold mt-1 uppercase tracking-wider group-hover:text-teal-500/80 transition-colors">
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
                    Join 50,000+ professionals who found their next role faster with CareerAI.
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
          <section className="relative px-2 pt-28 pb-20 sm:px-4 lg:px-6 overflow-hidden">
            {/* Rich graphic background */}
            <div className="pointer-events-none absolute inset-0">
              {/* Atmospheric color glows */}
              <div className="absolute -top-40 left-1/4 h-[600px] w-[700px] rounded-full bg-violet-700/15 blur-[140px]" />
              <div className="absolute top-1/3 -right-20 h-[400px] w-[500px] rounded-full bg-teal-500/10 blur-[120px]" />
              <div className="absolute bottom-1/4 left-0 h-[350px] w-[400px] rounded-full bg-rose-600/8 blur-[100px]" />
              <div className="absolute bottom-0 right-1/3 h-[250px] w-[350px] rounded-full bg-sky-600/8 blur-[100px]" />
              {/* Dot pattern */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
              />
              {/* Subtle grid lines */}
              <div
                className="absolute inset-0 opacity-[0.015]"
                style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "80px 80px" }}
              />
              {/* Top edge glow line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
            </div>
            <div className="relative mx-auto max-w-[1550px]">
              <div className="max-w-3xl mx-auto text-center mb-14">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-400 mb-4">Discovery Engine</p>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  Explore jobs with{" "}
                  <span className="bg-gradient-to-r from-teal-400 to-violet-400 bg-clip-text text-transparent">visible filters</span>
                </h2>
                <div className="mt-6 h-px w-20 bg-gradient-to-r from-teal-500/50 to-violet-500/50 mx-auto rounded-full" />
              </div>

              <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
                <Button type="button" variant="outline" className="w-full gap-2 rounded-2xl border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 h-12 font-bold" onClick={() => setShowMobileFilters((prev) => !prev)}>
                  <SlidersHorizontal className="h-4 w-4" />
                  {showMobileFilters ? "Hide Filters" : "Show Filters"}
                </Button>
              </div>

              {showMobileFilters && <div className="mb-5 lg:hidden">{renderFilters()}</div>}

              <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_280px]">
                <aside className="hidden lg:block">{renderFilters()}</aside>
                <div className="space-y-5">
                  {/* Personalized banner */}
                  <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-md px-5 py-4 space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        {isRefreshing || isApifySearching || serpApiLoading ? (
                          <><Loader2 className="h-4 w-4 animate-spin text-teal-400" />Searching live jobs...</>
                        ) : (
                          <>
                            <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1 font-semibold text-white">
                              {serpApiEnabled ? serpApiJobs.length + displayJobs.length : displayJobs.length}
                            </span>
                            <span>
                              {serpApiEnabled 
                                ? `${serpApiJobs.length + displayJobs.length} jobs found (inc. Google Jobs)`
                                : totalResults > jobs.length 
                                  ? `showing ${displayJobs.length} of ${totalResults} jobs` 
                                  : `${displayJobs.length} jobs found`
                              }
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {apifyStatus !== "idle" && apifyStatus !== "failed" && (
                          <div className="flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300">
                            {apifyStatus !== "completed" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            {apifyStatus === "completed" ? `${apifyResultCount} live Apify jobs added` : "Searching live sources"}
                          </div>
                        )}
                        {!isAuthenticated && <div className="rounded-full border border-teal-500/25 bg-teal-500/10 px-4 py-2 text-sm font-medium text-teal-400">Sign in to unlock full job details & apply.</div>}
                      </div>
                    </div>

                    {isAuthenticated && targetRole && searchQuery === targetRole && !filters.title && !filters.department && !filters.country && !filters.city && (
                      <div className="flex items-center justify-between rounded-2xl border border-violet-500/25 bg-violet-500/10 px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Sparkles className="h-4 w-4 text-violet-400 shrink-0" />
                          <p className="text-sm text-violet-200 font-semibold">
                            Showing jobs for your target role: <span className="text-violet-300 font-bold">{targetRole}</span>
                          </p>
                        </div>
                        <button
                          onClick={resetFilters}
                          className="text-[10px] text-violet-400 hover:text-violet-200 transition-colors font-semibold uppercase tracking-wider shrink-0 ml-3"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>


                  {(isInitialLoad || (isRefreshing || isApifySearching || serpApiLoading) && jobs.length === 0 && serpApiJobs.length === 0) ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className={`rounded-[28px] border border-white/[0.06] bg-white/[0.02] p-6 animate-pulse [animation-delay:${i * 80}ms]`}>
                          <div className="flex gap-4 items-start">
                            <div className="h-12 w-12 rounded-2xl bg-white/[0.05] shrink-0" />
                            <div className="flex-1 space-y-3 pt-1">
                              <div className="h-4 w-2/5 bg-white/[0.05] rounded-lg" />
                              <div className="h-3 w-1/4 bg-white/[0.04] rounded-lg" />
                              <div className="flex gap-2 pt-1">
                                <div className="h-5 w-16 rounded-full bg-white/[0.04]" />
                                <div className="h-5 w-20 rounded-full bg-white/[0.04]" />
                                <div className="h-5 w-14 rounded-full bg-white/[0.04]" />
                              </div>
                            </div>
                            <div className="h-8 w-24 rounded-full bg-white/[0.04] shrink-0" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (displayJobs.length > 0 || serpApiJobs.length > 0) ? (
                    <div className="space-y-16">
                      {/* Feed tabs */}
                      <div className="pb-3 border-b border-white/[0.08] mb-8 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setFeedTab("discover")}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                            feedTab === "discover"
                              ? "bg-white/[0.08] text-white border border-white/20"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Discover
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10">
                            {serpApiJobs.length + displayJobs.filter(j => !appliedJobIds.has(String(j.id))).length}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setFeedTab("applied"); loadAppliedHistory(); }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                            feedTab === "applied"
                              ? "bg-teal-500/10 text-teal-300 border border-teal-500/30"
                              : "text-slate-500 hover:text-teal-400"
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Applied
                          {appliedJobIds.size > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400">
                              {appliedJobIds.size}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Applied tab view */}
                      {feedTab === "applied" && (
                        <div className="space-y-4">
                          {appliedHistoryItems.length === 0 ? (
                            <div className="text-center py-20 text-slate-500">
                              <CheckCircle2 className="h-10 w-10 mx-auto mb-4 opacity-30" />
                              <p className="font-bold uppercase tracking-widest text-sm">No applied jobs yet</p>
                              <p className="text-xs mt-2">Jobs you apply to will appear here</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {[...appliedHistoryItems]
                                .sort((a, b) => {
                                  const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                                  const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                                  return dateB - dateA;
                                })
                                .map((item, index) => {
                                // Prefer: display job match → resolved via fetch/lever → synthetic fallback
                                const jid = item.job_id ? String(item.job_id) : null;
                                const fromDisplay = jid ? displayJobs.find(j => String(j.id) === jid) : undefined;
                                const resolved = appliedResolvedJobs.get(String(item.id));
                                const rawTitle = item.job_title || "";
                                const isUrlTitle = /^https?:\/\//.test(rawTitle);
                                const jobToRender: Job = fromDisplay ?? resolved ?? {
                                  id: item.job_id || item.id,
                                  title: rawTitle && !isUrlTitle ? rawTitle : "Applied Job",
                                  company: item.company || "",
                                  location: "",
                                  salary: "",
                                  posted: item.created_at ? new Date(item.created_at).toLocaleDateString() : "Applied",
                                  match: 0,
                                  tags: [],
                                  saved: false,
                                  hasEmail: false,
                                  apply_url: item.job_url || undefined,
                                  url: item.job_url || undefined,
                                  source: "external",
                                };
                                return renderJobCard(jobToRender, index);
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* All Jobs — single flat list, 10 per page */}
                      {feedTab === "discover" && pagedJobs.length > 0 && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between px-4 bg-teal-500/[0.06] py-3 rounded-2xl border border-teal-500/20">
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-teal-400 fill-teal-400" />
                              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-teal-300">
                                Fresh Matches <span className="mx-2 text-white/20">|</span> <span className="text-teal-400">Quick Apply Ready</span>
                              </h3>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black uppercase text-slate-500">
                                {displayJobs.filter(j => !appliedJobIds.has(String(j.id))).length} jobs
                              </span>
                              {isAuthenticated && !botMultiTasks && !bulkSelectMode && displayJobs.filter(j => !appliedJobIds.has(String(j.id)) && j.apply_url && j.apply_url !== '#' && j.source !== 'employer').length > 0 && (
                                <button
                                  type="button"
                                  onClick={enterBulkSelectMode}
                                  className="flex items-center gap-2 rounded-full bg-teal-500 hover:bg-teal-400 shadow-lg shadow-teal-500/30 text-white text-sm font-black px-6 py-2.5 transition-all hover:-translate-y-0.5"
                                >
                                  <Bot className="h-4 w-4" />
                                  Bot Apply All
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="space-y-6">
                            {pagedJobs.filter(j => !appliedJobIds.has(String(j.id))).map((job, index) => renderJobCard(job, index))}
                          </div>
                        </div>
                      )}

                      {/* 2. SerpAPI Google Jobs Section */}
                      {feedTab === "discover" && (serpApiJobs.length > 0 || serpApiLoading) && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between px-4 bg-gradient-to-r from-orange-500/[0.08] to-amber-500/[0.04] py-3 rounded-2xl border border-orange-500/20">
                            <div className="flex items-center gap-3">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/15">
                                <Globe2 className="h-4 w-4 text-orange-400" />
                              </div>
                              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-orange-200">
                                Google Jobs <span className="mx-2 text-white/10">|</span> <span className="text-orange-400/70">SerpAPI Live</span>
                              </h3>
                            </div>
                            <span className="text-[10px] font-black uppercase text-orange-400">
                              {serpApiJobs.length} Results
                            </span>
                          </div>
                          <div className="space-y-6">
                            {serpApiLoading && serpApiJobs.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-orange-500/10 bg-orange-500/5">
                                <Loader2 className="h-6 w-6 animate-spin text-orange-400 mb-3" />
                                <p className="text-sm text-orange-300 font-medium">Fetching live Google Jobs...</p>
                              </div>
                            ) : (
                              serpApiJobs.map((job, index) => renderJobCard(job, index))
                            )}
                          </div>

                          {serpApiHasMore && (
                            <div className="pt-4 flex justify-center">
                              <Button
                                onClick={loadMoreSerpApiJobs}
                                disabled={isSerpApiLoadingMore}
                                variant="outline"
                                className="rounded-full border-orange-500/20 bg-orange-500/5 text-orange-300 hover:bg-orange-500/10 hover:text-orange-200 min-w-[200px]"
                              >
                                {isSerpApiLoadingMore ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Loading...
                                  </>
                                ) : (
                                  <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Load More Google Jobs
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}


                    </div>
                  ) : (
                    <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-md px-6 py-16 text-center">
                      <Briefcase className="mx-auto mb-4 h-12 w-12 text-slate-600" />
                      <h3 className="text-xl font-semibold text-white">No jobs found</h3>
                      <p className="mt-2 text-sm text-slate-500">
                        Try broadening your search or clearing some filters.
                      </p>
                      <Button variant="outline" className="mt-3 rounded-full border-white/10 bg-white/5 text-slate-300 hover:bg-white/10" onClick={resetFilters}><X className="mr-2 h-4 w-4" />Reset All Filters</Button>
                    </div>
                  )}

                  {/* Numbered pagination */}
                  {displayJobs.length > JOBS_PER_PAGE && (
                    <div className="flex items-center justify-center gap-1.5 py-6">
                      <button
                        type="button"
                        disabled={displayPage === 1}
                        onClick={() => { setDisplayPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        ‹ Prev
                      </button>
                      {Array.from({ length: Math.min(totalDisplayPages, 7) }, (_, i) => {
                        let p: number;
                        if (totalDisplayPages <= 7) { p = i + 1; }
                        else if (i === 0) { p = 1; }
                        else if (i === 6) { p = totalDisplayPages; }
                        else if (displayPage <= 4) { p = i + 1; }
                        else if (displayPage >= totalDisplayPages - 3) { p = totalDisplayPages - 6 + i; }
                        else { p = displayPage - 3 + i; }
                        const isEllipsis = totalDisplayPages > 7 && ((i === 1 && p > 2) || (i === 5 && p < totalDisplayPages - 1));
                        if (isEllipsis) return <span key={i} className="text-slate-600 px-1">…</span>;
                        return (
                          <button
                            type="button"
                            key={p}
                            onClick={() => { setDisplayPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${displayPage === p ? 'bg-teal-500 text-white' : 'border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}
                          >
                            {p}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        disabled={displayPage === totalDisplayPages}
                        onClick={() => {
                          setDisplayPage(p => Math.min(totalDisplayPages, p + 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        Next ›
                      </button>
                    </div>
                  )}
                  <div ref={observerTarget} />
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
      <JobDetailsSheet
        job={selectedDetailsJob}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        appliedJobIds={appliedJobIds}
        onBotApplied={(id) => {
          setAppliedJobIds(prev => new Set(prev).add(id));
          setAppliedHistoryItems(prev => prev.some(a => String(a.job_id) === id) ? prev : prev);
        }}
      />

      {/* Multi-apply progress panel */}
      {botMultiTasks && (
        <BotMultiApplyPanel
          jobs={botMultiTasks}
          onClose={() => setBotMultiTasks(null)}
        />
      )}

      {/* Bulk select mode — floating action bar */}
      {bulkSelectMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d1424]/95 backdrop-blur-xl px-5 py-3 shadow-2xl shadow-black/60">
          <div className="text-sm font-bold text-white">
            {selectedJobIds.size === 0 ? (
              <span className="text-slate-400">Click cards to select jobs</span>
            ) : (
              <span><span className="text-teal-400">{selectedJobIds.size}</span> job{selectedJobIds.size !== 1 ? 's' : ''} selected</span>
            )}
          </div>
          <div className="h-4 w-px bg-white/10" />
          <button
            type="button"
            disabled={selectedJobIds.size === 0}
            onClick={() => {
              const allJobs = [...displayJobs, ...serpApiJobs];
              const chosen = allJobs.filter(j => selectedJobIds.has(String(j.id)));
              handleBulkBotApply(chosen);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-black px-4 py-2 transition-all"
          >
            <Bot className="h-3.5 w-3.5" />
            Apply to Selected
          </button>
          <button
            type="button"
            onClick={() => { setBulkSelectMode(false); setSelectedJobIds(new Set()); }}
            className="flex items-center gap-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-400 hover:text-white text-[11px] font-black px-4 py-2 transition-all"
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
}
