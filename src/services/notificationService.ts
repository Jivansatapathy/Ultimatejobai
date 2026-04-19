import api from "./api";

export interface NotificationPrefs {
    targetRole: string;
    dailyTarget: number;
    browserNotifications: boolean;
    emailNotifications: boolean;
    jobAlerts: boolean;
    reminderTime: string; // "HH:MM" 24h
}

const PREFS_KEY = "notif_prefs";
const LAST_DAILY_KEY = "notif_last_daily";
const LAST_JOB_ALERT_KEY = "notif_last_job_alert";

export const DEFAULT_PREFS: NotificationPrefs = {
    targetRole: "",
    dailyTarget: 5,
    browserNotifications: false,
    emailNotifications: true,
    jobAlerts: true,
    reminderTime: "09:00",
};

export const notificationService = {
    getPrefs(): NotificationPrefs {
        try {
            const raw = localStorage.getItem(PREFS_KEY);
            return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_PREFS };
        } catch { return { ...DEFAULT_PREFS }; }
    },

    savePrefs(prefs: NotificationPrefs) {
        const toSave = { ...prefs, emailNotifications: true };
        localStorage.setItem(PREFS_KEY, JSON.stringify(toSave));
        // Try to sync to backend (non-blocking)
        api.post("/api/notifications/preferences/", prefs).catch(() => {});
    },

    async requestBrowserPermission(): Promise<boolean> {
        if (!("Notification" in window)) return false;
        if (Notification.permission === "granted") return true;
        if (Notification.permission === "denied") return false;
        const result = await Notification.requestPermission();
        return result === "granted";
    },

    getBrowserPermission(): NotificationPermission {
        if (!("Notification" in window)) return "denied";
        return Notification.permission;
    },

    sendBrowserNotification(title: string, body: string, icon = "/favicon.ico") {
        if (!("Notification" in window) || Notification.permission !== "granted") return;
        new Notification(title, { body, icon });
    },

    // Call on every page load — fires daily reminder if it's time
    checkAndFireDailyReminder() {
        const prefs = this.getPrefs();
        if (!prefs.browserNotifications || !prefs.targetRole) return;

        const last = localStorage.getItem(LAST_DAILY_KEY);
        const now = new Date();
        const todayKey = now.toDateString();

        if (last === todayKey) return; // already fired today

        // Check if current time is past reminder time
        const [h, m] = prefs.reminderTime.split(":").map(Number);
        const reminderMinutes = h * 60 + m;
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        if (currentMinutes >= reminderMinutes) {
            this.sendBrowserNotification(
                `⏰ Daily Job Goal — ${prefs.targetRole}`,
                `You've set a target of ${prefs.dailyTarget} applications today. Let's get started! Head to Jobs to apply.`
            );
            localStorage.setItem(LAST_DAILY_KEY, todayKey);
        }
    },

    checkAndFireJobAlert(jobTitle: string, company: string) {
        const prefs = this.getPrefs();
        if (!prefs.browserNotifications || !prefs.jobAlerts) return;

        const last = localStorage.getItem(LAST_JOB_ALERT_KEY);
        const now = Date.now();
        // Max one job alert per hour
        if (last && now - parseInt(last) < 60 * 60 * 1000) return;

        this.sendBrowserNotification(
            `🔔 New ${prefs.targetRole} Opening`,
            `${jobTitle} at ${company} — matches your target role. Check it out!`
        );
        localStorage.setItem(LAST_JOB_ALERT_KEY, String(now));
    },

    isSetupComplete(): boolean {
        const prefs = this.getPrefs();
        return !!prefs.targetRole;
    },

    hasPromptedSetup(): boolean {
        return !!localStorage.getItem("notif_setup_prompted");
    },

    markSetupPrompted() {
        localStorage.setItem("notif_setup_prompted", "1");
    },
};
