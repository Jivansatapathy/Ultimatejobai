import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Bot, CheckCircle2, XCircle, Clock, Search, ChevronDown,
  ChevronRight, ExternalLink, RefreshCw, AlertTriangle, Loader2,
  TrendingUp, Filter, X, ShieldAlert, Eye, EyeOff,
  Users, ArrowLeft, Calendar, Mail, Shield, Briefcase, Send,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { toast } from "sonner";

// ─── Hardcoded superadmin credentials (frontend gate only) ───────────────────
// The backend API endpoints are still protected by Django IsAdminUser.
const SA_EMAIL = "superadmin@hizorex.com";
const SA_PASS  = "Superadmin@123";
const SA_KEY   = "_sa_unlocked";

// ─── Login gate component ─────────────────────────────────────────────────────

function SuperAdminLogin({ onUnlock }: { onUnlock: () => void }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (email.trim().toLowerCase() !== SA_EMAIL || password !== SA_PASS) {
      setError("Invalid credentials.");
      return;
    }
    setLoading(true);
    try {
      // Log into Django — required so API calls have a valid staff token
      const { data } = await api.post("/api/auth/login/", { email: email.trim(), password });
      if (!data.access) {
        setError("Login succeeded but no token returned. Contact support.");
        return;
      }
      localStorage.setItem("access_token",  data.access);
      localStorage.setItem("refresh_token", data.refresh || "");
      localStorage.setItem("is_admin", (data.is_admin || data.is_staff) ? "true" : "false");
      localStorage.setItem("current_user_email", data.email || email.trim());
      sessionStorage.setItem(SA_KEY, "1");
      onUnlock();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || "Login failed. Ensure the Django superadmin account exists.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg mb-4">
            <ShieldAlert className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Superadmin Access</h1>
          <p className="text-gray-500 text-sm mt-1">Hizorex internal dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="superadmin@hizorex.com"
              required
              autoComplete="username"
              className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 pr-11 text-sm text-white placeholder:text-gray-600 outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-900/40 border border-red-800 px-3 py-2 text-sm text-red-400 font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Signing in…" : "Access Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface BotSummary {
  total: number;
  submitted: number;
  failed: number;
  cancelled: number;
  in_progress: number;
  queued: number;
}

interface BotTaskUser {
  id: number;
  email: string;
  full_name: string;
}

interface BotTask {
  id: string;
  user: BotTaskUser;
  job_url: string;
  job_title: string;
  job_company: string;
  status: string;
  error_reason: string;
  filled_count: number;
  unfilled_count: number;
  unfilled_fields: string[];
  created_at: string;
  updated_at: string;
}

interface BotTasksPage {
  count: number;
  page: number;
  pages: number;
  results: BotTask[];
}

interface AdminUser {
  id: number;
  email: string;
  username: string;
  full_name: string;
  interviews: number;
  applications: number;
  bot_tasks: number;
  date_joined: string;
  is_staff: boolean;
  is_active: boolean;
}

interface UserDetail {
  id: number;
  email: string;
  full_name: string;
  date_joined: string;
  is_staff: boolean;
  is_active: boolean;
  bot_task_count: number;
  bot_tasks: BotTask[];
}

type ReviewStatus = "pending" | "approved" | "rejected";

const SENIORITY_LEVEL_OPTIONS = [
  "C-Suite", "SVP", "VP", "Director", "Managing Director",
  "Head of", "Executive", "General Manager", "Senior", "Manager",
] as const;

interface JobRequestMessage {
  id: string;
  message: string;
  sender: string | null;
  is_from_employer: boolean;
  created_at: string;
}

interface JobRequest {
  id: string;
  title: string;
  description: string | null;
  company: string;
  location: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  employment_type: string | null;
  workplace_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  skills: string[];
  created_by: string | null;
  review_status: ReviewStatus;
  admin_seniority_level: string | null;
  suggested_seniority_level: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  messages: JobRequestMessage[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "queued", label: "Queued" },
  { value: "pending", label: "Pending" },
  { value: "opening", label: "Opening" },
  { value: "filling", label: "Filling" },
  { value: "solving_captcha", label: "Solving CAPTCHA" },
  { value: "preview_ready", label: "Preview Ready" },
  { value: "confirmed", label: "Confirmed" },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  submitted:      { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
  failed:         { bg: "bg-red-50",      text: "text-red-700",     dot: "bg-red-500" },
  cancelled:      { bg: "bg-gray-100",    text: "text-gray-500",    dot: "bg-gray-400" },
  queued:         { bg: "bg-blue-50",     text: "text-blue-700",    dot: "bg-blue-500" },
  pending:        { bg: "bg-blue-50",     text: "text-blue-700",    dot: "bg-blue-400" },
  opening:        { bg: "bg-yellow-50",   text: "text-yellow-700",  dot: "bg-yellow-500" },
  filling:        { bg: "bg-yellow-50",   text: "text-yellow-700",  dot: "bg-yellow-500" },
  solving_captcha:{ bg: "bg-orange-50",   text: "text-orange-700",  dot: "bg-orange-500" },
  captcha_detected:{ bg: "bg-orange-50",  text: "text-orange-700",  dot: "bg-orange-500" },
  preview_ready:  { bg: "bg-violet-50",   text: "text-violet-700",  dot: "bg-violet-500" },
  confirmed:      { bg: "bg-indigo-50",   text: "text-indigo-700",  dot: "bg-indigo-500" },
};

function statusStyle(s: string) {
  return STATUS_STYLES[s] ?? { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
}

function relativeTime(iso: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number; icon: React.ElementType; color: string;
}) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm`}>
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-900">{value.toLocaleString()}</p>
        <p className="text-sm text-gray-400 font-medium">{label}</p>
      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = statusStyle(status);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── Task row (expandable) ────────────────────────────────────────────────────

function TaskRow({ task }: { task: BotTask }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        {/* User */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
              {(task.user.full_name || task.user.email).slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">
                {task.user.full_name || "—"}
              </p>
              <p className="text-xs text-gray-400 truncate max-w-[160px]">{task.user.email}</p>
            </div>
          </div>
        </td>

        {/* Job */}
        <td className="px-4 py-3">
          <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
            {task.job_title || "Untitled"}
          </p>
          <p className="text-xs text-gray-400 truncate max-w-[200px]">{task.job_company}</p>
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          <StatusBadge status={task.status} />
        </td>

        {/* Fields */}
        <td className="px-4 py-3 text-center">
          <span className="text-sm font-bold text-emerald-600">{task.filled_count}</span>
          <span className="text-gray-300 mx-1">/</span>
          <span className="text-sm font-bold text-red-500">{task.unfilled_count}</span>
        </td>

        {/* Error */}
        <td className="px-4 py-3 max-w-[150px]">
          {task.error_reason ? (
            <span className="text-xs text-red-600 font-medium truncate block" title={task.error_reason}>
              {task.error_reason}
            </span>
          ) : (
            <span className="text-xs text-gray-300">—</span>
          )}
        </td>

        {/* Time */}
        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
          {relativeTime(task.created_at)}
        </td>

        {/* Expand arrow */}
        <td className="px-3 py-3 text-gray-300">
          {open
            ? <ChevronDown className="h-4 w-4 text-blue-500" />
            : <ChevronRight className="h-4 w-4" />
          }
        </td>
      </tr>

      {/* Expanded detail row */}
      {open && (
        <tr className="bg-blue-50/50 border-b border-blue-100">
          <td colSpan={7} className="px-6 py-4">
            <div className="grid md:grid-cols-2 gap-6">

              {/* Left */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Task Detail</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-24 shrink-0">Task ID</span>
                    <span className="font-mono text-xs text-gray-600 break-all">{task.id}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-24 shrink-0">User ID</span>
                    <span className="text-gray-700 font-medium">{task.user.id}</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="text-gray-400 w-24 shrink-0">Job URL</span>
                    <a
                      href={task.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-blue-600 hover:underline flex items-center gap-1 text-xs break-all"
                    >
                      {task.job_url.length > 60 ? task.job_url.slice(0, 60) + "…" : task.job_url}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-24 shrink-0">Created</span>
                    <span className="text-gray-700">{new Date(task.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-24 shrink-0">Updated</span>
                    <span className="text-gray-700">{new Date(task.updated_at).toLocaleString()}</span>
                  </div>
                  {task.error_reason && (
                    <div className="flex gap-2 items-start">
                      <span className="text-gray-400 w-24 shrink-0">Error</span>
                      <span className="text-red-600 font-medium">{task.error_reason}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Unfilled Fields ({task.unfilled_count})
                </h4>
                {task.unfilled_fields.length === 0 ? (
                  <p className="text-sm text-gray-400">None — all fields filled.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {task.unfilled_fields.map((f, i) => (
                      <span key={i} className="rounded-lg bg-red-50 border border-red-100 px-2.5 py-1 text-xs font-medium text-red-600">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SuperAdmin() {
  const { loading: authLoading } = useAuth();

  const [unlocked, setUnlocked] = useState(false); // always start locked; validate before unlocking

  // On mount: if session key exists, verify the stored token is actually a staff account
  useEffect(() => {
    if (sessionStorage.getItem(SA_KEY) !== "1") return;
    const token = localStorage.getItem("access_token");
    if (!token) {
      sessionStorage.removeItem(SA_KEY);
      return;
    }
    // Quick check: hit the summary endpoint; if it succeeds the token is valid + staff
    api.get("/api/admin/dashboard/bot/summary/")
      .then(() => setUnlocked(true))
      .catch(() => {
        // Token invalid or not staff — force re-login
        sessionStorage.removeItem(SA_KEY);
      });
  }, []);

  const handleUnlock = () => {
    setUnlocked(true);
  };

  if (!unlocked) {
    return <SuperAdminLogin onUnlock={handleUnlock} />;
  }

  return <SuperAdminDashboard authLoading={authLoading} />;
}

// ─── User detail panel ────────────────────────────────────────────────────────

function UserDetailPanel({ userId, onBack }: { userId: number; onBack: () => void }) {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api.get(`/api/admin/dashboard/users/${userId}/`)
      .then(r => setDetail(r.data))
      .catch(e => setError(e?.response?.data?.error || "Failed to load user."))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
    </div>
  );

  if (error || !detail) return (
    <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">{error || "User not found."}</div>
  );

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Users
      </button>

      {/* User card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col sm:flex-row items-start gap-5">
        <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-extrabold shrink-0">
          {(detail.full_name || detail.email).slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-extrabold text-gray-900">{detail.full_name || "—"}</h2>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" />{detail.email}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />Joined {new Date(detail.date_joined).toLocaleDateString()}</span>
            <span className="flex items-center gap-1.5"><Bot className="h-4 w-4" />{detail.bot_task_count} bot tasks</span>
            {detail.is_staff && <span className="flex items-center gap-1.5 text-blue-600 font-bold"><Shield className="h-4 w-4" />Staff</span>}
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${detail.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
          {detail.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Bot tasks */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <Bot className="h-5 w-5 text-blue-600" />
          <h3 className="font-extrabold text-gray-900">Bot Applications</h3>
          <span className="ml-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600">{detail.bot_task_count}</span>
        </div>

        {detail.bot_tasks.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-400">
            <Bot className="h-10 w-10 mb-3 opacity-20" />
            <p className="text-sm font-medium">No bot tasks yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Job</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400 text-center">Filled / Unfilled</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Error</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">When</th>
                </tr>
              </thead>
              <tbody>
                {detail.bot_tasks.map(t => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{t.job_title || "Untitled"}</p>
                      <a href={t.job_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-500 hover:underline truncate max-w-[200px]">
                        {t.job_company} <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-bold text-emerald-600">{t.filled_count}</span>
                      <span className="text-gray-300 mx-1">/</span>
                      <span className="text-sm font-bold text-red-500">{t.unfilled_count}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[150px]">
                      {t.error_reason
                        ? <span className="text-xs text-red-600 font-medium truncate block" title={t.error_reason}>{t.error_reason}</span>
                        : <span className="text-xs text-gray-300">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{relativeTime(t.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Users list ───────────────────────────────────────────────────────────────

function UsersTab({ onSelectUser }: { onSelectUser: (id: number) => void }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/api/admin/dashboard/users/")
      .then(r => setUsers(r.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    !search || u.email.toLowerCase().includes(search.toLowerCase()) || (u.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 flex-1">
          <Users className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-extrabold text-gray-900">Registered Users</h2>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600">{users.length}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-blue-400 focus-within:bg-white transition-all">
          <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by email or name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-48 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">User</th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400 text-center">Bot Tasks</th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400 text-center">Interviews</th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Joined</th>
              <th className="px-3 py-3"><span className="sr-only">Open</span></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {[1,2,3,4,5].map(j => (
                    <td key={j} className="px-4 py-4"><div className="h-4 rounded-lg bg-gray-100 animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">No users found.</td>
              </tr>
            ) : (
              filtered.map(u => (
                <tr
                  key={u.id}
                  className="border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer transition-colors"
                  onClick={() => onSelectUser(u.id)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                        {(u.full_name || u.email).slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{u.full_name || "—"}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-bold ${u.bot_tasks > 0 ? "text-blue-600" : "text-gray-300"}`}>{u.bot_tasks}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-bold ${u.interviews > 0 ? "text-indigo-600" : "text-gray-300"}`}>{u.interviews}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-400">{new Date(u.date_joined).toLocaleDateString()}</span>
                    {u.is_staff && <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600">Staff</span>}
                  </td>
                  <td className="px-3 py-3 text-gray-300">
                    <ChevronRight className="h-4 w-4" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Job listing requests ───────────────────────────────────────────────────────

const jobReviewStatusColors: Record<ReviewStatus, string> = {
  pending:  "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

function JobRequestsTab({ onSelectJob }: { onSelectJob: (job: JobRequest) => void }) {
  const [statusFilter, setStatusFilter] = useState<ReviewStatus>("pending");
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<JobRequest[]>("/api/admin/dashboard/job-requests/", { params: { status: statusFilter } })
      .then(r => setJobs(r.data))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 flex-1">
          <Briefcase className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-extrabold text-gray-900">Job Listing Requests</h2>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600">{jobs.length}</span>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
          {(["pending", "approved", "rejected"] as const).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                statusFilter === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Job</th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Company</th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Posted By</th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Suggested</th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Created</th>
              <th className="px-3 py-3"><span className="sr-only">Open</span></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {[1, 2, 3, 4, 5].map(j => (
                    <td key={j} className="px-4 py-4"><div className="h-4 rounded-lg bg-gray-100 animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">No {statusFilter} job requests.</td>
              </tr>
            ) : (
              jobs.map(job => (
                <tr
                  key={job.id}
                  className="border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer transition-colors"
                  onClick={() => onSelectJob(job)}
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">{job.title}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{job.company}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{job.created_by || "—"}</td>
                  <td className="px-4 py-3">
                    {job.suggested_seniority_level
                      ? <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-bold text-violet-700">{job.suggested_seniority_level}</span>
                      : <span className="text-xs text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">{relativeTime(job.created_at)}</td>
                  <td className="px-3 py-3 text-gray-300">
                    <ChevronRight className="h-4 w-4" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function JobRequestDetailPanel({ job: initialJob, onBack }: { job: JobRequest; onBack: () => void }) {
  const [job, setJob] = useState(initialJob);
  const [seniorityLevel, setSeniorityLevel] = useState(initialJob.admin_seniority_level || initialJob.suggested_seniority_level || "");
  const [rejectReason, setRejectReason] = useState("");
  const [clarification, setClarification] = useState("");
  const [busy, setBusy] = useState<"approve" | "reject" | "message" | null>(null);
  const [showRejectBox, setShowRejectBox] = useState(false);

  const handleApprove = async () => {
    if (!seniorityLevel) { toast.error("Pick a seniority category first."); return; }
    setBusy("approve");
    try {
      const { data } = await api.post<JobRequest>(`/api/admin/dashboard/job-requests/${job.id}/approve/`, { seniority_level: seniorityLevel });
      setJob(data);
      toast.success("Job approved and published.");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to approve job.");
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error("A rejection reason is required."); return; }
    setBusy("reject");
    try {
      const { data } = await api.post<JobRequest>(`/api/admin/dashboard/job-requests/${job.id}/reject/`, { message: rejectReason.trim() });
      setJob(data);
      setRejectReason("");
      setShowRejectBox(false);
      toast.success("Job rejected.");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to reject job.");
    } finally {
      setBusy(null);
    }
  };

  const handleSendMessage = async () => {
    if (!clarification.trim()) return;
    setBusy("message");
    try {
      const { data } = await api.post<JobRequest>(`/api/admin/dashboard/job-requests/${job.id}/message/`, { message: clarification.trim() });
      setJob(data);
      setClarification("");
      toast.success("Message sent to employer.");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to send message.");
    } finally {
      setBusy(null);
    }
  };

  const salaryLabel = job.salary_min || job.salary_max
    ? `${job.salary_currency || "USD"} ${job.salary_min ?? "?"} – ${job.salary_max ?? "?"}`
    : null;

  return (
    <div className="space-y-6">
      <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Job Requests
      </button>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${jobReviewStatusColors[job.review_status]}`}>
              {job.review_status}
            </span>
            <h2 className="mt-2 text-xl font-extrabold text-gray-900">{job.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{job.company} · {job.created_by || "unknown"}</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            {[job.city, job.region, job.country].filter(Boolean).join(", ") || job.location}
            {salaryLabel && <p className="font-bold text-emerald-600 mt-1">{salaryLabel}</p>}
          </div>
        </div>

        {job.description && (
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap border-t border-gray-100 pt-4">{job.description}</p>
        )}

        {job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.skills.map(s => (
              <span key={s} className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">{s}</span>
            ))}
          </div>
        )}
      </div>

      {/* Categorize + approve/reject */}
      {job.review_status === "pending" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
          <h3 className="font-extrabold text-gray-900">Review Decision</h3>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Seniority Category</label>
            <select
              value={seniorityLevel}
              onChange={e => setSeniorityLevel(e.target.value)}
              className="w-full max-w-xs rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400"
            >
              <option value="">Select a category…</option>
              {SENIORITY_LEVEL_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {job.suggested_seniority_level && (
              <p className="mt-1.5 text-xs text-gray-400">Suggested: {job.suggested_seniority_level}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleApprove}
              disabled={busy !== null}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-4 py-2.5 text-sm font-bold text-white transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" /> Approve
            </button>
            <button
              type="button"
              onClick={() => setShowRejectBox(v => !v)}
              disabled={busy !== null}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50 px-4 py-2.5 text-sm font-bold text-red-600 transition-colors"
            >
              <XCircle className="h-4 w-4" /> Reject
            </button>
          </div>

          {showRejectBox && (
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Rejection reason (sent to employer)</label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Explain why this listing is being rejected…"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-red-400"
              />
              <button
                type="button"
                onClick={handleReject}
                disabled={busy !== null}
                className="rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 text-sm font-bold text-white transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          )}
        </div>
      )}

      {/* Message thread */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
        <h3 className="font-extrabold text-gray-900">Messages</h3>
        {job.messages.length === 0 ? (
          <p className="text-sm text-gray-400">No messages yet.</p>
        ) : (
          <div className="space-y-3">
            {job.messages.map(m => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-xl p-3.5 ${
                  m.is_from_employer ? "bg-emerald-50 border border-emerald-100" : "ml-auto bg-blue-600 text-white"
                }`}
              >
                <p className="text-sm leading-relaxed">{m.message}</p>
                <p className={`mt-1.5 text-xs ${m.is_from_employer ? "text-emerald-600" : "text-blue-100"}`}>
                  {m.is_from_employer ? `Employer (${m.sender || "unknown"})` : (m.sender || "Admin")} · {relativeTime(m.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 border-t border-gray-100 pt-4">
          <input
            type="text"
            value={clarification}
            onChange={e => setClarification(e.target.value)}
            placeholder="Ask for clarification…"
            className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400"
            onKeyDown={e => { if (e.key === "Enter") handleSendMessage(); }}
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={busy !== null || !clarification.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2.5 text-sm font-bold text-white transition-colors"
          >
            <Send className="h-3.5 w-3.5" /> Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function SuperAdminDashboard({ authLoading }: { authLoading: boolean }) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"tasks" | "users" | "job_requests">("tasks");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedJobRequest, setSelectedJobRequest] = useState<JobRequest | null>(null);

  const [summary, setSummary] = useState<BotSummary | null>(null);
  const [summaryError, setSummaryError] = useState("");
  const [taskPage, setTaskPage] = useState<BotTasksPage | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");

  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    setSummaryError("");
    try {
      const { data } = await api.get("/api/admin/dashboard/bot/summary/");
      setSummary(data);
    } catch (err: any) {
      setSummary(null);
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail || err?.message || "Unknown error";
      setSummaryError(`${status ? `HTTP ${status}: ` : ""}${detail}`);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoadingTasks(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterStatus) params.set("status", filterStatus);
      params.set("page", String(page));
      const { data } = await api.get<BotTasksPage>(`/api/admin/dashboard/bot/tasks/?${params}`);
      setTaskPage(data);
    } catch {
      setTaskPage(null);
    } finally {
      setLoadingTasks(false);
    }
  }, [search, filterStatus, page]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);
  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  if (authLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
  }

  const handleSignOut = () => {
    sessionStorage.removeItem(SA_KEY);
    navigate(0); // reload page to show login again
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="font-extrabold text-gray-900 tracking-tight">
              Hizorex <span className="text-blue-600">Superadmin</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { fetchSummary(); fetchTasks(); }}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
            <Link
              to="/admin"
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Admin Dashboard
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 w-fit">
          {(["tasks", "users", "job_requests"] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => { setActiveTab(tab); setSelectedUserId(null); setSelectedJobRequest(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "tasks" ? <Bot className="h-4 w-4" /> : tab === "users" ? <Users className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
              {tab === "tasks" ? "Bot Tasks" : tab === "users" ? "Users" : "Job Listing Requests"}
            </button>
          ))}
        </div>

        {/* ── Stats (always visible) ── */}
        {loadingSummary ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-white border animate-pulse" />
            ))}
          </div>
        ) : summaryError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600 font-medium">
            Failed to load summary stats — <span className="font-mono">{summaryError}</span>
          </div>
        ) : summary ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Total Tasks"   value={summary.total}       icon={Bot}          color="bg-blue-600" />
            <StatCard label="Submitted"     value={summary.submitted}   icon={CheckCircle2} color="bg-emerald-500" />
            <StatCard label="Failed"        value={summary.failed}      icon={XCircle}      color="bg-red-500" />
            <StatCard label="In Progress"   value={summary.in_progress} icon={TrendingUp}   color="bg-yellow-500" />
            <StatCard label="Queued"        value={summary.queued}      icon={Clock}        color="bg-indigo-500" />
            <StatCard label="Cancelled"     value={summary.cancelled}   icon={AlertTriangle}color="bg-gray-500" />
          </div>
        ) : null}

        {/* ── Tab content ── */}
        {activeTab === "users" ? (
          selectedUserId !== null
            ? <UserDetailPanel userId={selectedUserId} onBack={() => setSelectedUserId(null)} />
            : <UsersTab onSelectUser={(id) => { setSelectedUserId(id); }} />
        ) : null}

        {activeTab === "job_requests" ? (
          selectedJobRequest !== null
            ? <JobRequestDetailPanel job={selectedJobRequest} onBack={() => setSelectedJobRequest(null)} />
            : <JobRequestsTab onSelectJob={(job) => setSelectedJobRequest(job)} />
        ) : null}

        {/* ── Bot Tasks Table (tasks tab only) ── */}
        {activeTab === "tasks" && <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">

          {/* Table header / filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Bot className="h-5 w-5 text-blue-600 shrink-0" />
              <h2 className="text-base font-extrabold text-gray-900">Bot Applications</h2>
              {taskPage && (
                <span className="ml-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600">
                  {taskPage.count.toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex items-center gap-1.5">
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-blue-400 focus-within:bg-white transition-all">
                  <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Email, job title, company…"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    className="w-48 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
                  />
                  {searchInput && (
                    <button type="button" onClick={clearSearch} aria-label="Clear search" className="text-gray-300 hover:text-gray-500">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 transition-colors"
                >
                  Search
                </button>
              </form>

              {/* Status filter */}
              <div className="relative">
                <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                  <Filter className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <select
                    value={filterStatus}
                    onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                    aria-label="Filter by status"
                    className="bg-transparent text-sm text-gray-700 outline-none cursor-pointer pr-1"
                  >
                    {STATUS_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">User</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Job</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400 text-center">Filled / Unfilled</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Error</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">When</th>
                  <th className="px-3 py-3"><span className="sr-only">Expand row</span></th>
                </tr>
              </thead>
              <tbody>
                {loadingTasks ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {[1,2,3,4,5,6,7].map(j => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-4 rounded-lg bg-gray-100 animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : !taskPage || taskPage.results.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-gray-400">
                      <Bot className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium">No tasks found.</p>
                    </td>
                  </tr>
                ) : (
                  taskPage.results.map(task => <TaskRow key={task.id} task={task} />)
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {taskPage && taskPage.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
              <span className="text-sm text-gray-400">
                Page {taskPage.page} of {taskPage.pages} · {taskPage.count} tasks
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 disabled:opacity-40 hover:bg-gray-100 transition-colors"
                >
                  Prev
                </button>
                {Array.from({ length: Math.min(taskPage.pages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                        p === page
                          ? "bg-blue-600 text-white"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  type="button"
                  disabled={page >= taskPage.pages}
                  onClick={() => setPage(p => p + 1)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 disabled:opacity-40 hover:bg-gray-100 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>}

      </main>
    </div>
  );
}
