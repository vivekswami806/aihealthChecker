import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Activity,
  Calendar,
  ChevronRight,
  Loader2,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

interface TimelineEvent {
  id: string;
  date: string;
  reportName: string;
  type?: string;
  status?: string;
  analysis?: {
    id: string;
    diseaseDetected: string;
    severity: string;
    riskScore: number;
    summary?: string;
  } | null;
}

const severityColor = (severity?: string) => {
  switch (severity?.toUpperCase()) {
    case 'LOW':
      return 'bg-green-500/10 text-green-600';
    case 'MEDIUM':
      return 'bg-yellow-500/10 text-yellow-600';
    case 'HIGH':
      return 'bg-orange-500/10 text-orange-600';
    case 'CRITICAL':
      return 'bg-red-500/10 text-red-600';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default function HealthTimeline() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_URL}/health/timeline`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data?.data;
        setEvents(Array.isArray(data) ? data : []);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load timeline');
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, []);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Progression</h1>
          <p className="text-muted-foreground mt-1">
            Track your reports, severity, and risk scores over time.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl h-11"
          onClick={() => navigate('/dashboard/upload')}
        >
          <FileText className="h-4 w-4 mr-2" /> Upload Report
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="rounded-[2.5rem] border-none shadow-sm">
          <CardContent className="py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">No health events yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Upload and analyze a medical report to start building your health timeline.
            </p>
            <Button
              className="rounded-xl"
              onClick={() => navigate('/dashboard/upload')}
            >
              Upload your first report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold px-2">Key Health Events</h3>
          <div className="space-y-4">
            {[...events].reverse().map((event, i) => {
              const severity = event.analysis?.severity;
              const riskScore = event.analysis?.riskScore;
              const disease = event.analysis?.diseaseDetected;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex gap-6 p-6 bg-background rounded-3xl border border-transparent hover:border-primary/20 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/dashboard/analysis/${event.id}`)}
                >
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center z-10 transition-transform group-hover:scale-110">
                      {severity === 'CRITICAL' || severity === 'HIGH' ? (
                        <AlertTriangle className="h-6 w-6" />
                      ) : (
                        <Activity className="h-6 w-6" />
                      )}
                    </div>
                    {i !== events.length - 1 && (
                      <div className="w-0.5 h-full bg-muted mt-2 group-hover:bg-primary/20 transition-colors" />
                    )}
                  </div>
                  <div className="space-y-2 pb-2 flex-1 min-w-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(event.date)}
                    </p>
                    <h4 className="text-lg font-bold group-hover:text-primary transition-colors truncate">
                      {event.reportName}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {disease && (
                        <Badge variant="outline" className="rounded-full">
                          {disease}
                        </Badge>
                      )}
                      {severity && (
                        <Badge className={`border-none rounded-full ${severityColor(severity)}`}>
                          {severity}
                        </Badge>
                      )}
                      {typeof riskScore === 'number' && (
                        <Badge variant="secondary" className="rounded-full">
                          Risk: {riskScore}
                        </Badge>
                      )}
                      {!event.analysis && (
                        <Badge className="border-none rounded-full bg-orange-500/10 text-orange-500">
                          Pending analysis
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center self-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 p-0 rounded-full bg-muted/50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
