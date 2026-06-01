import axios from 'axios';
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import api from './api';

export interface LeverJobDetails {
    text: string;
    description: string;
    descriptionHtml: string;
    lists: Array<{ text: string; content: string }>;
    additional: string;
    additionalHtml: string;
}

export const fetchLeverJobDetails = async (
    companySlug: string,
    jobId: string
): Promise<LeverJobDetails | null> => {
    try {
        const response = await axios.get(`https://api.lever.co/v0/postings/${companySlug}/${jobId}`);
        return response.data;
    } catch (error) {
        return null;
    }
};

export const fetchJobById = async (jobId: string): Promise<Job | null> => {
    try {
        const response = await api.get(`/api/search/${jobId}/`);
        const job = response.data;

        return {
            id: job.id,
            title: job.title || 'Untitled Role',
            company: job.company?.name || 'Unknown Company',
            company_slug: job.source === 'employer' ? (job.company?.slug || undefined) : undefined,
            quick_apply_enabled: job.quick_apply_enabled ?? true,
            quick_apply_questions: Array.isArray(job.quick_apply_questions) ? job.quick_apply_questions : [],
            hasEmail: Boolean(job.company?.has_email || job.company?.email || job.source === 'employer'),
            location: flatten(job.location) || 'Remote',
            salary: job.salary || flatten(job.employment_type) || 'Competitive',
            posted: job.posted_at ? new Date(job.posted_at).toLocaleDateString() : 'Recently',
            match: job.match_score || job.match || stableMatch(job.id),
            match_reason: job.match_reason || "",
            tags: [flatten(job.department), flatten(job.employment_type)].filter(Boolean),
            saved: false,
            description: job.description || '',
            url: job.source_url || job.job_url || '#',
            apply_url: job.apply_url || job.source_url || job.job_url || '#',
            platform: job.platform || 'other',
            source: job.source || 'scraped',
        };
    } catch (error) {
        return null;
    }
};

export interface Job {
    id: string | number;
    title: string;
    company: string;
    company_slug?: string;
    quick_apply_enabled?: boolean;
    quick_apply_questions?: string[];
    location: string;
    salary?: string;
    posted: string;
    match: number;
    tags: string[];
    saved: boolean;
    description?: string;
    url?: string;
    apply_url?: string;
    hasEmail: boolean;
    platform?: string;
    source?: string;
    isDemoJob?: boolean;
    match_reason?: string;
}

export interface JobSearchResponse {
    jobs: Job[];
    hasNext: boolean;
    totalResults: number;
}

export type ApifySearchStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed';

export interface ApifySearchRequest {
    keywords: string[];
    locations: string[];
    sources?: string[];
    is_remote?: boolean;
    page?: number;
    page_size?: number;
}

export interface ApifySearchCreateResponse {
    firestore_doc_id: string;
    search_job_id: string;
    status: ApifySearchStatus;
    message?: string;
}

export interface ApifySearchSnapshot {
    status: ApifySearchStatus;
    total_results: number;
    results_count: number;
    results: unknown[];
    error_message?: string;
}

export interface JobLocationOptions {
    countries: string[];
    regions: string[];
    cities: string[];
    regionMap: Record<string, string[]>;
    cityMap: Record<string, string[]>;
    cityMapByRegion: Record<string, Record<string, string[]>>;
}

export interface CountedFilterOption {
    value: string;
    label: string;
    count: number;
}

export interface FeaturedFilterOption {
    label: string;
    count: number;
}

export interface DefaultDiscoveryFilter {
    label: string;
    icon: string;
    filters: JobSearchFilters;
    count: number;
}

export interface JobFilterOptionsResponse {
    departments: CountedFilterOption[];
    employmentTypes: CountedFilterOption[];
    workplaceTypes: CountedFilterOption[];
    countries: CountedFilterOption[];
    cities: CountedFilterOption[];
    defaultFilters: DefaultDiscoveryFilter[];
}

export interface JobSearchFilters {
    title?: string;
    department?: string;
    location?: string;
    employment_type?: string;
    workplace_type?: string;
    country?: string;
    city?: string;
    page_size?: number;
    primary_search?: string;
    serpapi?: string;
}

export const JOB_SEARCH_MAX_RESULTS = 50;
export const JOB_SEARCH_PROVIDER = (import.meta.env.VITE_JOB_SEARCH_PROVIDER || 'api').toLowerCase();
export const JOBFINDER_API_BASE_URL = (import.meta.env.VITE_JOBFINDER_API_BASE_URL || 'http://localhost:8081').replace(/\/$/, '');
export const isJobFinderSearchEnabled = () => JOB_SEARCH_PROVIDER === 'jobfinder';


// Deterministic pseudo-random score from job id so it doesn't re-randomise on every fetch
const stableMatch = (id: string | number): number => {
    const s = String(id);
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    return 72 + (Math.abs(h) % 27); // 72–98 range
};

const flatten = (val: unknown): string => {
    if (!val) return '';
    if (typeof val === 'string') {
        if (val.startsWith('{') && val.endsWith('}')) {
            try {
                const parsed = JSON.parse(val.replace(/'/g, '"'));
                return parsed.label || parsed.name || parsed.text || parsed.value || val;
            } catch {
                return val;
            }
        }
        return val;
    }
    if (typeof val === 'object') {
        const record = val as Record<string, unknown>;
        return String(record.label || record.name || record.text || record.value || JSON.stringify(val));
    }
    return String(val);
};

const firstText = (record: Record<string, unknown>, keys: string[]): string => {
    for (const key of keys) {
        const value = flatten(record[key]);
        if (value) return value;
    }
    return '';
};

const nestedText = (value: unknown, keys: string[]): string => {
    if (!value || typeof value !== 'object') return '';
    const record = value as Record<string, unknown>;
    return firstText(record, keys);
};

const formatApifyLocation = (value: unknown): string => {
    if (Array.isArray(value)) {
        const locations = value
            .map((item) => {
                if (!item || typeof item !== 'object') return flatten(item);
                const record = item as Record<string, unknown>;
                return firstText(record, ['location']) || [firstText(record, ['city']), firstText(record, ['state']), firstText(record, ['country'])].filter(Boolean).join(', ');
            })
            .filter(Boolean);
        return locations.join(' • ');
    }

    return flatten(value);
};

const formatApifyCompensation = (value: unknown): string => {
    if (!value || typeof value !== 'object') return flatten(value);
    const record = value as Record<string, unknown>;
    const rawText = firstText(record, ['raw_text', 'rawText']);
    if (rawText) return rawText;

    const min = Number(record.min || 0);
    const max = Number(record.max || 0);
    const currency = firstText(record, ['currency']) || 'USD';
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${currency} ${min.toLocaleString()}+`;
    return '';
};

const formatPostedDate = (value: string) => {
    if (!value) return 'Recently';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
};

export const mapApifyResultToJob = (raw: unknown, index: number): Job => {
    const record = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const company = nestedText(record.company, ['name', 'label', 'text', 'value']) || firstText(record, ['company_name', 'organization', 'employer', 'companyName']);
    const postedDate = firstText(record, ['posted_date', 'postedDate', 'postedAt', 'posted_at', 'date_posted', 'datePosted', 'publishedAt']);
    const source = firstText(record, ['source', 'platform', 'job_board']) || nestedText(record.locations, ['source']) || 'apify';
    const url = firstText(record, ['apply_url', 'applyUrl', 'url', 'job_url', 'jobUrl', 'listing_url', 'listingUrl', 'source_url', 'sourceUrl', 'link']);
    const rawId = firstText(record, ['id', 'job_id', 'external_id', 'source_id']) || `${source}:${url || index}`;
    const stableId = `apify:${rawId}`;
    const location = formatApifyLocation(record.locations) || firstText(record, ['location', 'city', 'country']);
    const salary = formatApifyCompensation(record.compensation) || firstText(record, ['salary', 'salary_range']) || firstText(record, ['job_type', 'employment_type']);

    return {
        id: stableId,
        title: firstText(record, ['title', 'job_title', 'jobTitle', 'name', 'position']) || 'Untitled Role',
        company: company || 'Unknown Company',
        location: location || 'Remote',
        salary: salary || 'Competitive',
        posted: formatPostedDate(postedDate),
        match: Number(record.match_score || record.match) || stableMatch(stableId),
        tags: [
            firstText(record, ['job_type', 'employment_type']),
            firstText(record, ['workplace_type', 'workplaceType']),
            source,
        ].filter(Boolean),
        saved: false,
        description: firstText(record, ['description', 'summary', 'job_description']),
        url: url || '#',
        apply_url: url || '#',
        hasEmail: false,
        platform: source,
        source: 'apify',
    };
};

export const createApifySearch = async (
    payload: ApifySearchRequest,
): Promise<ApifySearchCreateResponse> => {
    const response = await api.post<ApifySearchCreateResponse>('/api/job-ingestion/apify-search/', payload);
    return response.data;
};

export const fetchApifySearchStatus = async (
    firestoreDocId: string,
): Promise<ApifySearchSnapshot> => {
    const response = await api.get<ApifySearchSnapshot>(`/api/job-ingestion/apify-search/${firestoreDocId}/`);
    return response.data;
};

export const subscribeApifySearch = (
    firestoreDocId: string,
    callback: (snapshot: ApifySearchSnapshot) => void,
    onError?: (error: Error) => void,
): Unsubscribe => {
    return onSnapshot(
        doc(db, 'apify_searches', firestoreDocId),
        (snapshot) => {
            const data = snapshot.exists() ? snapshot.data() : {};
            const results = Array.isArray(data.results) ? data.results : [];
            callback({
                status: (data.status as ApifySearchStatus) || 'pending',
                total_results: Number(data.total_results || results.length || 0),
                results_count: Number(data.results_count || results.length || 0),
                results,
                error_message: typeof data.error_message === 'string' ? data.error_message : undefined,
            });
        },
        onError,
    );
};

const PLATFORM_LABELS: Record<string, string> = {
    lever: 'Lever',
    greenhouse: 'Greenhouse',
    ashby: 'Ashby',
    smartrecruiters: 'SmartRecruiters',
    teamtailor: 'Teamtailor',
};

const mapJobFinderJob = (job: any, page: number): Job => {
    const applyUrl = job.apply_url || job.url || '#';
    const platform = (job.platform || 'lever').toLowerCase();
    const platformLabel = PLATFORM_LABELS[platform] || platform;
    const tags = [platformLabel, job.commitment || job.team].filter(Boolean) as string[];
    const jobId = `${platform}:${job.company}:${job.apply_url || page}`;
    return {
        id: jobId,
        title: job.title || 'Untitled Role',
        company: job.company || 'Unknown Company',
        company_slug: job.company || undefined,
        quick_apply_enabled: false,
        quick_apply_questions: [],
        hasEmail: false,
        location: job.location || 'View details',
        salary: job.commitment || 'Competitive',
        posted: job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently',
        match: stableMatch(jobId),
        match_reason: '',
        tags,
        saved: false,
        description: '',
        url: applyUrl,
        apply_url: applyUrl,
        platform,
        source: 'jobfinder',
    };
};

// Map a JOBAI DB result to the common Job shape
const mapDbJob = (job: any): Job => {
    const company = job.company || {};
    const companyName = typeof company === 'string' ? company : (company.name || 'Unknown Company');
    return {
        id: job.id,
        title: job.title || 'Untitled Role',
        company: companyName,
        company_slug: job.source === 'employer' ? (company.slug || undefined) : undefined,
        quick_apply_enabled: job.quick_apply_enabled ?? true,
        quick_apply_questions: Array.isArray(job.quick_apply_questions) ? job.quick_apply_questions : [],
        hasEmail: Boolean(company.has_email || company.email || job.source === 'employer'),
        location: flatten(job.location) || job.city || job.country || 'Remote',
        salary: job.salary || flatten(job.employment_type) || 'Competitive',
        posted: job.posted_at ? new Date(job.posted_at).toLocaleDateString() : 'Recently',
        match: job.match_score || stableMatch(job.id),
        match_reason: '',
        tags: [flatten(job.department), flatten(job.employment_type)].filter(Boolean) as string[],
        saved: false,
        description: job.description || '',
        url: job.apply_url || '#',
        apply_url: job.apply_url || '#',
        platform: job.platform || 'other',
        source: job.source || 'scraped',
    };
};

// Detect "medical writer in canada" → { role: "medical writer", country: "canada" }
const extractLocationFromText = (q: string): { role: string; country: string } => {
    const m = q.match(/^(.+?)\s+(?:in|at|for)\s+([a-zA-Z\s]{2,})$/i);
    if (m) return { role: m[1].trim(), country: m[2].trim() };
    return { role: q, country: '' };
};

// Merge DB (priority) + Serper results, dedup by apply_url
const mergeJobLists = (primary: Job[], secondary: Job[]): Job[] => {
    const seen = new Set(
        primary.map(j => (j.apply_url || '').toLowerCase().replace(/\/$/, ''))
    );
    const unique = secondary.filter(j => {
        const url = (j.apply_url || '').toLowerCase().replace(/\/$/, '');
        return url && url !== '#' && !seen.has(url);
    });
    return [...primary, ...unique];
};

export const searchJobs = async (
    query: string = '',
    page: number = 1,
    filters: JobSearchFilters = {}
): Promise<JobSearchResponse> => {
    try {
        if (isJobFinderSearchEnabled()) {
            // Step 1 — lift location out of query text if no explicit geo filter set
            // e.g. "medical writer in canada" → role="medical writer", country="canada"
            let effectiveQuery = query;
            let effectiveFilters = { ...filters };
            if (!filters.country && !filters.city && !filters.location && query) {
                const { role, country } = extractLocationFromText(query);
                if (country) {
                    effectiveQuery = role;
                    effectiveFilters = { ...filters, country };
                }
            }

            const hasGeoFilter   = !!(effectiveFilters.country || effectiveFilters.city);
            const hasAnyFilters  = !!(
                effectiveFilters.department || effectiveFilters.employment_type ||
                effectiveFilters.workplace_type || hasGeoFilter || effectiveFilters.location
            );

            // Step 2 — if any filter is active: DB via /api/filter (always)
            //           + Serper with country-scoped query when geo filter + keyword present
            if (hasAnyFilters) {
                const dbPromise = axios.get(`${JOBFINDER_API_BASE_URL}/api/filter`, {
                    params: {
                        search:           effectiveQuery || undefined,
                        department:       effectiveFilters.department       || undefined,
                        employment_type:  effectiveFilters.employment_type  || undefined,
                        workplace_type:   effectiveFilters.workplace_type   || undefined,
                        country:          effectiveFilters.country          || undefined,
                        city:             effectiveFilters.city             || undefined,
                        page,
                        page_size: 20,
                    },
                });

                // Serper: pass role as query + country/city as separate param
                // jobFinder /api/search formats: site:... "role" Country  (country unquoted)
                const serperPromise = effectiveQuery
                    ? axios.get(`${JOBFINDER_API_BASE_URL}/api/search`, {
                          params: {
                              query:   effectiveQuery,
                              page,
                              country: effectiveFilters.country  || undefined,
                              city:    effectiveFilters.city     || undefined,
                          },
                      }).catch(() => null)
                    : Promise.resolve(null);

                const [dbResp, serperResp] = await Promise.all([dbPromise, serperPromise]);

                const dbResults = Array.isArray(dbResp.data.results) ? dbResp.data.results : [];
                const dbJobs    = dbResults.map(mapDbJob);

                // Serper results — loosely filter by country name if geo filter is active
                const serperJobs: Job[] = [];
                if (serperResp && Array.isArray(serperResp.data?.jobs)) {
                    const countryLower = (effectiveFilters.country || '').toLowerCase();
                    serperResp.data.jobs.forEach((raw: any) => {
                        const mapped = mapJobFinderJob(raw, page);
                        if (!countryLower ||
                            (mapped.location || '').toLowerCase().includes(countryLower) ||
                            (raw.location   || '').toLowerCase().includes(countryLower)) {
                            serperJobs.push(mapped);
                        }
                    });
                }

                const merged      = mergeJobLists(dbJobs, serperJobs);
                const dbTotal     = Number(dbResp.data.meta?.total_results || 0);
                const hasNext     = Boolean(dbResp.data.meta?.has_next);
                const totalResults = dbTotal + serperJobs.length;

                return { jobs: merged, hasNext, totalResults };
            }

            // Step 3 — pure keyword (no geo/dept filter): Serper + DB merge via /api/search
            const response = await axios.get(`${JOBFINDER_API_BASE_URL}/api/search`, {
                params: {
                    query: effectiveQuery || filters.title || filters.department || 'jobs',
                    page,
                },
            });

            const data    = response.data;
            const rawJobs = Array.isArray(data.jobs) ? data.jobs : [];
            const remainingSlots = Math.max(0, JOB_SEARCH_MAX_RESULTS - ((page - 1) * 10));
            const mappedJobs = rawJobs.slice(0, remainingSlots).map((job: any) => mapJobFinderJob(job, page));
            const loadedCount = ((page - 1) * 10) + mappedJobs.length;
            const providerHasNext = Boolean(data.pagination?.has_next);
            return {
                jobs: mappedJobs,
                hasNext: providerHasNext && loadedCount < JOB_SEARCH_MAX_RESULTS && mappedJobs.length > 0,
                totalResults: providerHasNext ? JOB_SEARCH_MAX_RESULTS : Math.min(JOB_SEARCH_MAX_RESULTS, loadedCount),
            };
        }

        const { primary_search, ...otherFilters } = filters;
        const response = await api.get(`/api/search/`, {
            params: {
                search: query,
                page,
                primary_search: primary_search === 'true',
                ...otherFilters,
            },
        });

        const data = response.data;

        const results = Array.isArray(data.results) ? data.results : [];
        const hasNext = Boolean(data.meta?.has_next);
        const totalResults = Number(data.meta?.total_results || 0);

        const mappedJobs = results.map((job: any) => {
            return {
                id: job.id,
                title: job.title || 'Untitled Role',
                company: job.company?.name || 'Unknown Company',
                company_slug: job.source === 'employer' ? (job.company?.slug || undefined) : undefined,
                quick_apply_enabled: job.quick_apply_enabled ?? true,
                quick_apply_questions: Array.isArray(job.quick_apply_questions) ? job.quick_apply_questions : [],
                company_website: job.company?.website || null,
                hasEmail: Boolean(job.company?.has_email || job.company?.email || job.source === 'employer'),
                location: flatten(job.location) || 'Remote',
                salary: job.salary || flatten(job.employment_type) || 'Competitive',
                posted: job.posted_at ? new Date(job.posted_at).toLocaleDateString() : 'Recently',
                match: job.match_score || job.match || stableMatch(job.id),
                match_reason: job.match_reason || "",
                tags: [flatten(job.department), flatten(job.employment_type)].filter(Boolean),
                saved: false,
                description: job.description || '',
                url: job.source_url || job.job_url || '#',
                apply_url: job.apply_url || job.source_url || job.job_url || '#',
                platform: job.platform || 'other',
                source: job.source || 'scraped',
            };
        });

        return { jobs: mappedJobs, hasNext, totalResults };
    } catch (error: any) {
        if (error.response?.status === 404 && error.response?.data?.detail === 'Invalid page.') {
            return {
                jobs: [],
                hasNext: false,
                totalResults: 0,
            };
        }
        throw error;
    }
};

export const fetchJobFilterOptions = async (
    query: string = '',
    filters: JobSearchFilters = {}
): Promise<JobFilterOptionsResponse> => {
    try {
        const response = await api.get(`/api/search/filters/`, {
            params: {
                search: query,
                ...filters,
            },
        });

        return {
            departments: Array.isArray(response.data?.departments) ? response.data.departments : [],
            employmentTypes: Array.isArray(response.data?.employment_types) ? response.data.employment_types : [],
            workplaceTypes: Array.isArray(response.data?.workplace_types) ? response.data.workplace_types : [],
            countries: Array.isArray(response.data?.countries) ? response.data.countries : [],
            cities: Array.isArray(response.data?.cities) ? response.data.cities : [],
            defaultFilters: Array.isArray(response.data?.default_filters) ? response.data.default_filters : [],
        };
    } catch (error: any) {
        return {
            departments: [],
            employmentTypes: [],
            workplaceTypes: [],
            countries: [],
            cities: [],
            defaultFilters: [],
        };
    }
};

export interface CountryOption {
    name: string;
    code: string;
    job_count: number;
    has_jobs: boolean;
}

export const fetchAllCountries = async (): Promise<CountryOption[]> => {
    try {
        const response = await api.get('/api/search/countries/');
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        return [];
    }
};

export const fetchJobLocationOptions = async (): Promise<JobLocationOptions> => {
    try {
        const response = await api.get(`/api/search/locations/`);

        return {
            countries: Array.isArray(response.data?.countries) ? response.data.countries : [],
            regions: Array.isArray(response.data?.regions) ? response.data.regions : [],
            cities: Array.isArray(response.data?.cities) ? response.data.cities : [],
            regionMap: response.data?.region_map && typeof response.data.region_map === 'object' ? response.data.region_map : {},
            cityMap: response.data?.city_map && typeof response.data.city_map === 'object' ? response.data.city_map : {},
            cityMapByRegion: response.data?.city_map_by_region && typeof response.data.city_map_by_region === 'object' ? response.data.city_map_by_region : {},
        };
    } catch (error: any) {
        return {
            countries: [],
            regions: [],
            cities: [],
            regionMap: {},
            cityMap: {},
            cityMapByRegion: {},
        };
    }
};

export const ingestJob = async (payload: any) => {
    try {
        const response = await api.post('/api/ingest/ingest/', payload);
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

export interface GoogleCSESearchResult {
    status: string;
    source: string;
    query_used?: string;
    results: any[];
    error?: string | null;
    meta: {
        total_results: number;
        response_time_ms?: number;
        persisted: boolean;
    };
}

/**
 * Search for jobs using the dedicated Google Custom Search API endpoint.
 * This endpoint is controlled by the admin panel (ExternalSearchProvider).
 *
 * @param query   - Job title or keyword (e.g. "software developer")
 * @param country - Country name (e.g. "India")
 * @param city    - City name (optional)
 * @param persist - If true, saves found jobs to DB
 * @param limit   - Max results (1-10)
 */
export const googleCSESearch = async (
    query: string,
    country?: string,
    city?: string,
    persist: boolean = false,
    limit: number = 10,
): Promise<GoogleCSESearchResult> => {
    try {
        const response = await api.get('/api/search/google-cse/', {
            params: {
                query,
                country: country || undefined,
                city: city || undefined,
                persist: persist ? 'true' : 'false',
                limit,
            },
        });
        return response.data;
    } catch (error: any) {
        return {
            status: 'error',
            source: 'google_cse',
            results: [],
            error: error.response?.data?.error || error.message,
            meta: { total_results: 0, persisted: false },
        };
    }
};

// ── SerpAPI Google Jobs ─────────────────────────────────────────────────

export interface SerpApiSearchResult {
    status: string;
    query: string;
    location: string;
    count: number;
    jobs_results: SerpApiRawJob[];
}

export interface SerpApiRawJob {
    title?: string;
    company_name?: string;
    location?: string;
    via?: string;
    description?: string;
    extensions?: string[];
    detected_extensions?: {
        posted_at?: string;
        schedule_type?: string;
        salary?: string;
        work_from_home?: boolean;
    };
    apply_options?: Array<{
        title?: string;
        link?: string;
    }>;
    apply_links?: Array<{
        title?: string;
        link?: string;
    }>;
    thumbnail?: string;
    job_id?: string;
}

/**
 * Map a raw SerpAPI job result into our standard Job interface.
 */
export const mapSerpApiResultToJob = (raw: SerpApiRawJob, index: number): Job => {
    const detected = raw.detected_extensions || {};
    const applyLinks = raw.apply_options || raw.apply_links || [];
    const firstLink = applyLinks.length > 0 ? applyLinks[0].link || '#' : '#';
    const salary = detected.salary || (raw.extensions || []).find(e => e.includes('$') || e.toLowerCase().includes('salary')) || '';
    const posted = detected.posted_at || 'Recently';
    const scheduleType = detected.schedule_type || (raw.extensions || []).find(e => e.toLowerCase().includes('time') || e.toLowerCase().includes('contract')) || '';
    const serpId = `serp:${raw.job_id || `${(raw.title || '').slice(0, 30)}-${index}`}`;

    return {
        id: serpId,
        title: raw.title || 'Untitled Role',
        company: raw.company_name || 'Unknown Company',
        location: raw.location || 'Remote',
        salary: salary || scheduleType || 'Competitive',
        posted,
        match: stableMatch(serpId),
        tags: [scheduleType, raw.via || ''].filter(Boolean),
        saved: false,
        description: raw.description || '',
        url: firstLink,
        apply_url: firstLink,
        hasEmail: false,
        platform: 'google_jobs',
        source: 'serpapi',
    };
};

/**
 * Search Google Jobs via the SerpAPI backend endpoint.
 * Returns raw results immediately; the backend ingests them into the DB
 * in a background thread.
 *
 * @param query    - Search keywords (e.g. "software developer")
 * @param location - Optional location (e.g. "Austin, Texas, United States")
 */
export const serpApiSearch = async (
    query: string,
    location?: string,
    start: number = 0,
): Promise<{ jobs: Job[]; totalResults: number; raw: SerpApiSearchResult | null }> => {
    try {
        const response = await api.get<SerpApiSearchResult & { cached?: boolean; response_time_ms?: number }>('/api/search/serpapi/jobs/', {
            params: {
                q: query,
                location: location || undefined,
                start,
            },
        });

        const data = response.data;
        const rawJobs = Array.isArray(data.jobs_results) ? data.jobs_results : [];
        const mappedJobs = rawJobs.map(mapSerpApiResultToJob);

        
        return {
            jobs: mappedJobs,
            totalResults: mappedJobs.length,
            raw: data,
        };
    } catch (error: any) {
        return {
            jobs: [],
            totalResults: 0,
            raw: null,
        };
    }
};
