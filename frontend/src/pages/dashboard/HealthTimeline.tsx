import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  Info, 
  Filter,
  Download,
  Share2,
  ChevronRight,
  Droplets,
  Heart,
  Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

const timelineData = [
  { date: '2023-01', weight: 82, glucose: 115, bp_systolic: 125, cholesterol: 210, score: 72 },
  { date: '2023-03', weight: 81, glucose: 112, bp_systolic: 122, cholesterol: 205, score: 74 },
  { date: '2023-06', weight: 80, glucose: 108, bp_systolic: 120, cholesterol: 198, score: 78 },
  { date: '2023-09', weight: 81, glucose: 105, bp_systolic: 121, cholesterol: 195, score: 80 },
  { date: '2023-12', weight: 79, glucose: 102, bp_systolic: 118, cholesterol: 190, score: 82 },
  { date: '2024-03', weight: 78, glucose: 98, bp_systolic: 115, cholesterol: 185, score: 85 },
  { date: '2024-05', weight: 77, glucose: 95, bp_systolic: 112, cholesterol: 182, score: 88 }
];

export default function HealthTimeline() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Health Progression</h1>
           <p className="text-muted-foreground mt-1">Visualize your medical markers and wellness trends over time.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-xl h-11"><Filter className="h-4 w-4 mr-2" /> All Markers</Button>
           <Button variant="outline" className="rounded-xl h-11"><Download className="h-4 w-4 mr-2" /> PDF Export</Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: "Weight Progression", value: "-5.0 kg", trend: "Loss", color: "text-green-500", icon: Activity, detail: "Consistent downward trend, within healthy BMI range." },
           { label: "Cholesterol Trend", value: "-28 mg/dL", trend: "Improving", color: "text-green-500", icon: Droplets, detail: "Stable reduction in LDL markers since dietary changes." },
           { label: "Average Health Score", value: "81", trend: "+16%", color: "text-blue-500", icon: Brain, detail: "Overall systemic improvement detected across all panels." },
         ].map((stat, i) => (
           <Card key={i} className="rounded-2xl border-none shadow-sm h-full flex flex-col justify-between">
              <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                       <stat.icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <Badge variant="outline" className={`border-none rounded-full px-3 ${stat.color === 'text-green-500' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                       {stat.trend}
                    </Badge>
                 </div>
                 <div className="space-y-4">
                    <div>
                       <h4 className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1">{stat.label}</h4>
                       <p className="text-3xl font-black">{stat.value}</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                       {stat.detail}
                    </p>
                 </div>
              </CardContent>
           </Card>
         ))}
      </div>

      {/* Main Timeline Chart Section */}
      <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden p-4 md:p-8">
         <Tabs defaultValue="glucose" className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div>
                  <h3 className="text-xl font-bold">Interactive Trend Analysis</h3>
                  <p className="text-sm text-muted-foreground">Select a marker to see its progression over the last 18 months.</p>
               </div>
               <TabsList className="bg-muted/50 rounded-2xl p-1 h-auto flex flex-wrap max-w-full">
                  <TabsTrigger value="glucose" className="rounded-xl px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Glucose</TabsTrigger>
                  <TabsTrigger value="bp" className="rounded-xl px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Blood Pressure</TabsTrigger>
                  <TabsTrigger value="cholesterol" className="rounded-xl px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Cholesterol</TabsTrigger>
                  <TabsTrigger value="weight" className="rounded-xl px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Weight</TabsTrigger>
               </TabsList>
            </div>

            <TabsContent value="glucose" className="space-y-4 h-[450px]">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                     <defs>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                           <stop offset="0%" stopColor="#3b82f6" />
                           <stop offset="100%" stopColor="#60a5fa" />
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                     <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        dy={10}
                     />
                     <YAxis 
                        domain={['auto', 'auto']}
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                     />
                     <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '4 4' }}
                     />
                     <Line 
                        type="monotone" 
                        dataKey="glucose" 
                        stroke="url(#lineGrad)" 
                        strokeWidth={4} 
                        dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                        animationDuration={1500}
                     />
                  </LineChart>
               </ResponsiveContainer>
            </TabsContent>
            
            {/* Same structure for other tabs, slightly different keys */}
            <TabsContent value="bp" className="h-[450px]">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                     <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                     <Line type="monotone" dataKey="bp_systolic" stroke="#ef4444" strokeWidth={4} dot={{ r: 6, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} />
                  </LineChart>
               </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="cholesterol" className="h-[450px]">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                     <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                     <Line type="monotone" dataKey="cholesterol" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} />
                  </LineChart>
               </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="weight" className="h-[450px]">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                     <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                     <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                  </LineChart>
               </ResponsiveContainer>
            </TabsContent>
         </Tabs>

         <div className="pt-8 flex items-center justify-center border-t border-muted-foreground/10 mt-8">
            <div className="flex gap-12 text-sm text-muted-foreground">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Normal Range</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>Borderline High</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Critical Alert</span>
               </div>
            </div>
         </div>
      </Card>

      {/* Timeline Events */}
      <div className="space-y-6">
         <h3 className="text-2xl font-bold px-2">Key Health Events</h3>
         <div className="space-y-4">
            {[
              { date: "May 20, 2024", title: "Target Weight Achieved", desc: "You've successfully reached your target weight of 77kg. System predicts 15% lower metabolic risk.", icon: Activity, color: "text-green-500", bg: "bg-green-500/10" },
              { date: "March 12, 2024", title: "HbA1c Improvement", desc: "A significant 0.4% drop in HbA1c levels detected. Exercise consistency reported at 85%.", icon: Droplets, color: "text-blue-500", bg: "bg-blue-500/10" },
              { date: "Jan 05, 2024", title: "Exercise Routine Change", desc: "Reported increase in strength training frequency (3x weekly). Heart rate recovery improved.", icon: Heart, color: "text-red-500", bg: "bg-red-500/10" },
              { date: "Dec 15, 2023", title: "Medication Refill", desc: "Metformin schedule updated. AI suggests monitoring for vitamin B12 levels next visit.", icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10" }
            ].map((event, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group flex gap-6 p-6 bg-background rounded-3xl border border-transparent hover:border-primary/20 hover:shadow-lg transition-all cursor-pointer relative"
              >
                 <div className="flex flex-col items-center shrink-0">
                    <div className={`w-12 h-12 rounded-2xl ${event.bg} ${event.color} flex items-center justify-center z-10 transition-transform group-hover:scale-110`}>
                       <event.icon className="h-6 w-6" />
                    </div>
                    {i !== 3 && <div className="w-0.5 h-full bg-muted mt-2 group-hover:bg-primary/20 transition-colors" />}
                 </div>
                 <div className="space-y-1 pb-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{event.date}</p>
                    <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{event.title}</h4>
                    <p className="text-muted-foreground leading-relaxed italic">{event.desc}</p>
                 </div>
                 <div className="ml-auto flex items-center self-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-10 w-10 p-0 rounded-full bg-muted/50">
                       <ChevronRight className="h-5 w-5" />
                    </Button>
                 </div>
              </motion.div>
            ))}
         </div>
      </div>
    </div>
  );
}
