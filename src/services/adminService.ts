import api from "./api";

export interface DashboardStats {
    users: number;
    interviews: number;
    jobs: number;
    auto_applies: number;
}

export interface AdminUser {
    id: string;
    email: string;
    username: string;
    full_name: string;
    interviews: number;
    applications: number;
    date_joined: string;
}

export interface AdminInterview {
    id: string;
    user: string;
    type: string;
    finished: boolean;
    question_count: number;
    created_at: string;
}

export interface AdminJob {
    id: string;
    title: string;
    company: string;
    location: string;
    platform: string;
    source: string;
    created_by?: string | null;
    employer_status?: string | null;
    apply_url?: string | null;
    is_active: boolean;
    posted_at?: string | null;
    created_at: string;
}

export interface AdminApplication {
    id: string;
    user: string;
    job_title: string;
    status: string;
    sent_at: string;
    created_at: string;
}

export const adminService = {
    async getStats(): Promise<DashboardStats> {
        const resp = await api.get('/api/admin/dashboard/stats/');
        return resp.data;
    },
    async getUsers(): Promise<AdminUser[]> {
        const resp = await api.get('/api/admin/dashboard/users/');
        return resp.data;
    },
    async getInterviews(): Promise<AdminInterview[]> {
        const resp = await api.get('/api/admin/dashboard/interviews/');
        return resp.data;
    },
    async getJobs(): Promise<AdminJob[]> {
        const resp = await api.get('/api/admin/dashboard/jobs/');
        return resp.data;
    },
    async getApplications(): Promise<AdminApplication[]> {
        const resp = await api.get('/api/admin/dashboard/applications/');
        return resp.data;
    },
    async forceIngest(platform: string, companySlug: string) {
        const resp = await api.post('/api/admin/dashboard/ingest/', {
            platform,
            company_slug: companySlug
        });
        return resp.data;
    },
    async getIngestProgress(companySlug: string): Promise<{ progress: number, result?: any, error?: string, is_done: boolean }> {
        const resp = await api.get(`/api/admin/dashboard/progress/?company_slug=${companySlug}`);
        return resp.data;
    }
};
