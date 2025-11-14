export interface ResumeSection {
  title: string;
  content: string;
}

export interface TailoredResume {
  summary: string;
  sections: ResumeSection[];
  notes: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  portfolio?: string;
}

export interface Experience {
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  location?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  highlights?: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface Skills {
  [category: string]: string[];
}

export interface CustomSection {
  title: string;
  content: string;
}

export interface BaseResume {
  id?: string;
  user_id?: string;
  title: string;
  contact_info: ContactInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skills;
  certifications?: Certification[];
  projects?: Project[];
  custom_sections?: CustomSection[];
  created_at?: string;
  updated_at?: string;
}

export interface AIChange {
  section: string;
  type: 'added' | 'modified' | 'removed';
  original?: string;
  modified: string;
  reason: string;
}

export interface AISuggestion {
  section: string;
  type: 'keyword' | 'structure' | 'content';
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

export interface TailoredResumeData {
  id?: string;
  user_id?: string;
  base_resume_id?: string;
  job_title: string;
  job_description: string;
  tailored_content: BaseResume;
  ai_changes: AIChange[];
  ai_suggestions: AISuggestion[];
  template_id?: string;
  created_at?: string;
}
