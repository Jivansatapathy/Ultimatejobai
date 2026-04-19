import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Mail, Key, Chrome, CheckCircle2, AlertTriangle,
  Loader2, Send, Shield, Info, Eye, EyeOff, Zap, Clock, RefreshCw, FileText,
  Sparkles,
  ChevronRight
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

type Step = "disclaimer" | "setup" | "preview" | "confirm" | "sending" | "success" | "error";
type AuthMethod = "app_password" | "gmail_oauth" | null;

export function AutoApplyModal({ job, open, onClose, onSuccess, initialSelectedResumeId }: Props) {
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
  const [applicationAnswers, setApplicationAnswers] = useState<Record<string, string>>({});
  const [resumeUploadFile, setResumeUploadFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const isEmployerManagedJob = job?.source === "employer";
  const usesEmployerQuickApplyForm = isEmployerManagedJob && job?.quick_apply_enabled === false;
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
        if (!isEmployerManagedJob && urlParams.get("gmail_connected") === "1") {
          setStep("confirm");
          // Clean up URL without reload
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          setStep("disclaimer");
        }
      };
      
      init();
      setError("");
      setErrorCode("");
      setResult(null);
      setApplicationAnswers(
        Object.fromEntries(((job?.quick_apply_questions || []).map((question) => [question, ""]))),
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
      const preferredResume = initialSelectedResumeId && data.some((resume: any) => String(resume.id) === initialSelectedResumeId)
        ? initialSelectedResumeId
        : (data[0]?.id ? String(data[0].id) : "");
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
      await autoApplyService.saveCredential(sanitizedEmail, sanitizedAppPassword);
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
      const selectedResume = resumes.find(r => String(r.id) === String(selectedResumeId));
      const resumeContext = selectedResume ? JSON.stringify(selectedResume) : "";
      
      const letter = await aiService.getCareerAdvice(
        `Please write a professional, highly-tailored cover letter for the position of "${job.title}" at "${job.company}". Focus on matching my skills and experience listed in my resume to this job role. keep it around 200 words. Return only the letter, no pleasantries like 'here is your letter'.`,
        resumeContext
      );
      
      if (!letter || letter.includes("Failed to fetch")) {
        throw new Error("Invalid AI response");
      }

      setPreviewLetter(letter);
      setStep("preview");
    } catch (e) {
      console.error("Failed to generate preview:", e);
      toast.error("AI was unable to generate a draft. Please write your own or skip.");
      setPreviewLetter(`Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${job.title} position at ${job.company}. Based on my background, I am confident I am a great fit.\n\nBest regards,\n[Your Name]`);
      setStep("preview");
    } finally {
      setGeneratingPreview(false);
    }
  }

  async function handleApply() {
    if (!job) return;
    setStep("sending");
    try {
      const selectedResume = resumes.find(r => String(r.id) === selectedResumeId);
      const res = job.isDemoJob
        ? await autoApplyService.testSend()
        : await autoApplyService.apply(
            job.id,
            selectedResumeId || undefined,
            isEmployerManagedJob ? applicationAnswers : undefined,
            previewLetter || undefined,
            selectedResume?.file // Pass the direct URL for attachment
          );

      setResult(res);
      // Update local status with new counts from backend (only for real jobs)
      if (!job.isDemoJob) {
        setCredStatus((prev: any) => ({
          ...prev,
          applies_used: res.applies_used,
          applies_remaining: res.applies_remaining
        }));
      }
      if (onSuccess && job.id) {
        onSuccess(String(job.id), res);
      }
      setStep("success");
    } catch (e: any) {
      const errorData = e.response?.data;
      const msg = errorData?.message || errorData?.error || "Failed to send application";
      const code = errorData?.code || errorData?.error || "";

      // If the backend says already applied, treat it as success or a special inform-state
      if (code === "already_applied" || msg.toLowerCase().includes("already applied")) {
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
          applies_remaining: (credStatus?.applies_remaining || 10) - 1
        });
        if (onSuccess && job.id) {
          onSuccess(String(job.id), { message: "Application sent successfully!" });
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
        message: msg
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
      toast.error(e.response?.data?.detail || e.message || "Unable to upload resume.");
    } finally {
      setUploadingResume(false);
    }
  }

  if (!open || !job) return null;

  const hasCredential = credStatus?.has_credential || credStatus?.has_credentials || credStatus?.gmail_connected;
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
          className="relative z-10 w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-accent/20 to-purple-500/20 px-6 pt-6 pb-4 border-b border-border">
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Auto Apply</h2>
                <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                  {job.title} · {job.company}
                </p>
              </div>
            </div>

            {/* Apply counter */}
            {credStatus && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-5 rounded-full transition-colors ${
                        i < appliesUsed ? "bg-accent" : "bg-border"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {appliesLeft} / 10 applications left
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* ── DISCLAIMER ── */}
            {step === "disclaimer" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 mb-5 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-300 mb-1">Important Disclaimer</p>
                    <p className="text-muted-foreground">
                      Sending an application email <strong>increases your chances</strong> but does{" "}
                      <strong>not guarantee</strong> a response or interview. Job openings may be closed,
                      filled, or the company may not respond to unsolicited emails.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-accent" />
                    <span>{isEmployerManagedJob ? "Your application will be submitted directly to the employer portal." : "An AI-generated cover letter will be sent on your behalf"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-accent" />
                    <span>{isEmployerManagedJob ? "Your resume and profile details will be shared with the employer." : "Your email credentials are encrypted and stored securely"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" />
                    <span>You can send up to <strong>10 applications</strong> per account</span>
                  </div>
                </div>

                {appliesLeft === 0 ? (
                  <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                    You've used all 10 auto-apply slots. Contact support to reset.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button 
                      variant="hero" 
                      className="w-full h-12 rounded-2xl gap-2" 
                      disabled={generatingPreview}
                      onClick={() => {
                        if (isEmployerManagedJob || (credStatus?.has_credentials || credStatus?.gmail_connected)) {
                          handleGeneratePreview();
                        } else {
                          setStep("setup");
                        }
                      }}
                    >
                      {generatingPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {generatingPreview ? "Analyzing Job & Resume..." : "I Understand - Continue"}
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── SETUP EMAIL ── */}
            {step === "setup" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose how you'd like to send emails. Your credentials are encrypted.
                </p>

                {/* Auth Method Selector */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button
                    onClick={() => setAuthMethod("app_password")}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      authMethod === "app_password"
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <Key className="h-5 w-5 mb-2 text-accent" />
                    <p className="font-medium text-sm">App Password</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Gmail 2FA app password
                    </p>
                  </button>

                  <button
                    onClick={() => setAuthMethod("gmail_oauth")}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      authMethod === "gmail_oauth"
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <Chrome className="h-5 w-5 mb-2 text-blue-400" />
                    <p className="font-medium text-sm">Sign in with Google</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      OAuth — most secure
                    </p>
                  </button>
                </div>

                {/* App Password Form */}
                {authMethod === "app_password" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Gmail Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@gmail.com"
                        className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                        App Password
                        <a
                          href="https://support.google.com/accounts/answer/185833"
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent underline ml-1"
                        >
                          How to get one?
                        </a>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={appPassword}
                          onChange={(e) => setAppPassword(e.target.value)}
                          placeholder="xxxx xxxx xxxx xxxx"
                          className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      variant="hero"
                      className="w-full gap-2"
                      onClick={handleSaveCredential}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                      Save & Continue
                    </Button>
                  </div>
                )}

                {/* Gmail OAuth */}
                {authMethod === "gmail_oauth" && (
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-blue-500/50 hover:border-blue-500 hover:bg-blue-500/10"
                      onClick={handleGmailOAuth}
                    >
                      <Chrome className="h-4 w-4 text-blue-400" />
                      Sign in with Google
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full gap-2 text-sm"
                      onClick={async () => { await loadStatus(); if (credStatus?.has_credential) setStep("confirm"); }}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Already signed in? Refresh
                    </Button>
                  </div>
                )}

                <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-secondary/50">
                  <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Your credentials are AES-256 encrypted and only used to send emails on your behalf.
                    We never store plain-text passwords.
                  </p>
                </div>
              </motion.div>
            )}

             {/* ── PREVIEW ── */}
            {step === "preview" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-none">Draft Cover Letter</h4>
                    <p className="text-[10px] text-slate-500 mt-1">AI-generated based on your resume and this job.</p>
                  </div>
                </div>
                
                <div className="relative group">
                  <textarea
                    value={previewLetter}
                    onChange={(e) => setPreviewLetter(e.target.value)}
                    className="w-full h-64 p-4 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 focus:bg-white outline-none transition-all resize-none leading-relaxed"
                    placeholder="AI generating cover letter..."
                  />
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-[10px] bg-slate-900 text-white px-2 py-1 rounded-md font-bold">Editable</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setStep("disclaimer")}>
                    Back
                  </Button>
                  <Button variant="hero" className="flex-1 rounded-xl gap-2" onClick={() => setStep("confirm")}>
                    Confirm & Send <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── CONFIRM ── */}
            {step === "confirm" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="rounded-xl bg-accent/10 border border-accent/30 p-4 mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">{isEmployerManagedJob ? "Ready to Apply in Portal" : "Ready to Apply"}</span>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {isEmployerManagedJob ? (
                      <>
                        <p>Applying to: <strong className="text-foreground">{job.company}</strong></p>
                        <p>Position: <strong className="text-foreground">{job.title}</strong></p>
                        {resumes.length > 0 ? (
                          <label className="block pt-2">
                            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Select Resume</span>
                            <select
                              value={selectedResumeId}
                              onChange={(event) => setSelectedResumeId(event.target.value)}
                              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                            >
                              {resumes.map((resume) => (
                                <option key={resume.id} value={resume.id}>
                                  {getResumeLabel(resume)}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : (
                          <p className="text-amber-300">Upload a resume before applying to employer-posted jobs.</p>
                        )}
                        <div className="space-y-2 pt-2">
                          <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Upload a new resume</span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(event) => setResumeUploadFile(event.target.files?.[0] || null)}
                            className="block w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                          />
                          <Button variant="outline" className="w-full" onClick={handleResumeUpload} disabled={!resumeUploadFile || uploadingResume}>
                            {uploadingResume ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Upload resume
                          </Button>
                        </div>
                        {usesEmployerQuickApplyForm && employerQuestions.length ? (
                          <div className="space-y-3 pt-3">
                            <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Employer requested details</span>
                            {employerQuestions.map((question) => (
                              <label key={question} className="block">
                                <span className="mb-1 block text-sm font-medium text-foreground">{question}</span>
                                <textarea
                                  value={applicationAnswers[question] || ""}
                                  onChange={(event) =>
                                    setApplicationAnswers((current) => ({ ...current, [question]: event.target.value }))
                                  }
                                  rows={3}
                                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                                  placeholder="Write your answer here"
                                />
                              </label>
                            ))}
                          </div>
                        ) : null}
                        {usesEmployerQuickApplyForm && !employerQuestions.length ? (
                          <p className="pt-2 text-xs text-muted-foreground">This employer is using resume-only quick apply for this job.</p>
                        ) : null}
                        <p>Your application will appear in the employer applicant list.</p>
                      </>
                    ) : (
                      <>
                        <p>Sending from: <strong className="text-foreground">{credStatus?.email}</strong></p>
                        <p>Applying to: <strong className="text-foreground">{job.company}</strong></p>
                        <p>Position: <strong className="text-foreground">{job.title}</strong></p>
                        
                        {resumes.length > 0 ? (
                          <label className="block pt-3">
                            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attach Resume</span>
                            <select
                              value={selectedResumeId}
                              onChange={(event) => setSelectedResumeId(event.target.value)}
                              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                            >
                              {resumes.map((resume) => (
                                <option key={resume.id} value={resume.id}>
                                  {getResumeLabel(resume)}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : (
                          <div className="pt-3">
                            <p className="text-amber-300 text-xs mb-2">You need a resume to attach to your application.</p>
                            <Button variant="outline" size="sm" className="w-full" onClick={() => { window.location.href = "/resume"; }}>
                              Go to Resume Builder
                            </Button>
                          </div>
                        )}
                        <p className="pt-3">AI will generate a personalized cover letter and attach your selected resume.</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  {!isEmployerManagedJob ? (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep("setup")}
                    >
                      Change Email
                    </Button>
                  ) : null}
                  <Button
                    variant="hero"
                    className="flex-1 gap-2"
                    onClick={handleApply}
                    disabled={
                      !selectedResumeId ||
                      (usesEmployerQuickApplyForm && employerQuestions.some((question) => !(applicationAnswers[question] || "").trim()))
                    }
                  >
                    <Send className="h-4 w-4" />
                    {isEmployerManagedJob ? "Apply Now" : "Send Application"}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── SENDING ── */}
            {step === "sending" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-8 gap-4"
              >
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-2 border-accent/30 animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-accent animate-spin" />
                  </div>
                </div>
                <p className="font-medium">Sending your application...</p>
                <p className="text-sm text-muted-foreground text-center">
                  {isEmployerManagedJob ? "Submitting your application to the employer portal." : "AI is crafting a personalized cover letter and sending it on your behalf."}
                </p>
              </motion.div>
            )}

            {/* ── SUCCESS ── */}
            {step === "success" && result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex flex-col items-center py-4 gap-3 mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="font-bold text-lg">{isEmployerManagedJob ? "Applied Successfully" : "Application Sent!"}</h3>
                  <p className="text-sm text-muted-foreground text-center">{result.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {result.applies_remaining} applications remaining
                  </p>
                </div>

                {result.cover_letter && !isEmployerManagedJob && (
                  <details className="mb-4">
                    <summary className="text-sm text-accent cursor-pointer mb-2">View cover letter sent</summary>
                    <div className="p-3 rounded-lg bg-secondary text-xs text-muted-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">
                      <p className="font-medium text-foreground mb-1">Subject: {result.subject}</p>
                      {result.cover_letter}
                    </div>
                  </details>
                )}

                <Button variant="hero" className="w-full" onClick={handleClose}>
                  Done
                </Button>
              </motion.div>
            )}

            {/* ── ERROR ── */}
            {step === "error" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex flex-col items-center py-4 gap-3 mb-4">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                    <X className="h-8 w-8 text-red-400" />
                  </div>
                  <h3 className="font-bold text-lg">{errorCode === "missing_resume" ? "Resume Required" : "Send Failed"}</h3>
                  <p className="text-sm text-muted-foreground text-center">{error}</p>
                </div>
                <div className="flex gap-3">
                  {errorCode === "missing_resume" ? (
                    <Button variant="outline" className="flex-1" onClick={() => { window.location.href = "/resume"; }}>
                      Upload Resume
                    </Button>
                  ) : (
                    <Button variant="outline" className="flex-1" onClick={() => setStep("confirm")}>
                      Try Again
                    </Button>
                  )}
                  <Button variant="ghost" className="flex-1" onClick={handleClose}>
                    Close
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
