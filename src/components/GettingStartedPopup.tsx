import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, CheckCircle2, Circle, Briefcase, FileText, Mic,
    TrendingUp, Users, Target, ChevronRight, Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useResume } from "@/hooks/useResume";
import api from "@/services/api";
import { activityService } from "@/services/activityService";
import { useAuth } from "@/context/AuthContext";

const STORAGE_KEY = "gs_dismissed";
const MANUAL_KEY = "gs_manual_checks";

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
    const { isAuthenticated, isEmployer } = useAuth();
    const { resumes } = useResume();
    const [visible, setVisible] = useState(false);
    const [appCount, setAppCount] = useState(0);
    const [interviewDone, setInterviewDone] = useState(false);
    const [manualChecks, setManualChecks] = useState<Record<string, boolean>>({});
    // Track whether the resume list has been loaded from storage at least once
    const [resumesLoaded, setResumesLoaded] = useState(false);

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
        api.get('/api/bot/history/')
            .then((res: any) => setAppCount(res.data?.applications?.length ?? 0))
            .catch(() => {});
        activityService.getUserHistory()
            .then(logs => setInterviewDone(logs.some(l => l.activity_type === "INTERVIEW")))
            .catch(() => {});
    }, [isAuthenticated]);

    // Mark resumes as loaded after the first update from the provider
    useEffect(() => {
        setResumesLoaded(true);
    }, [resumes]);

    // Show only the very first time a user enters with no resume uploaded.
    // Once dismissed (any way) or once the user has a resume, never show again.
    useEffect(() => {
        if (!isAuthenticated || !resumesLoaded) return;
        if (localStorage.getItem(STORAGE_KEY)) return; // already shown / dismissed
        if (resumes.length > 0) {
            // User already has a resume — silently retire the popup forever
            localStorage.setItem(STORAGE_KEY, "1");
            return;
        }
        const t = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(t);
    }, [isAuthenticated, resumesLoaded]);

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

    const dismiss = (_permanent = false) => {
        setVisible(false);
        localStorage.setItem(STORAGE_KEY, "1"); // always retire after first interaction
    };

    const completedCount = TASKS.filter(t => isChecked(t)).length;
    const progress = Math.round((completedCount / TASKS.length) * 100);

    if (!visible || isEmployer) return null;

    return (
        <AnimatePresence>
            {visible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => dismiss(false)}
                    >
                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        className="w-full max-w-lg"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="rounded-2xl bg-white border border-zinc-200 shadow-2xl shadow-black/10 overflow-hidden">

                            {/* Black header strip */}
                            <div className="bg-black px-6 pt-6 pb-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                                            <Sparkles className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-0.5">Getting Started</p>
                                            <h2 className="text-lg font-extrabold text-white leading-tight">Your setup checklist</h2>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => dismiss(false)}
                                        aria-label="Close"
                                        className="mt-0.5 text-zinc-500 hover:text-white transition-colors shrink-0"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Progress bar */}
                                <div className="mt-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-zinc-400 font-medium">{completedCount} of {TASKS.length} complete</span>
                                        <span className="text-xs font-extrabold text-white">{progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full bg-white"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.6, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>

                                {/* App count badge */}
                                {appCount > 0 && (
                                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1">
                                        <Briefcase className="h-3 w-3 text-zinc-300" />
                                        <span className="text-xs font-semibold text-zinc-300">
                                            {appCount} application{appCount !== 1 ? "s" : ""} sent
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Task list */}
                            <div className="px-4 py-3 space-y-0.5 max-h-[46vh] overflow-y-auto">
                                {TASKS.map(task => {
                                    const done = isChecked(task);
                                    const Icon = task.icon;
                                    return (
                                        <div
                                            key={task.id}
                                            className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${done ? "opacity-50" : "hover:bg-zinc-50"}`}
                                        >
                                            {/* Check toggle */}
                                            <button
                                                onClick={() => task.manual ? toggleManual(task.id) : undefined}
                                                className={`shrink-0 ${task.manual ? "cursor-pointer" : "cursor-default"}`}
                                                aria-label={task.manual ? `Toggle ${task.label}` : undefined}
                                            >
                                                {done
                                                    ? <CheckCircle2 className="h-5 w-5 text-black" />
                                                    : <Circle className="h-5 w-5 text-zinc-300" />
                                                }
                                            </button>

                                            {/* Icon tile */}
                                            <div className="h-8 w-8 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                                                <Icon className="h-4 w-4 text-zinc-500" />
                                            </div>

                                            {/* Text */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-semibold leading-tight ${done ? "line-through text-zinc-400" : "text-black"}`}>
                                                    {task.label}
                                                </p>
                                                <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{task.detail}</p>
                                            </div>

                                            {/* Go arrow */}
                                            {!done && task.href && (
                                                <button
                                                    onClick={() => { dismiss(false); navigate(task.href!); }}
                                                    aria-label={`Go to ${task.label}`}
                                                    className="shrink-0 text-zinc-300 hover:text-black transition-colors"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between">
                                <button
                                    onClick={() => dismiss(true)}
                                    className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors font-medium"
                                >
                                    Don't show again
                                </button>
                                <button
                                    onClick={() => dismiss(false)}
                                    className="text-xs font-bold text-white bg-black hover:bg-zinc-800 px-5 py-2 rounded-xl transition-colors"
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
