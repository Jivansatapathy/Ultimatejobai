import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, ChevronDown, Menu, X, LogIn, Loader2, LogOut, Crown,
  LayoutDashboard, FileText, Search, Users, BrainCircuit,
  Sparkles, Settings as SettingsIcon, Inbox, ChevronRight,
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
  { name: "Hizorex OS", href: "/hizorex-os", icon: BrainCircuit },
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
  const { isAuthenticated, logout, userEmail } = useAuth();
  const { pathname } = useLocation();
  const isHome = pathname === "/" || pathname === "/v2";
  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
      setMenuOpen(false);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
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
            <nav className="hidden lg:flex items-center gap-1 flex-1">
              {isAuthenticated ? (
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
            <div className="hidden lg:flex items-center gap-2 shrink-0">
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

            {/* Mobile/tablet hamburger */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="lg:hidden flex items-center justify-center h-9 w-9 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              aria-label="Open menu"
            >
              <Menu className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile/tablet drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={closeMenu}
            />

            {/* Drawer panel — slides in from right */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-[70] w-80 max-w-[90vw] bg-white shadow-2xl lg:hidden flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <Link to="/" onClick={closeMenu} className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-[1.05rem] font-extrabold tracking-tight text-gray-900">Hizorex</span>
                </Link>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer body — scrollable */}
              <div className="flex-1 overflow-y-auto py-4 px-3">
                {isAuthenticated ? (
                  <>
                    {/* User info */}
                    {userEmail && (
                      <div className="mb-4 px-3 py-3 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                          {userEmail.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{userEmail}</p>
                          <p className="text-[11px] text-blue-500 font-medium">Logged in</p>
                        </div>
                      </div>
                    )}

                    {/* Nav section */}
                    <p className="px-3 mb-2 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Navigation</p>
                    <div className="space-y-0.5 mb-4">
                      {AUTH_NAV.map((link) => (
                        <Link
                          key={link.href}
                          to={link.href}
                          onClick={closeMenu}
                          className={`flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                            isActive(link.href)
                              ? "bg-blue-50 text-blue-600 border border-blue-100"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                              isActive(link.href) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                            }`}>
                              <link.icon className="h-4 w-4" />
                            </span>
                            {link.name}
                          </span>
                          <ChevronRight className={`h-3.5 w-3.5 transition-colors ${isActive(link.href) ? "text-blue-400" : "text-gray-300"}`} />
                        </Link>
                      ))}
                    </div>

                    {/* Account section */}
                    <p className="px-3 mb-2 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Account</p>
                    <div className="space-y-0.5">
                      {AUTH_SIDE.map((link) => (
                        <Link
                          key={link.href}
                          to={link.href}
                          onClick={closeMenu}
                          className={`flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                            isActive(link.href)
                              ? "bg-blue-50 text-blue-600 border border-blue-100"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                              isActive(link.href) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                            }`}>
                              <link.icon className="h-4 w-4" />
                            </span>
                            {link.name}
                          </span>
                          <ChevronRight className={`h-3.5 w-3.5 transition-colors ${isActive(link.href) ? "text-blue-400" : "text-gray-300"}`} />
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-0.5 mb-4">
                      <Link to="/" onClick={closeMenu} className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${isHome ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"}`}>Home</Link>
                      <Link to="/find-jobs" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">Browse Jobs</Link>
                      {CATEGORIES.map(c => (
                        <Link key={c.href} to={c.href} onClick={closeMenu} className="flex items-center gap-3 px-6 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-all">{c.label}</Link>
                      ))}
                      <a href="/v2#pricing" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">Pricing</a>
                      <Link
                        to="/hizorex-os"
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 transition-all"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white">
                          <Crown className="h-4 w-4" />
                        </span>
                        Hizorex AI — Executive OS
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {/* Drawer footer */}
              <div className="px-4 py-4 border-t border-gray-100 space-y-3">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={signingOut}
                    className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-red-50 border border-red-100 text-sm font-bold text-red-600 hover:bg-red-100 transition-all disabled:opacity-60 disabled:cursor-wait"
                  >
                    {signingOut
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <LogOut className="h-4 w-4" />
                    }
                    {signingOut ? "Signing out…" : "Sign Out"}
                  </button>
                ) : (
                  <>
                    <Link to="/auth" onClick={closeMenu}>
                      <button type="button" className="w-full h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                        Sign In
                      </button>
                    </Link>
                    <Link to="/auth?mode=signup" onClick={closeMenu}>
                      <button type="button" className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors">
                        Get Started Free
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
