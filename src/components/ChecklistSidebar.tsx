import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, CheckCircle2, Circle, Briefcase, FileText, Mic,
    TrendingUp, Users, Target, ChevronRight, ClipboardList, Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useResume } from "@/hooks/useResume";
import api from "@/services/api";
import { activityService } from "@/services/activityService";
import { useAuth } from "@/context/AuthContext";

const MANUAL_KEY = "gs_manual_checks";

interface Task {
    id: string;
    label: string;
    detail: string;
    icon: React.ElementType;
    href: string;
    manual?: boolean;
}

const TASKS: Task[] = [
    { id: "resume",      label: "Upload your resume",     detail: "AI parses and fills your profile.",        icon: FileText,   href: "/resume" },
    { id: "profile",     label: "Set your target role",   detail: "Tell us what role you're aiming for.",    icon: Target,     href: "/resume",          manual: true },
    { id: "apply",       label: "Apply to a job",         detail: "Send your first application.",            icon: Briefcase,  href: "/jobs" },
    { id: "interview",   label: "Practice an interview",  detail: "Run a mock session with AI feedback.",    icon: Mic,        href: "/interview" },
    { id: "career_plan", label: "Start your career plan", detail: "Get a 12–24 month AI roadmap.",           icon: TrendingUp, href: "/career-planner",  manual: true },
    { id: "mentor",      label: "Explore AI Mentor",      detail: "Job fairs, salary negotiator & more.",    icon: Users,      href: "/ai-mentor",       manual: true },
];

interface ChecklistSidebarProps {
    open: boolean;
    onClose: () => void;
}

export default function ChecklistSidebar({ open, onClose }: ChecklistSidebarProps) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { resumes } = useResume();
    const [appCount, setAppCount] = useState(0);
    const [interviewDone, setInterviewDone] = useState(false);
    const [manualChecks, setManualChecks] = useState<Record<string, boolean>>(() => {
        try { return JSON.parse(localStorage.getItem(MANUAL_KEY) || "{}"); } catch { return {}; }
    });

    useEffect(() => {
        if (!isAuthenticated) return;
        api.get('/api/bot/history/')
            .then((res: any) => setAppCount(res.data?.applications?.length ?? 0))
            .catch(() => {});
        activityService.getUserHistory()
            .then(logs => setInterviewDone(logs.some((l: any) => l.activity_type === "INTERVIEW")))
            .catch(() => {});
    }, [isAuthenticated]);

    const isChecked = (task: Task) => {
        if (task.id === "resume") return resumes.length > 0;
        if (task.id === "apply") return appCount > 0;
        if (task.id === "interview") return interviewDone;
        return !!manualChecks[task.id];
    };

    const toggle = (id: string) => {
        const next = { ...manualChecks, [id]: !manualChecks[id] };
        setManualChecks(next);
        localStorage.setItem(MANUAL_KEY, JSON.stringify(next));
    };

    const completedCount = TASKS.filter(isChecked).length;
    const progress = Math.round((completedCount / TASKS.length) * 100);
    const allDone = completedCount === TASKS.length;

    const goTo = (href: string) => { onClose(); navigate(href); };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                        onClick={onClose}
                    />

                    {/* Sidebar */}
                    <motion.aside
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 320, damping: 32 }}
                        className="fixed top-0 right-0 h-full w-80 z-50 flex flex-col bg-white border-l border-zinc-200 shadow-2xl"
                    >
                        {/* Top accent bar */}
                        <div className="h-1 w-full bg-black shrink-0" />

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 shrink-0 border-b border-zinc-100">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-black flex items-center justify-center shrink-0">
                                    <ClipboardList className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400">Getting Started</p>
                                    <p className="text-sm font-extrabold text-black leading-tight">Setup Checklist</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                aria-label="Close checklist"
                                className="text-zinc-400 hover:text-black transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Progress */}
                        <div className="px-6 py-4 shrink-0 border-b border-zinc-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-zinc-500 font-medium">{completedCount} of {TASKS.length} complete</span>
                                <span className="text-xs font-extrabold text-black">{progress}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full bg-black"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                />
                            </div>
                            {appCount > 0 && (
                                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1">
                                    <Briefcase className="h-3 w-3 text-zinc-500" />
                                    <span className="text-[11px] font-semibold text-zinc-600">
                                        {appCount} application{appCount !== 1 ? "s" : ""} sent
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Task list */}
                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
                            {TASKS.map(task => {
                                const done = isChecked(task);
                                const Icon = task.icon;
                                return (
                                    <div
                                        key={task.id}
                                        className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                                            done ? "opacity-50" : "hover:bg-zinc-50"
                                        }`}
                                    >
                                        {/* Check */}
                                        <button
                                            onClick={() => task.manual && toggle(task.id)}
                                            className={task.manual ? "cursor-pointer shrink-0" : "cursor-default shrink-0"}
                                            aria-label={task.manual ? `Toggle ${task.label}` : undefined}
                                        >
                                            {done
                                                ? <CheckCircle2 className="h-5 w-5 text-black" />
                                                : <Circle className="h-5 w-5 text-zinc-300" />
                                            }
                                        </button>

                                        {/* Icon tile */}
                                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                                            done ? "bg-zinc-100" : "bg-zinc-100"
                                        }`}>
                                            <Icon className="h-4 w-4 text-zinc-500" />
                                        </div>

                                        {/* Text */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-semibold leading-tight ${
                                                done ? "line-through text-zinc-400" : "text-black"
                                            }`}>
                                                {task.label}
                                            </p>
                                            <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{task.detail}</p>
                                        </div>

                                        {/* Arrow */}
                                        {!done && (
                                            <button
                                                onClick={() => goTo(task.href)}
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

                        {/* All done banner */}
                        {allDone && (
                            <div className="px-6 pb-4 shrink-0">
                                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-center">
                                    <Award className="h-8 w-8 text-black mx-auto mb-1.5" />
                                    <p className="text-sm font-extrabold text-black">You're all set up!</p>
                                    <p className="text-[11px] text-zinc-500 mt-0.5">Keep applying — your next role is close.</p>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="px-6 py-5 shrink-0 border-t border-zinc-100">
                            <button
                                onClick={onClose}
                                className="w-full h-11 rounded-xl bg-black hover:bg-zinc-800 text-white text-sm font-bold transition-all"
                            >
                                Close
                            </button>
                            <p className="text-[10px] text-zinc-400 text-center mt-3 font-medium">
                                Checked items update automatically as you use the platform.
                            </p>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
