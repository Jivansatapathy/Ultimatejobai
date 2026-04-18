import React from "react";
import { Check, X } from "lucide-react";

const COMPARISON_DATA = [
  { feature: "Job search", free: "✅", professional: "✅", premium: "✅", executive: "✅" },
  { feature: "Job alerts", free: "❌", professional: "✅", premium: "✅", executive: "✅" },
  { feature: "Resume builder", free: "❌", professional: "✅", premium: "✅", executive: "✅" },
  { feature: "ATS optimizer", free: "❌", professional: "✅", premium: "✅", executive: "✅" },
  { feature: "Auto-apply", free: "❌", professional: "✅", premium: "✅", executive: "✅" },
  { feature: "Dashboard", free: "❌", professional: "✅", premium: "✅", executive: "✅" },
  { feature: "Text interviews", free: "❌", professional: "20/mo", premium: "100+/mo", executive: "Unlimited" },
  { feature: "Video interviews", free: "❌", professional: "❌", premium: "30/mo", executive: "Unlimited" },
  { feature: "AI feedback", free: "❌", professional: "❌", premium: "✅", executive: "✅" },
  { feature: "Human coach feedback", free: "❌", professional: "❌", premium: "❌", executive: "✅" },
  { feature: "Career roadmap", free: "❌", professional: "❌", premium: "3-year", executive: "5-year" },
  { feature: "Negotiation prep", free: "❌", professional: "❌", premium: "2 sims", executive: "Unlimited" },
  { feature: "1-on-1 coaching", free: "❌", professional: "❌", premium: "❌", executive: "Monthly" },
  { feature: "Success manager", free: "❌", professional: "❌", premium: "❌", executive: "✅" },
];

export function PlanComparisonTable() {
  return (
    <div className="overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="p-6 text-sm font-black uppercase tracking-widest">Core Capabilities</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">Free</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center text-teal-400">Professional</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">Premium</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">Executive</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {COMPARISON_DATA.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="p-6 text-sm font-bold text-slate-700">{row.feature}</td>
                <td className="p-6 text-sm text-center font-bold text-slate-900">{row.free}</td>
                <td className="p-6 text-sm text-center font-bold text-slate-900 bg-teal-50/20">{row.professional}</td>
                <td className="p-6 text-sm text-center font-bold text-slate-900">{row.premium}</td>
                <td className="p-6 text-sm text-center font-bold text-slate-900">{row.executive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
