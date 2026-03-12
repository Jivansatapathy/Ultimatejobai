import api from './api';

export interface Job {
    id: string | number;
    title: string;
    company: string;
    location: string;
    salary?: string;
    posted: string;
    match: number;
    tags: string[];
    saved: boolean;
    description?: string;
    url?: string;
    hasEmail: boolean;
}

export interface JobSearchResponse {
    jobs: Job[];
    hasNext: boolean;
    totalResults: number;
}

export const searchJobs = async (query: string = '', page: number = 1, filters: Record<string, any> = {}): Promise<JobSearchResponse> => {
    try {
        console.log(`[JobDiscovery] Searching for: "${query}" with filters:`, filters);
        const response = await api.get(`/api/search/`, {
            params: {
                search: query,
                page: page,
                ...filters
            }
        });

        const data = response.data;
        console.log(`[JobDiscovery] API Response:`, data);

        const results = data.results || [];
        const hasNext = data.meta?.has_next || false;
        const totalResults = data.meta?.total_results || 0;

        const flatten = (val: any): string => {
            if (!val) return '';
            if (typeof val === 'string') {
                if (val.startsWith('{') && val.endsWith('}')) {
                    try {
                        const parsed = JSON.parse(val.replace(/'/g, '"'));
                        return parsed.label || parsed.name || parsed.text || parsed.value || val;
                    } catch (e) { return val; }
                }
                return val;
            }
            if (typeof val === 'object') {
                return val.label || val.name || val.text || val.value || JSON.stringify(val);
            }
            return String(val);
        };

        const mappedJobs = results.map((job: any) => {
            const mockMatch = Math.floor(Math.random() * (98 - 75 + 1)) + 75;

            return {
                id: job.id,
                title: job.title || 'Untitled Role',
                company: job.company?.name || 'Unknown Company',
                company_website: job.company?.website || null,
                hasEmail: !!job.company?.has_email,
                location: flatten(job.location) || 'Remote',
                salary: job.salary || flatten(job.employment_type) || 'Competitive',
                posted: job.posted_at ? new Date(job.posted_at).toLocaleDateString() : 'Recently',
                match: job.match_score || job.match || mockMatch,
                tags: [flatten(job.department), flatten(job.employment_type)].filter(Boolean),
                saved: false,
                description: job.description || '',
                url: job.apply_url || job.source_url || '#'
            };
        });

        return { jobs: mappedJobs, hasNext, totalResults };
    } catch (error: any) {
        console.error("Search API Error:", error.response?.data || error.message);
        throw error;
    }
};

export const ingestJob = async (payload: any) => {
    try {
        const response = await api.post('/api/ingest/ingest/', payload);
        return response.data;
    } catch (error: any) {
        console.error("Ingestion API Error:", error.response?.data || error.message);
        throw error;
    }
};
