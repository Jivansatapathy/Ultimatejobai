import { Badge } from "@/components/ui/badge";
import { ApplicationStatus } from "@/types/employer";

const statusStyles: Record<ApplicationStatus, string> = {
  applied: "bg-slate-500/10 text-slate-600 border-slate-400/20 dark:text-slate-300",
  screening: "bg-sky-500/10 text-sky-700 border-sky-400/20 dark:text-sky-300",
  shortlisted: "bg-amber-500/10 text-amber-700 border-amber-400/20 dark:text-amber-300",
  interview: "bg-violet-500/10 text-violet-700 border-violet-400/20 dark:text-violet-300",
  offer: "bg-indigo-500/10 text-indigo-700 border-indigo-400/20 dark:text-indigo-300",
  rejected: "bg-rose-500/10 text-rose-700 border-rose-400/20 dark:text-rose-300",
  hired: "bg-emerald-500/10 text-emerald-700 border-emerald-400/20 dark:text-emerald-300",
};

export function CandidateStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <Badge variant="outline" className={statusStyles[status]}>
      {status}
    </Badge>
  );
}
