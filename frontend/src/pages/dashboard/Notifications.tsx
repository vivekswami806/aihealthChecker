import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  AlertCircle,
  ShieldAlert,
  Calendar,
  ChevronRight,
  Check,
  Trash2,
  Loader2,
  Bell,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

type NotificationType = 'INFO' | 'WARNING' | 'ALERT' | 'REMINDER';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

const typeMeta: Record<
  NotificationType,
  { icon: typeof Sparkles; color: string; label: string }
> = {
  INFO: {
    icon: Sparkles,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    label: 'Info',
  },
  WARNING: {
    icon: AlertCircle,
    color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    label: 'Warning',
  },
  ALERT: {
    icon: ShieldAlert,
    color: 'bg-red-500/10 text-red-500 border-red-500/20',
    label: 'Alert',
  },
  REMINDER: {
    icon: Calendar,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    label: 'Reminder',
  },
};

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  });

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/notifications/`, {
        headers: authHeaders(),
      });
      const payload = response.data?.data;
      const list = payload?.notifications || payload || [];
      setNotifications(Array.isArray(list) ? list : []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const countsByType = notifications.reduce(
    (acc, n) => {
      if (!n.isRead) acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const notifyLayout = () => {
    window.dispatchEvent(new Event('notifications:updated'));
  };

  const markRead = async (id: string) => {
    try {
      setBusyId(id);
      await axios.put(`${API_URL}/notifications/${id}/read`, {}, { headers: authHeaders() });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      notifyLayout();
    } catch {
      toast.error('Failed to mark as read');
    } finally {
      setBusyId(null);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${API_URL}/notifications/read-all`, {}, { headers: authHeaders() });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      notifyLayout();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      setBusyId(id);
      await axios.delete(`${API_URL}/notifications/${id}`, { headers: authHeaders() });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      notifyLayout();
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <Badge className="rounded-full h-6 min-w-6 px-2">{unreadCount}</Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with your latest health events and AI insights.
          </p>
          {unreadCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {(Object.keys(typeMeta) as NotificationType[]).map((type) =>
                countsByType[type] ? (
                  <Badge key={type} variant="outline" className="rounded-full">
                    {typeMeta[type].label}: {countsByType[type]}
                  </Badge>
                ) : null
              )}
            </div>
          )}
        </div>
        <Button
          variant="outline"
          className="rounded-xl text-primary font-bold border-primary/20 hover:bg-primary/5 h-11"
          onClick={markAllRead}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <Card className="rounded-[2.5rem] border-none shadow-sm">
          <CardContent className="py-20 text-center space-y-3">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-xl font-bold">No notifications yet</h3>
            <p className="text-muted-foreground">
              You&apos;ll see analysis updates and health alerts here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {notifications.map((n, i) => {
              const meta = typeMeta[n.type] || typeMeta.INFO;
              const Icon = meta.icon;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    className={`rounded-[2.5rem] border-none shadow-sm group hover:shadow-md transition-all overflow-hidden ${
                      !n.isRead
                        ? 'bg-background ring-1 ring-primary/10'
                        : 'bg-muted/30 opacity-70'
                    }`}
                  >
                    <CardContent className="p-6 flex items-start gap-6 relative">
                      {!n.isRead && (
                        <div className="absolute top-6 right-8 w-2.5 h-2.5 bg-primary rounded-full" />
                      )}
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${meta.color}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 space-y-2 pr-10">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h3 className="font-bold text-lg leading-none">{n.title}</h3>
                          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest bg-muted px-2 py-0.5 rounded-full">
                            {formatRelativeTime(n.createdAt)}
                          </span>
                          <Badge variant="outline" className="rounded-full text-[10px] w-fit">
                            {meta.label}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-2xl">
                          {n.message}
                        </p>
                        <div className="flex gap-4 pt-1">
                          {!n.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 px-0 text-muted-foreground font-bold gap-1 hover:bg-transparent hover:text-foreground"
                              disabled={busyId === n.id}
                              onClick={() => markRead(n.id)}
                            >
                              <Check className="h-4 w-4" /> Mark as read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-0 text-destructive font-bold gap-1 hover:bg-transparent"
                            disabled={busyId === n.id}
                            onClick={() => deleteNotification(n.id)}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </Button>
                        </div>
                      </div>
                      {!n.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-6 right-6 rounded-xl h-8 w-8"
                          onClick={() => markRead(n.id)}
                        >
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
