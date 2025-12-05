/**
 * HighlightedText Component
 * 
 * Wraps text with a suggestion highlight (colored underline).
 * Handles hover states for bidirectional highlighting with suggestion cards.
 */

'use client';

import { useSuggestionHover } from '@/lib/suggestion-hover-context';
import { InlineSuggestion, getSuggestionColor } from '@/lib/inline-suggestions';
import { cn } from '@/lib/utils';

interface HighlightedTextProps {
    suggestion: InlineSuggestion;
    children: string;
    onClick?: () => void;
}

export function HighlightedText({ suggestion, children, onClick }: HighlightedTextProps) {
    const {
        hoveredSuggestionId,
        hoveredHighlightId,
        setHoveredHighlight,
        activeSuggestionId
    } = useSuggestionHover();

    const isHovered =
        hoveredSuggestionId === suggestion.id ||
        hoveredHighlightId === suggestion.id;

    const isActive = activeSuggestionId === suggestion.id;

    const colors = getSuggestionColor(suggestion.severity);

    return (
        <span
            data-suggestion-id={suggestion.id}
            className={cn(
                'relative inline cursor-pointer transition-all duration-150',
                'border-b-2 border-dotted',
                // Base colors
                suggestion.severity === 'error' && 'border-red-400 bg-red-50/30',
                suggestion.severity === 'warning' && 'border-yellow-400 bg-yellow-50/30',
                suggestion.severity === 'suggestion' && 'border-blue-400 bg-blue-50/30',
                // Hover state
                isHovered && [
                    'border-solid',
                    suggestion.severity === 'error' && 'bg-red-100/50 border-red-500',
                    suggestion.severity === 'warning' && 'bg-yellow-100/50 border-yellow-500',
                    suggestion.severity === 'suggestion' && 'bg-blue-100/50 border-blue-500',
                ],
                // Active state (clicked)
                isActive && [
                    'border-solid ring-2 ring-offset-1',
                    suggestion.severity === 'error' && 'ring-red-300',
                    suggestion.severity === 'warning' && 'ring-yellow-300',
                    suggestion.severity === 'suggestion' && 'ring-blue-300',
                ]
            )}
            onMouseEnter={() => setHoveredHighlight(suggestion.id)}
            onMouseLeave={() => setHoveredHighlight(null)}
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
            }}
        >
            {children}
        </span>
    );
}
