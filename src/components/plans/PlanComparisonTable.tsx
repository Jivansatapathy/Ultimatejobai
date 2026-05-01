import React from "react";
import type { SubscriptionPlan, SubscriptionPlanFeature } from "@/services/subscriptionService";

const getFeatureValue = (feature?: SubscriptionPlanFeature) => {
  if (!feature?.is_enabled) return "No";
  return feature.limit_display || (feature.monthly_limit === null ? "Unlimited" : `${feature.monthly_limit}/month`);
};

interface PlanComparisonTableProps {
  plans?: SubscriptionPlan[];
}

export function PlanComparisonTable({ plans = [] }: PlanComparisonTableProps) {
  const comparisonPlans = plans.length ? plans.slice(0, 4) : [];
  const featureKeys = Array.from(
    new Set(comparisonPlans.flatMap((plan) => plan.features.map((feature) => feature.feature_key))),
  );

  if (!comparisonPlans.length || !featureKeys.length) {
    return null;
  }

  return (
    <div className="overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="p-6 text-sm font-black uppercase tracking-widest">Core Capabilities</th>
              {comparisonPlans.map((plan, index) => (
                <th
                  key={plan.slug}
                  className={`p-6 text-[10px] font-black uppercase tracking-widest text-center ${index === 1 ? "text-teal-400" : ""}`}
                >
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {featureKeys.map((featureKey) => {
              const label =
                comparisonPlans
                  .flatMap((plan) => plan.features)
                  .find((feature) => feature.feature_key === featureKey)?.feature_label || featureKey.replace(/_/g, " ");

              return (
              <tr key={featureKey} className="hover:bg-slate-50 transition-colors">
                <td className="p-6 text-sm font-bold text-slate-700 capitalize">{label}</td>
                {comparisonPlans.map((plan, index) => {
                  const feature = plan.features.find((item) => item.feature_key === featureKey);
                  return (
                    <td
                      key={`${plan.slug}-${featureKey}`}
                      className={`p-6 text-sm text-center font-bold text-slate-900 ${index === 1 ? "bg-teal-50/20" : ""}`}
                    >
                      {getFeatureValue(feature)}
                    </td>
                  );
                })}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
