import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Bot, CheckCircle2, AlertCircle, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

type BotStatus =
  | "idle"
  | "queued"
  | "pending"
  | "starting"
  | "opening"
  | "filling"
  | "solving_captcha"
  | "preview_ready"
  | "confirmed"
  | "submitted"
  | "cancelled"
  | "failed";

interface ApplyBotButtonProps {
  jobUrl: string;
  jobTitle: string;
  company: string;
  jobId?: string;
  alreadyApplied?: boolean;
  onApplied?: (jobId: string) => void;
  onDismiss?: () => void;
}

function getWsUrl(taskId: string): string {
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  if (isLocal) return `ws://localhost:8000/ws/bot/${taskId}/`;
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws/bot/${taskId}/`;
}

const STATUS_RANK: Record<string, number> = {
  idle: 0, queued: 1, starting: 1, pending: 2, opening: 3, filling: 4,
  solving_captcha: 5, preview_ready: 6, confirmed: 7,
  submitted: 8, cancelled: 8, failed: 8,
};

export function ApplyBotButton({ jobUrl, jobTitle, company, jobId, alreadyApplied, onApplied, onDismiss }: ApplyBotButtonProps) {
  const [status, setStatus] = useState<BotStatus>("idle");
  const [failReason, setFailReason] = useState("");
  const [failTitle, setFailTitle] = useState("");
  const [taskId, setTaskId] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [optimisticApplied, setOptimisticApplied] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const optimisticTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const taskIdRef = useRef<string>("");

  const closeWs = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => () => {
    closeWs();
    if (optimisticTimerRef.current) clearTimeout(optimisticTimerRef.current);
  }, [closeWs]);

  const connectWs = useCallback((id: string) => {
    taskIdRef.current = id;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    const token = localStorage.getItem("access_token");
    const wsUrl = token ? `${getWsUrl(id)}?token=${encodeURIComponent(token)}` : getWsUrl(id);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as {
          status: BotStatus;
          reason?: string;
        };

        setStatus((prev) => {
          const incoming = data.status;
          const prevRank = STATUS_RANK[prev] ?? 0;
          const incomingRank = STATUS_RANK[incoming] ?? 0;
          return incomingRank >= prevRank ? incoming : prev;
        });

        if (data.status === "failed") {
          // Clear optimistic timer — real failure
          if (optimisticTimerRef.current) {
            clearTimeout(optimisticTimerRef.current);
            optimisticTimerRef.current = null;
          }
          const reason = data.reason ?? "unknown";
          if (reason === "job_closed") {
            setFailTitle("Position No Longer Open");
            setFailReason("This job has been filled or removed by the employer.");
          } else {
            setFailTitle("Bot Failed");
            setFailReason(reason.replace(/_/g, " "));
          }
          // Only show error dialog if we haven't already shown "Applied" optimistically
          if (!optimisticApplied) {
            setErrorDialogOpen(true);
          }
          closeWs();
        }

        if (data.status === "submitted") {
          closeWs();
          if (optimisticTimerRef.current) {
            clearTimeout(optimisticTimerRef.current);
            optimisticTimerRef.current = null;
          }
          setOptimisticApplied(true);
          if (jobId) onApplied?.(jobId);
        }

        if (data.status === "cancelled") {
          closeWs();
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {};

    ws.onclose = () => {
      wsRef.current = null;
      setStatus((prev) => {
        const terminal = ["submitted", "cancelled", "failed", "idle"];
        if (terminal.includes(prev)) return prev;

        api.get<{ status: string; error_reason: string }>(`/api/bot/status/${id}/`)
          .then(r => {
            const s = r.data.status as BotStatus;
            const terminal2 = ["submitted", "cancelled", "failed"];
            if (terminal2.includes(s)) {
              setStatus(s);
              if (s === "submitted") {
                if (optimisticTimerRef.current) {
                  clearTimeout(optimisticTimerRef.current);
                  optimisticTimerRef.current = null;
                }
                setOptimisticApplied(true);
                if (jobId) onApplied?.(jobId);
              }
              if (s === "failed" && !optimisticApplied) {
                const r2 = r.data.error_reason ?? "";
                if (r2 === "job_closed") {
                  setFailTitle("Position No Longer Open");
                  setFailReason("This job has been filled or removed by the employer.");
                } else {
                  setFailTitle("Bot Failed");
                  setFailReason(r2 || "Bot stopped unexpectedly");
                }
                setErrorDialogOpen(true);
              }
            } else {
              reconnectTimerRef.current = setTimeout(() => {
                if (taskIdRef.current === id) connectWs(id);
              }, 3000);
            }
          })
          .catch(() => {
            reconnectTimerRef.current = setTimeout(() => {
              if (taskIdRef.current === id) connectWs(id);
            }, 5000);
          });

        return prev;
      });
    };
  }, [closeWs, jobId, onApplied, optimisticApplied]);

  const handleButtonClick = async () => {
    if (alreadyApplied || optimisticApplied) return;
    if (status !== "idle" && status !== "submitted" && status !== "cancelled" && status !== "failed") return;

    setStatus("starting");
    setFailReason("");
    setFailTitle("");

    const toastId = toast.loading(`Applying to ${jobTitle} at ${company} via bot…`);

    try {
      const res = await api.post<{ task_id: string; queued: boolean }>("/api/bot/apply/", {
        job_url: jobUrl,
        job_id: jobId ?? "",
        job_title: jobTitle,
        job_company: company,
        auto_submit: true,
      });

      const id = res.data.task_id;
      const isQueued = res.data.queued;
      setTaskId(id);
      setStatus(isQueued ? "queued" : "starting");
      connectWs(id);

      if (isQueued) {
        toast.dismiss(toastId);
        toast.success(`Queued! Will apply to ${jobTitle} after current job finishes.`, { duration: 4000 });
        return;
      }

      // 3-second optimistic: show "Applied" after 3s regardless of bot status
      optimisticTimerRef.current = setTimeout(() => {
        toast.dismiss(toastId);
        toast.success(`Applied to ${jobTitle} via bot! ✅`);
        setOptimisticApplied(true);
        if (jobId) onApplied?.(jobId);
        optimisticTimerRef.current = null;
      }, 3000);

    } catch {
      toast.dismiss(toastId);
      toast.error(`Failed to start bot for ${jobTitle}.`);
      setStatus("failed");
    }
  };

  const isRunning =
    status === "pending" ||
    status === "starting" ||
    status === "opening" ||
    status === "filling" ||
    status === "solving_captcha" ||
    status === "confirmed";

  const isQueued = status === "queued";
  const isApplied = alreadyApplied || status === "submitted" || optimisticApplied;

  if (isApplied) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium py-2">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        Applied via Bot
      </div>
    );
  }

  if (isQueued) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600 font-medium py-2">
        <Clock className="h-4 w-4 shrink-0 animate-pulse" />
        Queued — applying soon…
      </div>
    );
  }

  const handleDismissError = () => {
    setErrorDialogOpen(false);
    setStatus("idle");
    onDismiss?.();
  };

  return (
    <div className="flex flex-col items-start gap-2 w-full">
      <Button
        variant="outline"
        className="w-full max-w-xs h-11 gap-2 border-accent/40 hover:border-accent hover:bg-accent/5 transition-all"
        onClick={handleButtonClick}
        disabled={isRunning}
      >
        {isRunning ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
        {isRunning ? "Applying…" : "Apply with Bot"}
      </Button>

      {/* Error dialog — only shown if bot fails before optimistic timer fires */}
      <Dialog open={errorDialogOpen} onOpenChange={(open) => { if (!open) handleDismissError(); }}>
        <DialogContent className="max-w-sm text-center" aria-describedby={undefined}>
          <DialogHeader className="items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-base">{failTitle || "Bot Failed"}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {failReason}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-2 w-full">
            {failReason.toLowerCase().includes("submit button") && (
              <Button
                className="w-full bg-accent hover:bg-accent/90 text-white font-medium"
                onClick={() => window.open(jobUrl, "_blank")}
              >
                Apply Manually (Open URL)
              </Button>
            )}
            <Button variant="outline" className="w-full" onClick={handleDismissError}>
              Dismiss
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
