import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Mail,
  Key,
  User,
  Save,
  Loader2,
  ShieldCheck,
  Info,
  Eye,
  EyeOff,
  Send,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { careerService, CareerProfile } from "@/services/careerService";
import { autoApplyService } from "@/services/autoApplyService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Chrome, ChevronDown } from "lucide-react";
import {
  sanitizeString,
  sanitizeEmail,
  MAX_SMALL_TEXT,
} from "@/lib/sanitization";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULT_PROFILE: CareerProfile = {
  id: 0,
  skills: [],
  experience_level: "",
  target_roles: [],
  preferred_locations: [],
  updated_at: "",
};

interface BotProfile {
  first_name: string; last_name: string; phone: string;
  address: string; city: string; state: string; country: string; zip_code: string;
  linkedin_url: string; github_url: string; portfolio_url: string;
  current_title: string; years_experience: string; expected_salary: string;
  current_salary: string; notice_period: string; willing_to_relocate: string;
  languages: string; degree: string; university: string;
  graduation_year: string; gpa: string; cover_letter: string;
}

const EMPTY_BOT: BotProfile = {
  first_name: "", last_name: "", phone: "", address: "", city: "", state: "",
  country: "", zip_code: "", linkedin_url: "", github_url: "", portfolio_url: "",
  current_title: "", years_experience: "", expected_salary: "", current_salary: "",
  notice_period: "", willing_to_relocate: "", languages: "", degree: "",
  university: "", graduation_year: "", gpa: "", cover_letter: "",
};

export default function Settings() {
  const { userEmail } = useAuth();
  const [profile, setProfile] = useState<CareerProfile>(DEFAULT_PROFILE);
  const [botProfile, setBotProfile] = useState<BotProfile>(EMPTY_BOT);
  const [email, setEmail] = useState(userEmail || "");
  const [appPassword, setAppPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hasCredential, setHasCredential] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingBot, setIsSavingBot] = useState(false);
  const [activeTab, setActiveTab] = useState<"personal" | "email" | "security">(
    "personal",
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const apiMod = await import("@/services/api");
        const api = apiMod.default;
        const [prof, status, botResp, resumesResp] = await Promise.all([
          careerService.getProfile().catch(() => null),
          autoApplyService.getStatus().catch(() => null),
          api.get("/api/bot/profile/").catch(() => null),
          api.get("/api/career/resumes/").catch(() => null),
        ]);
        if (prof) setProfile(prof);
        setHasCredential(!!(status?.has_credentials || status?.gmail_connected));
        if (status?.email) setEmail(status.email);

        // Build base from resume structured_data (most recent resume)
        const fromResume: Partial<BotProfile> = {};
        const resumes = resumesResp?.data?.results ?? resumesResp?.data ?? [];
        if (Array.isArray(resumes) && resumes.length > 0) {
          const sd = resumes[0]?.structured_data ?? {};
          const pick = (...keys: string[]) => keys.map(k => sd[k]).find(v => v) ?? "";
          fromResume.first_name = pick("first_name", "name")?.split(" ")[0] ?? "";
          fromResume.last_name = pick("last_name") || (pick("name")?.split(" ").slice(1).join(" ") ?? "");
          fromResume.phone = pick("phone", "mobile", "telephone");
          fromResume.address = pick("address");
          fromResume.city = pick("city");
          fromResume.state = pick("state");
          fromResume.country = pick("country");
          fromResume.zip_code = pick("zip", "postal_code", "zipcode");
          fromResume.linkedin_url = pick("linkedin", "linkedin_url");
          fromResume.github_url = pick("github", "github_url");
          fromResume.portfolio_url = pick("portfolio", "portfolio_url", "website");
          fromResume.current_title = pick("current_title", "title", "job_title");
          fromResume.years_experience = String(pick("years_experience", "experience_years") ?? "");
          fromResume.languages = Array.isArray(sd.languages)
            ? sd.languages.join(", ")
            : (sd.languages ?? "");
          const edu = Array.isArray(sd.education) ? sd.education[0] : (sd.education ?? {});
          if (edu) {
            fromResume.degree = edu.degree ?? "";
            fromResume.university = edu.university ?? edu.institution ?? edu.school ?? "";
            fromResume.graduation_year = String(edu.graduation_year ?? edu.end_year ?? edu.year ?? "");
            fromResume.gpa = String(edu.gpa ?? edu.cgpa ?? "");
          }
        }

        // BotProfile values override resume; empty BotProfile fields fall back to resume
        const saved = botResp?.data ?? {};
        const merged: BotProfile = { ...EMPTY_BOT };
        (Object.keys(EMPTY_BOT) as (keyof BotProfile)[]).forEach(key => {
          merged[key] = (saved[key] || fromResume[key] || "") as string;
        });
        setBotProfile(merged);
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const bp = (key: keyof BotProfile) => botProfile[key] as string;
  const setBp = (key: keyof BotProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setBotProfile(prev => ({ ...prev, [key]: e.target.value }));

  const handleSaveBotProfile = async () => {
    setIsSavingBot(true);
    try {
      const api = (await import("@/services/api")).default;
      await api.patch("/api/bot/profile/", botProfile);
      toast.success("Bot profile saved! It will be used to auto-fill applications.");
    } catch {
      toast.error("Failed to save bot profile.");
    } finally {
      setIsSavingBot(false);
    }
  };

  // Handle OAuth callback parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    // Handle persistent OAuth setup success
    if (urlParams.get("gmail_persistent_connected") === "1") {
      toast.success(
        "Gmail connected successfully! You can now send applications without re-authentication.",
      );
      setHasCredential(true);
      // Clean up URL without reload
      window.history.replaceState({}, document.title, window.location.pathname);
      // Reload status to get updated credentials
      autoApplyService
        .getStatus()
        .then((status) => {
          setHasCredential(
            !!(status?.has_credentials || status?.gmail_connected),
          );
          if (status?.email) setEmail(status.email);
        })
        .catch(console.error);
    }

    // Handle regular OAuth success
    if (urlParams.get("gmail_connected") === "1") {
      toast.success("Gmail connected successfully!");
      setHasCredential(true);
      window.history.replaceState({}, document.title, window.location.pathname);
      autoApplyService
        .getStatus()
        .then((status) => {
          setHasCredential(
            !!(status?.has_credentials || status?.gmail_connected),
          );
          if (status?.email) setEmail(status.email);
        })
        .catch(console.error);
    }

    // Handle OAuth errors
    const errorCode = urlParams.get("gmail_error");
    if (errorCode) {
      let errorMessage = "Failed to connect Gmail account.";
      if (errorCode === "access_denied") {
        errorMessage = "Gmail connection was cancelled. Please try again.";
      } else if (errorCode === "invalid_request") {
        errorMessage = "Invalid OAuth request. Please try again.";
      } else if (errorCode === "unauthorized_client") {
        errorMessage = "Unauthorized OAuth client. Please contact support.";
      }
      toast.error(errorMessage);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handlePersistentGmailOAuth = async () => {
    try {
      const res = await fetch("/api/apply/gmail/persistent-setup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to initiate persistent OAuth");
      const data = await res.json();
      if (data.auth_url) {
        window.location.href = data.auth_url;
      } else {
        throw new Error("No auth URL received");
      }
    } catch (error) {
      console.error("Persistent OAuth setup failed:", error);
      toast.error("Failed to initiate persistent Gmail OAuth");
    }
  };

  const handleDisconnectGmailOAuth = async () => {
    try {
      const res = await fetch("/api/apply/gmail/disconnect/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to disconnect OAuth");
      setHasCredential(false);
      toast.success("Gmail OAuth disconnected successfully");
    } catch (error) {
      console.error("OAuth disconnect failed:", error);
      toast.error("Failed to disconnect Gmail OAuth");
    }
  };

  const handleSaveMail = async () => {
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedPassword = appPassword.replace(/\s+/g, "").slice(0, 100);

    if (!sanitizedEmail || !sanitizedPassword) {
      toast.error("Please provide a valid email and app password.");
      return;
    }
    setIsSaving(true);
    try {
      await autoApplyService.saveCredential(sanitizedEmail, sanitizedPassword);
      setHasCredential(true);
      setAppPassword("");
      toast.success("Email configuration updated successfully!");
    } catch (error) {
      toast.error("Failed to save email credentials.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      // This sends a real test email via the backend
      await autoApplyService.testSend();
      toast.success(
        "Test email sent successfully! Please check your inbox (including spam).",
      );
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        "Connection test failed. Verify your App Password.";
      toast.error(msg);
    } finally {
      setIsTesting(false);
    }
  };

  const handleGmailOAuth = async () => {
    try {
      const authUrl = await autoApplyService.getGmailAuthUrl();
      window.location.href = authUrl;
    } catch (e: any) {
      toast.error("Failed to initiate Gmail OAuth");
    }
  };

  const handleUpdateProfile = async () => {
    const sanitizedProfile: CareerProfile = {
      ...profile,
      experience_level: sanitizeString(profile.experience_level, 20),
      preferred_locations: profile.preferred_locations.map((l) =>
        sanitizeString(l, 100),
      ),
      skills: profile.skills.map((s) => sanitizeString(s, 100)),
      target_roles: profile.target_roles.map((r) => sanitizeString(r, 100)),
    };

    setIsSaving(true);
    try {
      await careerService.updateProfile(sanitizedProfile);
      toast.success("Profile updated successfully!");
      setProfile(sanitizedProfile);
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center pt-20 bg-[#0a0f1e]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] relative overflow-hidden">
      {/* Atmospheric glows */}
      <div className="pointer-events-none absolute top-0 right-1/3 w-[500px] h-[400px] rounded-full bg-violet-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full bg-teal-500/10 blur-[120px]" />
      <Navbar />
      <div className="pt-32 pb-20 px-4 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <header className="mb-10">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Settings & Profile
            </h1>
            <p className="text-slate-400 mt-2">
              Manage your account authentication, mail configuration and career
              profile.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Navigation Sidebar */}
            <aside className="lg:col-span-1 space-y-2">
              <nav className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("personal")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "personal" ? "bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold" : "text-slate-400 hover:bg-white/[0.05] hover:text-white font-medium"} text-sm text-left`}
                >
                  <User className="h-4 w-4" />
                  Personal Profile
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("email")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "email" ? "bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold" : "text-slate-400 hover:bg-white/[0.05] hover:text-white font-medium"} text-sm text-left`}
                >
                  <Mail className="h-4 w-4" />
                  Email Config
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("security")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "security" ? "bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold" : "text-slate-400 hover:bg-white/[0.05] hover:text-white font-medium"} text-sm text-left`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Security
                </button>
              </nav>
            </aside>

            {/* Settings Panels */}
            <main className="lg:col-span-2 space-y-8">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "email" && (
                  /* ── Mail Configuration ── */
                  <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white leading-none">
                          Auto-Apply Configuration
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Choose how you want to send automated applications.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Method 1: OAuth */}
                      <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Chrome className="h-4 w-4 text-blue-400" />
                            <span className="text-sm font-bold text-white">
                              Sign in with Google
                            </span>
                            <span className="text-[10px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded uppercase">
                              Recommended
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mb-4">
                          Connect your Gmail securely via Google. No passwords
                          required.
                        </p>
                        <Button
                          variant="outline"
                          onClick={handleGmailOAuth}
                          className="w-full h-11 rounded-xl bg-white/[0.03] border-blue-500/30 text-blue-400 font-bold hover:bg-blue-500/10"
                        >
                          <Chrome className="h-4 w-4 mr-2" />
                          {hasCredential
                            ? "Reconnect Google Account"
                            : "Connect Google Account"}
                        </Button>
                      </div>

                      {/* Method 1.5: Persistent OAuth Setup */}
                      <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-400" />
                            <span className="text-sm font-bold text-white">
                              Persistent Gmail Setup
                            </span>
                            <span className="text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded uppercase">
                              One-Time
                            </span>
                          </div>
                          {hasCredential && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleDisconnectGmailOAuth}
                              className="h-7 px-2 text-xs rounded-lg bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                            >
                              Disconnect
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mb-4">
                          Set up Gmail OAuth once and use it for all future
                          applications. No more re-authentication needed.
                        </p>
                        {!hasCredential ? (
                          <Button
                            variant="outline"
                            onClick={handlePersistentGmailOAuth}
                            className="w-full h-11 rounded-xl bg-white/[0.03] border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-500/10"
                          >
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Setup Persistent Gmail OAuth
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] font-bold text-emerald-400">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Persistent Gmail OAuth Active
                          </div>
                        )}
                      </div>

                      <div className="relative py-2 text-center">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/[0.06]"></div>
                        </div>
                        <span className="relative bg-[#0d1225] px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Or Use App Password
                        </span>
                      </div>

                      {/* Method 2: App Password */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">
                            Gmail Address
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-white/[0.05] text-slate-100 placeholder:text-slate-500 px-4 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/40 focus:bg-white/10 transition-all"
                            placeholder="yourname@gmail.com"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">
                            Google App Password
                          </label>
                          <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={appPassword}
                              onChange={(e) => setAppPassword(e.target.value)}
                              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] text-slate-100 placeholder:text-slate-500 pl-11 pr-12 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/40 focus:bg-white/10 transition-all"
                              placeholder="xxxx xxxx xxxx xxxx"
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
                          <div className="mt-2 flex items-start gap-2 bg-white/[0.03] border border-white/[0.08] p-3 rounded-xl">
                            <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] leading-relaxed text-slate-400">
                              Use a 16-character App Password from Google, not
                              your main password. Spaces will be automatically
                              removed for security.
                            </p>
                          </div>
                        </div>

                        {hasCredential && (
                          <div className="flex items-center gap-2 mt-4 px-3 py-2 bg-teal-500/10 border border-teal-500/20 rounded-lg text-[11px] font-bold text-teal-400">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Credentials currently encrypted & active
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                          <Button
                            onClick={handleSaveMail}
                            disabled={isSaving}
                            className="h-12 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-bold shadow-lg shadow-teal-500/25"
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Update Config"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleTestConnection}
                            disabled={
                              isTesting || !hasCredential || appPassword !== ""
                            }
                            className="h-12 rounded-2xl border-white/10 bg-white/[0.03] text-slate-300 font-bold hover:bg-white/10 hover:text-white"
                            title={
                              appPassword !== ""
                                ? "Save your changes first before testing"
                                : ""
                            }
                          >
                            {isTesting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Send className="h-3.5 w-3.5 mr-2" /> Test
                                Config
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {activeTab === "personal" && (
                  <div className="space-y-6">
                  {/* ── Bot Profile (Apply with Bot data) ── */}
                  <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-6 md:p-8 space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white leading-none">Apply Bot Profile</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Pre-filled from your saved resume. Edit anything that's wrong or missing — these values are what the bot types into job application forms.
                        </p>
                      </div>
                    </div>

                    {/* Personal */}
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider text-teal-500 mb-3">Personal</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: "First Name", key: "first_name", placeholder: "John" },
                          { label: "Last Name", key: "last_name", placeholder: "Doe" },
                          { label: "Phone Number", key: "phone", placeholder: "+1 555 000 0000" },
                          { label: "Languages", key: "languages", placeholder: "English, Spanish" },
                        ].map(({ label, key, placeholder }) => (
                          <div key={key} className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">{label}</label>
                            <input type="text" value={bp(key as keyof BotProfile)} onChange={setBp(key as keyof BotProfile)} placeholder={placeholder}
                              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] text-slate-100 placeholder:text-slate-500 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider text-teal-500 mb-3">Location</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: "Address", key: "address", placeholder: "123 Main St" },
                          { label: "City", key: "city", placeholder: "New York" },
                          { label: "State / Province", key: "state", placeholder: "NY" },
                          { label: "Country", key: "country", placeholder: "United States" },
                          { label: "ZIP / Postal Code", key: "zip_code", placeholder: "10001" },
                        ].map(({ label, key, placeholder }) => (
                          <div key={key} className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">{label}</label>
                            <input type="text" value={bp(key as keyof BotProfile)} onChange={setBp(key as keyof BotProfile)} placeholder={placeholder}
                              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] text-slate-100 placeholder:text-slate-500 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Online Presence */}
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider text-teal-500 mb-3">Online Presence</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: "LinkedIn URL", key: "linkedin_url", placeholder: "https://linkedin.com/in/yourname" },
                          { label: "GitHub URL", key: "github_url", placeholder: "https://github.com/yourname" },
                          { label: "Portfolio / Website", key: "portfolio_url", placeholder: "https://yoursite.com" },
                        ].map(({ label, key, placeholder }) => (
                          <div key={key} className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">{label}</label>
                            <input type="url" value={bp(key as keyof BotProfile)} onChange={setBp(key as keyof BotProfile)} placeholder={placeholder}
                              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] text-slate-100 placeholder:text-slate-500 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Career */}
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider text-teal-500 mb-3">Career Details</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: "Current Job Title", key: "current_title", placeholder: "Senior Developer" },
                          { label: "Years of Experience", key: "years_experience", placeholder: "5" },
                          { label: "Expected Salary", key: "expected_salary", placeholder: "$80,000" },
                          { label: "Current Salary", key: "current_salary", placeholder: "$70,000" },
                          { label: "Notice Period", key: "notice_period", placeholder: "2 weeks" },
                          { label: "Willing to Relocate", key: "willing_to_relocate", placeholder: "Yes / No" },
                        ].map(({ label, key, placeholder }) => (
                          <div key={key} className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">{label}</label>
                            <input type="text" value={bp(key as keyof BotProfile)} onChange={setBp(key as keyof BotProfile)} placeholder={placeholder}
                              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] text-slate-100 placeholder:text-slate-500 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Education */}
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider text-teal-500 mb-3">Education</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: "Degree", key: "degree", placeholder: "Bachelor of Science" },
                          { label: "University / College", key: "university", placeholder: "MIT" },
                          { label: "Graduation Year", key: "graduation_year", placeholder: "2020" },
                          { label: "GPA / CGPA", key: "gpa", placeholder: "3.8" },
                        ].map(({ label, key, placeholder }) => (
                          <div key={key} className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">{label}</label>
                            <input type="text" value={bp(key as keyof BotProfile)} onChange={setBp(key as keyof BotProfile)} placeholder={placeholder}
                              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] text-slate-100 placeholder:text-slate-500 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider text-teal-500 mb-3">Cover Letter Template</p>
                      <textarea
                        value={bp("cover_letter")} onChange={setBp("cover_letter")}
                        rows={5} placeholder="Write a default cover letter the bot will use when a cover letter field is detected..."
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.05] text-slate-100 placeholder:text-slate-500 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all resize-none"
                      />
                    </div>

                    <Button type="button" onClick={handleSaveBotProfile} disabled={isSavingBot}
                      className="h-12 px-6 rounded-2xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-sm transition-all">
                      {isSavingBot ? <Loader2 className="h-4 w-4 animate-spin mr-2 inline" /> : <Save className="h-4 w-4 mr-2 inline" />}
                      Save Bot Profile
                    </Button>
                  </section>

                  {/* ── Career Profile ── */}
                  <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white leading-none">
                          Career Profile
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Your AI matching preferences.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">
                          Experience Level
                        </label>
                        <Select
                          value={profile.experience_level}
                          onValueChange={(val) =>
                            setProfile({ ...profile, experience_level: val })
                          }
                        >
                          <SelectTrigger className="w-full h-12 rounded-2xl border border-white/10 bg-white/[0.05] text-slate-100 px-4 text-sm font-medium focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/40 focus:bg-white/10 transition-all">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1f2e] border-white/10 text-slate-100">
                            <SelectItem value="Entry">Entry Level</SelectItem>
                            <SelectItem value="Mid">Mid Level</SelectItem>
                            <SelectItem value="Senior">Senior Level</SelectItem>
                            <SelectItem value="Exec">Executive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">
                          Preferred Location
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.05] text-slate-100 placeholder:text-slate-500 px-4 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/40 focus:bg-white/10 transition-all"
                          placeholder="e.g. Remote, New York, etc."
                          value={profile.preferred_locations.join(", ")}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              preferred_locations: e.target.value
                                .split(",")
                                .map((s) => s.trim()),
                            })
                          }
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">
                          Target Job Role
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.05] text-slate-100 placeholder:text-slate-500 px-4 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/40 focus:bg-white/10 transition-all font-bold"
                          placeholder="e.g. Senior Software Engineer, Product Manager..."
                          value={profile.target_roles.join(", ")}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              target_roles: e.target.value
                                .split(",")
                                .map((s) => s.trim()),
                            })
                          }
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">
                          Top Skills (comma separated)
                        </label>
                        <textarea
                          rows={3}
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.05] text-slate-100 placeholder:text-slate-500 px-4 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/40 focus:bg-white/10 transition-all"
                          placeholder="React, TypeScript, Product Management..."
                          value={profile.skills.join(", ")}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              skills: e.target.value
                                .split(",")
                                .map((s) => s.trim()),
                            })
                          }
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleUpdateProfile}
                      disabled={isSaving}
                      className="w-full mt-8 h-12 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-bold shadow-lg shadow-teal-500/25"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" /> Save Profile Info
                        </>
                      )}
                    </Button>
                  </section>
                  </div>
                )}

                {activeTab === "security" && (
                  /* ── Security Configuration ── */
                  <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white leading-none">
                          Security Dashboard
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Manage your account protection protocols.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                        <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-tight">
                          Multi-Factor Authentication
                        </h4>
                        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                          Add an extra layer of security to your account by
                          enabling hardware keys or authenticator apps.
                        </p>
                        <Button
                          variant="outline"
                          className="w-full h-11 rounded-xl border-white/10 text-slate-300 font-bold hover:bg-white/5 cursor-not-allowed opacity-50"
                        >
                          Setup MFA (Coming Soon)
                        </Button>
                      </div>

                      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                        <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-tight">
                          Active Sessions
                        </h4>
                        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                          Manage and revoke access for active devices logged
                          into your CareerAI account.
                        </p>
                        <Button
                          variant="outline"
                          className="w-full h-11 rounded-xl border-white/10 text-slate-300 font-bold hover:bg-white/5 cursor-not-allowed opacity-50"
                        >
                          View Active Sessions
                        </Button>
                      </div>
                    </div>
                  </section>
                )}
              </motion.div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
