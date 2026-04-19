import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp, X } from "lucide-react";
import { autoApplyQueueService, QueueItem } from "@/services/autoApplyQueueService";
import { autoApplyService } from "@/services/autoApplyService";
import { toast } from "sonner";

function fmtCountdown(ms: number) {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

interface AutoApplyQueueBarProps {
    onJobApplied?: (jobId: string) => void;
}

export function AutoApplyQueueBar({ onJobApplied }: AutoApplyQueueBarProps = {}) {
    const [stats, setStats] = useState(() => autoApplyQueueService.getStats());
    const [nextFireTime, setNextFireTime] = useState<number | null>(() => autoApplyQueueService.getNextFireTime());
    const [queue, setQueue] = useState<QueueItem[]>(() => autoApplyQueueService.getQueue());
    const [now, setNow] = useState(Date.now());
    const [expanded, setExpanded] = useState(false);
    const [firing, setFiring] = useState(false);

    const refresh = useCallback(() => {
        setStats(autoApplyQueueService.getStats());
        setNextFireTime(autoApplyQueueService.getNextFireTime());
        setQueue(autoApplyQueueService.getQueue());
    }, []);

    // Countdown ticker — every second
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);

    // Queue processor — check every 30 s for due items
    useEffect(() => {
        const process = async () => {
            if (firing) return;
            const next = autoApplyQueueService.getNextPending();
            if (!next) return;
            if (!autoApplyQueueService.canApplyMore()) {
                toast.error("Daily limit of 30 applications reached. Queue paused until tomorrow.");
                return;
            }

            // Guard: verify credentials before firing
            try {
                const status = await autoApplyService.getStatus();
                const hasCredentials = !!(status?.has_credentials || status?.gmail_connected);
                if (!hasCredentials) {
                    autoApplyQueueService.cancelPending();
                    refresh();
                    toast.error("Email not configured — queue cancelled. Set up your email via Auto Apply on any job, then queue again.");
                    return;
                }
            } catch {
                // If status check fails, skip this tick and retry next interval
                return;
            }

            setFiring(true);
            try {
                await autoApplyService.apply(next.jobId, next.resumeId);
                autoApplyQueueService.markSent(next.jobId);
                onJobApplied?.(next.jobId);
                toast.success(`Applied to ${next.jobTitle} at ${next.company}`);
            } catch (e: any) {
                const msg = e?.response?.data?.error || e?.message || "Unknown error";
                autoApplyQueueService.markFailed(next.jobId, msg);
                toast.error(`Failed to apply to ${next.jobTitle}: ${msg}`);
            } finally {
                setFiring(false);
                refresh();
            }
        };

        process(); // check immediately on mount
        const interval = setInterval(process, 30_000);
        return () => clearInterval(interval);
    }, [firing, refresh]);

    const { pending, sent, failed } = stats;
    const total = pending + sent + failed;
    if (total === 0) return null;

    const daily = autoApplyQueueService.getDailyCount();
    const msLeft = nextFireTime ? Math.max(0, nextFireTime - now) : 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-[24px] border border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 overflow-hidden shadow-sm"
            >
                {/* Main bar */}
                <div className="flex items-center gap-4 px-5 py-3.5">
                    {/* Icon + label */}
                    <div className="flex items-center gap-2.5 shrink-0">
                        <div className="relative h-9 w-9 rounded-xl bg-teal-500 flex items-center justify-center">
                            <Zap className="h-4 w-4 text-white fill-white" />
                            {pending > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-400 text-[9px] font-black text-white flex items-center justify-center">
                                    {pending}
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-black text-teal-900 leading-tight">Auto Apply Queue</p>
                            <p className="text-[10px] text-teal-600 font-semibold">
                                {daily.count} / {autoApplyQueueService.DAILY_LIMIT} today
                            </p>
                        </div>
                    </div>

                    {/* Stats pills */}
                    <div className="flex items-center gap-2 flex-wrap flex-1">
                        {pending > 0 && (
                            <span className="flex items-center gap-1 rounded-full bg-amber-100 border border-amber-200 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                                <Clock className="h-3 w-3" /> {pending} queued
                            </span>
                        )}
                        {sent > 0 && (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                <CheckCircle2 className="h-3 w-3" /> {sent} sent
                            </span>
                        )}
                        {failed > 0 && (
                            <span className="flex items-center gap-1 rounded-full bg-red-100 border border-red-200 px-2.5 py-1 text-[11px] font-bold text-red-700">
                                <XCircle className="h-3 w-3" /> {failed} failed
                            </span>
                        )}

                        {/* Countdown */}
                        {pending > 0 && nextFireTime && (
                            <span className="text-xs text-teal-700 font-semibold ml-1">
                                {msLeft <= 0 ? (firing ? "Sending…" : "Due now") : `Next in ${fmtCountdown(msLeft)}`}
                            </span>
                        )}
                        {pending === 0 && sent > 0 && (
                            <span className="text-xs text-emerald-700 font-semibold">All done!</span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        {pending > 0 && (
                            <button
                                onClick={() => { autoApplyQueueService.cancelPending(); refresh(); toast("Queue cancelled"); }}
                                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 border border-rose-200 bg-white hover:bg-rose-50 px-3 py-1.5 rounded-full transition-all"
                            >
                                Cancel
                            </button>
                        )}
                        {pending === 0 && (
                            <button
                                onClick={() => { autoApplyQueueService.clearAll(); refresh(); }}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                                title="Dismiss"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                        <button
                            onClick={() => setExpanded(e => !e)}
                            className="text-teal-600 hover:text-teal-800 transition-colors"
                        >
                            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {/* Expanded job list */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="border-t border-teal-200 px-5 py-3 max-h-60 overflow-y-auto space-y-1.5">
                                {queue.map((item, i) => {
                                    const msToFire = Math.max(0, item.scheduledAt - now);
                                    return (
                                        <div key={item.jobId + i} className="flex items-center gap-3 rounded-xl bg-white border border-slate-100 px-3 py-2 shadow-sm">
                                            <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                                                item.status === "sent" ? "bg-emerald-100" :
                                                item.status === "failed" ? "bg-red-100" : "bg-amber-100"
                                            }`}>
                                                {item.status === "sent" && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                                                {item.status === "failed" && <XCircle className="h-3 w-3 text-red-600" />}
                                                {item.status === "pending" && <Clock className="h-3 w-3 text-amber-600" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-800 truncate">{item.jobTitle}</p>
                                                <p className="text-[10px] text-slate-400 truncate">{item.company}</p>
                                            </div>
                                            <div className="text-[10px] font-semibold shrink-0">
                                                {item.status === "sent" && <span className="text-emerald-600">Applied ✓</span>}
                                                {item.status === "failed" && <span className="text-red-500">Failed</span>}
                                                {item.status === "pending" && (
                                                    <span className="text-slate-400">
                                                        {msToFire <= 0 ? "Due now" : `in ${fmtCountdown(msToFire)}`}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
}
