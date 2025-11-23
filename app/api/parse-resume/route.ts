import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { isEmail } from 'validator';
import * as pdfParse from 'pdf-parse';

// Resume Metadata Standard (RMS) compatible structure
interface RMSResumeData {
  metadata: {
    version: string;
    created: string;
    source: 'pdf' | 'docx' | 'manual';
  };
  personal: {
    name: { first: string; last: string; full: string };
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
    skills: {
      technical: string[];
      tools: string[];
      soft: string[];
      certifications: string[];
    };
    education: Array<{
      institution: string;
      degree: string;
      field: string;
      location: string;
      date: string;
    }>;
  };
}

// PDF handling using pdf-parse (better than unpdf for text extraction)
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await (pdfParse as any).default(buffer);
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text found in PDF. The PDF may be image-based or empty.');
    }

    // Clean up the extracted text
    let cleanedText = data.text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
      .trim();

    // Normalize whitespace but preserve line breaks
    cleanedText = cleanedText
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .join('\n');

    return cleanedText;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF. Please ensure it is a valid text-based PDF.');
  }
}

// HuggingFace AI Enhancement (Currently disabled - model deprecated)
// const HF_MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1"; // 410 Gone

interface AIParseResult {
  contact?: any;
  experience?: any[];
  education?: any[];
  skills?: any;
  summary?: string;
}

async function parseWithAI(text: string): Promise<AIParseResult | null> {
  // Temporarily disabled - HuggingFace model is deprecated (410 Gone)
  // TODO: Switch to OpenAI, Anthropic, or local model
  console.log('[AI Parse] Skipped - using pattern-based parsing only');
  return null;
  
  /* FUTURE: Integrate with OpenAI or Anthropic
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return null;
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: `Extract resume data as JSON: ${text.substring(0, 4000)}`
      }],
      temperature: 0.1
    })
  });
  */
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


async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

// Multi-layer contact parsing (Pattern + AI like Rezi)
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
  
  // Strategy 1: Look for ALL CAPS name at the top (common in resumes)
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    
    // Skip if it's contact info
    if (line.includes('@') || line.match(/\d{3}[-.\s]?\d{3}/)) continue;
    
    // Check for ALL CAPS name (like "SHARIF AHMED")
    const allCapsMatch = line.match(/^([A-Z]+)\s+([A-Z]+)$/);
    if (allCapsMatch) {
      contact.firstName = allCapsMatch[1].charAt(0) + allCapsMatch[1].slice(1).toLowerCase();
      contact.lastName = allCapsMatch[2].charAt(0) + allCapsMatch[2].slice(1).toLowerCase();
      break;
    }
    
    // Check for Title Case name (like "Sharif Ahmed")
    const titleCaseMatch = line.match(/^([A-Z][a-z]+)\s+([A-Z][a-z]+)$/);
    if (titleCaseMatch && line.length < 30) {
      contact.firstName = titleCaseMatch[1];
      contact.lastName = titleCaseMatch[2];
      break;
    }
    
    // Check for name with middle initial (like "Sharif A. Ahmed")
    const middleInitialMatch = line.match(/^([A-Z][a-z]+)\s+[A-Z]\.\s+([A-Z][a-z]+)$/);
    if (middleInitialMatch) {
      contact.firstName = middleInitialMatch[1];
      contact.lastName = middleInitialMatch[2];
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

    // Extract text based on file type
    let text: string;
    if (file.type === 'application/pdf') {
      text = await extractTextFromPDF(buffer);
      console.log('[Parse] PDF text extracted, length:', text.length);
      console.log('[Parse] First 200 chars:', text.substring(0, 200));
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      text = await extractTextFromDOCX(buffer);
      console.log('[Parse] DOCX text extracted, length:', text.length);
      console.log('[Parse] First 200 chars:', text.substring(0, 200));
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Parse the extracted text with multi-layer approach
    const patternExtractor = new PatternExtractor();
    
    // 1. Try AI Parsing first (Rezi approach)
    let aiData: AIParseResult | null = null;
    try {
      aiData = await parseWithAI(text);
      console.log('[Parse] AI parsing result:', aiData ? 'Success' : 'Failed');
    } catch (e) {
      console.log('[Parse] AI parsing skipped or failed, falling back to patterns');
    }

    // 2. Run Pattern Extraction as fallback/supplement
    const patternContact = await parseContact(text, patternExtractor);
    const patternSummary = parseSummary(text); // Use the new function
    const patternExperience = parseExperience(text);
    const patternEducation = parseEducation(text);
    const patternSkills = patternExtractor.extractSkills(text);

    console.log('[Parse] Pattern extraction complete');
    console.log('[Parse] - Contact:', patternContact.firstName, patternContact.lastName);
    console.log('[Parse] - Experience entries:', patternExperience.length);
    console.log('[Parse] - Education entries:', patternEducation.length);
    console.log('[Parse] - Skills:', patternSkills.technical.length, 'technical');

    // 3. Merge Results (AI takes precedence if available and valid)
    const contact = {
      firstName: aiData?.contact?.firstName || patternContact.firstName,
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
      ? aiData.experience 
      : patternExperience;

    const education = (aiData?.education && aiData.education.length > 0)
      ? aiData.education
      : patternEducation;

    const skills = {
      technical: (aiData?.skills?.technical?.length ? aiData.skills.technical : patternSkills.technical),
      tools: (aiData?.skills?.tools?.length ? aiData.skills.tools : patternSkills.tools),
      soft: (aiData?.skills?.soft?.length ? aiData.skills.soft : patternSkills.soft)
    };

    console.log('[Parse] Final merged results:');
    console.log('[Parse] - Name:', contact.firstName, contact.lastName);
    console.log('[Parse] - Experience:', experience.length, 'entries');
    console.log('[Parse] - Education:', education.length, 'entries');


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
        skills: {
          technical: skills.technical,
          tools: skills.tools,
          soft: skills.soft,
          certifications: []
        },
        education: education.map(edu => ({
          institution: edu.institution,
          degree: edu.degree,
          field: edu.fieldOfStudy,
          location: edu.location || '',
          date: edu.endDate
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
      skills: {
        technical: skills.technical,
        soft: skills.soft,
        tools: skills.tools,
        frameworks: [],
        databases: [],
        other: []
      },
      projects: [],
      certifications: [],
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
