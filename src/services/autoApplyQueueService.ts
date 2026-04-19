const QUEUE_KEY = "aaq_queue";
const DAILY_KEY = "aaq_daily";
const DAILY_LIMIT = 30;
const MIN_INTERVAL_MS = 3 * 60 * 1000;  // 3 minutes
const MAX_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

export interface QueueItem {
    jobId: string;
    jobTitle: string;
    company: string;
    resumeId?: string;
    scheduledAt: number;
    status: "pending" | "sent" | "failed";
    appliedAt?: number;
    error?: string;
}

interface DailyCount {
    date: string; // YYYY-MM-DD
    count: number;
}

function randomInterval(): number {
    return Math.floor(Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS + 1)) + MIN_INTERVAL_MS;
}

export const autoApplyQueueService = {
    DAILY_LIMIT,
    MIN_INTERVAL_MIN: 3,
    MAX_INTERVAL_MIN: 15,

    getQueue(): QueueItem[] {
        try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); }
        catch { return []; }
    },

    saveQueue(queue: QueueItem[]) {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    },

    getDailyCount(): DailyCount {
        try {
            const raw = localStorage.getItem(DAILY_KEY);
            if (raw) {
                const data = JSON.parse(raw) as DailyCount;
                if (data.date === todayKey()) return data;
            }
        } catch {}
        return { date: todayKey(), count: 0 };
    },

    incrementDaily() {
        const current = this.getDailyCount();
        localStorage.setItem(DAILY_KEY, JSON.stringify({ date: todayKey(), count: current.count + 1 }));
    },

    remainingToday(): number {
        return Math.max(0, DAILY_LIMIT - this.getDailyCount().count);
    },

    canApplyMore(): boolean {
        return this.getDailyCount().count < DAILY_LIMIT;
    },

    // Add jobs to queue; returns how many were actually queued
    addToQueue(jobs: Array<{ id: string | number; title: string; company: string }>, resumeId?: string): number {
        const queue = this.getQueue();
        const pendingItems = queue.filter(i => i.status === "pending");

        // Respect daily cap — pending items already count against today's budget
        const alreadyQueued = pendingItems.length;
        const slotsLeft = Math.max(0, this.remainingToday() - alreadyQueued);
        if (slotsLeft === 0) return 0;

        // Find latest scheduled time among existing pending items
        const lastScheduled = pendingItems.length > 0
            ? Math.max(...pendingItems.map(i => i.scheduledAt))
            : Date.now() - 1;

        const toAdd = jobs.slice(0, slotsLeft);
        let nextAt = Math.max(Date.now(), lastScheduled) + randomInterval();

        const newItems: QueueItem[] = toAdd.map(job => {
            const item: QueueItem = {
                jobId: String(job.id),
                jobTitle: job.title,
                company: job.company,
                resumeId,
                scheduledAt: nextAt,
                status: "pending",
            };
            nextAt += randomInterval();
            return item;
        });

        this.saveQueue([...queue, ...newItems]);
        return newItems.length;
    },

    getNextPending(): QueueItem | null {
        const queue = this.getQueue();
        const now = Date.now();
        return queue.find(i => i.status === "pending" && i.scheduledAt <= now) ?? null;
    },

    markSent(jobId: string) {
        const queue = this.getQueue();
        this.saveQueue(queue.map(i =>
            i.jobId === jobId && i.status === "pending"
                ? { ...i, status: "sent" as const, appliedAt: Date.now() }
                : i
        ));
        this.incrementDaily();
    },

    markFailed(jobId: string, error: string) {
        const queue = this.getQueue();
        this.saveQueue(queue.map(i =>
            i.jobId === jobId && i.status === "pending"
                ? { ...i, status: "failed" as const, error }
                : i
        ));
    },

    cancelPending() {
        this.saveQueue(this.getQueue().filter(i => i.status !== "pending"));
    },

    clearAll() {
        localStorage.removeItem(QUEUE_KEY);
    },

    getStats() {
        const queue = this.getQueue();
        return {
            pending: queue.filter(i => i.status === "pending").length,
            sent:    queue.filter(i => i.status === "sent").length,
            failed:  queue.filter(i => i.status === "failed").length,
        };
    },

    getNextFireTime(): number | null {
        const pending = this.getQueue().filter(i => i.status === "pending");
        if (!pending.length) return null;
        return Math.min(...pending.map(i => i.scheduledAt));
    },
};

function todayKey(): string {
    return new Date().toISOString().slice(0, 10);
}
