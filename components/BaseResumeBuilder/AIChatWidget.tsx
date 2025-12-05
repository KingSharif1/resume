'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, User, Loader2, Briefcase } from 'lucide-react';
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
    initialMessage?: string;
    onMessageSent?: () => void;
}

// Professional Avatar Component for Myles
const MylesAvatar = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base'
    };

    return (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-blue-100 ${className}`}>
            <span className="font-serif">M</span>
        </div>
    );
};

export function AIChatWidget({ resumeId, profile, isOpen, onClose, initialMessage, onMessageSent }: AIChatWidgetProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const hasSentInitialMessage = useRef(false);

    // Handle initial message
    useEffect(() => {
        if (isOpen && initialMessage && !hasSentInitialMessage.current) {
            handleSend(initialMessage);
            hasSentInitialMessage.current = true;
            onMessageSent?.();
        }
        if (!isOpen) {
            hasSentInitialMessage.current = false;
        }
    }, [isOpen, initialMessage]);

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
        <div className="fixed bottom-6 right-6 w-[380px] md:w-[420px] h-[650px] max-h-[85vh] bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] flex flex-col animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <MylesAvatar size="md" />
                    <div>
                        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                            Myles
                            <span className="text-xs font-normal text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">AI</span>
                        </h3>
                        <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                            <Briefcase className="w-3 h-3" />
                            Your Career Coach
                        </p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/70" onClick={onClose}>
                    <X className="w-4 h-4 text-slate-500" />
                </Button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-slate-50/30 to-white">
                {/* Messages */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-5 space-y-5"
                >
                    {messages.length === 0 && (
                        <div className="text-center py-12 px-6">
                            <MylesAvatar size="lg" className="mx-auto mb-4" />
                            <h4 className="font-bold text-slate-900 text-lg mb-2">Hi, I'm Myles! 👋</h4>
                            <p className="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
                                I'm your AI career coach. I'll help you craft a resume that stands out and lands interviews.
                            </p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            {msg.role === 'user' ? (
                                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-slate-600" />
                                </div>
                            ) : (
                                <MylesAvatar size="sm" className="flex-shrink-0" />
                            )}
                            <div className="flex flex-col gap-1.5 max-w-[80%]">
                                <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-md'
                                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-md'
                                    }`}>
                                    {msg.content}
                                </div>
                                {msg.role === 'assistant' && msg.metadata && (
                                    <div className="flex items-center gap-2 px-2">
                                        <span className={`text-[10px] font-semibold ${msg.metadata.isFallback ? 'text-amber-600' : 'text-blue-600'
                                            }`}>
                                            {msg.metadata.isFallback ? '⚠️ Fallback' : '✓ AI'}
                                        </span>
                                        <span className="text-[10px] text-slate-400">•</span>
                                        <span className="text-[10px] text-slate-500">
                                            {msg.metadata.model === 'mock' ? 'Demo Mode' : msg.metadata.model}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3">
                            <MylesAvatar size="sm" className="flex-shrink-0" />
                            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                    <span className="text-sm text-slate-500">Myles is thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Suggestions */}
                {messages.length === 0 && (
                    <div className="p-4 bg-white border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Try asking</p>
                        <div className="grid grid-cols-2 gap-2">
                            {suggestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(q)}
                                    className="text-xs bg-blue-50 border border-blue-100 text-blue-700 px-3 py-2.5 rounded-lg hover:bg-blue-100 hover:border-blue-200 transition-all text-left font-medium"
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
                            placeholder="Ask Myles for advice..."
                            className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 rounded-xl"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !input.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-xl w-11 h-11 transition-all hover:scale-105"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
