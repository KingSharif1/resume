'use client';

/**
 * Redesigned AIChatWidget Component
 * 
 * Features:
 * - Expandable from widget to full panel
 * - Collapsible sidebar with chat history
 * - Auto-expanding textarea
 * - Reply context attachment for suggestions
 * - Framer Motion animations
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    Send,
    Plus,
    MessageSquare,
    MoreHorizontal,
    User,
    Sparkles,
    PanelLeftClose,
    PanelLeftOpen,
    Share,
    ThumbsUp,
    ThumbsDown,
    Copy,
    RotateCcw,
    Check,
    X,
    Lightbulb,
    ArrowRight,
    Maximize2,
    Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ResumeProfile } from '@/lib/resume-schema';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { cn } from '@/lib/utils';

dayjs.extend(relativeTime);

// --- Types ---
export type MessageRole = 'user' | 'assistant';

export interface ChatSuggestion {
    targetSection: string;
    targetId?: string;
    originalText?: string;
    suggestedText: string;
    reasoning: string;
}

export interface ReplyContext {
    id: string;
    title: string;
    originalText?: string;
    suggestedText: string;
    reasoning: string;
}

export interface Message {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: Date;
    suggestion?: ChatSuggestion;
    replyContext?: ReplyContext;
    metadata?: {
        model?: string;
        isFallback?: boolean;
    };
}

export interface ChatSession {
    id: string;
    title: string;
    updatedAt: Date;
    messages: Message[];
}

export interface AIChatWidgetProps {
    resumeId?: string;
    profile: ResumeProfile;
    isOpen: boolean;
    onClose: () => void;
    initialMessage?: string;
    onMessageSent?: () => void;
    onApplySuggestion?: (suggestion: ChatSuggestion) => void;
    onPreviewSuggestion?: (suggestion: ChatSuggestion | null) => void;
    onAddInlineSuggestion?: (suggestion: ChatSuggestion) => void;
    attachedContext?: ChatSuggestion | null;
    onClearContext?: () => void;
}

// --- Sub-components ---

const AutoResizeTextarea = ({
    value,
    onChange,
    onKeyDown,
    placeholder,
    disabled
}: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    placeholder?: string;
    disabled?: boolean;
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full resize-none bg-transparent border-0 focus:ring-0 p-3 max-h-[200px] overflow-y-auto text-sm leading-relaxed outline-none"
            style={{ minHeight: '44px' }}
        />
    );
};

const SidebarItem = ({
    session,
    isActive,
    onClick
}: {
    session: ChatSession;
    isActive: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={cn(
            "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-left",
            isActive
                ? "bg-gray-100 text-gray-900 font-medium"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        )}
    >
        <MessageSquare size={16} className={cn("shrink-0", isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600")} />
        <span className="truncate flex-1">{session.title}</span>
    </button>
);

const MessageBubble = ({
    message,
    onAcceptSuggestion,
    onDenySuggestion,
    onReplySuggestion
}: {
    message: Message;
    onAcceptSuggestion?: (suggestion: ChatSuggestion) => void;
    onDenySuggestion?: (suggestionId: string) => void;
    onReplySuggestion?: (suggestion: ChatSuggestion) => void;
}) => {
    const isUser = message.role === 'user';

    return (
        <div className={cn(
            "flex w-full gap-3 py-4",
            isUser ? "flex-row-reverse" : "flex-row"
        )}>
            {/* Avatar */}
            <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-sm",
                isUser ? "bg-white border-gray-100" : "bg-black border-black text-white"
            )}>
                {isUser ? <User size={16} className="text-gray-600" /> : <Sparkles size={16} />}
            </div>

            {/* Content */}
            <div className={cn(
                "flex max-w-[85%] flex-col gap-2",
                isUser ? "items-end" : "items-start"
            )}>
                <div className={cn(
                    "font-medium text-[10px] text-gray-400 select-none uppercase tracking-wider",
                    isUser ? "text-right mr-1" : "ml-1"
                )}>
                    {isUser ? "You" : "Myles"}
                </div>

                <div className={cn(
                    "text-sm break-words leading-relaxed flex flex-col",
                    isUser
                        ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-md"
                        : "text-gray-800 px-1"
                )}>
                    {/* Reply Context Attachment */}
                    {message.replyContext && (
                        <div className={cn(
                            "mb-2 flex items-center gap-2 rounded-lg p-2 text-xs font-medium border border-blue-400/30 bg-blue-700/30",
                            !isUser && "bg-gray-50 border-gray-200 text-gray-600"
                        )}>
                            <div className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-md bg-white/20 text-white shrink-0",
                                !isUser && "bg-yellow-100 text-yellow-700"
                            )}>
                                <Lightbulb size={12} />
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="opacity-70 text-[9px] uppercase tracking-wider">Replying to suggestion</span>
                                <span className="truncate">{message.replyContext.title}</span>
                            </div>
                        </div>
                    )}

                    {message.content.split('\n').map((line, i) => (
                        <p key={i} className={cn(i > 0 && "mt-3")}>{line}</p>
                    ))}
                </div>

                {/* Suggestion Card (AI Only) */}
                {!isUser && message.suggestion && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full max-w-md"
                    >
                        <div className="p-3">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-5 w-5 rounded-md bg-yellow-50 flex items-center justify-center text-yellow-600 border border-yellow-100 shrink-0">
                                    <Lightbulb size={12} />
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide bg-blue-100 text-blue-700 border-blue-200">
                                    Suggestion
                                </span>
                            </div>

                            {/* Content Diff */}
                            <div className="mb-3 space-y-2">
                                {message.suggestion.originalText && (
                                    <div className="text-gray-400 line-through text-xs leading-relaxed pl-2 border-l-2 border-red-200 bg-red-50/30 p-1.5 rounded-r-md">
                                        {message.suggestion.originalText}
                                    </div>
                                )}
                                <div className="flex items-start gap-2">
                                    <ArrowRight className="text-blue-500 shrink-0 mt-0.5" size={12} />
                                    <div className="text-gray-900 font-medium text-xs leading-relaxed bg-blue-50/50 p-2 rounded-md border border-blue-100 w-full">
                                        {message.suggestion.suggestedText}
                                    </div>
                                </div>
                            </div>

                            {/* Reason */}
                            <div className="mb-3 text-[11px] text-gray-600 italic bg-gray-50 p-2 rounded-lg border border-gray-100">
                                <span className="font-semibold text-gray-800 not-italic">Why: </span>
                                {message.suggestion.reasoning}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                                <button
                                    onClick={() => onDenySuggestion?.(message.suggestion!.suggestedText)}
                                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={12} />
                                    Deny
                                </button>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onReplySuggestion?.(message.suggestion!)}
                                        className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-lg transition-all"
                                    >
                                        <MessageSquare size={12} />
                                        Reply
                                    </button>
                                    <button
                                        onClick={() => onAcceptSuggestion?.(message.suggestion!)}
                                        className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all"
                                    >
                                        <Check size={12} />
                                        Approve
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Action Row for AI messages */}
                {!isUser && !message.suggestion && (
                    <div className="flex items-center gap-0.5 mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                            <Copy size={12} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                            <RotateCcw size={12} />
                        </button>
                        <div className="h-2 w-[1px] bg-gray-200 mx-0.5" />
                        <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                            <ThumbsUp size={12} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                            <ThumbsDown size={12} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Component ---

export function AIChatWidget({
    resumeId,
    profile,
    isOpen,
    onClose,
    initialMessage,
    onMessageSent,
    onApplySuggestion,
    onPreviewSuggestion,
    onAddInlineSuggestion,
    attachedContext,
    onClearContext
}: AIChatWidgetProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [replyingTo, setReplyingTo] = useState<ChatSuggestion | null>(null);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasSentInitialMessage = useRef(false);

    // Resizable state
    const [dimensions, setDimensions] = useState({ width: 440, height: 600 });
    const [position, setPosition] = useState({ x: 24, y: 24 }); // offset from bottom-right
    const [isResizing, setIsResizing] = useState(false);
    const [resizeDirection, setResizeDirection] = useState<string | null>(null);
    const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Min/Max constraints
    const MIN_WIDTH = 320;
    const MIN_HEIGHT = 400;
    const MAX_WIDTH = typeof window !== 'undefined' ? window.innerWidth - 48 : 1200;
    const MAX_HEIGHT = typeof window !== 'undefined' ? window.innerHeight - 48 : 800;

    // Handle resize start
    const handleResizeStart = (e: React.MouseEvent, direction: string) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        setResizeDirection(direction);
        resizeStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            width: dimensions.width,
            height: dimensions.height,
            posX: position.x,
            posY: position.y
        };
    };

    // Handle resize move
    useEffect(() => {
        if (!isResizing || !resizeDirection) return;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - resizeStartRef.current.x;
            const deltaY = e.clientY - resizeStartRef.current.y;

            let newWidth = resizeStartRef.current.width;
            let newHeight = resizeStartRef.current.height;
            let newPosX = resizeStartRef.current.posX;
            let newPosY = resizeStartRef.current.posY;

            // Handle different resize directions
            // Note: Panel is positioned from bottom-right, so:
            // - 'w' (west/left edge): dragging left increases width, increases right offset
            // - 'e' (east/right edge): dragging left decreases right offset but keeps width
            // - 'n' (north/top edge): dragging up increases height, increases bottom offset  
            // - 's' (south/bottom edge): dragging up decreases bottom offset but keeps height

            if (resizeDirection.includes('w')) {
                // Left edge: dragging left (-deltaX) should increase width
                newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, resizeStartRef.current.width - deltaX));
            }
            if (resizeDirection.includes('e')) {
                // Right edge: dragging right (+deltaX) should increase width AND decrease right offset
                newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, resizeStartRef.current.width + deltaX));
                newPosX = resizeStartRef.current.posX - deltaX;
            }
            if (resizeDirection.includes('n')) {
                // Top edge: dragging up (-deltaY) should increase height
                newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, resizeStartRef.current.height - deltaY));
            }
            if (resizeDirection.includes('s')) {
                // Bottom edge: dragging down (+deltaY) should increase height AND decrease bottom offset
                newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, resizeStartRef.current.height + deltaY));
                newPosY = resizeStartRef.current.posY - deltaY;
            }

            setDimensions({ width: newWidth, height: newHeight });
            setPosition({ x: Math.max(0, newPosX), y: Math.max(0, newPosY) });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            setResizeDirection(null);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, resizeDirection]);

    // Sync attached context from parent
    useEffect(() => {
        if (attachedContext) {
            setReplyingTo(attachedContext);
        }
    }, [attachedContext]);

    // Initialize with welcome message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                id: 'welcome',
                role: 'assistant',
                content: "Hey! I'm Myles, your career coach. I can help review your resume, improve bullet points, or discuss strategy. What would you like to work on?",
                timestamp: new Date()
            }]);
        }
    }, []);

    // Handle initial message
    useEffect(() => {
        if (isOpen && initialMessage && !hasSentInitialMessage.current) {
            handleSend(initialMessage);
            hasSentInitialMessage.current = true;
            onMessageSent?.();
        }
    }, [isOpen, initialMessage]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleNewChat = () => {
        // Save current session
        if (messages.length > 1) {
            const newSession: ChatSession = {
                id: Date.now().toString(),
                title: messages[1]?.content.slice(0, 30) + '...' || 'New Chat',
                updatedAt: new Date(),
                messages: [...messages]
            };
            setSessions(prev => [newSession, ...prev]);
        }
        setMessages([]);
        setReplyingTo(null);
        hasSentInitialMessage.current = false;
        toast.success('Started new chat');
    };

    const handleSend = async (text: string = inputValue) => {
        if (!text.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date(),
            replyContext: replyingTo ? {
                id: replyingTo.targetId || 'suggestion',
                title: replyingTo.targetSection,
                originalText: replyingTo.originalText,
                suggestedText: replyingTo.suggestedText,
                reasoning: replyingTo.reasoning
            } : undefined
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setReplyingTo(null);
        onClearContext?.();
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeId,
                    message: text,
                    profile,
                    history: messages.map(m => ({ role: m.role, content: m.content })),
                    attachedContext: replyingTo ? {
                        type: 'suggestion',
                        targetSection: replyingTo.targetSection,
                        originalText: replyingTo.originalText,
                        suggestedText: replyingTo.suggestedText,
                        reasoning: replyingTo.reasoning
                    } : null
                })
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.message,
                timestamp: new Date(),
                metadata: data.metadata,
                suggestion: data.suggestion
            };

            setMessages(prev => [...prev, aiMessage]);

            if (data.suggestion && onAddInlineSuggestion) {
                onAddInlineSuggestion(data.suggestion);
            }
        } catch (error) {
            console.error('[AIChatWidget] Chat error:', error);
            toast.error('Failed to get AI response');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleAcceptSuggestion = (suggestion: ChatSuggestion) => {
        onApplySuggestion?.(suggestion);
        toast.success('Suggestion applied!');
    };

    const handleReplySuggestion = (suggestion: ChatSuggestion) => {
        setReplyingTo(suggestion);
    };

    // Group sessions by time
    const todaySessions = sessions.filter(s => dayjs(s.updatedAt).isAfter(dayjs().startOf('day')));
    const yesterdaySessions = sessions.filter(s =>
        dayjs(s.updatedAt).isBefore(dayjs().startOf('day')) &&
        dayjs(s.updatedAt).isAfter(dayjs().subtract(1, 'day').startOf('day'))
    );
    const olderSessions = sessions.filter(s =>
        dayjs(s.updatedAt).isBefore(dayjs().subtract(1, 'day').startOf('day'))
    );

    if (!isOpen) return null;

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "fixed z-[100] bg-white border border-slate-200 rounded-2xl shadow-2xl flex overflow-hidden",
                isExpanded && "inset-4 md:inset-8",
                isResizing && "select-none"
            )}
            style={!isExpanded ? {
                bottom: position.y,
                right: position.x,
                width: dimensions.width,
                height: Math.min(dimensions.height, typeof window !== 'undefined' ? window.innerHeight * 0.85 : 600),
            } : undefined}
        >
            {/* Resize Handles - only show when not expanded */}
            {!isExpanded && (
                <>
                    {/* Corner handles */}
                    <div
                        className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-50 hover:bg-blue-500/20 rounded-tl-2xl"
                        onMouseDown={(e) => handleResizeStart(e, 'nw')}
                    />
                    <div
                        className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-50 hover:bg-blue-500/20 rounded-tr-2xl"
                        onMouseDown={(e) => handleResizeStart(e, 'ne')}
                    />
                    <div
                        className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-50 hover:bg-blue-500/20 rounded-bl-2xl"
                        onMouseDown={(e) => handleResizeStart(e, 'sw')}
                    />
                    <div
                        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50 hover:bg-blue-500/20 rounded-br-2xl"
                        onMouseDown={(e) => handleResizeStart(e, 'se')}
                    />
                    {/* Edge handles */}
                    <div
                        className="absolute top-0 left-4 right-4 h-2 cursor-n-resize z-50 hover:bg-blue-500/10"
                        onMouseDown={(e) => handleResizeStart(e, 'n')}
                    />
                    <div
                        className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize z-50 hover:bg-blue-500/10"
                        onMouseDown={(e) => handleResizeStart(e, 's')}
                    />
                    <div
                        className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize z-50 hover:bg-blue-500/10"
                        onMouseDown={(e) => handleResizeStart(e, 'w')}
                    />
                    <div
                        className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize z-50 hover:bg-blue-500/10"
                        onMouseDown={(e) => handleResizeStart(e, 'e')}
                    />
                </>
            )}

            {/* Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 260, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="flex flex-col border-r bg-gray-50/50 h-full overflow-hidden"
                    >
                        <div className="p-4 flex flex-col h-full min-w-[260px]">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 font-semibold text-gray-800">
                                    <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white">
                                        <span className="text-[10px] font-bold">M</span>
                                    </div>
                                    <span className="text-sm">Myles</span>
                                </div>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors"
                                >
                                    <PanelLeftClose size={16} />
                                </button>
                            </div>

                            {/* New Chat Button */}
                            <button
                                className="flex items-center gap-2 w-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg shadow-sm transition-all mb-4 group text-sm"
                                onClick={handleNewChat}
                            >
                                <Plus size={16} className="text-blue-600 group-hover:scale-110 transition-transform" />
                                <span className="font-medium">New chat</span>
                            </button>

                            {/* History Lists */}
                            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                                {todaySessions.length > 0 && (
                                    <div>
                                        <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 px-2">Today</h3>
                                        <div className="space-y-0.5">
                                            {todaySessions.map(s => <SidebarItem key={s.id} session={s} isActive={false} onClick={() => { }} />)}
                                        </div>
                                    </div>
                                )}
                                {yesterdaySessions.length > 0 && (
                                    <div>
                                        <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 px-2">Yesterday</h3>
                                        <div className="space-y-0.5">
                                            {yesterdaySessions.map(s => <SidebarItem key={s.id} session={s} isActive={false} onClick={() => { }} />)}
                                        </div>
                                    </div>
                                )}
                                {olderSessions.length > 0 && (
                                    <div>
                                        <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 px-2">Previous</h3>
                                        <div className="space-y-0.5">
                                            {olderSessions.map(s => <SidebarItem key={s.id} session={s} isActive={false} onClick={() => { }} />)}
                                        </div>
                                    </div>
                                )}
                                {sessions.length === 0 && (
                                    <p className="text-xs text-gray-400 text-center py-8">No chat history yet</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full bg-white relative">
                {/* Header */}
                <div className="h-12 border-b flex items-center justify-between px-4 bg-white z-10 shrink-0">
                    <div className="flex items-center gap-2">
                        {!isSidebarOpen && (
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                            >
                                <PanelLeftOpen size={16} />
                            </button>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Myles AI
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                        >
                            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto px-4">
                    <div className={cn(
                        "mx-auto w-full pb-32 pt-2",
                        isExpanded ? "max-w-3xl" : "max-w-full"
                    )}>
                        <AnimatePresence initial={false}>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group"
                                >
                                    <MessageBubble
                                        message={msg}
                                        onAcceptSuggestion={handleAcceptSuggestion}
                                        onDenySuggestion={() => { }}
                                        onReplySuggestion={handleReplySuggestion}
                                    />
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex w-full gap-3 py-4"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-black border-black text-white shadow-sm">
                                        <Sparkles size={16} />
                                    </div>
                                    <div className="flex items-center gap-1 pt-2">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-4 px-4">
                    <div className={cn(
                        "mx-auto w-full relative",
                        isExpanded ? "max-w-3xl" : "max-w-full"
                    )}>
                        {/* Reply Context */}
                        {replyingTo && (
                            <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-t-xl mx-1 px-3 py-2 text-xs text-blue-700 -mb-1 pb-3 relative z-0">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <Lightbulb size={12} className="shrink-0 text-blue-500" />
                                    <span className="font-medium truncate">
                                        Replying to: {replyingTo.targetSection}
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        setReplyingTo(null);
                                        onClearContext?.();
                                    }}
                                    className="text-blue-400 hover:text-blue-600 shrink-0"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        )}

                        <div className="relative flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all p-2 z-10">
                            <AutoResizeTextarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Message Myles..."
                                disabled={isLoading}
                            />

                            <button
                                onClick={() => handleSend()}
                                disabled={!inputValue.trim() || isLoading}
                                className={cn(
                                    "p-2.5 rounded-xl transition-all shrink-0 mb-0.5",
                                    inputValue.trim()
                                        ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                )}
                            >
                                <Send size={16} />
                            </button>
                        </div>

                        <p className="text-center mt-2 text-[10px] text-gray-400">
                            Myles can make mistakes. Verify important info.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default AIChatWidget;
