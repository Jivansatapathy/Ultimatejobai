export interface Resume {
    id: string;
    name: string;
    lastEdited: string;
    score: number;
    personalDetails: PersonalDetails;
    summary: string;
    experience: Experience[];
    education: Education[];
    skills: string[];
    softSkills: string[];
    projects: Project[];
    certifications: Certification[];
    extracurricularActivities: Extracurricular[];
    targetJobRole?: string;
    targetJobDescription?: string;
    suggestions?: Array<{ type: 'keyword' | 'improvement'; text: string }>;
    detailedScores?: Array<{ name: string; score: number; status: 'excellent' | 'good' | 'warning' }>;
}

export interface PersonalDetails {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
}

export interface Experience {
    id: string;
    company: string;
    role: string;
    duration: string;
    description: string[];
}

export interface Education {
    id: string;
    school: string;
    degree: string;
    year: string;
}

export interface Project {
    id: string;
    title: string;
    link?: string;
    description: string[];
}

export interface Certification {
    id: string;
    name: string;
    issuer: string;
    year: string;
}

export interface Extracurricular {
    id: string;
    role: string;
    organization: string;
    duration: string;
    description: string[];
}

export interface ATSAnalysis {
    score: number;
    formattingScore: number;
    matchingKeywords: string[];
    missingKeywords: string[];
    recommendations: string[];
    path90Plus: string[];
    sectionFeedback: SectionFeedback[];
}

export interface SectionFeedback {
    sectionName: string;
    issue: string;
    improvement: string;
    priority: 'High' | 'Medium' | 'Low';
}

export interface GapAnalysis {
    matchScore: number;
    technicalGaps: Array<{
        skill: string;
        importance: 'Critical' | 'High' | 'Medium';
        why: string;
    }>;
    softSkillGaps: string[];
    experienceGap: string;
    roadmap: Array<{
        step: string;
        action: string;
        timeframe: string;
        resource: string;
    }>;
    advancedTips?: string[];
}
