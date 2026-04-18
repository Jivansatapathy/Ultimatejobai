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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (hasFeature(featureKey)) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_22%,#ffffff_100%)] px-4">
      <div className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-[0_36px_120px_-70px_rgba(15,23,42,0.45)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
          <Lock className="h-6 w-6 text-blue-700" />
        </div>
        <h1 className="mt-5 text-3xl font-bold text-slate-950">{title}</h1>
        <p className="mt-3 text-slate-600">{description}</p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-950">Current plan</p>
              <p className="text-sm text-slate-600">
                {summary?.plan ? `${summary.plan.name} (${summary.plan.price_display || "Included"})` : "No active plan"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/plans">
            <Button variant="hero">Compare Plans</Button>
          </Link>
          <Link to="/jobs">
            <Button variant="outline">Continue Browsing Jobs</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeatureRoute;
