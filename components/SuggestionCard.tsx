/**
 * SuggestionCard Component - Premium Redesign
 * 
 * Features:
 * - Premium UI inspired by SuperDesign
 * - Expandable/Collapsible with smooth animations
 * - Beautiful diff display with highlighted new content
 * - Three action buttons: Deny, Refine, Apply
 * - Hover and scroll-to-preview integration
 * - Inline refine textarea with Enter key support
 */

'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { InlineSuggestion, getSuggestionColor, getSuggestionTypeLabel } from '@/lib/inline-suggestions';
import { useSuggestionHover } from '@/lib/suggestion-hover-context';
import { scrollToSuggestionCard, scrollToSuggestionHighlight } from '@/lib/scroll-utils';
import { Check, X, Lightbulb, Sparkles, RefreshCw, TrendingUp, Type, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getWordDiff, mergeSegments } from '@/lib/text-diff';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface SuggestionCardProps {
    suggestion: InlineSuggestion;
    onApprove: (suggestion: InlineSuggestion) => void;
    onDeny: (suggestionId: string) => void;
    onCustomize?: (suggestion: InlineSuggestion) => void;
    onReply?: (suggestion: InlineSuggestion) => void;
    onInlineReply?: (suggestionId: string, message: string) => void;
    isRegenerating?: boolean;
    isHighlighted?: boolean;
}

export function SuggestionCard({
    suggestion,
    onApprove,
    onDeny,
    onCustomize,
    onReply,
    onInlineReply,
    isRegenerating = false,
    isHighlighted = false
}: SuggestionCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isReplying, setIsReplying] = useState(false);
    const [isAskingAI, setIsAskingAI] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [aiQuestion, setAiQuestion] = useState('');

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

    // Scroll card into view when preview highlight is hovered
    useEffect(() => {
        if (hoveredHighlightId === suggestion.id && cardRef.current) {
            console.log('[SuggestionCard] Preview hovered - scrolling card into view:', suggestion.id);
            scrollToSuggestionCard(suggestion.id);
        }
    }, [hoveredHighlightId, suggestion.id]);

    const getBadgeColor = (severity: string) => {
        switch (severity) {
            case 'error': return 'bg-red-100 text-red-700 border-red-200';
            case 'warning': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'suggestion': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getTypeColor = (type: string) => {
        // Extract first type if comma-separated (e.g., "wording, metric" → "wording")
        const primaryType = type.split(',')[0].trim().toLowerCase();
        
        switch (primaryType) {
            case 'ats':
                return {
                    bg: 'bg-blue-50',
                    text: 'text-blue-700',
                    border: 'border-blue-200',
                    highlight: 'bg-blue-100',
                    icon: 'text-blue-600'
                };
            case 'metric':
                return {
                    bg: 'bg-green-50',
                    text: 'text-green-700',
                    border: 'border-green-200',
                    highlight: 'bg-green-100',
                    icon: 'text-green-600'
                };
            case 'wording':
                return {
                    bg: 'bg-purple-50',
                    text: 'text-purple-700',
                    border: 'border-purple-200',
                    highlight: 'bg-purple-100',
                    icon: 'text-purple-600'
                };
            case 'grammar':
            case 'typo':
                return {
                    bg: 'bg-red-50',
                    text: 'text-red-700',
                    border: 'border-red-200',
                    highlight: 'bg-red-100',
                    icon: 'text-red-600'
                };
            case 'tone':
            case 'formatting':
                return {
                    bg: 'bg-orange-50',
                    text: 'text-orange-700',
                    border: 'border-orange-200',
                    highlight: 'bg-orange-100',
                    icon: 'text-orange-600'
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    text: 'text-gray-700',
                    border: 'border-gray-200',
                    highlight: 'bg-gray-100',
                    icon: 'text-gray-600'
                };
        }
    };

    const handleInlineReplySubmit = () => {
        console.log('[SuggestionCard] Regenerate clicked:', {
            suggestionId: suggestion.id,
            prompt: replyText.trim() || '(no prompt)',
            hasOnInlineReply: !!onInlineReply
        });
        
        if (onInlineReply) {
            // Allow regeneration with or without a prompt
            onInlineReply(suggestion.id, replyText.trim());
            setIsReplying(false);
            setReplyText('');
        } else {
            console.warn('[SuggestionCard] onInlineReply callback is not provided!');
        }
    };

    const handleAskAI = () => {
        if (aiQuestion.trim() && onReply) {
            // Pass the question along with the suggestion to the chat
            onReply(suggestion);
            setIsAskingAI(false);
            setAiQuestion('');
        }
    };

    // Calculate word-level diff for highlighting changes
    const diff = useMemo(() => {
        if (!suggestion.originalText || !suggestion.suggestedText) {
            return null;
        }
        const { originalSegments, suggestedSegments } = getWordDiff(
            suggestion.originalText,
            suggestion.suggestedText
        );
        return {
            original: mergeSegments(originalSegments),
            suggested: mergeSegments(suggestedSegments)
        };
    }, [suggestion.originalText, suggestion.suggestedText]);

    return (
        <motion.div
            ref={cardRef}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3 }}
            data-suggestion-card={suggestion.id}
            className={cn(
                'group relative bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300',
                'hover:shadow-md hover:border-slate-300 cursor-pointer',
                isHovered && 'ring-2 ring-blue-200 ring-offset-1',
                isActive && 'ring-2 ring-blue-300 ring-offset-2',
                isRegenerating && 'opacity-60 pointer-events-none',
                isHighlighted && 'ring-4 ring-green-400 ring-offset-2 shadow-lg animate-pulse'
            )}
            onMouseEnter={() => setHoveredSuggestion(suggestion.id)}
            onMouseLeave={() => setHoveredSuggestion(null)}
            onClick={() => {
                console.log('[SuggestionCard] Clicked - scrolling to highlight:', suggestion.id);
                scrollToSuggestionHighlight(suggestion.id);
            }}
        >
            {/* Regenerating Overlay */}
            {isRegenerating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-8 h-8 rounded-full border-3 border-slate-200 border-t-primary"
                        />
                        <p className="text-xs font-medium text-slate-600">Regenerating...</p>
                    </div>
                </div>
            )}
            
            {/* Left accent bar */}
            <div className={cn(
                "absolute top-0 left-0 w-1 h-full transition-colors duration-300",
                getTypeColor(suggestion.type).border.replace('border-', 'bg-'),
                'group-hover:opacity-100 opacity-70'
            )} />
            <div className="p-4 pl-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "p-1.5 rounded-md border",
                            getTypeColor(suggestion.type).bg,
                            getTypeColor(suggestion.type).border
                        )}>
                            {suggestion.type.includes('metric') ? (
                                <TrendingUp className={cn("w-4 h-4", getTypeColor(suggestion.type).icon)} />
                            ) : suggestion.type.includes('grammar') ? (
                                <Type className={cn("w-4 h-4", getTypeColor(suggestion.type).icon)} />
                            ) : (
                                <Sparkles className={cn("w-4 h-4", getTypeColor(suggestion.type).icon)} />
                            )}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">
                            {getSuggestionTypeLabel(suggestion.type, suggestion)}
                        </span>
                    </div>
                    {suggestion.impact && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            {suggestion.impact}
                        </span>
                    )}
                </div>

                {/* Content Diff - Inline with context */}
                <div className="mb-4">
                    <div className="relative">
                        <div className={cn(
                            "absolute -left-3 top-0 bottom-0 w-1 rounded-full",
                            getTypeColor(suggestion.type).border.replace('border-', 'bg-')
                        )} />
                        <div className={cn(
                            "text-sm text-gray-900 p-3 rounded-lg border",
                            getTypeColor(suggestion.type).highlight,
                            getTypeColor(suggestion.type).border
                        )}>
                            {diff ? (
                                diff.suggested.map((segment, idx) => {
                                    // Find if this segment was in original (removed/changed)
                                    const wasRemoved = diff.original.some(orig => 
                                        orig.type === 'removed' && orig.text.trim() === segment.text.trim()
                                    );
                                    
                                    return (
                                        <span
                                            key={`seg-${idx}`}
                                            className={cn(
                                                segment.type === 'added' && 'bg-green-200 font-bold px-1 rounded',
                                                segment.type === 'removed' && 'bg-red-200/60 line-through px-0.5 rounded text-gray-500'
                                            )}
                                        >
                                            {segment.text}
                                        </span>
                                    );
                                })
                            ) : (
                                <>
                                    {suggestion.originalText && (
                                        <span className="text-gray-500 line-through">{suggestion.originalText} </span>
                                    )}
                                    <span className="font-medium">{suggestion.suggestedText}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Reason */}
                <p className="text-xs text-slate-500 italic mb-4">
                    <span className="font-semibold text-slate-700 not-italic">Why: </span>
                    {suggestion.reason}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-2">
                    <button
                        onClick={() => onDeny(suggestion.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                    >
                        <X className="w-3.5 h-3.5" />
                        Dismiss
                    </button>
                    
                    <button
                        onClick={() => setIsReplying(!isReplying)}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg transition-colors border",
                            isReplying
                                ? "bg-purple-100 text-purple-700 border-purple-300"
                                : "text-purple-600 border-purple-200 hover:bg-purple-50"
                        )}
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Refine
                    </button>
                    
                    <button
                        onClick={() => onApprove(suggestion)}
                        className="flex-[2] flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-white bg-primary hover:bg-primary/90 active:scale-[0.98] rounded-lg shadow-sm shadow-primary/25 transition-all"
                    >
                        <Check className="w-3.5 h-3.5" />
                        Apply Improvement
                    </button>
                    
                    {/* Ask AI - Subtle icon button */}
                    {onReply && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => onReply(suggestion)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                    Get AI feedback on this suggestion
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </div>

            {/* Inline Refine Area */}
            <AnimatePresence>
                {isReplying && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-purple-100 bg-purple-50/30 overflow-hidden"
                    >
                        <div className="p-4 space-y-3">
                            <div className="flex items-start gap-2 text-xs text-purple-700">
                                <Lightbulb size={14} className="mt-0.5 flex-shrink-0" />
                                <p>Add context or explain what you'd like to change about this suggestion</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Add context or explain what you'd like to change... (optional)"
                                        className="w-full min-h-[80px] p-3 rounded-lg border border-purple-200 bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none text-xs resize-none"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleInlineReplySubmit();
                                            }
                                        }}
                                    />
                                    <div className="absolute bottom-2 right-2 text-[10px] text-gray-400">
                                        Enter to regenerate • Shift+Enter for new line
                                    </div>
                                </div>
                                <button
                                    onClick={handleInlineReplySubmit}
                                    className="self-end p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-1.5 px-3"
                                >
                                    <RefreshCw size={14} />
                                    <span className="text-xs font-medium">Regenerate</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Inline Ask AI Area */}
            <AnimatePresence>
                {isAskingAI && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-blue-100 bg-blue-50/30 overflow-hidden"
                    >
                        <div className="p-4 space-y-3">
                            <div className="flex items-start gap-2 text-xs text-blue-700">
                                <Sparkles size={14} className="mt-0.5 flex-shrink-0" />
                                <p>Ask AI a question about this suggestion. Your conversation history will be preserved in the chat.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <textarea
                                        value={aiQuestion}
                                        onChange={(e) => setAiQuestion(e.target.value)}
                                        placeholder="e.g., 'Why is this better?' or 'Can you explain the impact?' or 'What are alternatives?'..."
                                        className="w-full min-h-[80px] p-3 rounded-lg border border-blue-200 bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none text-xs resize-none"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                                e.preventDefault();
                                                handleAskAI();
                                            }
                                        }}
                                    />
                                    <div className="absolute bottom-2 right-2 text-[10px] text-gray-400">
                                        {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Enter to send
                                    </div>
                                </div>
                                <button
                                    onClick={handleAskAI}
                                    disabled={!aiQuestion.trim()}
                                    className="self-end p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-1.5 px-3"
                                >
                                    <Send size={14} />
                                    <span className="text-xs font-medium">Ask</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
