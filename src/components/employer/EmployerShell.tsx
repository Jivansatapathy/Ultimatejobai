import { useMemo } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  FileText,
  Linkedin,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Settings,
  Sun,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useEmployerAuth } from "@/context/EmployerAuthContext";
import { useTheme } from "@/hooks/use-theme";

const navigation = [
  { label: "Dashboard", href: "/employer", icon: Building2, exact: true },
  { label: "Jobs", href: "/employer/jobs", icon: BriefcaseBusiness },
  { label: "LinkedIn", href: "/employer/linkedin", icon: Linkedin },
  { label: "Candidates", href: "/employer/candidates", icon: Users },
  { label: "Talent Pool", href: "/employer/talent-pool", icon: Bookmark },
  { label: "Notifications", href: "/employer/notifications", icon: Bell },
  { label: "Offer Letters", href: "/employer/offer-letters", icon: FileText },
  { label: "Messages", href: "/employer/messages", icon: MessageSquare },
  { label: "Settings", href: "/employer/settings", icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { profile, bootstrap, logout } = useEmployerAuth();
  const { theme, toggleTheme } = useTheme();
  const visibleNavigation = navigation.filter(
    (item) => item.href !== "/employer/settings" || bootstrap?.permissions?.can_manage_team
  );

  const heading = useMemo(() => {
    const current = visibleNavigation.find((item) => (item.exact ? location.pathname === item.href : location.pathname.startsWith(item.href)));
    return current?.label || "Employer";
  }, [location.pathname, visibleNavigation]);

  return (
    <div className="flex h-full flex-col">
      <div className="rounded-3xl bg-gradient-to-br from-accent via-orange-500 to-amber-400 p-[1px]">
        <div className="rounded-[calc(1.5rem-1px)] bg-card px-5 py-5">
          <Link to="/employer" className="flex items-center gap-3" onClick={onNavigate}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Employer Panel</p>
              <p className="text-lg font-semibold">{profile?.company_name || "Hiring workspace"}</p>
            </div>
          </Link>
          <div className="mt-5 rounded-2xl bg-secondary/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Signed in as</p>
            <p className="mt-2 font-medium">{profile?.full_name || "Employer user"}</p>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">{profile?.workspace_role || "admin"}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              <BadgeCheck className="h-3.5 w-3.5" />
              Campaign portal
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{heading}</p>
        <nav className="space-y-2">
          {visibleNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.exact}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.href === "/employer/notifications" && (bootstrap?.summary?.unread_notifications || 0) > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground animate-pulse">
                      {bootstrap.summary.unread_notifications}
                    </span>
                  )}
                </span>
                <ChevronRight className="h-4 w-4" />
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto space-y-3 pt-6">
        <Button variant="outline" className="w-full justify-start rounded-2xl" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        </Button>
        <Button variant="ghost" className="w-full justify-start rounded-2xl text-muted-foreground" onClick={() => logout()}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}

export function EmployerShell() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,1))] dark:bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.16),_transparent_24%),linear-gradient(180deg,rgba(10,10,10,1),rgba(18,18,18,1))]">
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-4 lg:px-6">
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[300px] rounded-[2rem] border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur xl:block">
          <SidebarContent />
        </aside>

        <div className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col rounded-[2rem] border border-border/70 bg-background/80 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between border-b border-border/70 px-4 py-4 lg:px-8 xl:hidden">
            <Link to="/employer" className="flex items-center gap-3 font-semibold">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <Building2 className="h-5 w-5" />
              </div>
              Employer Panel
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-2xl">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] p-5">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>

          <motion.main
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="flex-1 p-4 lg:p-8"
          >
            <Outlet />
          </motion.main>
        </div>
      </div>
    </div>
  );
}
