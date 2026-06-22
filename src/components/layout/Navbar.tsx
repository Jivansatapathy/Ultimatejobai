import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Search,
  LogIn,
  Users,
  BrainCircuit,
  LogOut,
  Loader2,
  Settings as SettingsIcon,
  Sparkles,
  Menu,
  X,
  Bot,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "@/components/NotificationBell";

const authNavLinks = [
  { name: "Dashboard",  href: "/dashboard",  icon: LayoutDashboard },
  { name: "Find Jobs",  href: "/find-jobs",  icon: Search },
  { name: "Resume",     href: "/resume",     icon: FileText },
  { name: "Interview",  href: "/interview",  icon: Users },
  { name: "AI Mentor",  href: "/ai-mentor",  icon: BrainCircuit },
];

const authSideLinks = [
  { name: "Plans",     href: "/plans",    icon: Sparkles },
  { name: "Settings",  href: "/settings", icon: SettingsIcon },
];

const publicNavLinks = [
  { name: "Find Jobs", href: "/find-jobs" },
  { name: "Plans",     href: "/plans" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const location = useLocation();
  const { isAuthenticated, isEmployer, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  const close = () => setIsOpen(false);

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  };

  // Dark theme for authenticated app pages; white theme for public/landing pages
  const dark = isAuthenticated;

  const navBg    = dark ? "bg-zinc-950/95 backdrop-blur-md border-zinc-900"  : "bg-white/95 backdrop-blur-md border-black/[0.07]";
  const logoText = dark ? "text-white"   : "text-black";
  const logoSub  = dark ? "text-zinc-500" : "text-black/40";
  const logoIcon = dark ? "bg-white"     : "bg-black";
  const logoIconColor = dark ? "text-black" : "text-white";

  const linkBase    = dark
    ? "text-zinc-500 hover:text-white hover:bg-zinc-900"
    : "text-black/50 hover:text-black hover:bg-black/[0.05]";
  const linkActive  = dark ? "text-white"  : "text-black";
  const indicator   = dark ? "bg-white"    : "bg-black";

  const mobileToggle = dark
    ? "text-zinc-400 hover:text-white hover:bg-zinc-900"
    : "text-black/50 hover:text-black hover:bg-black/[0.06]";

  const mobilePanel = dark
    ? "bg-zinc-950 border-zinc-900 shadow-black/40"
    : "bg-white border-black/[0.07] shadow-black/10";

  const mobileLinkBase   = dark
    ? "text-zinc-400 hover:text-white hover:bg-zinc-900"
    : "text-black/50 hover:text-black hover:bg-black/[0.05]";
  const mobileLinkActive = dark
    ? "bg-zinc-900 text-white border border-zinc-800"
    : "bg-black/[0.05] text-black border border-black/[0.08]";
  const mobileIconActive = dark ? "bg-white text-black" : "bg-black text-white";
  const mobileIconIdle   = dark ? "bg-zinc-900 text-zinc-500" : "bg-black/[0.06] text-black/40";
  const mobileDivider    = dark ? "border-zinc-900" : "border-black/[0.07]";
  const mobileSectionLabel = dark ? "text-zinc-700" : "text-black/25";

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 border-b ${navBg}`}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px]">
          <div className="flex h-[60px] items-center justify-between gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group" onClick={close}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${logoIcon}`}>
                <Bot className={`h-4 w-4 ${logoIconColor}`} />
              </div>
              <span className={`text-[1.05rem] font-extrabold tracking-tight ${logoText}`}>
                Hizorex
              </span>
            </Link>

            {/* Desktop center nav */}
            <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
              {isAuthenticated && !isEmployer
                ? authNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive(link.href) ? linkActive : linkBase
                      }`}
                    >
                      <link.icon className="h-3.5 w-3.5 shrink-0" />
                      {link.name}
                      {isActive(link.href) && (
                        <motion.div
                          layoutId="nav-indicator"
                          className={`absolute -bottom-[1px] left-3 right-3 h-px ${indicator} rounded-full`}
                        />
                      )}
                    </Link>
                  ))
                : !isAuthenticated
                ? publicNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive(link.href) ? linkActive : linkBase
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))
                : null}

              {isAuthenticated && isEmployer && (
                <Link
                  to="/employer"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${linkBase}`}
                >
                  Employer Panel
                </Link>
              )}
            </div>

            {/* Desktop right actions */}
            <div className="hidden md:flex items-center gap-1 shrink-0">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/employer/auth"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${linkBase}`}
                  >
                    Employer
                  </Link>
                  <Link
                    to="/auth"
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${linkBase}`}
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    Sign In
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    className={`ml-2 flex items-center gap-1.5 h-9 px-5 rounded-lg text-sm font-bold transition-all ${
                      dark
                        ? "bg-white hover:bg-zinc-100 text-black"
                        : "bg-black hover:bg-zinc-800 text-white"
                    }`}
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  {authSideLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive(link.href) ? linkActive : linkBase
                      }`}
                    >
                      <link.icon className="h-3.5 w-3.5" />
                      {link.name}
                    </Link>
                  ))}
                  <div className={`mx-1 h-5 w-px ${dark ? "bg-zinc-800" : "bg-black/10"}`} />
                  <NotificationBell />
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={signingOut}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-60 disabled:cursor-wait"
                  >
                    {signingOut
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <LogOut className="h-3.5 w-3.5" />
                    }
                    <span className="hidden lg:inline">
                      {signingOut ? "Signing out…" : "Sign Out"}
                    </span>
                  </button>
                </>
              )}
            </div>

            {/* Mobile: bell + hamburger */}
            <div className="flex md:hidden items-center gap-2">
              {isAuthenticated && <NotificationBell />}
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
                className={`flex items-center justify-center h-9 w-9 rounded-lg transition-all ${mobileToggle}`}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={close}
            />

            <motion.div
              key="panel"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={`fixed top-[60px] left-0 right-0 z-50 md:hidden border-b shadow-2xl ${mobilePanel}`}
            >
              <div className="px-4 py-4 space-y-1">

                {isAuthenticated ? (
                  <>
                    {!isEmployer && (
                      <>
                        <p className={`px-3 pt-1 pb-2 text-[9px] font-black uppercase tracking-[0.3em] ${mobileSectionLabel}`}>
                          Navigation
                        </p>
                        {authNavLinks.map((link) => (
                          <Link
                            key={link.href}
                            to={link.href}
                            onClick={close}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-semibold transition-all ${
                              isActive(link.href) ? mobileLinkActive : mobileLinkBase
                            }`}
                          >
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                              isActive(link.href) ? mobileIconActive : mobileIconIdle
                            }`}>
                              <link.icon className="h-4 w-4" />
                            </div>
                            {link.name}
                          </Link>
                        ))}

                        <div className="pt-3 pb-1">
                          <p className={`px-3 pb-2 text-[9px] font-black uppercase tracking-[0.3em] ${mobileSectionLabel}`}>
                            Account
                          </p>
                          {authSideLinks.map((link) => (
                            <Link
                              key={link.href}
                              to={link.href}
                              onClick={close}
                              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-semibold transition-all ${
                                isActive(link.href) ? mobileLinkActive : mobileLinkBase
                              }`}
                            >
                              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                isActive(link.href) ? mobileIconActive : mobileIconIdle
                              }`}>
                                <link.icon className="h-4 w-4" />
                              </div>
                              {link.name}
                            </Link>
                          ))}
                        </div>
                      </>
                    )}

                    {isEmployer && (
                      <Link
                        to="/employer"
                        onClick={close}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${mobileLinkBase}`}
                      >
                        Employer Panel
                      </Link>
                    )}

                    <div className={`pt-2 border-t mt-2 ${mobileDivider}`}>
                      <button
                        type="button"
                        onClick={() => { close(); handleLogout(); }}
                        disabled={signingOut}
                        className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-[14px] font-semibold text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-60 disabled:cursor-wait"
                      >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${mobileIconIdle}`}>
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
                    <p className={`px-3 pt-1 pb-2 text-[9px] font-black uppercase tracking-[0.3em] ${mobileSectionLabel}`}>
                      Explore
                    </p>
                    {publicNavLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={close}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-semibold transition-all ${mobileLinkBase}`}
                      >
                        {link.name}
                      </Link>
                    ))}

                    <div className={`pt-3 mt-2 border-t flex flex-col gap-2 ${mobileDivider}`}>
                      <Link to="/auth" onClick={close}>
                        <button
                          type="button"
                          className={`w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all ${
                            dark
                              ? "bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800"
                              : "bg-black/[0.05] border border-black/[0.08] text-black hover:bg-black/[0.09]"
                          }`}
                        >
                          <LogIn className="h-4 w-4 opacity-60" />
                          Sign In
                        </button>
                      </Link>
                      <Link to="/employer/auth" onClick={close}>
                        <button
                          type="button"
                          className={`w-full flex items-center justify-center h-11 rounded-xl text-sm font-bold transition-all ${
                            dark
                              ? "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                              : "bg-black/[0.03] border border-black/[0.06] text-black/50 hover:bg-black/[0.07] hover:text-black"
                          }`}
                        >
                          Employer Login
                        </button>
                      </Link>
                      <Link to="/auth?mode=signup" onClick={close}>
                        <button
                          type="button"
                          className={`w-full flex items-center justify-center h-11 rounded-xl text-sm font-bold transition-all ${
                            dark
                              ? "bg-white hover:bg-zinc-100 text-black"
                              : "bg-black hover:bg-zinc-800 text-white"
                          }`}
                        >
                          Get Started Free
                        </button>
                      </Link>
                    </div>
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
