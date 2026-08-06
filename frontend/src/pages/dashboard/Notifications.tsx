import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Settings, 
  Activity, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  ShieldCheck,
  Calendar,
  ChevronRight,
  MoreVertical,
  Check
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom'; 

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: "New AI Analysis Ready",
      desc: "Your Blood Panel report from May 24 has been fully analyzed.",
      time: "2 hours ago",
      type: "success",
      icon: Sparkles,
      unread: true,
      link: "/dashboard/analysis/1"
    },
    {
      id: '2',
      title: "Medication Reminder",
      desc: "It's time for your daily Vitamin D supplement.",
      time: "Today, 10:00 AM",
      type: "info",
      icon: Calendar,
      unread: true
    },
    {
      id: '3',
      title: "Potential Trend Alert",
      desc: "We noticed a slight upward trend in your fasting glucose. Click to see details.",
      time: "Yesterday",
      type: "warning",
      icon: AlertCircle,
      unread: true,
      link: "/dashboard/timeline"
    },
    {
      id: '4',
      title: "Support Ticket Resolved",
      desc: "Your question about MRI upload limits has been answered by our team.",
      time: "2 days ago",
      type: "info",
      icon: MessageSquare,
      unread: false
    },
    {
      id: '5',
      title: "Security Update",
      desc: "New medical data privacy standards have been applied to your account.",
      time: "May 15",
      type: "success",
      icon: ShieldCheck,
      unread: false
    }
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    toast.success('All notifications marked as read');
  };

  const markRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const handleViewDetails = (n: any) => {
    markRead(n.id);
    if (n.link) {
      navigate(n.link);
    } else {
      toast.info(`Subject: ${n.title}`, {
        description: n.desc,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
           <p className="text-muted-foreground mt-1">Stay updated with your latest health events and AI insights.</p>
        </div>
        <Button 
          variant="outline" 
          className="rounded-xl text-primary font-bold border-primary/20 hover:bg-primary/5 h-11"
          onClick={markAllRead}
        >
          Mark all as read
        </Button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {notifications.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card 
                className={`rounded-[2.5rem] border-none shadow-sm group hover:shadow-md transition-all cursor-pointer overflow-hidden ${n.unread ? 'bg-background ring-1 ring-primary/10' : 'bg-muted/30 opacity-70'}`}
                onClick={() => markRead(n.id)}
              >
                <CardContent className="p-6 flex items-start gap-6 relative">
                   {n.unread && <div className="absolute top-6 right-8 w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.8)]" />}
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                     n.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                     n.type === 'warning' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                     'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                   }`}>
                      <n.icon className="h-6 w-6" />
                   </div>
                   <div className="flex-1 space-y-2 pr-10">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                         <h3 className="font-bold text-lg leading-none">{n.title}</h3>
                         <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest bg-muted px-2 py-0.5 rounded-full">{n.time}</span>
                      </div>
                      <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-2xl">{n.desc}</p>
                      <div className="flex gap-4 pt-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 px-0 text-primary font-bold gap-1 hover:bg-transparent group/btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(n);
                          }}
                        >
                           View details <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                        {n.unread && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-9 px-0 text-muted-foreground font-bold gap-1 hover:bg-transparent hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              markRead(n.id);
                            }}
                          >
                             <Check className="h-4 w-4" /> Mark as read
                          </Button>
                        )}
                      </div>
                   </div>
                   <div className="absolute top-6 right-6 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 hover:bg-background">
                         <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </Button>
                   </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
