import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Upload, 
  ShieldCheck, 
  Zap, 
  FileText, 
  Activity, 
  Brain,
  History as HistoryIcon,
  Star,
  CheckCircle2, 
  Stethoscope, 
  HeartPulse,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="relative pt-20 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 blur-3xl opacity-20 bg-primary/30 w-1/2 h-full rounded-full transform translate-x-1/2 -translate-y-1/4" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/5 text-primary text-sm mb-4">
                ✨ AI-Powered Healthcare Re-imagined
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                Understand Your <span className="text-primary">Health</span> <br />
                With AI Precision
              </h1>
              <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Upload your medical reports and get instant, AI-driven insights, risk assessments, and personalized wellness plans. Simple, secure, and secure.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/auth/register">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-xl gap-2 shadow-lg shadow-primary/20">
                    Get Started Free <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl bg-background/50">
                    How it works
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-muted-foreground"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background overflow-hidden ring-1 ring-primary/20">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <p className="font-medium"><span className="text-foreground font-bold">10,000+</span> individuals trust us</p>
            </motion.div>
          </div>

          <div className="flex-1 relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              <div className="relative bg-gradient-to-tr from-primary/10 to-primary/5 rounded-[2rem] p-4 border border-primary/20 shadow-2xl backdrop-blur-sm">
                <img 
                  src="https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&q=80&w=2070" 
                  alt="AI Healthcare Illustration" 
                  className="rounded-2xl shadow-inner w-full h-auto object-cover aspect-[4/3]"
                />
                
                {/* Floating UI Elements */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -right-6 bg-background rounded-2xl p-4 shadow-xl border border-border max-w-[200px]"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="text-green-500 h-5 w-5" />
                    </div>
                    <span className="font-bold text-sm">Vital Score</span>
                  </div>
                  <div className="text-2xl font-bold">98.4/100</div>
                  <div className="text-[10px] text-muted-foreground mt-1 text-green-500">Perfectly Healthy</div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-6 -left-6 bg-background rounded-2xl p-4 shadow-xl border border-border"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Zap className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">AI Analysis</div>
                      <div className="text-[10px] text-muted-foreground">Complete in 0.4s</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partners/Trust */}
      <section className="bg-muted/30 py-12 border-y">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all">
          {["Microsoft", "NVIDIA", "Mayo Clinic", "Cerner", "Epic"].map(p => (
            <span key={p} className="text-xl font-black italic tracking-tighter">{p}</span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center space-y-4 mb-20">
          <Badge variant="secondary" className="px-4 py-1">Comprehensive Features</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Everything You Need For Your Health</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From report analysis to long-term trend tracking, we provide the most advanced tools for personal health management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              title: "Smart Report Analysis", 
              desc: "Deeply understand Lab, MRI, and CT results in seconds with plain English explanations.",
              icon: Brain,
              color: "text-purple-500",
              bg: "bg-purple-500/10"
            },
            { 
              title: "Health History Timeline", 
              desc: "A beautiful, interactive history of your health data over years to spot early warning signs.",
              icon: HistoryIcon,
              color: "text-blue-500",
              bg: "bg-blue-500/10"
            },
            { 
              title: "AI Health Assistant", 
              desc: "Ask any health-related question to our specialized medical AI for guidance and clarity.",
              icon: MessageSquare,
              color: "text-green-500",
              bg: "bg-green-500/10"
            },
            { 
              title: "Disease Risk Assessment", 
              desc: "Predict potential risks based on your history and current markers for proactive care.",
              icon: ShieldCheck,
              color: "text-orange-500",
              bg: "bg-orange-500/10"
            },
            { 
              title: "Precise Trend Tracking", 
              desc: "Visualize how your vitals like blood pressure and cholesterol level change over time.",
              icon: Activity,
              color: "text-red-500",
              bg: "bg-red-500/10"
            },
            { 
              title: "Global Document Support", 
              desc: "We support PDF, MRI Scans, CT Scans, Hand-written notes, and 20+ specialized report formats.",
              icon: FileText,
              color: "text-indigo-500",
              bg: "bg-indigo-500/10"
            }
          ].map((feature, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl bg-background border hover:border-primary/50 transition-all hover:shadow-2xl shadow-sm"
            >
              <div className={`${feature.bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>
                <feature.icon className={`${feature.color} w-8 h-8`} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-primary/5 py-32 border-y relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-bold">Health Analysis in 3 Simple Steps</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { num: "01", title: "Upload Report", text: "Drag and drop your medical documents. We support all common formats including images.", icon: Upload },
              { num: "02", title: "AI Processing", text: "Our multi-modal medical models scan and interpret every data point with high precision.", icon: Brain },
              { num: "03", title: "Expert Insights", text: "Get a plain-English summary, risk assessment, and actionable health advice instantly.", icon: Sparkles }
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="text-8xl font-black text-primary/5 absolute -top-12 -left-4 group-hover:text-primary/10 transition-colors uppercase">{step.num}</div>
                <div className="relative pt-6">
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-muted-foreground leading-loose">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="max-w-7xl mx-auto px-4">
        <Card className="rounded-[3rem] overflow-hidden border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-background to-muted/20 p-12 md:p-20 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">Ready to Take Control of Your Health?</h2>
              <p className="text-xl text-muted-foreground">
                Join over <span className="font-bold text-foreground underline decoration-primary underline-offset-4 tracking-tight">10,000+ members</span> who are making better health decisions with HealthAI Pro.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="h-14 px-10 rounded-xl text-lg shadow-xl shadow-primary/20">Start Free Forever</Button>
                <Button size="lg" variant="ghost" className="h-14 px-10 rounded-xl text-lg">Compare Plans</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-4">
                  <div className="bg-background/80 p-6 rounded-3xl border shadow-sm">
                    <HeartPulse className="text-red-500 w-10 h-10 mb-4" />
                    <div className="text-2xl font-bold">120K+</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Analyzed Reports</div>
                  </div>
                  <div className="bg-background/80 p-6 rounded-3xl border shadow-sm">
                    <Stethoscope className="text-blue-500 w-10 h-10 mb-4" />
                    <div className="text-2xl font-bold">99.8%</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">AI Uptime</div>
                  </div>
               </div>
               <div className="space-y-4 pt-8">
                  <div className="bg-background/80 p-6 rounded-3xl border shadow-sm">
                    <ShieldCheck className="text-green-500 w-10 h-10 mb-4" />
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Data Privacy</div>
                  </div>
                  <div className="bg-primary p-6 rounded-3xl shadow-lg shadow-primary/30 text-primary-foreground">
                    <Star className="w-10 h-10 mb-4 fill-current" />
                    <div className="text-2xl font-bold">4.9/5</div>
                    <div className="text-xs uppercase tracking-widest font-bold opacity-80">User Rating</div>
                  </div>
               </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

const Sparkles = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/>
    <path d="M19 17v4"/>
    <path d="M3 5h4"/>
    <path d="M17 19h4"/>
  </svg>
);
