/**
 * Strict JSON Schema for GPT-4o Structured Outputs
 * Ensures 100% schema adherence when parsing resumes
 */

export const resumeParseSchema = {
  type: "object",
  properties: {
    contact: {
      type: "object",
      properties: {
        firstName: { type: "string", description: "First name" },
        middleName: { type: "string", description: "Middle name or initial (if present), use empty string if not present", default: "" },
        lastName: { type: "string", description: "Last name" },
        email: { type: "string", description: "Email address" },
        phone: { type: "string", description: "Phone number, use empty string if not present", default: "" },
        location: { type: "string", description: "City, State format, use empty string if not present", default: "" },
        linkedin: { type: "string", description: "LinkedIn profile URL, use empty string if not present", default: "" },
        github: { type: "string", description: "GitHub profile URL, use empty string if not present", default: "" },
        website: { type: "string", description: "Personal website URL, use empty string if not present", default: "" }
      },
      required: ["firstName", "middleName", "lastName", "email", "phone", "location", "linkedin", "github", "website"],
      additionalProperties: false
    },
    summary: {
      type: "string",
      description: "Professional summary or objective statement"
    },
    experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          company: { type: "string", description: "Company or organization name" },
          position: { type: "string", description: "Job title or position" },
          location: { type: "string", description: "Job location" },
          startDate: { type: "string", description: "Start date (Month YYYY or YYYY-MM format)" },
          endDate: { type: "string", description: "End date (Month YYYY, YYYY-MM, or 'Present')" },
          current: { type: "boolean", description: "Whether this is a current position" },
          description: { type: "string", description: "Job description" },
          achievements: {
            type: "array",
            items: { type: "string" },
            description: "List of achievements and responsibilities"
          }
        },
        required: ["company", "position"],
        additionalProperties: false
      }
    },
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Project name" },
          description: { type: "string", description: "Project description" },
          startDate: { type: "string", description: "Start date" },
          endDate: { type: "string", description: "End date or 'Present'" },
          current: { type: "boolean", description: "Whether this is an ongoing project" },
          technologies: {
            type: "array",
            items: { type: "string" },
            description: "Technologies used"
          },
          achievements: {
            type: "array",
            items: { type: "string" },
            description: "Project achievements"
          },
          url: { type: "string", description: "Project URL" }
        },
        required: ["name"],
        additionalProperties: false
      }
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          institution: { type: "string", description: "School or university name" },
          degree: { type: "string", description: "Degree type (e.g., Bachelor of Science)" },
          fieldOfStudy: { type: "string", description: "Field of study or major" },
          location: { type: "string", description: "School location" },
          startDate: { type: "string", description: "Start date (Month YYYY or YYYY-MM)" },
          endDate: { type: "string", description: "End date or expected graduation (Month YYYY or YYYY-MM)" },
          gpa: { type: "string", description: "GPA (e.g., '3.8/4.0' or '3.8')" },
          honors: {
            type: "array",
            items: { type: "string" },
            description: "Academic honors or awards"
          }
        },
        required: ["institution", "degree"],
        additionalProperties: false
      }
    },
    skills: {
      type: "object",
      description: "Skills organized by category. Keys are category names (e.g., 'Technical Skills', 'Languages', 'Tools'), values are arrays of skills",
      additionalProperties: {
        type: "array",
        items: { type: "string" }
      }
    },
    certifications: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Certification name" },
          issuer: { type: "string", description: "Issuing organization" },
          date: { type: "string", description: "Date obtained" },
          expiryDate: { type: "string", description: "Expiry date (if applicable)" },
          url: { type: "string", description: "Credential URL" }
        },
        required: ["name"],
        additionalProperties: false
      }
    }
  },
  required: ["contact"],
  additionalProperties: false
} as const;

export type ResumeParseResult = {
  contact: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  summary?: string;
  experience?: Array<{
    company: string;
    position: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string;
    achievements?: string[];
  }>;
  projects?: Array<{
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    technologies?: string[];
    achievements?: string[];
    url?: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
    honors?: string[];
  }>;
  skills?: Record<string, string[]>;
  certifications?: Array<{
    name: string;
    issuer?: string;
    date?: string;
    expiryDate?: string;
    url?: string;
  }>;
};
