import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { BotPreviewModal } from "@/components/jobs/BotPreviewModal";
import { BotLoadingModal } from "@/components/jobs/BotLoadingModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Bot, CheckCircle2, XCircle, AlertCircle, Loader2, FileText } from "lucide-react";
import api from "@/services/api";
import { API_BASE_URL } from "@/config";

type BotStatus =
  | "idle"
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

interface Resume {
  id: number;
  file: string | null;
  firebase_download_url?: string | null;
  created_at: string;
}

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

const STATUS_LABELS: Record<BotStatus, string> = {
  idle: "",
  pending: "Queued…",
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

// Ordered from least → most advanced. Used to prevent backwards status regressions.
const STATUS_RANK: Record<string, number> = {
  idle: 0, starting: 1, pending: 2, opening: 3, filling: 4,
  solving_captcha: 5, preview_ready: 6, confirmed: 7,
  submitted: 8, cancelled: 8, failed: 8,
};

function resumeLabel(resume: Resume, index: number): string {
  if (resume.file) {
    const parts = resume.file.split("/");
    const filename = parts[parts.length - 1];
    if (filename) return filename;
  }
  const date = new Date(resume.created_at).toLocaleDateString();
  return `Resume ${index + 1} (${date})`;
}

export function ApplyBotButton({ jobUrl, jobTitle, company, jobId, alreadyApplied, onApplied, onDismiss }: ApplyBotButtonProps) {
  const [status, setStatus] = useState<BotStatus>("idle");
  const [failReason, setFailReason] = useState("");
  const [failTitle, setFailTitle] = useState("");
  const [taskId, setTaskId] = useState("");
  const [filledFields, setFilledFields] = useState<Record<string, string>>({});
  const [unfilledFields, setUnfilledFields] = useState<Array<{label: string; required: boolean}>>([]);
  const [screenshot, setScreenshot] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  // Pre-apply modal state
  const [preApplyOpen, setPreApplyOpen] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState("");
  const [autoSubmit, setAutoSubmit] = useState(true);
  const [loadingResumes, setLoadingResumes] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  useEffect(() => () => closeWs(), [closeWs]);

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
          filled_fields?: Record<string, string>;
          screenshot_base64?: string;
          reason?: string;
          unfilled_fields?: Array<{label: string; required: boolean}>;
        };

        // Never regress to a lower-rank status (e.g. "pending" after "starting")
        setStatus((prev) => {
          const incoming = data.status;
          const prevRank = STATUS_RANK[prev] ?? 0;
          const incomingRank = STATUS_RANK[incoming] ?? 0;
          return incomingRank >= prevRank ? incoming : prev;
        });

        if (data.status === "preview_ready") {
          setFilledFields(data.filled_fields ?? {});
          setUnfilledFields(data.unfilled_fields ?? []);
          setScreenshot(data.screenshot_base64 ?? "");
          setModalOpen(true);
        }

        if (data.status === "failed") {
          const reason = data.reason ?? "unknown";
          if (reason === "job_closed") {
            setFailTitle("Position No Longer Open");
            setFailReason("This job has been filled or removed by the employer. We'll hide it from your feed.");
          } else {
            setFailTitle("Bot Failed");
            setFailReason(reason.replace(/_/g, " "));
          }
          setModalOpen(false);
          setErrorDialogOpen(true);
          closeWs();
        }

        if (data.status === "submitted") {
          setModalOpen(false);
          closeWs();
          if (jobId) {
            setTimeout(() => {
              onApplied?.(jobId);
            }, 3000);
          }
        }

        if (data.status === "cancelled") {
          setModalOpen(false);
          closeWs();
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      // Don't mark as failed on error — onclose will fire next and handle reconnect
    };

    ws.onclose = () => {
      wsRef.current = null;
      setStatus((prev) => {
        const terminal = ["submitted", "cancelled", "failed", "idle"];
        if (terminal.includes(prev)) return prev;

        // WS dropped mid-task — poll status API and reconnect
        api.get<{ status: string; error_reason: string; filled_fields?: Record<string, string>; screenshot_base64?: string }>(`/api/bot/status/${id}/`)
          .then(r => {
            const s = r.data.status as BotStatus;
            const terminal2 = ["submitted", "cancelled", "failed"];
            if (terminal2.includes(s)) {
              setStatus(s);
              if (s === "failed") {
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
              if (s === "submitted" && jobId) {
                setTimeout(() => {
                  onApplied?.(jobId);
                }, 3000);
              }
            } else if (s === "preview_ready") {
              setStatus("preview_ready");
              if (r.data.filled_fields) setFilledFields(r.data.filled_fields);
              if (r.data.screenshot_base64) setScreenshot(r.data.screenshot_base64);
              setModalOpen(true);
            } else {
              // Still in progress — reconnect after 3s
              reconnectTimerRef.current = setTimeout(() => {
                if (taskIdRef.current === id) connectWs(id);
              }, 3000);
            }
          })
          .catch(() => {
            // Can't reach server — retry reconnect
            reconnectTimerRef.current = setTimeout(() => {
              if (taskIdRef.current === id) connectWs(id);
            }, 5000);
          });

        return prev; // keep current status while polling
      });
    };
  }, [closeWs, jobId, onApplied]);

  // Open the pre-apply modal and fetch resumes + default cover letter in parallel
  const handleButtonClick = async () => {
    if (alreadyApplied) return;
    if (status !== "idle" && status !== "submitted" && status !== "cancelled" && status !== "failed") return;

    setPreApplyOpen(true);
    setLoadingResumes(true);

    try {
      const [resumesRes, profileRes] = await Promise.all([
        api.get<Resume[] | { results?: Resume[] }>("/api/career/resumes/"),
        api.get<{ cover_letter?: string }>("/api/bot/profile/").catch(() => ({ data: {} })),
      ]);

      const rawResumes = Array.isArray(resumesRes.data)
        ? resumesRes.data
        : (resumesRes.data as { results?: Resume[] }).results ?? [];
      setResumes(rawResumes);

      // Pre-select the most recent resume
      if (rawResumes.length > 0) {
        setSelectedResumeId(String(rawResumes[0].id));
      }

      // Pre-fill cover letter from BotProfile if set
      if (profileRes.data.cover_letter) {
        setCoverLetter(profileRes.data.cover_letter);
      }
    } catch {
      // If resumes can't be fetched, proceed with empty state
    } finally {
      setLoadingResumes(false);
    }
  };

  const startBot = async () => {
    setPreApplyOpen(false);
    setStatus("starting");
    setFailReason("");
    setFailTitle("");
    setTaskId("");
    setFilledFields({});
    setUnfilledFields([]);
    setScreenshot("");
    setModalOpen(false);
    setErrorDialogOpen(false);
    closeWs();

    try {
      const res = await api.post<{ task_id: string }>("/api/bot/apply/", {
        job_url: jobUrl,
        job_id: jobId ?? "",
        job_title: jobTitle,
        job_company: company,
        selected_resume_id: selectedResumeId ? Number(selectedResumeId) : null,
        cover_letter_override: coverLetter,
        auto_submit: autoSubmit,
      });
      const id = res.data.task_id;
      setTaskId(id);
      setStatus("pending"); // task created — show "Queued..." while waiting for worker
      connectWs(id);
    } catch {
      setStatus("failed");
      setFailReason("Could not start bot. Please try again.");
    }
  };

  // Modal handles the confirm POST itself — close modal immediately, submit in background
  const handleConfirm = (_userAnswers?: Record<string, string>) => {
    setModalOpen(false);
    setStatus("confirmed");
  };

  const handleCancel = async () => {
    setModalOpen(false);
    setStatus("cancelled");
    try {
      await api.post("/api/bot/confirm/", { task_id: taskId, action: "cancel" });
    } catch {
      // cancel is best-effort
    }
    closeWs();
  };

  const isRunning =
    status === "pending" ||
    status === "starting" ||
    status === "opening" ||
    status === "filling" ||
    status === "solving_captcha" ||
    status === "preview_ready" ||
    status === "confirmed";

  const isApplied = alreadyApplied || status === "submitted";

  if (isApplied) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium py-2">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        Applied via Bot
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
        {isRunning ? "Bot running…" : "Apply with Bot"}
      </Button>

      {status !== "idle" && status !== "failed" && (
        <div className="flex items-center gap-1.5 text-sm">
          {status === "cancelled" && (
            <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          {isRunning && (
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse shrink-0" />
          )}
          <span className="text-muted-foreground">{STATUS_LABELS[status]}</span>
        </div>
      )}

      {/* Pre-apply setup modal */}
      <Dialog open={preApplyOpen} onOpenChange={(open) => { if (!open) setPreApplyOpen(false); }}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <Bot className="h-5 w-5 text-accent" />
              </div>
              <div>
                <DialogTitle className="text-base leading-tight">Apply with Bot</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {jobTitle} · {company}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Resume selector */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Resume
              </Label>
              {loadingResumes ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading resumes…
                </div>
              ) : resumes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-1">
                  No resumes uploaded yet. The bot will skip the resume upload step.
                </p>
              ) : (
                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    {resumes.map((r, i) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {resumeLabel(r, i)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Cover letter */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Cover Letter (optional)</Label>
              <Textarea
                placeholder="Leave blank to use the cover letter saved in your Settings, or type a custom one for this application…"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
                className="resize-none text-sm"
              />
            </div>

            {/* Instant Auto-Submit */}
            <div className="flex items-start space-x-3 pt-1">
              <Checkbox
                id="autoSubmit"
                checked={autoSubmit}
                onCheckedChange={(checked) => setAutoSubmit(!!checked)}
              />
              <div className="grid gap-1 leading-none">
                <Label
                  htmlFor="autoSubmit"
                  className="text-sm font-medium cursor-pointer"
                >
                  Instant Auto-Submit
                </Label>
                <p className="text-xs text-muted-foreground">
                  Skip confirmation preview if the AI fills 100% of required fields.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setPreApplyOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={startBot}
              disabled={loadingResumes}
            >
              <Bot className="h-4 w-4" />
              Start Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error popup dialog */}
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
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDismissError}
            >
              Dismiss & Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BotPreviewModal
        isOpen={modalOpen}
        taskId={taskId}
        jobTitle={jobTitle}
        company={company}
        filledFields={filledFields}
        unfilledFields={unfilledFields}
        screenshotBase64={screenshot}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <BotLoadingModal
        isOpen={isRunning && status !== "preview_ready" && status !== "idle"}
        status={status}
        jobTitle={jobTitle}
        company={company}
      />
    </div>
  );
}
