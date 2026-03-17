import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Resume, PersonalDetails, Experience, Education, Project, Certification, Extracurricular } from '@/types/resume';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface ResumeContextType {
    resumes: Resume[];
    activeResume: Resume | null;
    createNewResume: () => string;
    loadResume: (id: string) => void;
    updatePersonalDetails: (details: PersonalDetails) => void;
    updateSummary: (summary: string) => void;
    addExperience: (experience: Omit<Experience, 'id'>) => void;
    updateExperience: (id: string, experience: Partial<Experience>) => void;
    deleteExperience: (id: string) => void;
    addEducation: (education: Omit<Education, 'id'>) => void;
    updateEducation: (id: string, education: Partial<Education>) => void;
    deleteEducation: (id: string) => void;
    updateSkills: (skills: string[]) => void;
    updateSoftSkills: (skills: string[]) => void;
    addProject: (project: Omit<Project, 'id'>) => void;
    updateProject: (id: string, project: Partial<Project>) => void;
    deleteProject: (id: string) => void;
    addCertification: (cert: Omit<Certification, 'id'>) => void;
    updateCertification: (id: string, cert: Partial<Certification>) => void;
    deleteCertification: (id: string) => void;
    addExtracurricular: (activity: Omit<Extracurricular, 'id'>) => void;
    updateExtracurricular: (id: string, activity: Partial<Extracurricular>) => void;
    deleteExtracurricular: (id: string) => void;
    updateTargetJobRole: (role: string) => void;
    updateTargetJobDescription: (jd: string) => void;
    importResumeData: (data: Partial<Resume>) => Resume;
    optimizeWithAI: () => Promise<any>;
    analyzeFileATS: (file: File, resumeOverride?: Resume) => Promise<any>;
    saveResume: () => void;
    deleteResume: (id: string) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

const initialResume: Resume = {
    id: '',
    name: 'Untitled Resume',
    lastEdited: new Date().toISOString(),
    score: 0,
    personalDetails: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    softSkills: [],
    projects: [],
    certifications: [],
    extracurricularActivities: [],
    targetJobRole: '',
    targetJobDescription: '',
    suggestions: [],
    detailedScores: [],
};

export function ResumeProvider({ children }: { children: ReactNode }) {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [activeResume, setActiveResume] = useState<Resume | null>(null);

    useEffect(() => {
        const savedResumes = localStorage.getItem('resumes');
        if (savedResumes) {
            setResumes(JSON.parse(savedResumes));
        }
    }, []);

    useEffect(() => {
        if (resumes.length > 0) {
            localStorage.setItem('resumes', JSON.stringify(resumes));
        }
    }, [resumes]);

    const saveToLocalStorage = (updatedResumes: Resume[]) => {
        localStorage.setItem('resumes', JSON.stringify(updatedResumes));
    };

    const createNewResume = () => {
        const newResume = { ...initialResume, id: uuidv4(), lastEdited: new Date().toISOString() };
        setActiveResume(newResume);
        return newResume.id;
    };

    const importResumeData = (data: Partial<Resume>) => {
        const newId = uuidv4();
        const newResume: Resume = {
            ...initialResume,
            ...data,
            id: newId,
            lastEdited: new Date().toISOString()
        };

        // Ensure sub-arrays have IDs if they don't
        if (newResume.experience) {
            newResume.experience = newResume.experience.map(exp => ({ ...exp, id: exp.id || uuidv4() }));
        }
        if (newResume.education) {
            newResume.education = newResume.education.map(edu => ({ ...edu, id: edu.id || uuidv4() }));
        }
        if (newResume.projects) {
            newResume.projects = newResume.projects.map(proj => ({ ...proj, id: proj.id || uuidv4() }));
        }
        if (newResume.certifications) {
            newResume.certifications = newResume.certifications.map(cert => ({ ...cert, id: cert.id || uuidv4() }));
        }
        if (newResume.extracurricularActivities) {
            newResume.extracurricularActivities = newResume.extracurricularActivities.map(act => ({ ...act, id: act.id || uuidv4() }));
        }

        const updatedResumes = [...resumes, newResume];
        setResumes(updatedResumes);
        setActiveResume(newResume);
        saveToLocalStorage(updatedResumes);
        return newResume;
    };

    const loadResume = (id: string) => {
        const resume = resumes.find((r) => r.id === id);
        if (resume) {
            setActiveResume(resume);
        }
    };

    const updateActiveResume = (updater: (prev: Resume) => Resume) => {
        setActiveResume((prev) => {
            if (!prev) return null;
            return updater(prev);
        });
    };

    // Performance Optimized Persistence: Sync activeResume changes to the resumes list and localStorage
    useEffect(() => {
        if (!activeResume) return;

        setResumes(currentResumes => {
            const newList = currentResumes.map(r => r.id === activeResume.id ? activeResume : r);

            // Only write to localStorage if something actually changed to avoid loop
            const oldList = JSON.parse(localStorage.getItem('resumes') || '[]');
            if (JSON.stringify(newList) !== JSON.stringify(oldList)) {
                saveToLocalStorage(newList);
            }

            return newList;
        });
    }, [activeResume]);

    const updatePersonalDetails = (details: PersonalDetails) => {
        updateActiveResume((prev) => ({ ...prev, personalDetails: details }));
    };

    const updateSummary = (summary: string) => {
        updateActiveResume((prev) => ({ ...prev, summary }));
    };

    const addExperience = (experience: Omit<Experience, 'id'>) => {
        updateActiveResume((prev) => ({
            ...prev,
            experience: [...prev.experience, { ...experience, id: uuidv4() }],
        }));
    };

    const updateExperience = (id: string, experience: Partial<Experience>) => {
        updateActiveResume((prev) => ({
            ...prev,
            experience: prev.experience.map((exp) => (exp.id === id ? { ...exp, ...experience } : exp)),
        }));
    };

    const deleteExperience = (id: string) => {
        updateActiveResume((prev) => ({
            ...prev,
            experience: prev.experience.filter((exp) => exp.id !== id),
        }));
    };

    const addEducation = (education: Omit<Education, 'id'>) => {
        updateActiveResume((prev) => ({
            ...prev,
            education: [...prev.education, { ...education, id: uuidv4() }],
        }));
    };

    const updateEducation = (id: string, education: Partial<Education>) => {
        updateActiveResume((prev) => ({
            ...prev,
            education: prev.education.map((edu) => (edu.id === id ? { ...edu, ...education } : edu)),
        }));
    };

    const deleteEducation = (id: string) => {
        updateActiveResume((prev) => ({
            ...prev,
            education: prev.education.filter((edu) => edu.id !== id),
        }));
    };

    const updateSkills = (skills: string[]) => {
        updateActiveResume((prev) => ({ ...prev, skills }));
    };

    const updateSoftSkills = (skills: string[]) => {
        updateActiveResume((prev) => ({ ...prev, softSkills: skills }));
    };

    const addProject = (project: Omit<Project, 'id'>) => {
        updateActiveResume((prev) => ({
            ...prev,
            projects: [...prev.projects, { ...project, id: uuidv4() }],
        }));
    };

    const updateProject = (id: string, project: Partial<Project>) => {
        updateActiveResume((prev) => ({
            ...prev,
            projects: prev.projects.map((proj) => (proj.id === id ? { ...proj, ...project } : proj)),
        }));
    };

    const deleteProject = (id: string) => {
        updateActiveResume((prev) => ({
            ...prev,
            projects: prev.projects.filter((proj) => proj.id !== id),
        }));
    };

    const addCertification = (cert: Omit<Certification, 'id'>) => {
        updateActiveResume((prev) => ({
            ...prev,
            certifications: [...prev.certifications, { ...cert, id: uuidv4() }],
        }));
    };

    const updateCertification = (id: string, cert: Partial<Certification>) => {
        updateActiveResume((prev) => ({
            ...prev,
            certifications: prev.certifications.map((c) => (c.id === id ? { ...c, ...cert } : c)),
        }));
    };

    const deleteCertification = (id: string) => {
        updateActiveResume((prev) => ({
            ...prev,
            certifications: prev.certifications.filter((c) => c.id !== id),
        }));
    };

    const addExtracurricular = (activity: Omit<Extracurricular, 'id'>) => {
        updateActiveResume((prev) => ({
            ...prev,
            extracurricularActivities: [...prev.extracurricularActivities, { ...activity, id: uuidv4() }],
        }));
    };

    const updateExtracurricular = (id: string, activity: Partial<Extracurricular>) => {
        updateActiveResume((prev) => ({
            ...prev,
            extracurricularActivities: prev.extracurricularActivities.map((a) => (a.id === id ? { ...a, ...activity } : a)),
        }));
    };

    const deleteExtracurricular = (id: string) => {
        updateActiveResume((prev) => ({
            ...prev,
            extracurricularActivities: prev.extracurricularActivities.filter((a) => a.id !== id),
        }));
    };

    const updateTargetJobRole = (role: string) => {
        updateActiveResume((prev) => ({ ...prev, targetJobRole: role }));
    };

    const updateTargetJobDescription = (jd: string) => {
        updateActiveResume((prev) => ({ ...prev, targetJobDescription: jd }));
    };

    const optimizeWithAI = async () => {
        if (!activeResume) return;

        const { analyzeResume } = await import('@/services/aiService');

        try {
            const analysis = await analyzeResume(activeResume, activeResume.targetJobDescription);

            updateActiveResume((prev) => ({
                ...prev,
                score: analysis.score,
                detailedScores: [
                    { name: 'ATS Match', score: analysis.score, status: (analysis.score > 80 ? 'excellent' : 'good') as "excellent" | "good" | "warning" },
                    { name: 'Formatting', score: analysis.formattingScore, status: (analysis.formattingScore > 80 ? 'excellent' : 'good') as "excellent" | "good" | "warning" }
                ],
                suggestions: [
                    ...analysis.recommendations.map(r => ({ type: 'improvement' as const, text: r })),
                    ...analysis.path90Plus.map(p => ({ type: 'improvement' as const, text: p }))
                ]
            }));

            return analysis;
        } catch (error) {
            console.error("AI optimization failed:", error);
            throw error;
        }
    };

    const analyzeFileATS = async (file: File, resumeOverride?: Resume) => {
        const targetResume = resumeOverride || activeResume;

        console.log("analyzeFileATS: Starting analysis. targetResume:", targetResume?.id);

        if (!targetResume) {
            console.error("analyzeFileATS: No resume to analyze.");
            return;
        }

        const { analyzeResumeATS } = await import('@/services/aiService');

        try {
            console.log("analyzeFileATS: Calling analyzeResumeATS service...");
            const analysis = await analyzeResumeATS(
                file,
                targetResume.targetJobRole || "",
                targetResume.targetJobDescription || ""
            );
            console.log("analyzeFileATS: Analysis completed successfully.");

            const updateFields = (prev: Resume) => ({
                ...prev,
                score: analysis.score,
                detailedScores: [
                    { name: 'ATS Match', score: analysis.score, status: (analysis.score > 80 ? 'excellent' : 'good') as "excellent" | "good" | "warning" },
                    { name: 'Formatting', score: analysis.formattingScore, status: (analysis.formattingScore > 80 ? 'excellent' : 'good') as "excellent" | "good" | "warning" }
                ],
                suggestions: [
                    ...analysis.recommendations.map(r => ({ type: 'improvement' as const, text: r })),
                    ...analysis.matchingKeywords.map(k => ({ type: 'keyword' as const, text: `Matched: ${k}` })),
                    ...analysis.missingKeywords.map(k => ({ type: 'keyword' as const, text: `Missing: ${k}` }))
                ]
            });

            if (resumeOverride) {
                // If we passed a resume object, we need to update it in the resumes array and set active
                setActiveResume(prev => prev?.id === resumeOverride.id ? updateFields(resumeOverride) : prev);
                setResumes(prev => prev.map(r => r.id === resumeOverride.id ? updateFields(r) : r));
            } else {
                updateActiveResume(updateFields);
            }

            // Save after updating
            setTimeout(() => {
                const updatedResumes = localStorage.getItem('resumes');
                if (updatedResumes) {
                    const parsed = JSON.parse(updatedResumes);
                    saveToLocalStorage(parsed);
                }
            }, 500);

            return analysis;
        } catch (error) {
            console.error("ATS analysis failed:", error);
            throw error;
        }
    };

    const saveResume = () => {
        if (!activeResume) return;
        const updatedResume = { ...activeResume, lastEdited: new Date().toISOString() };

        let updatedResumes;
        if (resumes.some((r) => r.id === updatedResume.id)) {
            updatedResumes = resumes.map((r) => (r.id === updatedResume.id ? updatedResume : r));
        } else {
            updatedResumes = [...resumes, updatedResume];
        }
        setResumes(updatedResumes);
        saveToLocalStorage(updatedResumes);
        setActiveResume(updatedResume);
    };

    const deleteResume = (id: string) => {
        const updatedResumes = resumes.filter((r) => r.id !== id);
        setResumes(updatedResumes);
        saveToLocalStorage(updatedResumes);
        if (activeResume?.id === id) {
            setActiveResume(null);
        }
    };

    return (
        <ResumeContext.Provider
            value={{
                resumes,
                activeResume,
                createNewResume,
                loadResume,
                updatePersonalDetails,
                updateSummary,
                addExperience,
                updateExperience,
                deleteExperience,
                addEducation,
                updateEducation,
                deleteEducation,
                updateSkills,
                updateSoftSkills,
                addProject,
                updateProject,
                deleteProject,
                addCertification,
                updateCertification,
                deleteCertification,
                addExtracurricular,
                updateExtracurricular,
                deleteExtracurricular,
                updateTargetJobRole,
                updateTargetJobDescription,
                importResumeData,
                optimizeWithAI,
                analyzeFileATS,
                saveResume,
                deleteResume
            }}
        >
            {children}
        </ResumeContext.Provider>
    );
}

export function useResume() {
    const context = useContext(ResumeContext);
    if (context === undefined) {
        throw new Error('useResume must be used within a ResumeProvider');
    }
    return context;
}
