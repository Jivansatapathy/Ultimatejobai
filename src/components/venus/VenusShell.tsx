import { Suspense, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Star, Building2, DollarSign,
  TrendingUp, Network, Megaphone,
  LogOut, Menu, X, ChevronRight, Crown, Mic, Target, Bot, Loader2,
  Sparkles, Calendar, Handshake,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getVenusBasePath } from "@/lib/venusBasePath";

function ContentLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
    </div>
  );
}

function getNav(base: string) {
  return [
    { label: "Dashboard",        href: base,                          icon: LayoutDashboard, exact: true },
    { label: "Opportunities",    href: `${base}/opportunities`,       icon: Star },
    { label: "Company Intel",    href: `${base}/company-intel`,       icon: Building2 },
    { label: "Compensation",     href: `${base}/compensation`,        icon: DollarSign },
    { label: "Equity Calc",      href: `${base}/equity`,              icon: TrendingUp },
    { label: "Network",          href: `${base}/network`,             icon: Network },
    { label: "Branding",         href: `${base}/branding`,            icon: Megaphone },
    { label: "Interview Prep",   href: `${base}/interview-prep`,      icon: Mic },
    { label: "Readiness Score",  href: `${base}/readiness-score`,     icon: Target },
    { label: "Career Twin",      href: `${base}/career-twin`,         icon: Bot },
    { label: "AI Insights",      href: `${base}/ai-insights`,         icon: Sparkles },
    { label: "Job Fairs",        href: `${base}/job-fairs`,           icon: Calendar },
    { label: "Salary Negotiation", href: `${base}/salary-negotiation`, icon: Handshake },
  ];
}

function NavItem({ item, onClick }: { item: ReturnType<typeof getNav>[0]; onClick?: () => void }) {
  return (
    <NavLink
      to={item.href}
      end={!!item.exact}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
          isActive
            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className="flex items-center gap-3">
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </span>
          <ChevronRight className={`h-3.5 w-3.5 transition-opacity ${isActive ? "opacity-60" : "opacity-0 group-hover:opacity-40"}`} />
        </>
      )}
    </NavLink>
  );
}

function Sidebar({ nav, onNav }: { nav: ReturnType<typeof getNav>; onNav?: () => void }) {
  const { logout, userEmail } = useAuth();
  const navigate = useNavigate();

  const initials = (userEmail || "VE").slice(0, 2).toUpperCase();

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-white border-r border-gray-200">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-500/20">
          <Crown className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Hizorex AI</p>
          <p className="text-sm font-bold text-gray-900">Executive OS</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(item => (
          <NavItem key={item.href} item={item} onClick={onNav} />
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-100 px-3 py-4 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 mb-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white text-sm font-bold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900 truncate">{userEmail || "Executive"}</p>
            <p className="text-xs text-gray-400">Hizorex Pro</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { logout(); navigate("/auth"); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function VenusShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const basePath = getVenusBasePath(location.pathname);
  const nav = getNav(basePath);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-60 lg:shrink-0">
        <Sidebar nav={nav} />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            >
              <Sidebar nav={nav} onNav={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 lg:hidden">
          <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation" className="text-gray-500 hover:text-gray-900">
            <Menu className="h-5 w-5" />
          </button>
          <Crown className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-bold text-gray-900">Hizorex AI</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<ContentLoader />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
