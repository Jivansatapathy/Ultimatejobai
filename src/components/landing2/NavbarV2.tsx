import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, ChevronDown, Menu, X, LogIn, Loader2, LogOut, Crown,
  LayoutDashboard, FileText, Search, Users, BrainCircuit,
  Sparkles, Settings as SettingsIcon, Inbox, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const MEGA_COLS = [
  {
    dept: "Finance",
    color: "text-amber-600",
    roles: [
      { label: "CFO", href: "/executive-roles/cfo" },
      { label: "Controller", href: "/executive-roles/controller" },
      { label: "VP Finance", href: "/executive-roles/vp-finance" },
      { label: "Head of Finance", href: "/executive-roles/head-of-finance" },
    ],
  },
  {
    dept: "Technology",
    color: "text-sky-600",
    roles: [
      { label: "CTO", href: "/executive-roles/cto" },
      { label: "Head of Engineering", href: "/executive-roles/head-of-engineering" },
      { label: "Head of AI", href: "/executive-roles/head-of-ai" },
      { label: "Head of Data", href: "/executive-roles/head-of-data" },
      { label: "Head of DevOps", href: "/executive-roles/head-of-devops" },
    ],
  },
  {
    dept: "Sales & Marketing",
    color: "text-blue-600",
    roles: [
      { label: "CRO", href: "/executive-roles/cro" },
      { label: "CMO", href: "/executive-roles/cmo" },
      { label: "VP Sales", href: "/executive-roles/vp-sales" },
      { label: "Head of Sales", href: "/executive-roles/head-of-sales" },
      { label: "Head of Growth", href: "/executive-roles/head-of-growth" },
    ],
  },
  {
    dept: "Operations & HR",
    color: "text-emerald-600",
    roles: [
      { label: "COO", href: "/executive-roles/coo" },
      { label: "CHRO", href: "/executive-roles/chro" },
      { label: "CPO", href: "/executive-roles/cpo" },
      { label: "CISO", href: "/executive-roles/ciso" },
      { label: "CLO", href: "/executive-roles/clo" },
    ],
  },
];

const FRACTIONAL_MENU = [
  { label: "All Fractional Jobs", href: "/fractional-jobs", bold: true },
  { label: "Fractional CFO", href: "/fractional/cfo" },
  { label: "Fractional CTO", href: "/fractional/cto" },
  { label: "Fractional CMO", href: "/fractional/cmo" },
  { label: "Fractional COO", href: "/fractional/coo" },
  { label: "Browse All Fractional →", href: "/fractional", bold: true },
];

const STARTUP_MENU = [
  { label: "Startup CEO", href: "/startup/ceo" },
  { label: "Startup CTO", href: "/startup/cto" },
  { label: "Co-Founder", href: "/startup/co-founder" },
  { label: "Founding Engineer", href: "/startup/founding-engineer" },
  { label: "Startup CFO", href: "/startup/cfo" },
  { label: "Browse All Startup →", href: "/startup", bold: true },
];

const BOARD_MENU = [
  { label: "Board Member", href: "/board/board-member" },
  { label: "Board Chair", href: "/board/board-chair" },
  { label: "Independent Director", href: "/board/independent-director" },
  { label: "Board Advisor", href: "/board/board-advisor" },
  { label: "Browse All Board Roles →", href: "/board", bold: true },
];

const INVESTOR_MENU = [
  { label: "Managing Partner", href: "/investors/managing-partner" },
  { label: "General Partner", href: "/investors/general-partner" },
  { label: "Operating Partner", href: "/investors/operating-partner" },
  { label: "Portfolio CEO", href: "/investors/portfolio-ceo" },
  { label: "Browse All Investor Roles →", href: "/investors", bold: true },
];

const INTERIM_MENU = [
  { label: "All Interim Jobs", href: "/find-jobs?q=interim", bold: true },
  { label: "Interim CFO", href: "/interim/cfo" },
  { label: "Interim CTO", href: "/interim/cto" },
  { label: "Interim CMO", href: "/interim/cmo" },
  { label: "Interim COO", href: "/interim/coo" },
  { label: "Browse All Interim →", href: "/interim", bold: true },
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
  const [fracOpen, setFracOpen] = useState(false);
  const [startupOpen, setStartupOpen] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [investorOpen, setInvestorOpen] = useState(false);
  const [interimOpen, setInterimOpen] = useState(false);
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

                  {/* Executive Roles — Mega Menu */}
                  <div
                    className="relative"
                    onMouseEnter={() => setCatOpen(true)}
                    onMouseLeave={() => setCatOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => { setCatOpen(!catOpen); setFracOpen(false); setStartupOpen(false); setBoardOpen(false); setInvestorOpen(false); setInterimOpen(false); }}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
                    >
                      Executive Roles <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    {catOpen && <div className="absolute top-full left-0 right-0 h-2" />}
                    {catOpen && (
                      <div className="absolute top-[calc(100%+4px)] left-0 w-[640px] bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                        {/* Top: columns */}
                        <div className="grid grid-cols-4 gap-0 p-5 border-b border-gray-100">
                          {MEGA_COLS.map(col => (
                            <div key={col.dept}>
                              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${col.color}`}>{col.dept}</p>
                              <ul className="space-y-1">
                                {col.roles.map(r => (
                                  <li key={r.href}>
                                    <Link
                                      to={r.href}
                                      onClick={() => setCatOpen(false)}
                                      className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-2 py-1.5 transition-colors font-medium"
                                    >
                                      {r.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                        {/* Bottom: quick links */}
                        <div className="flex items-center gap-1 px-5 py-3 bg-gray-50 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mr-2">Also:</span>
                          {[
                            { label: "Fractional", href: "/fractional", color: "text-violet-700 bg-violet-50 border-violet-200" },
                            { label: "Interim", href: "/interim", color: "text-teal-700 bg-teal-50 border-teal-200" },
                            { label: "Startup", href: "/startup", color: "text-orange-700 bg-orange-50 border-orange-200" },
                            { label: "Board", href: "/board", color: "text-slate-700 bg-slate-100 border-slate-200" },
                            { label: "Investors / PE", href: "/investors", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
                            { label: "Salary Guide", href: "/salary", color: "text-gray-700 bg-gray-100 border-gray-200" },
                            { label: "Browse A–Z →", href: "/browse-roles", color: "text-blue-700 bg-blue-50 border-blue-200" },
                          ].map(l => (
                            <Link
                              key={l.href}
                              to={l.href}
                              onClick={() => setCatOpen(false)}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${l.color} hover:opacity-80 transition-opacity`}
                            >
                              {l.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fractional dropdown */}
                  <div
                    className="relative"
                    onMouseEnter={() => setFracOpen(true)}
                    onMouseLeave={() => setFracOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => { setFracOpen(!fracOpen); setCatOpen(false); setStartupOpen(false); setBoardOpen(false); setInvestorOpen(false); }}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
                    >
                      Fractional <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    {fracOpen && <div className="absolute top-full left-0 right-0 h-2" />}
                    {fracOpen && (
                      <div className="absolute top-[calc(100%+4px)] left-0 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                        {FRACTIONAL_MENU.map(c => (
                          <Link
                            key={c.href}
                            to={c.href}
                            onClick={() => setFracOpen(false)}
                            className={`block px-4 py-2.5 text-sm hover:bg-violet-50 hover:text-violet-700 transition-colors ${c.bold ? "font-bold text-violet-600" : "text-gray-700"}`}
                          >
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Startup dropdown */}
                  <div
                    className="relative"
                    onMouseEnter={() => setStartupOpen(true)}
                    onMouseLeave={() => setStartupOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => { setStartupOpen(!startupOpen); setCatOpen(false); setFracOpen(false); setBoardOpen(false); setInvestorOpen(false); }}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
                    >
                      Startup <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    {startupOpen && <div className="absolute top-full left-0 right-0 h-2" />}
                    {startupOpen && (
                      <div className="absolute top-[calc(100%+4px)] left-0 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                        {STARTUP_MENU.map(c => (
                          <Link
                            key={c.href}
                            to={c.href}
                            onClick={() => setStartupOpen(false)}
                            className={`block px-4 py-2.5 text-sm hover:bg-orange-50 hover:text-orange-700 transition-colors ${c.bold ? "font-bold text-orange-600" : "text-gray-700"}`}
                          >
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Board dropdown */}
                  <div
                    className="relative"
                    onMouseEnter={() => setBoardOpen(true)}
                    onMouseLeave={() => setBoardOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => { setBoardOpen(!boardOpen); setCatOpen(false); setFracOpen(false); setStartupOpen(false); setInvestorOpen(false); }}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
                    >
                      Board <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    {boardOpen && <div className="absolute top-full left-0 right-0 h-2" />}
                    {boardOpen && (
                      <div className="absolute top-[calc(100%+4px)] left-0 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                        {BOARD_MENU.map(c => (
                          <Link
                            key={c.href}
                            to={c.href}
                            onClick={() => setBoardOpen(false)}
                            className={`block px-4 py-2.5 text-sm hover:bg-slate-50 hover:text-slate-700 transition-colors ${c.bold ? "font-bold text-slate-700" : "text-gray-700"}`}
                          >
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Investors dropdown */}
                  <div
                    className="relative"
                    onMouseEnter={() => setInvestorOpen(true)}
                    onMouseLeave={() => setInvestorOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => { setInvestorOpen(!investorOpen); setCatOpen(false); setFracOpen(false); setStartupOpen(false); setBoardOpen(false); setInterimOpen(false); }}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
                    >
                      Investors <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    {investorOpen && <div className="absolute top-full left-0 right-0 h-2" />}
                    {investorOpen && (
                      <div className="absolute top-[calc(100%+4px)] left-0 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                        {INVESTOR_MENU.map(c => (
                          <Link
                            key={c.href}
                            to={c.href}
                            onClick={() => setInvestorOpen(false)}
                            className={`block px-4 py-2.5 text-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors ${c.bold ? "font-bold text-emerald-700" : "text-gray-700"}`}
                          >
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Interim dropdown */}
                  <div
                    className="relative"
                    onMouseEnter={() => setInterimOpen(true)}
                    onMouseLeave={() => setInterimOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => { setInterimOpen(!interimOpen); setCatOpen(false); setFracOpen(false); setStartupOpen(false); setBoardOpen(false); setInvestorOpen(false); }}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
                    >
                      Interim <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    {interimOpen && <div className="absolute top-full left-0 right-0 h-2" />}
                    {interimOpen && (
                      <div className="absolute top-[calc(100%+4px)] left-0 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                        {INTERIM_MENU.map(c => (
                          <Link
                            key={c.href}
                            to={c.href}
                            onClick={() => setInterimOpen(false)}
                            className={`block px-4 py-2.5 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors ${c.bold ? "font-bold text-teal-700" : "text-gray-700"}`}
                          >
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link
                    to="/salary"
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
                  >
                    Salary Guide
                  </Link>

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
                      <Link to="/executive-roles" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-all">Executive Roles</Link>
                      <Link to="/fractional" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-violet-700 hover:bg-violet-50 transition-all">Fractional</Link>
                      <Link to="/startup" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-orange-700 hover:bg-orange-50 transition-all">Startup</Link>
                      <Link to="/board" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all">Board</Link>
                      <Link to="/investors" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-all">Investors</Link>
                      <Link to="/interim" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-teal-700 hover:bg-teal-50 transition-all">Interim</Link>
                      <Link to="/salary" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">Salary Guide</Link>
                      <Link to="/browse-roles" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">Browse A–Z</Link>
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
