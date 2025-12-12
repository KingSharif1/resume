/**
 * Text Highlighter Utility
 * 
 * Parses text and wraps matching segments with HighlightedText components
 * based on inline suggestions.
 */

import { InlineSuggestion } from '@/lib/inline-suggestions';
import { HighlightedText } from '@/components/HighlightedText';
import { ReactNode } from 'react';

interface TextSegment {
    text: string;
    suggestion?: InlineSuggestion;
}

/**
 * Parse text and create segments with suggestions
 */
export function parseTextWithSuggestions(
    text: string,
    suggestions: InlineSuggestion[]
): TextSegment[] {
    if (!suggestions || suggestions.length === 0) {
        return [{ text }];
    }

    // Sort suggestions by start position
    const sortedSuggestions = [...suggestions].sort((a, b) => a.startOffset - b.startOffset);

    const segments: TextSegment[] = [];
    let currentPos = 0;

    sortedSuggestions.forEach(suggestion => {
        // Add text before suggestion
        if (currentPos < suggestion.startOffset) {
            segments.push({
                text: text.substring(currentPos, suggestion.startOffset)
            });
        }

        // Add suggestion segment
        segments.push({
            text: text.substring(suggestion.startOffset, suggestion.endOffset),
            suggestion
        });

        currentPos = suggestion.endOffset;
    });

    // Add remaining text
    if (currentPos < text.length) {
        segments.push({
            text: text.substring(currentPos)
        });
    }

    return segments;
}

/**
 * Render text with highlighted suggestions
 */
export function renderHighlightedText(
    text: string,
    suggestions: InlineSuggestion[],
    onSuggestionClick?: (suggestion: InlineSuggestion) => void
): ReactNode[] {
    const segments = parseTextWithSuggestions(text, suggestions);

    return segments.map((segment, index) => {
        if (segment.suggestion) {
            // Wrap the segment in a HighlightedText with just the single suggestion
            return (
                <HighlightedText
                    key={`${segment.suggestion.id}-${index}`}
                    text={segment.text}
                    suggestions={[segment.suggestion]}
                />
            );
        }
        return <span key={`text-${index}`}>{segment.text}</span>;
    });
}
