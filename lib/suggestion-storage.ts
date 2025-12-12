'use client';

/**
 * Suggestion Storage Utility
 * 
 * Persists inline suggestions to localStorage so users can return to them.
 */

import { InlineSuggestion } from '@/lib/inline-suggestions';

const STORAGE_KEY_PREFIX = 'resume_suggestions_';

export interface StoredSuggestions {
    resumeId: string;
    suggestions: InlineSuggestion[];
    updatedAt: string;
}

/**
 * Save suggestions to localStorage
 */
export function saveSuggestions(resumeId: string, suggestions: InlineSuggestion[]): void {
    if (typeof window === 'undefined') return;
    
    const key = getStorageKey(resumeId);
    const data: StoredSuggestions = {
        resumeId,
        suggestions,
        updatedAt: new Date().toISOString()
    };
    
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('[SuggestionStorage] Failed to save suggestions:', error);
    }
}

/**
 * Load suggestions from localStorage
 */
export function loadSuggestions(resumeId: string): InlineSuggestion[] {
    if (typeof window === 'undefined') return [];
    
    const key = getStorageKey(resumeId);
    
    try {
        const stored = localStorage.getItem(key);
        if (!stored) return [];
        
        const data: StoredSuggestions = JSON.parse(stored);
        
        // Validate and return suggestions
        if (data.suggestions && Array.isArray(data.suggestions)) {
            // Re-create Date objects
            return data.suggestions.map(s => ({
                ...s,
                createdAt: new Date(s.createdAt)
            }));
        }
        
        return [];
    } catch (error) {
        console.error('[SuggestionStorage] Failed to load suggestions:', error);
        return [];
    }
}

/**
 * Clear suggestions for a resume
 */
export function clearSuggestions(resumeId: string): void {
    if (typeof window === 'undefined') return;
    
    const key = getStorageKey(resumeId);
    
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('[SuggestionStorage] Failed to clear suggestions:', error);
    }
}

/**
 * Get all stored resume IDs with suggestions
 */
export function getAllSuggestionResumeIds(): string[] {
    if (typeof window === 'undefined') return [];
    
    const ids: string[] = [];
    
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(STORAGE_KEY_PREFIX)) {
                ids.push(key.replace(STORAGE_KEY_PREFIX, ''));
            }
        }
    } catch (error) {
        console.error('[SuggestionStorage] Failed to get resume IDs:', error);
    }
    
    return ids;
}

function getStorageKey(resumeId: string): string {
    // Use 'new' for new resumes without an ID yet
    return `${STORAGE_KEY_PREFIX}${resumeId || 'new'}`;
}
