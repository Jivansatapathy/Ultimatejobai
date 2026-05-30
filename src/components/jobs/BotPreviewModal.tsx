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
import { Loader2, CheckCircle2, AlertTriangle, Paperclip } from "lucide-react";
import api from "@/services/api";

/**
 * Convert raw bracket-notation / UUID field keys into a human-readable label.
 * e.g. 'cards[e019c34e-242b-43b9-877b-88223fc12412][field0]' → 'Custom Question'
 *      'consent[marketing]'                                   → 'Consent Marketing'
 *      'question_50897318'                                    → 'Question'
 *      'first_name'                                           → 'First Name'
 */
function cleanLabel(raw: string): string {
  // Lever/ATS opaque bracket IDs — never human-readable
  if (/^cards\[/i.test(raw)) return "Custom Question";
  // Strip UUIDs
  let s = raw.replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, "");
  const words = s.match(/[a-zA-Z][a-zA-Z0-9]*/g) ?? [];
  if (words.length === 0) return "Field";
  // Filter generic noise words and fieldN patterns (field0, field1, …)
  const noise = new Set(["field", "input", "value", "item"]);
  const meaningful = words.filter(w => {
    const lower = w.toLowerCase();
    if (/^field\d+$/.test(lower)) return false;
    return !noise.has(lower) || words.length === 1;
  });
  if (meaningful.length === 0) return "Field";
  return meaningful
    .slice(0, 5)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Display a label from the backend — handles raw field names, brackets, UUIDs. */
function formatLabel(label: string, fieldName?: string): string {
  if (!label) return cleanLabel(fieldName || "");
  // Contains brackets or looks like a UUID → clean the field name instead
  if (/[\[\]{}]/.test(label) || /^[a-f0-9-]{20,}/.test(label)) {
    return cleanLabel(fieldName || label);
  }
  // Raw snake_case / lowercase field name (e.g. "location", "first_name") → Title Case
  if (/^[a-z][a-z0-9_-]*$/.test(label)) {
    return label.replace(/[_-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  }
  return label;
}

type ModalState = "idle" | "confirming" | "submitting" | "submitted" | "cancelled";

interface UnfilledField {
  label: string;
  required: boolean;
  type?: string;
  field_name?: string;
  options?: string[];
  values?: string[];
}

interface BotPreviewModalProps {
  isOpen: boolean;
  taskId: string;
  jobTitle: string;
  company: string;
  filledFields: Record<string, string>;
  unfilledFields?: UnfilledField[];
  screenshotBase64: string;
  onConfirm: (userAnswers: Record<string, string>) => void;
  onCancel: () => void;
}

export function BotPreviewModal({
  isOpen,
  taskId,
  jobTitle,
  company,
  filledFields,
  unfilledFields = [],
  screenshotBase64,
  onConfirm,
  onCancel,
}: BotPreviewModalProps) {
  const [state, setState] = useState<ModalState>("idle");
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) { setState("idle"); setUserAnswers({}); }
  }, [isOpen, taskId]);

  const handleConfirm = async () => {
    setState("confirming");
    try {
      await api.post("/api/bot/confirm/", { task_id: taskId, action: "confirm", user_answers: userAnswers });
      setState("submitting");
      onConfirm(userAnswers);
    } catch {
      setState("idle");
    }
  };

  const handleCancel = () => {
    onCancel(); // close immediately
    api.post("/api/bot/confirm/", { task_id: taskId, action: "cancel" }).catch(() => {});
  };

  // When parent signals submitted, show success then close
  useEffect(() => {
    if (state === "submitting") {
      // Parent calls onConfirm; WebSocket status change drives the "submitted" badge.
      // We just wait — the parent will close this modal when status === "submitted".
    }
  }, [state]);

  const resumeFile = filledFields["resume_file"] ?? null;
  // Exclude resume_file from the general fields table — it gets its own banner
  const entries = Object.entries(filledFields).filter(([k]) => k !== "resume_file");
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

            {/* Resume uploaded banner */}
            {resumeFile ? (
              <div className="mx-4 mb-3 flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2.5 text-xs text-blue-800 shrink-0 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300">
                <Paperclip className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                <span>
                  <span className="font-semibold">Resume uploaded: </span>
                  <span className="font-mono break-all">{resumeFile}</span>
                </span>
              </div>
            ) : (
              <div className="mx-4 mb-3 flex items-center gap-2 rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 text-xs text-yellow-800 shrink-0 dark:bg-yellow-950/40 dark:border-yellow-700 dark:text-yellow-300">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>No resume was uploaded for this application.</span>
              </div>
            )}
            {emptyKeys.length > 0 && (
              <div className="mx-4 mb-3 flex items-start gap-2 rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 text-xs text-yellow-800 shrink-0">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>
                  {emptyKeys.length} field{emptyKeys.length > 1 ? "s" : ""} could not be filled:{" "}
                  {emptyKeys.join(", ")}
                </span>
              </div>
            )}
            {unfilledFields.length > 0 && (
              <div className="mx-4 mb-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5 text-xs shrink-0">
                <div className="flex items-center gap-1.5 font-semibold text-orange-700 mb-2">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {unfilledFields.filter(f => f.required).length > 0
                    ? "Please answer these required questions:"
                    : "Fill in these optional fields if you'd like:"}
                </div>
                <div className="space-y-2">
                  {unfilledFields.map((f, i) => {
                    const key = f.field_name || f.label;
                    return (
                      <div key={i}>
                        <label className="block text-orange-800 mb-0.5 font-medium">
                          {formatLabel(f.label, f.field_name)}
                          {f.required && <span className="text-red-500 font-bold ml-0.5">*</span>}
                        </label>
                        {f.type === "radio" && f.options && f.options.length > 0 ? (
                          <div className="space-y-1 mt-1">
                            {f.options.map((opt, oi) => {
                              const optVal = f.values ? f.values[oi] : opt;
                              const displayOpt = formatLabel(opt, optVal);
                              return (
                                <label key={oi} className="flex items-center gap-2 text-xs text-orange-900 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={key}
                                    value={optVal}
                                    checked={userAnswers[key] === optVal}
                                    onChange={(e) => setUserAnswers(prev => ({ ...prev, [key]: e.target.value }))}
                                    className="border-orange-300 text-emerald-600 focus:ring-emerald-500"
                                  />
                                  {displayOpt}
                                </label>
                              );
                            })}
                          </div>
                        ) : f.type === "checkbox" && f.options && f.options.length > 0 ? (
                          <div className="space-y-1 mt-1">
                            {f.options.map((opt, oi) => {
                              const optVal = f.values ? f.values[oi] : opt;
                              const currentVals = userAnswers[key] ? userAnswers[key].split(",") : [];
                              const isChecked = currentVals.includes(optVal);
                              const displayCheckOpt = formatLabel(opt, optVal);
                              return (
                                <label key={oi} className="flex items-center gap-2 text-xs text-orange-900 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    name={`${key}_${oi}`}
                                    value={optVal}
                                    checked={isChecked}
                                    onChange={(e) => {
                                      let newVals;
                                      if (e.target.checked) {
                                        newVals = [...currentVals, optVal];
                                      } else {
                                        newVals = currentVals.filter(v => v !== optVal);
                                      }
                                      setUserAnswers(prev => ({ ...prev, [key]: newVals.join(",") }));
                                    }}
                                    className="border-orange-300 rounded text-emerald-600 focus:ring-emerald-500"
                                  />
                                  {displayCheckOpt}
                                </label>
                              );
                            })}
                          </div>
                        ) : f.type === "checkbox" ? (
                          <div className="mt-1">
                            <label className="flex items-center gap-2 text-xs text-orange-900 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={userAnswers[key] === "Yes" || userAnswers[key] === "True" || userAnswers[key] === "1"}
                                onChange={(e) => setUserAnswers(prev => ({ ...prev, [key]: e.target.checked ? "Yes" : "" }))}
                                className="border-orange-300 rounded text-emerald-600 focus:ring-emerald-500"
                              />
                              Yes
                            </label>
                          </div>
                        ) : f.options && f.options.length > 0 ? (
                          <select
                            aria-label={formatLabel(f.label, f.field_name)}
                            className="w-full border border-orange-300 rounded px-2 py-1 text-xs bg-white text-gray-800"
                            value={userAnswers[key] || ""}
                            onChange={e => setUserAnswers(prev => ({ ...prev, [key]: e.target.value }))}
                          >
                            <option value="">Select…</option>
                            {f.options.map((opt, oi) => <option key={oi} value={f.values ? f.values[oi] : opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input
                            type="text"
                            className="w-full border border-orange-300 rounded px-2 py-1 text-xs bg-white text-gray-800"
                            placeholder={`Enter ${formatLabel(f.label, f.field_name).toLowerCase()}…`}
                            value={userAnswers[key] || ""}
                            onChange={e => setUserAnswers(prev => ({ ...prev, [key]: e.target.value }))}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
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
                        <TableCell className="font-medium text-xs text-foreground py-2 pr-2">
                          {/* Clean up raw field name keys (e.g. question_50897318) for display */}
                          {/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field) && !/^question_\d+$/.test(field)
                            ? field.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
                            : cleanLabel(field)}
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
                <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg border-border/80 bg-muted/10 p-6 text-center animate-pulse">
                  <Loader2 className="h-8 w-8 animate-spin text-accent mb-3 shrink-0" />
                  <p className="text-sm font-medium text-foreground">Generating live page preview...</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                    The browser is navigating and filling details in the background. The screenshot will load here automatically.
                  </p>
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
