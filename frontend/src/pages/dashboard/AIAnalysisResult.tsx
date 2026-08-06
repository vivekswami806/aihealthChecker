import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Download, 
  Share2, 
  Stethoscope, 
  Utensils, 
  Activity, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  BrainCircuit,
  HeartPulse,
  Syringe,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';
import { toast } from 'sonner';

const riskData = [
  { subject: 'Cardiovascular', A: 40, fullMark: 100 },
  { subject: 'Metabolic', A: 85, fullMark: 100 },
  { subject: 'Inflammation', A: 65, fullMark: 100 },
  { subject: 'Kidney Health', A: 90, fullMark: 100 },
  { subject: 'Liver Function', A: 82, fullMark: 100 },
  { subject: 'Electrolytes', A: 70, fullMark: 100 },
];

export default function AIAnalysisResult() {
  const navigate = useNavigate();

  const handleExport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Generating clinical report PDF...',
        success: 'Report exported successfully!',
        error: 'Failed to export report'
      }
    );
  };

  const handleShare = () => {
    toast.success('Secure sharing link copied to clipboard!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm border border-primary/20">
              <FileText className="h-8 w-8" />
           </div>
           <div>
              <div className="flex items-center gap-2">
                 <h1 className="text-3xl font-bold tracking-tight">Blood Panel Analysis</h1>
                 <Badge className="bg-green-500/10 text-green-500 border-none px-3 font-bold">Verified by AI</Badge>
              </div>
              <p className="text-muted-foreground mt-1 text-lg font-medium">Report ID: #RP-2024-05-24 • Analyzed on May 24, 2024</p>
           </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <Button variant="outline" className="flex-1 md:flex-none rounded-xl gap-2 h-11 px-6 font-bold" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export PDF
           </Button>
           <Button variant="outline" className="flex-1 md:flex-none rounded-xl gap-2 h-11 px-6 font-bold" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> Share
           </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Summary */}
         <Card className="lg:col-span-2 rounded-[2rem] border-none shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div className="flex-1 p-8 space-y-6">
               <div className="space-y-4">
                  <Badge variant="secondary" className="px-3 py-1 bg-primary/5 text-primary">Report Summary</Badge>
                  <h2 className="text-2xl font-bold leading-tight">Generally healthy profile with mild metabolic fluctuations.</h2>
                  <p className="text-muted-foreground leading-relaxed">
                     Your overall health markers are within the normal range. However, we've detected some slight elevations in your HbA1c levels compared to your previous baseline from 6 months ago. Cardiovascular and kidney markers remain excellent.
                  </p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-4 rounded-2xl border border-muted-foreground/10">
                     <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Status</div>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="font-bold">Good Standing</span>
                     </div>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-2xl border border-muted-foreground/10">
                     <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Key Concern</div>
                     <span className="font-bold text-orange-500">Early Glycaemic Shift</span>
                  </div>
               </div>
            </div>
            <div className="md:w-72 bg-muted/50 p-8 flex flex-col items-center justify-center border-l gap-4 text-center">
               <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                     <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted" />
                     <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364.4" strokeDashoffset="54.6" className="text-primary" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-3xl font-black">85</span>
                     <span className="text-[10px] text-muted-foreground uppercase font-bold">Health Score</span>
                  </div>
               </div>
               <div className="space-y-1">
                  <div className="text-sm font-bold text-green-500 flex items-center justify-center gap-1">
                     <TrendingUp className="h-4 w-4" /> Improving 
                  </div>
                  <p className="text-xs text-muted-foreground">+3 points since March</p>
               </div>
            </div>
         </Card>

         {/* Severity Indicators */}
         <Card className="rounded-[2rem] border-none shadow-sm p-8 bg-gradient-to-br from-background to-muted/20">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
               <BrainCircuit className="h-5 w-5 text-primary" /> Risk Score Radar
            </h3>
            <div className="h-[200px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={riskData}>
                     <PolarGrid stroke="hsl(var(--muted))" />
                     <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                     <Radar name="Health" dataKey="A" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.2} />
                  </RadarChart>
               </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-3">
               <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">General Wellness</span>
                  <span className="font-bold">Very High</span>
               </div>
               <Progress value={92} className="h-2" />
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Detailed Markers */}
         <div className="lg:col-span-2 space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-2 mt-4 px-2">
               Detailed Findings
            </h3>
            
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-4"
            >
               {[
                 { title: "Metabolic Profile (Glucose)", status: "Alert", score: 65, color: "bg-orange-500", text: "Warning", detail: "HbA1c level is at 5.7%, which sits exactly at the threshold of pre-diabetes. Your previous record was 5.4%." },
                 { title: "Cardiovascular Markers", status: "Optimal", score: 95, color: "bg-green-500", text: "Healthy", detail: "HDL/LDL ratio is excellent. C-Reactive Protein (CRP) levels indicate very low systemic inflammation." },
                 { title: "Hematology (Blood Count)", status: "Normal", score: 88, color: "bg-blue-500", text: "Excellent", detail: "Hemoglobin and Platelet counts are within ideal physiological ranges. No signs of anemia detected." }
               ].map((item, i) => (
                 <Card key={i} className="rounded-3xl border-none shadow-sm overflow-hidden">
                    <div className="p-6">
                       <div className="flex justify-between items-start mb-4">
                          <h4 className="font-bold text-lg">{item.title}</h4>
                          <Badge variant="outline" className={`border-none ${item.color}/10 ${item.color.replace('bg-', 'text-')}`}>
                             {item.text}
                          </Badge>
                       </div>
                       <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                          {item.detail}
                       </p>
                       <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                             <span>AI Reliability</span>
                             <span>{item.score}%</span>
                          </div>
                          <Progress value={item.score} className="h-2 overflow-hidden rounded-full" />
                       </div>
                    </div>
                 </Card>
               ))}
            </motion.div>
         </div>

         {/* Recommendations Column */}
         <div className="space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-2 mt-4 px-2">
               Actionable Steps
            </h3>
            
            <div className="space-y-4">
               {[
                 { icon: Utensils, bg: "bg-orange-100", iconColor: "text-orange-600", title: "Dietary Adjustment", desc: "Reduce refined carbohydrates and increase fiber intake to stabilize HbA1c." },
                 { icon: Activity, bg: "bg-blue-100", iconColor: "text-blue-600", title: "Physical Activity", desc: "Aim for 30 min of zone 2 cardio 4x a week to improve metabolic sensitivity." },
                 { icon: Stethoscope, bg: "bg-purple-100", iconColor: "text-purple-600", title: "Specialist Advice", desc: "Consider consulting an Endocrinologist for a proactive metabolic strategy." },
                 { icon: HeartPulse, bg: "bg-red-100", iconColor: "text-red-600", title: "Vital Check", desc: "Monitor fasting blood sugar weekly for the next 4 weeks." }
               ].map((rec, i) => (
                 <motion.div 
                    key={i}
                    whileHover={{ x: 5 }}
                    className="flex gap-4 p-5 rounded-[2rem] bg-background border shadow-sm hover:border-primary/50 transition-all cursor-pointer"
                 >
                    <div className={`w-12 h-12 rounded-2xl ${rec.bg} flex items-center justify-center shrink-0`}>
                       <rec.icon className={`h-6 w-6 ${rec.iconColor}`} />
                    </div>
                    <div>
                       <h4 className="font-bold text-sm mb-1">{rec.title}</h4>
                       <p className="text-xs text-muted-foreground leading-relaxed">{rec.desc}</p>
                    </div>
                 </motion.div>
               ))}
            </div>

            <Card className="rounded-[2rem] bg-primary/10 border-primary/20 border-2 p-6 overflow-hidden relative group cursor-pointer">
               <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2">
                     <BrainCircuit className="h-5 w-5 text-primary" />
                     <span className="font-bold text-primary">Need Clarification?</span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed">
                     Our AI Health Assistant can break down these results further in plain language.
                  </p>
                  <Button 
                    className="w-full rounded-xl bg-primary text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/30 transition-all h-10 gap-2"
                    onClick={() => navigate('/dashboard/assistant')}
                  >
                     Talk to Assistant <ChevronRight className="h-4 w-4" />
                  </Button>
               </div>
               <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
            </Card>
         </div>
      </div>
    </div>
  );
}
