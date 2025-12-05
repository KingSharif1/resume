/**
 * Suggestion Hover Context
 * 
 * Manages bidirectional highlighting between suggestion cards
 * and highlighted text in the resume preview.
 */

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SuggestionHoverContextType {
    // Currently hovered suggestion ID (from suggestion panel)
    hoveredSuggestionId: string | null;

    // Currently hovered highlight ID (from preview)
    hoveredHighlightId: string | null;

    // Set hovered suggestion (triggers preview highlight)
    setHoveredSuggestion: (id: string | null) => void;

    // Set hovered highlight (triggers suggestion highlight)
    setHoveredHighlight: (id: string | null) => void;

    // Active suggestion being viewed/edited
    activeSuggestionId: string | null;
    setActiveSuggestionId: (id: string | null) => void;
}

const SuggestionHoverContext = createContext<SuggestionHoverContextType | undefined>(
    undefined
);

export function SuggestionHoverProvider({ children }: { children: ReactNode }) {
    const [hoveredSuggestionId, setHoveredSuggestionId] = useState<string | null>(null);
    const [hoveredHighlightId, setHoveredHighlightId] = useState<string | null>(null);
    const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(null);

    const setHoveredSuggestion = (id: string | null) => {
        setHoveredSuggestionId(id);
        // Clear highlight hover when suggestion is hovered
        if (id) setHoveredHighlightId(null);
    };

    const setHoveredHighlight = (id: string | null) => {
        setHoveredHighlightId(id);
        // Clear suggestion hover when highlight is hovered
        if (id) setHoveredSuggestionId(null);
    };

    return (
        <SuggestionHoverContext.Provider
            value={{
                hoveredSuggestionId,
                hoveredHighlightId,
                setHoveredSuggestion,
                setHoveredHighlight,
                activeSuggestionId,
                setActiveSuggestionId,
            }}
        >
            {children}
        </SuggestionHoverContext.Provider>
    );
}

export function useSuggestionHover() {
    const context = useContext(SuggestionHoverContext);
    if (!context) {
        throw new Error('useSuggestionHover must be used within SuggestionHoverProvider');
    }
    return context;
}
