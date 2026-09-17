import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Activity,
  Heart,
  Droplets,
  Thermometer,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Clock,
  FileText,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

type ChartPoint = { name: string; score: number; glucose?: number | null; bp?: number | null };

export default function DashboardHome() {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [activeMetric, setActiveMetric] = useState<'score' | 'glucose'>('score');
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`${API_URL}/users/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboard(res.data?.data || null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const healthScore = dashboard?.healthScore;
  const chartData: ChartPoint[] =
    dashboard?.chartData?.length > 0
      ? dashboard.chartData
      : [{ name: 'Now', score: healthScore?.score ?? 0, glucose: healthScore?.sugarLevel ?? null }];

  const recentReports = dashboard?.recentReports || [];
  const insights = dashboard?.insights || [];
  const diseases = dashboard?.diseases || [];
  const stats = dashboard?.reportStats || {};

  const scoreValue = healthScore?.score != null ? Math.round(healthScore.score) : '—';
  const sugarValue = healthScore?.sugarLevel != null ? healthScore.sugarLevel : '—';
  const bpValue = healthScore?.bloodPressure || '—';
  const bmiValue = healthScore?.bmi != null ? healthScore.bmi : '—';
  const scoreTrend = healthScore?.trend;
  const displayName = user?.name || dashboard?.profile?.fullName || 'there';

  const statusLabel = (status: string) => {
    if (status === 'COMPLETED') return 'Complete';
    if (status === 'PROCESSING') return 'Processing';
    if (status === 'FAILED') return 'Failed';
    return 'Pending';
  };

  const statusStyle = (status: string) => {
    if (status === 'COMPLETED') return 'text-green-500 bg-green-500/10';
    if (status === 'PROCESSING') return 'text-blue-500 bg-blue-500/10';
    if (status === 'FAILED') return 'text-red-500 bg-red-500/10';
    return 'text-orange-500 bg-orange-500/10';
  };

  return (
    <div className="space-y-8 max-w-screen-2xl mx-auto pb-10">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            {stats.completedReports
              ? `You have ${stats.completedReports} analyzed report${stats.completedReports === 1 ? '' : 's'} and ${stats.pendingReports || 0} pending.`
              : 'Upload a medical report to start your health overview.'}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/timeline">
            <Button variant="outline" className="rounded-xl h-11 px-6 font-semibold">
              Health Timeline
            </Button>
          </Link>
          <Link to="/dashboard/upload">
            <Button className="rounded-xl h-11 gap-2 shadow-lg shadow-primary/20 px-6 font-semibold">
              <Plus className="h-5 w-5" /> Upload New Report
            </Button>
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Health Score',
            value: String(scoreValue),
            unit: '/100',
            icon: Sparkles,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            trend:
              scoreTrend != null
                ? `${scoreTrend > 0 ? '+' : ''}${scoreTrend}`
                : `${stats.completedReports || 0} reports`,
            isUp: scoreTrend == null ? true : scoreTrend >= 0,
            onClick: () => setActiveMetric('score'),
          },
          {
            label: 'Blood Pressure',
            value: String(bpValue),
            unit: bpValue === '—' ? '' : 'mmHg',
            icon: Heart,
            color: 'text-red-500',
            bg: 'bg-red-500/10',
            trend: `${stats.totalReports || 0} uploads`,
            isUp: true,
          },
          {
            label: 'Blood Glucose',
            value: String(sugarValue),
            unit: sugarValue === '—' ? '' : 'mg/dL',
            icon: Droplets,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            trend: diseases[0]?.diseaseName || 'No conditions',
            isUp: false,
            onClick: () => setActiveMetric('glucose'),
          },
          {
            label: 'BMI',
            value: String(bmiValue),
            unit: '',
            icon: Thermometer,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            trend: `${dashboard?.unreadNotifications || 0} alerts`,
            isUp: true,
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={stat.onClick}
            className="cursor-pointer"
          >
            <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <Badge
                    variant="secondary"
                    className={`rounded-full ${stat.isUp ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'}`}
                  >
                    {stat.isUp ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {stat.trend}
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
                    <span className="text-sm font-medium text-muted-foreground">{stat.unit}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-2xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <div className="space-y-1">
              <CardTitle className="text-xl">Health Progression</CardTitle>
              <CardDescription>
                Built from your real health score history after AI analysis
              </CardDescription>
            </div>
            <div className="flex gap-2 p-1 bg-muted rounded-xl">
              <button
                onClick={() => setActiveMetric('score')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${activeMetric === 'score' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
              >
                Health Score
              </button>
              <button
                onClick={() => setActiveMetric('glucose')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${activeMetric === 'glucose' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
              >
                Glucose
              </button>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              {chartData.length === 0 || (chartData.length === 1 && chartData[0].score === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <Activity className="h-10 w-10 opacity-40" />
                  <p className="text-sm">No health score history yet. Analyze a report to populate this chart.</p>
                  <Button onClick={() => navigate('/dashboard/upload')} className="rounded-xl">
                    Upload Report
                  </Button>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={activeMetric === 'score' ? 'var(--color-primary)' : '#3b82f6'}
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor={activeMetric === 'score' ? 'var(--color-primary)' : '#3b82f6'}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={activeMetric}
                      stroke={activeMetric === 'score' ? 'var(--color-primary)' : '#3b82f6'}
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorScore)"
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none bg-primary text-primary-foreground shadow-xl shadow-primary/20 flex flex-col relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 fill-current" />
              <Badge
                variant="outline"
                className="text-primary-foreground border-primary-foreground/20 bg-primary-foreground/10 uppercase text-[10px] tracking-widest font-bold"
              >
                Live AI Insights
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold leading-tight">AI Insights Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="space-y-4">
              {insights.length === 0 ? (
                <div className="bg-white/10 p-4 rounded-xl border border-white/10 text-sm">
                  No AI insights yet. Upload and analyze a report to see personalized findings here.
                </div>
              ) : (
                insights.slice(0, 2).map((insight: any) => (
                  <div
                    key={insight.id}
                    className="flex items-start gap-3 bg-white/10 p-4 rounded-xl border border-white/10 hover:bg-white/15 transition-colors cursor-pointer"
                    onClick={() => navigate(`/dashboard/analysis/${insight.reportId}`)}
                  >
                    <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold opacity-70 mb-1">
                        {insight.disease} · {insight.severity}
                      </p>
                      <p className="text-sm">{insight.summary}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs uppercase tracking-widest font-semibold opacity-70 mb-3">
                Suggestion
              </p>
              <h4 className="font-bold text-lg mb-2">Based on your latest analysis</h4>
              <p className="text-sm opacity-80">{dashboard?.suggestion}</p>
            </div>
          </CardContent>
          <CardContent className="pt-0">
            <Button
              variant="outline"
              className="w-full bg-white/20 border-white/30 text-white hover:bg-white hover:text-primary rounded-xl h-12 transition-all font-bold"
              onClick={() =>
                navigate(
                  insights[0]?.reportId
                    ? `/dashboard/analysis/${insights[0].reportId}`
                    : '/dashboard/upload'
                )
              }
            >
              {insights[0] ? 'Full AI Breakdown' : 'Upload First Report'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-2xl border-none shadow-sm h-full overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Recent Medical Reports</CardTitle>
              <CardDescription>Your most recent uploads and their status</CardDescription>
            </div>
            <Link to="/dashboard/history">
              <Button variant="ghost" size="sm" className="gap-1 font-bold rounded-lg">
                View all <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm mb-4">No reports uploaded yet</p>
                  <Button onClick={() => navigate('/dashboard/upload')} className="rounded-xl">
                    Upload Report
                  </Button>
                </div>
              ) : (
                recentReports.map((report: any) => (
                  <div
                    key={report.id}
                    onClick={() => navigate(`/dashboard/analysis/${report.id}`)}
                    className="flex items-center justify-between group cursor-pointer hover:bg-muted/40 p-3 rounded-2xl transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <FileText className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm tracking-tight">{report.name}</h4>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                          {new Date(report.date).toLocaleDateString()} ·{' '}
                          {report.disease || report.type || 'Report'}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`border-none rounded-full font-bold px-3 ${statusStyle(report.status)}`}
                    >
                      {statusLabel(report.status)}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm h-full overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Tracked Conditions</CardTitle>
              <CardDescription>From your disease history after AI analysis</CardDescription>
            </div>
            <Badge className="bg-primary/10 text-primary border-none">
              {diseases.length} Active
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {diseases.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No conditions tracked yet. They appear automatically after report analysis.
              </div>
            ) : (
              diseases.map((disease: any) => (
                <div
                  key={disease.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border-2 border-transparent hover:border-primary/20 transition-all"
                >
                  <div className="w-11 h-11 bg-background rounded-xl flex items-center justify-center border shadow-sm shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{disease.diseaseName}</h4>
                    <p className="text-xs text-muted-foreground">
                      {disease.currentStatus} · seen {disease.recurrenceCount}x · last{' '}
                      {new Date(disease.lastDetected).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            <Button
              variant="outline"
              className="w-full mt-2 rounded-xl border-dashed h-12 font-bold gap-2"
              onClick={() => navigate('/dashboard/history')}
            >
              <Activity className="h-5 w-5" /> View Medical History
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
