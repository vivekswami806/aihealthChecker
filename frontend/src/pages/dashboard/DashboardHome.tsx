import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Activity, 
  Heart, 
  Droplets, 
  Thermometer, 
  ArrowUpRight, 
  ArrowDownRight, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Clock,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

const data = [
  { name: 'Jan', score: 65, glucose: 110, bp: 120 },
  { name: 'Feb', score: 68, glucose: 105, bp: 118 },
  { name: 'Mar', score: 75, glucose: 98, bp: 115 },
  { name: 'Apr', score: 72, glucose: 102, bp: 116 },
  { name: 'May', score: 82, glucose: 95, bp: 112 },
  { name: 'Jun', score: 85, glucose: 92, bp: 110 },
];

export default function DashboardHome() {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [activeMetric, setActiveMetric] = useState<'score' | 'glucose'>('score');

  const handleDownload = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Preparing your comprehensive health report...',
        success: 'Health Report downloaded successfully!',
        error: 'Failed to generate report'
      }
    );
  };

  const handleAddReminder = () => {
    toast.info('Reminder system initialized. Create a new reminder in your settings.');
  };

  return (
    <div className="space-y-8 max-w-screen-2xl mx-auto pb-10">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Welcome back, {user.name}</h1>
          <p className="text-muted-foreground mt-1 text-lg">Here is a quick overview of your health since your last check-in.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-11 px-6 font-semibold" onClick={handleDownload}>Download Report</Button>
          <Link to="/dashboard/upload">
            <Button className="rounded-xl h-11 gap-2 shadow-lg shadow-primary/20 px-6 font-semibold">
              <Plus className="h-5 w-5" /> Upload New Report
            </Button>
          </Link>
        </div>
      </section>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: "Health Score", value: "85", unit: "/100", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10", trend: "+5.4%", isUp: true, onClick: () => setActiveMetric('score') },
           { label: "Heart Rate", value: "72", unit: "BPM", icon: Heart, color: "text-red-500", bg: "bg-red-500/10", trend: "-2.1%", isUp: false },
           { label: "Blood Glucose", value: "92", unit: "mg/dL", icon: Droplets, color: "text-blue-500", bg: "bg-blue-500/10", trend: "-4.2%", isUp: false, onClick: () => setActiveMetric('glucose') },
           { label: "Body Temp", value: "98.6", unit: "°F", icon: Thermometer, color: "text-orange-500", bg: "bg-orange-500/10", trend: "0.0%", isUp: true },
         ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={stat.onClick}
              className="cursor-pointer"
            >
              <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                          <stat.icon className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary" className={`rounded-full ${stat.isUp ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'}`}>
                          {stat.isUp ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
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
        {/* Main Chart */}
        <Card className="lg:col-span-2 rounded-2xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <div className="space-y-1">
              <CardTitle className="text-xl">Health Progression</CardTitle>
              <CardDescription>Visualizing your wellness journey over time</CardDescription>
            </div>
            <div className="flex gap-2 p-1 bg-muted rounded-xl">
               <button 
                  onClick={() => setActiveMetric('score')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${activeMetric === 'score' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
               >
                 Health Score
               </button>
               <button 
                  onClick={() => setActiveMetric('glucose')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${activeMetric === 'glucose' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
               >
                 Glucose
               </button>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeMetric === 'score' ? "var(--color-primary)" : "#3b82f6"} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={activeMetric === 'score' ? "var(--color-primary)" : "#3b82f6"} stopOpacity={0}/>
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
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={activeMetric} 
                    stroke={activeMetric === 'score' ? "var(--color-primary)" : "#3b82f6"} 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights Card */}
        <Card className="rounded-2xl border-none bg-primary text-primary-foreground shadow-xl shadow-primary/20 flex flex-col group overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
               <Sparkles className="h-5 w-5 fill-current" />
               <Badge variant="outline" className="text-primary-foreground border-primary-foreground/20 bg-primary-foreground/10 uppercase text-[10px] tracking-widest font-bold">Pro AI Analysis</Badge>
            </div>
            <CardTitle className="text-2xl font-bold leading-tight">AI Insights Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="space-y-4">
               <div className="flex items-start gap-3 bg-white/10 p-4 rounded-xl border border-white/10 hover:bg-white/15 transition-colors cursor-pointer">
                  <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-sm">Your cholesterol levels have improved by 12% compared to March reports.</p>
               </div>
               <div className="flex items-start gap-3 bg-white/10 p-4 rounded-xl border border-white/10 hover:bg-white/15 transition-colors cursor-pointer">
                  <Activity className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-sm">Consistent heart rate patterns detected. Good cardiovascular recovery.</p>
               </div>
            </div>
            
            <div className="pt-4 border-t border-white/10">
               <p className="text-xs uppercase tracking-widest font-semibold opacity-70 mb-3">Today's Suggestion</p>
               <h4 className="font-bold text-lg mb-2">Increase hydration to 3L</h4>
               <p className="text-sm opacity-80">Based on your recent electrolyte panel and reported activity levels.</p>
            </div>
          </CardContent>
          <CardContent className="pt-0">
             <Button 
                variant="outline" 
                className="w-full bg-white/20 border-white/30 text-white hover:bg-white hover:text-primary rounded-xl h-12 transition-all font-bold"
                onClick={() => navigate('/dashboard/analysis/1')}
              >
                Full AI Breakdown
             </Button>
          </CardContent>
          <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Recent Reports Table */}
         <Card className="rounded-2xl border-none shadow-sm h-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-xl">Recent Medical Reports</CardTitle>
                  <CardDescription>Your most recent uploads and their status</CardDescription>
               </div>
               <Link to="/dashboard/history">
                 <Button variant="ghost" size="sm" className="gap-1 font-bold rounded-lg hover:bg-primary/5 hover:text-primary">View all <ChevronRight className="h-4 w-4" /></Button>
               </Link>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {[
                    { id: '1', name: "Blood Panel Results", date: "May 24, 2024", type: "Laboratory", status: "Complete", color: "text-green-500", bg: "bg-green-500/10" },
                    { id: '2', name: "Chest X-Ray Analysis", date: "May 12, 2024", type: "Imaging", status: "Complete", color: "text-green-500", bg: "bg-green-500/10" },
                    { id: '3', name: "MRI Brain Scan", date: "April 28, 2024", type: "Neurology", status: "Pending", color: "text-orange-500", bg: "bg-orange-500/10" },
                    { id: '4', name: "Cardiac Stress Test", date: "April 15, 2024", type: "Cardiology", status: "Complete", color: "text-green-500", bg: "bg-green-500/10" },
                  ].map((report, i) => (
                    <div 
                      key={i} 
                      onClick={() => navigate(`/dashboard/analysis/${report.id}`)}
                      className="flex items-center justify-between group cursor-pointer hover:bg-muted/40 p-3 rounded-2xl transition-all"
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                             <FileText className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                             <h4 className="font-bold text-sm tracking-tight">{report.name}</h4>
                             <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{report.date} • {report.type}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <Badge variant="outline" className={`border-none rounded-full ${report.bg} ${report.color} font-bold px-3`}>{report.status}</Badge>
                          <div className="w-8 h-8 rounded-full bg-background border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:scale-110 shadow-sm">
                             <ChevronRight className="h-4 w-4 text-primary" />
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         {/* Upcoming Reminders */}
         <Card className="rounded-2xl border-none shadow-sm h-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-xl">Upcoming Reminders</CardTitle>
                  <CardDescription>Stay on top of your health schedule</CardDescription>
               </div>
               <Badge className="bg-primary/10 text-primary border-none">3 Active</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
               {[
                 { title: "Annual Vitamin D Checkup", time: "Tomorrow, 10:30 AM", type: "Appointment", icon: Clock },
                 { title: "Refill Heart Medication", time: "Friday, 02:00 PM", type: "Pharmacy", icon: Droplets },
                 { title: "Eye Exam Appointment", time: "Next Monday, 09:00 AM", type: "Ophthalmology", icon: Activity },
               ].map((reminder, i) => (
                 <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer group">
                    <div className="w-11 h-11 bg-background rounded-xl flex items-center justify-center border shadow-sm shrink-0 group-hover:bg-primary/5 transition-colors">
                       <reminder.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                       <h4 className="font-bold text-sm">{reminder.title}</h4>
                       <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {reminder.time}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-lg font-semibold hover:bg-destructive/10 hover:text-destructive">Dismiss</Button>
                 </div>
               ))}
               <Button 
                variant="outline" 
                className="w-full mt-2 rounded-xl border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all h-12 font-bold gap-2"
                onClick={handleAddReminder}
               >
                  <Plus className="h-5 w-5" /> Add New Reminder
               </Button>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
