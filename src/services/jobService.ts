import api from './api';

export interface Job {
    id: number;
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
}

export interface JobSearchResponse {
    jobs: Job[];
    hasNext: boolean;
}

export const searchJobs = async (query: string = '', page: number = 1): Promise<JobSearchResponse> => {
    try {
        console.log(`[JobDiscovery] Searching for: "${query}"`);
        const response = await api.get(`/api/search?q=${encodeURIComponent(query)}&page=${page}`);

        // Ensure we return an array and handle potential data structure variations
        const data = response.data;
        console.log(`[JobDiscovery] Raw API Response:`, data);
        console.log(`[JobDiscovery] Response type: ${typeof data}, isArray: ${Array.isArray(data)}`);

        // Handle direct array or wrapped object (common patterns: {results: [], next: "", count: 0})
        let jobsArray = [];
        let hasNext = false;

        if (Array.isArray(data)) {
            jobsArray = data;
            // Optimistic pagination: If we got jobs in a simple array, assume there might be a next page
            hasNext = data.length > 0;
            console.log(`[JobDiscovery] Simple array response, count: ${jobsArray.length}, set hasNext to ${hasNext}`);
        } else if (data && typeof data === 'object') {
            jobsArray = data.jobs || data.results || data.data || [];
            // Check for next page indicator (can be a boolean, a URL string, or presence of 'next' field)
            hasNext = !!(data.next || data.has_next || data.next_page || (data.count && jobsArray.length < data.count));
            // If the wrapper doesn't have metadata but has jobs, assume there might be more
            if (!hasNext && jobsArray.length > 0) hasNext = true;
            console.log(`[JobDiscovery] Extracted array from object, count: ${jobsArray.length}, hasNext: ${hasNext}`);
        }

        const mappedJobs = jobsArray.map((job: any) => ({
            id: job.id || Math.random(),
            title: typeof job.title === 'object' ? (job.title.name || job.title.title || 'Untitled Role') : (job.title || 'Untitled Role'),
            company: typeof job.company === 'object' ? (job.company.name || job.company.company_name || 'Unknown Company') : (job.company || 'Unknown Company'),
            location: typeof job.location === 'object' ? (job.location.name || job.location.location_name || 'Remote') : (job.location || 'Remote'),
            salary: job.salary || 'Competitive',
            posted: job.posted || 'Recently',
            match: job.match_score || job.match || 0,
            tags: Array.isArray(job.tags) ? job.tags : [],
            saved: false,
            description: job.description || '',
            url: job.url || '#'
        }));

        return { jobs: mappedJobs, hasNext };
    } catch (error: any) {
        if (error.response) {
            console.error("Search API Error:", error.response.data);
        } else {
            console.error("Network error during job search");
        }
        throw error;
    }
};

export const ingestJob = async (payload: any) => {
    try {
        const response = await api.post('/api/ingestionlever/ingest/', payload);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            console.error("Ingestion API Error:", error.response.data);
        } else {
            console.error("Network error during job ingestion");
        }
        throw error;
    }
};
