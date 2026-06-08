import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, BellOff, X, Target, Briefcase, Mail, Clock,
  CheckCircle2, ChevronRight,
} from "lucide-react";
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

  useEffect(() => {
    if (activeResume?.targetJobRole && !prefs.targetRole) {
      setPrefs((p) => ({ ...p, targetRole: activeResume.targetJobRole || "" }));
    }
  }, [activeResume]);

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
    setPrefs((p) => ({ ...p, browserNotifications: granted }));
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

  const inputCls =
    "w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-black placeholder:text-zinc-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-2xl bg-white border border-zinc-200 shadow-2xl shadow-black/10 overflow-hidden">

              {/* Top black accent bar */}
              <div className="h-1 w-full bg-black" />

              {/* ── Step: intro ── */}
              {step === "intro" && (
                <div className="p-7">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black">
                      <Bell className="h-5 w-5 text-white" />
                    </div>
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={handleClose}
                      className="text-zinc-400 hover:text-black transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <h2 className="text-xl font-extrabold text-black tracking-tight mb-1.5">
                    Stay on track with smart reminders
                  </h2>
                  <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                    Set up daily job application reminders and instant alerts when new openings match your target role.
                  </p>

                  <div className="space-y-2.5 mb-7">
                    {[
                      { icon: Clock,    text: "Daily reminder to hit your application goal" },
                      { icon: Briefcase, text: "Instant alerts for new jobs matching your role" },
                      { icon: Target,   text: "Set your own daily target (3–20 applications)" },
                      { icon: Mail,     text: "Optional email digest with curated picks for you" },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 shrink-0">
                          <Icon className="h-3.5 w-3.5 text-zinc-600" />
                        </div>
                        <p className="text-sm text-zinc-700 font-medium">{text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep("prefs")}
                      className="flex-1 flex items-center justify-center gap-1.5 h-11 rounded-xl bg-black hover:bg-zinc-800 text-white text-sm font-bold transition-all"
                    >
                      Set up reminders
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="h-11 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-sm font-semibold transition-all"
                    >
                      Later
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step: prefs ── */}
              {step === "prefs" && (
                <div className="p-7">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900">
                      <Bell className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400">Preferences</p>
                      <h2 className="text-base font-bold text-black leading-tight">Personalise your notifications</h2>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* Target role */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 block">
                        Target Job Role
                      </label>
                      <input
                        value={prefs.targetRole}
                        onChange={(e) => setPrefs((p) => ({ ...p, targetRole: e.target.value }))}
                        placeholder="e.g. CFO, CTO, VP Engineering…"
                        className={inputCls}
                      />
                      <p className="text-[10px] text-zinc-400 mt-1 font-medium">Used to find matching roles and personalise alerts.</p>
                    </div>

                    {/* Daily target */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 block">
                        Daily Application Target
                      </label>
                      <div className="flex gap-2">
                        {DAILY_OPTIONS.map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setPrefs((p) => ({ ...p, dailyTarget: n }))}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                              prefs.dailyTarget === n
                                ? "bg-black text-white"
                                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1 font-medium">Applications per day. Start with 5 if unsure.</p>
                    </div>

                    {/* Reminder time */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 block">
                        Daily Reminder Time
                      </label>
                      <input
                        type="time"
                        aria-label="Daily reminder time"
                        value={prefs.reminderTime}
                        onChange={(e) => setPrefs((p) => ({ ...p, reminderTime: e.target.value }))}
                        className="bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black transition-all"
                      />
                    </div>

                    {/* Browser notifications */}
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bell className="h-4 w-4 text-zinc-500" />
                          <div>
                            <p className="text-sm font-semibold text-black">Browser Notifications</p>
                            <p className="text-[10px] text-zinc-500 font-medium">Reminders & job alerts in your browser</p>
                          </div>
                        </div>
                        {permissionStatus === "granted" ? (
                          <span className="text-[10px] font-bold text-black flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Enabled
                          </span>
                        ) : permissionStatus === "denied" ? (
                          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                            <BellOff className="h-3.5 w-3.5" /> Blocked
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleEnableBrowser}
                            className="text-[10px] font-bold text-black bg-black/[0.07] border border-black/10 px-3 py-1 rounded-full hover:bg-black/10 transition-all"
                          >
                            Enable
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Email digest */}
                    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-zinc-500" />
                        <div>
                          <p className="text-sm font-semibold text-black">Email Digest</p>
                          <p className="text-[10px] text-zinc-500 font-medium">Daily job picks sent to your inbox</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-black flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Always on
                      </span>
                    </div>

                    {/* Job alerts toggle */}
                    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-4 w-4 text-zinc-500" />
                        <div>
                          <p className="text-sm font-semibold text-black">New Job Alerts</p>
                          <p className="text-[10px] text-zinc-500 font-medium">Notify when jobs match your role</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label={prefs.jobAlerts ? "Disable job alerts" : "Enable job alerts"}
                        onClick={() => setPrefs((p) => ({ ...p, jobAlerts: !p.jobAlerts }))}
                        className={`relative w-10 h-6 rounded-full transition-colors ${
                          prefs.jobAlerts ? "bg-black" : "bg-zinc-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                            prefs.jobAlerts ? "left-5" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!prefs.targetRole.trim()}
                    className="mt-6 w-full h-11 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-sm transition-all disabled:opacity-40"
                  >
                    Save preferences
                  </button>
                </div>
              )}

              {/* ── Step: done ── */}
              {step === "done" && (
                <div className="p-7 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black mx-auto mb-5">
                    <CheckCircle2 className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-xl font-extrabold text-black mb-2">You're all set!</h2>
                  <p className="text-zinc-500 text-sm leading-relaxed mb-2">
                    We'll remind you daily to apply for{" "}
                    <span className="text-black font-semibold">{prefs.targetRole}</span> roles and alert you when new openings match.
                  </p>
                  <p className="text-zinc-400 text-xs mb-7">
                    Daily target:{" "}
                    <span className="text-black font-semibold">{prefs.dailyTarget} applications</span>
                    {" "}· Reminder at{" "}
                    <span className="text-black font-semibold">{prefs.reminderTime}</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="h-11 px-8 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-sm transition-all"
                  >
                    Start applying
                  </button>
                </div>
              )}

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
