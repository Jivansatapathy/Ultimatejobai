import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import api from "@/services/api";

type ModalState = "idle" | "confirming" | "submitting" | "submitted" | "cancelled";

interface BotPreviewModalProps {
  isOpen: boolean;
  taskId: string;
  jobTitle: string;
  company: string;
  filledFields: Record<string, string>;
  screenshotBase64: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BotPreviewModal({
  isOpen,
  taskId,
  jobTitle,
  company,
  filledFields,
  screenshotBase64,
  onConfirm,
  onCancel,
}: BotPreviewModalProps) {
  const [state, setState] = useState<ModalState>("idle");

  // Reset state whenever a new task opens the modal
  useEffect(() => {
    if (isOpen) setState("idle");
  }, [isOpen, taskId]);

  const handleConfirm = async () => {
    setState("confirming");
    try {
      await api.post("/api/bot/confirm/", { task_id: taskId, action: "confirm" });
      setState("submitting");
      onConfirm();
      // Auto-close after success signal arrives via WebSocket
    } catch {
      setState("idle");
    }
  };

  const handleCancel = async () => {
    try {
      await api.post("/api/bot/confirm/", { task_id: taskId, action: "cancel" });
    } catch {
      // Best-effort
    }
    onCancel();
  };

  // When parent signals submitted, show success then close
  useEffect(() => {
    if (state === "submitting") {
      // Parent calls onConfirm; WebSocket status change drives the "submitted" badge.
      // We just wait — the parent will close this modal when status === "submitted".
    }
  }, [state]);

  const entries = Object.entries(filledFields);
  const emptyKeys = entries.filter(([, v]) => !v || v.trim() === "").map(([k]) => k);

  const isConfirmDisabled = state !== "idle";
  const isCancelDisabled = state === "confirming" || state === "submitting";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleCancel(); }}>
      <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <DialogTitle className="text-xl font-bold">{jobTitle}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{company}</p>
            </div>
            <Badge
              variant="default"
              className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 shrink-0"
            >
              {state === "submitting" ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Ready to Submit
                </>
              )}
            </Badge>
          </div>
        </DialogHeader>

        {/* Body — two-column layout */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Left: filled fields table */}
          <div className="flex flex-col w-1/2 border-r border-border min-w-0">
            <p className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
              Filled Fields
            </p>
            {emptyKeys.length > 0 && (
              <div className="mx-4 mb-3 flex items-start gap-2 rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 text-xs text-yellow-800 shrink-0">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>
                  {emptyKeys.length} field{emptyKeys.length > 1 ? "s" : ""} could not be filled:{" "}
                  {emptyKeys.join(", ")}
                </span>
              </div>
            )}
            <ScrollArea className="flex-1 px-4 pb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2 text-xs">Field</TableHead>
                    <TableHead className="text-xs">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground text-sm py-8">
                        No fields were filled.
                      </TableCell>
                    </TableRow>
                  ) : (
                    entries.map(([field, value]) => (
                      <TableRow
                        key={field}
                        className={
                          !value || value.trim() === ""
                            ? "bg-yellow-50 dark:bg-yellow-900/20"
                            : ""
                        }
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground py-2 pr-2">
                          {field}
                        </TableCell>
                        <TableCell className="text-sm py-2 break-all">
                          {value || (
                            <span className="text-yellow-600 italic">empty</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {/* Right: form screenshot */}
          <div className="flex flex-col w-1/2 min-w-0">
            <p className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
              Form Preview
            </p>
            <ScrollArea className="flex-1 px-4 pb-4">
              {screenshotBase64 ? (
                <img
                  src={`data:image/png;base64,${screenshotBase64}`}
                  alt="Filled form screenshot"
                  className="w-full rounded-lg border border-border shadow-sm"
                />
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                  No screenshot available
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground order-last sm:order-first">
            Please review all fields before submitting.{" "}
            <span className="font-medium text-destructive">You cannot undo this action.</span>
          </p>
          <div className="flex gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isCancelDisabled}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]"
            >
              {state === "confirming" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Confirming…
                </>
              ) : state === "submitting" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Confirm & Submit"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
