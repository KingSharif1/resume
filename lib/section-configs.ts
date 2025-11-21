import { FieldConfig } from '@/components/section-editors/ConfigurableEditor';

// Define standard section configurations
export const sectionConfigs: Record<string, FieldConfig[]> = {
  // Contact Information section
  contact: [
    { type: 'text', name: 'name', label: 'Full Name', required: true },
    { type: 'text', name: 'email', label: 'Email', required: true },
    { type: 'text', name: 'phone', label: 'Phone' },
    { type: 'text', name: 'location', label: 'Location' },
    { type: 'text', name: 'linkedin', label: 'LinkedIn URL' },
    { type: 'text', name: 'github', label: 'GitHub URL' },
    { type: 'text', name: 'website', label: 'Personal Website' }
  ],
  
  // Summary section
  summary: [
    { type: 'textarea', name: 'content', label: 'Professional Summary', required: true }
  ],
  // Work Experience section
  experience: [
    { type: 'text', name: 'company', label: 'Company/Organization', required: true },
    { type: 'text', name: 'position', label: 'Position/Title', required: true },
    { type: 'text', name: 'location', label: 'Location' },
    { type: 'dateRange', name: 'period', label: 'Employment Period' },
    { type: 'textarea', name: 'description', label: 'Description' },
    { type: 'list', name: 'highlights', label: 'Key Achievements/Responsibilities' }
  ],
  
  // Education section
  education: [
    { type: 'text', name: 'institution', label: 'School/University', required: true },
    { type: 'text', name: 'degree', label: 'Degree/Certificate' },
    { type: 'text', name: 'fieldOfStudy', label: 'Field of Study' },
    { type: 'dateRange', name: 'period', label: 'Study Period' },
    { type: 'text', name: 'gpa', label: 'GPA' },
    { type: 'textarea', name: 'description', label: 'Additional Information' }
  ],
  
  // Skills section
  skills: [
    { 
      type: 'categorizedList', 
      name: 'skills', 
      label: 'Skills', 
      categories: ['Technical', 'Soft', 'Languages', 'Tools', 'Other']
    }
  ],
  
  // Projects section
  projects: [
    { type: 'text', name: 'name', label: 'Project Name', required: true },
    { type: 'text', name: 'role', label: 'Your Role' },
    { type: 'dateRange', name: 'period', label: 'Project Period' },
    { type: 'textarea', name: 'description', label: 'Description' },
    { type: 'list', name: 'technologies', label: 'Technologies Used' },
    { type: 'text', name: 'link', label: 'Project Link' }
  ],
  
  // Certifications section
  certifications: [
    { type: 'text', name: 'name', label: 'Certification Name', required: true },
    { type: 'text', name: 'issuer', label: 'Issuing Organization' },
    { type: 'date', name: 'date', label: 'Date Obtained' },
    { type: 'date', name: 'expiry', label: 'Expiration Date (if applicable)' },
    { type: 'text', name: 'id', label: 'Certification ID' }
  ],
  
  // Volunteer Experience section
  volunteer: [
    { type: 'text', name: 'organization', label: 'Organization', required: true },
    { type: 'text', name: 'role', label: 'Role', required: true },
    { type: 'dateRange', name: 'period', label: 'Period' },
    { type: 'textarea', name: 'description', label: 'Description' }
  ],
  
  // Publications section
  publications: [
    { type: 'text', name: 'title', label: 'Title', required: true },
    { type: 'text', name: 'publisher', label: 'Publisher/Journal' },
    { type: 'date', name: 'date', label: 'Publication Date' },
    { type: 'textarea', name: 'description', label: 'Description' },
    { type: 'text', name: 'link', label: 'Link' }
  ],
  
  // Awards section
  awards: [
    { type: 'text', name: 'title', label: 'Award Title', required: true },
    { type: 'text', name: 'issuer', label: 'Issuing Organization' },
    { type: 'date', name: 'date', label: 'Date Received' },
    { type: 'textarea', name: 'description', label: 'Description' }
  ],
  
  // Default/custom section (minimal)
  custom: [
    { type: 'textarea', name: 'content', label: 'Content', required: true }
  ]
};

// Function to get section config by type
export function getSectionConfig(sectionType: string): FieldConfig[] {
  // Normalize section type (lowercase, remove spaces)
  const normalizedType = sectionType.toLowerCase().replace(/\s+/g, '');
  
  // Try to match with known section types
  for (const [key, config] of Object.entries(sectionConfigs)) {
    if (normalizedType.includes(key)) {
      return config;
    }
  }
  
  // Fall back to custom section
  return sectionConfigs.custom;
}

// Map parsed section titles to standard section types
export function mapSectionType(sectionTitle: string): string {
  const title = sectionTitle.toLowerCase();
  
  if (title.includes('contact') || title.includes('personal') || title.includes('info')) {
    return 'contact';
  }
  
  if (title.includes('summary') || title.includes('objective') || title.includes('profile')) {
    return 'summary';
  }
  
  if (title.includes('experience') || title.includes('employment') || title.includes('work')) {
    return 'experience';
  }
  
  if (title.includes('education') || title.includes('academic')) {
    return 'education';
  }
  
  if (title.includes('skill')) {
    return 'skills';
  }
  
  if (title.includes('project')) {
    return 'projects';
  }
  
  if (title.includes('certification') || title.includes('certificate')) {
    return 'certifications';
  }
  
  if (title.includes('volunteer')) {
    return 'volunteer';
  }
  
  if (title.includes('publication')) {
    return 'publications';
  }
  
  if (title.includes('award') || title.includes('honor')) {
    return 'awards';
  }
  
  // Default to custom
  return 'custom';
}
