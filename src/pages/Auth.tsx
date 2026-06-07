import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Building2,
  Bot,
} from "lucide-react";
import api from "@/services/api";
import { subscriptionService } from "@/services/subscriptionService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { sanitizeString, sanitizeEmail } from "@/lib/sanitization";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";

const EXEC_FEATURES = [
  "100,000+ C-Suite & executive roles across US & Canada",
  "Apex™ applies to roles on your behalf — hands-free",
  "ATS-optimized executive resume in minutes",
  "AI-matched jobs at the right seniority level",
];

const TESTIMONIAL = {
  quote:
    "I landed my CFO role within 6 weeks. Apex™ handled every application while I focused on networking and prep. Genuinely game-changing.",
  name: "Michael Torres",
  title: "CFO, Brookfield Asset Management",
  initials: "MT",
};

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const selectedPlanSlug = searchParams.get("plan") || "";
  const shouldStartCheckout =
    searchParams.get("checkout") === "1" && Boolean(selectedPlanSlug);

  const [formData, setFormData] = useState({
    name: "",
    email:
      !isSignUp && isLocalhost
        ? (import.meta.env.VITE_DEV_ADMIN_EMAIL || "")
        : "",
    password:
      !isSignUp && isLocalhost
        ? (import.meta.env.VITE_DEV_ADMIN_PASSWORD || "")
        : "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (isAuthenticated && !selectedPlanSlug)
      navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate, selectedPlanSlug]);

  useEffect(() => {
    setIsSignUp(searchParams.get("mode") === "signup");
  }, [searchParams]);

  const checkRateLimit = () => {
    const attemptsStr = localStorage.getItem("login_attempts");
    const now = Date.now();
    const timeframe = 15 * 60 * 1000;
    if (!attemptsStr) return { allowed: true };
    let attempts: number[] = JSON.parse(attemptsStr);
    attempts = attempts.filter((t) => now - t < timeframe);
    localStorage.setItem("login_attempts", JSON.stringify(attempts));
    if (attempts.length >= 5) {
      const oldest = attempts[0];
      const waitTime = Math.ceil((timeframe - (now - oldest)) / 60000);
      return { allowed: false, waitTime };
    }
    return { allowed: true };
  };

  const recordAttempt = () => {
    const attemptsStr = localStorage.getItem("login_attempts");
    const now = Date.now();
    const attempts: number[] = attemptsStr ? JSON.parse(attemptsStr) : [];
    attempts.push(now);
    localStorage.setItem("login_attempts", JSON.stringify(attempts));
  };

  const handleForgotPassword = async () => {
    const sanitizedEmail = sanitizeEmail(formData.email);
    if (!sanitizedEmail) {
      toast.error(
        "Enter your email address above first, then click Forgot password."
      );
      return;
    }
    try {
      await sendPasswordResetEmail(auth, sanitizedEmail);
      toast.success(
        `Password reset email sent to ${sanitizedEmail}. Check your inbox.`
      );
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        toast.error("No account found with that email address.");
      } else {
        toast.error("Failed to send reset email. Please try again.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignUp) {
      const { allowed, waitTime } = checkRateLimit();
      if (!allowed) {
        toast.error(`Too many login attempts. Please wait ${waitTime} minutes.`);
        return;
      }
      recordAttempt();
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    const sanitizedEmail = sanitizeEmail(formData.email);
    if (!sanitizedEmail) {
      toast.error("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      let firebaseUser;
      if (isSignUp) {
        const sanitizedName = sanitizeString(formData.name, 100);
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          sanitizedEmail,
          formData.password
        );
        firebaseUser = userCredential.user;
        await updateProfile(firebaseUser, { displayName: sanitizedName });
        toast.success("Account created successfully!");
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          sanitizedEmail,
          formData.password
        );
        firebaseUser = userCredential.user;
      }

      const token = await firebaseUser.getIdToken(true);
      const response = await api.post("/api/auth/firebase-login/", {
        token,
        selected_plan_slug: selectedPlanSlug,
      });

      const { access, refresh, is_new_user, is_admin } = response.data;
      login(access, refresh, is_admin, response.data.email || formData.email);

      if (!isSignUp) toast.success("Welcome back!");

      if (shouldStartCheckout) {
        toast.success("Account ready. Taking you to secure checkout...");
        const { url } = await subscriptionService.createCheckoutSession(
          selectedPlanSlug
        );
        if (url) {
          window.location.href = url;
          return;
        }
        navigate(
          `/plans?select=1&plan=${encodeURIComponent(selectedPlanSlug)}`
        );
      } else if (selectedPlanSlug) {
        navigate(
          `/plans?welcome=1&plan=${encodeURIComponent(selectedPlanSlug)}`
        );
      } else if (is_new_user && !localStorage.getItem("onboarding_completed")) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error(`${isSignUp ? "Sign up" : "Login"} failed:`, error);
      let errorMsg = "An error occurred. Please try again.";

      if (typeof error?.code === "string") {
        switch (error.code) {
          case "auth/network-request-failed":
            errorMsg =
              "Can't reach the authentication server. If you have an ad blocker or privacy extension, disable it for this page and try again.";
            break;
          case "auth/email-already-in-use":
            errorMsg = "This email is already registered. Try logging in instead.";
            break;
          case "auth/invalid-credential":
          case "auth/wrong-password":
          case "auth/user-not-found":
            errorMsg = "Invalid email or password.";
            break;
          case "auth/weak-password":
            errorMsg = "Password is too weak. Use at least 6 characters.";
            break;
          case "auth/invalid-email":
            errorMsg = "Please enter a valid email address.";
            break;
          case "auth/too-many-requests":
            errorMsg =
              "Too many failed attempts. Please wait a few minutes before trying again.";
            break;
          default:
            if (
              error.message?.toLowerCase().includes("socket") ||
              error.message?.toLowerCase().includes("fetch") ||
              error.message?.toLowerCase().includes("network")
            ) {
              errorMsg =
                "Can't reach the authentication server. Disable any ad blockers or privacy extensions for this page, then try again.";
            } else {
              errorMsg = error.message || errorMsg;
            }
        }
      } else if (error.response?.data) {
        const data = error.response.data;
        if (data.detail) {
          errorMsg = data.detail;
        } else if (data.error) {
          errorMsg = data.error;
        } else if (typeof data === "object") {
          const fields = Object.keys(data);
          if (fields.length > 0) {
            const firstField = fields[0];
            const content = data[firstField];
            errorMsg = Array.isArray(content)
              ? `${firstField}: ${content[0]}`
              : `${firstField}: ${content}`;
          }
        }
      } else if (error.message) {
        errorMsg = error.message;
      }

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 text-black placeholder:text-zinc-400 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all";

  return (
    <div className="min-h-screen flex">

      {/* ── Left: Form panel ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white">

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-100">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="text-[1rem] font-extrabold tracking-tight text-black">
              Job<span className="text-black/30">AI</span>
            </span>
          </Link>
          <p className="text-sm text-zinc-500">
            {isSignUp ? "Already have an account?" : "New here?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-bold text-black hover:underline underline-offset-2"
            >
              {isSignUp ? "Sign in" : "Create account"}
            </button>
          </p>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <motion.div
            key={isSignUp ? "signup" : "signin"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-[400px]"
          >
            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-black tracking-tight mb-1.5">
                {isSignUp ? "Create your account" : "Welcome back"}
              </h1>
              <p className="text-sm text-zinc-500">
                {isSignUp
                  ? "Join 10,000+ executives using JobAI to land C-Suite roles."
                  : "Sign in to access your career dashboard."}
              </p>
            </div>

            {/* Employer redirect */}
            <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-black">
                  {isSignUp ? "Signing up as an employer?" : "Need employer access?"}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Post jobs and manage candidates in the employer workspace.
                </p>
              </div>
              <Link to="/employer/auth" className="shrink-0">
                <button
                  type="button"
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-zinc-300 bg-white text-xs font-bold text-black hover:bg-zinc-50 transition-all"
                >
                  <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                  {isSignUp ? "Employer Signup" : "Employer Login"}
                </button>
              </Link>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className={`${inputClass} pr-11`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className={`${inputClass} ${
                        formData.confirmPassword &&
                        formData.confirmPassword !== formData.password
                          ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                          : ""
                      }`}
                      required
                    />
                  </div>
                  {formData.confirmPassword &&
                    formData.confirmPassword !== formData.password && (
                      <p className="text-xs text-red-500 font-medium">
                        Passwords do not match
                      </p>
                    )}
                </div>
              )}

              {!isSignUp && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-semibold text-zinc-500 hover:text-black transition-colors underline underline-offset-2"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-black hover:bg-zinc-800 text-white text-sm font-bold transition-all mt-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {isSignUp ? "Creating account…" : "Signing in…"}
                  </>
                ) : (
                  <>
                    {isSignUp ? "Create Account" : "Sign In"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-zinc-400">
              By continuing, you agree to our{" "}
              <Link
                to="/terms"
                className="text-black font-semibold hover:underline underline-offset-2"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-black font-semibold hover:underline underline-offset-2"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Right: Brand panel (hidden on mobile) ────────────── */}
      <div className="hidden lg:flex w-[480px] xl:w-[540px] flex-col bg-black relative overflow-hidden">

        {/* Subtle grid pattern */}
        <div className="auth-grid-bg pointer-events-none absolute inset-0 opacity-[0.04]" />

        <div className="relative z-10 flex flex-col h-full px-12 py-14">

          {/* Tag */}
          <div className="mb-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-8">
              Executive Career Platform
            </span>

            <h2 className="text-[2rem] font-extrabold text-white leading-[1.15] tracking-tight mb-4">
              The fastest way to your<br />
              <span className="text-white/30">next C-Suite role.</span>
            </h2>

            <p className="text-sm text-white/40 leading-relaxed mb-10 max-w-sm">
              Trusted by CEOs, CFOs, CTOs and VPs around the world.
              Let Apex™ do the applying while you focus on what matters.
            </p>

            {/* Feature list */}
            <div className="space-y-3.5">
              {EXEC_FEATURES.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-white/65 leading-snug">{f}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6"
          >
            <p className="text-sm text-white/55 italic leading-relaxed mb-5">
              "{TESTIMONIAL.quote}"
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 border border-white/10 text-xs font-black text-white/70 shrink-0">
                {TESTIMONIAL.initials}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{TESTIMONIAL.name}</p>
                <p className="text-xs text-white/35">{TESTIMONIAL.title}</p>
              </div>
            </div>
          </motion.div>

          {/* Bottom stats strip */}
          <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-white/[0.06]">
            {[
              { n: "100K+", label: "Executive Roles" },
              { n: "10K+", label: "Senior Leaders" },
              { n: "Apex™", label: "Auto-Apply Bot" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-lg font-extrabold text-white">{s.n}</p>
                <p className="text-[10px] text-white/30 font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
