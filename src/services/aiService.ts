import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;

import { Resume, ATSAnalysis, GapAnalysis } from "../types/resume";
import api from "@/services/api";

export const analyzeResumeATS = async (file: File, jobName: string = "", jobDescription: string = ""): Promise<ATSAnalysis> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_name", jobName);
    formData.append("job_description", jobDescription);

    try {
        const response = await api.post("/api/resumes/ats/", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        const data = response.data;
        return {
            score: data.ats_score || 0,
            formattingScore: 100,
            matchingKeywords: data.matched_skills || [],
            missingKeywords: data.missing_skills || [],
            recommendations: data.suggestions || [],
            path90Plus: [],
            sectionFeedback: []
        };
    } catch (error) {
        console.error("analyzeResumeATS failed:", error);
        throw error;
    }
};

export const parseResumeFromFile = async (file: File): Promise<Partial<Resume>> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
        const response = await api.post("/api/resumes/parse/", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    } catch (error) {
        console.error("parseResumeFromFile failed:", error);
        throw error;
    }
};

export const analyzeResume = async (resume: Resume, jobDescription?: string): Promise<ATSAnalysis> => {
    try {
        const response = await api.post("/api/resumes/deep-analysis/", {
            resume,
            job_role: resume.targetJobRole || "",
            job_description: jobDescription
        });
        const data = response.data;
        return {
            score: data.score || 0,
            formattingScore: data.formattingScore || 0,
            matchingKeywords: data.matchingKeywords || [],
            missingKeywords: data.missingKeywords || [],
            recommendations: data.recommendations || data.suggestions || [],
            path90Plus: data.path90Plus || [],
            sectionFeedback: data.sectionFeedback || []
        };
    } catch (error: any) {
        console.error("analyzeResume: Failed to perform deep analysis:", error);
        throw new Error("Failed to generate detailed ATS analysis.");
    }
};

export const suggestSummary = async (data: Partial<Resume>): Promise<string> => {
    try {
        const response = await api.post("/api/resumes/career-advice/", {
            offer_text: "Please provide a professional summary for my resume based on my details.",
            resume_text: JSON.stringify(data)
        });
        return response.data.advice || "";
    } catch (error) {
        console.error("suggestSummary: Failed:", error);
        return "";
    }
};

export const suggestTargetRole = async (data: Partial<Resume>): Promise<string> => {
    try {
        const response = await api.post("/api/resumes/career-advice/", {
            offer_text: "Based on my resume content, what specific job title or role should I be targeting? Please provide only the role title (e.g., 'Senior Frontend Engineer').",
            resume_text: JSON.stringify(data)
        });
        return response.data.advice || "";
    } catch (error) {
        console.error("suggestTargetRole: Failed:", error);
        return "";
    }
};

export const performGapAnalysis = async (
    resume: Resume,
    jobRole: string,
    jobDescription: string,
    experienceYrs: string
): Promise<GapAnalysis> => {
    try {
        const response = await api.post("/api/resumes/gap-analysis/", {
            resume,
            job_role: jobRole,
            job_description: jobDescription,
            experience_yrs: experienceYrs
        });
        const data = response.data;
        return {
            matchScore: data.matchScore || 0,
            technicalGaps: data.technicalGaps || [],
            softSkillGaps: data.softSkillGaps || [],
            experienceGap: data.experienceGap || "",
            roadmap: data.roadmap || [],
            advancedTips: data.advancedTips || []
        };
    } catch (error: any) {
        console.error("performGapAnalysis: Failed:", error);
        throw new Error("Failed to generate Gap Analysis.");
    }
};

export const getCareerAdvice = async (offerText: string, resumeContent: string): Promise<string> => {
    try {
        const response = await api.post("/api/resumes/career-advice/", {
            offer_text: offerText,
            resume_text: resumeContent
        });
        return response.data.advice || "I'm sorry, I couldn't generate career advice at this moment.";
    } catch (error) {
        console.error("getCareerAdvice: Failed:", error);
        return "Failed to fetch career advice.";
    }
};
