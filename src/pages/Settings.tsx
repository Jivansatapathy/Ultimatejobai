import { useState, useEffect } from "react";
import {
  Mail, Key, User, Save, Loader2, ShieldCheck, Info,
  Eye, EyeOff, Send, Chrome, Lock, Monitor, CreditCard, ArrowUpRight, Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { careerService, CareerProfile } from "@/services/careerService";
import { autoApplyService } from "@/services/autoApplyService";
import { useSubscription } from "@/context/SubscriptionContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { NavbarV2 as Navbar } from "@/components/landing2/NavbarV2";
import { sanitizeString, sanitizeEmail } from "@/lib/sanitization";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────

const DEFAULT_PROFILE: CareerProfile = {
  id: 0, skills: [], experience_level: "",
  target_roles: [], preferred_locations: [], updated_at: "",
};

interface BotProfile {
  first_name: string; last_name: string; phone: string;
  address: string; city: string; state: string; country: string; zip_code: string;
  linkedin_url: string; github_url: string; portfolio_url: string;
  current_title: string; years_experience: string; expected_salary: string;
  current_salary: string; notice_period: string; willing_to_relocate: string;
  languages: string; degree: string; university: string;
  graduation_year: string; gpa: string; cover_letter: string;
  answer_why_us: string; answer_about_me: string; answer_strengths: string;
  answer_why_hire: string; answer_work_style: string;
}

const EMPTY_BOT: BotProfile = {
  first_name: "", last_name: "", phone: "", address: "", city: "", state: "",
  country: "", zip_code: "", linkedin_url: "", github_url: "", portfolio_url: "",
  current_title: "", years_experience: "", expected_salary: "", current_salary: "",
  notice_period: "", willing_to_relocate: "", languages: "", degree: "",
  university: "", graduation_year: "", gpa: "", cover_letter: "",
  answer_why_us: "", answer_about_me: "", answer_strengths: "",
  answer_why_hire: "", answer_work_style: "",
};

// ─── Shared input class ───────────────────────────────────────────────────────

const INPUT = "w-full rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 px-4 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/15 transition-all";
const LABEL = "block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider";
const SECTION_TITLE = "text-[11px] font-black uppercase tracking-wider text-teal-600 mb-3";

// ─── Component ────────────────────────────────────────────────────────────────

export default function Settings() {
  const { userEmail } = useAuth();
  const navigate = useNavigate();
  const { summary, loadingSummary, refreshSummary } = useSubscription();
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
  const [activeTab, setActiveTab] = useState<"personal" | "plan" | "email" | "security">("personal");

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
          fromResume.languages = Array.isArray(sd.languages) ? sd.languages.join(", ") : (sd.languages ?? "");
          const edu = Array.isArray(sd.education) ? sd.education[0] : (sd.education ?? {});
          if (edu) {
            fromResume.degree = edu.degree ?? "";
            fromResume.university = edu.university ?? edu.institution ?? edu.school ?? "";
            fromResume.graduation_year = String(edu.graduation_year ?? edu.end_year ?? edu.year ?? "");
            fromResume.gpa = String(edu.gpa ?? edu.cgpa ?? "");
          }
        }
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

  useEffect(() => { refreshSummary(); }, [refreshSummary]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("gmail_persistent_connected") === "1") {
      toast.success("Gmail connected successfully! Persistent auth active.");
      setHasCredential(true);
      window.history.replaceState({}, document.title, window.location.pathname);
      autoApplyService.getStatus().then(s => {
        setHasCredential(!!(s?.has_credentials || s?.gmail_connected));
        if (s?.email) setEmail(s.email);
      }).catch(console.error);
    }
    if (urlParams.get("gmail_connected") === "1") {
      toast.success("Gmail connected successfully!");
      setHasCredential(true);
      window.history.replaceState({}, document.title, window.location.pathname);
      autoApplyService.getStatus().then(s => {
        setHasCredential(!!(s?.has_credentials || s?.gmail_connected));
        if (s?.email) setEmail(s.email);
      }).catch(console.error);
    }
    const errorCode = urlParams.get("gmail_error");
    if (errorCode) {
      const msgs: Record<string, string> = {
        access_denied: "Gmail connection was cancelled.",
        invalid_request: "Invalid OAuth request. Please try again.",
        unauthorized_client: "Unauthorized OAuth client. Contact support.",
      };
      toast.error(msgs[errorCode] || "Failed to connect Gmail account.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const bp = (key: keyof BotProfile) => botProfile[key] as string;
  const setBp = (key: keyof BotProfile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setBotProfile(prev => ({ ...prev, [key]: e.target.value }));

  const handleSaveBotProfile = async () => {
    setIsSavingBot(true);
    try {
      const api = (await import("@/services/api")).default;
      await api.patch("/api/bot/profile/", botProfile);
      toast.success("Bot profile saved!");
    } catch { toast.error("Failed to save bot profile."); }
    finally { setIsSavingBot(false); }
  };

  const handlePersistentGmailOAuth = async () => {
    try {
      const res = await fetch("/api/apply/gmail/persistent-setup/", { method: "POST", headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.auth_url) window.location.href = data.auth_url;
      else throw new Error();
    } catch { toast.error("Failed to initiate persistent Gmail OAuth"); }
  };

  const handleDisconnectGmailOAuth = async () => {
    try {
      const res = await fetch("/api/apply/gmail/disconnect/", { method: "POST", headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error();
      setHasCredential(false);
      toast.success("Gmail disconnected successfully");
    } catch { toast.error("Failed to disconnect Gmail"); }
  };

  const handleSaveMail = async () => {
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedPassword = appPassword.replace(/\s+/g, "").slice(0, 100);
    if (!sanitizedEmail || !sanitizedPassword) { toast.error("Please provide a valid email and app password."); return; }
    setIsSaving(true);
    try {
      await autoApplyService.saveCredential(sanitizedEmail, sanitizedPassword);
      setHasCredential(true);
      setAppPassword("");
      toast.success("Email configuration saved!");
    } catch { toast.error("Failed to save email credentials."); }
    finally { setIsSaving(false); }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      await autoApplyService.testSend();
      toast.success("Test email sent! Check your inbox.");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Connection test failed. Verify your App Password.");
    } finally { setIsTesting(false); }
  };

  const handleGmailOAuth = async () => {
    try {
      const authUrl = await autoApplyService.getGmailAuthUrl();
      window.location.href = authUrl;
    } catch { toast.error("Failed to initiate Gmail OAuth"); }
  };

  const handleUpdateProfile = async () => {
    const sanitizedProfile: CareerProfile = {
      ...profile,
      experience_level: sanitizeString(profile.experience_level, 20),
      preferred_locations: profile.preferred_locations.map(l => sanitizeString(l, 100)),
      skills: profile.skills.map(s => sanitizeString(s, 100)),
      target_roles: profile.target_roles.map(r => sanitizeString(r, 100)),
    };
    setIsSaving(true);
    try {
      await careerService.updateProfile(sanitizedProfile);
      toast.success("Profile updated!");
      setProfile(sanitizedProfile);
    } catch { toast.error("Failed to update profile."); }
    finally { setIsSaving(false); }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-7 w-7 animate-spin text-teal-500" />
      </div>
    );
  }

  const NAV_TABS = [
    { id: "personal" as const, label: "Personal Profile", icon: User },
    { id: "plan"     as const, label: "Plan & Billing",   icon: CreditCard },
    { id: "email"    as const, label: "Email Config",     icon: Mail },
    { id: "security" as const, label: "Security",         icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-28 pb-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">

          {/* Page header */}
          <header className="mb-10">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
            <p className="text-gray-500 mt-1.5 text-sm">
              Manage your account, email configuration, bot profile, and security.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <aside className="md:col-span-1">
              <nav className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2 flex flex-row md:flex-col gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {NAV_TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-semibold text-left transition-all whitespace-nowrap shrink-0 md:shrink md:w-full ${
                      activeTab === id
                        ? "bg-teal-50 border border-teal-200 text-teal-700"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* ── Main panel ──────────────────────────────────────────────── */}
            <main className="md:col-span-3">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >

                {/* ════════════════ PERSONAL TAB ════════════════ */}
                {activeTab === "personal" && (
                  <div className="space-y-6">

                    {/* Bot Profile */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 leading-none">Apply Bot Profile</h3>
                          <p className="text-xs text-gray-500 mt-1">These values are typed into job application forms by the bot.</p>
                        </div>
                      </div>

                      {/* Personal */}
                      <div>
                        <p className={SECTION_TITLE}>Personal</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { label: "First Name", key: "first_name", placeholder: "John" },
                            { label: "Last Name",  key: "last_name",  placeholder: "Doe" },
                            { label: "Phone Number", key: "phone",    placeholder: "+1 555 000 0000" },
                            { label: "Languages",  key: "languages",  placeholder: "English, Spanish" },
                          ].map(({ label, key, placeholder }) => (
                            <div key={key}>
                              <label className={LABEL}>{label}</label>
                              <input type="text" value={bp(key as keyof BotProfile)} onChange={setBp(key as keyof BotProfile)} placeholder={placeholder} className={INPUT} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Location */}
                      <div>
                        <p className={SECTION_TITLE}>Location</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { label: "Address",          key: "address",  placeholder: "123 Main St" },
                            { label: "City",             key: "city",     placeholder: "New York" },
                            { label: "State / Province", key: "state",    placeholder: "NY" },
                            { label: "Country",          key: "country",  placeholder: "United States" },
                            { label: "ZIP / Postal",     key: "zip_code", placeholder: "10001" },
                          ].map(({ label, key, placeholder }) => (
                            <div key={key}>
                              <label className={LABEL}>{label}</label>
                              <input type="text" value={bp(key as keyof BotProfile)} onChange={setBp(key as keyof BotProfile)} placeholder={placeholder} className={INPUT} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Online Presence */}
                      <div>
                        <p className={SECTION_TITLE}>Online Presence</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { label: "LinkedIn URL",       key: "linkedin_url",  placeholder: "https://linkedin.com/in/yourname" },
                            { label: "GitHub URL",         key: "github_url",    placeholder: "https://github.com/yourname" },
                            { label: "Portfolio / Website",key: "portfolio_url", placeholder: "https://yoursite.com" },
                          ].map(({ label, key, placeholder }) => (
                            <div key={key}>
                              <label className={LABEL}>{label}</label>
                              <input type="url" value={bp(key as keyof BotProfile)} onChange={setBp(key as keyof BotProfile)} placeholder={placeholder} className={INPUT} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Career Details */}
                      <div>
                        <p className={SECTION_TITLE}>Career Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { label: "Current Job Title",    key: "current_title",     placeholder: "Senior Developer" },
                            { label: "Years of Experience",  key: "years_experience",  placeholder: "5" },
                            { label: "Expected Salary",      key: "expected_salary",   placeholder: "$80,000" },
                            { label: "Current Salary",       key: "current_salary",    placeholder: "$70,000" },
                            { label: "Notice Period",        key: "notice_period",     placeholder: "2 weeks" },
                            { label: "Willing to Relocate",  key: "willing_to_relocate", placeholder: "Yes / No" },
                          ].map(({ label, key, placeholder }) => (
                            <div key={key}>
                              <label className={LABEL}>{label}</label>
                              <input type="text" value={bp(key as keyof BotProfile)} onChange={setBp(key as keyof BotProfile)} placeholder={placeholder} className={INPUT} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Education */}
                      <div>
                        <p className={SECTION_TITLE}>Education</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { label: "Degree",           key: "degree",          placeholder: "Bachelor of Science" },
                            { label: "University",       key: "university",      placeholder: "MIT" },
                            { label: "Graduation Year",  key: "graduation_year", placeholder: "2020" },
                            { label: "GPA / CGPA",       key: "gpa",             placeholder: "3.8" },
                          ].map(({ label, key, placeholder }) => (
                            <div key={key}>
                              <label className={LABEL}>{label}</label>
                              <input type="text" value={bp(key as keyof BotProfile)} onChange={setBp(key as keyof BotProfile)} placeholder={placeholder} className={INPUT} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cover Letter */}
                      <div>
                        <p className={SECTION_TITLE}>Cover Letter Template</p>
                        <textarea
                          value={bp("cover_letter")} onChange={setBp("cover_letter")}
                          rows={5}
                          placeholder="Write a default cover letter the bot will use when a cover letter field is detected…"
                          className={INPUT + " resize-none"}
                        />
                      </div>

                      {/* Q&A */}
                      <div>
                        <p className={SECTION_TITLE}>Common Application Questions</p>
                        <p className="text-xs text-gray-500 mb-4">Save your answers here — the bot uses them instantly, making applications much faster.</p>
                        <div className="space-y-4">
                          {([
                            { key: "answer_about_me",   label: "Tell us about yourself",       placeholder: "Write a 2-3 sentence professional summary…" },
                            { key: "answer_why_us",     label: "Why do you want to work here?", placeholder: "Tie your skills and goals to the company's mission…" },
                            { key: "answer_why_hire",   label: "Why should we hire you?",       placeholder: "Highlight your unique value and impact…" },
                            { key: "answer_strengths",  label: "What are your strengths?",      placeholder: "3 strengths with brief context…" },
                            { key: "answer_work_style", label: "Describe your work style",      placeholder: "Detail-oriented, async-friendly, data-driven…" },
                          ] as { key: keyof BotProfile; label: string; placeholder: string }[]).map(({ key, label, placeholder }) => (
                            <div key={key}>
                              <label className={LABEL}>{label}</label>
                              <textarea value={bp(key)} onChange={setBp(key)} rows={3} placeholder={placeholder} className={INPUT + " resize-none"} />
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveBotProfile}
                        disabled={isSavingBot}
                        className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm transition-colors disabled:opacity-60"
                      >
                        {isSavingBot ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Bot Profile
                      </button>
                    </div>

                    {/* Career Profile */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 leading-none">AI Matching Preferences</h3>
                          <p className="text-xs text-gray-500 mt-1">Used for AI job recommendations and career insights.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className={LABEL}>Experience Level</label>
                          <Select value={profile.experience_level} onValueChange={val => setProfile({ ...profile, experience_level: val })}>
                            <SelectTrigger className="w-full h-10 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-teal-500/15 focus:border-teal-400">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-200 text-gray-900">
                              <SelectItem value="Entry">Entry Level</SelectItem>
                              <SelectItem value="Mid">Mid Level</SelectItem>
                              <SelectItem value="Senior">Senior Level</SelectItem>
                              <SelectItem value="Exec">Executive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className={LABEL}>Preferred Location</label>
                          <input
                            type="text"
                            className={INPUT}
                            placeholder="Remote, New York…"
                            value={profile.preferred_locations.join(", ")}
                            onChange={e => setProfile({ ...profile, preferred_locations: e.target.value.split(",").map(s => s.trim()) })}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className={LABEL}>Target Job Role</label>
                          <input
                            type="text"
                            className={INPUT}
                            placeholder="Senior Software Engineer, Product Manager…"
                            value={profile.target_roles.join(", ")}
                            onChange={e => setProfile({ ...profile, target_roles: e.target.value.split(",").map(s => s.trim()) })}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className={LABEL}>Top Skills (comma separated)</label>
                          <textarea
                            rows={3}
                            className={INPUT + " resize-none"}
                            placeholder="React, TypeScript, Product Management…"
                            value={profile.skills.join(", ")}
                            onChange={e => setProfile({ ...profile, skills: e.target.value.split(",").map(s => s.trim()) })}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleUpdateProfile}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 h-11 px-6 mt-6 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm transition-colors disabled:opacity-60"
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Preferences
                      </button>
                    </div>
                  </div>
                )}

                {/* ════════════════ PLAN & BILLING TAB ════════════════ */}
                {activeTab === "plan" && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-7">
                      <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 leading-none">Plan & Billing</h3>
                        <p className="text-xs text-gray-500 mt-1">Your current plan and usage limits.</p>
                      </div>
                    </div>

                    {loadingSummary ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                      </div>
                    ) : (
                      <>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 flex items-center justify-between gap-4 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-lg font-extrabold text-gray-900">
                                {summary?.plan?.name ?? "Free Tier"}
                              </p>
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 border border-teal-200">
                                {summary?.status ?? "default"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">
                              {summary?.plan?.price_display ?? "Free"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigate("/plans")}
                            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm transition-colors"
                          >
                            Change Plan
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {(summary?.plan?.features?.filter(f => f.is_enabled).length ?? 0) > 0 && (
                          <div className="mt-6">
                            <p className={SECTION_TITLE}>What's included</p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              {summary!.plan!.features.filter(f => f.is_enabled).map(f => (
                                <li key={f.feature_key} className="flex items-start gap-2 text-sm text-gray-700">
                                  <Check className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                                  <span>
                                    {f.feature_label || f.feature_key.replace(/_access$/, "").replace(/_/g, " ")}
                                    {f.limit_display && f.limit_display !== "Unlimited" && (
                                      <span className="text-gray-400"> — {f.limit_display}</span>
                                    )}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* ════════════════ EMAIL TAB ════════════════ */}
                {activeTab === "email" && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-7">
                      <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 leading-none">Auto-Apply Email Config</h3>
                        <p className="text-xs text-gray-500 mt-1">Choose how automated applications are sent.</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      {/* OAuth – Sign in with Google */}
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <Chrome className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-bold text-blue-900">Sign in with Google</span>
                          <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">Recommended</span>
                        </div>
                        <p className="text-xs text-blue-700 mb-4">Connect your Gmail securely via Google. No passwords required.</p>
                        <button
                          type="button"
                          onClick={handleGmailOAuth}
                          className="w-full h-10 rounded-xl border border-blue-300 bg-white text-blue-700 text-sm font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <Chrome className="h-4 w-4" />
                          {hasCredential ? "Reconnect Google Account" : "Connect Google Account"}
                        </button>
                      </div>

                      {/* Persistent OAuth */}
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm font-bold text-emerald-900">Persistent Gmail Setup</span>
                            <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">One-Time</span>
                          </div>
                          {hasCredential && (
                            <button
                              type="button"
                              onClick={handleDisconnectGmailOAuth}
                              className="text-xs font-bold text-red-600 hover:text-red-700 px-3 py-1 rounded-lg border border-red-200 bg-white hover:bg-red-50 transition-colors"
                            >
                              Disconnect
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-emerald-700 mb-4">Set up once — no re-authentication needed for future applications.</p>
                        {!hasCredential ? (
                          <button
                            type="button"
                            onClick={handlePersistentGmailOAuth}
                            className="w-full h-10 rounded-xl border border-emerald-300 bg-white text-emerald-700 text-sm font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                          >
                            <ShieldCheck className="h-4 w-4" />
                            Setup Persistent Gmail OAuth
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-700">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Persistent Gmail OAuth Active
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="relative py-1 text-center">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                        <span className="relative bg-white px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                          Or use App Password
                        </span>
                      </div>

                      {/* App Password */}
                      <div className="space-y-4">
                        <div>
                          <label className={LABEL}>Gmail Address</label>
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="yourname@gmail.com"
                            className={INPUT}
                          />
                        </div>

                        <div>
                          <label className={LABEL}>Google App Password</label>
                          <div className="relative">
                            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={appPassword}
                              onChange={e => setAppPassword(e.target.value)}
                              placeholder="xxxx xxxx xxxx xxxx"
                              className={INPUT + " pl-10 pr-10"}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 p-3 rounded-xl">
                            <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 leading-relaxed">
                              Use a 16-character App Password from Google — not your main password. Spaces are removed automatically.
                            </p>
                          </div>
                        </div>

                        {hasCredential && (
                          <div className="flex items-center gap-2 px-3 py-2.5 bg-teal-50 border border-teal-200 rounded-xl text-xs font-bold text-teal-700">
                            <ShieldCheck className="h-4 w-4" />
                            Credentials are encrypted and active
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <button
                            type="button"
                            onClick={handleSaveMail}
                            disabled={isSaving}
                            className="h-11 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                          >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Config"}
                          </button>
                          <button
                            type="button"
                            onClick={handleTestConnection}
                            disabled={isTesting || !hasCredential || appPassword !== ""}
                            title={appPassword !== "" ? "Save your changes first" : ""}
                            className="h-11 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-3.5 w-3.5" /> Test Config</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════════════ SECURITY TAB ════════════════ */}
                {activeTab === "security" && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center">
                          <ShieldCheck className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 leading-none">Security</h3>
                          <p className="text-xs text-gray-500 mt-1">Manage your account protection.</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* MFA */}
                        <div className="rounded-xl border border-gray-200 p-5">
                          <div className="flex items-center gap-3 mb-1">
                            <Lock className="h-4 w-4 text-gray-500" />
                            <h4 className="text-sm font-bold text-gray-900">Multi-Factor Authentication</h4>
                          </div>
                          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                            Add an extra layer of security with hardware keys or authenticator apps.
                          </p>
                          <button
                            type="button"
                            disabled
                            className="w-full h-10 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 font-semibold text-sm cursor-not-allowed"
                          >
                            Setup MFA — Coming Soon
                          </button>
                        </div>

                        {/* Active Sessions */}
                        <div className="rounded-xl border border-gray-200 p-5">
                          <div className="flex items-center gap-3 mb-1">
                            <Monitor className="h-4 w-4 text-gray-500" />
                            <h4 className="text-sm font-bold text-gray-900">Active Sessions</h4>
                          </div>
                          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                            Manage and revoke access for devices logged into your account.
                          </p>
                          <button
                            type="button"
                            disabled
                            className="w-full h-10 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 font-semibold text-sm cursor-not-allowed"
                          >
                            View Active Sessions — Coming Soon
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
