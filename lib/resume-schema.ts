/**
 * Resume Schema Definition
 * 
 * This file defines the strict structure for a Base Resume Profile.
 * This ensures consistency between parsing, storage, and UI components.
 */

// Contact Information
export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  portfolio?: string;
}

// Professional Summary
export interface Summary {
  content: string;
}

// Work Experience Entry
export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string; // YYYY-MM format
  endDate?: string; // YYYY-MM format or "Present"
  current: boolean;
  description: string;
  achievements: string[]; // Bullet points
  skills?: string[]; // Skills used in this role
}

// Education Entry
export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  honors?: string[];
  coursework?: string[];
  activities?: string[];
}

// Project Entry
export interface Project {
  id: string;
  name: string;
  description: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  technologies: string[];
  url?: string;
  github?: string;
  achievements: string[];
}

// Skills organized by category
export interface Skills {
  technical: string[];
  soft: string[];
  tools: string[];
  frameworks: string[];
  databases: string[];
  other: string[];
}

// Certification Entry
export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

// Volunteer Experience Entry
export interface VolunteerExperience {
  id: string;
  organization: string;
  role: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
}

// Award/Achievement Entry
export interface Award {
  id: string;
  title: string;
  issuer: string;
  date?: string;
  description?: string;
}

// Publication Entry
export interface Publication {
  id: string;
  title: string;
  publisher: string;
  date?: string;
  url?: string;
  description?: string;
  authors?: string[];
}

// Language Entry
export interface Language {
  id: string;
  name: string;
  proficiency: 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic';
  certification?: string;
}

// Reference Entry
export interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  email?: string;
  phone?: string;
  relationship: string;
}

// Interest/Hobby Entry
export interface Interest {
  id: string;
  name: string;
  description?: string;
}

// Custom Section Entry (for user-defined sections)
export interface CustomSection {
  id: string;
  title: string;
  type: 'text' | 'list' | 'structured';
  content: any; // Flexible content based on type
}

// The Complete Resume Profile
export interface ResumeProfile {
  id?: string;
  // Required sections
  contact: ContactInfo;
  summary?: Summary;
  
  // Experience sections (arrays)
  experience: WorkExperience[];
  education: Education[];
  
  // Optional sections (arrays)
  projects: Project[];
  skills: Skills;
  certifications: Certification[];
  volunteer: VolunteerExperience[];
  awards: Award[];
  publications: Publication[];
  languages: Language[];
  references: Reference[];
  interests: Interest[];
  
  // Custom sections
  customSections: CustomSection[];
  
  // Metadata
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
    templateId?: string;
  };
}

// Section Types for Navigation
export type SectionType = 
  | 'contact'
  | 'summary'
  | 'experience'
  | 'education'
  | 'projects'
  | 'skills'
  | 'certifications'
  | 'volunteer'
  | 'awards'
  | 'publications'
  | 'languages'
  | 'references'
  | 'interests'
  | 'custom';

// Section Configuration for UI
export interface SectionConfig {
  key: SectionType;
  label: string;
  icon: string;
  description: string;
  required: boolean;
  multiple: boolean; // Can have multiple entries
}

// Default section configurations
export const SECTION_CONFIGS: SectionConfig[] = [
  {
    key: 'contact',
    label: 'Contact',
    icon: 'User',
    description: 'Personal contact information',
    required: true,
    multiple: false
  },
  {
    key: 'summary',
    label: 'Summary',
    icon: 'FileText',
    description: 'Professional summary or objective',
    required: false,
    multiple: false
  },
  {
    key: 'experience',
    label: 'Experience',
    icon: 'Briefcase',
    description: 'Work experience and employment history',
    required: false,
    multiple: true
  },
  {
    key: 'education',
    label: 'Education',
    icon: 'GraduationCap',
    description: 'Educational background and qualifications',
    required: false,
    multiple: true
  },
  {
    key: 'projects',
    label: 'Projects',
    icon: 'Folder',
    description: 'Personal and professional projects',
    required: false,
    multiple: true
  },
  {
    key: 'skills',
    label: 'Skills',
    icon: 'Code',
    description: 'Technical and soft skills',
    required: false,
    multiple: false
  },
  {
    key: 'certifications',
    label: 'Certifications',
    icon: 'Award',
    description: 'Professional certifications and licenses',
    required: false,
    multiple: true
  },
  {
    key: 'volunteer',
    label: 'Volunteer',
    icon: 'Heart',
    description: 'Volunteer work and community involvement',
    required: false,
    multiple: true
  },
  {
    key: 'awards',
    label: 'Awards',
    icon: 'Trophy',
    description: 'Awards and achievements',
    required: false,
    multiple: true
  },
  {
    key: 'publications',
    label: 'Publications',
    icon: 'Globe',
    description: 'Published works and articles',
    required: false,
    multiple: true
  },
  {
    key: 'languages',
    label: 'Languages',
    icon: 'MessageCircle',
    description: 'Languages you speak and proficiency levels',
    required: false,
    multiple: true
  },
  {
    key: 'references',
    label: 'References',
    icon: 'Users',
    description: 'Professional references',
    required: false,
    multiple: true
  },
  {
    key: 'interests',
    label: 'Interests',
    icon: 'Coffee',
    description: 'Personal interests and hobbies',
    required: false,
    multiple: true
  }
];

// Utility functions
export function createEmptyProfile(): ResumeProfile {
  return {
    contact: {
      firstName: '',
      lastName: '',
      email: ''
    },
    experience: [],
    education: [],
    projects: [],
    skills: {
      technical: [],
      soft: [],
      tools: [],
      frameworks: [],
      databases: [],
      other: []
    },
    certifications: [],
    volunteer: [],
    awards: [],
    publications: [],
    languages: [],
    references: [],
    interests: [],
    customSections: [],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0'
    }
  };
}

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Validation helpers
export function validateContact(contact: ContactInfo): string[] {
  const errors: string[] = [];
  
  if (!contact.firstName.trim()) {
    errors.push('First name is required');
  }
  
  if (!contact.lastName.trim()) {
    errors.push('Last name is required');
  }
  
  if (!contact.email.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
    errors.push('Invalid email format');
  }
  
  return errors;
}

export function validateWorkExperience(experience: WorkExperience): string[] {
  const errors: string[] = [];
  
  if (!experience.company.trim()) {
    errors.push('Company name is required');
  }
  
  if (!experience.position.trim()) {
    errors.push('Position is required');
  }
  
  if (!experience.startDate.trim()) {
    errors.push('Start date is required');
  }
  
  if (!experience.description.trim()) {
    errors.push('Description is required');
  }
  
  return errors;
}
