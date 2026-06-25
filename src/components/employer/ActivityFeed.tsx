import { BriefcaseBusiness, Sparkles, UserRoundCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EmployerActivity } from "@/types/employer";

const icons: Record<string, typeof BriefcaseBusiness> = {
  JOB_VIEW: BriefcaseBusiness,
  JOB_APPLY: UserRoundCheck,
  SETTINGS: Sparkles,
};

export function ActivityFeed({ items }: { items: EmployerActivity[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const Icon = icons[item.activity_type] || Sparkles;
        return (
          <div key={item.id} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-sm text-gray-900">{item.description || item.activity_type.replace(/_/g, " ")}</p>
                <span className="text-xs text-gray-400">
                  {item.timestamp ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true }) : "Just now"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
