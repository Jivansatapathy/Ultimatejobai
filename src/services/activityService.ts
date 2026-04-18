import api from "./api";

export type ActivityType = 
    | 'CAREER_INSIGHT' 
    | 'INTERVIEW' 
    | 'JOB_APPLY' 
    | 'CAREER_ADVICE' 
    | 'RESUME_EDIT' 
    | 'ONBOARDING'
    | 'PAGE_VIEW'
    | 'SETTINGS'
    | 'JOB_VIEW';

export interface ActivityLog {
    id?: number;
    activity_type: ActivityType;
    description: string;
    timestamp?: string;
    metadata?: any;
}

export const activityService = {
    async logActivity(activity: ActivityLog) {
        try {
            const response = await api.post('/api/activity/logs/', activity);
            return response.data;
        } catch (error) {
            console.error("Failed to log activity:", error);
            // Non-critical operation, don't throw
        }
    },

    async getUserHistory(): Promise<ActivityLog[]> {
        const response = await api.get('/api/activity/logs/');
        return response.data.results || response.data; // Handle pagination if active
    },

    async getDashboardSummary() {
        const response = await api.get('/api/activity/summary/');
        return response.data;
    }
};
