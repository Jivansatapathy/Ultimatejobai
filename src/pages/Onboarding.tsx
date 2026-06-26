import { useState } from "react";
import { careerService } from '@/services/careerService';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import {
  FileText,
  Target,
  ArrowRight,
  Upload,
  Loader2,
  Sparkles,
  CheckCircle2,
  Bot,
  CreditCard,
  Check,
} from "lucide-react";
import { useResume } from "@/hooks/useResume";
import { parseResumeFromFile } from "@/services/aiService";
import { activityService } from "@/services/activityService";
import { useSubscription } from "@/context/SubscriptionContext";
import { toast } from "sonner";

const QUICK_ROLES = ["CEO", "CFO", "CTO", "COO", "VP Engineering", "VP Finance", "Director", "CHRO"];

const markOnboardingDone = () => {
  localStorage.setItem("onboarding_completed", "1");
  api.post("/api/auth/mark-onboarding-done/").catch(() => {});
};

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tempResume, setTempResume] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [selectingPlanSlug, setSelectingPlanSlug] = useState<string | null>(null);
  const { importResumeData, analyzeFileATS, updateTargetJobRole } = useResume();
  const { plans, loadingPlans, selectPlan, initiateCheckout } = useSubscription();
  const navigate = useNavigate();

  const finishOnboarding = () => {
    toast.success("All set! Welcome to Hizorex.");
    markOnboardingDone();
    navigate("/dashboard");
  };

  const handleChoosePlan = async (slug: string, isPaid: boolean) => {
    setSelectingPlanSlug(slug);
    try {
      if (isPaid) {
        await initiateCheckout(slug);
        return; // redirects to Stripe — onboarding continues on return via success_url
      }
      await selectPlan(slug);
      setStep(2);
    } catch {
      toast.error("Failed to select plan. You can change it later in Settings.");
      setStep(2);
    } finally {
      setSelectingPlanSlug(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    if (uploadedFile.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    if (uploadedFile.size > 200 * 1024) {
      toast.error("Resume must be under 200KB. Please compress your PDF and try again.");
      return;
    }
    setFile(uploadedFile);
    setLoading(true);

    // Store resume in S3 independently of parsing — a parse failure (e.g. an
    // image-heavy or unusual layout) must not prevent the file from being saved.
    try {
      await careerService.analyzeResume(uploadedFile);
    } catch (storageError) {
      console.warn("Resume storage to S3 failed:", storageError);
      // Non-blocking: don't fail onboarding if S3 sync fails
    }

    try {
      const parsedData = await parseResumeFromFile(uploadedFile);
      const newResume = importResumeData(parsedData);
      setTempResume(newResume);
      if (newResume.targetJobRole) setTargetRole(newResume.targetJobRole);
      toast.success("Resume parsed successfully!");
      setStep(3);
    } catch {
      toast.error("Failed to parse resume. You can fill it manually later.");
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTargetRole = async () => {
    if (!targetRole) {
      toast.error("Please set a target job role.");
      return;
    }
    setLoading(true);
    try {
      updateTargetJobRole(targetRole);
      if (file && tempResume) {
        toast.info("Analysing your resume…");
        await analyzeFileATS(file, { ...tempResume, targetJobRole: targetRole });
      }
      activityService.logActivity({
        activity_type: "ONBOARDING",
        description: `Completed onboarding with target role: ${targetRole}`,
        metadata: { targetRole },
      });
      finishOnboarding();
    } catch {
      finishOnboarding();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="h-8 w-8 rounded-xl bg-black flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-extrabold text-black tracking-tight">Hizorex</span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? "bg-black" : "bg-zinc-200"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="bg-white border border-zinc-200 rounded-2xl shadow-xl shadow-black/[0.06] overflow-hidden"
            >
              {/* Card header */}
              <div className="px-8 pt-8 pb-6 border-b border-zinc-100">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black mb-5">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-extrabold text-black tracking-tight mb-2">
                  Choose your plan
                </h1>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Pick the plan that fits your search. You can change this anytime in Settings.
                </p>
              </div>

              <div className="px-8 py-7">
                {loadingPlans ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {plans.map((plan) => {
                      const isPaid = Boolean(plan.stripe_price_id);
                      const isSelecting = selectingPlanSlug === plan.slug;
                      const topFeatures = plan.features
                        .filter((f) => f.is_enabled)
                        .slice(0, 3);
                      return (
                        <div
                          key={plan.slug}
                          className="rounded-xl border border-zinc-200 p-4 flex items-center justify-between gap-4 hover:border-zinc-400 transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="flex items-baseline gap-2">
                              <p className="text-sm font-bold text-black">{plan.name}</p>
                              <span className="text-xs font-semibold text-zinc-500">{plan.price_display}</span>
                            </div>
                            {topFeatures.length > 0 && (
                              <ul className="mt-1.5 space-y-0.5">
                                {topFeatures.map((f) => (
                                  <li key={f.feature_key} className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                                    <Check className="h-3 w-3 text-zinc-400 shrink-0" />
                                    {f.feature_label || f.feature_key.replace(/_access$/, "").replace(/_/g, " ")}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleChoosePlan(plan.slug, isPaid)}
                            disabled={selectingPlanSlug !== null}
                            className="shrink-0 h-9 px-4 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5"
                          >
                            {isSelecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (isPaid ? "Choose" : "Start Free")}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={selectingPlanSlug !== null}
                  className="w-full mt-5 h-11 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-sm font-semibold transition-all disabled:opacity-40"
                >
                  Skip — continue with Free plan
                </button>
              </div>
            </motion.div>
          ) : step === 2 ? (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="bg-white border border-zinc-200 rounded-2xl shadow-xl shadow-black/[0.06] overflow-hidden"
            >
              {/* Card header */}
              <div className="px-8 pt-8 pb-6 border-b border-zinc-100">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black mb-5">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-extrabold text-black tracking-tight mb-2">
                  Upload your resume
                </h1>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  AI will parse your skills and experience to personalise your career dashboard. We only store the insights, not the file.
                </p>
              </div>

              {/* Upload zone */}
              <div className="px-8 py-7">
                <div className="relative group">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept=".pdf"
                    aria-label="Upload resume PDF"
                  />
                  <div className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                    loading
                      ? "border-zinc-300 bg-zinc-50"
                      : "border-zinc-200 group-hover:border-black group-hover:bg-zinc-50"
                  }`}>
                    {loading ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-black" />
                        <p className="text-sm font-semibold text-black">AI is reading your resume…</p>
                        <p className="text-xs text-zinc-400">This takes a few seconds</p>
                      </div>
                    ) : file ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-black flex items-center justify-center mx-auto">
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-sm font-bold text-black">{file.name}</p>
                        <p className="text-xs text-zinc-400">Ready to process</p>
                      </div>
                    ) : (
                      <>
                        <div className="h-12 w-12 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto mb-4 group-hover:bg-black group-hover:border-black transition-colors">
                          <Upload className="h-5 w-5 text-zinc-500 group-hover:text-white transition-colors" />
                        </div>
                        <p className="text-sm font-bold text-black mb-1">Click or drag PDF here</p>
                        <p className="text-xs text-zinc-400">PDF resumes work best · max 10 MB</p>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full mt-5 h-11 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-sm font-semibold transition-all"
                >
                  Skip setup
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="bg-white border border-zinc-200 rounded-2xl shadow-xl shadow-black/[0.06] overflow-hidden"
            >
              {/* Card header */}
              <div className="px-8 pt-8 pb-6 border-b border-zinc-100">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black mb-5">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-extrabold text-black tracking-tight mb-2">
                  What's your goal?
                </h1>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Tell us the role you're targeting so Apex™ can match you to the right executive opportunities.
                </p>
              </div>

              <div className="px-8 py-7 space-y-6">
                {/* Quick-pick chips */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">
                    Quick Select
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setTargetRole(r)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          targetRole === r
                            ? "bg-black border-black text-white"
                            : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-black"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Free text */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 block">
                    Or type your own
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chief Marketing Officer, VP of Product…"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-white text-sm text-black placeholder:text-zinc-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all font-medium"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={loading}
                    className="h-11 px-5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-semibold transition-all disabled:opacity-40"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTargetRole}
                    disabled={loading || !targetRole.trim()}
                    className="flex-1 h-11 rounded-xl bg-black hover:bg-zinc-800 text-white text-sm font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Finish &amp; See Dashboard
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={finishOnboarding}
          className="w-full mt-3 text-xs text-zinc-400 hover:text-zinc-600 transition-colors font-medium"
        >
          Skip setup entirely → go to dashboard
        </button>

        <p className="text-center mt-3 text-xs text-zinc-400 font-medium">
          Step {step} of 3 · You can edit all this info later in your profile.
        </p>
      </div>
    </div>
  );
}
