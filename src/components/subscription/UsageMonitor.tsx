import { Gauge } from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";
import { cn } from "@/lib/utils";

interface UsageMonitorProps {
  featureKey: string;
  compact?: boolean;
  className?: string;
}

export function UsageMonitor({ featureKey, compact = false, className }: UsageMonitorProps) {
  const { summary, loadingSummary } = useSubscription();

  if (loadingSummary) {
    return (
      <div className={cn("inline-flex h-6 w-24 animate-pulse rounded-full bg-gray-100", className)} />
    );
  }

  const feature = summary?.plan?.features?.find(f => f.feature_key === featureKey);
  if (!feature || !feature.is_enabled) {
    return null;
  }

  const usage = summary?.current_usage?.find(u => u.feature_key === featureKey);
  const label = feature.feature_label || featureKey.replace(/_access$/, "").replace(/_/g, " ");
  const isUnlimited = usage ? usage.is_unlimited : feature.monthly_limit == null;
  const used = usage?.used_count ?? 0;
  const limit = usage?.limit ?? feature.monthly_limit ?? null;
  const isHigh = !isUnlimited && limit !== null && used / limit > 0.8;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold",
        isHigh ? "border-amber-200 bg-amber-50 text-amber-700" : "border-gray-200 bg-gray-50 text-gray-600",
        className,
      )}
    >
      <Gauge className="h-3 w-3 shrink-0" />
      {!compact && <span className="capitalize">{label}:</span>}
      <span>{isUnlimited ? "Unlimited" : `${used} / ${limit} this month`}</span>
    </div>
  );
}
