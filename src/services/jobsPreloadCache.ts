import { searchJobs, JobSearchFilters, JobSearchResponse } from "./jobService";

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
  if (_inflight) return; // already in-flight
  if (_cache && _cache.query === query && Date.now() - _cache.timestamp < CACHE_TTL_MS) return; // fresh cache

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
