import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Target,
    Briefcase,
    Clock,
    Sparkles,
    AlertTriangle,
    CheckCircle2,
    ArrowRight,
    TrendingUp,
    BookOpen,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Resume, GapAnalysis } from "@/types/resume";
import { performGapAnalysis } from "@/services/aiService";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface GapAnalysisPanelProps {
    resumes: Resume[];
}

export function GapAnalysisPanel({ resumes }: GapAnalysisPanelProps) {
    const [selectedResumeId, setSelectedResumeId] = useState<string>("");
    const [jobRole, setJobRole] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [experience, setExperience] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<GapAnalysis | null>(null);
    const [expandedStep, setExpandedStep] = useState<number | null>(null);

    const handleAnalyze = async () => {
        const resume = resumes.find(r => r.id === selectedResumeId);
        if (!resume || !jobRole || !jobDescription || !experience) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsAnalyzing(true);
        const toastId = toast.loading("Performing deep gap analysis...");
        try {
            const result = await performGapAnalysis(resume, jobRole, jobDescription, experience);
            setAnalysis(result);
            toast.success("Analysis complete!", { id: toastId });
        } catch (error: any) {
            toast.error("Analysis failed: " + error.message, { id: toastId });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
            >
                <div className="flex items-center gap-2 mb-6">
                    <Target className="h-6 w-6 text-accent" />
                    <h2 className="text-xl font-bold">Deep Gap Analysis</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Select Resume</label>
                            <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                                <SelectTrigger className="bg-secondary/50">
                                    <SelectValue placeholder="Choose a resume..." />
                                </SelectTrigger>
                                <SelectContent className="glass-card">
                                    {resumes.map((r) => (
                                        <SelectItem key={r.id} value={r.id}>
                                            {r.personalDetails.fullName || `Resume (${r.id.slice(0, 4)})`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Target Job Role</label>
                            <input
                                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent/50 transition-all"
                                placeholder="e.g. Senior Product Designer"
                                value={jobRole}
                                onChange={(e) => setJobRole(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Required Experience (Years)</label>
                            <input
                                type="number"
                                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent/50 transition-all"
                                placeholder="e.g. 5"
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Job Description</label>
                        <textarea
                            className="w-full h-[180px] bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent/50 transition-all resize-none"
                            placeholder="Paste the full job description here for the most accurate analysis..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                    </div>
                </div>

                <Button
                    className="w-full py-6 text-lg bg-gradient-to-r from-accent to-accent/80 hover:from-accent hover:to-accent/90"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                >
                    {isAnalyzing ? (
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 animate-spin" />
                            AI is Analyzing...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Perform Deep Gap Analysis
                        </div>
                    )}
                </Button>
            </motion.div>

            <AnimatePresence>
                {analysis && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6"
                    >
                        {/* Score & Experience Gap */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                                <div className="relative w-24 h-24 mb-4">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="48" cy="48" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-secondary" />
                                        <circle
                                            cx="48" cy="48" r="42" fill="none" stroke="hsl(var(--accent))" strokeWidth="8" strokeLinecap="round"
                                            strokeDasharray={`${analysis.matchScore * 2.64} 264`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl">
                                        {analysis.matchScore}%
                                    </div>
                                </div>
                                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Strategic Match</h3>
                            </div>

                            <div className="glass-card p-6 md:col-span-2">
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="h-5 w-5 text-accent" />
                                    <h3 className="font-bold">Experience Analysis</h3>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">
                                    {analysis.experienceGap}
                                </p>
                            </div>
                        </div>

                        {/* Technical Gaps */}
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <AlertTriangle className="h-5 w-5 text-warning" />
                                <h3 className="font-bold">Critical Technical Gaps</h3>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {analysis.technicalGaps.map((gap, i) => (
                                    <div key={i} className="p-4 rounded-xl border border-border bg-secondary/30">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-accent">{gap.skill}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${gap.importance === 'Critical' ? 'bg-red-500/10 text-red-500' :
                                                    gap.importance === 'High' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                {gap.importance}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{gap.why}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Soft Skills & Roadmap */}
                        <div className="grid lg:grid-cols-5 gap-6">
                            <div className="lg:col-span-2 glass-card p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Sparkles className="h-5 w-5 text-accent" />
                                    <h3 className="font-bold">Soft Skill Gaps</h3>
                                </div>
                                <ul className="space-y-3">
                                    {analysis.softSkillGaps.map((skill, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                                            {skill}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="lg:col-span-3 glass-card p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-accent" />
                                        <h3 className="font-bold">The Perfect Roadmap</h3>
                                    </div>
                                    <CheckCircle2 className="h-5 w-5 text-success" />
                                </div>
                                <div className="space-y-4">
                                    {analysis.roadmap.map((step, i) => (
                                        <div key={i} className="border border-border rounded-xl overflow-hidden">
                                            <button
                                                className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors"
                                                onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                                                        {i + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm">{step.step}</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">{step.timeframe}</p>
                                                    </div>
                                                </div>
                                                {expandedStep === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </button>
                                            <AnimatePresence>
                                                {expandedStep === i && (
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: "auto" }}
                                                        exit={{ height: 0 }}
                                                        className="bg-secondary/10 px-4 pb-4 pt-1 border-t border-border"
                                                    >
                                                        <p className="text-sm text-muted-foreground mb-3">{step.action}</p>
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-accent bg-accent/5 w-fit px-2 py-1 rounded">
                                                            <ArrowRight className="h-3 w-3" />
                                                            RESOURCES: {step.resource}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {analysis.advancedTips && (
                            <div className="glass-card p-6 bg-accent/5 border-accent/20">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <Target className="h-4 w-4 text-accent" />
                                    Expert Profile Tips
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {analysis.advancedTips.map((tip, i) => (
                                        <p key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <span className="text-accent">•</span>
                                            {tip}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
