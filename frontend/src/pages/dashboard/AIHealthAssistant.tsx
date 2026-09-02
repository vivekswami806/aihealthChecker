import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  BrainCircuit,
  Activity,
  Utensils,
  Plus,
  Clock,
  Bot,
  User,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messages?: { content: string; createdAt: string }[];
  _count?: { messages: number };
}

export default function AIHealthAssistant() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  });

  const fetchConversations = useCallback(async () => {
    try {
      setLoadingList(true);
      const response = await axios.get(`${API_URL}/chat/`, {
        headers: authHeaders(),
      });
      const list = response.data?.data;
      setConversations(Array.isArray(list) ? list : []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load conversations');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  const loadConversation = async (id: string) => {
    try {
      setLoadingMessages(true);
      setActiveConversationId(id);
      const response = await axios.get(`${API_URL}/chat/${id}`, {
        headers: authHeaders(),
      });
      const conversation = response.data?.data;
      const msgs = (conversation?.messages || []).map((m: any) => ({
        id: m.id,
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
        createdAt: m.createdAt,
      }));
      setMessages(msgs);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load conversation');
    } finally {
      setLoadingMessages(false);
    }
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setInputValue('');
  };

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? inputValue).trim();
    if (!text || isTyping) return;

    const tempUserId = `temp-user-${Date.now()}`;
    const userMessage: Message = {
      id: tempUserId,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await axios.post(
        `${API_URL}/chat/message`,
        {
          message: text,
          conversationId: activeConversationId,
        },
        { headers: authHeaders() }
      );

      const result = response.data?.data;
      const conversationId = result?.conversationId;
      const assistantMsg = result?.message;

      if (conversationId && conversationId !== activeConversationId) {
        setActiveConversationId(conversationId);
      }

      if (assistantMsg) {
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsg.id,
            role: 'assistant',
            content: assistantMsg.content,
            createdAt: assistantMsg.createdAt,
          },
        ]);
      }

      await fetchConversations();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send message');
      setMessages((prev) => prev.filter((m) => m.id !== tempUserId));
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = [
    { label: 'Explain my latest report', icon: Sparkles },
    { label: 'What should I avoid eating?', icon: Utensils },
    { label: 'Check my disease risk', icon: BrainCircuit },
    { label: 'How to improve sleep?', icon: Activity },
  ];

  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatRelative = (value: string) => {
    const diff = Date.now() - new Date(value).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${Math.max(mins, 1)}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(value).toLocaleDateString();
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6">
      <div className="hidden lg:flex w-72 flex-col gap-4">
        <Button
          className="w-full h-12 rounded-xl gap-2 shadow-lg shadow-primary/20"
          onClick={startNewConversation}
        >
          <Plus className="h-4 w-4" /> New Conversation
        </Button>

        <div className="space-y-6 mt-4 flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 mb-3">
              Recent Chats
            </h4>
            {loadingList ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground px-2">No conversations yet.</p>
            ) : (
              <div className="space-y-1">
                {conversations.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => loadConversation(chat.id)}
                    className={`w-full text-left px-3 py-3 rounded-xl transition-all text-sm group ${
                      activeConversationId === chat.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="font-semibold truncate">{chat.title || 'Untitled'}</div>
                    <div className="text-[10px] opacity-70 mt-1 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {formatRelative(chat.updatedAt)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Card className="rounded-2xl border-none bg-muted/30 p-4 space-y-2">
            <h4 className="font-bold text-sm">HealthAI Tip</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ask about your recent reports, diet suggestions, or risk trends — answers use
              your medical context.
            </p>
          </Card>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-background border rounded-[2.5rem] shadow-sm overflow-hidden relative">
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
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl lg:hidden"
            onClick={startNewConversation}
          >
            <Plus className="h-4 w-4 mr-1" /> New
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {loadingMessages ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 && !isTyping ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-16">
              <Bot className="h-12 w-12 text-primary" />
              <div>
                <h3 className="text-xl font-bold">How can I help today?</h3>
                <p className="text-muted-foreground text-sm mt-1 max-w-md">
                  Ask about your reports, symptoms, diet, or health trends.
                </p>
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <Avatar
                  className={`h-10 w-10 shrink-0 border-2 ${
                    m.role === 'assistant' ? 'border-primary/20' : 'border-muted'
                  }`}
                >
                  {m.role === 'assistant' ? (
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  ) : (
                    <>
                      <AvatarImage src="" />
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>

                <div
                  className={`max-w-[85%] md:max-w-[70%] space-y-2 ${
                    m.role === 'user' ? 'items-end' : ''
                  }`}
                >
                  <div
                    className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                      m.role === 'assistant'
                        ? 'bg-muted/50 text-foreground rounded-tl-none'
                        : 'bg-primary text-primary-foreground rounded-tr-none'
                    }`}
                  >
                    {m.content}
                  </div>
                  <div
                    className={`flex items-center gap-3 px-2 ${
                      m.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                      {formatTime(m.createdAt)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}

          {isTyping && (
            <div className="flex gap-4">
              <Avatar className="h-10 w-10 shrink-0 border-2 border-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted/50 p-4 rounded-3xl rounded-tl-none h-12 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 bg-muted/10 border-t space-y-4">
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4"
              >
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s.label)}
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
            <Input
              placeholder="Ask any health related question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isTyping}
              className="flex-1 h-16 rounded-2xl border-2 focus-visible:ring-primary/20 pr-16 text-base shadow-sm"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isTyping}
              className="absolute right-3 h-10 w-10 p-0 rounded-xl shadow-lg shadow-primary/20"
            >
              {isTyping ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
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
