/**
 * HighlightedText Component
 * 
 * Takes a full text string and a list of suggestions.
 * Splits the text into segments and renders highlights for suggested ranges.
 */

'use client';

import React, { useEffect, useMemo } from 'react';
import { InlineSuggestion } from '@/lib/inline-suggestions';
import { useSuggestionHover } from '@/lib/suggestion-hover-context';
import { scrollToSuggestionCard } from '@/lib/scroll-utils';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

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

    // Scroll to suggestion card when this highlight is hovered
    useEffect(() => {
        if (hoveredHighlightId === suggestion.id) {
            scrollToSuggestionCard(suggestion.id);
        }
    }, [hoveredHighlightId, suggestion.id]);

    // Get type-based colors matching SuggestionCard
    const getTypeColor = (type: string) => {
        const primaryType = type.split(',')[0].trim().toLowerCase();
        
        switch (primaryType) {
            case 'ats':
                return {
                    base: 'border-blue-400 bg-blue-50/50 hover:bg-blue-100',
                    hovered: 'bg-blue-200 border-blue-500',
                    active: 'ring-blue-300 bg-blue-200'
                };
            case 'metric':
                return {
                    base: 'border-green-400 bg-green-50/50 hover:bg-green-100',
                    hovered: 'bg-green-200 border-green-500',
                    active: 'ring-green-300 bg-green-200'
                };
            case 'wording':
                return {
                    base: 'border-purple-400 bg-purple-50/50 hover:bg-purple-100',
                    hovered: 'bg-purple-200 border-purple-500',
                    active: 'ring-purple-300 bg-purple-200'
                };
            case 'grammar':
            case 'typo':
                return {
                    base: 'border-red-400 bg-red-50/50 hover:bg-red-100',
                    hovered: 'bg-red-200 border-red-500',
                    active: 'ring-red-300 bg-red-200'
                };
            case 'tone':
            case 'formatting':
                return {
                    base: 'border-orange-400 bg-orange-50/50 hover:bg-orange-100',
                    hovered: 'bg-orange-200 border-orange-500',
                    active: 'ring-orange-300 bg-orange-200'
                };
            default:
                return {
                    base: 'border-gray-400 bg-gray-50/50 hover:bg-gray-100',
                    hovered: 'bg-gray-200 border-gray-500',
                    active: 'ring-gray-300 bg-gray-200'
                };
        }
    };

    const colors = getTypeColor(suggestion.type);

    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span
                        data-suggestion-id={suggestion.id}
                        className={cn(
                            'relative inline cursor-pointer transition-all duration-150 rounded-sm px-0.5 -mx-0.5',
                            'border-b-2 border-dotted',
                            // Base colors - type-specific
                            colors.base,
                            // Hover state from suggestion card - more prominent highlight
                            isHovered && [
                                'border-solid border-b-[3px]',
                                colors.hovered
                            ],
                            // Active state (clicked)
                            isActive && [
                                'border-solid ring-2 ring-offset-1',
                                colors.active
                            ]
                        )}
                        onMouseEnter={() => setHoveredHighlight(suggestion.id)}
                        onMouseLeave={() => setHoveredHighlight(null)}
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveSuggestionId(suggestion.id);
                            console.log('[HighlightedText] Clicked - scrolling to card:', suggestion.id);
                            scrollToSuggestionCard(suggestion.id);
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

        // Process suggestions to ensure valid offsets
        // If offsets are 0/0 or invalid, try to find originalText in the text
        const processedSuggestions = suggestions.map(suggestion => {
            let startOffset = suggestion.startOffset;
            let endOffset = suggestion.endOffset;

            // Always try to find the originalText if we have it
            if (suggestion.originalText) {
                // First try exact match
                let index = text.indexOf(suggestion.originalText);
                
                if (index !== -1) {
                    startOffset = index;
                    endOffset = index + suggestion.originalText.length;
                } else {
                    // Try normalized match (ignore extra whitespace)
                    const normalize = (str: string) => str.replace(/\s+/g, ' ').trim();
                    const normText = normalize(text);
                    const normOriginal = normalize(suggestion.originalText);
                    
                    if (normText.includes(normOriginal)) {
                        // Find the start position by looking for first few words
                        const words = suggestion.originalText.trim().split(/\s+/);
                        if (words.length > 0) {
                            // Try progressively smaller chunks to find a match
                            for (let i = Math.min(5, words.length); i >= 1; i--) {
                                const chunk = words.slice(0, i).join(' ');
                                const chunkIndex = text.indexOf(chunk);
                                if (chunkIndex !== -1) {
                                    startOffset = chunkIndex;
                                    // Find the end by looking for the last few words
                                    const lastWords = words.slice(-Math.min(3, words.length)).join(' ');
                                    const lastIndex = text.indexOf(lastWords, startOffset);
                                    if (lastIndex !== -1) {
                                        endOffset = lastIndex + lastWords.length;
                                    } else {
                                        endOffset = Math.min(startOffset + suggestion.originalText.length, text.length);
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            return { ...suggestion, startOffset, endOffset };
        });

        // Sort suggestions by startOffset
        const sortedSuggestions = [...processedSuggestions]
            .filter(s => s.startOffset < s.endOffset) // Only include valid suggestions
            .sort((a, b) => a.startOffset - b.startOffset);

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
