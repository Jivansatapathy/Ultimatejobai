
import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
    Sparkles, 
    Target, 
    FileText, 
    CheckCircle2, 
    AlertCircle, 
    Loader2, 
    Wand2,
    Zap,
    Save,
    Edit3
} from "lucide-react";
import { motion } from "framer-motion";
import { useResume } from "@/hooks/useResume";
import { analyzeResume } from "@/services/aiService";
import { ATSAnalysis, Resume } from "@/types/resume";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";

interface AtsOptimizationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function AtsOptimizationModal({
    open,
    onOpenChange,
    onSuccess,
}: AtsOptimizationModalProps) {
    const { activeResume, updateActiveResume, saveResume } = useResume();
    const navigate = useNavigate();
    const [targetRole, setTargetRole] = useState(activeResume?.targetJobRole || "");
    const [userLocation, setUserLocation] = useState(activeResume?.personalDetails?.location || "");
    const [jobDescription, setJobDescription] = useState(activeResume?.targetJobDescription || "");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isFixing, setIsFixing] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
    const [score, setScore] = useState(activeResume?.score || 0);

    useEffect(() => {
        if (activeResume && open) {
            setTargetRole(activeResume.targetJobRole || "");
            setUserLocation(activeResume.personalDetails?.location || "");
            setJobDescription(activeResume.targetJobDescription || "");
            setScore(activeResume.score || 0);
        }
    }, [activeResume, open]);

    const handleAnalyze = async () => {
        if (!activeResume) return;
        if (!targetRole.trim()) {
            toast.error("Please enter a target job role.");
            return;
        }

        setIsAnalyzing(true);
        setAnalysis(null);
        try {
            // Update local state first so analysis uses it
            updateActiveResume((prev) => ({ 
                ...prev, 
                targetJobRole: targetRole,
                targetJobDescription: jobDescription,
                personalDetails: {
                    ...prev.personalDetails,
                    location: userLocation
                }
            }));

            const result = await analyzeResume({
                ...activeResume,
                targetJobRole: targetRole,
                targetJobDescription: jobDescription,
                personalDetails: {
                    ...activeResume.personalDetails,
                    location: userLocation
                }
            }, jobDescription);
            
            const rawScore = result.score || 0;
            const normalizedScore = rawScore <= 1 && rawScore > 0 ? Math.round(rawScore * 100) : Math.round(rawScore);
            
            setAnalysis(result);
            setScore(normalizedScore);
            
            // Sync result to active resume
            updateActiveResume((prev) => ({
                ...prev,
                score: normalizedScore,
                suggestions: result.recommendations.map(r => ({ type: 'improvement', text: typeof r === 'string' ? r : (r as any).text }))
            }));

            toast.success("Analysis complete!");
        } catch (error) {
            console.error("Analysis failed:", error);
            toast.error("Failed to analyze resume.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Core AI rewrite logic — shared by both handleAutoFix and handleApplyAndOpenEditor
    const runAutoFix = async (toastId: string | number): Promise<void> => {
        if (!activeResume) return;

        const response = await api.post("/api/resumes/career-advice/", {
            offer_text: `Act as an Elite Technical Recruiter and ATS Systems Architect. 
            YOUR TASK: ENHANCE the provided resume to ACHIEVE A 90%+ ATS MATCH SCORE.
            TARGET ROLE: '${targetRole}'.
            TARGET DESCRIPTION: ${jobDescription}.
            USER LOCATION: ${userLocation}.
            
            OPTIMIZATION COMMANDS:
            1. NO DELETIONS: RETAIN ALL existing experience and education details.
            2. SKILLS OPTIMIZATION: Do NOT just add skills. MERGE, DEDUPLICATE, and PRIORITIZE. Remove redundant or low-impact skills. Keep the list focused on the Target Role.
            3. AGGRESSIVE EXPANSION: Identify missing keywords in the Job Description and seamlessly add them to existing bullet points.
            4. QUANTIFICATION: Every single bullet point MUST have a numerical impact.
            5. NO MARKDOWN: DO NOT use bolding or italics.
            6. OMIT SCORE: Do not include a "score" or "suggestions" field in your JSON.
            
            IMPORTANT: Return ONLY the JSON object. No conversation.`,
            resume_text: JSON.stringify(activeResume)
        });

        let fixedData: Resume;
        const rawText = response.data.advice;
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error("No JSON structure found in AI response");
        }
        
        const cleanJson = jsonMatch[0].replace(/```json/g, '').replace(/```/g, '');
        fixedData = JSON.parse(cleanJson);

        // Remove hallucinatory fields
        delete (fixedData as any).score;
        delete (fixedData as any).suggestions;

        // Robust sanitization
        const ensureArray = (val: any) => Array.isArray(val) ? val : (typeof val === 'string' ? [val] : []);
        fixedData.personalDetails = fixedData.personalDetails || activeResume.personalDetails;
        fixedData.summary = fixedData.summary || activeResume.summary;
        fixedData.skills = ensureArray(fixedData.skills || activeResume.skills);
        fixedData.softSkills = ensureArray(fixedData.softSkills || activeResume.softSkills);
        fixedData.experience = (fixedData.experience || activeResume.experience).map((exp: any) => ({
            ...exp,
            id: exp.id || Math.random().toString(36).substr(2, 9),
            description: ensureArray(exp.description)
        }));
        fixedData.education = (fixedData.education || activeResume.education).map((edu: any) => ({
            ...edu,
            id: edu.id || Math.random().toString(36).substr(2, 9)
        }));
        fixedData.projects = (fixedData.projects || activeResume.projects).map((proj: any) => ({
            ...proj,
            id: proj.id || Math.random().toString(36).substr(2, 9),
            description: ensureArray(proj.description)
        }));
        fixedData.certifications = ensureArray(fixedData.certifications || activeResume.certifications);

        // Apply sanitized data
        updateActiveResume(() => ({
            ...fixedData,
            id: activeResume.id,
            lastEdited: new Date().toISOString()
        }));

        // Re-analyze to get updated score
        const newAnalysis = await analyzeResume(fixedData, jobDescription);
        const rawScore = newAnalysis.score || 0;
        const normalizedScore = rawScore <= 1 && rawScore > 0 ? Math.round(rawScore * 100) : Math.round(rawScore);

        setAnalysis(newAnalysis);
        setScore(normalizedScore);
        updateActiveResume(prev => ({
            ...prev,
            score: normalizedScore,
            suggestions: newAnalysis.recommendations.map(r => {
                const text = typeof r === 'string' ? r : (r as any).text;
                return { type: 'improvement', text: text.replace(/\*\*|\*|__/g, '') };
            })
        }));
    };

    const handleAutoFix = async () => {
        if (!activeResume) return;
        setIsFixing(true);
        const toastId = toast.loading("AI is rewriting your resume for maximum impact...");
        try {
            await runAutoFix(toastId);
            const currentScore = score;
            if (currentScore >= 90) {
                toast.success("Elite Grade Achieved!", { id: toastId });
            } else {
                toast.info(`Score updated! Review the new suggestions.`, { id: toastId });
            }
        } catch (error: any) {
            console.error("Auto-fix failed:", error);
            const errorMessage = error.response?.data?.message || error.message || "Unknown error";
            if (errorMessage.includes("timeout") || error.code === "ECONNABORTED") {
                toast.error("The optimization is taking too long. Please try again.", { id: toastId });
            } else {
                toast.error(`AI Optimization failed: ${errorMessage}`, { id: toastId });
            }
            throw error; // Re-throw so callers like handleApplyAndOpenEditor can react
        } finally {
            setIsFixing(false);
        }
    };

    const handleApplyAndOpenEditor = async () => {
        if (!activeResume) return;
        setIsApplying(true);
        const toastId = toast.loading("Applying AI recommendations to your resume...");
        try {
            await runAutoFix(toastId);
            toast.success("Changes applied! Opening Resume Editor...", { id: toastId });
            onOpenChange(false);
            setTimeout(() => {
                navigate(`/resume/${activeResume.id}`);
            }, 350);
        } catch (error: any) {
            console.error("Apply & edit failed:", error);
            const errorMessage = error.response?.data?.message || error.message || "Unknown error";
            toast.error(`Could not apply changes: ${errorMessage}`, { id: toastId });
        } finally {
            setIsApplying(false);
        }
    };

    const handleSave = () => {
        if (!activeResume) return;
        
        const finalResume = {
            ...activeResume,
            score: score,
            lastEdited: new Date().toISOString()
        };

        // Update local state and immediately trigger a hard save
        updateActiveResume(() => finalResume);
        saveResume(finalResume);
        
        toast.success("Elite Resume Saved Successfully!");
        if (onSuccess) onSuccess();
        onOpenChange(false);
        navigate("/resume");
    };

    const isElite = score >= 90;
    const isGood = score >= 80 && score < 90;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] h-[90vh] flex flex-col p-0 overflow-hidden border-none bg-[#0a0f1e] text-white font-sans">
                <DialogHeader className="p-6 pb-2 border-b border-white/5">
                    <DialogTitle className="text-2xl font-black flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                            <Zap className="h-6 w-6 text-teal-400" />
                        </div>
                        ATS Profile Optimization
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        {isElite 
                            ? "Elite Grade Achieved. Your profile is ready for submission." 
                            : "Analyze and optimize your resume to reach a 90%+ score."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Inputs - Only show if not elite or if user wants to re-analyze */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Target Job Role</Label>
                            <div className="relative">
                                <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <Input 
                                    placeholder="e.g. Senior Frontend Engineer" 
                                    className="pl-10 bg-white/5 border-white/10 text-white focus:ring-teal-500 h-11"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Your Target Location</Label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <Input 
                                    placeholder="e.g. United States, India, UK" 
                                    className="pl-10 bg-white/5 border-white/10 text-white h-11"
                                    value={userLocation}
                                    onChange={(e) => setUserLocation(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Target Job Description</Label>
                            <Textarea 
                                placeholder="Paste the job requirements here for precise matching..." 
                                className="bg-white/5 border-white/10 text-white min-h-[120px] focus:ring-teal-500 font-sans"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                        </div>
                        {!isElite && (
                            <Button 
                                className="md:col-span-2 h-12 bg-white text-[#0a0f1e] hover:bg-slate-200 font-bold uppercase tracking-widest text-xs"
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                            >
                                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                {analysis ? "Re-Analyze Profile" : "Start Deep Analysis"}
                            </Button>
                        )}
                    </div>

                    {/* Results */}
                    {analysis && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8 pb-10"
                        >
                            <div className="flex flex-col md:flex-row items-center gap-8 p-6 rounded-2xl bg-white/5 border border-white/10">
                                <div className="relative h-32 w-32 flex-shrink-0">
                                    <svg className="h-full w-full transform -rotate-90">
                                        <circle cx="64" cy="64" r="58" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                        <circle 
                                            cx="64" cy="64" r="58" fill="none" 
                                            stroke={score >= 90 ? "hsl(173 80% 36%)" : score >= 80 ? "hsl(47 95% 45%)" : "hsl(14 91% 54%)"} 
                                            strokeWidth="10" 
                                            strokeLinecap="round" 
                                            strokeDasharray={`${score * 3.64} 364`}
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black">{score}</span>
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">ATS Score</span>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2 text-center md:text-left">
                                    <h3 className="text-xl font-bold">
                                        {score >= 90 ? "Elite Match!" : score >= 80 ? "Strong Competitive Profile" : "Action Required"}
                                    </h3>
                                    <p className="text-sm text-slate-400 leading-relaxed font-sans">
                                        {score >= 90 
                                            ? "Your profile is institutional-grade. Optimized for top-tier ATS filters."
                                            : score >= 80 
                                                ? "You've hit a strong score. You can save now or keep optimizing for that elite 90+ mark."
                                                : "We've identified gaps. Use the AI auto-fix to hit major keywords instantly."}
                                    </p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-amber-500" />
                                        Missing Keywords
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(analysis.missingKeywords || []).length > 0 ? analysis.missingKeywords.map((kw, i) => (
                                            <span key={i} className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                                                {kw}
                                            </span>
                                        )) : (
                                            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold font-sans">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Perfect Match
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-teal-400" />
                                        AI Recommendations
                                    </h4>
                                    <div className="space-y-3">
                                        {(analysis.recommendations || []).slice(0, 3).map((rec: any, i) => (
                                            <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-300 leading-relaxed font-sans">
                                                {typeof rec === 'string' ? rec : rec.text}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="md:col-span-2 pt-4 space-y-4">
                                    {analysis && (
                                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-4">
                                            <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                                <AlertCircle className="h-5 w-5 text-amber-500" />
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-bold text-amber-500">Reality Check Required</h5>
                                                <p className="text-[11px] text-amber-500/80 leading-relaxed font-sans">
                                                    AI metrics are estimated to maximize match score. 
                                                    <span className="font-bold underline ml-1 text-white">Review your numbers</span> after applying before your final submission.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Apply Changes & Open Editor — always shown after analysis */}
                                    <Button
                                        className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg group relative overflow-hidden bg-white text-[#0a0f1e] hover:bg-slate-100"
                                        onClick={handleApplyAndOpenEditor}
                                        disabled={isApplying || isFixing}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                        {isApplying ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Edit3 className="h-5 w-5 mr-3" />}
                                        Apply Changes & Open Editor
                                    </Button>

                                    {!isElite && (
                                        <Button 
                                            variant="hero" 
                                            className="w-full h-12 rounded-2xl bg-teal-600/80 hover:bg-teal-500 text-white font-bold uppercase tracking-[0.15em] text-xs shadow-lg shadow-teal-500/20 group relative overflow-hidden"
                                            onClick={handleAutoFix}
                                            disabled={isFixing || isApplying}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                            {isFixing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                                            {score > 0 ? "Re-run AI Upgrade & Keywords" : "Apply AI Recommendations Instantly"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                <DialogFooter className="p-6 border-t border-white/5 bg-white/[0.02]">
                    <div className="flex flex-col sm:flex-row w-full gap-4 items-center">
                        <div className="flex-1 text-center sm:text-left">
                            {!isElite && !isGood && score > 0 && (
                                <p className="text-xs font-bold text-amber-500 flex items-center gap-2 justify-center sm:justify-start font-sans">
                                    <AlertCircle className="h-4 w-4" />
                                    Push to 80%+ to unlock Final Save
                                </p>
                            )}
                            {isGood && (
                                <p className="text-xs font-bold text-teal-400 flex items-center gap-2 justify-center sm:justify-start font-sans">
                                    <CheckCircle2 className="h-4 w-4 text-teal-500" />
                                    Target Reached! You can save or keep optimizing.
                                </p>
                            )}
                            {isElite && (
                                <p className="text-xs font-bold text-teal-400 flex items-center gap-2 justify-center sm:justify-start font-sans">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Elite Grade (90%+) - Optimized for Elite Roles.
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {(score < 90) && (
                                <Button variant="ghost" className="text-slate-400" onClick={() => onOpenChange(false)}>
                                    Keep Editing
                                </Button>
                            )}
                            <Button 
                                className={`h-12 px-8 font-black uppercase tracking-widest text-xs rounded-xl shadow-xl transition-all ${
                                    (isElite || isGood)
                                        ? "bg-white text-black hover:bg-slate-200" 
                                        : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
                                }`}
                                onClick={handleSave}
                                disabled={!isElite && !isGood}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isElite ? "Final Save & Done" : "Save & Move Ahead"}
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
