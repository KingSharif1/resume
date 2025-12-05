/**
 * Suggestion Card Component
 * 
 * Displays an inline suggestion with hover effects and actions
 */

'use client';

import { InlineSuggestion, getSuggestionColor, getSuggestionTypeLabel } from '@/lib/inline-suggestions';
import { useSuggestionHover } from '@/lib/suggestion-hover-context';
import { scrollToSuggestionHighlight } from '@/lib/scroll-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface SuggestionCardProps {
    suggestion: InlineSuggestion;
    onApprove: (suggestion: InlineSuggestion) => void;
    onDeny: (suggestionId: string) => void;
    onCustomize?: (suggestion: InlineSuggestion) => void;
}

export function SuggestionCard({
    suggestion,
    onApprove,
    onDeny,
    onCustomize
}: SuggestionCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
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

    const colors = getSuggestionColor(suggestion.severity);

    // Scroll highlight into view when this card is hovered
    useEffect(() => {
        if (hoveredSuggestionId === suggestion.id) {
            scrollToSuggestionHighlight(suggestion.id);
        }
    }, [hoveredSuggestionId, suggestion.id]);

    return (
        <div
            ref={cardRef}
            data-suggestion-card={suggestion.id}
            className={cn(
                'group relative border rounded-lg p-3 transition-all duration-200',
                'hover:shadow-sm',
                isHovered && 'ring-2 ring-offset-1',
                isActive && 'ring-2 ring-offset-2',
                // Border colors based on severity
                suggestion.severity === 'error' && 'border-red-200 hover:border-red-300',
                suggestion.severity === 'warning' && 'border-yellow-200 hover:border-yellow-300',
                suggestion.severity === 'suggestion' && 'border-blue-200 hover:border-blue-300',
                // Ring colors
                isHovered && suggestion.severity === 'error' && 'ring-red-200',
                isHovered && suggestion.severity === 'warning' && 'ring-yellow-200',
                isHovered && suggestion.severity === 'suggestion' && 'ring-blue-200',
            )}
            onMouseEnter={() => setHoveredSuggestion(suggestion.id)}
            onMouseLeave={() => setHoveredSuggestion(null)}
        >
            {/* Header */}
            <div className="flex items-start gap-2 mb-2">
                <div className={cn('p-1.5 rounded shrink-0', colors.bg)}>
                    <div className={cn('w-3 h-3', colors.text)}>
                        {suggestion.severity === 'error' && '❌'}
                        {suggestion.severity === 'warning' && '⚠️'}
                        {suggestion.severity === 'suggestion' && '💡'}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] h-4 px-1 shrink-0">
                            {getSuggestionTypeLabel(suggestion.type)}
                        </Badge>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                        <div className="flex flex-col gap-1">
                            <span className="line-through text-slate-400 text-[10px]">{suggestion.originalText}</span>
                            <div className="flex items-center gap-1.5 text-slate-900">
                                <span className="text-slate-400 text-[10px]">→</span>
                                <span className="font-medium">
                                    {/* Simple diff highlighting */}
                                    {suggestion.suggestedText.split(' ').map((word, i) => {
                                        // heuristic: if word (normalized) is not in originalText, bold it
                                        // This is a naive diff, but works for "new part" highlighting
                                        const isNew = !suggestion.originalText.toLowerCase().includes(word.toLowerCase().replace(/[.,!?;:]/g, ''));
                                        return (
                                            <span key={i} className={isNew ? "font-bold text-blue-700 bg-blue-50 px-0.5 rounded" : ""}>
                                                {word}{' '}
                                            </span>
                                        );
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reason */}
            <div className="pl-8 mb-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-medium text-slate-700">Why: </span>
                    {suggestion.reason}
                </p>
                {suggestion.impact && (
                    <p className="text-xs text-green-600 mt-1">
                        ✓ {suggestion.impact}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pl-8">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeny(suggestion.id)}
                    className="h-6 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 px-2"
                >
                    <X className="w-3 h-3 mr-1" /> Deny
                </Button>
                <div className="flex-1" />
                {onCustomize && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCustomize(suggestion)}
                        className="h-6 text-xs px-2"
                    >
                        <Edit3 className="w-3 h-3 mr-1" /> Edit
                    </Button>
                )}
                <Button
                    size="sm"
                    onClick={() => onApprove(suggestion)}
                    className="h-6 text-xs bg-slate-900 hover:bg-slate-800 px-2"
                >
                    <Check className="w-3 h-3 mr-1" /> Approve
                </Button>
            </div>
        </div>
    );
}
