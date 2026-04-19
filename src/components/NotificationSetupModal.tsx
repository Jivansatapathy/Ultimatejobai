import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell, BellOff, X, Target, Briefcase, Mail, Clock,
    CheckCircle2, ChevronRight, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResume } from "@/hooks/useResume";
import { notificationService, NotificationPrefs } from "@/services/notificationService";
import { useAuth } from "@/context/AuthContext";

export default function NotificationSetupModal() {
    const { isAuthenticated } = useAuth();
    const { activeResume } = useResume();
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<"intro" | "prefs" | "done">("intro");
    const [prefs, setPrefs] = useState<NotificationPrefs>(() => notificationService.getPrefs());
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");

    // Pre-fill target role from resume
    useEffect(() => {
        if (activeResume?.targetJobRole && !prefs.targetRole) {
            setPrefs(p => ({ ...p, targetRole: activeResume.targetJobRole || "" }));
        }
    }, [activeResume]);

    // Show modal once after login if setup not done
    useEffect(() => {
        if (!isAuthenticated) return;
        if (notificationService.hasPromptedSetup()) return;
        const t = setTimeout(() => {
            setOpen(true);
            notificationService.markSetupPrompted();
        }, 3000);
        return () => clearTimeout(t);
    }, [isAuthenticated]);

    useEffect(() => {
        setPermissionStatus(notificationService.getBrowserPermission());
    }, []);

    const handleEnableBrowser = async () => {
        const granted = await notificationService.requestBrowserPermission();
        setPermissionStatus(granted ? "granted" : "denied");
        setPrefs(p => ({ ...p, browserNotifications: granted }));
    };

    const handleSave = () => {
        notificationService.savePrefs(prefs);
        setStep("done");
    };

    const handleClose = () => {
        notificationService.savePrefs(prefs);
        setOpen(false);
    };

    const DAILY_OPTIONS = [3, 5, 10, 15, 20];

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={handleClose}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94 }}
                            transition={{ type: "spring", stiffness: 300, damping: 28 }}
                            className="w-full max-w-md"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="rounded-3xl bg-[#0e0e1a] border border-white/[0.08] shadow-2xl overflow-hidden">
                                <div className="h-0.5 w-full bg-gradient-to-r from-teal-500 via-violet-500 to-teal-500" />

                                {step === "intro" && (
                                    <div className="p-7">
                                        <div className="flex items-start justify-between mb-5">
                                            <div className="h-12 w-12 rounded-2xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center">
                                                <Bell className="h-6 w-6 text-teal-400" />
                                            </div>
                                            <button onClick={handleClose} className="text-slate-500 hover:text-white transition-colors">
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <h2 className="text-xl font-black text-white mb-2">Stay on track with smart reminders</h2>
                                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                            Set up daily job application reminders and instant alerts when new openings match your target role. Never miss an opportunity.
                                        </p>
                                        <div className="space-y-3 mb-7">
                                            {[
                                                { icon: Clock, color: "text-teal-400", text: "Daily reminder to hit your application goal" },
                                                { icon: Briefcase, color: "text-sky-400", text: "Instant alerts for new jobs matching your role" },
                                                { icon: Target, color: "text-violet-400", text: "Set your own daily target (3–20 applications)" },
                                                { icon: Mail, color: "text-orange-400", text: "Optional email digest with job picks for you" },
                                            ].map(({ icon: Icon, color, text }) => (
                                                <div key={text} className="flex items-center gap-3">
                                                    <div className="h-7 w-7 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
                                                        <Icon className={`h-3.5 w-3.5 ${color}`} />
                                                    </div>
                                                    <p className="text-sm text-slate-300">{text}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                onClick={() => setStep("prefs")}
                                                className="flex-1 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl h-11"
                                            >
                                                Set up reminders <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={handleClose}
                                                className="text-slate-500 hover:text-white rounded-xl h-11"
                                            >
                                                Maybe later
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {step === "prefs" && (
                                    <div className="p-7">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="h-9 w-9 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center">
                                                <Sparkles className="h-4 w-4 text-teal-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-400">Preferences</p>
                                                <h2 className="text-base font-bold text-white leading-tight">Personalise your notifications</h2>
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            {/* Target role */}
                                            <div>
                                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                                                    Target Job Role
                                                </label>
                                                <input
                                                    value={prefs.targetRole}
                                                    onChange={e => setPrefs(p => ({ ...p, targetRole: e.target.value }))}
                                                    placeholder="e.g. Software Engineer, Product Manager"
                                                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50"
                                                />
                                                <p className="text-[11px] text-slate-600 mt-1">Used to find matching jobs and personalise alerts.</p>
                                            </div>

                                            {/* Daily target */}
                                            <div>
                                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                                                    Daily Application Target
                                                </label>
                                                <div className="flex gap-2">
                                                    {DAILY_OPTIONS.map(n => (
                                                        <button
                                                            key={n}
                                                            onClick={() => setPrefs(p => ({ ...p, dailyTarget: n }))}
                                                            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                                                                prefs.dailyTarget === n
                                                                    ? "bg-teal-500 text-white"
                                                                    : "bg-white/[0.05] text-slate-400 hover:bg-white/[0.08]"
                                                            }`}
                                                        >
                                                            {n}
                                                        </button>
                                                    ))}
                                                </div>
                                                <p className="text-[11px] text-slate-600 mt-1">Applications per day. Start with 5 if unsure.</p>
                                            </div>

                                            {/* Reminder time */}
                                            <div>
                                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                                                    Daily Reminder Time
                                                </label>
                                                <input
                                                    type="time"
                                                    value={prefs.reminderTime}
                                                    onChange={e => setPrefs(p => ({ ...p, reminderTime: e.target.value }))}
                                                    className="bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/50"
                                                />
                                            </div>

                                            {/* Browser notifications */}
                                            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Bell className="h-4 w-4 text-teal-400" />
                                                        <div>
                                                            <p className="text-sm font-semibold text-white">Browser Notifications</p>
                                                            <p className="text-[11px] text-slate-500">Reminders & job alerts in your browser</p>
                                                        </div>
                                                    </div>
                                                    {permissionStatus === "granted" ? (
                                                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                                                            <CheckCircle2 className="h-3.5 w-3.5" /> Enabled
                                                        </span>
                                                    ) : permissionStatus === "denied" ? (
                                                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                                            <BellOff className="h-3.5 w-3.5" /> Blocked
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={handleEnableBrowser}
                                                            className="text-[11px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full"
                                                        >
                                                            Enable
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Email — always on */}
                                            <div className="flex items-center justify-between rounded-2xl border border-orange-500/20 bg-orange-500/[0.06] p-4">
                                                <div className="flex items-center gap-3">
                                                    <Mail className="h-4 w-4 text-orange-400" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-white">Email Digest</p>
                                                        <p className="text-[11px] text-slate-500">Daily job picks sent to your inbox</p>
                                                    </div>
                                                </div>
                                                <span className="text-[11px] font-bold text-orange-400 flex items-center gap-1">
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Always on
                                                </span>
                                            </div>

                                            {/* Job alerts */}
                                            <div className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                                                <div className="flex items-center gap-3">
                                                    <Briefcase className="h-4 w-4 text-sky-400" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-white">New Job Alerts</p>
                                                        <p className="text-[11px] text-slate-500">Notify when jobs match your role</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setPrefs(p => ({ ...p, jobAlerts: !p.jobAlerts }))}
                                                    className={`relative w-10 h-6 rounded-full transition-colors ${prefs.jobAlerts ? "bg-teal-500" : "bg-white/[0.1]"}`}
                                                >
                                                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${prefs.jobAlerts ? "left-5" : "left-1"}`} />
                                                </button>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleSave}
                                            disabled={!prefs.targetRole.trim()}
                                            className="mt-6 w-full bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl h-11 disabled:opacity-40"
                                        >
                                            Save preferences
                                        </Button>
                                    </div>
                                )}

                                {step === "done" && (
                                    <div className="p-7 text-center">
                                        <div className="h-16 w-16 rounded-2xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center mx-auto mb-5">
                                            <CheckCircle2 className="h-8 w-8 text-teal-400" />
                                        </div>
                                        <h2 className="text-xl font-black text-white mb-2">You're all set!</h2>
                                        <p className="text-slate-400 text-sm leading-relaxed mb-2">
                                            We'll remind you daily to apply for <span className="text-white font-semibold">{prefs.targetRole}</span> roles and alert you when new openings match.
                                        </p>
                                        <p className="text-slate-500 text-xs mb-6">
                                            Daily target: <span className="text-white">{prefs.dailyTarget} applications</span> · Reminder at <span className="text-white">{prefs.reminderTime}</span>
                                        </p>
                                        <Button
                                            onClick={handleClose}
                                            className="bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl h-10 px-8"
                                        >
                                            Start applying
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
