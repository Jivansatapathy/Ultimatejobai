import axios from 'axios';
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
}

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

export const searchJobs = async (
    query: string = '',
    page: number = 1,
    filters: JobSearchFilters = {}
): Promise<JobSearchResponse> => {
    try {
        console.log(`[JobDiscovery] Searching for: "${query}" with filters:`, filters);
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
