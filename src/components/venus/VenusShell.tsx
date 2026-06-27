import { Suspense, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Star, Building2, DollarSign,
  TrendingUp, Network, Megaphone,
  LogOut, Menu, X, ChevronRight, Crown, Mic, Target, Bot, Loader2,
  Sparkles, Handshake, ArrowLeft,
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
    { label: "Dashboard",          href: base,                            icon: LayoutDashboard, exact: true },
    { label: "Opportunities",      href: `${base}/opportunities`,         icon: Star },
    { label: "Company Intel",      href: `${base}/company-intel`,         icon: Building2 },
    { label: "Compensation",       href: `${base}/compensation`,          icon: DollarSign },
    { label: "Equity Calc",        href: `${base}/equity`,                icon: TrendingUp },
    { label: "Network",            href: `${base}/network`,               icon: Network },
    { label: "Branding",           href: `${base}/branding`,              icon: Megaphone },
    { label: "Interview Prep",     href: `${base}/interview-prep`,        icon: Mic },
    { label: "Readiness Score",    href: `${base}/readiness-score`,       icon: Target },
    { label: "Career Twin",        href: `${base}/career-twin`,           icon: Bot },
    { label: "AI Insights",        href: `${base}/ai-insights`,           icon: Sparkles },
    { label: "Salary Negotiation", href: `${base}/salary-negotiation`,    icon: Handshake },
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
            : "text-gray-800 hover:bg-gray-100 hover:text-gray-900"
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
    <div className="flex h-full w-full flex-col bg-white border-r border-gray-200 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

      {/* Back to dashboard */}
      <div className="px-3 pt-3 pb-1 shrink-0">
        <button
          type="button"
          onClick={() => { onNav?.(); navigate("/dashboard"); }}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </button>
      </div>

      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 shrink-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-500/20">
          <Crown className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Hizorex AI</p>
          <p className="text-sm font-bold text-gray-900">Executive OS</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {nav.map(item => (
          <NavItem key={item.href} item={item} onClick={onNav} />
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-100 px-3 py-4 space-y-1 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 mb-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white text-sm font-bold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900 truncate">{userEmail || "Executive"}</p>
            <p className="text-xs text-gray-700">Hizorex Pro</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { logout(); navigate("/auth"); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all"
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
  const navigate = useNavigate();
  const basePath = getVenusBasePath(location.pathname);
  const nav = getNav(basePath);

  // Derive current page label for mobile topbar
  const currentPage = nav.find(n =>
    n.exact ? location.pathname === n.href : location.pathname.startsWith(n.href) && n.href !== basePath
  ) ?? (location.pathname === basePath ? nav[0] : null);
  const pageLabel = currentPage?.label ?? "Hizorex OS";

  return (
    <div className="flex h-[100dvh] bg-white overflow-hidden">

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-60 lg:shrink-0 lg:flex-col">
        <Sidebar nav={nav} />
      </div>

      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden shadow-2xl"
            >
              <Sidebar nav={nav} onNav={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">

        {/* Mobile topbar */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 bg-white lg:hidden shrink-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <Crown className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="text-sm font-bold text-gray-900 truncate">{pageLabel}</span>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1 h-9 px-3 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Back</span>
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Suspense fallback={<ContentLoader />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
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
