import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Bot, Globe, FileText, CheckCircle2, Clock, ShieldAlert } from "lucide-react";

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

interface BotLoadingModalProps {
  isOpen: boolean;
  status: BotStatus;
  jobTitle: string;
  company: string;
}

export function BotLoadingModal({ isOpen, status, jobTitle, company }: BotLoadingModalProps) {
  // Determine current active step
  const getStepState = (step: "init" | "open" | "captcha" | "fill") => {
    switch (step) {
      case "init":
        if (status === "starting" || status === "pending") return "active";
        return "completed";
      case "open":
        if (status === "starting" || status === "pending") return "upcoming";
        if (status === "opening") return "active";
        return "completed";
      case "captcha":
        if (status === "starting" || status === "pending" || status === "opening") return "upcoming";
        if (status === "solving_captcha") return "active";
        return status === "filling" || status === "confirmed" || status === "submitted" ? "completed" : "upcoming";
      case "fill":
        if (status === "filling") return "active";
        if (status === "confirmed" || status === "submitted") return "completed";
        return "upcoming";
      default:
        return "upcoming";
    }
  };

  const getStepIcon = (step: "init" | "open" | "captcha" | "fill") => {
    const state = getStepState(step);
    if (state === "completed") {
      return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
    }
    if (state === "active") {
      return <Loader2 className="h-5 w-5 text-accent animate-spin shrink-0" />;
    }

    switch (step) {
      case "init":
        return <Bot className="h-5 w-5 text-muted-foreground shrink-0" />;
      case "open":
        return <Globe className="h-5 w-5 text-muted-foreground shrink-0" />;
      case "captcha":
        return <ShieldAlert className="h-5 w-5 text-muted-foreground shrink-0" />;
      case "fill":
        return <FileText className="h-5 w-5 text-muted-foreground shrink-0" />;
    }
  };

  const getStepClass = (step: "init" | "open" | "captcha" | "fill") => {
    const state = getStepState(step);
    if (state === "active") return "text-foreground font-semibold";
    if (state === "completed") return "text-muted-foreground line-through decoration-emerald-500/20";
    return "text-muted-foreground/60";
  };

  const getStepLabel = (step: "init" | "open" | "captcha" | "fill") => {
    const state = getStepState(step);
    switch (step) {
      case "init":
        return state === "active" ? "Preparing automation sandbox..." : "Automation sandbox ready";
      case "open":
        return state === "active" ? "Opening job application page..." : "Job page loaded";
      case "captcha":
        return state === "active" ? "Bypassing bot verification..." : "Bot verification cleared";
      case "fill":
        return state === "active" ? "AI filling all form fields..." : "Form filled successfully";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md border-accent/20 bg-background/95 backdrop-blur-md shadow-2xl p-6" aria-describedby={undefined}>
        <DialogHeader className="items-center text-center pb-2 border-b border-border/40">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 mb-3 border border-accent/20 shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)]">
            <Bot className="h-8 w-8 text-accent animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-accent"></span>
            </span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">Applying for Job...</DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground mt-1 max-w-[280px]">
            {jobTitle} <span className="text-muted-foreground/60">at</span> {company}
          </DialogDescription>
        </DialogHeader>

        {/* Stepper Process */}
        <div className="py-6 space-y-5">
          {(["init", "open", "captcha", "fill"] as const).map((step) => (
            <div key={step} className="flex items-center gap-4">
              <div className="flex items-center justify-center h-9 w-9 rounded-full bg-border/40 shadow-inner shrink-0">
                {getStepIcon(step)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm transition-all duration-300 ${getStepClass(step)}`}>
                  {getStepLabel(step)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Informative Banner */}
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 flex items-start gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <Clock className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">AI Process Duration Hint</p>
            <p className="text-[11px] text-muted-foreground leading-normal">
              The AI takes <strong>5 to 30 seconds</strong> to complete the application depending on the job board and number of custom questions.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
