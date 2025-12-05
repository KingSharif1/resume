import { NextRequest, NextResponse } from 'next/server';
import { isEmail } from 'validator';
import { extractPDFWithLayout } from '@/lib/pdf-layout-extractor';
import { parseDOCXStructure } from '@/lib/docx-structure-parser';
import { resumeParseSchema, type ResumeParseResult } from '@/lib/resume-parse-schema';
import { generateId } from '@/lib/resume-schema';
import OpenAI from 'openai';

// Resume Metadata Standard (RMS) compatible structure
interface RMSResumeData {
  metadata: {
    version: string;
    created: string;
    source: 'pdf' | 'docx' | 'manual';
  };
  personal: {
    name: { first: string; middle?: string; last: string; full: string };
    contact: {
      email: string[];
      phone: string[];
      location: string;
      urls: { linkedin?: string; github?: string; website?: string };
    };
  };
  professional: {
    summary: string;
    experience: Array<{
      company: string;
      position: string;
      location: string;
      dates: { start: string; end: string; current: boolean };
      description: string;
      achievements: string[];
    }>;
    skills: Record<string, string[]>; // Dynamic skill categories
    education: Array<{
      institution: string;
      degree: string;
      field: string;
      location: string;
      startDate: string;
      endDate: string;
      gpa?: string;
    }>;
  };
}

// PDF and DOCX extraction now handled by dedicated utilities
// See lib/pdf-layout-extractor.ts and lib/docx-structure-parser.ts

// Date normalization function to convert various date formats to YYYY-MM
function normalizeDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  
  // If already in YYYY-MM format, return as-is
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Month name mapping
  const months: Record<string, string> = {
    'january': '01', 'jan': '01',
    'february': '02', 'feb': '02',
    'march': '03', 'mar': '03',
    'april': '04', 'apr': '04',
    'may': '05',
    'june': '06', 'jun': '06',
    'july': '07', 'jul': '07',
    'august': '08', 'aug': '08',
    'september': '09', 'sep': '09', 'sept': '09',
    'october': '10', 'oct': '10',
    'november': '11', 'nov': '11',
    'december': '12', 'dec': '12'
  };
  
  // Handle "Month YYYY" or "Month, YYYY" format (e.g., "November 2023", "Aug 2022")
  const monthYearMatch = dateStr.match(/([a-z]+)[,\s]+(\d{4})/i);
  if (monthYearMatch) {
    const monthName = monthYearMatch[1].toLowerCase();
    const year = monthYearMatch[2];
    const monthNum = months[monthName];
    if (monthNum) {
      return `${year}-${monthNum}`;
    }
  }
  
  // Handle "YYYY-MM-DD" format - extract just YYYY-MM
  const fullDateMatch = dateStr.match(/^(\d{4})-(\d{2})-\d{2}$/);
  if (fullDateMatch) {
    return `${fullDateMatch[1]}-${fullDateMatch[2]}`;
  }
  
  // If we can't parse it, return empty string
  console.warn(`[Date Normalize] Could not parse date: "${dateStr}"`);
  return '';
}

// GPT-4o with Structured Outputs for Resume Parsing
async function parseWithAI(text: string): Promise<ResumeParseResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('[AI Parse] Skipped - OPENAI_API_KEY not found');
    console.log('[AI Parse] Add OPENAI_API_KEY to your .env file to enable AI parsing');
    return null;
  }

  console.log('[AI Parse] Using GPT-4o with Structured Outputs for resume parsing...');

  try {
    const openai = new OpenAI({ apiKey });
    
    // Truncate text to avoid token limits
    const truncatedText = text.substring(0, 30000);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: `You are an expert resume parser. Extract ALL information from resumes with 100% accuracy.

CRITICAL INSTRUCTIONS:
1. FULL NAMES: Extract complete names including middle names and initials (e.g., "NURAJENAN H. AHMED" → firstName: "Nurajenan", middleName: "H.", lastName: "Ahmed")
2. EDUCATION DATES: Extract BOTH start and end dates (e.g., "Aug 2022 - May 2026" → startDate: "Aug 2022", endDate: "May 2026")
3. GPA: Extract GPA values (e.g., "GPA 3.8/4" → gpa: "3.8/4")
4. DYNAMIC SKILLS: Preserve the EXACT skill category names from the resume. Do NOT force into predefined categories.
   - If resume has "Skills" section, use "Skills" as the category name
   - If resume has "Technical Skills", "Languages", etc., preserve those exact names
5. CERTIFICATIONS: Extract full certification details including issuer and date

Be thorough and preserve all information exactly as it appears.`
        },
        {
          role: "user",
          content: `Extract ALL information from this resume:

${truncatedText}`
        }
      ],
      temperature: 0.1,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "resume_parse",
          strict: false, // Disabled strict mode to allow optional fields
          schema: resumeParseSchema
        }
      }
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      console.error('[AI Parse] No response from OpenAI');
      return null;
    }

    const parsedData = JSON.parse(responseText) as ResumeParseResult;
    console.log('[AI Parse] ✅ Successfully parsed with GPT-4o Structured Outputs');
    console.log('[AI Parse] Extracted:', {
      name: `${parsedData.contact?.firstName} ${parsedData.contact?.middleName || ''} ${parsedData.contact?.lastName}`.trim(),
      experience: parsedData.experience?.length || 0,
      projects: parsedData.projects?.length || 0,
      education: parsedData.education?.length || 0,
      skillCategories: Object.keys(parsedData.skills || {}).length,
      certifications: parsedData.certifications?.length || 0
    });
    return parsedData;

  } catch (error) {
    console.error('[AI Parse] Error during AI parsing:', error);
    return null;
  }
}


// Pattern-based extraction class (server-side)
class PatternExtractor {
  extractEmails(text: string): string[] {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const matches = text.match(emailRegex) || [];
    return matches.filter(email => isEmail(email));
  }

  extractPhones(text: string): string[] {
    const phonePatterns = [
      /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
      /(\+\d{1,3}[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/g,
      /(\d{3})[-.\s]?(\d{3})[-.\s]?(\d{4})/g
    ];
    
    const phones: string[] = [];
    phonePatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      phones.push(...matches);
    });
    
    return Array.from(new Set(phones));
  }

  extractSkills(text: string): { technical: string[], tools: string[], soft: string[] } {
    const technicalSkills = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
      'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
      'HTML', 'CSS', 'SASS', 'SCSS', 'Bootstrap', 'Tailwind', 'jQuery',
      'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab'
    ];

    const tools = [
      'Git', 'Docker', 'Kubernetes', 'Jenkins', 'Jira', 'Confluence', 'Slack', 'Trello',
      'Figma', 'Adobe', 'Photoshop', 'Illustrator', 'Sketch', 'InVision',
      'VS Code', 'IntelliJ', 'Eclipse', 'Sublime', 'Atom'
    ];

    const softSkills = [
      'Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Critical Thinking',
      'Project Management', 'Time Management', 'Adaptability', 'Creativity', 'Innovation'
    ];

    const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const createSkillRegex = (skill: string) => {
      const escaped = escapeRegExp(skill);
      const startBoundary = /^\w/.test(skill) ? '\\b' : '';
      const endBoundary = /\w$/.test(skill) ? '\\b' : '';
      return new RegExp(`${startBoundary}${escaped}${endBoundary}`, 'i');
    };

    const foundTechnical = technicalSkills.filter(skill => 
      createSkillRegex(skill).test(text)
    );
    const foundTools = tools.filter(tool => 
      createSkillRegex(tool).test(text)
    );
    const foundSoft = softSkills.filter(skill => 
      createSkillRegex(skill).test(text)
    );

    return {
      technical: foundTechnical,
      tools: foundTools,
      soft: foundSoft
    };
  }
}


// Pattern-based extraction class (server-side)
async function parseContact(text: string, patternExtractor: PatternExtractor) {
  const contact = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: ''
  };

  // Extract emails
  const emails = patternExtractor.extractEmails(text);
  if (emails.length > 0) {
    contact.email = emails[0];
  }

  // Extract phones
  const phones = patternExtractor.extractPhones(text);
  if (phones.length > 0) {
    contact.phone = phones[0];
  }

  // Extract URLs
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) {
    contact.linkedin = linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`;
  }

  const githubMatch = text.match(/github\.com\/[\w-]+/i);
  if (githubMatch) {
    contact.github = githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`;
  }

  // Extract website (look for personal domains)
  const websiteMatches = text.match(/https?:\/\/[\w.-]+\.[\w]{2,}/gi);
  if (websiteMatches) {
    for (const url of websiteMatches) {
      if (!url.includes('linkedin') && !url.includes('github')) {
        contact.website = url;
        break;
      }
    }
  }

  // Extract location (City, State format)
  const locationPatterns = [
    /(?:Fort Worth|Dallas|Houston|Austin|San Antonio|New York|Los Angeles|Chicago|Seattle|Boston|Atlanta|Miami|Denver|Portland|Phoenix|Philadelphia|San Diego|San Francisco|San Jose),?\s*(?:TX|CA|NY|FL|IL|WA|MA|GA|CO|OR|AZ|PA|Texas|California|New York|Florida|Illinois|Washington|Massachusetts|Georgia|Colorado|Oregon|Arizona|Pennsylvania)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z]{2})\b/
  ];

  for (const pattern of locationPatterns) {
    const locMatch = text.match(pattern);
    if (locMatch) {
      contact.location = locMatch[0];
      break;
    }
  }

  // Extract name - try multiple strategies
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  console.log('[Parse Contact] First 5 lines for name extraction:');
  lines.slice(0, 5).forEach((line, i) => console.log(`  Line ${i}: "${line}"`));
  
  // Strategy 1: Look for ALL CAPS name at the top (common in resumes)
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i];
    
    // Skip if it's contact info
    if (line.includes('@') || line.match(/\d{3}[-.\ s]?\d{3}/)) {
      console.log(`[Parse Contact] Skipping line ${i} (contact info)`);
      continue;
    }
    
    // Skip common section headers
    const sectionHeaders = /^(CONTACT|EDUCATION|EXPERIENCE|SKILLS|PROJECTS|CERTIFICATIONS?|SUMMARY|OBJECTIVE|PROFILE|WORK|EMPLOYMENT|STUDENT|PROFESSIONAL)$/i;
    if (sectionHeaders.test(line.trim())) {
      console.log(`[Parse Contact] Skipping line ${i} (section header)`);
      continue;
    }
    
    // Check for ALL CAPS name with middle initial: "NURAJENAN H. AHMED"
    const allCapsWithMiddle = line.match(/^([A-Z]{2,})\s+([A-Z]\.)\s+([A-Z]{2,})/);
    if (allCapsWithMiddle) {
      contact.firstName = allCapsWithMiddle[1].charAt(0) + allCapsWithMiddle[1].slice(1).toLowerCase();
      contact.lastName = allCapsWithMiddle[3].charAt(0) + allCapsWithMiddle[3].slice(1).toLowerCase();
      console.log('[Parse Contact] Found name (ALL CAPS with middle initial):', contact.firstName, contact.lastName);
      break;
    }
    
    // Check for ALL CAPS name pattern: "SHARIF AHMED"
    const allCapsMatch = line.match(/^([A-Z]{2,})\s+([A-Z]{2,})/);
    if (allCapsMatch) {
      // Make sure the second match is not a common title/role word
      const commonTitles = /^(ENGINEER|DEVELOPER|MANAGER|DIRECTOR|DESIGNER|ANALYST|CONSULTANT|SPECIALIST|ARCHITECT|LEAD|SENIOR|JUNIOR|SOFTWARE|FULL|STACK|FRONT|BACK|WEB|MOBILE|BASIC|LIFE|SUPPORT|AMERICAN|HEART|ASSOCIATION)$/i;
      if (!commonTitles.test(allCapsMatch[2])) {
        contact.firstName = allCapsMatch[1].charAt(0) + allCapsMatch[1].slice(1).toLowerCase();
        contact.lastName = allCapsMatch[2].charAt(0) + allCapsMatch[2].slice(1).toLowerCase();
        console.log('[Parse Contact] Found name (ALL CAPS):', contact.firstName, contact.lastName);
        break;
      } else {
        console.log(`[Parse Contact] Skipped "${allCapsMatch[2]}" - looks like a title`);
      }
    }
    
    // Check for Title Case name (like "Sharif Ahmed")
    const titleCaseMatch = line.match(/^([A-Z][a-z]+)\s+([A-Z][a-z]+)/);
    if (titleCaseMatch && line.length < 50) {
      contact.firstName = titleCaseMatch[1];
      contact.lastName = titleCaseMatch[2];
      console.log('[Parse Contact] Found name (Title Case):', contact.firstName, contact.lastName);
      break;
    }
    
    // Check for name with middle initial (like "Sharif A. Ahmed")
    const middleInitialMatch = line.match(/^([A-Z][a-z]+)\s+[A-Z]\.\s+([A-Z][a-z]+)/);
    if (middleInitialMatch) {
      contact.firstName = middleInitialMatch[1];
      contact.lastName = middleInitialMatch[2];
      console.log('[Parse Contact] Found name (With Middle Initial):', contact.firstName, contact.lastName);
      break;
    }
  }

  // If still no name, try extracting from email
  if (!contact.firstName && contact.email) {
    const emailName = contact.email.split('@')[0];
    const nameParts = emailName.split(/[._-]/);
    if (nameParts.length >= 2) {
      contact.firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
      contact.lastName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1);
      console.log('[Parse Contact] Extracted name from email:', contact.firstName, contact.lastName);
    }
  }

  return contact;
}

function parseSummary(text: string): string {
  // Try multiple summary section headers
  const summaryPatterns = [
    /(?:PROFESSIONAL\s+SUMMARY|SUMMARY|PROFILE|ABOUT\s+ME|OBJECTIVE|CAREER\s+SUMMARY|EXECUTIVE\s+SUMMARY)\s*:?\s*\n([\s\S]*?)(?=\n(?:EXPERIENCE|WORK\s+EXPERIENCE|EMPLOYMENT|EDUCATION|SKILLS|TECHNICAL\s+SKILLS|PROJECTS|CERTIFICATIONS)|$)/i,
    /(?:SUMMARY|PROFILE)\s*\n([\s\S]{50,500}?)(?=\n[A-Z]{3,})/i
  ];
  
  for (const pattern of summaryPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const summary = match[1].trim();
      // Filter out if it looks like contact info or section headers
      if (summary.length > 30 && !summary.match(/^\d{3}[-.\s]?\d{3}/)) {
        return summary;
      }
    }
  }
  
  return '';
}

function parseExperience(text: string): any[] {
  const experiences: any[] = [];
  
  // Extract experience section with multiple possible headers
  const experienceMatch = text.match(/(?:PROFESSIONAL\s+EXPERIENCE|WORK\s+EXPERIENCE|EXPERIENCE|EMPLOYMENT\s+HISTORY|CAREER\s+HISTORY)\s*:?\s*\n([\s\S]*?)(?=\n(?:EDUCATION|SKILLS|TECHNICAL\s+SKILLS|PROJECTS|CERTIFICATIONS|AWARDS|VOLUNTEER|$))/i);
  
  if (!experienceMatch || !experienceMatch[1]) {
    return experiences;
  }

  const content = experienceMatch[1];
  
  // Enhanced date pattern to catch more formats
  const datePattern = /(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[,.]?\s+\d{4}|\d{1,2}\/\d{4}|\d{4})\s*[-–—]\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[,.]?\s+\d{4}|\d{1,2}\/\d{4}|\d{4}|Present|Current|Now)/gi;
  
  // Find all date ranges
  const dates: Array<{match: string, index: number}> = [];
  let match;
  while ((match = datePattern.exec(content)) !== null) {
    dates.push({ match: match[0], index: match.index });
  }

  if (dates.length === 0) {
    return experiences;
  }

  // Split content by date positions
  for (let i = 0; i < dates.length; i++) {
    const startIdx = i === 0 ? 0 : dates[i - 1].index + dates[i - 1].match.length;
    const endIdx = i < dates.length - 1 ? dates[i + 1].index : content.length;
    const block = content.substring(startIdx, endIdx);
    
    const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) continue;

    let company = '';
    let position = '';
    let location = '';
    const dateStr = dates[i].match;
    let description = '';
    const bullets: string[] = [];

    // Enhanced position keywords
    const positionKeywords = /(?:Senior|Lead|Principal|Staff|Junior|Associate|Chief|Head|VP|Vice\s+President)?\s*(?:Software|Full[\s-]?Stack|Front[\s-]?End|Back[\s-]?End|Web|Mobile|iOS|Android)?\s*(?:Engineer|Developer|Programmer|Architect|Designer|Manager|Director|Analyst|Consultant|Specialist|Coordinator|Administrator|Intern|Trainee|Scientist|Researcher)/i;
    
    // Location pattern
    const locationPattern = /(?:^|\s)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z]{2}|[A-Z][a-z]+)(?:\s|$)/;

    // Process lines to extract company, position, location
    for (let j = 0; j < Math.min(lines.length, 5); j++) {
      const line = lines[j];
      
      // Skip if it's the date line
      if (line.includes(dateStr)) continue;
      
      // Check for location
      const locMatch = line.match(locationPattern);
      if (locMatch && !location) {
        location = `${locMatch[1]}, ${locMatch[2]}`;
        continue;
      }
      
      // Check for position
      if (positionKeywords.test(line) && !position) {
        position = line.replace(/[,|]$/, '').trim();
        continue;
      }
      
      // Otherwise, it's likely the company
      if (!company && line.length < 60 && !line.startsWith('•') && !line.startsWith('-')) {
        company = line.replace(/[,|]$/, '').trim();
      }
    }

    // Extract description and bullets
    const descStartIdx = Math.min(5, lines.length);
    for (let j = descStartIdx; j < lines.length; j++) {
      const line = lines[j];
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        bullets.push(line.replace(/^[•\-*]\s*/, ''));
      } else if (line.length > 20) {
        description += line + ' ';
      }
    }

    // Parse dates
    const dateParts = dateStr.split(/[-–—]/);
    const startDate = dateParts[0]?.trim() || '';
    const endDate = dateParts[1]?.trim() || '';
    const isCurrent = /present|current|now/i.test(endDate);

    experiences.push({
      id: `exp_${i}`,
      company: company || 'Company Name',
      position: position || 'Position Title',
      location: location,
      startDate: startDate,
      endDate: isCurrent ? 'Present' : endDate,
      current: isCurrent,
      description: bullets.length > 0 ? bullets.join('\n• ') : description.trim(),
      achievements: bullets
    });
  }

  return experiences;
}

function parseEducation(text: string): any[] {
  const education: any[] = [];
  
  // Extract education section
  const eduMatch = text.match(/(?:EDUCATION|ACADEMIC\s+BACKGROUND|ACADEMIC\s+QUALIFICATIONS)\s*:?\s*\n([\s\S]*?)(?=\n(?:EXPERIENCE|WORK\s+EXPERIENCE|SKILLS|TECHNICAL\s+SKILLS|PROJECTS|CERTIFICATIONS|$))/i);
  
  if (!eduMatch || !eduMatch[1]) {
    return education;
  }

  const content = eduMatch[1];
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Degree patterns
  const degreePattern = /(?:Bachelor|Master|PhD|Ph\.D\.|Doctorate|Associate|B\.S\.|B\.A\.|M\.S\.|M\.A\.|MBA|B\.Tech|M\.Tech)(?:\s+of\s+(?:Science|Arts|Engineering|Business|Technology))?\s+(?:in\s+)?([A-Za-z\s&]+)/i;
  
  // University/College pattern
  const schoolPattern = /(?:University|College|Institute|School|Academy)\s+(?:of\s+)?([A-Za-z\s&]+)|([A-Za-z\s&]+)\s+(?:University|College|Institute)/i;
  
  // Date pattern for education
  const eduDatePattern = /(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[,.]?\s+)?\d{4}(?:\s*[-–]\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[,.]?\s+)?\d{4})?/i;

  let currentEntry: any = null;

  for (const line of lines) {
    // Check for degree
    const degreeMatch = line.match(degreePattern);
    if (degreeMatch) {
      if (currentEntry) {
        education.push(currentEntry);
      }
      currentEntry = {
        id: `edu_${education.length}`,
        institution: '',
        degree: degreeMatch[0],
        fieldOfStudy: degreeMatch[1]?.trim() || '',
        location: '',
        endDate: ''
      };
      continue;
    }

    // Check for school
    const schoolMatch = line.match(schoolPattern);
    if (schoolMatch && currentEntry) {
      currentEntry.institution = line;
      continue;
    }

    // Check for date
    const dateMatch = line.match(eduDatePattern);
    if (dateMatch && currentEntry) {
      currentEntry.endDate = dateMatch[0];
    }
  }

  if (currentEntry) {
    education.push(currentEntry);
  }

  return education.length > 0 ? education : [{
    id: 'edu_1',
    institution: 'University Name',
    degree: 'Bachelor of Science',
    fieldOfStudy: 'Computer Science',
    location: '',
    endDate: ''
  }];
}

function parseProjects(text: string): any[] {
  const projects: any[] = [];
  
  // Extract projects section
  const projectMatch = text.match(/(?:PROJECTS|TECHNICAL\s+PROJECTS|ACADEMIC\s+PROJECTS|KEY\s+PROJECTS)\s*:?\s*\n([\s\S]*?)(?=\n(?:EXPERIENCE|WORK\s+EXPERIENCE|EDUCATION|SKILLS|TECHNICAL\s+SKILLS|CERTIFICATIONS|AWARDS|VOLUNTEER|$))/i);
  
  if (!projectMatch || !projectMatch[1]) {
    return projects;
  }

  const content = projectMatch[1];
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Strategy: Look for lines that look like project titles (often followed by dates or description)
  // This is harder without bold/formatting info, so we rely on heuristics
  
  let currentProject: any = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Heuristic: Project title often has a date or link, or is short and followed by bullets
    // Check for date in line
    const dateMatch = line.match(/\d{4}|Present|Current/i);
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
    
    if (!isBullet && (dateMatch || line.length < 50)) {
       // Likely a new project
       if (currentProject) {
         projects.push(currentProject);
       }
       
       // Extract date if present
       let startDate = '';
       let endDate = '';
       if (dateMatch) {
         const dates = line.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{1,2}\/\d{4}|\d{4})\s*[-–]\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{1,2}\/\d{4}|\d{4}|Present|Current)/i);
         if (dates) {
            startDate = dates[1];
            endDate = dates[2];
         }
       }

       currentProject = {
         id: `proj_${projects.length}`,
         name: line.replace(/\d{4}.*$/, '').trim(), // Remove date from name
         description: '',
         startDate,
         endDate,
         current: /present|current/i.test(endDate),
         achievements: [],
         url: ''
       };
    } else if (currentProject) {
       if (isBullet) {
         currentProject.achievements.push(line.replace(/^[•\-*]\s*/, ''));
       } else {
         currentProject.description += (currentProject.description ? ' ' : '') + line;
       }
    }
  }
  
  if (currentProject) {
    projects.push(currentProject);
  }
  
  return projects;
}

function parseCertifications(text: string): any[] {
  const certifications: any[] = [];
  
  const certMatch = text.match(/(?:CERTIFICATIONS|LICENSES|CERTIFICATES)\s*:?\s*\n([\s\S]*?)(?=\n(?:EXPERIENCE|WORK\s+EXPERIENCE|EDUCATION|SKILLS|TECHNICAL\s+SKILLS|PROJECTS|AWARDS|VOLUNTEER|$))/i);
  
  if (!certMatch || !certMatch[1]) {
    return certifications;
  }

  const content = certMatch[1];
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  for (const line of lines) {
    // Simple line-based extraction for now
    // Try to split by date or issuer if possible
    const dateMatch = line.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{1,2}\/\d{4}|\d{4})/i);
    
    certifications.push({
      name: line.replace(dateMatch ? dateMatch[0] : '', '').trim(),
      issuer: '', // Hard to extract without NLP
      date: dateMatch ? dateMatch[0] : '',
      url: ''
    });
  }
  
  return certifications;
}
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text based on file type using new extractors
    let text: string;
    let formattedText: string;
    
    if (file.type === 'application/pdf') {
      const extracted = await extractPDFWithLayout(buffer);
      text = extracted.text;
      formattedText = extracted.formattedText;
      console.log('[Parse] PDF extracted with layout, length:', text.length);
      console.log('[Parse] Found', extracted.metadata.headings.length, 'headings');
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const extracted = await parseDOCXStructure(buffer);
      text = extracted.text;
      formattedText = extracted.formattedText;
      console.log('[Parse] DOCX structure parsed, length:', text.length);
      console.log('[Parse] Found', extracted.metadata.headings.length, 'headings');
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Parse the extracted text with multi-layer approach
    const patternExtractor = new PatternExtractor();
    
    // 1. Try AI Parsing first with formatted text (better for structure)
    let aiData: ResumeParseResult | null = null;
    try {
      aiData = await parseWithAI(formattedText); // Use formatted text with heading markers
      console.log('[Parse] AI parsing result:', aiData ? 'Success' : 'Failed');
    } catch (e) {
      console.log('[Parse] AI parsing skipped or failed, falling back to patterns');
    }

    // 2. Run Pattern Extraction as fallback/supplement
    const patternContact = await parseContact(text, patternExtractor);
    const patternSummary = parseSummary(text);
    const patternExperience = parseExperience(text);
    const patternEducation = parseEducation(text);
    const patternSkills = patternExtractor.extractSkills(text);
    const patternProjects = parseProjects(text);
    const patternCertifications = parseCertifications(text);

    console.log('[Parse] Pattern extraction complete');
    console.log('[Parse] - Contact:', patternContact.firstName, patternContact.lastName);
    console.log('[Parse] - Experience entries:', patternExperience.length);
    console.log('[Parse] - Education entries:', patternEducation.length);
    console.log('[Parse] - Skills:', patternSkills.technical.length, 'technical');
    console.log('[Parse] - Projects:', patternProjects.length);
    console.log('[Parse] - Certifications:', patternCertifications.length);

    // 3. Merge Results (AI takes precedence if available and valid)
    const contact = {
      firstName: aiData?.contact?.firstName || patternContact.firstName,
      middleName: aiData?.contact?.middleName, // New field for middle names
      lastName: aiData?.contact?.lastName || patternContact.lastName,
      email: aiData?.contact?.email || patternContact.email,
      phone: aiData?.contact?.phone || patternContact.phone,
      location: aiData?.contact?.location || patternContact.location,
      linkedin: aiData?.contact?.linkedin || patternContact.linkedin,
      github: aiData?.contact?.github || patternContact.github,
      website: aiData?.contact?.website || patternContact.website
    };

    const summary = aiData?.summary || patternSummary;

    const experience = (aiData?.experience && aiData.experience.length > 0) 
      ? aiData.experience.map((exp: any) => ({
          ...exp,
          startDate: normalizeDate(exp.startDate),
          endDate: normalizeDate(exp.endDate),
          id: generateId() // Add unique ID for form binding
        }))
      : patternExperience.map((exp: any) => ({
          ...exp,
          startDate: normalizeDate(exp.startDate),
          endDate: normalizeDate(exp.endDate),
          id: generateId() // Add unique ID for form binding
        }));

    const education = (aiData?.education && aiData.education.length > 0)
      ? aiData.education.map((edu: any) => ({
          ...edu,
          startDate: normalizeDate(edu.startDate),
          endDate: normalizeDate(edu.endDate),
          id: generateId() // Add unique ID for form binding
        }))
      : patternEducation.map((edu: any) => ({
          ...edu,
          startDate: normalizeDate(edu.startDate),
          endDate: normalizeDate(edu.endDate),
          id: generateId() // Add unique ID for form binding
        }));

    // Skills: Use dynamic categories from AI, fallback to pattern-based
    const skills = aiData?.skills && Object.keys(aiData.skills).length > 0
      ? aiData.skills // Dynamic categories from AI
      : {
          // Fallback to pattern-based categories
          technical: patternSkills.technical,
          tools: patternSkills.tools,
          soft: patternSkills.soft
        };

    const projects = (aiData?.projects && aiData.projects.length > 0)
      ? aiData.projects.map((proj: any) => ({
          ...proj,
          id: generateId() // Add unique ID for form binding
        }))
      : patternProjects.map((proj: any) => ({
          ...proj,
          id: generateId() // Add unique ID for form binding
        }));

    const certifications = (aiData?.certifications && aiData.certifications.length > 0)
      ? aiData.certifications.map((cert: any) => ({
          ...cert,
          id: generateId() // Add unique ID for form binding
        }))
      : patternCertifications.map((cert: any) => ({
          ...cert,
          id: generateId() // Add unique ID for form binding
        }));

    console.log('[Parse] Final merged results:');
    console.log('[Parse] - Name:', contact.firstName, contact.lastName);
    console.log('[Parse] - Experience:', experience.length, 'entries');
    console.log('[Parse] - Projects:', projects.length, 'entries');
    console.log('[Parse] - Education:', education.length, 'entries');
    console.log('[Parse] - Certifications:', certifications.length, 'entries');


    // Build RMS-compatible profile structure
    const rmsProfile: RMSResumeData = {
      metadata: {
        version: '1.0',
        created: new Date().toISOString(),
        source: file.type === 'application/pdf' ? 'pdf' : 'docx'
      },
      personal: {
        name: {
          first: contact.firstName,
          last: contact.lastName,
          full: `${contact.firstName} ${contact.lastName}`.trim()
        },
        contact: {
          email: contact.email ? [contact.email] : [],
          phone: contact.phone ? [contact.phone] : [],
          location: contact.location || '',
          urls: {
            linkedin: contact.linkedin,
            github: contact.github,
            website: contact.website
          }
        }
      },
      professional: {
        summary: summary || 'Professional summary extracted from resume. Please review and edit as needed.',
        experience: experience.map(exp => ({
          company: exp.company,
          position: exp.position,
          location: exp.location || '',
          dates: {
            start: exp.startDate,
            end: exp.endDate,
            current: exp.current
          },
          description: exp.description,
          achievements: exp.achievements || []
        })),
        skills: skills, // Use dynamic skills categories
        education: education.map((edu: any) => ({
          institution: edu.institution,
          degree: edu.degree,
          field: edu.fieldOfStudy || '',
          location: edu.location || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          gpa: edu.gpa
        }))
      }
    };

    // Convert RMS to our existing profile format for compatibility
    const profile = {
      contact,
      summary: {
        content: rmsProfile.professional.summary
      },
      experience,
      education,
      skills, // Use dynamic skills categories directly
      projects,
      certifications,
      languages: []
    };

    return NextResponse.json({
      success: true,
      profile, // Existing format for compatibility
      rmsData: rmsProfile, // RMS-compliant format
      confidence: 0.8,
      metadata: {
        extractedText: text.substring(0, 500) + '...', // First 500 chars for debugging
        fileType: file.type,
        fileSize: buffer.length,
        processingTime: Date.now()
      }
    });

  } catch (error) {
    console.error('Resume parsing error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
