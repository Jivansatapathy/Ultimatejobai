import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, CheckCircle2, Circle, Briefcase, FileText, Mic,
    TrendingUp, Users, Target, ChevronRight, Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useResume } from "@/hooks/useResume";
import { autoApplyService } from "@/services/autoApplyService";
import { activityService } from "@/services/activityService";
import { useAuth } from "@/context/AuthContext";

const STORAGE_KEY = "gs_dismissed";
const MANUAL_KEY = "gs_manual_checks";
const SESSION_KEY = "gs_seen_this_session";

interface TaskDef {
    id: string;
    label: string;
    detail: string;
    icon: React.ElementType;
    color: string;
    href?: string;
    manual?: boolean;
}

const TASKS: TaskDef[] = [
    {
        id: "resume",
        label: "Upload your resume",
        detail: "Let AI parse and populate your profile automatically.",
        icon: FileText,
        color: "text-violet-400",
        href: "/resume",
    },
    {
        id: "profile",
        label: "Set your target role",
        detail: "Tell us what role you're aiming for so we can tailor insights.",
        icon: Target,
        color: "text-sky-400",
        href: "/resume",
        manual: true,
    },
    {
        id: "apply",
        label: "Apply to a job",
        detail: "Send your first application through the platform.",
        icon: Briefcase,
        color: "text-emerald-400",
        href: "/jobs",
    },
    {
        id: "interview",
        label: "Practice an interview",
        detail: "Run a mock interview session with AI feedback.",
        icon: Mic,
        color: "text-pink-400",
        href: "/interview",
    },
    {
        id: "career_plan",
        label: "Start your career plan",
        detail: "Get a 12–24 month roadmap from the AI career advisor.",
        icon: TrendingUp,
        color: "text-amber-400",
        href: "/career-planner",
        manual: true,
    },
    {
        id: "mentor",
        label: "Explore AI Mentor",
        detail: "Visit job fairs, salary negotiator, and more.",
        icon: Users,
        color: "text-teal-400",
        href: "/ai-mentor",
        manual: true,
    },
];

export default function GettingStartedPopup() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { resumes } = useResume();
    const [visible, setVisible] = useState(false);
    const [appCount, setAppCount] = useState(0);
    const [interviewDone, setInterviewDone] = useState(false);
    const [manualChecks, setManualChecks] = useState<Record<string, boolean>>({});

    // Load manual checks from localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem(MANUAL_KEY);
            if (raw) setManualChecks(JSON.parse(raw));
        } catch { /* ignore */ }
    }, []);

    // Fetch auto-tracked data
    useEffect(() => {
        if (!isAuthenticated) return;
        autoApplyService.getHistory()
            .then(data => setAppCount((data as any)?.applications?.length ?? 0))
            .catch(() => {});
        activityService.getUserHistory()
            .then(logs => setInterviewDone(logs.some(l => l.activity_type === "INTERVIEW")))
            .catch(() => {});
    }, [isAuthenticated]);

    // Decide visibility: show once per session, unless permanently dismissed
    useEffect(() => {
        if (!isAuthenticated) return;
        const dismissed = localStorage.getItem(STORAGE_KEY);
        const seenThisSession = sessionStorage.getItem(SESSION_KEY);
        if (!dismissed && !seenThisSession) {
            // Small delay so the page has time to load first
            const t = setTimeout(() => {
                setVisible(true);
                sessionStorage.setItem(SESSION_KEY, "1");
            }, 1200);
            return () => clearTimeout(t);
        }
    }, [isAuthenticated]);

    const isChecked = (task: TaskDef): boolean => {
        if (task.id === "resume") return resumes.length > 0;
        if (task.id === "apply") return appCount > 0;
        if (task.id === "interview") return interviewDone;
        return !!manualChecks[task.id];
    };

    const toggleManual = (id: string) => {
        const next = { ...manualChecks, [id]: !manualChecks[id] };
        setManualChecks(next);
        localStorage.setItem(MANUAL_KEY, JSON.stringify(next));
    };

    const dismiss = (permanent = false) => {
        setVisible(false);
        if (permanent) localStorage.setItem(STORAGE_KEY, "1");
    };

    const completedCount = TASKS.filter(t => isChecked(t)).length;
    const progress = Math.round((completedCount / TASKS.length) * 100);

    if (!visible) return null;

    return (
        <AnimatePresence>
            {visible && (
                <>
                    {/* Backdrop + centering wrapper */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => dismiss(false)}
                    >
                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        className="w-full max-w-lg"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="relative rounded-3xl bg-[#0e0e18] border border-white/[0.08] shadow-2xl overflow-hidden">
                            {/* Gradient accent top */}
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

                            {/* Header */}
                            <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center shrink-0">
                                        <Sparkles className="h-5 w-5 text-violet-400" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-400 mb-0.5">Getting Started</p>
                                        <h2 className="text-lg font-bold text-white leading-tight">Your setup checklist</h2>
                                    </div>
                                </div>
                                <button
                                    onClick={() => dismiss(false)}
                                    className="mt-1 text-slate-500 hover:text-white transition-colors shrink-0"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Progress bar */}
                            <div className="px-6 pb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-slate-400">{completedCount} of {TASKS.length} complete</span>
                                    <span className="text-xs font-bold text-white">{progress}%</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                    />
                                </div>

                                {/* App count stat */}
                                {appCount > 0 && (
                                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
                                        <Briefcase className="h-3 w-3 text-emerald-400" />
                                        <span className="text-xs font-semibold text-emerald-400">
                                            {appCount} application{appCount !== 1 ? "s" : ""} sent
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Task list */}
                            <div className="px-4 pb-2 space-y-1 max-h-[52vh] overflow-y-auto">
                                {TASKS.map(task => {
                                    const done = isChecked(task);
                                    const Icon = task.icon;
                                    return (
                                        <div
                                            key={task.id}
                                            className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition-all ${done ? "opacity-60" : "hover:bg-white/[0.04]"}`}
                                        >
                                            {/* Check toggle */}
                                            <button
                                                onClick={() => task.manual ? toggleManual(task.id) : undefined}
                                                className={`shrink-0 transition-colors ${task.manual ? "cursor-pointer" : "cursor-default"}`}
                                            >
                                                {done
                                                    ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                                    : <Circle className="h-5 w-5 text-slate-600" />
                                                }
                                            </button>

                                            {/* Icon */}
                                            <div className={`h-8 w-8 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0`}>
                                                <Icon className={`h-4 w-4 ${task.color}`} />
                                            </div>

                                            {/* Text */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-semibold leading-tight ${done ? "line-through text-slate-500" : "text-white"}`}>
                                                    {task.label}
                                                </p>
                                                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{task.detail}</p>
                                            </div>

                                            {/* Go arrow */}
                                            {!done && task.href && (
                                                <button
                                                    onClick={() => { dismiss(false); navigate(task.href!); }}
                                                    className="shrink-0 text-slate-600 hover:text-white transition-colors"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 mt-1 border-t border-white/[0.06] flex items-center justify-between">
                                <button
                                    onClick={() => dismiss(true)}
                                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    Don't show again
                                </button>
                                <button
                                    onClick={() => dismiss(false)}
                                    className="text-xs font-semibold text-white bg-white/[0.08] hover:bg-white/[0.12] px-4 py-2 rounded-xl transition-colors"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
