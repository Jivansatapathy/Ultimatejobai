import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell, X, Clock, Briefcase, Mail, Target, ChevronRight,
    CheckCircle2, BellOff, Settings,
} from "lucide-react";
import { notificationService, NotificationPrefs, DEFAULT_PREFS } from "@/services/notificationService";
import { useNavigate } from "react-router-dom";

const DAILY_OPTIONS = [3, 5, 10, 15, 20];

export default function NotificationBell() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<"feed" | "settings">("feed");
    const [prefs, setPrefs] = useState<NotificationPrefs>(() => notificationService.getPrefs());
    const [permission, setPermission] = useState<NotificationPermission>(() => notificationService.getBrowserPermission());
    const [saved, setSaved] = useState(false);

    // In-app notification feed (generated from prefs)
    const feed = buildFeed(prefs);

    const handleEnableBrowser = async () => {
        const granted = await notificationService.requestBrowserPermission();
        setPermission(granted ? "granted" : "denied");
        setPrefs(p => ({ ...p, browserNotifications: granted }));
    };

    const handleSave = () => {
        notificationService.savePrefs(prefs);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const hasSetup = !!prefs.targetRole;
    const unread = feed.filter(f => !f.read).length;

    return (
        <div className="relative">
            {/* Bell button */}
            <button
                onClick={() => setOpen(o => !o)}
                className="relative flex items-center justify-center h-9 w-9 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
                <Bell className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                {(unread > 0 || !hasSetup) && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-teal-400" />
                )}
            </button>

            {/* Dropdown panel */}
            <AnimatePresence>
                {open && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -8 }}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            className="absolute right-0 top-11 z-50 w-80 rounded-2xl bg-[#0e0e1a] border border-white/[0.1] shadow-2xl overflow-hidden"
                        >
                            <div className="h-0.5 w-full bg-gradient-to-r from-teal-500 via-violet-500 to-teal-500" />

                            {/* Header tabs */}
                            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/[0.06]">
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setTab("feed")}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${tab === "feed" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
                                    >
                                        Notifications
                                    </button>
                                    <button
                                        onClick={() => setTab("settings")}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${tab === "settings" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
                                    >
                                        <Settings className="h-3 w-3" /> Preferences
                                    </button>
                                </div>
                                <button onClick={() => setOpen(false)} className="text-slate-600 hover:text-white transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Feed tab */}
                            {tab === "feed" && (
                                <div className="max-h-80 overflow-y-auto">
                                    {!hasSetup ? (
                                        <div className="p-5 text-center">
                                            <Bell className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                                            <p className="text-sm font-semibold text-white mb-1">Set up your reminders</p>
                                            <p className="text-xs text-slate-500 mb-4">Configure your target role and daily goal to get personalised alerts.</p>
                                            <button
                                                onClick={() => setTab("settings")}
                                                className="text-xs font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-4 py-2 rounded-xl"
                                            >
                                                Configure now
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-white/[0.05]">
                                            {feed.map((item, i) => {
                                                const Icon = item.icon;
                                                return (
                                                    <div
                                                        key={i}
                                                        onClick={() => { navigate(item.href); setOpen(false); }}
                                                        className="flex items-start gap-3 px-4 py-3.5 hover:bg-white/[0.03] cursor-pointer transition-colors"
                                                    >
                                                        <div className={`h-8 w-8 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                                                            <Icon className={`h-4 w-4 ${item.iconColor}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-white leading-tight">{item.title}</p>
                                                            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{item.body}</p>
                                                        </div>
                                                        <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0 mt-1" />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Settings tab */}
                            {tab === "settings" && (
                                <div className="p-4 space-y-4 max-h-[420px] overflow-y-auto">
                                    {/* Target role */}
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Target Job Role</label>
                                        <input
                                            value={prefs.targetRole}
                                            onChange={e => setPrefs(p => ({ ...p, targetRole: e.target.value }))}
                                            placeholder="e.g. Software Engineer"
                                            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50"
                                        />
                                    </div>

                                    {/* Daily target */}
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Daily Application Target</label>
                                        <div className="flex gap-1.5">
                                            {DAILY_OPTIONS.map(n => (
                                                <button
                                                    key={n}
                                                    onClick={() => setPrefs(p => ({ ...p, dailyTarget: n }))}
                                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${prefs.dailyTarget === n ? "bg-teal-500 text-white" : "bg-white/[0.05] text-slate-400 hover:bg-white/[0.08]"}`}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Reminder time */}
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Daily Reminder Time</label>
                                        <input
                                            type="time"
                                            value={prefs.reminderTime}
                                            onChange={e => setPrefs(p => ({ ...p, reminderTime: e.target.value }))}
                                            className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500/50"
                                        />
                                    </div>

                                    {/* Toggles */}
                                    {/* Job alerts toggle */}
                                    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
                                        <div className="flex items-center gap-2.5">
                                            <Briefcase className="h-4 w-4 text-sky-400 shrink-0" />
                                            <div>
                                                <p className="text-xs font-semibold text-white">New Job Alerts</p>
                                                <p className="text-[10px] text-slate-600">Alerts when jobs match your role</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setPrefs(p => ({ ...p, jobAlerts: !p.jobAlerts }))}
                                            className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${prefs.jobAlerts ? "bg-teal-500" : "bg-white/[0.1]"}`}
                                        >
                                            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${prefs.jobAlerts ? "left-4" : "left-0.5"}`} />
                                        </button>
                                    </div>

                                    {/* Email digest — always on */}
                                    <div className="flex items-center justify-between rounded-xl border border-orange-500/20 bg-orange-500/[0.06] px-3 py-2.5">
                                        <div className="flex items-center gap-2.5">
                                            <Mail className="h-4 w-4 text-orange-400 shrink-0" />
                                            <div>
                                                <p className="text-xs font-semibold text-white">Email Digest</p>
                                                <p className="text-[10px] text-slate-600">Daily job picks to your inbox</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-orange-400 flex items-center gap-1 shrink-0">
                                            <CheckCircle2 className="h-3 w-3" /> Always on
                                        </span>
                                    </div>

                                    {/* Browser notifications */}
                                    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
                                        <div className="flex items-center gap-2.5">
                                            <Bell className="h-4 w-4 text-teal-400 shrink-0" />
                                            <div>
                                                <p className="text-xs font-semibold text-white">Browser Notifications</p>
                                                <p className="text-[10px] text-slate-600">Push reminders in your browser</p>
                                            </div>
                                        </div>
                                        {permission === "granted" ? (
                                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" /> On
                                            </span>
                                        ) : permission === "denied" ? (
                                            <span className="text-[10px] text-slate-600 flex items-center gap-1">
                                                <BellOff className="h-3 w-3" /> Blocked
                                            </span>
                                        ) : (
                                            <button onClick={handleEnableBrowser} className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-lg">
                                                Enable
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleSave}
                                        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${saved ? "bg-emerald-500 text-white" : "bg-teal-500 hover:bg-teal-400 text-white"}`}
                                    >
                                        {saved ? "✓ Saved!" : "Save preferences"}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

// Generate an in-app notification feed from the user's prefs
function buildFeed(prefs: NotificationPrefs) {
    if (!prefs.targetRole) return [];
    return [
        {
            icon: Clock,
            iconBg: "bg-teal-500/10",
            iconColor: "text-teal-400",
            title: `Daily Goal — ${prefs.dailyTarget} applications`,
            body: `Your target today: apply to ${prefs.dailyTarget} ${prefs.targetRole} roles. Stay consistent!`,
            href: "/jobs",
            read: false,
        },
        {
            icon: Briefcase,
            iconBg: "bg-sky-500/10",
            iconColor: "text-sky-400",
            title: `New ${prefs.targetRole} jobs available`,
            body: `Fresh openings matching your role have been posted. Check them out before they close.`,
            href: "/jobs",
            read: false,
        },
        {
            icon: Target,
            iconBg: "bg-violet-500/10",
            iconColor: "text-violet-400",
            title: "Build your career plan",
            body: "Get a 12–24 month roadmap tailored to your target role from the AI Career Planner.",
            href: "/career-planner",
            read: true,
        },
        {
            icon: Mail,
            iconBg: "bg-orange-500/10",
            iconColor: "text-orange-400",
            title: "Complete your profile",
            body: "A complete resume with your target role gets 3× more ATS matches. Finish yours now.",
            href: "/resume",
            read: true,
        },
    ];
}
