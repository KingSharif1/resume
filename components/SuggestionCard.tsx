/**
 * SuggestionCard Component - Redesigned
 * 
 * Features:
 * - Beautiful diff display with strikethrough and arrow
 * - Inline reply textarea (local, not Myles)
 * - Reply with AI button (opens Myles chat)
 * - Framer Motion animations
 */

'use client';

import { useState } from 'react';
import { InlineSuggestion, getSuggestionColor, getSuggestionTypeLabel } from '@/lib/inline-suggestions';
import { useSuggestionHover } from '@/lib/suggestion-hover-context';
import { scrollToSuggestionHighlight } from '@/lib/scroll-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Lightbulb, ArrowRight, MessageCircle, Send, Sparkles, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuggestionCardProps {
    suggestion: InlineSuggestion;
    onApprove: (suggestion: InlineSuggestion) => void;
    onDeny: (suggestionId: string) => void;
    onCustomize?: (suggestion: InlineSuggestion) => void;
    onReply?: (suggestion: InlineSuggestion) => void;
    onInlineReply?: (suggestionId: string, message: string) => void;
}

export function SuggestionCard({
    suggestion,
    onApprove,
    onDeny,
    onCustomize,
    onReply,
    onInlineReply
}: SuggestionCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');

    const {
        hoveredSuggestionId,
        hoveredHighlightId,
        setHoveredSuggestion,
        activeSuggestionId
    } = useSuggestionHover();

    const isHovered =
        hoveredSuggestionId === suggestion.id ||
        hoveredHighlightId === suggestion.id;

    const isActive = activeSuggestionId === suggestion.id;

    // Scroll highlight into view when this card is hovered
    useEffect(() => {
        if (hoveredSuggestionId === suggestion.id) {
            scrollToSuggestionHighlight(suggestion.id);
        }
    }, [hoveredSuggestionId, suggestion.id]);

    const getBadgeColor = (severity: string) => {
        switch (severity) {
            case 'error': return 'bg-red-100 text-red-700 border-red-200';
            case 'warning': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'suggestion': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const handleInlineReplySubmit = () => {
        if (replyText.trim() && onInlineReply) {
            onInlineReply(suggestion.id, replyText);
            setIsReplying(false);
            setReplyText('');
        }
    };

    return (
        <motion.div
            ref={cardRef}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            data-suggestion-card={suggestion.id}
            className={cn(
                'bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200',
                'hover:shadow-md hover:border-gray-300',
                isHovered && 'ring-2 ring-blue-200 ring-offset-1',
                isActive && 'ring-2 ring-blue-300 ring-offset-2',
            )}
            onMouseEnter={() => setHoveredSuggestion(suggestion.id)}
            onMouseLeave={() => setHoveredSuggestion(null)}
        >
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-yellow-50 flex items-center justify-center text-yellow-600 border border-yellow-100 shrink-0">
                            <Lightbulb size={14} />
                        </div>
                        <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide",
                            getBadgeColor(suggestion.severity)
                        )}>
                            {getSuggestionTypeLabel(suggestion.type)}
                        </span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                        <MoreHorizontal size={14} />
                    </button>
                </div>

                {/* Content Diff */}
                <div className="mb-4 space-y-3">
                    {/* Original Text - Strikethrough */}
                    {suggestion.originalText && (
                        <div className="text-gray-400 line-through text-xs leading-relaxed pl-3 border-l-2 border-red-200 bg-red-50/30 p-2 rounded-r-md">
                            {suggestion.originalText}
                        </div>
                    )}

                    {/* Improved Text */}
                    <div className="flex items-start gap-2">
                        <ArrowRight className="text-blue-500 shrink-0 mt-1" size={14} />
                        <div className="text-gray-900 font-medium text-xs leading-relaxed bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 w-full">
                            {suggestion.suggestedText}
                        </div>
                    </div>
                </div>

                {/* Reason */}
                <div className="mb-4 text-xs text-gray-600 italic bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <span className="font-semibold text-gray-800 not-italic">Why: </span>
                    {suggestion.reason}
                </div>
                {suggestion.impact && (
                    <p className="text-xs text-green-600 mb-4 flex items-center gap-1">
                        <Check size={12} />
                        {suggestion.impact}
                    </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                    <button
                        onClick={() => onDeny(suggestion.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={14} />
                        Deny
                    </button>

                    <div className="flex items-center gap-2">
                        {/* Inline Reply Button (local discussion) */}
                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all border",
                                isReplying
                                    ? "bg-gray-100 text-gray-700 border-gray-300"
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            )}
                        >
                            <MessageCircle size={14} />
                            Comment
                        </button>

                        {/* Reply with AI (opens Myles chat) */}
                        {onReply && (
                            <button
                                onClick={() => onReply(suggestion)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-lg transition-all"
                            >
                                <Sparkles size={14} />
                                Ask AI
                            </button>
                        )}

                        <button
                            onClick={() => onApprove(suggestion)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm hover:shadow transition-all active:scale-95"
                        >
                            <Check size={14} />
                            Approve
                        </button>
                    </div>
                </div>
            </div>

            {/* Inline Reply Area */}
            <AnimatePresence>
                {isReplying && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-blue-100 bg-blue-50/30 overflow-hidden"
                    >
                        <div className="p-4 flex gap-3">
                            <div className="flex-1 relative">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Add a comment or request changes..."
                                    className="w-full min-h-[70px] p-3 rounded-lg border border-blue-200 bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none text-xs resize-none"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleInlineReplySubmit();
                                        }
                                    }}
                                />
                                <div className="absolute bottom-2 right-2 text-[10px] text-gray-400">
                                    Enter to send
                                </div>
                            </div>
                            <button
                                onClick={handleInlineReplySubmit}
                                disabled={!replyText.trim()}
                                className="self-end p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
