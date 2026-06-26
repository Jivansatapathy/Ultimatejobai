import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Target,
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
import { UsageMonitor } from "@/components/subscription/UsageMonitor";
import { useSubscription } from "@/context/SubscriptionContext";
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
    const { refreshSummary } = useSubscription();

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
            refreshSummary();
        } catch (error: any) {
            toast.error("Analysis failed: " + error.message, { id: toastId });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const inputCls = "w-full bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition-all";
    const labelCls = "text-xs font-bold uppercase text-gray-500";
    const cardCls = "bg-white border border-gray-200 shadow-sm rounded-2xl p-6";

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cardCls}
            >
                <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Target className="h-6 w-6 text-teal-500" />
                        <h2 className="text-xl font-bold text-gray-900">Deep Gap Analysis</h2>
                    </div>
                    <UsageMonitor featureKey="gap_analysis_access" compact />
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className={labelCls}>Select Resume</label>
                            <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                                <SelectTrigger className="bg-white border-gray-200 text-gray-900">
                                    <SelectValue placeholder="Choose a resume..." />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-gray-200">
                                    {resumes.map((r) => (
                                        <SelectItem key={r.id} value={r.id} className="text-gray-900 focus:bg-teal-50">
                                            {r.personalDetails.fullName || `Resume (${r.id.slice(0, 4)})`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <label className={labelCls}>Target Job Role</label>
                            <input
                                className={inputCls}
                                placeholder="e.g. Senior Product Designer"
                                value={jobRole}
                                onChange={(e) => setJobRole(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className={labelCls}>Required Experience (Years)</label>
                            <input
                                type="number"
                                className={inputCls}
                                placeholder="e.g. 5"
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className={labelCls}>Job Description</label>
                        <textarea
                            className={`${inputCls} h-[180px] resize-none`}
                            placeholder="Paste the full job description here for the most accurate analysis..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                    </div>
                </div>

                <Button
                    className="w-full py-6 text-base font-semibold bg-teal-500 hover:bg-teal-600 text-white gap-2"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                >
                    {isAnalyzing ? (
                        <>
                            <Sparkles className="h-5 w-5 animate-spin" />
                            AI is Analyzing...
                        </>
                    ) : (
                        <>
                            <TrendingUp className="h-5 w-5" />
                            Perform Deep Gap Analysis
                        </>
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
                            <div className={`${cardCls} flex flex-col items-center justify-center text-center`}>
                                <div className="relative w-24 h-24 mb-4">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="48" cy="48" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                                        <circle
                                            cx="48" cy="48" r="42" fill="none" stroke="rgb(20,184,166)" strokeWidth="8" strokeLinecap="round"
                                            strokeDasharray={`${analysis.matchScore * 2.64} 264`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-gray-900">
                                        {analysis.matchScore}%
                                    </div>
                                </div>
                                <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500">Strategic Match</h3>
                            </div>

                            <div className={`${cardCls} md:col-span-2`}>
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="h-5 w-5 text-teal-500" />
                                    <h3 className="font-bold text-gray-900">Experience Analysis</h3>
                                </div>
                                <p className="text-gray-600 leading-relaxed">
                                    {analysis.experienceGap}
                                </p>
                            </div>
                        </div>

                        {/* Technical Gaps */}
                        <div className={cardCls}>
                            <div className="flex items-center gap-2 mb-6">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                <h3 className="font-bold text-gray-900">Critical Technical Gaps</h3>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {analysis.technicalGaps.map((gap, i) => (
                                    <div key={i} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-teal-600">
                                                {typeof gap.skill === 'object' ? (gap.skill as any).name || 'Technical Skill' : gap.skill}
                                            </span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                                gap.importance === 'Critical' ? 'bg-red-50 text-red-600 border border-red-200' :
                                                gap.importance === 'High' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                                                'bg-blue-50 text-blue-600 border border-blue-200'
                                            }`}>
                                                {typeof gap.importance === 'object' ? (gap.importance as any).level || 'Medium' : gap.importance}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {typeof gap.why === 'object' ? JSON.stringify(gap.why) : gap.why}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Soft Skills & Roadmap */}
                        <div className="grid lg:grid-cols-5 gap-6">
                            <div className={`lg:col-span-2 ${cardCls}`}>
                                <div className="flex items-center gap-2 mb-6">
                                    <Sparkles className="h-5 w-5 text-teal-500" />
                                    <h3 className="font-bold text-gray-900">Soft Skill Gaps</h3>
                                </div>
                                <ul className="space-y-3">
                                    {analysis.softSkillGaps.map((skill, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                            <div className="h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0" />
                                            {typeof skill === 'object' ? (skill as any).skill || 'Behavioral Competency' : skill}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className={`lg:col-span-3 ${cardCls}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-teal-500" />
                                        <h3 className="font-bold text-gray-900">The Perfect Roadmap</h3>
                                    </div>
                                    <CheckCircle2 className="h-5 w-5 text-teal-500" />
                                </div>
                                <div className="space-y-3">
                                    {analysis.roadmap.map((step, i) => (
                                        <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                                            <button
                                                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                                                onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 font-bold text-sm shrink-0">
                                                        {i + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm text-gray-900">{step.step}</p>
                                                        <p className="text-[10px] text-gray-400 uppercase font-bold">{step.timeframe}</p>
                                                    </div>
                                                </div>
                                                {expandedStep === i
                                                    ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                                                    : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                                                }
                                            </button>
                                            <AnimatePresence>
                                                {expandedStep === i && (
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: "auto" }}
                                                        exit={{ height: 0 }}
                                                        className="bg-gray-50 px-4 pb-4 pt-1 border-t border-gray-200"
                                                    >
                                                        <p className="text-sm text-gray-600 mb-3">{step.action}</p>
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-200 w-fit px-2 py-1 rounded">
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
                            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900">
                                    <Target className="h-4 w-4 text-teal-500" />
                                    Expert Profile Tips
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {analysis.advancedTips.map((tip, i) => (
                                        <p key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                            <span className="text-teal-500 shrink-0">•</span>
                                            {typeof tip === 'object' ? JSON.stringify(tip) : tip}
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
