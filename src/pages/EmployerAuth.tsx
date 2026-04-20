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
import { acceptEmployerInvite, completeEmployerLinkedInAuth, getEmployerInvitePreview, initiateEmployerLinkedInAuth, registerEmployerAccount } from "@/services/employerService";
import { auth } from "@/lib/firebase";

const features = [
  "Realtime job and applicant updates",
  "Analytics chart for applications by role",
  "Protected employer-only routes with Django JWT auth",
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

  // Handle LinkedIn OAuth callback
  useEffect(() => {
    const linkedinCode = searchParams.get("code");
    const linkedinState = searchParams.get("state");
    if (!linkedinCode || !linkedinState) {
      return;
    }
    setSearchParams({}, { replace: true });
    const handleLinkedInCallback = async () => {
      setLinkedInLoading(true);
      try {
        const response = await completeEmployerLinkedInAuth(linkedinCode, linkedinState);
        login(response.access, response.refresh, response.is_admin, response.email, response.role, response.company_name);
        toast.success("Signed in with LinkedIn successfully.");
        navigate(nextPath, { replace: true });
      } catch (error: any) {
        toast.error(getErrorMessage(error, "LinkedIn authentication failed. Please try again."));
      } finally {
        setLinkedInLoading(false);
      }
    };
    handleLinkedInCallback();
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,250,251,1))] px-4 py-10 dark:bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.16),_transparent_24%),linear-gradient(180deg,rgba(10,10,10,1),rgba(18,18,18,1))]">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <BriefcaseBusiness className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Hiring Console</p>
              <p className="text-xl font-semibold">Employer Panel</p>
            </div>
          </Link>

          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-accent">Modern recruitment OS</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight lg:text-6xl">
              Manage jobs, candidates, and hiring momentum from one workspace.
            </h1>
            <p className="mt-5 text-base text-muted-foreground lg:text-lg">
              Employers stay inside a dedicated workspace, separate from job-seeker tools, with verified onboarding before access is granted.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature} className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Building2 className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium leading-6">{feature}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}>
          <div className="rounded-[2rem] border border-border/70 bg-card/90 p-8 shadow-sm">
            <div className="flex rounded-2xl bg-secondary p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium ${mode === "login" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              >
                Employer login
              </button>
              <button
                type="button"
                onClick={resetRegisterFlow}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium ${mode === "register" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              >
                Create access
              </button>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold">{mode === "login" ? "Welcome back" : "Create employer account"}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "login"
                  ? "Only users with backend role `employer` or `admin` can access the employer dashboard."
                  : "Step-by-step onboarding with Firebase email verification before the employer workspace is created."}
              </p>
            </div>

            {mode === "login" ? (
              <div className="mt-6 space-y-4">
                <Button
                  type="button"
                  className="w-full rounded-2xl bg-[#0A66C2] text-white hover:bg-[#004182] h-12 text-base gap-3"
                  onClick={handleLinkedInLogin}
                  disabled={linkedInLoading || loading}
                >
                  {linkedInLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Linkedin className="h-5 w-5" />
                  )}
                  Sign in with LinkedIn
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      or use email
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            {invitePreview ? (
              <div className="mt-6 rounded-3xl border border-primary/20 bg-primary/5 p-5">
                <p className="text-sm font-semibold text-primary">You&apos;ve been invited</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Join <span className="font-medium text-foreground">{invitePreview.company_name}</span> as {invitePreview.role.replace("_", " ")} using <span className="font-medium text-foreground">{invitePreview.email}</span>.
                </p>
              </div>
            ) : null}

            {mode === "register" ? (
              <div className="mt-6 flex items-center gap-3">
                {steps.map((step) => {
                  const active = registerStep === step.id;
                  const complete = registerStep > step.id;

                  return (
                    <div key={step.id} className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${complete ? "border-primary bg-primary text-primary-foreground" : active ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground"}`}>
                        {complete ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                      </div>
                      <div className="hidden sm:block">
                        <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${active ? "text-accent" : "text-muted-foreground"}`}>
                          Step {step.id}
                        </p>
                        <p className="text-sm font-medium">{step.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {mode === "register" && registerStep === 1 ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full name</label>
                    <div className="relative">
                      <User2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        placeholder="Jordan Rivera"
                        value={form.displayName}
                        onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        placeholder="Northstar Labs"
                        value={form.companyName}
                        onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </>
              ) : null}

              {mode === "register" && registerStep === 2 ? (
                <div className="rounded-3xl border border-accent/20 bg-accent/5 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                      <MailCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Step 2: Verify your email</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        We sent a Firebase verification email to <span className="font-medium text-foreground">{form.email}</span>.
                        Open it, verify the email, and then return here.
                      </p>
                      {verificationEmailSent ? (
                        <p className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-accent">Verification email sent</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        try {
                          const firebaseUser =
                            (await getFirebaseUserForFormEmail()) ||
                            (await signInWithEmailAndPassword(auth, normalizedEmail, form.password)).user;
                          await sendEmailVerification(firebaseUser);
                          setVerificationEmailSent(true);
                          toast.success("Verification email resent.");
                        } catch (error: any) {
                          toast.error(getErrorMessage(error, "Unable to resend verification email."));
                        }
                      }}
                      disabled={loading}
                    >
                      Resend email
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Checking..." : "I've verified"}
                    </Button>
                  </div>
                </div>
              ) : null}

              {mode === "register" && registerStep === 3 ? (
                <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Step 3: Create employer workspace</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Your Firebase email is verified. We'll now create the employer user, link the company, and open the employer dashboard.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl bg-background/70 p-4 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Employer</span>
                      <span className="font-medium">{form.displayName}</span>
                    </div>
                    <div className="mt-2 flex justify-between gap-4">
                      <span className="text-muted-foreground">Company</span>
                      <span className="font-medium">{form.companyName}</span>
                    </div>
                    <div className="mt-2 flex justify-between gap-4">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium">{form.email}</span>
                    </div>
                  </div>
                </div>
              ) : null}

              {(mode === "login" || registerStep === 1) ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="email"
                        className="pl-10"
                        placeholder="team@company.com"
                        value={form.email}
                        onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowPassword((current) => !current)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : null}

              <div className="flex gap-3">
                {mode === "register" && registerStep > 1 ? (
                  <Button type="button" variant="outline" className="flex-1 rounded-2xl" onClick={() => setRegisterStep((current) => (current === 3 ? 2 : 1))}>
                    Back
                  </Button>
                ) : null}
                <Button type="submit" className="flex-1 rounded-2xl" size="lg" disabled={loading}>
                  {loading ? (
                    "Please wait..."
                  ) : mode === "login" ? (
                    "Open employer dashboard"
                  ) : registerStep === 1 ? (
                    "Continue to verification"
                  ) : registerStep === 2 ? (
                    "Confirm verification"
                  ) : (
                    "Create employer workspace"
                  )}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "login" ? "New employer here?" : "Already have employer access?"}{" "}
              <button
                type="button"
                onClick={() => {
                  if (mode === "login") {
                    resetRegisterFlow();
                  } else {
                    setMode("login");
                  }
                }}
                className="font-medium text-accent hover:underline"
              >
                {mode === "login" ? "Create workspace" : "Sign in"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
