import { ReactNode } from "react";
import { motion } from "framer-motion";

export function MetricCard({
  title,
  value,
  helper,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  helper: string;
  icon: ReactNode;
  trend?: { value: number; label: string };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="mt-2 text-3xl font-black text-gray-900 tracking-tight leading-none">{value}</p>
          <p className="mt-2 text-xs text-gray-400 font-medium">{helper}</p>
          {trend && (
            <div className={`mt-2 inline-flex items-center gap-1 text-xs font-bold ${trend.value >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              <span>{trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%</span>
              <span className="text-gray-400 font-normal">{trend.label}</span>
            </div>
          )}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
