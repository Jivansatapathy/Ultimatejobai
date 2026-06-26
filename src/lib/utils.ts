import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Extracts the backend-provided message from a failed API call, if any. */
export function getApiErrorMessage(error: any): string | undefined {
  return error?.response?.data?.error || error?.response?.data?.detail;
}

/** True when the failure was a plan usage limit (HTTP 403 from consume_feature_use). */
export function isPlanLimitError(error: any): boolean {
  return error?.response?.status === 403;
}

export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .trim();
}
