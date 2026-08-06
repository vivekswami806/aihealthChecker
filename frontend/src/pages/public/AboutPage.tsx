import { motion } from 'framer-motion';
import { Shield, Brain, Heart, Users, Lock, Eye } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 space-y-32">
      <section className="text-center space-y-6">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold tracking-tight"
        >
          Our Mission: <span className="text-primary">Humanizing</span> Health Data
        </motion.h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          At HealthAI Pro, we believe that everyone should have a clear, actionable understanding of their medical data. We're bridging the gap between clinical complexity and personal wellness.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <h2 className="text-3xl font-bold">The Vision</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Founded by a team of medical doctors and AI researchers, our goal is to eliminate "medical anxiety" caused by cryptic reports. We use state-of-the-art multi-modal AI to translate complex data into practical insights.
          </p>
          <div className="grid grid-cols-2 gap-6 pt-4">
             {[
               { icon: Brain, label: "Advanced AI" },
               { icon: Shield, label: "Safe & Secure" },
               { icon: Heart, label: "Patient Centric" },
               { icon: Users, label: "Expert Guided" }
             ].map((item, i) => (
               <div key={i} className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                   <item.icon className="w-5 h-5 text-primary" />
                 </div>
                 <span className="font-semibold">{item.label}</span>
               </div>
             ))}
          </div>
        </div>
        <div className="relative">
          <div className="aspect-square bg-muted rounded-3xl overflow-hidden shadow-2xl relative z-10">
            <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=2080" alt="Laboratory" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        </div>
      </div>

      <section className="bg-primary/5 rounded-[3rem] p-12 md:p-20 text-center space-y-12">
        <h2 className="text-3xl font-bold">Privacy & Security First</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Lock, title: "End-to-End Encryption", desc: "Your medical data is encrypted at rest and in transit using military-grade AES-256." },
            { icon: Eye, title: "Privacy Control", desc: "You have 100% control over who sees your data. We never sell your personal information." },
            { icon: Shield, title: "HIPAA Compliant", desc: "Our infrastructure adheres to the strictest healthcare data standards globally." }
          ].map((item, i) => (
            <div key={i} className="bg-background p-8 rounded-3xl border shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
