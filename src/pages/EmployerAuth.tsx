import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Linkedin,
  Loader2,
  Lock,
  Mail,
  MailCheck,
  ShieldCheck,
  User2,
  Users2,
} from "lucide-react";
import {
  createUserWithEmailAndPassword,
  reload,
  sendEmailVerification,
  signOut,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { sanitizeString, sanitizeEmail } from "@/lib/sanitization";
import { acceptEmployerInvite, getEmployerInvitePreview, initiateEmployerLinkedInAuth, registerEmployerAccount } from "@/services/employerService";
import { auth } from "@/lib/firebase";

const features = [
  { icon: BriefcaseBusiness, title: "Post & manage jobs", desc: "Publish roles and track applicants in one place." },
  { icon: Users2,            title: "Candidate pipeline",  desc: "Review, shortlist, and message candidates fast." },
  { icon: ShieldCheck,       title: "Verified workspace",  desc: "Email-verified onboarding keeps your data secure." },
];

const steps = [
  { id: 1, label: "Account" },
  { id: 2, label: "Verify Email" },
  { id: 3, label: "Create Workspace" },
] as const;

function getErrorMessage(error: any, fallback: string) {
  const requestUrl = String(error?.response?.config?.url || "");
  const statusCode = Number(error?.response?.status || 0);

  if (typeof error?.code === "string") {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "This email is already in use in Firebase. Sign in with the same password and continue verification, or reset the Firebase password first.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password is too weak. Use at least 6 characters.";
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "The email or password is incorrect.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment and try again.";
      default:
        return error.message || fallback;
    }
  }

  if (requestUrl.includes("/api/employer/auth/register/") && statusCode >= 500) {
    return "Employer workspace creation failed on the backend. This usually means the employer email or company already exists in an inconsistent state.";
  }

  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

export default function EmployerAuth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkedInLoading, setLinkedInLoading] = useState(false);
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const [form, setForm] = useState({
    email: mode === "login" && isLocalhost ? (import.meta.env.VITE_DEV_ADMIN_EMAIL || "") : "",
    password: mode === "login" && isLocalhost ? (import.meta.env.VITE_DEV_ADMIN_PASSWORD || "") : "",
    displayName: "",
    companyName: "",
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [invitePreview, setInvitePreview] = useState<{ email: string; full_name: string; role: string; company_name: string; status: string } | null>(null);

  const checkRateLimit = () => {
    const attemptsStr = localStorage.getItem("employer_login_attempts");
    const now = Date.now();
    const timeframe = 15 * 60 * 1000; // 15 minutes

    if (!attemptsStr) return { allowed: true };

    let attempts: number[] = JSON.parse(attemptsStr);
    attempts = attempts.filter((timestamp) => now - timestamp < timeframe);
    localStorage.setItem("employer_login_attempts", JSON.stringify(attempts));

    if (attempts.length >= 5) {
      const oldest = attempts[0];
      const waitTime = Math.ceil((timeframe - (now - oldest)) / 60000);
      return { allowed: false, waitTime };
    }

    return { allowed: true };
  };

  const recordAttempt = () => {
    const attemptsStr = localStorage.getItem("employer_login_attempts");
    const now = Date.now();
    const attempts: number[] = attemptsStr ? JSON.parse(attemptsStr) : [];
    attempts.push(now);
    localStorage.setItem("employer_login_attempts", JSON.stringify(attempts));
  };

  const nextPath = useMemo(() => location.state?.from?.pathname || "/employer", [location.state]);
  const inviteToken = useMemo(() => new URLSearchParams(location.search).get("invite") || "", [location.search]);

  const normalizedEmail = sanitizeEmail(form.email);
  const normalizedDisplayName = sanitizeString(form.displayName, 100);
  const normalizedCompanyName = sanitizeString(form.companyName, 100);

  // Handle LinkedIn OAuth redirect back from the backend. The code/token
  // exchange already happened server-side — this page just receives the
  // issued JWTs (or an error) as query params.
  useEffect(() => {
    const linkedinError = searchParams.get("error");
    const access = searchParams.get("access");
    const refresh = searchParams.get("refresh");
    const isAdmin = searchParams.get("is_admin") === "true";
    const email = searchParams.get("email");
    const role = searchParams.get("role");
    const companyName = searchParams.get("company_name");
    if (!linkedinError && !(access && refresh)) {
      return;
    }
    setSearchParams({}, { replace: true });

    if (linkedinError) {
      toast.error("LinkedIn authentication failed. Please try again.");
      return;
    }

    login(access!, refresh!, isAdmin, email, role, companyName);
    toast.success("Signed in with LinkedIn successfully.");
    navigate(nextPath, { replace: true });
  }, [searchParams]);

  useEffect(() => {
    const run = async () => {
      if (!inviteToken) {
        setInvitePreview(null);
        return;
      }
      try {
        const preview = await getEmployerInvitePreview(inviteToken);
        setInvitePreview(preview);
        setMode("login");
        setForm((current) => ({
          ...current,
          email: preview.email || current.email,
          displayName: preview.full_name || current.displayName,
          companyName: preview.company_name || current.companyName,
        }));
      } catch (error) {
        console.error(error);
      }
    };
    run();
  }, [inviteToken]);

  const getFirebaseUserForFormEmail = async () => {
    let firebaseUser = auth.currentUser;
    if (firebaseUser && firebaseUser.email?.toLowerCase() !== normalizedEmail) {
      await signOut(auth);
      firebaseUser = null;
    }
    return firebaseUser;
  };

  const completeEmployerLogin = async () => {
    const response = await api.post("/api/auth/login/", {
      email: normalizedEmail,
      password: form.password,
    });

    const { access, refresh, is_admin, email, role, company_name } = response.data;
    if (role !== "employer" && role !== "admin") {
      throw new Error("This account does not have employer access.");
    }

    login(access, refresh, is_admin, email || form.email, role, company_name);
    if (inviteToken) {
      await acceptEmployerInvite(inviteToken);
    }
    navigate(nextPath, { replace: true });
  };

  const prepareEmployerVerification = async () => {
    let firebaseUser = await getFirebaseUserForFormEmail();

    try {
      const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, form.password);
      firebaseUser = credential.user;
    } catch (error: any) {
      if (error?.code === "auth/email-already-in-use") {
        try {
          const credential = await signInWithEmailAndPassword(auth, normalizedEmail, form.password);
          firebaseUser = credential.user;
        } catch (signInError: any) {
          if (
            signInError?.code === "auth/invalid-credential" ||
            signInError?.code === "auth/wrong-password" ||
            signInError?.code === "auth/user-not-found"
          ) {
            throw new Error(
              "This email is already registered in Firebase, but the password does not match. Use the same password or reset the Firebase password before continuing to verification.",
            );
          }
          throw signInError;
        }
      } else {
        throw error;
      }
    }

    if (!firebaseUser) {
      throw new Error("Unable to initialize employer verification.");
    }

    if (normalizedDisplayName && firebaseUser.displayName !== normalizedDisplayName) {
      await updateProfile(firebaseUser, { displayName: normalizedDisplayName });
    }

    await reload(firebaseUser);
    if (!firebaseUser.emailVerified) {
      await sendEmailVerification(firebaseUser);
      setVerificationEmailSent(true);
      toast.success("Verification email sent. Please verify before continuing.");
    } else {
      toast.success("Email already verified. Continue to the final step.");
    }

    setRegisterStep(firebaseUser.emailVerified ? 3 : 2);
  };

  const confirmEmailVerification = async () => {
    let firebaseUser = await getFirebaseUserForFormEmail();

    if (!firebaseUser) {
      const credential = await signInWithEmailAndPassword(auth, normalizedEmail, form.password);
      firebaseUser = credential.user;
    }

    await reload(firebaseUser);
    if (!firebaseUser.emailVerified) {
      throw new Error("Your email is not verified yet. Please verify it from the Firebase email and try again.");
    }

    toast.success("Email verified. Final step unlocked.");
    setRegisterStep(3);
  };

  const createEmployerWorkspace = async () => {
    let firebaseUser = await getFirebaseUserForFormEmail();

    if (!firebaseUser) {
      const credential = await signInWithEmailAndPassword(auth, normalizedEmail, form.password);
      firebaseUser = credential.user;
    }

    await reload(firebaseUser);
    if (!firebaseUser.emailVerified) {
      throw new Error("Please verify your email before creating the employer workspace.");
    }

    try {
      await registerEmployerAccount({
        ...form,
        email: normalizedEmail,
        displayName: normalizedDisplayName,
        companyName: normalizedCompanyName,
      });
    } catch (error: any) {
      const message = getErrorMessage(error, "Unable to create employer account.");
      const normalized = String(message).toLowerCase();
      if (!normalized.includes("exist") && !normalized.includes("already")) {
        throw error;
      }
    }

    await completeEmployerLogin();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (mode === "login") {
      const { allowed, waitTime } = checkRateLimit();
      if (!allowed) {
        toast.error(`Too many login attempts. Please wait ${waitTime} minutes.`);
        return;
      }
      recordAttempt();
    }

    setLoading(true);

    try {
      if (mode === "login") {
        await completeEmployerLogin();
        toast.success("Signed in successfully.");
      } else if (registerStep === 1) {
        await prepareEmployerVerification();
      } else if (registerStep === 2) {
        await confirmEmailVerification();
      } else {
        await createEmployerWorkspace();
        toast.success("Employer workspace created.");
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Unable to continue with employer authentication."));
    } finally {
      setLoading(false);
    }
  };

  const resetRegisterFlow = () => {
    setMode("register");
    setRegisterStep(1);
    setVerificationEmailSent(false);
  };

  const handleLinkedInLogin = async () => {
    setLinkedInLoading(true);
    try {
      const response = await initiateEmployerLinkedInAuth();
      window.location.href = response.auth_url;
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Unable to start LinkedIn login."));
      setLinkedInLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 flex flex-col">

      {/* Top nav bar */}
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-200">
            <BriefcaseBusiness className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Hiring Console</p>
            <p className="text-base font-bold text-gray-900 leading-tight">Hizorex Employers</p>
          </div>
        </Link>
        <Link to="/" className="text-sm text-gray-400 hover:text-gray-700 font-medium transition-colors">
          ← Back to site
        </Link>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center">
        <div className="mx-auto w-full max-w-6xl px-6 py-10 grid gap-14 lg:grid-cols-[1fr_480px] items-center">

          {/* Left — branding */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
          >
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700 mb-5">
                For Employers
              </span>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 tracking-tight leading-[1.08] mb-5">
                Hire faster with{" "}
                <span className="text-blue-600">AI-matched</span>{" "}
                candidates
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed max-w-lg">
                Post roles, review applicants, and manage your entire hiring pipeline from a single verified workspace.
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-900 mb-1">{f.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 pt-2">
              <div className="text-center">
                <p className="text-2xl font-black text-gray-900">500+</p>
                <p className="text-xs text-gray-400 font-medium">Companies hiring</p>
              </div>
              <div className="h-10 w-px bg-gray-200" />
              <div className="text-center">
                <p className="text-2xl font-black text-gray-900">100K+</p>
                <p className="text-xs text-gray-400 font-medium">Executive candidates</p>
              </div>
              <div className="h-10 w-px bg-gray-200" />
              <div className="text-center">
                <p className="text-2xl font-black text-gray-900">3×</p>
                <p className="text-xs text-gray-400 font-medium">Faster hiring</p>
              </div>
            </div>
          </motion.div>

          {/* Right — form card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl shadow-gray-100/80">

              {/* Tab toggle */}
              <div className="flex rounded-2xl bg-gray-100 p-1 mb-8">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                    mode === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={resetRegisterFlow}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                    mode === "register" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Create account
                </button>
              </div>

              {/* Heading */}
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900">
                  {mode === "login" ? "Welcome back" : "Create your workspace"}
                </h2>
                <p className="mt-1.5 text-sm text-gray-500">
                  {mode === "login"
                    ? "Sign in to your employer dashboard."
                    : "Get verified access in 3 quick steps."}
                </p>
              </div>

              {/* LinkedIn — login only */}
              {mode === "login" && (
                <div className="space-y-4 mb-6">
                  <button
                    type="button"
                    onClick={handleLinkedInLogin}
                    disabled={linkedInLoading || loading}
                    className="w-full flex items-center justify-center gap-3 h-12 rounded-2xl bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-sm transition-colors disabled:opacity-60"
                  >
                    {linkedInLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Linkedin className="h-5 w-5" />}
                    Continue with LinkedIn
                  </button>
                  <div className="relative flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">or email</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                </div>
              )}

              {/* Invite banner */}
              {invitePreview && (
                <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-bold text-blue-700 mb-1">You've been invited</p>
                  <p className="text-sm text-blue-600">
                    Join <span className="font-semibold">{invitePreview.company_name}</span> as{" "}
                    {invitePreview.role.replace("_", " ")} using{" "}
                    <span className="font-semibold">{invitePreview.email}</span>.
                  </p>
                </div>
              )}

              {/* Register step tracker */}
              {mode === "register" && (
                <div className="mb-6 flex items-center gap-2">
                  {steps.map((step, idx) => {
                    const active   = registerStep === step.id;
                    const complete = registerStep > step.id;
                    return (
                      <div key={step.id} className="flex items-center gap-2 flex-1 last:flex-none">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black transition-colors ${
                          complete ? "bg-blue-600 text-white" :
                          active   ? "bg-blue-50 text-blue-600 border-2 border-blue-600" :
                                     "bg-gray-100 text-gray-400"
                        }`}>
                          {complete ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                        </div>
                        <span className={`text-xs font-bold hidden sm:block ${active ? "text-gray-900" : "text-gray-400"}`}>
                          {step.label}
                        </span>
                        {idx < steps.length - 1 && (
                          <div className={`flex-1 h-px mx-1 ${complete ? "bg-blue-300" : "bg-gray-200"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Step 1 extra fields */}
                {mode === "register" && registerStep === 1 && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Full name</label>
                      <div className="relative">
                        <User2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input className="pl-10 h-11 rounded-xl border-gray-200" placeholder="Jordan Rivera"
                          value={form.displayName}
                          onChange={(e) => setForm(c => ({ ...c, displayName: e.target.value }))} required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Company name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input className="pl-10 h-11 rounded-xl border-gray-200" placeholder="Northstar Labs"
                          value={form.companyName}
                          onChange={(e) => setForm(c => ({ ...c, companyName: e.target.value }))} required />
                      </div>
                    </div>
                  </>
                )}

                {/* Step 2 — verify email */}
                {mode === "register" && registerStep === 2 && (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                        <MailCheck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Check your inbox</p>
                        <p className="text-sm text-gray-500 mt-1">
                          We sent a verification link to <span className="font-semibold text-gray-800">{form.email}</span>.
                          Open it, then come back and click below.
                        </p>
                        {verificationEmailSent && (
                          <p className="mt-2 text-xs font-bold text-blue-600 uppercase tracking-wider">Email sent ✓</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" disabled={loading}
                        onClick={async () => {
                          try {
                            const u = (await getFirebaseUserForFormEmail()) ||
                              (await signInWithEmailAndPassword(auth, normalizedEmail, form.password)).user;
                            await sendEmailVerification(u);
                            setVerificationEmailSent(true);
                            toast.success("Verification email resent.");
                          } catch (err: any) {
                            toast.error(getErrorMessage(err, "Unable to resend."));
                          }
                        }}
                        className="flex-1 h-10 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-50"
                      >
                        Resend email
                      </button>
                      <button type="submit" disabled={loading}
                        className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors disabled:opacity-50"
                      >
                        {loading ? "Checking…" : "I've verified →"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3 — workspace summary */}
                {mode === "register" && registerStep === 3 && (
                  <div className="rounded-2xl border border-green-100 bg-green-50/60 p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100">
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Email verified — almost there!</p>
                        <p className="text-sm text-gray-500 mt-1">We'll create your employer workspace now.</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-white border border-gray-100 divide-y divide-gray-100 text-sm overflow-hidden">
                      {[["Name", form.displayName], ["Company", form.companyName], ["Email", form.email]].map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-gray-400 font-medium">{k}</span>
                          <span className="font-semibold text-gray-800">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Email + password inputs */}
                {(mode === "login" || registerStep === 1) && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Work email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input type="email" className="pl-10 h-11 rounded-xl border-gray-200" placeholder="team@company.com"
                          value={form.email}
                          onChange={(e) => setForm(c => ({ ...c, email: e.target.value }))} required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input type={showPassword ? "text" : "password"} className="pl-10 pr-11 h-11 rounded-xl border-gray-200"
                          placeholder="Enter your password"
                          value={form.password}
                          onChange={(e) => setForm(c => ({ ...c, password: e.target.value }))} required />
                        <button type="button"
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(v => !v)}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* CTA buttons */}
                {registerStep !== 2 && (
                  <div className="flex gap-3 pt-1">
                    {mode === "register" && registerStep > 1 && (
                      <button type="button"
                        onClick={() => setRegisterStep(s => (s === 3 ? 2 : 1) as 1|2|3)}
                        className="h-12 px-5 rounded-2xl border border-gray-200 text-sm font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
                      >
                        Back
                      </button>
                    )}
                    <button type="submit" disabled={loading}
                      className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all disabled:opacity-60"
                    >
                      {loading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Please wait…</>
                      ) : mode === "login" ? (
                        <>Open dashboard <ArrowRight className="h-4 w-4" /></>
                      ) : registerStep === 1 ? (
                        <>Continue <ArrowRight className="h-4 w-4" /></>
                      ) : (
                        <>Create workspace <ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>
                  </div>
                )}
              </form>

              {/* Toggle link */}
              <p className="mt-6 text-center text-sm text-gray-500">
                {mode === "login" ? "New employer?" : "Already have access?"}{" "}
                <button type="button"
                  onClick={() => mode === "login" ? resetRegisterFlow() : setMode("login")}
                  className="font-bold text-blue-600 hover:underline"
                >
                  {mode === "login" ? "Create workspace" : "Sign in"}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
