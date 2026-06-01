import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import api from "@/services/api";
import { API_BASE_URL } from "@/config";
import { toast } from "sonner";

type BotStatus =
  | "idle"
  | "queued"
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
  alreadyQueued?: boolean;
  onQueued?: (jobId: string) => void;
  onApplied?: (jobId: string) => void;
}

function getWsUrl(taskId: string): string {
  const base = import.meta.env.VITE_WS_BASE_URL as string | undefined;
  if (base) return `${base}/ws/bot/${taskId}/`;

  // If API_BASE_URL is a full URL (e.g. http://35.226.234.130/), derive ws from it
  if (API_BASE_URL && (API_BASE_URL.startsWith("http://") || API_BASE_URL.startsWith("https://"))) {
    const wsBase = API_BASE_URL.replace(/\/$/, "").replace(/^http/, "ws");
    return `${wsBase}/ws/bot/${taskId}/`;
  }

  // Fallback: derive WebSocket URL from the current page's host (works for local proxy)
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws/bot/${taskId}/`;
}

const STATUS_LABELS: Record<BotStatus, string> = {
  idle: "",
  queued: "Queued for Bot Apply",
  starting: "Starting bot…",
  opening: "Opening job page…",
  filling: "Filling your details…",
  solving_captcha: "Solving CAPTCHA…",
  preview_ready: "Preview ready!",
  confirmed: "Confirming…",
  submitted: "Application submitted! ✅",
  cancelled: "Application cancelled",
  failed: "Bot failed",
};

export function ApplyBotButton({ jobUrl, jobTitle, company, jobId, alreadyApplied, alreadyQueued, onQueued, onApplied }: ApplyBotButtonProps) {
  const [status, setStatus] = useState<BotStatus>("idle");
  const [failReason, setFailReason] = useState("");

  const wsRef = useRef<WebSocket | null>(null);

  const closeWs = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => () => closeWs(), [closeWs]);

  const connectWs = useCallback((id: string) => {
    const token = localStorage.getItem("access_token");
    const wsUrl = token ? `${getWsUrl(id)}?token=${encodeURIComponent(token)}` : getWsUrl(id);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as {
          status: BotStatus;
          filled_fields?: Record<string, string>;
          screenshot_base64?: string;
          reason?: string;
        };

        setStatus(data.status);

        if (data.status === "preview_ready") {
          setStatus("confirmed");
          api.post("/api/bot/confirm/", { task_id: id, action: "confirm" }).catch(() => {
            setStatus("failed");
            setFailReason("Could not submit the prepared application.");
          });
        }

        if (data.status === "failed") {
          setFailReason(data.reason ?? "Unknown error");
          closeWs();
        }

        if (data.status === "submitted") {
          closeWs();
          if (jobId) onApplied?.(jobId);
          toast.success("Bot Apply submitted the application.");
        }

        if (data.status === "cancelled") {
          closeWs();
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      setStatus("failed");
      setFailReason("WebSocket connection error");
      closeWs();
    };

    ws.onclose = () => {
      setStatus((prev) => {
        if (prev !== "submitted" && prev !== "cancelled" && prev !== "failed" && prev !== "idle") {
          api.get<{ status: string; error_reason: string }>(`/api/bot/status/${id}/`)
            .then(r => {
              if (r.data.status === "pending") {
                setStatus("queued");
                return;
              }
              if (r.data.status === "submitted" && jobId) {
                setStatus("submitted");
                onApplied?.(jobId);
                return;
              }
              if (r.data.error_reason) setFailReason(r.data.error_reason);
            })
            .catch(() => {});
          return prev === "queued" || prev === "starting" ? "queued" : "failed";
        }
        return prev;
      });
    };
  }, [closeWs, jobId, onApplied]);

  const handleStart = async () => {
    if (alreadyApplied) return;
    if (status !== "idle" && status !== "submitted" && status !== "cancelled" && status !== "failed") return;

    setStatus("starting");
    setFailReason("");
    closeWs();

    try {
      const res = await api.post<{ task_id: string; status?: BotStatus }>("/api/bot/apply/", {
        job_url: jobUrl,
        job_id: jobId ?? "",
        job_title: jobTitle,
        job_company: company,
      });
      const id = res.data.task_id;
      if (jobId && res.data.status === "submitted") {
        setStatus("submitted");
        onApplied?.(jobId);
        toast.success("Bot Apply already submitted this job.");
        return;
      }
      setStatus("queued");
      if (jobId) onQueued?.(jobId);
      toast.success("Moved to Queued. Bot Apply will handle it in the background.");
      connectWs(id);
    } catch {
      setStatus("failed");
      setFailReason("Could not start bot. Please try again.");
      toast.error("Could not queue Bot Apply. Please try again.");
    }
  };

  const isRunning =
    status === "starting" ||
    status === "queued" ||
    status === "opening" ||
    status === "filling" ||
    status === "solving_captcha" ||
    status === "preview_ready" ||
    status === "confirmed";

  const isApplied = alreadyApplied || status === "submitted";
  const isQueued = alreadyQueued || (status !== "idle" && status !== "submitted" && status !== "cancelled" && status !== "failed");

  if (isApplied) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium py-2">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        Applied via Bot
      </div>
    );
  }

  if (isQueued && (status === "idle" || status === "queued")) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-500 font-medium py-2">
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        Queued for Bot Apply
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2 w-full">
      <Button
        variant="outline"
        className="w-full max-w-xs h-11 gap-2 border-accent/40 hover:border-accent hover:bg-accent/5 transition-all"
        onClick={handleStart}
        disabled={isRunning}
      >
        {isRunning ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
        {isRunning ? "Bot running…" : "Apply with Bot"}
      </Button>

      {status !== "idle" && (
        <div className="flex items-center gap-1.5 text-sm">
          {status === "cancelled" && (
            <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          {status === "failed" && (
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          )}
          {isRunning && (
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse shrink-0" />
          )}
          <span
            className={
              status === "failed"
                ? "text-destructive"
                : "text-muted-foreground"
            }
          >
            {status === "failed" && failReason
              ? `Failed: ${failReason}`
              : STATUS_LABELS[status]}
          </span>
        </div>
      )}
    </div>
  );
}
