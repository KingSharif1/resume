/**
 * Inline Suggestion System
 * 
 * This module handles AI-powered inline suggestions for resume text,
 * similar to Google Docs comments. Suggestions target specific text
 * with exact character positions for precise highlighting.
 */

export type SuggestionType = 'typo' | 'grammar' | 'wording' | 'tone' | 'formatting' | 'metric';
export type SuggestionSeverity = 'error' | 'warning' | 'suggestion';
export type SuggestionStatus = 'pending' | 'approved' | 'denied' | 'customized';

export type TargetSection = 
  | 'summary'
  | 'experience' 
  | 'education' 
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'volunteer'
  | 'awards'
  | 'publications';

export interface InlineSuggestion {
  id: string;
  
  // Type and severity
  type: SuggestionType;
  severity: SuggestionSeverity;
  
  // Target location in resume
  targetSection: TargetSection;
  targetItemId?: string; // ID of specific experience/education/project item
  targetField?: string; // e.g., 'description', 'achievements.0', 'summary.content'
  
  // Exact text selection
  originalText: string; // The text to be replaced
  startOffset: number; // Character position in the field (0-indexed)
  endOffset: number; // End position (exclusive)
  
  // Suggestion details
  suggestedText: string; // Replacement text
  reason: string; // Why this change is better
  impact?: string; // Optional: What this improves (e.g., "Increases ATS score by 5%")
  
  // Source tracking
  source?: 'scan' | 'chat' | 'manual'; // Where the suggestion came from
  
  // State
  status: SuggestionStatus;
  createdAt: Date;
  appliedAt?: Date;
}

export interface SuggestionGroup {
  section: TargetSection;
  itemId?: string;
  field: string;
  suggestions: InlineSuggestion[];
}

/**
 * Generate a unique suggestion ID
 */
export function generateSuggestionId(): string {
  return `sug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new inline suggestion
 */
export function createInlineSuggestion(
  params: Omit<InlineSuggestion, 'id' | 'status' | 'createdAt'>
): InlineSuggestion {
  return {
    ...params,
    id: generateSuggestionId(),
    status: 'pending',
    createdAt: new Date(),
  };
}

/**
 * Apply a suggestion to text
 */
export function applySuggestion(
  originalText: string,
  suggestion: InlineSuggestion
): string {
  const before = originalText.substring(0, suggestion.startOffset);
  const after = originalText.substring(suggestion.endOffset);
  return before + suggestion.suggestedText + after;
}

/**
 * Check if a suggestion is still valid for the current text
 * (text might have changed since suggestion was created)
 */
export function isSuggestionValid(
  currentText: string,
  suggestion: InlineSuggestion
): boolean {
  const targetText = currentText.substring(
    suggestion.startOffset,
    suggestion.endOffset
  );
  return targetText === suggestion.originalText;
}

/**
 * Group suggestions by section and field
 */
export function groupSuggestions(
  suggestions: InlineSuggestion[]
): SuggestionGroup[] {
  const groups = new Map<string, InlineSuggestion[]>();
  
  suggestions.forEach(suggestion => {
    const key = `${suggestion.targetSection}:${suggestion.targetItemId || 'main'}:${suggestion.targetField}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(suggestion);
  });
  
  return Array.from(groups.entries()).map(([key, suggestions]) => {
    const [section, itemId, field] = key.split(':');
    return {
      section: section as TargetSection,
      itemId: itemId === 'main' ? undefined : itemId,
      field,
      suggestions: suggestions.sort((a, b) => a.startOffset - b.startOffset),
    };
  });
}

/**
 * Get suggestion color based on severity
 */
export function getSuggestionColor(severity: SuggestionSeverity): {
  border: string;
  bg: string;
  text: string;
} {
  switch (severity) {
    case 'error':
      return {
        border: 'border-red-500',
        bg: 'bg-red-50',
        text: 'text-red-700',
      };
    case 'warning':
      return {
        border: 'border-yellow-500',
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
      };
    case 'suggestion':
      return {
        border: 'border-blue-500',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
      };
  }
}

/**
 * Get suggestion icon based on type
 */
export function getSuggestionTypeLabel(type: SuggestionType): string {
  switch (type) {
    case 'typo': return 'Typo';
    case 'grammar': return 'Grammar';
    case 'wording': return 'Better Wording';
    case 'tone': return 'Tone';
    case 'formatting': return 'Formatting';
    case 'metric': return 'Add Metric';
  }
}

/**
 * Calculate suggestion priority (for sorting)
 * Higher number = higher priority
 */
export function getSuggestionPriority(suggestion: InlineSuggestion): number {
  let priority = 0;
  
  // Severity weight
  if (suggestion.severity === 'error') priority += 100;
  else if (suggestion.severity === 'warning') priority += 50;
  else priority += 10;
  
  // Type weight
  if (suggestion.type === 'typo') priority += 20;
  else if (suggestion.type === 'grammar') priority += 15;
  else if (suggestion.type === 'metric') priority += 10;
  
  return priority;
}

/**
 * Sort suggestions by priority
 */
export function sortSuggestionsByPriority(
  suggestions: InlineSuggestion[]
): InlineSuggestion[] {
  return [...suggestions].sort((a, b) => 
    getSuggestionPriority(b) - getSuggestionPriority(a)
  );
}
/**
 * Apply a suggestion to the resume profile
 */
export function applySuggestionToProfile(
  profile: any, // Using any to avoid circular dependency with ResumeProfile if it's not imported
  suggestion: InlineSuggestion
): any {
  const newProfile = JSON.parse(JSON.stringify(profile));
  
  // Helper to get nested property
  const getNested = (obj: any, path: string) => {
    return path.split('.').reduce((o, p) => (o ? o[p] : undefined), obj);
  };

  // Helper to set nested property
  const setNested = (obj: any, path: string, value: any) => {
    const parts = path.split('.');
    const last = parts.pop()!;
    const target = parts.reduce((o, p) => o[p], obj);
    if (target) {
      target[last] = value;
    }
  };

  let targetText = '';
  let updatePath = '';

  // Determine target based on section
  if (suggestion.targetSection === 'summary') {
    targetText = newProfile.summary.content;
    updatePath = 'summary.content';
  } else if (suggestion.targetSection === 'experience') {
    const expIndex = newProfile.experience.findIndex((e: any) => e.id === suggestion.targetItemId);
    if (expIndex !== -1) {
      if (suggestion.targetField === 'description') {
        targetText = newProfile.experience[expIndex].description;
        updatePath = `experience.${expIndex}.description`;
      } else if (suggestion.targetField?.startsWith('achievements[')) {
        // Extract index from achievements[0]
        const match = suggestion.targetField.match(/achievements\[(\d+)\]/);
        if (match) {
          const achieveIndex = parseInt(match[1]);
          targetText = newProfile.experience[expIndex].achievements[achieveIndex];
          updatePath = `experience.${expIndex}.achievements.${achieveIndex}`;
        }
      }
    }
  } else if (suggestion.targetSection === 'projects') {
    const projIndex = newProfile.projects.findIndex((p: any) => p.id === suggestion.targetItemId);
    if (projIndex !== -1) {
      if (suggestion.targetField === 'description') {
        targetText = newProfile.projects[projIndex].description;
        updatePath = `projects.${projIndex}.description`;
      } else if (suggestion.targetField?.startsWith('achievements[')) {
        const match = suggestion.targetField.match(/achievements\[(\d+)\]/);
        if (match) {
          const achieveIndex = parseInt(match[1]);
          targetText = newProfile.projects[projIndex].achievements[achieveIndex];
          updatePath = `projects.${projIndex}.achievements.${achieveIndex}`;
        }
      }
    }
  }

  if (targetText && updatePath) {
    const newText = applySuggestion(targetText, suggestion);
    setNested(newProfile, updatePath, newText);
  }

  return newProfile;
}
