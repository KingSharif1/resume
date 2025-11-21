// Section validation utilities

interface ValidationResult {
  isValid: boolean;
  message?: string;
  suggestions?: string[];
}

/**
 * Validates section content based on section type
 */
export function validateSection(type: string, content: string): ValidationResult {
  // Skip validation for empty content
  if (!content.trim()) {
    return { 
      isValid: false, 
      message: 'Section content cannot be empty',
      suggestions: ['Add appropriate content for this section']
    };
  }

  switch (type) {
    case 'contact':
      return validateContactSection(content);
    case 'summary':
      return validateSummarySection(content);
    case 'experience':
    case 'volunteer':
      return validateExperienceSection(content);
    case 'education':
      return validateEducationSection(content);
    case 'skills':
      return validateSkillsSection(content);
    case 'projects':
      return validateProjectsSection(content);
    default:
      // Basic validation for other section types
      return validateGenericSection(content);
  }
}

/**
 * Validates contact information section
 */
function validateContactSection(content: string): ValidationResult {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
  const phoneRegex = /(\+\d{1,3}[-\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  
  const hasEmail = emailRegex.test(content);
  const hasPhone = phoneRegex.test(content);
  
  const suggestions: string[] = [];
  
  if (!hasEmail) {
    suggestions.push('Add your email address');
  }
  
  if (!hasPhone) {
    suggestions.push('Add your phone number');
  }
  
  if (!content.includes('linkedin.com') && !content.includes('github.com')) {
    suggestions.push('Consider adding LinkedIn or GitHub profile links');
  }
  
  return {
    isValid: hasEmail && hasPhone,
    message: hasEmail && hasPhone ? 
      'Contact information looks good' : 
      'Contact section should include at least email and phone number',
    suggestions: suggestions.length > 0 ? suggestions : undefined
  };
}

/**
 * Validates professional summary section
 */
function validateSummarySection(content: string): ValidationResult {
  const wordCount = content.split(/\s+/).length;
  
  if (wordCount < 30) {
    return {
      isValid: false,
      message: 'Summary is too short',
      suggestions: [
        'Aim for 3-5 sentences that highlight your expertise and value',
        'Include your years of experience and key skills',
        'Mention achievements that are relevant to your target role'
      ]
    };
  }
  
  if (wordCount > 200) {
    return {
      isValid: false,
      message: 'Summary is too long',
      suggestions: [
        'Keep your summary concise (around 3-5 sentences)',
        'Focus on your most relevant skills and experiences',
        'Remove unnecessary details or repetitive information'
      ]
    };
  }
  
  return {
    isValid: true,
    message: 'Summary length looks good'
  };
}

/**
 * Validates experience section
 */
function validateExperienceSection(content: string): ValidationResult {
  // Check for bullet points
  const hasBulletPoints = /[•\-*]|^\d+\./m.test(content);
  
  // Check for dates
  const hasDateRange = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/i.test(content);
  
  // Check for action verbs
  const actionVerbs = ['managed', 'developed', 'created', 'implemented', 'designed', 'led', 'built', 'achieved', 'increased', 'decreased', 'improved', 'reduced', 'negotiated', 'coordinated', 'supervised'];
  const hasActionVerbs = actionVerbs.some(verb => new RegExp(`\\b${verb}\\b`, 'i').test(content));
  
  const suggestions: string[] = [];
  
  if (!hasBulletPoints) {
    suggestions.push('Use bullet points to list your responsibilities and achievements');
  }
  
  if (!hasDateRange) {
    suggestions.push('Include employment dates (Month Year - Month Year)');
  }
  
  if (!hasActionVerbs) {
    suggestions.push('Start bullet points with strong action verbs (e.g., Managed, Developed, Implemented)');
  }
  
  return {
    isValid: hasBulletPoints && hasDateRange && hasActionVerbs,
    message: hasBulletPoints && hasDateRange && hasActionVerbs ? 
      'Experience section looks good' : 
      'Experience section needs improvement',
    suggestions: suggestions.length > 0 ? suggestions : undefined
  };
}

/**
 * Validates education section
 */
function validateEducationSection(content: string): ValidationResult {
  // Check for institution name
  const hasInstitution = /university|college|school|institute/i.test(content);
  
  // Check for degree
  const hasDegree = /bachelor|master|ph\.?d|associate|diploma|certificate|degree|b\.?s|b\.?a|m\.?s|m\.?a|m\.?b\.?a/i.test(content);
  
  // Check for graduation year
  const hasYear = /\b20\d{2}\b|\b19\d{2}\b/.test(content);
  
  const suggestions: string[] = [];
  
  if (!hasInstitution) {
    suggestions.push('Include the name of your educational institution');
  }
  
  if (!hasDegree) {
    suggestions.push('Specify your degree or qualification');
  }
  
  if (!hasYear) {
    suggestions.push('Add your graduation year or attendance period');
  }
  
  return {
    isValid: hasInstitution && hasDegree && hasYear,
    message: hasInstitution && hasDegree && hasYear ? 
      'Education section looks good' : 
      'Education section needs improvement',
    suggestions: suggestions.length > 0 ? suggestions : undefined
  };
}

/**
 * Validates skills section
 */
function validateSkillsSection(content: string): ValidationResult {
  // Count the number of skills
  const skillCount = content.split(/[,\n•]/).filter(s => s.trim().length > 0).length;
  
  if (skillCount < 5) {
    return {
      isValid: false,
      message: 'Not enough skills listed',
      suggestions: [
        'List at least 5-10 relevant skills',
        'Include both technical and soft skills',
        'Group skills by category if you have many'
      ]
    };
  }
  
  // Check if skills are organized by category
  const hasCategories = /languages|frameworks|tools|technologies|databases|soft skills|methodologies/i.test(content);
  
  return {
    isValid: true,
    message: 'Skills section looks good',
    suggestions: !hasCategories && skillCount > 10 ? 
      ['Consider organizing your skills by category for better readability'] : 
      undefined
  };
}

/**
 * Validates projects section
 */
function validateProjectsSection(content: string): ValidationResult {
  // Check for project names
  const hasProjectNames = /project|app|application|website|system|platform/i.test(content);
  
  // Check for technologies used
  const hasTechnologies = /react|angular|vue|javascript|typescript|python|java|c#|node|express|django|flask|sql|mongodb|aws|azure|docker|kubernetes/i.test(content);
  
  // Check for descriptions
  const hasDescriptions = content.split('\n').filter(line => line.trim().length > 20).length > 0;
  
  const suggestions: string[] = [];
  
  if (!hasProjectNames) {
    suggestions.push('Include clear project names or titles');
  }
  
  if (!hasTechnologies) {
    suggestions.push('Mention the technologies or tools used in each project');
  }
  
  if (!hasDescriptions) {
    suggestions.push('Add brief descriptions explaining the purpose and your role in each project');
  }
  
  return {
    isValid: hasProjectNames && hasTechnologies && hasDescriptions,
    message: hasProjectNames && hasTechnologies && hasDescriptions ? 
      'Projects section looks good' : 
      'Projects section needs improvement',
    suggestions: suggestions.length > 0 ? suggestions : undefined
  };
}

/**
 * Basic validation for generic sections
 */
function validateGenericSection(content: string): ValidationResult {
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  
  if (lines.length < 2) {
    return {
      isValid: false,
      message: 'Section content is too brief',
      suggestions: [
        'Add more details to this section',
        'Use bullet points for better readability'
      ]
    };
  }
  
  return {
    isValid: true,
    message: 'Section content looks good'
  };
}
