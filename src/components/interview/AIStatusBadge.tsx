import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface AIStatusBadgeProps {
  isHealthy: boolean | null;
  isChecking: boolean;
}

export function AIStatusBadge({ isHealthy, isChecking }: AIStatusBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
        isChecking && "bg-muted text-muted-foreground",
        isHealthy === true && "bg-accent text-accent-foreground",
        isHealthy === false && "bg-destructive/10 text-destructive"
      )}
    >
      {isChecking ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Checking AI...</span>
        </>
      ) : isHealthy ? (
        <>
          <CheckCircle className="h-4 w-4" />
          <span>AI Ready</span>
        </>
      ) : (
        <>
          <XCircle className="h-4 w-4" />
          <span>AI Offline</span>
        </>
      )}
    </div>
  );
}
