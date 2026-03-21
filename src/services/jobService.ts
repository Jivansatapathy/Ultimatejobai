import api from './api';
import axios from 'axios';

export interface LeverJobDetails {
    text: string;
    description: string;
    descriptionHtml: string;
    lists: Array<{ text: string, content: string }>;
    additional: string;
    additionalHtml: string;
}

export const fetchLeverJobDetails = async (companySlug: string, jobId: string): Promise<LeverJobDetails | null> => {
    try {
        console.log(`[LeverAPI] Fetching details for ${companySlug}/${jobId}`);
        const response = await axios.get(`https://api.lever.co/v0/postings/${companySlug}/${jobId}`);
        return response.data;
    } catch (error) {
        console.error("[LeverAPI] Error fetching job details:", error);
        return null;
    }
};

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
    apply_url?: string;
    hasEmail: boolean;
    platform?: string;
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
                url: job.source_url || job.job_url || '#',
                apply_url: job.apply_url || job.source_url || job.job_url || '#',
                platform: job.platform || 'other'
            };
        });

        // Inject Amstar DMC job for demonstration
        const amstarJob: Job = {
            id: 'amstar-legacy-modernization',
            title: 'Senior Developer - Legacy Modernization',
            company: 'Amstar DMC (Hyatt Corporation)',
            location: 'Fully Remote',
            salary: 'Competitive',
            posted: 'Today',
            match: 99,
            tags: ['Python', 'FastAPI', 'Modernization'],
            saved: false,
            hasEmail: true,
            description: `
                <div class="space-y-6">
                    <section>
                        <h2 class="text-2xl font-bold text-accent mb-3">About Us</h2>
                        <p>We are a 26-year established Destination Management Company (DMC) operating under the <strong>Amstar DMC brand</strong>, the official destination services and tour operator brand of <strong>Hyatt Corporation</strong>.</p>
                        <p class="mt-2">We support major North American travel brands including: Apple Vacations, American Express Vacations, Expedia, Hyatt, and more than 12 additional travel brands.</p>
                    </section>

                    <section>
                        <h3 class="text-xl font-semibold mb-2">The Migration Mission</h3>
                        <p>We are executing a phased migration from a 24-year-old Perl-based monolithic application to a modern Python/FastAPI architecture. Current modernization streams include AI-driven email/WhatsApp handling and rebuilding core order management.</p>
                        <div class="bg-accent/5 p-4 rounded-lg mt-3 border border-accent/10">
                            <p class="font-medium text-accent">Goal: >80% migrated within 12 months.</p>
                        </div>
                    </section>

                    <section>
                        <h3 class="text-xl font-semibold mb-2">Required Technical Skills</h3>
                        <ul class="list-disc pl-5 space-y-1">
                            <li>Strong Python & <strong>FastAPI</strong> experience</li>
                            <li>MySQL (schema, indexing, query optimization)</li>
                            <li>Linux (Ubuntu) CLI & Docker</li>
                            <li>pytest & GitHub Actions CI/CD</li>
                            <li>API design and system decoupling</li>
                        </ul>
                    </section>

                    <section>
                        <h3 class="text-xl font-bold text-success mb-2">How to Apply</h3>
                        <div class="p-4 bg-secondary/50 rounded-xl border border-border">
                            <p className="mb-2 italic">"Please mention the word <strong>FRUITFUL</strong> and tag <strong>RNjAuMjU0LjAuNjg=</strong> when applying to show you read the job post completely."</p>
                            <p class="text-xs text-muted-foreground mt-2">#RNjAuMjU0LjAuNjg= (Beta Feature to avoid spam)</p>
                        </div>
                    </section>
                </div>
            `,
            url: 'https://www.amstardmc.com/careers',
            apply_url: 'https://www.amstardmc.com/careers'
        };

        return { jobs: [amstarJob, ...mappedJobs], hasNext, totalResults: totalResults + 1 };
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
