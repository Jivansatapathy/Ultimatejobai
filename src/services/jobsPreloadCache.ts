import {
  searchJobs,
  fetchJobFilterOptions,
  fetchJobLocationOptions,
  fetchAllCountries,
  JobSearchFilters,
  JobSearchResponse,
} from "./jobService";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  result: JobSearchResponse;
  query: string;
  timestamp: number;
}

let _cache: CacheEntry | null = null;
let _inflight: Promise<JobSearchResponse> | null = null;

/**
 * Fire-and-forget: kick off a background jobs fetch so it is ready by the
 * time the user navigates to /jobs. Safe to call multiple times — de-duped.
 */
export function prefetchJobs(query: string, filters: JobSearchFilters = {}): void {
  if (_inflight) return;
  if (_cache && _cache.query === query && Date.now() - _cache.timestamp < CACHE_TTL_MS) return;

  _inflight = searchJobs(query, 1, filters)
    .then((result) => {
      _cache = { result, query, timestamp: Date.now() };
      _inflight = null;
      return result;
    })
    .catch(() => {
      _inflight = null;
      return null as unknown as JobSearchResponse;
    });
}

/**
 * Prefetch ALL data the Jobs page needs on mount so every panel loads instantly.
 * - Jobs results (via prefetchJobs, de-duped internally)
 * - Filter options  → GET /api/search/filters/  (cached by api.get)
 * - Location options → GET /api/search/locations/ (cached by api.get)
 * - Countries list   → GET /api/search/countries/ (cached by api.get)
 */
export function prefetchJobsPage(query: string, filters: JobSearchFilters = {}): void {
  prefetchJobs(query, filters);
  // Fire-and-forget — api.get caches the responses automatically
  fetchJobFilterOptions(query, filters).catch(() => {});
  fetchJobLocationOptions().catch(() => {});
  fetchAllCountries().catch(() => {});
}

/**
 * Returns a Promise for the preloaded result if one is in-flight or already
 * cached. Returns null if no prefetch was started.
 */
export function waitForPrefetch(query: string): Promise<JobSearchResponse> | null {
  if (_cache && _cache.query === query && Date.now() - _cache.timestamp < CACHE_TTL_MS) {
    return Promise.resolve(_cache.result);
  }
  if (_inflight) return _inflight;
  return null;
}

export function clearJobsPreloadCache(): void {
  _cache = null;
  _inflight = null;
}
