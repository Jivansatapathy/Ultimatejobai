import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/employer/EmptyState";
import { LoadingState } from "@/components/employer/LoadingState";
import { PageHeader } from "@/components/employer/PageHeader";
import { useEmployerAuth } from "@/context/EmployerAuthContext";
import { getEmployerNotifications, markNotificationRead } from "@/services/employerService";
import { EmployerNotification } from "@/types/employer";

const typeIcons: Record<string, string> = {
  new_applicant:      "👤",
  status_change:      "🔄",
  interview_reminder: "📅",
  job_expiring:       "⏰",
  message_received:   "💬",
  offer_accepted:     "🎉",
  offer_rejected:     "❌",
  system:             "⚙️",
};

const typeBg: Record<string, string> = {
  new_applicant:      "bg-blue-50 text-blue-700",
  status_change:      "bg-purple-50 text-purple-700",
  interview_reminder: "bg-amber-50 text-amber-700",
  job_expiring:       "bg-red-50 text-red-700",
  message_received:   "bg-emerald-50 text-emerald-700",
  offer_accepted:     "bg-green-50 text-green-700",
  offer_rejected:     "bg-rose-50 text-rose-700",
  system:             "bg-gray-100 text-gray-500",
};

export default function EmployerNotifications() {
  const { user, isEmployer } = useEmployerAuth();
  const [notifications, setNotifications] = useState<EmployerNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isEmployer) return;
    const load = async () => {
      try {
        setLoading(true);
        const items = await getEmployerNotifications();
        setNotifications(items);
      } catch { setNotifications([]); }
      finally { setLoading(false); }
    };
    load();
  }, [isEmployer, user]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = async (notification: EmployerNotification) => {
    if (notification.is_read) return;
    try {
      await markNotificationRead(notification.id);
      setNotifications((current) => current.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)));
    } catch { toast.error("Unable to mark notification as read."); }
  };

  if (loading) return <LoadingState label="Loading notifications..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Notifications"
        title="Smart Notifications"
        description="Stay updated on new applicants, interview reminders, candidate activity, and pending actions."
      />

      {/* Stat strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total",         value: notifications.length,                                                               color: "text-gray-900" },
          { label: "Unread",        value: unreadCount,                                                                        color: "text-blue-600" },
          { label: "New Applicants",value: notifications.filter((n) => n.notification_type === "new_applicant").length,        color: "text-emerald-600" },
          { label: "Pending Actions",value: notifications.filter((n) => !n.is_read && (n.notification_type === "interview_reminder" || n.notification_type === "job_expiring")).length, color: "text-amber-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{stat.label}</p>
            <p className={`mt-2 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Notification list */}
      {notifications.length ? (
        <div className="space-y-2">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <div
                className={`cursor-pointer rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${
                  !notification.is_read
                    ? "border-l-4 border-l-blue-500 border-t-gray-200 border-r-gray-200 border-b-gray-200"
                    : "border-gray-200"
                }`}
                onClick={() => handleMarkRead(notification)}
              >
                <div className="flex items-start gap-4 p-5">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg ${typeBg[notification.notification_type] || typeBg.system}`}>
                    {typeIcons[notification.notification_type] || "📋"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`font-semibold text-sm ${!notification.is_read ? "text-gray-900" : "text-gray-500"}`}>
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{notification.message}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {!notification.is_read ? (
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                        ) : null}
                        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500 capitalize whitespace-nowrap">
                          {notification.notification_type.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                      <span className="text-xs text-gray-400">
                        {notification.created_at ? new Date(notification.created_at).toLocaleString() : "recently"}
                      </span>
                      {notification.action_url ? (
                        <a
                          href={notification.action_url}
                          className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell className="h-6 w-6" />}
          title="No notifications"
          description="Notifications will appear here when candidates apply, interviews are due, or jobs expire."
        />
      )}
    </div>
  );
}
