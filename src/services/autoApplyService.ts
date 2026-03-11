import api from './api';

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
    async apply(jobId: string) {
        const res = await api.post('/api/apply/', { job_id: jobId });
        return res.data;
    },

    // Get application history
    async getHistory() {
        const res = await api.get('/api/apply/history/');
        return res.data;
    },
};
