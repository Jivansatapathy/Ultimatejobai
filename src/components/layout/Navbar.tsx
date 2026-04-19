import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Briefcase,
  LogIn,
  Users,
  BrainCircuit,
  LogOut,
  Settings as SettingsIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "@/components/NotificationBell";

const navLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Resume", href: "/resume", icon: FileText },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Interview", href: "/interview", icon: Users },
  { name: "AI Mentor", href: "/ai-mentor", icon: BrainCircuit },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
  { name: "Plans", href: "/plans", icon: Sparkles },
];

const publicNavLinks = [
  { name: "Browse Jobs", href: "/jobs" },
  { name: "Plans", href: "/plans" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, isEmployer, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1e]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-md">
              <Sparkles className="h-[18px] w-[18px] text-white" />
            </div>
            <span className="text-[1.2rem] font-extrabold tracking-tight text-white">
              Career<span className="text-teal-400">AI</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {isAuthenticated && !isEmployer
              ? navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive(link.href)
                        ? "bg-teal-500/20 text-teal-300"
                        : "text-slate-300 hover:text-white hover:bg-white/8"
                    }`}
        
                  >
                    <link.icon className={`h-4 w-4 ${isActive(link.href) ? "text-teal-400" : "text-slate-500"}`} />
                    {link.name}
                  </Link>
                ))
              : !isAuthenticated
              ? publicNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive(link.href)
                        ? "bg-teal-500/20 text-teal-300"
                        : "text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))
              : null}

            {isAuthenticated && isEmployer && (
              <Link
                to="/employer"
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                Employer Panel
              </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {!isAuthenticated ? (
              <>
                <Link to="/auth">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-slate-300 hover:text-white hover:bg-white/10 font-medium border-0"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button
                    size="sm"
                    className="gap-1.5 bg-teal-500 hover:bg-teal-400 text-white font-semibold px-5 border-0 shadow-none rounded-lg"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
              <>
                {isEmployer && (
                  <Link to="/employer">
                    <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/10">
                      Employer Panel
                    </Button>
                  </Link>
                )}
                  <NotificationBell />
                  <Link to="/settings">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-slate-400 hover:text-white hover:bg-white/10">
                      <SettingsIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="bg-[#0a0f1e] border-t border-white/[0.06]"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {isAuthenticated ? (
                <>
                  {!isEmployer &&
                    navLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                          isActive(link.href)
                            ? "bg-teal-500/20 text-teal-300"
                            : "text-slate-300 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <link.icon className={`h-5 w-5 ${isActive(link.href) ? "text-teal-400" : "text-slate-500"}`} />
                        {link.name}
                      </Link>
                    ))}
                  <div className="pt-3 mt-2 flex flex-col gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    {isEmployer && (
                      <Link to="/employer" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-center text-slate-300 border-white/20 bg-transparent hover:bg-white/10 hover:text-white">
                          Employer Panel
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => { setIsOpen(false); logout(); }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {publicNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                  <div className="pt-3 mt-2 flex flex-col gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-center gap-2 text-slate-300 border-white/20 bg-transparent hover:bg-white/10 hover:text-white">
                        <LogIn className="h-4 w-4" />
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/employer/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-center text-slate-400 border-white/10 bg-transparent hover:bg-white/10 hover:text-white">
                        Employer Login
                      </Button>
                    </Link>
                    <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>
                      <Button className="w-full justify-center bg-teal-500 hover:bg-teal-400 text-white font-semibold border-0">
                        Get Started Free
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
