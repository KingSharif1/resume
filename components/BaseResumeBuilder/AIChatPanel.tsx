'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, ChevronRight, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResumeProfile } from '@/lib/resume-schema';
import { toast } from 'react-hot-toast';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    id: string;
}

interface AIChatPanelProps {
    resumeId?: string;
    profile: ResumeProfile;
}

export function AIChatPanel({ resumeId, profile }: AIChatPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Suggested questions based on resume content
    const suggestions = [
        "How can I improve my summary?",
        "Tailor my resume for a Software Engineer role",
        "What skills am I missing?",
        "Rewrite my experience to be more impactful"
    ];

    const handleSend = async (text: string = input) => {
        if (!text.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: text,
            id: Date.now().toString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeId,
                    message: text,
                    profile, // Send current profile context
                    history: messages.map(m => ({ role: m.role, content: m.content }))
                })
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();
            
            const aiMessage: Message = {
                role: 'assistant',
                content: data.message,
                id: (Date.now() + 1).toString()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            toast.error('Failed to get AI response');
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Load chat history on mount
    useEffect(() => {
        if (resumeId && isOpen && messages.length === 0) {
            // TODO: Load history from API
            // For now, just start fresh or maybe we can persist in local state if needed immediately
            // But the plan is to have backend persistence.
            
            const loadHistory = async () => {
                try {
                     const res = await fetch(`/api/ai/chat/history?resumeId=${resumeId}`);
                     if (res.ok) {
                         const data = await res.json();
                         setMessages(data.messages);
                     }
                } catch (e) {
                    console.error(e);
                }
            };
            loadHistory();
        }
    }, [resumeId, isOpen]);

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-left transition-all duration-200 mb-2"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">AI Resume Coach</h2>
                        <p className="text-xs text-slate-500">Chat with AI to tailor and improve your resume</p>
                    </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
            </button>

            {isOpen && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 pt-2">
                    {/* Chat Area */}
                    <div className="h-[400px] flex flex-col bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                        {/* Messages */}
                        <div 
                            ref={scrollRef} 
                            className="flex-1 overflow-y-auto p-4 space-y-4"
                        >
                            {messages.length === 0 && (
                                <div className="text-center py-8 text-slate-500">
                                    <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Hello! I can help you tailor your resume, rewrite descriptions, or check for missing skills.</p>
                                </div>
                            )}
                            
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        msg.role === 'user' ? 'bg-slate-200' : 'bg-emerald-100 text-emerald-600'
                                    }`}>
                                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div className={`rounded-lg p-3 text-sm max-w-[85%] ${
                                        msg.role === 'user' 
                                            ? 'bg-slate-800 text-white rounded-tr-none' 
                                            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            
                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="bg-white border border-slate-200 rounded-lg rounded-tl-none p-3 shadow-sm">
                                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Suggestions */}
                        {messages.length === 0 && (
                            <div className="p-3 border-t border-slate-100 bg-white/50">
                                <p className="text-xs font-semibold text-slate-500 mb-2 px-1">SUGGESTED QUESTIONS</p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(q)}
                                            className="text-xs bg-white border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full hover:bg-emerald-50 transition-colors text-left"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-slate-200">
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex gap-2"
                            >
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask anything..."
                                    className="flex-1"
                                />
                                <Button 
                                    type="submit" 
                                    size="icon"
                                    disabled={isLoading || !input.trim()}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
