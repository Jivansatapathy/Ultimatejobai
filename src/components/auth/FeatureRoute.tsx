import React from "react";
import { Link } from "react-router-dom";
import { Lock, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSubscription } from "@/context/SubscriptionContext";

interface FeatureRouteProps {
  children: React.ReactNode;
  featureKey: string;
  title: string;
  description: string;
}

const FeatureRoute: React.FC<FeatureRouteProps> = ({ children, featureKey, title, description }) => {
  const { summary, loadingSummary, hasFeature } = useSubscription();

  if (loadingSummary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e]">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-teal-500" />
      </div>
    );
  }

  const planName = summary?.plan?.name || "Standard Protocol";
  const planSlug = summary?.plan?.slug || "";
  const normalizedName = planName.toLowerCase();
  const normalizedSlug = planSlug.toLowerCase();
  
  // Robust check for premium tiers
  const isPremiumPlan = 
    normalizedName.includes("pro") || 
    normalizedName.includes("premium") || 
    normalizedName.includes("executive") ||
    normalizedName.includes("accelerator") ||
    normalizedSlug.includes("pro") ||
    normalizedSlug.includes("premium") ||
    normalizedSlug.includes("executive");

  if (true || hasFeature(featureKey) || isPremiumPlan) { // All features unlocked
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e] px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl">
        <div className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 p-8 text-center border-b border-white/5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/20 border border-teal-500/30 mb-4">
            <Lock className="h-6 w-6 text-teal-400" />
          </div>
          <h2 className="text-xl font-black text-white font-outfit uppercase tracking-tight mb-2">
            Protocol Adjustment Required
          </h2>
          <p className="text-sm text-slate-400 font-medium leading-relaxed px-4">
            {description}
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-teal-500" />
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">Current Tier</p>
                <p className="text-sm font-black text-white font-outfit uppercase tracking-wide">
                  {planName}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 uppercase font-bold">
                Limited
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Link to="/plans" className="flex-1">
              <Button className="w-full font-black uppercase text-[11px] h-11 bg-teal-600 hover:bg-teal-500 text-white rounded-lg shadow-lg shadow-teal-900/20">
                Upgrade Access
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="outline" className="px-6 font-black uppercase text-[11px] h-11 border-white/10 text-slate-300 rounded-lg hover:bg-white/5">
                Dismiss
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureRoute;
