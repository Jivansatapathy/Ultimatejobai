import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X } from "lucide-react";
import { useResume } from "@/hooks/useResume";
import { useAuth } from "@/context/AuthContext";

const MANUAL_KEY = "gs_manual_checks";
const HIDDEN_KEY = "gs_toggle_hidden";
const TOTAL = 6;

function getCompletedCount(resumes: any[], appCount: number, interviewDone: boolean): number {
    try {
        const manual = JSON.parse(localStorage.getItem(MANUAL_KEY) || "{}");
        let count = 0;
        if (resumes.length > 0) count++;
        if (appCount > 0) count++;
        if (interviewDone) count++;
        if (manual.profile) count++;
        if (manual.career_plan) count++;
        if (manual.mentor) count++;
        return count;
    } catch { return 0; }
}

interface ChecklistToggleProps {
    onClick: () => void;
    appCount: number;
    interviewDone: boolean;
}

export default function ChecklistToggle({ onClick, appCount, interviewDone }: ChecklistToggleProps) {
    const { resumes } = useResume();
    const { isAuthenticated } = useAuth();
    const [hidden, setHidden] = useState(() => !!localStorage.getItem(HIDDEN_KEY));

    const completed = getCompletedCount(resumes, appCount, interviewDone);
    const remaining = TOTAL - completed;
    const pct = Math.round((completed / TOTAL) * 100);

    if (!isAuthenticated) return null;

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        setHidden(true);
        localStorage.setItem(HIDDEN_KEY, "1");
    };

    return (
        <AnimatePresence>
            {!hidden && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    className="fixed bottom-6 right-6 z-40"
                >
                    {/* Pulse ring */}
                    {remaining > 0 && (
                        <span className="absolute inset-0 rounded-2xl animate-ping bg-violet-500/20 pointer-events-none" />
                    )}

                    <div className="relative flex items-center gap-3 rounded-2xl bg-[#0e0e1a] border border-violet-500/40 shadow-[0_8px_40px_rgba(139,92,246,0.3)] px-4 py-3 text-white">
                        {/* Icon */}
                        <div className="relative shrink-0">
                            <div className="h-9 w-9 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
                                <Zap className="h-4.5 w-4.5 h-[18px] w-[18px] text-violet-400" />
                            </div>
                            {remaining > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-violet-500 text-[10px] font-black flex items-center justify-center">
                                    {remaining}
                                </span>
                            )}
                        </div>

                        {/* Text — clickable area */}
                        <button onClick={onClick} className="text-left">
                            <p className="text-sm font-black leading-tight tracking-tight bg-gradient-to-r from-violet-300 to-sky-300 bg-clip-text text-transparent">
                                {completed === TOTAL ? "🎉 You're career-ready!" : "Boost Your Career"}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="h-1 w-20 rounded-full bg-white/10 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400 transition-all duration-500"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 font-semibold">{pct}%</p>
                            </div>
                        </button>

                        {/* Close */}
                        <button
                            onClick={handleClose}
                            className="ml-1 shrink-0 text-slate-600 hover:text-slate-300 transition-colors"
                            title="Hide"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
