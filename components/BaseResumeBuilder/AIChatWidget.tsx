'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResumeProfile } from '@/lib/resume-schema';
import { toast } from 'react-hot-toast';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    id: string;
    metadata?: {
        model?: string;
        isFallback?: boolean;
        fallbackReason?: string;
    };
}

interface AIChatWidgetProps {
    resumeId?: string;
    profile: ResumeProfile;
    isOpen: boolean;
    onClose: () => void;
}

export function AIChatWidget({ resumeId, profile, isOpen, onClose }: AIChatWidgetProps) {
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

        console.log('[AIChatWidget] Sending message:', text);

        const userMessage: Message = {
            role: 'user',
            content: text,
            id: Date.now().toString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            console.log('[AIChatWidget] Calling API...');
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

            console.log('[AIChatWidget] API Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[AIChatWidget] API Error body:', errorText);
                throw new Error(`Failed to get response: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            console.log('[AIChatWidget] API Response data:', data);

            const aiMessage: Message = {
                role: 'assistant',
                content: data.message,
                id: (Date.now() + 1).toString(),
                metadata: data.metadata
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('[AIChatWidget] Chat error:', error);
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

    // Load chat history on mount or when opened
    useEffect(() => {
        if (resumeId && isOpen && messages.length === 0) {
            const loadHistory = async () => {
                try {
                    const res = await fetch(`/api/ai/chat/history?resumeId=${resumeId}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.messages && data.messages.length > 0) {
                            setMessages(data.messages);
                        }
                    }
                } catch (e) {
                    console.error(e);
                }
            };
            loadHistory();
        }
    }, [resumeId, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-6 right-6 w-[350px] md:w-[400px] h-[600px] max-h-[80vh] bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] flex flex-col animate-in slide-in-from-bottom-4 duration-300 overflow-hidden font-sans">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white text-emerald-600 rounded-lg shadow-sm">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm">AI Coach</h3>
                        <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Online
                        </p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/50" onClick={onClose}>
                    <X className="w-4 h-4 text-slate-500" />
                </Button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
                {/* Messages */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                    {messages.length === 0 && (
                        <div className="text-center py-12 px-6">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
                                <Bot className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-slate-900 mb-2">Hi there! 👋</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                I'm your personal AI resume coach. I can help you tailor your resume, improve your writing, or prepare for interviews.
                            </p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-emerald-100 text-emerald-600'
                                }`}>
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div className="flex flex-col gap-1 max-w-[85%]">
                                <div className={`rounded-2xl p-3.5 text-sm shadow-sm whitespace-pre-wrap ${msg.role === 'user'
                                        ? 'bg-slate-900 text-white rounded-tr-sm'
                                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'
                                    }`}>
                                    {msg.content}
                                </div>
                                {msg.role === 'assistant' && msg.metadata && (
                                    <div className="flex items-center gap-2 px-2">
                                        <span className={`text-[10px] font-medium ${msg.metadata.isFallback ? 'text-amber-600' : 'text-emerald-600'
                                            }`}>
                                            {msg.metadata.isFallback ? '⚠️ Fallback' : '✓ AI'}
                                        </span>
                                        <span className="text-[10px] text-slate-400">•</span>
                                        <span className="text-[10px] text-slate-500 font-mono">
                                            {msg.metadata.model === 'mock' ? 'Simulated' : msg.metadata.model}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Suggestions */}
                {messages.length === 0 && (
                    <div className="p-3 bg-white border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Suggested questions</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(q)}
                                    className="text-xs bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-2 rounded-xl hover:bg-emerald-100 transition-colors text-left"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-200">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex gap-2 items-center"
                    >
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask for advice..."
                            className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !input.trim()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm rounded-xl w-10 h-10"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
