// Unified Field Components
// Central export for all field components

export { UnifiedTextField } from './UnifiedTextField';
export { UnifiedTextarea } from './UnifiedTextarea';
export { UnifiedListField } from './UnifiedListField';
export { UnifiedDateField } from './UnifiedDateField';
export { UnifiedSelectField } from './UnifiedSelectField';
export { UnifiedToggleField } from './UnifiedToggleField';

// Re-export types
export type {
  FieldType,
  FieldSuggestion,
  UnifiedFieldProps,
  UnifiedListFieldProps,
  UnifiedSelectFieldProps,
  UnifiedToggleFieldProps,
  FieldValue,
} from '@/lib/fields/field-types';

export {
  generateFieldId,
  generateListItemId,
} from '@/lib/fields/field-types';

// Re-export section visibility types and utilities
export type { SectionVisibility } from '@/lib/fields/extract-resume-text';
export { 
  DEFAULT_SECTION_VISIBILITY,
  extractAllResumeText,
  getResumeFullText,
  searchResumeText,
  getResumeWordCount,
  getResumeCharCount,
} from '@/lib/fields/extract-resume-text';
