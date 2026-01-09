/**
 * Unified Field Types
 * 
 * Central type definitions for all resume form fields.
 * These types enable consistent rendering, validation, highlighting, and suggestions.
 */

import { SectionType } from '../resume-schema';

// Available field types
export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'date' 
  | 'phone' 
  | 'email' 
  | 'url' 
  | 'list' 
  | 'tags' 
  | 'select' 
  | 'toggle';

// Suggestion that can be applied to a field
export interface FieldSuggestion {
  id: string;
  original: string;
  replacement: string;
  message?: string;
  type: 'typo' | 'grammar' | 'style' | 'capitalization' | 'ai';
}

// Common props for all unified field components
export interface UnifiedFieldProps {
  // Identity - used for scrolling and highlighting
  id: string;
  section: SectionType;
  fieldKey: string;
  itemId?: string;
  itemIndex?: number;
  
  // Basic field props
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  
  // Highlighting (when user clicks a tip in score panel)
  highlighted?: boolean;
  
  // Inline suggestion support
  suggestion?: FieldSuggestion;
  onAcceptSuggestion?: (suggestion: FieldSuggestion) => void;
  onDismissSuggestion?: (suggestion: FieldSuggestion) => void;
  
  // Validation
  error?: string;
  helpText?: string;
  
  // Styling
  className?: string;
}

// Props for list fields (achievements, bullet points)
export interface UnifiedListFieldProps extends Omit<UnifiedFieldProps, 'value' | 'onChange'> {
  value: string[];
  onChange: (value: string[]) => void;
  minItems?: number;
  maxItems?: number;
  itemPlaceholder?: string;
  
  // Suggestions can target specific items
  itemSuggestions?: Map<number, FieldSuggestion>;
  highlightedItemIndex?: number;
}

// Props for select fields
export interface UnifiedSelectFieldProps extends UnifiedFieldProps {
  options: { value: string; label: string }[];
}

// Props for toggle fields
export interface UnifiedToggleFieldProps extends Omit<UnifiedFieldProps, 'value' | 'onChange'> {
  value: boolean;
  onChange: (value: boolean) => void;
}

// Field value with metadata - used for resume-wide text extraction
export interface FieldValue {
  section: SectionType;
  itemId?: string;
  itemIndex?: number;
  fieldKey: string;
  value: string;
  elementId: string;
  label: string;
}

// Generate consistent element ID for a field
export function generateFieldId(
  section: SectionType, 
  fieldKey: string, 
  itemId?: string, 
  itemIndex?: number
): string {
  if (itemId) {
    return `${section}-${itemId}-${fieldKey}`;
  }
  if (itemIndex !== undefined) {
    return `${section}-${itemIndex}-${fieldKey}`;
  }
  return `${section}-${fieldKey}`;
}

// Generate element ID for a list item
export function generateListItemId(
  section: SectionType,
  fieldKey: string,
  itemId: string | undefined,
  itemIndex: number,
  listIndex: number
): string {
  const baseId = generateFieldId(section, fieldKey, itemId, undefined);
  return `${baseId}-${listIndex}`;
}
