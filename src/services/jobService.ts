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
        console.log(`[LeverAPI] Fetching details for ${companySlug}/${jobId}`);
        const response = await axios.get(`https://api.lever.co/v0/postings/${companySlug}/${jobId}`);
        return response.data;
    } catch (error) {
        console.error('[LeverAPI] Error fetching job details:', error);
        return null;
    }
};

export const fetchJobById = async (jobId: string): Promise<Job | null> => {
    try {
        const response = await api.get(`/api/search/${jobId}/`);
        const job = response.data;
        const mockMatch = Math.floor(Math.random() * (98 - 75 + 1)) + 75;

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
            match: job.match_score || job.match || mockMatch,
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
        console.error('[JobDiscovery] Error fetching job by id:', error);
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
export const JOB_SEARCH_PROVIDER = (import.meta.env.VITE_JOB_SEARCH_PROVIDER || 'jobfinder').toLowerCase();
export const JOBFINDER_API_BASE_URL = (import.meta.env.VITE_JOBFINDER_API_BASE_URL || 'http://localhost:8081').replace(/\/$/, '');
export const isJobFinderSearchEnabled = () => JOB_SEARCH_PROVIDER === 'jobfinder';

const FILTER_OPTIONS_CACHE_TTL_MS = 10 * 60 * 1000;
const FILTER_OPTIONS_CACHE_PREFIX = 'job_filter_options_cache_v4:';

const normalizeFilterCacheKey = (query: string, filters: JobSearchFilters) => {
    const normalizedEntries = Object.entries(filters)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .sort(([left], [right]) => left.localeCompare(right));
    return JSON.stringify({
        query: query.trim(),
        filters: normalizedEntries,
    });
};

const readCachedFilterOptions = (cacheKey: string): JobFilterOptionsResponse | null => {
    return null; // Disable caching for reliability
};

const writeCachedFilterOptions = (cacheKey: string, data: JobFilterOptionsResponse) => {
    return; // Disable caching for reliability
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
    const mockMatch = Math.floor(Math.random() * (95 - 72 + 1)) + 72;
    const location = formatApifyLocation(record.locations) || firstText(record, ['location', 'city', 'country']);
    const salary = formatApifyCompensation(record.compensation) || firstText(record, ['salary', 'salary_range']) || firstText(record, ['job_type', 'employment_type']);

    return {
        id: `apify:${rawId}`,
        title: firstText(record, ['title', 'job_title', 'jobTitle', 'name', 'position']) || 'Untitled Role',
        company: company || 'Unknown Company',
        location: location || 'Remote',
        salary: salary || 'Competitive',
        posted: formatPostedDate(postedDate),
        match: Number(record.match_score || record.match) || mockMatch,
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

export const searchJobs = async (
    query: string = '',
    page: number = 1,
    filters: JobSearchFilters = {}
): Promise<JobSearchResponse> => {
    try {
        console.log(`[JobDiscovery] Searching for: "${query}" with filters:`, filters);
        if (isJobFinderSearchEnabled()) {
            const response = await axios.get(`${JOBFINDER_API_BASE_URL}/api/search`, {
                params: {
                    query: query || filters.title || filters.department || 'jobs',
                    page,
                },
            });

            const data = response.data;
            const rawJobs = Array.isArray(data.jobs) ? data.jobs : [];
            const remainingSlots = Math.max(0, JOB_SEARCH_MAX_RESULTS - ((page - 1) * 10));
            const visibleJobs = rawJobs.slice(0, remainingSlots);

            const mappedJobs = visibleJobs.map((job: any) => {
                const mockMatch = Math.floor(Math.random() * (98 - 75 + 1)) + 75;
                const applyUrl = job.apply_url || job.url || '#';

                return {
                    id: job.id,
                    title: job.title || 'Untitled Role',
                    company: job.company || 'Unknown Company',
                    company_slug: job.company || undefined,
                    quick_apply_enabled: false,
                    quick_apply_questions: [],
                    hasEmail: false,
                    location: 'View details',
                    salary: 'Competitive',
                    posted: 'Recently',
                    match: mockMatch,
                    match_reason: '',
                    tags: ['Lever'],
                    saved: false,
                    description: '',
                    url: applyUrl,
                    apply_url: applyUrl,
                    platform: 'lever',
                    source: 'jobfinder',
                };
            });

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
        console.log('[JobDiscovery] API Response:', data);

        const results = Array.isArray(data.results) ? data.results : [];
        const hasNext = Boolean(data.meta?.has_next);
        const totalResults = Number(data.meta?.total_results || 0);

        const mappedJobs = results.map((job: any) => {
            const mockMatch = Math.floor(Math.random() * (98 - 75 + 1)) + 75;

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
                match: job.match_score || job.match || mockMatch,
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
        console.error('Search API Error:', error.response?.data || error.message);
        throw error;
    }
};

export const fetchJobFilterOptions = async (
    query: string = '',
    filters: JobSearchFilters = {}
): Promise<JobFilterOptionsResponse> => {
    const cacheKey = normalizeFilterCacheKey(query, filters);
    const cached = readCachedFilterOptions(cacheKey);
    if (cached) {
        return cached;
    }

    try {
        const response = await api.get(`/api/search/filters/`, {
            params: {
                search: query,
                ...filters,
            },
        });

        const data = {
            departments: Array.isArray(response.data?.departments) ? response.data.departments : [],
            employmentTypes: Array.isArray(response.data?.employment_types) ? response.data.employment_types : [],
            workplaceTypes: Array.isArray(response.data?.workplace_types) ? response.data.workplace_types : [],
            countries: Array.isArray(response.data?.countries) ? response.data.countries : [],
            cities: Array.isArray(response.data?.cities) ? response.data.cities : [],
            defaultFilters: Array.isArray(response.data?.default_filters) ? response.data.default_filters : [],
        };
        writeCachedFilterOptions(cacheKey, data);
        return data;
    } catch (error: any) {
        console.warn('Filter options API Error:', error.response?.data || error.message);
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
        console.warn('Countries API Error:', error);
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
        console.warn('Location options API Error:', error.response?.data || error.message);
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
        console.error('Ingestion API Error:', error.response?.data || error.message);
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
        console.error('[GoogleCSE] API Error:', error.response?.data || error.message);
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
    const mockMatch = Math.floor(Math.random() * (95 - 72 + 1)) + 72;

    return {
        id: `serp:${raw.job_id || `${(raw.title || '').slice(0, 30)}-${index}`}`,
        title: raw.title || 'Untitled Role',
        company: raw.company_name || 'Unknown Company',
        location: raw.location || 'Remote',
        salary: salary || scheduleType || 'Competitive',
        posted,
        match: mockMatch,
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
        console.log(`[SerpAPI] Searching for: "${query}" location: "${location || 'auto'}" start: ${start}`);
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

        console.log(`[SerpAPI] Result: ${mappedJobs.length} jobs at index ${start} (Cached: ${!!data.cached})`);
        
        return {
            jobs: mappedJobs,
            totalResults: mappedJobs.length,
            raw: data,
        };
    } catch (error: any) {
        console.error('[SerpAPI] API Error:', error.response?.data || error.message);
        return {
            jobs: [],
            totalResults: 0,
            raw: null,
        };
    }
};
