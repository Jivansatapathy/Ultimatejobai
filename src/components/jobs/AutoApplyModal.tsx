import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Mail, Key, Chrome, CheckCircle2, AlertTriangle,
  Loader2, Send, Shield, Info, Eye, EyeOff, Zap, Clock, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { autoApplyService } from "@/services/autoApplyService";

interface Job {
  id: string;
  title: string;
  company: string;
}

interface Props {
  job: Job | null;
  open: boolean;
  onClose: () => void;
}

type Step = "disclaimer" | "setup" | "confirm" | "sending" | "success" | "error";
type AuthMethod = "app_password" | "gmail_oauth" | null;

export function AutoApplyModal({ job, open, onClose }: Props) {
  const [step, setStep] = useState<Step>("disclaimer");
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null);
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [credStatus, setCredStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  // Load credential status when modal opens
  useEffect(() => {
    if (open && job) {
      const init = async () => {
        setLoading(true);
        await loadStatus();
        setLoading(false);
        
        // Auto-advance if redirected back from Google
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("gmail_connected") === "1") {
          setStep("confirm");
          // Clean up URL without reload
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          setStep("disclaimer");
        }
      };
      
      init();
      setError("");
      setResult(null);
    }
  }, [open, job]);

  async function loadStatus() {
    try {
      const status = await autoApplyService.getStatus();
      setCredStatus(status);
    } catch {
      setCredStatus(null);
    }
  }

  async function handleSaveCredential() {
    if (!email || !appPassword) {
      toast.error("Please fill in both fields");
      return;
    }
    setLoading(true);
    try {
      await autoApplyService.saveCredential(email, appPassword);
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

  async function handleApply() {
    if (!job) return;
    setStep("sending");
    try {
      const res = await autoApplyService.apply(job.id);
      setResult(res);
      // Update local status with new counts from backend
      setCredStatus((prev: any) => ({
        ...prev,
        applies_used: res.applies_used,
        applies_remaining: res.applies_remaining
      }));
      setStep("success");
    } catch (e: any) {
      const msg = e.response?.data?.message || e.response?.data?.error || "Failed to send application";
      setError(msg);
      setStep("error");
    }
  }

  function handleClose() {
    setStep("disclaimer");
    setAuthMethod(null);
    setEmail("");
    setAppPassword("");
    setError("");
    setResult(null);
    onClose();
  }

  if (!open || !job) return null;

  const hasCredential = credStatus?.has_credential;
  const appliesLeft = credStatus?.applies_remaining ?? 10;
  const appliesUsed = credStatus?.applies_used ?? 0;

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
                    <span>An AI-generated cover letter will be sent on your behalf</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-accent" />
                    <span>Your email credentials are encrypted and stored securely</span>
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
                  <Button
                    variant="hero"
                    className="w-full gap-2"
                    onClick={() => {
                      if (hasCredential) {
                        setStep("confirm");
                      } else {
                        setStep("setup");
                      }
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    I Understand — Continue
                  </Button>
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

            {/* ── CONFIRM ── */}
            {step === "confirm" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="rounded-xl bg-accent/10 border border-accent/30 p-4 mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">Ready to Apply</span>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>📤 Sending from: <strong className="text-foreground">{credStatus?.email}</strong></p>
                    <p>🏢 Applying to: <strong className="text-foreground">{job.company}</strong></p>
                    <p>💼 Position: <strong className="text-foreground">{job.title}</strong></p>
                    <p>🤖 AI will generate a personalized cover letter</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep("setup")}
                  >
                    Change Email
                  </Button>
                  <Button
                    variant="hero"
                    className="flex-1 gap-2"
                    onClick={handleApply}
                  >
                    <Send className="h-4 w-4" />
                    Send Application
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
                  AI is crafting a personalized cover letter and sending it on your behalf.
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
                  <h3 className="font-bold text-lg">Application Sent! 🎉</h3>
                  <p className="text-sm text-muted-foreground text-center">{result.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {result.applies_remaining} applications remaining
                  </p>
                </div>

                {result.cover_letter && (
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
                  <h3 className="font-bold text-lg">Send Failed</h3>
                  <p className="text-sm text-muted-foreground text-center">{error}</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep("confirm")}>
                    Try Again
                  </Button>
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
