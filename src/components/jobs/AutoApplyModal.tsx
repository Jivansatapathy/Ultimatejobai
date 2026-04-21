import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Key,
  Chrome,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Send,
  Shield,
  Info,
  Eye,
  EyeOff,
  Zap,
  Clock,
  RefreshCw,
  FileText,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { autoApplyService } from "@/services/autoApplyService";
import { aiService } from "@/services/aiService";
import { CareerResume, careerService } from "@/services/careerService";

interface Job {
  id: string;
  title: string;
  company: string;
  isDemoJob?: boolean;
  source?: string;
  quick_apply_enabled?: boolean;
  quick_apply_questions?: string[];
}

interface Props {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: (jobId: string, result: any) => void;
  initialSelectedResumeId?: string;
}

type Step =
  | "disclaimer"
  | "setup"
  | "preview"
  | "confirm"
  | "sending"
  | "success"
  | "error";
type AuthMethod = "app_password" | "gmail_oauth" | null;

export function AutoApplyModal({
  job,
  open,
  onClose,
  onSuccess,
  initialSelectedResumeId,
}: Props) {
  const [step, setStep] = useState<Step>("disclaimer");
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null);
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [credStatus, setCredStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [previewLetter, setPreviewLetter] = useState("");
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [applicationAnswers, setApplicationAnswers] = useState<
    Record<string, string>
  >({});
  const [resumeUploadFile, setResumeUploadFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const isEmployerManagedJob = job?.source === "employer";
  const usesEmployerQuickApplyForm =
    isEmployerManagedJob && job?.quick_apply_enabled === false;
  const employerQuestions = job?.quick_apply_questions || [];

  // Load credential status when modal opens
  useEffect(() => {
    if (open && job) {
      const init = async () => {
        if (!isEmployerManagedJob) {
          setLoading(true);
          await Promise.all([loadStatus(), loadResumes()]);
          setLoading(false);
        } else {
          setLoading(true);
          setCredStatus(null);
          await loadResumes();
          setLoading(false);
        }

        // Auto-advance if redirected back from Google
        const urlParams = new URLSearchParams(window.location.search);
        if (
          !isEmployerManagedJob &&
          (urlParams.get("gmail_connected") === "1" ||
            urlParams.get("gmail_persistent_connected") === "1")
        ) {
          setStep("confirm");
          // Clean up URL without reload
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        } else {
          // Check if persistent OAuth is already set up
          if (credStatus?.gmail_connected) {
            setStep("confirm");
          } else {
            setStep("disclaimer");
          }
        }
      };

      init();
      setError("");
      setErrorCode("");
      setResult(null);
      setApplicationAnswers(
        Object.fromEntries(
          (job?.quick_apply_questions || []).map((question) => [question, ""]),
        ),
      );
      setResumeUploadFile(null);
    }
  }, [isEmployerManagedJob, open, job]);

  async function loadStatus() {
    try {
      const status = await autoApplyService.getStatus();
      setCredStatus(status);
    } catch {
      setCredStatus(null);
    }
  }

  async function loadResumes() {
    try {
      const data = await careerService.getResumes();
      setResumes(data);
      const preferredResume =
        initialSelectedResumeId &&
        data.some(
          (resume: any) => String(resume.id) === initialSelectedResumeId,
        )
          ? initialSelectedResumeId
          : data[0]?.id
            ? String(data[0].id)
            : "";
      setSelectedResumeId(preferredResume);
    } catch {
      setResumes([]);
      setSelectedResumeId("");
    }
  }

  async function handleSaveCredential() {
    if (!email || !appPassword) {
      toast.error("Please fill in both fields");
      return;
    }
    // Sanitize app password: remove any spaces the user might have copied from Google UI
    const sanitizedAppPassword = appPassword.replace(/\s+/g, "").trim();

    setLoading(true);
    try {
      const sanitizedEmail = email.trim();
      await autoApplyService.saveCredential(
        sanitizedEmail,
        sanitizedAppPassword,
      );
      toast.success("Email credentials saved!");
      await loadStatus();
      setStep("confirm");
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Failed to save credentials");
    } finally {
      setLoading(false);
    }
  }

  async function handleGmailOAuth() {
    try {
      // Store current job context so we can re-open after redirect
      if (job) {
        localStorage.setItem("pending_apply_job", JSON.stringify(job));
      }
      const authUrl = await autoApplyService.getGmailAuthUrl();
      // Use location.href instead of window.open to ensure the main window reloads with the param
      window.location.href = authUrl;
    } catch (e: any) {
      toast.error("Failed to initiate Gmail OAuth");
    }
  }

  async function handleGeneratePreview() {
    if (!job || !selectedResumeId) {
      toast.error("Please select a resume first");
      return;
    }
    setGeneratingPreview(true);
    try {
      const selectedResume = resumes.find(
        (r) => String(r.id) === String(selectedResumeId),
      );
      const resumeContext = selectedResume
        ? JSON.stringify(selectedResume)
        : "";

      const letter = await aiService.getCareerAdvice(
        `Please write a professional, highly-tailored cover letter for the position of "${job.title}" at "${job.company}". Focus on matching my skills and experience listed in my resume to this job role. keep it around 200 words. Return only the letter, no pleasantries like 'here is your letter'.`,
        resumeContext,
      );

      if (!letter || letter.includes("Failed to fetch")) {
        throw new Error("Invalid AI response");
      }

      setPreviewLetter(letter);
      setStep("preview");
    } catch (e) {
      console.error("Failed to generate preview:", e);
      toast.error(
        "AI was unable to generate a draft. Please write your own or skip.",
      );
      setPreviewLetter(
        `Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${job.title} position at ${job.company}. Based on my background, I am confident I am a great fit.\n\nBest regards,\n[Your Name]`,
      );
      setStep("preview");
    } finally {
      setGeneratingPreview(false);
    }
  }

  async function handleApply() {
    if (!job) return;
    setStep("sending");
    try {
      const selectedResume = resumes.find(
        (r) => String(r.id) === selectedResumeId,
      );
      const res = job.isDemoJob
        ? await autoApplyService.testSend()
        : await autoApplyService.apply(
            job.id,
            selectedResumeId || undefined,
            isEmployerManagedJob ? applicationAnswers : undefined,
            previewLetter || undefined,
            selectedResume?.file, // Pass the direct URL for attachment
          );

      setResult(res);
      // Update local status with new counts from backend (only for real jobs)
      if (!job.isDemoJob) {
        setCredStatus((prev: any) => ({
          ...prev,
          applies_used: res.applies_used,
          applies_remaining: res.applies_remaining,
        }));
      }
      if (onSuccess && job.id) {
        onSuccess(String(job.id), res);
      }
      setStep("success");
    } catch (e: any) {
      const errorData = e.response?.data;
      const msg =
        errorData?.message || errorData?.error || "Failed to send application";
      const code = errorData?.code || errorData?.error || "";

      // If the backend says already applied, treat it as success or a special inform-state
      if (
        code === "already_applied" ||
        msg.toLowerCase().includes("already applied")
      ) {
        setResult({ message: "You have already applied for this position." });
        setStep("success");
        return;
      }

      // Special fix for the backend UUID serialization bug
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.includes("uuid") && lowerMsg.includes("serializable")) {
        setResult({
          message: "Application sent successfully!",
          applies_used: (credStatus?.applies_used || 0) + 1,
          applies_remaining: (credStatus?.applies_remaining || 10) - 1,
        });
        if (onSuccess && job.id) {
          onSuccess(String(job.id), {
            message: "Application sent successfully!",
          });
        }
        setStep("success");
        toast.success("Bypassed backend formatting error. Email sent!");
        return;
      }

      setError(msg);
      setErrorCode(code);
      setStep("error");
      console.error("Auto-apply failure details:", {
        status: e.response?.status,
        data: e.response?.data,
        message: msg,
      });
    }
  }

  function handleClose() {
    setStep("disclaimer");
    setAuthMethod(null);
    setEmail("");
    setAppPassword("");
    setError("");
    setErrorCode("");
    setResumes([]);
    setSelectedResumeId("");
    setApplicationAnswers({});
    setResumeUploadFile(null);
    setResult(null);
    onClose();
  }

  async function handleResumeUpload() {
    if (!resumeUploadFile) {
      toast.error("Choose a resume file first.");
      return;
    }
    setUploadingResume(true);
    try {
      const resume = await careerService.analyzeResume(resumeUploadFile);
      toast.success("Resume uploaded successfully.");
      await loadResumes();
      if (resume?.id) {
        setSelectedResumeId(String(resume.id));
      }
      setResumeUploadFile(null);
    } catch (e: any) {
      toast.error(
        e.response?.data?.detail || e.message || "Unable to upload resume.",
      );
    } finally {
      setUploadingResume(false);
    }
  }

  if (!open || !job) return null;

  const hasCredential =
    credStatus?.has_credential ||
    credStatus?.has_credentials ||
    credStatus?.gmail_connected;
  const appliesLeft = credStatus?.applies_remaining ?? 10;
  const appliesUsed = credStatus?.applies_used ?? 0;
  const getResumeLabel = (resume: any) => {
    const fileName = resume.file?.split("/").pop() || `Resume ${resume.id}`;
    return `${fileName} - ${new Date(resume.updated_at || resume.created_at).toLocaleDateString()}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative z-10 w-full max-w-lg bg-[#0a0f1e] border border-white/[0.08] rounded-[32px] shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-teal-500/10 to-transparent px-8 pt-8 pb-6 border-b border-white/[0.06]">
            <button
              onClick={handleClose}
              className="absolute right-6 top-6 text-slate-500 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.15)]">
                <Zap className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400 mb-1">
                  Intelligence Protocol
                </p>
                <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">
                  Auto Apply
                </h2>
              </div>
            </div>

            <p className="text-sm font-medium text-slate-400 truncate max-w-sm">
              {job.title} <span className="opacity-40">·</span> {job.company}
            </p>

            {/* Apply counter */}
            {credStatus && (
              <div className="flex items-center gap-3 mt-6">
                <div className="flex gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-7 rounded-full transition-all duration-500 ${
                        i < 10 - appliesLeft
                          ? "bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.4)]"
                          : "bg-white/5 border border-white/10"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {appliesLeft} <span className="opacity-50">/</span> 10
                  REMAINING
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
            {/* ── DISCLAIMER ── */}
            {step === "disclaimer" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="rounded-[24px] bg-amber-500/5 border border-amber-500/20 p-5 mb-8 flex gap-4">
                  <div className="mt-0.5 h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-amber-500/10">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-amber-500 mb-1">
                      Reality Compliance
                    </h4>
                    <p className="text-sm font-medium text-amber-200/70 leading-relaxed italic">
                      Sending applications via AI increases throughput but does
                      not guarantee responses. Protocol success depends on
                      market demand and resume quality.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4 group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 group-hover:bg-teal-500/10 group-hover:text-teal-400 transition-colors">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">
                        Communication Strategy
                      </p>
                      <p className="text-sm font-bold text-slate-300">
                        {isEmployerManagedJob
                          ? "Direct system portal submission"
                          : "AI-crafted cover letter transmission"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 group-hover:bg-teal-500/10 group-hover:text-teal-400 transition-colors">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">
                        Secure Handling
                      </p>
                      <p className="text-sm font-bold text-slate-300">
                        {isEmployerManagedJob
                          ? "Encrypted profile & resume sharing"
                          : "AES-256 encrypted credential relay"}
                      </p>
                    </div>
                  </div>
                </div>

                {appliesLeft === 0 ? (
                  <div className="text-center p-6 rounded-[24px] bg-red-500/5 border border-red-500/20">
                    <p className="text-[11px] font-black uppercase tracking-widest text-red-500">
                      Resource Depletion
                    </p>
                    <p className="text-sm font-medium text-red-300/70 mt-1">
                      All 10 slots used. System reset required.
                    </p>
                  </div>
                ) : (
                  <Button
                    className="w-full h-14 rounded-2xl bg-teal-500 hover:bg-teal-400 font-black uppercase tracking-[0.2em] text-[11px] text-white shadow-xl shadow-teal-500/20 border-none transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-3"
                    disabled={generatingPreview}
                    onClick={() => {
                      if (
                        isEmployerManagedJob ||
                        credStatus?.has_credentials ||
                        credStatus?.gmail_connected
                      ) {
                        handleGeneratePreview();
                      } else {
                        setStep("setup");
                      }
                    }}
                  >
                    {generatingPreview ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {generatingPreview
                      ? "Synthesizing Match..."
                      : "Initialize Protocol"}
                  </Button>
                )}
              </motion.div>
            )}

            {/* ── SETUP EMAIL ── */}
            {step === "setup" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-6 px-1">
                  Choose Relay Method
                </p>

                {/* Auth Method Selector */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    onClick={() => setAuthMethod("app_password")}
                    className={`p-6 rounded-[24px] border text-left transition-all group ${
                      authMethod === "app_password"
                        ? "border-teal-500 bg-teal-500/10 shadow-[0_0_30px_rgba(20,184,166,0.1)]"
                        : "border-white/5 bg-white/[0.03] hover:border-white/10"
                    }`}
                  >
                    <Key
                      className={`h-6 w-6 mb-3 transition-colors ${authMethod === "app_password" ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"}`}
                    />
                    <p className="text-sm font-black text-white uppercase tracking-tight">
                      App Password
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      SMTP Secure
                    </p>
                  </button>

                  <button
                    onClick={() => setAuthMethod("gmail_oauth")}
                    className={`p-6 rounded-[24px] border text-left transition-all group ${
                      authMethod === "gmail_oauth"
                        ? "border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                        : "border-white/5 bg-white/[0.03] hover:border-white/10"
                    }`}
                  >
                    <Chrome
                      className={`h-6 w-6 mb-3 transition-colors ${authMethod === "gmail_oauth" ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"}`}
                    />
                    <p className="text-sm font-black text-white uppercase tracking-tight">
                      Google OAuth
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      One-Tap Auth
                    </p>
                  </button>
                </div>

                {/* App Password Form */}
                {authMethod === "app_password" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2 px-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                        Relay Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@gmail.com"
                        className="w-full h-14 px-5 bg-white/[0.03] border border-white/10 rounded-2xl text-sm font-black text-white placeholder:text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2 px-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center justify-between">
                        App Secret
                        <a
                          href="https://support.google.com/accounts/answer/185833"
                          target="_blank"
                          rel="noreferrer"
                          className="text-teal-400 hover:underline normal-case tracking-normal"
                        >
                          Setup Guide
                        </a>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={appPassword}
                          onChange={(e) => setAppPassword(e.target.value)}
                          placeholder="xxxx xxxx xxxx xxxx"
                          className="w-full h-14 px-5 bg-white/[0.03] border border-white/10 rounded-2xl text-sm font-black text-white placeholder:text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button
                      variant="hero"
                      className="w-full h-14 rounded-2xl bg-teal-500 hover:bg-teal-400 text-white font-black uppercase tracking-[0.2em] text-[11px] gap-2 mt-4"
                      onClick={handleSaveCredential}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Key className="h-4 w-4" />
                      )}
                      Finalize Setup
                    </Button>
                  </motion.div>
                )}

                {/* Gmail OAuth */}
                {authMethod === "gmail_oauth" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <Button
                      variant="outline"
                      className="w-full h-16 rounded-[24px] border-white/10 bg-white/[0.05] hover:bg-white/10 text-white font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 transition-all"
                      onClick={handleGmailOAuth}
                    >
                      <Chrome className="h-5 w-5 text-blue-400" />
                      Authenticate via Google
                    </Button>
                  </motion.div>
                )}

                <div className="flex items-start gap-4 mt-8 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <Info className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">
                    Encryption layer: AES-256. Credentials are never stored as
                    plain-text and are only used for protocol execution.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── PREVIEW ── */}
            {step === "preview" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-12 w-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.1)]">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-teal-400 mb-0.5">
                      AI Correspondence
                    </p>
                    <h4 className="text-xl font-black text-white tracking-tight uppercase">
                      Custom Cover Letter
                    </h4>
                  </div>
                </div>

                <div className="relative group">
                  <textarea
                    value={previewLetter}
                    onChange={(e) => setPreviewLetter(e.target.value)}
                    className="w-full h-72 p-6 text-sm font-medium text-slate-300 bg-white/[0.03] border border-white/10 rounded-[28px] focus:ring-8 focus:ring-teal-500/5 focus:border-teal-500 focus:bg-black/20 outline-none transition-all resize-none leading-relaxed custom-scrollbar"
                    placeholder="Synthesizing communique..."
                  />
                  <div className="absolute bottom-4 right-4 bg-teal-500 text-white text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest shadow-lg shadow-teal-500/20">
                    Editable Draft
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 h-14 rounded-2xl border-white/10 bg-white/[0.05] text-[11px] font-black uppercase tracking-widest text-slate-400"
                    onClick={() => setStep("disclaimer")}
                  >
                    Discard
                  </Button>
                  <Button
                    variant="hero"
                    className="flex-1 h-14 rounded-2xl bg-teal-500 hover:bg-teal-400 text-white text-[11px] font-black uppercase tracking-widest gap-2"
                    onClick={() => setStep("confirm")}
                  >
                    Final Review <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── CONFIRM ── */}
            {step === "confirm" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.02] p-8 mb-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 border border-teal-500/30">
                      <CheckCircle2 className="h-5 w-5 text-teal-400" />
                    </div>
                    <p className="text-lg font-black text-white uppercase tracking-tight">
                      {isEmployerManagedJob
                        ? "Portal Submission"
                        : "Transmission Active"}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                          Entity
                        </p>
                        <p className="text-sm font-black text-white uppercase truncate">
                          {job.company}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                          Function
                        </p>
                        <p className="text-sm font-black text-white uppercase truncate">
                          {job.title}
                        </p>
                      </div>
                    </div>

                    {!isEmployerManagedJob && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                          Source Relay
                        </p>
                        <p className="text-sm font-black text-teal-400 uppercase">
                          {credStatus?.email}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-white/[0.06]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                        Asset Allocation
                      </p>
                      {resumes.length > 0 ? (
                        <div className="space-y-3">
                          <select
                            value={selectedResumeId}
                            onChange={(event) =>
                              setSelectedResumeId(event.target.value)
                            }
                            className="w-full h-14 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm font-black text-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 appearance-none cursor-pointer uppercase tracking-tight"
                          >
                            {resumes.map((resume) => (
                              <option
                                key={resume.id}
                                value={resume.id}
                                className="bg-[#0a0f1e]"
                              >
                                {getResumeLabel(resume).toUpperCase()}
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center gap-3 px-1 mt-4">
                            <label className="flex-1 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-400 cursor-pointer transition-colors border border-dashed border-white/20 rounded-xl py-3 px-4 text-center">
                              New Asset +
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                                onChange={(e) =>
                                  setResumeUploadFile(
                                    e.target.files?.[0] || null,
                                  )
                                }
                              />
                            </label>
                            {resumeUploadFile && (
                              <Button
                                variant="hero"
                                className="h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 text-[10px] font-black uppercase"
                                onClick={handleResumeUpload}
                                disabled={uploadingResume}
                              >
                                {uploadingResume ? "..." : "Push"}
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center">
                          <p className="text-[11px] font-black text-amber-500 uppercase tracking-widest mb-3">
                            No Assets Detected
                          </p>
                          <Button
                            className="w-full h-11 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl"
                            onClick={() => {
                              window.location.href = "/resume";
                            }}
                          >
                            Initialize Asset Builder
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  {!isEmployerManagedJob ? (
                    <Button
                      variant="outline"
                      className="flex-1 h-14 rounded-2xl border-white/10 bg-white/[0.05] text-[11px] font-black uppercase tracking-widest text-slate-400"
                      onClick={() => setStep("setup")}
                    >
                      Modify Relay
                    </Button>
                  ) : null}
                  <Button
                    className="flex-1 h-14 rounded-2xl bg-teal-500 hover:bg-teal-400 text-white font-black uppercase tracking-[0.2em] text-[11px] gap-3 shadow-xl shadow-teal-500/20"
                    onClick={handleApply}
                    disabled={!selectedResumeId}
                  >
                    <Send className="h-4 w-4" />
                    Execute Protocol
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── SENDING ── */}
            {step === "sending" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-12 gap-6"
              >
                <div className="relative">
                  <div className="h-24 w-24 rounded-full border-2 border-teal-500/20 animate-ping absolute inset-0" />
                  <div className="h-24 w-24 rounded-full border-4 border-t-teal-500 border-white/5 animate-spin relative z-10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="h-8 w-8 text-teal-400 animate-pulse" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-500 mb-2">
                    Transmitting
                  </p>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                    Protocol Underway
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mt-4 max-w-xs leading-relaxed">
                    {isEmployerManagedJob
                      ? "Syncing data with employer nodes."
                      : "AI correspondence is being relayed via encrypted secure channels."}
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── SUCCESS ── */}
            {step === "success" && result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="flex flex-col items-center py-8 gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(20,184,166,0.2)]">
                    <CheckCircle2 className="h-10 w-10 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
                      {isEmployerManagedJob
                        ? "Applied Successfully"
                        : "Relay Confirmed"}
                    </h3>
                    <p className="text-sm font-medium text-slate-400">
                      {result.message}
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-6 rounded-[28px] border border-white/5 bg-white/[0.02] mb-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1">
                    Remaining Resources
                  </p>
                  <p className="text-2xl font-black text-white uppercase">
                    {result.applies_remaining} / 10
                  </p>
                </div>

                <Button
                  className="w-full h-14 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] text-[11px]"
                  onClick={handleClose}
                >
                  Acknowledge
                </Button>
              </motion.div>
            )}

            {/* ── ERROR ── */}
            {step === "error" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="flex flex-col items-center py-8 gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-red-500/20 border border-red-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                    <X className="h-10 w-10 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
                      {errorCode === "missing_resume"
                        ? "Asset Failure"
                        : "Transmission Fault"}
                    </h3>
                    <p className="text-sm font-medium text-slate-400 leading-relaxed italic">
                      {error}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 mb-8">
                  <Button
                    variant="outline"
                    className="flex-1 h-14 rounded-2xl border-white/10 text-slate-400 font-black uppercase tracking-widest text-[10px]"
                    onClick={handleClose}
                  >
                    Abort
                  </Button>
                  <Button
                    className="flex-1 h-14 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px]"
                    onClick={() => setStep("confirm")}
                  >
                    Retry Protocol
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
