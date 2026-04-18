import { activityService, ActivityLog, ActivityType } from "./activityService";

const DEDUPE_STORAGE_KEY = "activity_tracker_dedupe_v1";

type TrackOptions = {
  dedupeKey?: string;
  dedupeMs?: number;
};

const readDedupeMap = (): Record<string, number> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(DEDUPE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeDedupeMap = (value: Record<string, number>) => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DEDUPE_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore storage failures.
  }
};

const shouldSkipByDedupe = (key: string, dedupeMs: number) => {
  const now = Date.now();
  const map = readDedupeMap();
  const lastSeen = map[key];

  if (lastSeen && now - lastSeen < dedupeMs) {
    return true;
  }

  map[key] = now;
  writeDedupeMap(map);
  return false;
};

export const activityTracker = {
  track(activity: ActivityLog, options?: TrackOptions) {
    const dedupeKey = options?.dedupeKey;
    const dedupeMs = options?.dedupeMs ?? 15000;

    if (dedupeKey && shouldSkipByDedupe(dedupeKey, dedupeMs)) {
      return;
    }

    activityService.logActivity(activity);
  },

  trackPageView(pathname: string, search: string) {
    // Page views are no longer logged as activities per user request
    return;
  },

  trackAction(activityType: ActivityType, description: string, metadata?: Record<string, unknown>, options?: TrackOptions) {
    this.track(
      {
        activity_type: activityType,
        description,
        metadata,
      },
      options,
    );
  },
};
