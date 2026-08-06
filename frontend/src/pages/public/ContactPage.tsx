import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 space-y-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">How Can We <span className="text-primary">Help</span>?</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Our team is here to support your health journey. Reach out with questions, feedback, or support requests.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="p-8 rounded-[2.5rem] shadow-xl border-border bg-background">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" placeholder="John" className="h-12 bg-muted/30 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" placeholder="Doe" className="h-12 bg-muted/30 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" className="h-12 bg-muted/30 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <textarea 
                  id="message" 
                  rows={4} 
                  className="w-full bg-muted/30 border border-input rounded-xl p-4 focus:ring-1 ring-primary/50 outline-none transition-all"
                  placeholder="How can we help you?"
                />
              </div>
              <Button className="w-full h-14 rounded-xl text-lg gap-2 shadow-lg shadow-primary/20">
                Send Message <Send className="w-5 h-5" />
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:pl-12 flex flex-col justify-center space-y-10"
        >
          <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Contact Information</h2>
            <div className="space-y-6">
              {[
                { icon: Mail, title: "Support Email", info: "support@healthai.pro" },
                { icon: Phone, title: "Call Us", info: "+1 (555) 000-0000" },
                { icon: MessageCircle, title: "Live Chat", info: "Available 24/7 on dashboard" },
                { icon: MapPin, title: "HQ Office", info: "123 Health Innovation Way, Silicon Valley, CA" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{item.title}</h4>
                    <p className="text-muted-foreground">{item.info}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 bg-muted/30 rounded-[2rem] border border-dashed border-primary/30">
            <h4 className="font-bold mb-2">Patient Emergency?</h4>
            <p className="text-sm text-muted-foreground">Please do not use this form for medical emergencies. Contact your local emergency services or call 911 immediately.</p>
          </div>
        </motion.div>
      </div>

      <div className="rounded-[3rem] h-[400px] bg-muted overflow-hidden relative border shadow-inner">
        <img src="https://images.unsplash.com/photo-1577563906417-45a18e053552?auto=format&fit=crop&q=80&w=2070" alt="Map Placeholder" className="w-full h-full object-cover opacity-60 grayscale" />
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="bg-background/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border text-center">
              <MapPin className="text-primary w-10 h-10 mx-auto mb-2" />
              <div className="font-bold">HealthAI Pro Headquarters</div>
              <div className="text-sm text-muted-foreground">Silicon Valley Office</div>
           </div>
        </div>
      </div>
    </div>
  );
}
