import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bot, ChevronDown, Menu, X, LogIn, Loader2, LogOut, Crown,
  LayoutDashboard, FileText, Search, Users, BrainCircuit,
  Sparkles, Settings as SettingsIcon, Inbox,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES = [
  { label: "C-Suite Roles", href: "/find-jobs?seniority=C-Suite" },
  { label: "VP Level", href: "/find-jobs?seniority=VP" },
  { label: "Director Roles", href: "/find-jobs?seniority=Director" },
  { label: "Fractional Roles", href: "/fractional-jobs" },
  { label: "All Executive Jobs", href: "/find-jobs" },
];

const AUTH_NAV = [
  { name: "Dashboard", href: "/dashboard",  icon: LayoutDashboard },
  { name: "Find Jobs",  href: "/find-jobs",  icon: Search },
  { name: "Resume",     href: "/resume",     icon: FileText },
  { name: "Interview",  href: "/interview",  icon: Users },
  { name: "AI Mentor",  href: "/hizorex-os", icon: BrainCircuit },
  { name: "Inbox",      href: "/inbox",      icon: Inbox },
];

const AUTH_SIDE = [
  { name: "Plans",    href: "/plans",    icon: Sparkles },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

export const NavbarV2 = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { pathname } = useLocation();
  const isHome = pathname === "/" || pathname === "/v2";
  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="text-[1.05rem] font-extrabold tracking-tight text-gray-900">
              Hizorex
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {isAuthenticated ? (
              /* Authenticated: show full app nav */
              AUTH_NAV.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <link.icon className="h-3.5 w-3.5 shrink-0" />
                  {link.name}
                </Link>
              ))
            ) : (
              /* Public: Home, Categories, For Employers, Pricing, Hizorex AI */
              <>
                <Link
                  to="/"
                  className={`px-4 py-2 text-sm font-semibold transition-colors ${
                    isHome
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50"
                  }`}
                >
                  Home
                </Link>

                <div
                  className="relative"
                  onMouseEnter={() => setCatOpen(true)}
                  onMouseLeave={() => setCatOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => setCatOpen(!catOpen)}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
                  >
                    Categories <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  {catOpen && <div className="absolute top-full left-0 right-0 h-2" />}
                  {catOpen && (
                    <div className="absolute top-[calc(100%+4px)] left-0 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                      {CATEGORIES.map(c => (
                        <Link
                          key={c.href}
                          to={c.href}
                          onClick={() => setCatOpen(false)}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  to="/employer/auth"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
                >
                  For Employers
                </Link>
                <a
                  href="/v2#pricing"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
                >
                  Pricing
                </a>
                <Link
                  to="/hizorex-os"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-violet-700 hover:text-violet-900 transition-colors rounded-lg hover:bg-violet-50"
                >
                  <Crown className="h-3.5 w-3.5" />
                  Hizorex AI
                </Link>
              </>
            )}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/find-jobs"
                  className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors"
                >
                  Browse Jobs
                </Link>
                <Link
                  to="/auth"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                {AUTH_SIDE.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <link.icon className="h-3.5 w-3.5" />
                    {link.name}
                  </Link>
                ))}
                <div className="mx-1 h-5 w-px bg-gray-200" />
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={signingOut}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-wait"
                >
                  {signingOut
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <LogOut className="h-3.5 w-3.5" />
                  }
                  {signingOut ? "Signing out…" : "Sign Out"}
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          {isAuthenticated ? (
            <>
              <p className="px-3 pt-1 pb-2 text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">
                Navigation
              </p>
              {AUTH_NAV.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-semibold transition-all ${
                    isActive(link.href)
                      ? "bg-blue-50 text-blue-600 border border-blue-100"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    isActive(link.href) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    <link.icon className="h-4 w-4" />
                  </div>
                  {link.name}
                </Link>
              ))}

              <div className="pt-3 pb-1">
                <p className="px-3 pb-2 text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">
                  Account
                </p>
                {AUTH_SIDE.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-semibold transition-all ${
                      isActive(link.href)
                        ? "bg-blue-50 text-blue-600 border border-blue-100"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isActive(link.href) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      <link.icon className="h-4 w-4" />
                    </div>
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  disabled={signingOut}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-[14px] font-semibold text-red-500 hover:bg-red-50 transition-all disabled:opacity-60 disabled:cursor-wait"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                    {signingOut
                      ? <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
                      : <LogOut className="h-4 w-4 text-red-500" />
                    }
                  </div>
                  {signingOut ? "Signing out…" : "Sign Out"}
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/" onClick={() => setMenuOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-semibold ${isHome ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:bg-gray-50"}`}>Home</Link>
              <Link to="/find-jobs" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Browse Jobs</Link>
              {CATEGORIES.map(c => (
                <Link key={c.href} to={c.href} onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 pl-6">{c.label}</Link>
              ))}
              <a href="/v2#pricing" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Pricing</a>
              <Link to="/hizorex-os" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors">
                <Crown className="h-3.5 w-3.5" />
                Hizorex AI — Executive OS
              </Link>
              <div className="pt-3 flex flex-col gap-2 border-t border-gray-100 mt-2">
                <Link to="/auth" onClick={() => setMenuOpen(false)}>
                  <button type="button" className="w-full h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Sign In</button>
                </Link>
                <Link to="/auth?mode=signup" onClick={() => setMenuOpen(false)}>
                  <button type="button" className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors">Get Started Free</button>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};
