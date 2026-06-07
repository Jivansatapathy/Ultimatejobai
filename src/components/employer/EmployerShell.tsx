import { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  FileText,
  Linkedin,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Users,
  X,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import { useEmployerAuth } from "@/context/EmployerAuthContext";

const NAV = [
  { label: "Overview",      href: "/employer",                icon: LayoutDashboard, exact: true },
  { label: "Jobs",          href: "/employer/jobs",           icon: BriefcaseBusiness },
  { label: "LinkedIn",      href: "/employer/linkedin",       icon: Linkedin },
  { label: "Candidates",    href: "/employer/candidates",     icon: Users },
  { label: "Talent Pool",   href: "/employer/talent-pool",    icon: Bookmark },
  { label: "Offer Letters", href: "/employer/offer-letters",  icon: FileText },
  { label: "Messages",      href: "/employer/messages",       icon: MessageSquare },
  { label: "Notifications", href: "/employer/notifications",  icon: Bell },
  { label: "Settings",      href: "/employer/settings",       icon: Settings },
];

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white text-sm font-bold">
      {initials || "E"}
    </div>
  );
}

function SidebarNav({ onNav }: { onNav?: () => void }) {
  const location = useLocation();
  const { profile, bootstrap, logout } = useEmployerAuth();

  const visibleNav = NAV.filter(
    item => item.href !== "/employer/settings" || bootstrap?.permissions?.can_manage_team
  );

  const unread = bootstrap?.summary?.unread_notifications || 0;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 leading-none mb-0.5">Hiring Console</p>
          <p className="text-sm font-bold text-gray-900 truncate">{profile?.company_name || "Employer Workspace"}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visibleNav.map(item => {
          const Icon = item.icon;
          const isNotif = item.href === "/employer/notifications";
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.exact}
              onClick={onNav}
              className={({ isActive }) =>
                `group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </span>
                  {isNotif && unread > 0 ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  ) : (
                    <ChevronRight className={`h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? "opacity-60" : ""}`} />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-100 px-3 py-4 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 mb-2">
          <Avatar name={profile?.full_name || "E"} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900 truncate">{profile?.full_name || "Employer"}</p>
            <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function EmployerShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { profile, bootstrap } = useEmployerAuth();

  const pageLabel = useMemo(() => {
    const matched = NAV.find(n => n.exact ? location.pathname === n.href : location.pathname.startsWith(n.href));
    return matched?.label || "Dashboard";
  }, [location.pathname]);

  const unread = bootstrap?.summary?.unread_notifications || 0;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 flex-col bg-white border-r border-gray-200 shrink-0">
        <SidebarNav />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 h-full w-72 bg-white border-r border-gray-200 lg:hidden"
            >
              <div className="absolute right-3 top-3">
                <button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarNav onNav={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center justify-between bg-white border-b border-gray-200 px-4 lg:px-6 h-16 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900">{pageLabel}</h1>
              <p className="text-xs text-gray-400 hidden sm:block">{profile?.company_name || "Employer Workspace"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/employer/notifications"
              className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
            <Link
              to="/employer/settings"
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Settings className="h-5 w-5" />
            </Link>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <div className="flex items-center gap-2">
              <Avatar name={profile?.full_name || "E"} />
              <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                {profile?.full_name?.split(" ")[0] || "Employer"}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-y-auto p-4 lg:p-6"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
