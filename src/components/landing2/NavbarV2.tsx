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
    viewAllHref: "/executive-roles",
    roles: [
      { label: "CFO",                      href: "/executive-roles/cfo" },
      { label: "Controller",               href: "/executive-roles/controller" },
      { label: "VP Finance",               href: "/executive-roles/vp-finance" },
      { label: "Head of Finance",          href: "/executive-roles/head-of-finance" },
      { label: "FP&A Director",            href: "/find-jobs?q=FP%26A+Director" },
      { label: "Chief Accounting Officer", href: "/find-jobs?q=Chief+Accounting+Officer" },
      { label: "Treasurer",                href: "/find-jobs?q=Treasurer" },
      { label: "VP Tax",                   href: "/find-jobs?q=VP+Tax" },
    ],
  },
  {
    dept: "Technology",
    color: "text-sky-600",
    viewAllHref: "/executive-roles",
    roles: [
      { label: "CTO",                  href: "/executive-roles/cto" },
      { label: "VP Engineering",       href: "/find-jobs?q=VP+Engineering" },
      { label: "Head of Engineering",  href: "/executive-roles/head-of-engineering" },
      { label: "Head of AI",           href: "/executive-roles/head-of-ai" },
      { label: "Head of Data",         href: "/executive-roles/head-of-data" },
      { label: "Head of DevOps",       href: "/executive-roles/head-of-devops" },
      { label: "Head of Platform",     href: "/find-jobs?q=Head+of+Platform" },
      { label: "Head of Architecture", href: "/find-jobs?q=Head+of+Architecture" },
    ],
  },
  {
    dept: "Sales & Marketing",
    color: "text-blue-600",
    viewAllHref: "/executive-roles",
    roles: [
      { label: "CRO",                href: "/executive-roles/cro" },
      { label: "CMO",                href: "/executive-roles/cmo" },
      { label: "VP Sales",           href: "/executive-roles/vp-sales" },
      { label: "VP Marketing",       href: "/find-jobs?q=VP+Marketing" },
      { label: "Head of Sales",      href: "/executive-roles/head-of-sales" },
      { label: "Head of Growth",     href: "/executive-roles/head-of-growth" },
      { label: "Head of Demand Gen", href: "/find-jobs?q=Head+of+Demand+Generation" },
      { label: "Head of Brand",      href: "/find-jobs?q=Head+of+Brand" },
    ],
  },
  {
    dept: "Operations & HR",
    color: "text-emerald-600",
    viewAllHref: "/executive-roles",
    roles: [
      { label: "COO",             href: "/executive-roles/coo" },
      { label: "CHRO",            href: "/executive-roles/chro" },
      { label: "CPO",             href: "/executive-roles/cpo" },
      { label: "CISO",            href: "/executive-roles/ciso" },
      { label: "CLO",             href: "/executive-roles/clo" },
      { label: "Chief of Staff",  href: "/find-jobs?q=Chief+of+Staff" },
      { label: "VP Operations",   href: "/find-jobs?q=VP+Operations" },
      { label: "General Counsel", href: "/find-jobs?q=General+Counsel" },
    ],
  },
  {
    dept: "Interim",
    color: "text-teal-600",
    viewAllHref: "/interim",
    roles: [
      { label: "Interim CFO",  href: "/interim/cfo" },
      { label: "Interim CTO",  href: "/interim/cto" },
      { label: "Interim CMO",  href: "/interim/cmo" },
      { label: "Interim COO",  href: "/interim/coo" },
      { label: "Interim CHRO", href: "/interim/chro" },
      { label: "Interim CIO",  href: "/interim/cio" },
      { label: "Interim CPO",  href: "/interim/cpo" },
      { label: "Interim CRO",  href: "/interim/cro" },
    ],
  },
  {
    dept: "Fractional",
    color: "text-violet-600",
    viewAllHref: "/fractional",
    roles: [
      { label: "All Fractional Jobs",  href: "/fractional-jobs" },
      { label: "Fractional CFO",       href: "/fractional/cfo" },
      { label: "Fractional CTO",       href: "/fractional/cto" },
      { label: "Fractional CMO",       href: "/fractional/cmo" },
      { label: "Fractional COO",       href: "/fractional/coo" },
      { label: "Fractional CIO",       href: "/fractional/cio" },
      { label: "Fractional CPO",       href: "/fractional/cpo" },
      { label: "Fractional CHRO",      href: "/fractional/chro" },
    ],
  },
  {
    dept: "Startup",
    color: "text-orange-600",
    viewAllHref: "/startup",
    roles: [
      { label: "Startup CEO",       href: "/startup/ceo" },
      { label: "Startup CTO",       href: "/startup/cto" },
      { label: "Startup CFO",       href: "/startup/cfo" },
      { label: "Startup COO",       href: "/startup/coo" },
      { label: "Co-Founder",        href: "/startup/co-founder" },
      { label: "Founding Engineer", href: "/startup/founding-engineer" },
      { label: "Startup CRO",       href: "/startup/cro" },
      { label: "Startup Advisor",   href: "/startup/startup-advisor" },
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
  const [activeDept, setActiveDept] = useState(0);
  const [boardOpen, setBoardOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { isAuthenticated, logout, userEmail } = useAuth();
  const { pathname } = useLocation();
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
          <div className="flex h-16 items-center justify-between gap-2">

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
            <nav className="hidden lg:flex items-center gap-0 flex-1">
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
                  {/* Executive Roles — Mega Menu */}
                  <div
                    className="relative"
                    onMouseEnter={() => setCatOpen(true)}
                    onMouseLeave={() => setCatOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => { setCatOpen(!catOpen); setBoardOpen(false); }}
                      className="flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50 whitespace-nowrap"
                    >
                      Executive Roles <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                    </button>
                    {catOpen && <div className="absolute top-full left-0 right-0 h-2" />}
                    {catOpen && (
                      <div className="absolute top-[calc(100%+4px)] left-0 w-[660px] bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
                        {/* Two-panel body */}
                        <div className="flex flex-1 min-h-0">
                          {/* Left sidebar — department list */}
                          <div className="w-44 shrink-0 bg-gray-50 border-r border-gray-100 py-2">
                            {MEGA_COLS.map((col, i) => (
                              <button
                                key={col.dept}
                                type="button"
                                onMouseEnter={() => setActiveDept(i)}
                                onClick={() => setActiveDept(i)}
                                className={`w-full text-left flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors
                                  ${activeDept === i
                                    ? `bg-white border-r-2 ${col.color.replace("text-", "border-")} ${col.color}`
                                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                  }`}
                              >
                                {col.dept}
                                {activeDept === i && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                              </button>
                            ))}
                          </div>

                          {/* Right panel — roles for active dept */}
                          <div className="flex-1 p-5">
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${MEGA_COLS[activeDept].color}`}>
                              {MEGA_COLS[activeDept].dept}
                            </p>
                            <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                              {MEGA_COLS[activeDept].roles.map(r => (
                                <li key={r.href}>
                                  <Link
                                    to={r.href}
                                    onClick={() => setCatOpen(false)}
                                    className={`flex items-center gap-1.5 text-sm text-gray-700 rounded-lg px-3 py-2 transition-colors font-medium
                                      hover:bg-blue-50 hover:text-blue-700 group`}
                                  >
                                    <ChevronRight className={`h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${MEGA_COLS[activeDept].color}`} />
                                    {r.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                            <Link
                              to={MEGA_COLS[activeDept].viewAllHref}
                              onClick={() => setCatOpen(false)}
                              className={`inline-flex items-center gap-1 mt-5 text-xs font-bold ${MEGA_COLS[activeDept].color} hover:opacity-80 transition-opacity`}
                            >
                              View all {MEGA_COLS[activeDept].dept} roles <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>

                        {/* Bottom: quick links — single line */}
                        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 border-t border-gray-100 overflow-x-auto scrollbar-none">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 shrink-0 mr-0.5">Also:</span>
                          {[
                            { label: "Board", href: "/board", color: "text-slate-700 bg-slate-100 border-slate-200" },
                            { label: "Investors / PE", href: "/investors", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
                            { label: "Browse A–Z", href: "/browse-roles", color: "text-blue-700 bg-blue-50 border-blue-200" },
                            { label: "Blog", href: "/blog", color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
                          ].map(l => (
                            <Link
                              key={l.href}
                              to={l.href}
                              onClick={() => setCatOpen(false)}
                              className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${l.color} hover:opacity-80 transition-opacity whitespace-nowrap`}
                            >
                              {l.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Board & Investors — merged two-column dropdown */}
                  <div
                    className="relative"
                    onMouseEnter={() => setBoardOpen(true)}
                    onMouseLeave={() => setBoardOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => { setBoardOpen(!boardOpen); setCatOpen(false); }}
                      className="flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50 whitespace-nowrap"
                    >
                      Board & Investors <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                    </button>
                    {boardOpen && <div className="absolute top-full left-0 right-0 h-2" />}
                    {boardOpen && (
                      <div className="absolute top-[calc(100%+4px)] right-0 w-[460px] bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                        <div className="grid grid-cols-2">

                          {/* Board column */}
                          <div className="border-r border-gray-100">
                            <div className="px-5 pt-4 pb-3 border-b border-gray-100 bg-slate-50">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Board Roles</p>
                            </div>
                            <div className="px-3 py-3 space-y-0.5">
                              {[
                                { label: "Board Member",           href: "/board/board-member" },
                                { label: "Board Chair",            href: "/board/board-chair" },
                                { label: "Independent Director",   href: "/board/independent-director" },
                                { label: "Board Advisor",          href: "/board/board-advisor" },
                                { label: "Audit Committee Chair",  href: "/board/audit-committee-chair" },
                                { label: "Nominating Committee",   href: "/find-jobs?q=Nominating+Committee" },
                              ].map(r => (
                                <Link
                                  key={r.href}
                                  to={r.href}
                                  onClick={() => setBoardOpen(false)}
                                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium group"
                                >
                                  {r.label}
                                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                                </Link>
                              ))}
                            </div>
                            <div className="px-5 pb-4">
                              <Link
                                to="/board"
                                onClick={() => setBoardOpen(false)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                              >
                                View all board roles <ChevronRight className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>

                          {/* Investors column */}
                          <div>
                            <div className="px-5 pt-4 pb-3 border-b border-gray-100 bg-emerald-50">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Investors & PE</p>
                            </div>
                            <div className="px-3 py-3 space-y-0.5">
                              {[
                                { label: "Managing Partner",  href: "/investors/managing-partner" },
                                { label: "General Partner",   href: "/investors/general-partner" },
                                { label: "Venture Partner",   href: "/investors/venture-partner" },
                                { label: "Operating Partner", href: "/investors/operating-partner" },
                                { label: "Portfolio CEO",     href: "/investors/portfolio-ceo" },
                                { label: "PE Principal",      href: "/investors/pe-principal" },
                              ].map(r => (
                                <Link
                                  key={r.href}
                                  to={r.href}
                                  onClick={() => setBoardOpen(false)}
                                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors font-medium group"
                                >
                                  {r.label}
                                  <ChevronRight className="h-3.5 w-3.5 text-emerald-300 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                                </Link>
                              ))}
                            </div>
                            <div className="px-5 pb-4">
                              <Link
                                to="/investors"
                                onClick={() => setBoardOpen(false)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
                              >
                                View all investor roles <ChevronRight className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                  <Link
                    to="/employer/auth"
                    className="px-3 py-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50 whitespace-nowrap"
                  >
                    For Employers
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("pricing");
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                      } else {
                        window.location.href = "/#pricing";
                      }
                    }}
                    className="px-3 py-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50 whitespace-nowrap"
                  >
                    Pricing
                  </button>
                </>
              )}
            </nav>

            {/* Desktop right */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              {!isAuthenticated ? (
                <>
                  {/* Hizorex AI — accent pill */}
                  <Link
                    to="/hizorex-os"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-200 bg-violet-50 text-[13px] font-bold text-violet-700 hover:bg-violet-100 transition-colors whitespace-nowrap"
                  >
                    <Crown className="h-3.5 w-3.5 shrink-0" />
                    Hizorex AI
                  </Link>
                  <div className="h-5 w-px bg-gray-200" />
                  <Link
                    to="/find-jobs"
                    className="px-3.5 py-1.5 rounded-lg border border-blue-600 text-blue-600 text-[13px] font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap"
                  >
                    Browse Jobs
                  </Link>
                  <Link
                    to="/auth"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold transition-colors whitespace-nowrap"
                  >
                    <LogIn className="h-3.5 w-3.5 shrink-0" />
                    Sign In
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
                      <Link to="/find-jobs" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">Browse Jobs</Link>
                      <Link to="/executive-roles" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-all">Executive Roles</Link>
                      <Link to="/fractional" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-violet-700 hover:bg-violet-50 transition-all">Fractional</Link>
                      <Link to="/startup" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-orange-700 hover:bg-orange-50 transition-all">Startup</Link>
                      <Link to="/board" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all">Board</Link>
                      <Link to="/investors" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-all">Investors</Link>
                      <Link to="/interim" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-teal-700 hover:bg-teal-50 transition-all">Interim</Link>
                      <Link to="/browse-roles" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">Browse A–Z</Link>
                      <Link to="/blog" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition-all">Blog</Link>
                      <button
                        type="button"
                        onClick={() => {
                          closeMenu();
                          const el = document.getElementById("pricing");
                          if (el) {
                            setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                          } else {
                            window.location.href = "/#pricing";
                          }
                        }}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all w-full text-left"
                      >
                        Pricing
                      </button>
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
