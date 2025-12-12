/**
 * HighlightedText Component
 * 
 * Takes a full text string and a list of suggestions.
 * Splits the text into segments and renders highlights for suggested ranges.
 */

'use client';

import { useSuggestionHover } from '@/lib/suggestion-hover-context';
import { InlineSuggestion, getSuggestionColor } from '@/lib/inline-suggestions';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

// Internal component for the actual highlighted span
interface SuggestionHighlightProps {
    suggestion: InlineSuggestion;
    text: string;
}

function SuggestionHighlight({ suggestion, text }: SuggestionHighlightProps) {
    const {
        hoveredSuggestionId,
        hoveredHighlightId,
        setHoveredHighlight,
        activeSuggestionId,
        setActiveSuggestionId
    } = useSuggestionHover();

    const isHovered =
        hoveredSuggestionId === suggestion.id ||
        hoveredHighlightId === suggestion.id;

    const isActive = activeSuggestionId === suggestion.id;

    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span
                        data-suggestion-id={suggestion.id}
                        className={cn(
                            'relative inline cursor-pointer transition-all duration-150 rounded-sm px-0.5 -mx-0.5',
                            'border-b-2 border-dotted',
                            // Base colors
                            suggestion.severity === 'error' && 'border-red-400 hover:bg-red-50',
                            suggestion.severity === 'warning' && 'border-yellow-400 hover:bg-yellow-50',
                            suggestion.severity === 'suggestion' && 'border-blue-400 hover:bg-blue-50',
                            // Hover state
                            isHovered && [
                                'border-solid',
                                suggestion.severity === 'error' && 'bg-red-100 border-red-500',
                                suggestion.severity === 'warning' && 'bg-yellow-100 border-yellow-500',
                                suggestion.severity === 'suggestion' && 'bg-blue-100 border-blue-500',
                            ],
                            // Active state (clicked)
                            isActive && [
                                'border-solid ring-2 ring-offset-1',
                                suggestion.severity === 'error' && 'ring-red-300 bg-red-100',
                                suggestion.severity === 'warning' && 'ring-yellow-300 bg-yellow-100',
                                suggestion.severity === 'suggestion' && 'ring-blue-300 bg-blue-100',
                            ]
                        )}
                        onMouseEnter={() => setHoveredHighlight(suggestion.id)}
                        onMouseLeave={() => setHoveredHighlight(null)}
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveSuggestionId(suggestion.id);
                        }}
                    >
                        {text}
                    </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3 space-y-2">
                    <div className="text-xs">
                        <p className="font-semibold text-slate-700 mb-1">💡 Suggested Change</p>
                        <p className="text-slate-500 line-through text-[10px]">{suggestion.originalText}</p>
                        <p className="text-blue-700 font-medium">{suggestion.suggestedText}</p>
                    </div>
                    {suggestion.reason && (
                        <p className="text-[10px] text-slate-600 border-t pt-1">{suggestion.reason}</p>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

interface HighlightedTextProps {
    text: string;
    suggestions: InlineSuggestion[];
    className?: string;
}

export function HighlightedText({ text, suggestions, className }: HighlightedTextProps) {
    const segments = useMemo(() => {
        if (!suggestions || suggestions.length === 0) {
            return [{ text, suggestion: null }];
        }

        // Sort suggestions by startOffset
        const sortedSuggestions = [...suggestions].sort((a, b) => a.startOffset - b.startOffset);

        const result: { text: string; suggestion: InlineSuggestion | null }[] = [];
        let lastIndex = 0;

        sortedSuggestions.forEach(suggestion => {
            // Handle overlapping or out of order suggestions safely
            if (suggestion.startOffset < lastIndex) return;

            // Add plain text before suggestion
            if (suggestion.startOffset > lastIndex) {
                result.push({
                    text: text.slice(lastIndex, suggestion.startOffset),
                    suggestion: null
                });
            }

            // Add highlighted text
            // Ensure we don't go out of bounds
            const end = Math.min(suggestion.endOffset, text.length);
            result.push({
                text: text.slice(suggestion.startOffset, end),
                suggestion
            });

            lastIndex = end;
        });

        // Add remaining plain text
        if (lastIndex < text.length) {
            result.push({
                text: text.slice(lastIndex),
                suggestion: null
            });
        }

        return result;
    }, [text, suggestions]);

    return (
        <span className={className}>
            {segments.map((segment, index) => {
                if (segment.suggestion) {
                    return (
                        <SuggestionHighlight
                            key={`${segment.suggestion.id}-${index}`}
                            suggestion={segment.suggestion}
                            text={segment.text}
                        />
                    );
                }
                return <span key={index}>{segment.text}</span>;
            })}
        </span>
    );
}
