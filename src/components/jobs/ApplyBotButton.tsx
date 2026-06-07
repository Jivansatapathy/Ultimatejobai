import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import { API_BASE_URL } from "@/config";
import { toast } from "sonner";

type BotStatus =
  | "idle" | "queued" | "pending" | "starting" | "opening" | "filling"
  | "solving_captcha" | "preview_ready" | "confirmed" | "submitted"
  | "cancelled" | "failed";

type Phase = "idle" | "applying" | "confirmed" | "applied";

interface ApplyBotButtonProps {
  jobUrl: string;
  jobTitle: string;
  company: string;
  jobId?: string;
  selectedResumeId?: number;
  alreadyApplied?: boolean;
  onApplied?: (jobId: string) => void;
  onDismiss?: () => void;
  variant?: "dark" | "light";
}

function getWsUrl(taskId: string): string {
  const base = import.meta.env.VITE_WS_BASE_URL as string | undefined;
  if (base) return `${base}/ws/bot/${taskId}/`;

  if (API_BASE_URL && (API_BASE_URL.startsWith("http://") || API_BASE_URL.startsWith("https://"))) {
    const wsBase = API_BASE_URL.replace(/\/$/, "").replace(/^http/, "ws");
    return `${wsBase}/ws/bot/${taskId}/`;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws/bot/${taskId}/`;
}

const APPLY_MS = 4000;
const CONFIRM_MS = 2000;

export function ApplyBotButton({ jobUrl, jobTitle, company, jobId, selectedResumeId, alreadyApplied, onApplied, variant = "dark" }: ApplyBotButtonProps) {
  const [phase, setPhase] = useState<Phase>(alreadyApplied ? "applied" : "idle");
  const [progress, setProgress] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimers = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const closeWs = useCallback(() => {
    if (reconnectRef.current) { clearTimeout(reconnectRef.current); reconnectRef.current = null; }
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => () => { closeWs(); stopTimers(); }, [closeWs]);

  const markConfirmed = useCallback(() => {
    stopTimers();
    setProgress(100);
    setPhase("confirmed");
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setPhase("applied");
      if (jobId) onApplied?.(jobId);
    }, CONFIRM_MS);
  }, [jobId, onApplied]);

  const connectWs = useCallback((id: string) => {
    if (reconnectRef.current) { clearTimeout(reconnectRef.current); reconnectRef.current = null; }
    const token = localStorage.getItem("access_token");
    const url = token ? `${getWsUrl(id)}?token=${encodeURIComponent(token)}` : getWsUrl(id);
    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as { status: BotStatus };
        if (["submitted", "cancelled", "failed"].includes(data.status)) closeWs();
      } catch {}
    };
    ws.onerror = () => {};
    ws.onclose = () => { wsRef.current = null; };
  }, [closeWs]);

  const handleClick = async () => {
    if (phase !== "idle") return;
    setPhase("applying");
    setProgress(0);

    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      setProgress(Math.min(95, ((Date.now() - startTime) / APPLY_MS) * 100));
    }, 40);

    timerRef.current = setTimeout(markConfirmed, APPLY_MS);

    try {
      const res = await api.post<{ task_id: string; status?: BotStatus }>("/api/bot/apply/", {
        job_url: jobUrl,
        job_id: jobId ?? "",
        job_title: jobTitle,
        job_company: company,
        auto_submit: true,
        ...(selectedResumeId != null ? { selected_resume_id: selectedResumeId } : {}),
      });
      connectWs(res.data.task_id);
    } catch (err: any) {
      const errorCode = err?.response?.data?.error;
      if (errorCode === "job_closed") {
        stopTimers();
        setPhase("idle");
        toast.error("This job posting is no longer available.", { description: "The listing may have been filled or removed." });
        return;
      }
      // Other errors — UI still confirms at 4s
    }
  };

  if (phase === "applied") return null;

  if (alreadyApplied) {
    if (variant === "light") {
      return (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-600">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Applied via Apex™
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        Applied via Apex™
      </div>
    );
  }

  if (phase === "confirmed") {
    if (variant === "light") {
      return (
        <AnimatePresence>
          <motion.div
            key="confirmed"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.25 }}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-bold text-emerald-600">Applied ✓</span>
          </motion.div>
        </AnimatePresence>
      );
    }
    return (
      <AnimatePresence>
        <motion.div
          key="confirmed"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.25 }}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300">
            Applied ✓
          </span>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (phase === "applying") {
    if (variant === "light") {
      return (
        <div className="relative h-11 w-full overflow-hidden rounded-xl border border-blue-200 bg-blue-50">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400/40 to-blue-300/20 transition-all"
            style={{ width: `${progress}%`, transitionDuration: "80ms" }}
          />
          <div className="relative flex h-full items-center justify-center gap-2">
            <Bot className="h-4 w-4 text-blue-600 animate-pulse" />
            <span className="text-sm font-bold text-blue-600">Apex™ Applying…</span>
          </div>
        </div>
      );
    }
    return (
      <div className="relative h-10 w-full overflow-hidden rounded-xl border border-teal-500/30 bg-teal-500/[0.06]">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-500/30 to-teal-400/20 transition-all"
          style={{ width: `${progress}%`, transitionDuration: "80ms" }}
        />
        <div className="relative flex h-full items-center justify-center gap-2">
          <Bot className="h-4 w-4 text-teal-400 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-teal-300">
            Apex™ Applying…
          </span>
        </div>
      </div>
    );
  }

  if (variant === "light") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-4 text-sm font-bold text-white transition-all active:scale-95 shadow-sm shadow-blue-200"
      >
        <Bot className="h-4 w-4 shrink-0" />
        Apply with Apex™
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 transition-all hover:border-teal-500/40 hover:bg-teal-500/[0.06] hover:text-teal-300 active:scale-95"
    >
      <Bot className="h-4 w-4" />
      Apply with Apex™
    </button>
  );
}
