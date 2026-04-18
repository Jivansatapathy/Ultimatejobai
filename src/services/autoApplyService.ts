import api from './api';

export interface ApplicationHistoryItem {
    id: string;
    job_id: string;
    job_title: string;
    company: string;
    status: "queued" | "sent" | "failed";
    delivery_method: "email" | "employer_portal" | "test";
    job_source?: string | null;
    selected_resume_id?: number | null;
    selected_resume_name?: string | null;
    selected_resume_link?: string | null;
    pipeline_status?: string | null;
    pipeline_stage_changed_at?: string | null;
    match_score?: number | null;
    recommendation?: string | null;
    next_interview?: {
        title: string;
        mode: "virtual" | "phone" | "onsite";
        starts_at: string;
        meeting_link?: string | null;
    } | null;
    sent_at?: string | null;
    created_at?: string | null;
    response_message?: string | null;
}

export const autoApplyService = {
    // Check if user has email credentials set up
    async getStatus() {
        const res = await api.get('/api/apply/status/');
        return res.data;
    },

    // Save app-password credentials
    async saveCredential(email: string, appPassword: string) {
        const res = await api.post('/api/apply/save-email/', { email, app_password: appPassword });
        return res.data;
    },

    // Get Gmail OAuth URL to redirect user
    async getGmailAuthUrl() {
        const res = await api.get('/api/apply/gmail/init/');
        return res.data.auth_url as string;
    },

    // Send auto-apply email for a job
    async apply(jobId: string, resumeId?: string, applicationAnswers?: Record<string, string>) {
        const res = await api.post('/api/apply/', {
            job_id: jobId,
            resume_id: resumeId,
            application_answers: applicationAnswers || {},
        });
        return res.data;
    },

    // Get application history
    async getHistory() {
        const res = await api.get<{ applications: ApplicationHistoryItem[] }>('/api/apply/history/');
        return res.data;
    },

    // Send a real test email to the hardcoded test recipient (no DB job needed)
    async testSend() {
        const res = await api.post('/api/apply/test-send/');
        return res.data;
    },
};
