import api from "./api";
import { Job } from "./jobService";

export interface CareerProfile {
    id: number;
    skills: string[];
    experience_level: string;
    target_roles: string[];
    preferred_locations: string[];
    updated_at: string;
}

export interface JobMatch {
    id: number;
    job: string;
    job_details: Job;
    match_score: number;
    match_percentage: number;
    matched_skills: string[];
    created_at: string;
}

export interface UserScore {
    id: number;
    overall_score: number;
    resume_score: number;
    interview_score: number;
    updated_at: string;
}

export interface CareerAdvice {
    id: number;
    context: string;
    advice: string;
    created_at: string;
}

export interface CareerRoadmap {
    id: number;
    steps: Array<{ title: string; desc: string; completed: boolean }>;
    updated_at: string;
}

export interface JobFair {
    id: string;
    source: string;
    country: string;
    city: string;
    title: string;
    event_type: string;
    date_text: string;
    date: string | null;
    location: string;
    link: string;
    scraped_at: string;
}

export const careerService = {
    async getProfile(): Promise<CareerProfile> {
        const response = await api.get('/api/career/profile/');
        return response.data;
    },

    async updateProfile(profile: Partial<CareerProfile>): Promise<CareerProfile> {
        const response = await api.patch('/api/career/profile/', profile);
        return response.data;
    },

    async getJobMatches(): Promise<JobMatch[]> {
        const response = await api.get('/api/career/job-matches/');
        return response.data.results || response.data;
    },

    async getUserScore(): Promise<UserScore> {
        const response = await api.get('/api/career/score/');
        return response.data;
    },

    async analyzeResume(resumeFile: File, jobDescription?: string) {
        const formData = new FormData();
        formData.append('file', resumeFile);
        if (jobDescription) {
            formData.append('job_description', jobDescription);
        }
        const response = await api.post('/api/career/resumes/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async getRoadmap(): Promise<CareerRoadmap> {
        const response = await api.get('/api/career/roadmap/');
        return response.data;
    },

    async updateRoadmap(roadmap: Partial<CareerRoadmap>): Promise<CareerRoadmap> {
        const response = await api.patch('/api/career/roadmap/', roadmap);
        return response.data;
    },

    async getAdvices(): Promise<CareerAdvice[]> {
        const response = await api.get('/api/career/advice/');
        return response.data.results || response.data;
    },

    async createAdvice(context: string, advice: string): Promise<CareerAdvice> {
        const response = await api.post('/api/career/advice/', { context, advice });
        return response.data;
    },

    async getJobFairs(): Promise<JobFair[]> {
        const response = await api.get('/api/job-ingestion/job-fairs/');
        return response.data.results || response.data;
    }
};
