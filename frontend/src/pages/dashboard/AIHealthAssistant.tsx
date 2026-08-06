import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  BrainCircuit, 
  Heart, 
  Activity, 
  Utensils, 
  Info, 
  Plus, 
  Clock, 
  Search,
  Settings,
  MoreHorizontal,
  Bot,
  User,
  ArrowDownCircle,
  ThumbsUp,
  ThumbsDown,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIHealthAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello Dr. Alex! I'm your dedicated HealthAI assistant. I have access to your medical history and recent report analysis. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Based on your recent blood panel, your HbA1c is at 5.7%, which is the threshold for pre-diabetes. I recommend focusing on slow-release carbohydrates and adding 20 minutes of light walking after meals.",
        "Your cholesterol profile is looking much better! The HDL increase suggests your heart health is improving. Keep up with the Mediterranean diet suggestions I provided last month.",
        "I've analyzed your sleep tracking data. Your deep sleep phases are slightly shorter than optimal. Try reducing blue light exposure 2 hours before bed.",
        "Your MRI report from December showed no abnormalities. The mild headaches you mentioned might be related to tension; try the neck stretching exercises I can provide."
      ];
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      
      setIsTyping(false);
      setMessages(prev => [...prev, assistantMessage]);
    }, 1500);
  };

  const suggestions = [
    { label: "Explain my latest report", icon: Sparkles },
    { label: "What should I avoid eating?", icon: Utensils },
    { label: "Check my disease risk", icon: BrainCircuit },
    { label: "How to improve sleep?", icon: Activity }
  ];

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6">
      {/* Sidebar - Chat History */}
      <div className="hidden lg:flex w-72 flex-col gap-4">
         <Button className="w-full h-12 rounded-xl gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" /> New Conversation
         </Button>
         
         <div className="space-y-6 mt-4">
            <div>
               <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 mb-3">Recent Chats</h4>
               <div className="space-y-1">
                  {[
                    { title: "HbA1c Analysis Q&A", date: "2 hours ago" },
                    { title: "Dietary Plan for June", date: "Yesterday" },
                    { title: "Vitamin D Deficiency", date: "3 days ago" },
                    { title: "Cholesterol Trends", date: "May 20" },
                  ].map((chat, i) => (
                    <button key={i} className={`w-full text-left px-3 py-3 rounded-xl transition-all text-sm group ${i === 0 ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}>
                       <div className="font-semibold truncate">{chat.title}</div>
                       <div className="text-[10px] opacity-70 mt-1 flex items-center gap-1 group-hover:text-primary/70"><Clock className="h-2.5 w-2.5" /> {chat.date}</div>
                    </button>
                  ))}
               </div>
            </div>

            <Card className="rounded-2xl border-none bg-muted/30 p-4 space-y-4">
               <div>
                  <h4 className="font-bold text-sm">HealthAI Pro Tip</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">You can upload a photo of your supplements to get a compatibility check with your reports.</p>
               </div>
               <Button variant="outline" size="sm" className="w-full rounded-lg text-xs">Learn More</Button>
            </Card>
         </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-background border rounded-[2.5rem] shadow-sm overflow-hidden relative">
         {/* Chat Header */}
         <div className="h-16 border-b px-6 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
                  <Bot className="h-6 w-6" />
               </div>
               <div>
                  <h3 className="font-bold text-sm">HealthAI Assistant</h3>
                  <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase tracking-widest leading-none">
                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                     Online & Secure
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <Button variant="ghost" size="icon" className="rounded-xl"><Search className="h-5 w-5" /></Button>
               <Button variant="ghost" size="icon" className="rounded-xl"><Settings className="h-5 w-5" /></Button>
            </div>
         </div>

         {/* Messages Area */}
         <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6"
         >
            {messages.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className={`h-10 w-10 shrink-0 border-2 ${m.role === 'assistant' ? 'border-primary/20' : 'border-muted'}`}>
                  {m.role === 'assistant' ? (
                     <>
                       <AvatarImage src="" />
                       <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></AvatarFallback>
                     </>
                  ) : (
                     <>
                       <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                       <AvatarFallback><User /></AvatarFallback>
                     </>
                  )}
                </Avatar>
                
                <div className={`max-w-[85%] md:max-w-[70%] space-y-2 ${m.role === 'user' ? 'items-end' : ''}`}>
                   <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                      m.role === 'assistant' 
                      ? 'bg-muted/50 text-foreground rounded-tl-none' 
                      : 'bg-primary text-primary-foreground rounded-tr-none'
                   }`}>
                      {m.content}
                   </div>
                   <div className={`flex items-center gap-3 px-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                         {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {m.role === 'assistant' && (
                         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-muted-foreground hover:text-primary"><ThumbsUp className="h-3 w-3" /></button>
                            <button className="text-muted-foreground hover:text-primary"><ThumbsDown className="h-3 w-3" /></button>
                         </div>
                      )}
                   </div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <div className="flex gap-4">
                <Avatar className="h-10 w-10 shrink-0 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></AvatarFallback>
                </Avatar>
                <div className="bg-muted/50 p-4 rounded-3xl rounded-tl-none h-12 flex items-center gap-1">
                   <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                   <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                   <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                </div>
              </div>
            )}
         </div>

         {/* Bottom Control Area */}
         <div className="p-4 md:p-6 bg-muted/10 border-t space-y-4">
            <AnimatePresence>
               {messages.length === 1 && (
                  <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4"
                  >
                     {suggestions.map((s, i) => (
                        <button 
                           key={i}
                           onClick={() => {
                              setInputValue(s.label);
                              // Auto-focus input after setting value if needed
                           }}
                           className="bg-background border hover:border-primary/50 p-3 rounded-2xl text-xs font-semibold text-left transition-all hover:shadow-md hover:bg-primary/5 flex items-center gap-2 group"
                        >
                           <div className="w-6 h-6 bg-muted group-hover:bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                              <s.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                           </div>
                           <span className="truncate">{s.label}</span>
                        </button>
                     ))}
                  </motion.div>
               )}
            </AnimatePresence>

            <div className="flex items-center gap-3 relative">
               <div className="absolute left-4 p-1">
                  <RotateCcw className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
               </div>
               <Input 
                  placeholder="Ask any health related question..." 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 h-16 rounded-2xl border-2 focus-visible:ring-primary/20 pl-12 pr-16 text-base shadow-sm"
               />
               <Button 
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="absolute right-3 h-10 w-10 p-0 rounded-xl shadow-lg shadow-primary/20"
               >
                  <Send className="h-5 w-5" />
               </Button>
            </div>
            <div className="text-center">
               <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1 font-bold uppercase tracking-widest opacity-60">
                 <Bot className="h-3 w-3" /> AI might make mistakes. Verify with a professional.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
