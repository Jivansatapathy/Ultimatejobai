import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { confirmPasswordReset } from "@/services/blogService";

export default function BlogAdminResetPassword() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (!uid || !token) {
      setError("This reset link is invalid.");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(uid, token, password);
      setDone(true);
      setTimeout(() => navigate("/blog-admin"), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "This reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white">Reset Password</h1>
            <p className="text-xs text-gray-400">Hizorex Blog Admin</p>
          </div>
        </div>

        {done ? (
          <div className="bg-gray-900 rounded-2xl p-7 border border-gray-800 space-y-4 text-center">
            <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto" />
            <p className="text-sm text-white font-semibold">Password updated</p>
            <p className="text-xs text-gray-400">Taking you to sign in…</p>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-gray-900 rounded-2xl p-7 border border-gray-800 space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950 rounded-xl px-4 py-2.5 border border-red-900">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">New password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoFocus
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Confirm new password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set new password"}
            </button>

            <Link
              to="/blog-admin"
              className="block text-center text-xs font-semibold text-gray-500 hover:text-white transition-colors"
            >
              Back to sign in
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  );
}
