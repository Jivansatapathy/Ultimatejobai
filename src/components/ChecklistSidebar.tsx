import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, CheckCircle2, Circle, Briefcase, FileText, Mic,
    TrendingUp, Users, Target, ChevronRight, ClipboardList, Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useResume } from "@/hooks/useResume";
import { autoApplyService } from "@/services/autoApplyService";
import { activityService } from "@/services/activityService";
import { useAuth } from "@/context/AuthContext";

const MANUAL_KEY = "gs_manual_checks";
const OPEN_KEY = "gs_sidebar_open";

interface Task {
    id: string;
    label: string;
    detail: string;
    icon: React.ElementType;
    color: string;
    iconBg: string;
    href: string;
    manual?: boolean;
}

const TASKS: Task[] = [
    { id: "resume", label: "Upload your resume", detail: "AI parses and fills your profile.", icon: FileText, color: "text-violet-400", iconBg: "bg-violet-500/10", href: "/resume" },
    { id: "profile", label: "Set your target role", detail: "Tell us what role you're aiming for.", icon: Target, color: "text-sky-400", iconBg: "bg-sky-500/10", href: "/resume", manual: true },
    { id: "apply", label: "Apply to a job", detail: "Send your first application.", icon: Briefcase, color: "text-emerald-400", iconBg: "bg-emerald-500/10", href: "/jobs" },
    { id: "interview", label: "Practice an interview", detail: "Run a mock session with AI feedback.", icon: Mic, color: "text-pink-400", iconBg: "bg-pink-500/10", href: "/interview" },
    { id: "career_plan", label: "Start your career plan", detail: "Get a 12–24 month AI roadmap.", icon: TrendingUp, color: "text-amber-400", iconBg: "bg-amber-500/10", href: "/career-planner", manual: true },
    { id: "mentor", label: "Explore AI Mentor", detail: "Job fairs, salary negotiator & more.", icon: Users, color: "text-teal-400", iconBg: "bg-teal-500/10", href: "/ai-mentor", manual: true },
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
        autoApplyService.getHistory()
            .then(data => setAppCount((data as any)?.applications?.length ?? 0))
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

    const goTo = (href: string) => {
        onClose();
        navigate(href);
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop (mobile only) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                        onClick={onClose}
                    />

                    {/* Sidebar */}
                    <motion.aside
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 320, damping: 32 }}
                        className="fixed top-0 right-0 h-full w-80 z-50 flex flex-col bg-[#0e0e1a] border-l border-white/[0.08] shadow-2xl"
                    >
                        {/* Top accent */}
                        <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-sky-400 to-violet-500 shrink-0" />

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-white/[0.06]">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
                                    <ClipboardList className="h-4 w-4 text-violet-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-400">Getting Started</p>
                                    <p className="text-sm font-bold text-white leading-tight">Setup Checklist</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Progress */}
                        <div className="px-5 py-4 shrink-0 border-b border-white/[0.06]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-slate-400">{completedCount} of {TASKS.length} complete</span>
                                <span className="text-xs font-bold text-white">{progress}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                />
                            </div>
                            {appCount > 0 && (
                                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1">
                                    <Briefcase className="h-3 w-3 text-emerald-400" />
                                    <span className="text-[11px] font-semibold text-emerald-400">
                                        {appCount} application{appCount !== 1 ? "s" : ""} sent
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Task list */}
                        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
                            {TASKS.map(task => {
                                const done = isChecked(task);
                                const Icon = task.icon;
                                return (
                                    <div
                                        key={task.id}
                                        className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition-all ${done ? "opacity-50" : "hover:bg-white/[0.04]"}`}
                                    >
                                        <button
                                            onClick={() => task.manual && toggle(task.id)}
                                            className={task.manual ? "cursor-pointer shrink-0" : "cursor-default shrink-0"}
                                        >
                                            {done
                                                ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                                : <Circle className="h-5 w-5 text-slate-600" />
                                            }
                                        </button>

                                        <div className={`h-8 w-8 rounded-xl ${task.iconBg} flex items-center justify-center shrink-0`}>
                                            <Icon className={`h-4 w-4 ${task.color}`} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-semibold leading-tight ${done ? "line-through text-slate-500" : "text-white"}`}>
                                                {task.label}
                                            </p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">{task.detail}</p>
                                        </div>

                                        {!done && (
                                            <button
                                                onClick={() => goTo(task.href)}
                                                className="shrink-0 text-slate-600 hover:text-violet-400 transition-colors"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* All done */}
                        {completedCount === TASKS.length && (
                            <div className="px-5 pb-4 shrink-0">
                                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
                                    <Award className="h-8 w-8 text-emerald-400 mx-auto mb-1.5" />
                                    <p className="text-sm font-bold text-emerald-400">You're all set up!</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Keep applying — your next role is close.</p>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="px-5 py-4 shrink-0 border-t border-white/[0.06] space-y-3">
                            <button
                                onClick={onClose}
                                className="w-full py-2.5 rounded-xl text-sm font-bold text-slate-400 border border-white/[0.08] hover:bg-white/[0.06] hover:text-white transition-all"
                            >
                                Close
                            </button>
                            <p className="text-[10px] text-slate-600 text-center">
                                Auto-tracked items update when you complete them on the platform.
                            </p>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
