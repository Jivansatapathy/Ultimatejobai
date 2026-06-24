import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Crown, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { useVenusAuth } from "@/context/VenusAuthContext";

export default function VenusAuth() {
  const { login } = useVenusAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = (location.state as any)?.from?.pathname || "/venus";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) { setError("Enter your email and password."); return; }
    try {
      setLoading(true);
      await login(email.trim().toLowerCase(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.non_field_errors?.[0];
      setError(msg || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes va-float { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-10px) rotate(1deg)} }
        @keyframes va-shine {
          0%  {background-position:-200% center}
          100%{background-position: 200% center}
        }
        @keyframes va-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes va-pulse-ring {
          0%  {transform:scale(.95);opacity:.6}
          100%{transform:scale(1.7);opacity:0}
        }
        .va-float  { animation: va-float 4s ease-in-out infinite; }
        .va-shine  {
          background: linear-gradient(90deg,#93c5fd 0%,#e0e7ff 35%,#ffffff 50%,#e0e7ff 65%,#93c5fd 100%);
          background-size: 200% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text;
          animation: va-shine 3s linear infinite;
        }
        .va-in  { animation: va-in .7s ease-out both; }
        .va-in2 { animation: va-in .7s ease-out .15s both; }
        .va-in3 { animation: va-in .7s ease-out .28s both; }
        .va-ring { animation: va-pulse-ring 2.4s ease-out infinite; }
        .va-ring2{ animation: va-pulse-ring 2.4s ease-out .8s infinite; }
      `}</style>

      <div
        className="min-h-screen flex select-none overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 80% 70% at 50% -5%, #1e3a5f 0%, #0f172a 55%, #020617 100%)' }}
      >
        {/* Left panel — branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-16 relative">

          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(59,130,246,.08) 0%, transparent 70%)' }} />

          {/* Stars */}
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width:  `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                top:    `${Math.random() * 90}%`,
                left:   `${Math.random() * 90}%`,
                opacity: Math.random() * 0.5 + 0.1,
              }}
            />
          ))}

          {/* Logo + headline */}
          <div className="relative text-center">
            <div className="relative inline-flex mb-8">
              <div className="va-ring  absolute inset-0 rounded-3xl border border-blue-400/30" />
              <div className="va-ring2 absolute inset-0 rounded-3xl border border-blue-400/20" />
              <div
                className="va-float relative w-24 h-24 rounded-3xl flex items-center justify-center"
                style={{ background: 'linear-gradient(140deg, #1d4ed8 0%, #312e81 100%)', boxShadow: '0 24px 64px rgba(59,130,246,.35), inset 0 1px 0 rgba(255,255,255,.15)' }}
              >
                <div className="absolute inset-0 rounded-3xl" style={{ background: 'linear-gradient(150deg, rgba(255,255,255,.2) 0%, transparent 55%)' }} />
                <Crown className="h-12 w-12 text-white relative z-10 drop-shadow" />
              </div>
            </div>

            <h1 className="va-shine text-5xl font-black tracking-tight leading-none mb-3">Venus AI</h1>
            <p className="text-blue-200/70 text-base font-medium tracking-wide mb-8">
              Executive Career Operating System
            </p>

            <div className="flex flex-col gap-3 text-left max-w-xs mx-auto">
              {[
                "Exclusive executive opportunities",
                "Compensation & equity intelligence",
                "AI career twin & personal branding",
              ].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 border border-blue-500/30">
                    <Sparkles className="h-2.5 w-2.5 text-blue-400" />
                  </div>
                  <span className="text-sm text-slate-400">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom tag */}
          <p className="absolute bottom-8 text-[11px] text-slate-600 tracking-widest uppercase font-semibold">
            Hizorex · Powered by Apex™
          </p>
        </div>

        {/* Right panel — form */}
        <div className="flex flex-1 flex-col items-center justify-center p-6 lg:p-16">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-black text-white">Venus AI</span>
          </div>

          <div className="w-full max-w-sm">

            <div className="va-in mb-8">
              <h2 className="text-2xl font-black text-white mb-1">Sign in to Venus</h2>
              <p className="text-sm text-slate-400">Access your executive career command centre.</p>
            </div>

            <form onSubmit={handleSubmit} className="va-in2 space-y-4">

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="h-11 w-full rounded-xl border border-white/8 bg-white/5 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/60 focus:bg-white/8 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 w-full rounded-xl border border-white/8 bg-white/5 px-4 pr-11 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/60 focus:bg-white/8 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 h-11 w-full rounded-xl font-bold text-sm text-white disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                style={{ background: loading ? '#1e3a8a' : 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)', boxShadow: loading ? 'none' : '0 8px 24px rgba(59,130,246,.35)' }}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
                {loading ? "Signing in…" : "Enter Venus"}
              </button>
            </form>

            <p className="va-in3 mt-8 text-center text-xs text-slate-600">
              Venus uses your existing Hizorex credentials.
              <br />
              Don't have an account?{" "}
              <a href="/auth" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                Sign up on Hizorex
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
