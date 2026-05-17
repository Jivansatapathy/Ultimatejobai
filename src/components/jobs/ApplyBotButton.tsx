import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { BotPreviewModal } from "@/components/jobs/BotPreviewModal";
import { Bot, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import api from "@/services/api";

type BotStatus =
  | "idle"
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
}

function getWsUrl(taskId: string): string {
  const base = import.meta.env.VITE_WS_BASE_URL as string | undefined;
  if (base) return `${base}/ws/bot/${taskId}/`;
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws/bot/${taskId}/`;
}

const STATUS_LABELS: Record<BotStatus, string> = {
  idle: "",
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

export function ApplyBotButton({ jobUrl, jobTitle, company }: ApplyBotButtonProps) {
  const [status, setStatus] = useState<BotStatus>("idle");
  const [failReason, setFailReason] = useState("");
  const [taskId, setTaskId] = useState("");
  const [filledFields, setFilledFields] = useState<Record<string, string>>({});
  const [screenshot, setScreenshot] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  const closeWs = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Clean up WebSocket on unmount
  useEffect(() => () => closeWs(), [closeWs]);

  const connectWs = useCallback((id: string) => {
    const ws = new WebSocket(getWsUrl(id));
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
          setFilledFields(data.filled_fields ?? {});
          setScreenshot(data.screenshot_base64 ?? "");
          setModalOpen(true);
        }

        if (data.status === "failed") {
          setFailReason(data.reason ?? "Unknown error");
          setModalOpen(false);
          closeWs();
        }

        if (data.status === "submitted" || data.status === "cancelled") {
          setModalOpen(false);
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
          // Poll DB for the actual error reason
          api.get<{ status: string; error_reason: string }>(`/api/bot/status/${id}/`)
            .then(r => {
              if (r.data.error_reason) setFailReason(r.data.error_reason);
            })
            .catch(() => {});
          return "failed";
        }
        return prev;
      });
    };
  }, [closeWs]);

  const handleStart = async () => {
    if (status !== "idle" && status !== "submitted" && status !== "cancelled" && status !== "failed") return;

    // Reset state
    setStatus("starting");
    setFailReason("");
    setTaskId("");
    setFilledFields({});
    setScreenshot("");
    setModalOpen(false);
    closeWs();

    try {
      const res = await api.post<{ task_id: string }>("/api/bot/apply/", { job_url: jobUrl });
      const id = res.data.task_id;
      setTaskId(id);
      connectWs(id);
    } catch {
      setStatus("failed");
      setFailReason("Could not start bot. Please try again.");
    }
  };

  const handleConfirm = async () => {
    setStatus("confirmed");
    try {
      await api.post("/api/bot/confirm/", { task_id: taskId, action: "confirm" });
    } catch {
      setStatus("failed");
      setFailReason("Could not confirm. Please try again.");
    }
  };

  const handleCancel = async () => {
    setModalOpen(false);
    setStatus("cancelled");
    try {
      await api.post("/api/bot/confirm/", { task_id: taskId, action: "cancel" });
    } catch {
      // ignore — cancel is best-effort
    }
    closeWs();
  };

  const isRunning =
    status === "starting" ||
    status === "opening" ||
    status === "filling" ||
    status === "solving_captcha" ||
    status === "preview_ready" ||
    status === "confirmed";

  const isTerminal = status === "submitted" || status === "cancelled" || status === "failed";

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
        {status === "idle" || isTerminal ? "Apply with Bot" : "Bot running…"}
      </Button>

      {status !== "idle" && (
        <div className="flex items-center gap-1.5 text-sm">
          {status === "submitted" && (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          )}
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
              status === "submitted"
                ? "text-emerald-600 font-medium"
                : status === "failed"
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

      <BotPreviewModal
        isOpen={modalOpen}
        taskId={taskId}
        jobTitle={jobTitle}
        company={company}
        filledFields={filledFields}
        screenshotBase64={screenshot}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}
