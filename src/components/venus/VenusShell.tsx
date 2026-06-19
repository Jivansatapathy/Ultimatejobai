import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Star, Building2, DollarSign,
  TrendingUp, Network, Megaphone,
  LogOut, Menu, X, ChevronRight, Crown, Mic, Target, Bot,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { label: "Dashboard",     href: "/venus",                   icon: LayoutDashboard, exact: true },
  { label: "Opportunities", href: "/venus/opportunities",     icon: Star },
  { label: "Company Intel", href: "/venus/company-intel",     icon: Building2 },
  { label: "Compensation",  href: "/venus/compensation",      icon: DollarSign },
  { label: "Equity Calc",   href: "/venus/equity",            icon: TrendingUp },
  { label: "Network",       href: "/venus/network",           icon: Network },
  { label: "Branding",      href: "/venus/branding",          icon: Megaphone },
  { label: "Interview Prep", href: "/venus/interview-prep",   icon: Mic },
  { label: "Readiness Score", href: "/venus/readiness-score", icon: Target },
  { label: "Career Twin",   href: "/venus/career-twin",       icon: Bot },
];

function NavItem({ item, onClick }: { item: typeof NAV[0]; onClick?: () => void }) {
  return (
    <NavLink
      to={item.href}
      end={!!item.exact}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
          isActive
            ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
            : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
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

function Sidebar({ onNav }: { onNav?: () => void }) {
  const { logout, userEmail } = useAuth();
  const navigate = useNavigate();

  const initials = (userEmail || "VE").slice(0, 2).toUpperCase();

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-zinc-950 border-r border-zinc-800">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-zinc-800">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 shadow-lg shadow-violet-500/20">
          <Crown className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Venus AI</p>
          <p className="text-sm font-bold text-white">Executive OS</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(item => (
          <NavItem key={item.href} item={item} onClick={onNav} />
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-zinc-800 px-3 py-4 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-zinc-900 mb-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white text-sm font-bold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate">{userEmail || "Executive"}</p>
            <p className="text-xs text-zinc-500">Venus Pro</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { logout(); navigate("/auth"); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:bg-red-950 hover:text-red-400 transition-all"
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

  return (
    <div className="flex h-screen bg-zinc-900 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-60 lg:shrink-0">
        <Sidebar />
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
              <Sidebar onNav={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 lg:hidden">
          <button type="button" onClick={() => setMobileOpen(true)} className="text-zinc-400 hover:text-white">
            <Menu className="h-5 w-5" />
          </button>
          <Crown className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-bold text-white">Venus AI</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
