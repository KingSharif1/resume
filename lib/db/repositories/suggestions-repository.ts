'use client';

import { InlineSuggestion } from '@/lib/inline-suggestions';

const STORAGE_KEY_PREFIX = 'resume_suggestions_';

/**
 * Repository for managing resume suggestions
 * Uses API when authenticated, falls back to localStorage when not
 */
export class SuggestionsRepository {
    /**
     * Get all suggestions for a resume
     */
    async getByResumeId(resumeId: string): Promise<InlineSuggestion[]> {
        try {
            const response = await fetch(`/api/suggestions?resumeId=${resumeId}`, {
                credentials: 'include',
            });
            
            // If unauthorized, fall back to localStorage
            if (response.status === 401) {
                console.log('[SuggestionsRepository] Not authenticated, using localStorage');
                return this.getFromLocalStorage(resumeId);
            }
            
            if (!response.ok) {
                throw new Error('Failed to fetch suggestions');
            }
            
            const data = await response.json();
            
            // Convert DB format to InlineSuggestion format
            return (data.suggestions || []).map((s: any) => ({
                id: s.id,
                type: s.type,
                severity: s.severity,
                status: s.status,
                targetSection: s.target_section || s.targetSection,
                targetItemId: s.target_item_id || s.targetItemId,
                targetField: s.target_field || s.targetField,
                originalText: s.original_text || s.originalText,
                suggestedText: s.suggested_text || s.suggestedText,
                reason: s.reason,
                startOffset: s.start_offset || s.startOffset || 0,
                endOffset: s.end_offset || s.endOffset || 0,
                source: s.source || 'scan',
                createdAt: new Date(s.created_at || s.createdAt || Date.now()),
            }));
        } catch (error) {
            console.warn('[SuggestionsRepository] API failed, using localStorage:', error);
            return this.getFromLocalStorage(resumeId);
        }
    }

    /**
     * Save suggestions for a resume (replaces existing)
     */
    async saveForResume(resumeId: string, suggestions: InlineSuggestion[]): Promise<boolean> {
        try {
            const response = await fetch('/api/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeId,
                    suggestions: suggestions.map(s => ({
                        id: s.id,
                        type: s.type,
                        severity: s.severity,
                        status: s.status,
                        target_section: s.targetSection,
                        target_item_id: s.targetItemId,
                        target_field: s.targetField,
                        original_text: s.originalText,
                        suggested_text: s.suggestedText,
                        reason: s.reason,
                        start_offset: s.startOffset,
                        end_offset: s.endOffset,
                        source: s.source || 'scan',
                    })),
                }),
                credentials: 'include',
            });

            // If unauthorized, fall back to localStorage
            if (response.status === 401) {
                console.log('[SuggestionsRepository] Not authenticated, saving to localStorage');
                this.saveToLocalStorage(resumeId, suggestions);
                return true;
            }

            // If resume doesn't exist in DB (e.g. new resume), use localStorage
            if (response.status === 404) {
                console.log('[SuggestionsRepository] Resume not in DB, saving to localStorage');
                this.saveToLocalStorage(resumeId, suggestions);
                return true;
            }

            if (!response.ok) {
                throw new Error('Failed to save suggestions');
            }

            return true;
        } catch (error) {
            console.warn('[SuggestionsRepository] API failed, saving to localStorage:', error);
            this.saveToLocalStorage(resumeId, suggestions);
            return true;
        }
    }

    /**
     * Update a single suggestion's status
     */
    async updateStatus(suggestionId: string, status: 'pending' | 'accepted' | 'dismissed'): Promise<boolean> {
        try {
            const response = await fetch(`/api/suggestions/${suggestionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
                credentials: 'include',
            });

            // For local storage, we don't track status updates (handled in memory)
            if (response.status === 401) {
                return true; // Handled in memory by the component
            }

            return response.ok;
        } catch (error) {
            console.warn('[SuggestionsRepository] Status update failed:', error);
            return true; // Handled in memory
        }
    }

    /**
     * Delete all suggestions for a resume
     */
    async deleteForResume(resumeId: string): Promise<boolean> {
        try {
            const response = await fetch(`/api/suggestions?resumeId=${resumeId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.status === 401) {
                this.clearLocalStorage(resumeId);
                return true;
            }

            return response.ok;
        } catch (error) {
            console.warn('[SuggestionsRepository] Delete failed:', error);
            this.clearLocalStorage(resumeId);
            return true;
        }
    }

    // --- LocalStorage Fallback Methods ---

    private getStorageKey(resumeId: string): string {
        return `${STORAGE_KEY_PREFIX}${resumeId || 'new'}`;
    }

    private getFromLocalStorage(resumeId: string): InlineSuggestion[] {
        try {
            const key = this.getStorageKey(resumeId);
            const stored = localStorage.getItem(key);
            if (!stored) return [];
            
            const data = JSON.parse(stored);
            return (data.suggestions || []).map((s: any) => ({
                ...s,
                createdAt: new Date(s.createdAt)
            }));
        } catch (error) {
            console.error('[SuggestionsRepository] localStorage read failed:', error);
            return [];
        }
    }

    private saveToLocalStorage(resumeId: string, suggestions: InlineSuggestion[]): void {
        try {
            const key = this.getStorageKey(resumeId);
            localStorage.setItem(key, JSON.stringify({
                resumeId,
                suggestions,
                updatedAt: new Date().toISOString()
            }));
        } catch (error) {
            console.error('[SuggestionsRepository] localStorage write failed:', error);
        }
    }

    private clearLocalStorage(resumeId: string): void {
        try {
            const key = this.getStorageKey(resumeId);
            localStorage.removeItem(key);
        } catch (error) {
            console.error('[SuggestionsRepository] localStorage clear failed:', error);
        }
    }
}

// Export singleton instance
export const suggestionsRepository = new SuggestionsRepository();
