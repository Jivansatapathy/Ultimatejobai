import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff, Check, CheckCheck, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/employer/EmptyState";
import { LoadingState } from "@/components/employer/LoadingState";
import { PageHeader } from "@/components/employer/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEmployerAuth } from "@/context/EmployerAuthContext";
import { getEmployerNotifications, markAllNotificationsRead, markNotificationRead } from "@/services/employerService";
import { EmployerNotification } from "@/types/employer";

const typeIcons: Record<string, string> = {
  new_applicant: "👤",
  status_change: "🔄",
  interview_reminder: "📅",
  job_expiring: "⏰",
  message_received: "💬",
  offer_accepted: "🎉",
  offer_rejected: "❌",
  system: "⚙️",
};

const typeColors: Record<string, string> = {
  new_applicant: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  status_change: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  interview_reminder: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  job_expiring: "bg-red-500/10 text-red-700 dark:text-red-300",
  message_received: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  offer_accepted: "bg-green-500/10 text-green-700 dark:text-green-300",
  offer_rejected: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  system: "bg-secondary text-muted-foreground",
};

export default function EmployerNotifications() {
  const { user, isEmployer } = useEmployerAuth();
  const [notifications, setNotifications] = useState<EmployerNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (!user || !isEmployer) {
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        const items = await getEmployerNotifications();
        setNotifications(items);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isEmployer, user]);

  const filtered = filter === "unread"
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = async (notification: EmployerNotification) => {
    if (notification.is_read) {
      return;
    }
    try {
      await markNotificationRead(notification.id);
      setNotifications((current) =>
        current.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)),
      );
    } catch {
      toast.error("Unable to mark notification as read.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((n) => ({ ...n, is_read: true })));
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Unable to mark all as read.");
    }
  };

  if (loading) {
    return <LoadingState label="Loading notifications..." />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Notifications"
        title="Smart Notifications"
        description="Stay updated on new applicants, interview reminders, candidate activity, and pending actions."
        actions={(
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => setFilter(filter === "all" ? "unread" : "all")}
            >
              {filter === "unread" ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              {filter === "unread" ? "Show all" : `Unread (${unreadCount})`}
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          </div>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-3xl border-border/70">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Total</p>
            <p className="mt-2 text-3xl font-bold">{notifications.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-border/70">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Unread</p>
            <p className="mt-2 text-3xl font-bold text-accent">{unreadCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-border/70">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">New Applicants</p>
            <p className="mt-2 text-3xl font-bold">
              {notifications.filter((n) => n.notification_type === "new_applicant").length}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-border/70">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Pending Actions</p>
            <p className="mt-2 text-3xl font-bold">
              {notifications.filter((n) => !n.is_read && (n.notification_type === "interview_reminder" || n.notification_type === "job_expiring")).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {filtered.length ? (
        <div className="space-y-3">
          {filtered.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card
                className={`rounded-3xl border-border/70 transition-all cursor-pointer hover:shadow-md ${
                  !notification.is_read ? "border-l-4 border-l-accent bg-accent/[0.03]" : ""
                }`}
                onClick={() => handleMarkRead(notification)}
              >
                <CardContent className="flex items-start gap-4 p-5">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg ${typeColors[notification.notification_type] || typeColors.system}`}>
                    {typeIcons[notification.notification_type] || "📋"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`font-medium ${!notification.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {!notification.is_read ? (
                          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                        ) : null}
                        <Badge variant="outline" className="capitalize text-xs whitespace-nowrap">
                          {notification.notification_type.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">
                        {notification.created_at ? new Date(notification.created_at).toLocaleString() : "recently"}
                      </span>
                      {notification.action_url ? (
                        <a
                          href={notification.action_url}
                          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                      {!notification.is_read ? (
                        <button
                          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                          onClick={(e) => { e.stopPropagation(); handleMarkRead(notification); }}
                        >
                          <Check className="h-3 w-3" /> Mark read
                        </button>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell className="h-6 w-6" />}
          title="No notifications"
          description={filter === "unread" ? "All caught up! No unread notifications." : "Notifications will appear here when candidates apply, interviews are due, or jobs expire."}
        />
      )}
    </div>
  );
}
