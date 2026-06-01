import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, Loader2, Bot, ChevronDown, ChevronUp, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";

type BotStatus =
  | "queued"
  | "pending"
  | "opening"
  | "filling"
  | "solving_captcha"
  | "preview_ready"
  | "confirmed"
  | "submitted"
  | "cancelled"
  | "failed";

interface TaskState {
  taskId: string;
  jobTitle: string;
  company: string;
  status: BotStatus;
  filledFields: Record<string, string>;
  screenshot: string;
  failReason: string;
}

interface BotMultiApplyPanelProps {
  jobs: Array<{ taskId: string; jobTitle: string; company: string }>;
  onClose: () => void;
}

function getWsUrl(taskId: string): string {
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  if (isLocal) return `ws://localhost:8000/ws/bot/${taskId}/`;
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws/bot/${taskId}/`;
}

const STATUS_LABELS: Record<BotStatus, string> = {
  queued: "Queued…",
  pending: "Starting…",
  opening: "Opening page…",
  filling: "Filling form…",
  solving_captcha: "Solving CAPTCHA…",
  preview_ready: "Applying…",
  confirmed: "Submitting…",
  submitted: "Submitted ✓",
  cancelled: "Cancelled",
  failed: "Failed",
};

export function BotMultiApplyPanel({ jobs, onClose }: BotMultiApplyPanelProps) {
  const [tasks, setTasks] = useState<TaskState[]>(
    jobs.map((j) => ({
      taskId: j.taskId,
      jobTitle: j.jobTitle,
      company: j.company,
      status: "pending",
      filledFields: {},
      screenshot: "",
      failReason: "",
    }))
  );
  const [expanded, setExpanded] = useState(true);
  const wsRefs = useRef<Map<string, WebSocket>>(new Map());

  const updateTask = useCallback((taskId: string, patch: Partial<TaskState>) => {
    setTasks((prev) => prev.map((t) => (t.taskId === taskId ? { ...t, ...patch } : t)));
  }, []);

  useEffect(() => {
    jobs.forEach(({ taskId }) => {
      if (wsRefs.current.has(taskId)) return;

      const ws = new WebSocket(getWsUrl(taskId));
      wsRefs.current.set(taskId, ws);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string) as {
            status: BotStatus;
            filled_fields?: Record<string, string>;
            screenshot_base64?: string;
            reason?: string;
          };
          updateTask(taskId, {
            status: data.status,
            ...(data.filled_fields ? { filledFields: data.filled_fields } : {}),
            ...(data.screenshot_base64 ? { screenshot: data.screenshot_base64 } : {}),
            ...(data.reason ? { failReason: data.reason } : {}),
          });
        } catch {
          // ignore parse errors
        }
      };

      ws.onerror = () => updateTask(taskId, { status: "failed", failReason: "Connection error" });

      ws.onclose = () => {
        setTasks((prev) => {
          const t = prev.find((t) => t.taskId === taskId);
          if (t && !["submitted", "cancelled", "failed"].includes(t.status)) {
            api
              .get<{ status: string; error_reason: string }>(`/api/bot/status/${taskId}/`)
              .then((r) =>
                updateTask(taskId, {
                  status: r.data.status as BotStatus,
                  ...(r.data.error_reason ? { failReason: r.data.error_reason } : {}),
                })
              )
              .catch(() => {});
            return prev.map((t) => (t.taskId === taskId ? { ...t, status: "failed" as BotStatus } : t));
          }
          return prev;
        });
      };
    });

    return () => {
      wsRefs.current.forEach((ws) => {
        ws.onclose = null;
        ws.close();
      });
      wsRefs.current.clear();
    };
  }, []); // intentionally only runs once on mount

  const doneCount = tasks.filter((t) => t.status === "submitted").length;
  const allDone = tasks.every((t) => ["submitted", "cancelled", "failed"].includes(t.status));

  return (
    <>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl border border-border bg-background shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 py-3 bg-secondary/50 border-b border-border">
          <Bot className="h-4 w-4 text-teal-500 shrink-0" />
          <span className="text-sm font-bold flex-1">
            Bot Apply — {doneCount}/{tasks.length} submitted
          </span>
          <button
            type="button"
            aria-label={expanded ? "Collapse" : "Expand"}
            onClick={() => setExpanded((e) => !e)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
          {allDone && (
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                {tasks.map((t) => (
                  <div key={t.taskId} className="flex items-center gap-3 px-4 py-3">
                    {t.status === "submitted" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : t.status === "cancelled" ? (
                      <XCircle className="h-4 w-4 text-slate-400 shrink-0" />
                    ) : t.status === "failed" ? (
                      <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                    ) : t.status === "queued" ? (
                      <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                    ) : (
                      <Loader2 className="h-4 w-4 animate-spin text-teal-400 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.jobTitle}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.company}</p>
                    </div>
                    <span
                      className={`text-[11px] font-medium shrink-0 ${
                        t.status === "submitted"
                          ? "text-emerald-600"
                          : t.status === "failed"
                          ? "text-destructive"
                          : t.status === "cancelled"
                          ? "text-muted-foreground"
                          : t.status === "preview_ready"
                          ? "text-amber-500 font-bold"
                          : "text-teal-500"
                      }`}
                    >
                      {t.status === "failed" && t.failReason
                        ? `Failed: ${t.failReason.slice(0, 30)}`
                        : STATUS_LABELS[t.status]}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
