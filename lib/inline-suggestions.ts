/**
 * Inline Suggestion System
 * 
 * This module handles AI-powered inline suggestions for resume text,
 * similar to Google Docs comments. Suggestions target specific text
 * with exact character positions for precise highlighting.
 */

export type SuggestionType = 'typo' | 'grammar' | 'wording' | 'tone' | 'formatting' | 'metric' | 'ats';
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
  // If both offsets are 0, replace the entire text
  if (suggestion.startOffset === 0 && suggestion.endOffset === 0) {
    return suggestion.suggestedText;
  }
  
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
 * Get suggestion type label with context awareness
 * Detects if suggestion is adding content vs replacing
 */
export function getSuggestionTypeLabel(type: SuggestionType, suggestion?: InlineSuggestion): string {
  // If no original text, it's an addition
  const isAddition = suggestion && !suggestion.originalText;
  
  switch (type) {
    case 'typo': return 'Typo';
    case 'grammar': return 'Grammar';
    case 'wording': return isAddition ? 'Add Keywords' : 'Wording';
    case 'metric': return 'Add Metric';
    case 'ats': return isAddition ? 'Add Keywords' : 'ATS';
    case 'tone': return 'Tone';
    case 'formatting': return 'Formatting';
    default: return isAddition ? 'Add Content' : 'Suggestion';
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
  console.log('[applySuggestionToProfile] Processing:', {
    section: suggestion.targetSection,
    itemId: suggestion.targetItemId,
    field: suggestion.targetField,
    hasOriginal: !!suggestion.originalText,
    hasSuggested: !!suggestion.suggestedText,
  });
  
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

  // Normalize section names
  const normalizedSection = suggestion.targetSection.toLowerCase().replace(/\s+/g, '_');
  
  // Determine target based on section
  if (normalizedSection === 'contact') {
    // Handle contact fields
    if (suggestion.targetField === 'name') {
      targetText = `${newProfile.contact.firstName}${newProfile.contact.middleName ? ` ${newProfile.contact.middleName}` : ''} ${newProfile.contact.lastName}`;
      updatePath = 'contact.firstName'; // Will need special handling
    } else if (suggestion.targetField === 'email') {
      targetText = newProfile.contact.email || '';
      updatePath = 'contact.email';
    } else if (suggestion.targetField === 'phone') {
      targetText = newProfile.contact.phone || '';
      updatePath = 'contact.phone';
    } else if (suggestion.targetField === 'location') {
      targetText = newProfile.contact.location || '';
      updatePath = 'contact.location';
    }
  } else if (normalizedSection === 'summary' || normalizedSection === 'professional_summary') {
    targetText = newProfile.summary?.content || '';
    updatePath = 'summary.content';
  } else if (normalizedSection === 'certifications') {
    let certIndex = newProfile.certifications.findIndex((c: any) => c.id === suggestion.targetItemId);
    
    if (certIndex === -1 && newProfile.certifications.length > 0) {
      certIndex = 0;
    }
    
    if (certIndex !== -1) {
      if (suggestion.targetField === 'name') {
        targetText = newProfile.certifications[certIndex].name || '';
        updatePath = `certifications.${certIndex}.name`;
      } else if (suggestion.targetField === 'issuer') {
        targetText = newProfile.certifications[certIndex].issuer || '';
        updatePath = `certifications.${certIndex}.issuer`;
      }
    }
  } else if (normalizedSection === 'volunteer') {
    let volIndex = newProfile.volunteer.findIndex((v: any) => v.id === suggestion.targetItemId);
    
    if (volIndex === -1 && newProfile.volunteer.length > 0) {
      volIndex = 0;
    }
    
    if (volIndex !== -1) {
      if (suggestion.targetField === 'role') {
        targetText = newProfile.volunteer[volIndex].role || '';
        updatePath = `volunteer.${volIndex}.role`;
      } else if (suggestion.targetField === 'organization') {
        targetText = newProfile.volunteer[volIndex].organization || '';
        updatePath = `volunteer.${volIndex}.organization`;
      } else if (suggestion.targetField === 'description') {
        targetText = newProfile.volunteer[volIndex].description || '';
        updatePath = `volunteer.${volIndex}.description`;
      }
    }
  } else if (normalizedSection === 'languages') {
    let langIndex = newProfile.languages.findIndex((l: any) => l.id === suggestion.targetItemId);
    
    if (langIndex === -1 && newProfile.languages.length > 0) {
      langIndex = 0;
    }
    
    if (langIndex !== -1) {
      if (suggestion.targetField === 'name') {
        targetText = newProfile.languages[langIndex].name || '';
        updatePath = `languages.${langIndex}.name`;
      } else if (suggestion.targetField === 'proficiency') {
        targetText = newProfile.languages[langIndex].proficiency || '';
        updatePath = `languages.${langIndex}.proficiency`;
      }
    }
  } else if (normalizedSection === 'references') {
    let refIndex = newProfile.references.findIndex((r: any) => r.id === suggestion.targetItemId);
    
    if (refIndex === -1 && newProfile.references.length > 0) {
      refIndex = 0;
    }
    
    if (refIndex !== -1) {
      if (suggestion.targetField === 'name') {
        targetText = newProfile.references[refIndex].name || '';
        updatePath = `references.${refIndex}.name`;
      } else if (suggestion.targetField === 'title') {
        targetText = newProfile.references[refIndex].title || '';
        updatePath = `references.${refIndex}.title`;
      } else if (suggestion.targetField === 'company') {
        targetText = newProfile.references[refIndex].company || '';
        updatePath = `references.${refIndex}.company`;
      } else if (suggestion.targetField === 'email') {
        targetText = newProfile.references[refIndex].email || '';
        updatePath = `references.${refIndex}.email`;
      } else if (suggestion.targetField === 'phone') {
        targetText = newProfile.references[refIndex].phone || '';
        updatePath = `references.${refIndex}.phone`;
      }
    }
  } else if (normalizedSection === 'education') {
    // Find education item by ID
    let eduIndex = newProfile.education.findIndex((e: any) => e.id === suggestion.targetItemId);
    
    if (eduIndex === -1 && suggestion.targetItemId) {
      eduIndex = newProfile.education.findIndex((e: any) => 
        e.institution === suggestion.targetItemId
      );
    }
    
    if (eduIndex === -1 && newProfile.education.length > 0) {
      eduIndex = 0;
    }
    
    if (eduIndex !== -1) {
      const edu = newProfile.education[eduIndex];
      
      if (suggestion.targetField === 'institution') {
        targetText = edu.institution || '';
        updatePath = `education.${eduIndex}.institution`;
      } else if (suggestion.targetField === 'degree') {
        targetText = edu.degree || '';
        updatePath = `education.${eduIndex}.degree`;
      } else if (suggestion.targetField === 'fieldOfStudy') {
        targetText = edu.fieldOfStudy || '';
        updatePath = `education.${eduIndex}.fieldOfStudy`;
      } else if (suggestion.targetField === 'content') {
        // Handle combined format: "B.S. in Computer Science from Hardin-Simmons University"
        // Build the full text as shown in preview
        const fullText = `${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''} from ${edu.institution}`;
        targetText = fullText;
        
        // Parse the suggested text to extract components
        const suggestedText = suggestion.suggestedText;
        
        // Try to parse: "degree [in fieldOfStudy] from institution"
        const fromMatch = suggestedText.match(/^(.+?)\s+from\s+(.+)$/);
        if (fromMatch) {
          const degreeAndField = fromMatch[1].trim();
          const newInstitution = fromMatch[2].trim();
          
          // Check if there's "in fieldOfStudy"
          const inMatch = degreeAndField.match(/^(.+?)\s+in\s+(.+)$/);
          if (inMatch) {
            newProfile.education[eduIndex].degree = inMatch[1].trim();
            newProfile.education[eduIndex].fieldOfStudy = inMatch[2].trim();
          } else {
            newProfile.education[eduIndex].degree = degreeAndField;
          }
          
          newProfile.education[eduIndex].institution = newInstitution;
        }
        
        return newProfile;
      }
    }
  } else if (normalizedSection === 'experience' || normalizedSection === 'work_experience') {
    // Try to find by ID first, then by name/position
    let expIndex = newProfile.experience.findIndex((e: any) => e.id === suggestion.targetItemId);
    
    // If not found by ID, try by position or company name
    if (expIndex === -1 && suggestion.targetItemId) {
      expIndex = newProfile.experience.findIndex((e: any) => 
        e.position === suggestion.targetItemId || 
        e.company === suggestion.targetItemId ||
        `${e.position} at ${e.company}` === suggestion.targetItemId
      );
    }
    
    // If still not found, use first experience
    if (expIndex === -1 && newProfile.experience.length > 0) {
      expIndex = 0;
    }
    
    if (expIndex !== -1) {
      if (suggestion.targetField === 'position') {
        targetText = newProfile.experience[expIndex].position || '';
        updatePath = `experience.${expIndex}.position`;
      } else if (suggestion.targetField === 'company') {
        targetText = newProfile.experience[expIndex].company || '';
        updatePath = `experience.${expIndex}.company`;
      } else if (suggestion.targetField === 'description') {
        targetText = newProfile.experience[expIndex].description || '';
        updatePath = `experience.${expIndex}.description`;
      } else if (suggestion.targetField === 'achievements' || suggestion.targetField?.startsWith('achievements[')) {
        // Handle achievements field
        if (suggestion.targetField === 'achievements') {
          // Find the achievement by matching originalText
          const achievements = newProfile.experience[expIndex].achievements || [];
          const achieveIndex = achievements.findIndex((a: string) => 
            a === suggestion.originalText || a.includes(suggestion.originalText.substring(0, 50))
          );
          
          if (achieveIndex !== -1) {
            targetText = achievements[achieveIndex];
            updatePath = `experience.${expIndex}.achievements.${achieveIndex}`;
          } else if (achievements.length > 0) {
            targetText = achievements[0];
            updatePath = `experience.${expIndex}.achievements.0`;
          }
        } else {
          // achievements[0] format
          const match = suggestion.targetField.match(/achievements\[(\d+)\]/);
          if (match) {
            const achieveIndex = parseInt(match[1]);
            targetText = newProfile.experience[expIndex].achievements?.[achieveIndex] || '';
            updatePath = `experience.${expIndex}.achievements.${achieveIndex}`;
          }
        }
      }
    }
  } else if (normalizedSection === 'projects') {
    // Try to find by ID first, then by name
    let projIndex = newProfile.projects.findIndex((p: any) => p.id === suggestion.targetItemId);
    
    // If not found by ID, try by name
    if (projIndex === -1 && suggestion.targetItemId) {
      projIndex = newProfile.projects.findIndex((p: any) => 
        p.name === suggestion.targetItemId || p.title === suggestion.targetItemId
      );
    }
    
    if (projIndex !== -1) {
      // Handle both 'description' and 'content' field names
      const fieldName = suggestion.targetField === 'content' ? 'description' : suggestion.targetField;
      
      if (fieldName === 'name') {
        targetText = newProfile.projects[projIndex].name || '';
        updatePath = `projects.${projIndex}.name`;
      } else if (fieldName === 'description') {
        targetText = newProfile.projects[projIndex].description || '';
        updatePath = `projects.${projIndex}.description`;
      } else if (suggestion.targetField?.startsWith('achievements[')) {
        const match = suggestion.targetField.match(/achievements\[(\d+)\]/);
        if (match) {
          const achieveIndex = parseInt(match[1]);
          targetText = newProfile.projects[projIndex].achievements?.[achieveIndex] || '';
          updatePath = `projects.${projIndex}.achievements.${achieveIndex}`;
        }
      }
    }
  } else if (normalizedSection === 'skills') {
    console.log('[applySuggestionToProfile] === SKILLS SUGGESTION START ===');
    
    // Parse category from text if targetItemId is undefined
    let category = suggestion.targetItemId;
    console.log('[applySuggestionToProfile] Initial category from targetItemId:', category);
    
    if (!category && (suggestion.originalText || suggestion.suggestedText)) {
      const text = suggestion.originalText || suggestion.suggestedText;
      console.log('[applySuggestionToProfile] Extracting category from text:', text);
      const match = text.match(/^([^:]+):/);
      if (match) {
        category = match[1].trim();
        console.log('[applySuggestionToProfile] ✓ Extracted category:', category);
      } else {
        console.log('[applySuggestionToProfile] ✗ No category pattern found in text');
      }
    }

    console.log('[applySuggestionToProfile] Skills suggestion details:', {
      category,
      targetItemId: suggestion.targetItemId,
      originalText: suggestion.originalText,
      suggestedText: suggestion.suggestedText,
      currentSkillsCategories: Object.keys(newProfile.skills)
    });

    if (!category) {
      console.warn('[applySuggestionToProfile] ✗ No category found for skills suggestion - ABORTING');
      return newProfile;
    }

    // Verify category exists in profile
    if (!newProfile.skills[category]) {
      console.warn(`[applySuggestionToProfile] ⚠ Category "${category}" not found in profile. Available categories:`, Object.keys(newProfile.skills));
      console.log('[applySuggestionToProfile] Creating new category:', category);
      newProfile.skills[category] = [];
    } else {
      console.log(`[applySuggestionToProfile] ✓ Category "${category}" exists with skills:`, newProfile.skills[category]);
    }

    // Parse skills from text
    const parseSkills = (text: string): string[] => {
      if (!text) return [];
      // Remove category prefix if present
      const skillsText = text.includes(':') ? text.split(':')[1] : text;
      const parsed = skillsText.split(',').map(s => s.trim()).filter(Boolean);
      console.log('[applySuggestionToProfile] Parsed skills from text:', { input: text, output: parsed });
      return parsed;
    };

    const originalSkills = parseSkills(suggestion.originalText);
    const suggestedSkills = parseSkills(suggestion.suggestedText);

    console.log('[applySuggestionToProfile] Skill comparison:', {
      category,
      originalSkills,
      suggestedSkills,
      currentProfileSkills: newProfile.skills[category],
      newSkillsToAdd: suggestedSkills.filter(s => !originalSkills.includes(s))
    });

    // If no original text, add new skills
    if (!suggestion.originalText) {
      console.log('[applySuggestionToProfile] MODE: Adding new skills (no original text)');
      let addedCount = 0;
      suggestedSkills.forEach(skill => {
        if (!newProfile.skills[category].includes(skill)) {
          newProfile.skills[category].push(skill);
          addedCount++;
          console.log(`[applySuggestionToProfile] ✓ Added skill: "${skill}" to category "${category}"`);
        } else {
          console.log(`[applySuggestionToProfile] ⊘ Skill already exists: "${skill}"`);
        }
      });
      console.log(`[applySuggestionToProfile] Added ${addedCount} new skills to "${category}"`);
    } else {
      // Replace the entire skill list for this category
      console.log('[applySuggestionToProfile] MODE: Replacing entire skill list');
      console.log('[applySuggestionToProfile] Before:', newProfile.skills[category]);
      newProfile.skills[category] = suggestedSkills;
      console.log('[applySuggestionToProfile] After:', newProfile.skills[category]);
    }

    console.log('[applySuggestionToProfile] Final skills for category:', {
      category,
      skills: newProfile.skills[category]
    });
    console.log('[applySuggestionToProfile] === SKILLS SUGGESTION END ===');
    return newProfile;
  }

  if (targetText && updatePath) {
    const newText = applySuggestion(targetText, suggestion);
    setNested(newProfile, updatePath, newText);
  }

  return newProfile;
}
