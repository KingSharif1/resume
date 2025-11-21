import { parseDocumentToText } from './pdf-parser';
import { parseResumeText } from './resume-parser';

export interface ParsedSection {
  id: string;
  type: string;
  title: string;
  content: string;
  structuredData?: any;
}

export interface ParsedResume {
  title: string;
  sections: ParsedSection[];
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };
  summary?: string;
}

export interface ParsingOptions {
  useAI?: boolean;
}

export async function parseResumeFile(file: File, options: ParsingOptions = {}): Promise<ParsedResume> {
  try {
    const { useAI = false } = options;
    
    // Step 1: Extract text from the file (PDF or DOCX)
    const parsedDoc = await parseDocumentToText(file, useAI);
    const text = parsedDoc.text;
    
    // If we have sections from either AI or enhanced PDF parsing, use those directly
    if ((useAI || parsedDoc.sections) && parsedDoc.sections && parsedDoc.sections.length > 0) {
      console.log('Using detected sections:', parsedDoc.sections.length);
      
      // Convert sections to our format
      const sections = parsedDoc.sections.map((section, index) => {
        // For PDF parser sections that might not have content
        const sectionContent = section.content || 
          // Try to extract content for this section from the full text
          extractSectionContent(text, section.title, parsedDoc.sections || []);
        
        return {
          id: Date.now().toString() + index,
          type: section.type,
          title: section.title,
          content: sectionContent,
          structuredData: extractStructuredData(section.type, sectionContent)
        };
      });
      
      // Extract contact info from the contact section if available
      const contactSection = sections.find(s => s.type === 'contact');
      const contactInfo = contactSection ? extractContactInfo(contactSection.content) : {};
      
      return {
        title: extractName(contactInfo) ? `${extractName(contactInfo)}'s Resume` : 'My Resume',
        sections: organizeSections(sections),
        contactInfo,
        summary: sections.find(s => s.type === 'summary')?.content || ''
      };
    }
    
    // Step 2: Parse the text into sections using traditional method
    const parsedText = parseResumeText(text);
    
    // Use detected sections from metadata if available
    if (parsedDoc.metadata?.detectedSections?.length) {
      console.log('Detected sections:', parsedDoc.metadata.detectedSections);
    }
    
    // Step 3: Convert parsed sections to our structured format
    const rawSections = parsedText.sections.map((section, index) => {
      const sectionType = getSectionType(section.title);
      const structuredData = extractStructuredData(sectionType, section.content);
      
      return {
        id: Date.now().toString() + index,
        type: sectionType,
        title: section.title,
        content: section.content,
        structuredData
      };
    });
    
    // Step 4: Extract contact information
    const contactSection = rawSections.find(s => s.type === 'contact');
    const contactInfo = contactSection ? extractContactInfo(contactSection.content) : {};
    
    // Step 5: Organize sections in a logical order
    const sections = organizeSections(rawSections);
    
    // Step 6: Create the final parsed resume object
    return {
      title: extractName(contactInfo) ? `${extractName(contactInfo)}'s Resume` : 'My Resume',
      sections,
      contactInfo,
      summary: parsedText.summary
    };
  } catch (error) {
    console.error('Error parsing resume file:', error);
    throw error;
  }
}

/**
 * Organizes sections in a logical order for a resume
 */
function organizeSections(sections: ParsedSection[]): ParsedSection[] {
  // Define the ideal order of section types
  const sectionOrder = [
    'contact',
    'summary',
    'experience',
    'education',
    'skills',
    'projects',
    'certifications',
    'achievements',
    'volunteer',
    'languages',
    'interests',
    'references'
  ];
  
  // Create a map for quick lookup
  const sectionMap: Record<string, ParsedSection[]> = {};
  const otherSections: ParsedSection[] = [];
  
  // Group sections by type
  sections.forEach(section => {
    if (sectionOrder.includes(section.type)) {
      if (!sectionMap[section.type]) {
        sectionMap[section.type] = [];
      }
      sectionMap[section.type].push(section);
    } else {
      otherSections.push(section);
    }
  });
  
  // Merge similar sections
  Object.keys(sectionMap).forEach(type => {
    if (sectionMap[type].length > 1) {
      // If there are multiple sections of the same type, merge their content
      const mergedContent = sectionMap[type]
        .map(s => s.content)
        .join('\n\n');
      
      const mergedStructuredData = sectionMap[type]
        .map(s => s.structuredData)
        .filter(Boolean)
        .reduce((acc, data) => {
          if (Array.isArray(data)) {
            return [...(Array.isArray(acc) ? acc : []), ...data];
          } else if (typeof data === 'object') {
            return { ...(typeof acc === 'object' ? acc : {}), ...data };
          }
          return data;
        }, {});
      
      sectionMap[type] = [{
        ...sectionMap[type][0],
        content: mergedContent,
        structuredData: mergedStructuredData
      }];
    }
  });
  
  // Organize sections according to the ideal order
  const organizedSections: ParsedSection[] = [];
  
  sectionOrder.forEach(type => {
    if (sectionMap[type] && sectionMap[type].length > 0) {
      organizedSections.push(...sectionMap[type]);
    }
  });
  
  // Add any remaining sections
  organizedSections.push(...otherSections);
  
  return organizedSections;
}

function getSectionType(title: string): string {
  const normalized = title.toLowerCase().trim();
  
  if (/contact|personal|details/.test(normalized)) return 'contact';
  if (/summary|profile|about|objective/.test(normalized)) return 'summary';
  if (/experience|employment|work history|career/.test(normalized)) return 'experience';
  if (/education|academic|degree|university|college/.test(normalized)) return 'education';
  if (/skills|technical|competencies|expertise/.test(normalized)) return 'skills';
  if (/certifications|certificates|licenses/.test(normalized)) return 'certifications';
  if (/projects|portfolio/.test(normalized)) return 'projects';
  if (/awards|honors|achievements/.test(normalized)) return 'awards';
  if (/publications|papers|research/.test(normalized)) return 'publications';
  if (/volunteer|community service/.test(normalized)) return 'volunteer';
  if (/languages|language skills/.test(normalized)) return 'languages';
  if (/interests|hobbies/.test(normalized)) return 'interests';
  if (/references/.test(normalized)) return 'references';
  
  return 'custom';
}

function extractStructuredData(type: string, content: string): any {
  switch (type) {
    case 'contact':
      return extractContactInfo(content);
    case 'experience':
      return extractExperienceData(content);
    case 'education':
      return extractEducationItems(content);
    case 'skills':
      return extractSkillsData(content);
    case 'projects':
      return extractProjectItems(content);
    case 'certifications':
      return extractCertificationItems(content);
    default:
      return null;
  }
}

/**
 * Extract experience data from content
 */
function extractExperienceData(content: string): any[] {
  const items: any[] = [];
  const sections = content.split(/(?:\r?\n){2,}/);
  
  for (const section of sections) {
    if (!section.trim()) continue;
    
    const lines = section.split('\n');
    if (lines.length < 2) continue;
    
    // Try to extract company and position
    const firstLine = lines[0].trim();
    const secondLine = lines[1].trim();
    
    let company = '';
    let position = '';
    let location = '';
    
    // Check if first line contains position
    if (/engineer|developer|manager|director|analyst|specialist|consultant/i.test(firstLine)) {
      position = firstLine;
      company = secondLine;
    } else {
      company = firstLine;
      position = secondLine;
    }
    
    // Try to extract dates
    const datePattern = /(\w+\s+\d{4})\s*[-–—]\s*(\w+\s+\d{4}|Present|Current)/i;
    const dateMatch = section.match(datePattern);
    
    const startDate = dateMatch?.[1] || '';
    const endDate = dateMatch?.[2] || '';
    
    // Extract description (everything else)
    let description = '';
    let highlights: string[] = [];
    
    if (lines.length > 2) {
      const contentLines = lines.slice(2);
      
      // Look for bullet points
      for (const line of contentLines) {
        if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*') || /^\d+\./.test(line.trim())) {
          highlights.push(line.trim().replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, ''));
        } else if (line.trim()) {
          description += (description ? ' ' : '') + line.trim();
        }
      }
    }
    
    items.push({ 
      id: `experience-${Date.now()}-${items.length}`,
      company, 
      position, 
      location, 
      startDate, 
      endDate, 
      description,
      highlights
    });
  }
  
  return items;
}

function extractContactInfo(content: string): any {
  const email = content.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || '';
  const phone = content.match(/(\+\d{1,3}[-\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)?.[0] || '';
  const linkedin = content.match(/linkedin\.com\/in\/[\w-]+/i)?.[0] || '';
  const github = content.match(/github\.com\/[\w-]+/i)?.[0] || '';
  
  // Try to extract name from the first line or two
  const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
  const name = lines.length > 0 ? lines[0] : '';
  
  // Try to extract location
  const locationPatterns = [
    /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2})/,
    /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/
  ];
  
  let location = '';
  for (const pattern of locationPatterns) {
    const match = content.match(pattern);
    if (match) {
      location = match[0];
      break;
    }
  }
  
  return { name, email, phone, location, linkedin, github };
}

function extractName(contactInfo: any): string {
  return contactInfo?.name || '';
}

function extractSectionContent(fullText: string, sectionTitle: string, allSections: Array<{title: string, type: string, content?: string}>): string {
  // Find the index of this section title in the text
  const titleIndex = fullText.indexOf(sectionTitle);
  if (titleIndex === -1) return '';
  
  // Start content after the title
  const contentStart = titleIndex + sectionTitle.length;
  
  // Find the next section title to determine where this section ends
  const otherSectionTitles = allSections
    .map(s => s.title)
    .filter(title => title !== sectionTitle);
  
  let contentEnd = fullText.length;
  
  // Find the closest next section title
  for (const nextTitle of otherSectionTitles) {
    const nextTitleIndex = fullText.indexOf(nextTitle, contentStart);
    if (nextTitleIndex !== -1 && nextTitleIndex < contentEnd) {
      contentEnd = nextTitleIndex;
    }
  }
  
  // Extract the content between this title and the next one (or end of text)
  return fullText.substring(contentStart, contentEnd).trim();
}

function extractEducationItems(content: string): any[] {
  const items: any[] = [];
  const sections = content.split(/(?:\r?\n){2,}/);
  
  for (const section of sections) {
    if (!section.trim()) continue;
    
    const lines = section.split('\n');
    if (lines.length < 1) continue;
    
    const institution = lines[0].trim();
    let degree = '';
    let field = '';
    let gpa = '';
    
    // Try to extract degree and field
    if (lines.length > 1) {
      const degreeMatch = lines[1].match(/([^,]+),\s*([^,]+)/);
      if (degreeMatch) {
        degree = degreeMatch[1].trim();
        field = degreeMatch[2].trim();
      } else {
        degree = lines[1].trim();
      }
    }
    
    // Try to extract dates
    const datePattern = /(\w+\s+\d{4})\s*[-–—]\s*(\w+\s+\d{4}|Present|Current)/i;
    const dateMatch = section.match(datePattern);
    
    const startDate = dateMatch?.[1] || '';
    const endDate = dateMatch?.[2] || '';
    
    // Try to extract GPA
    const gpaMatch = section.match(/GPA\s*:?\s*([\d.]+)/i);
    if (gpaMatch) {
      gpa = gpaMatch[1];
    }
    
    items.push({ institution, degree, field, startDate, endDate, gpa });
  }
  
  return items;
}

function extractSkillsData(content: string): any {
  // Try to detect if skills are organized by categories
  const categories: Record<string, string[]> = {};
  let currentCategory = 'Technical Skills';
  
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Check if this line is a category header
    if (trimmedLine.endsWith(':') || /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(trimmedLine)) {
      currentCategory = trimmedLine.replace(':', '').trim();
      if (!categories[currentCategory]) {
        categories[currentCategory] = [];
      }
    } else {
      // This is a skill item
      if (!categories[currentCategory]) {
        categories[currentCategory] = [];
      }
      
      // Split by commas or bullets
      const skillItems = trimmedLine
        .split(/[,•●○■▪▫–—-]/)
        .map(s => s.trim())
        .filter(Boolean);
      
      categories[currentCategory].push(...skillItems);
    }
  }
  
  // If no categories were detected, put everything under "Technical Skills"
  if (Object.keys(categories).length === 0) {
    const skillItems = content
      .split(/[,\n•●○■▪▫–—-]/)
      .map(s => s.trim())
      .filter(Boolean);
    
    categories['Technical Skills'] = skillItems;
  }
  
  return categories;
}

function extractProjectItems(content: string): any[] {
  const items: any[] = [];
  const sections = content.split(/(?:\r?\n){2,}/);
  
  for (const section of sections) {
    if (!section.trim()) continue;
    
    const lines = section.split('\n');
    if (lines.length < 1) continue;
    
    const name = lines[0].trim();
    let description = '';
    let link = '';
    
    // Extract link if present
    const linkMatch = section.match(/https?:\/\/[^\s]+/);
    if (linkMatch) {
      link = linkMatch[0];
    }
    
    // Extract description
    if (lines.length > 1) {
      description = lines.slice(1).join('\n').trim();
    }
    
    // Try to extract technologies
    const techPatterns = [
      /Technologies?:?\s*([^.]+)/i,
      /Built with:?\s*([^.]+)/i,
      /Stack:?\s*([^.]+)/i
    ];
    
    let technologies: string[] = [];
    for (const pattern of techPatterns) {
      const match = section.match(pattern);
      if (match) {
        technologies = match[1]
          .split(/[,\s]/)
          .map(t => t.trim())
          .filter(Boolean);
        break;
      }
    }
    
    // If no technologies found, try to extract based on common programming terms
    if (technologies.length === 0) {
      const techTerms = ['react', 'angular', 'vue', 'javascript', 'typescript', 'python', 'java', 'c#', 'node', 'express', 'django', 'flask', 'sql', 'mongodb', 'aws', 'azure', 'docker', 'kubernetes'];
      
      const foundTechs = techTerms.filter(term => 
        new RegExp(`\\b${term}\\b`, 'i').test(section)
      );
      
      technologies = foundTechs;
    }
    
    items.push({ name, description, technologies, link });
  }
  
  return items;
}

function extractCertificationItems(content: string): any[] {
  const items: any[] = [];
  const sections = content.split(/(?:\r?\n){2,}/);
  
  for (const section of sections) {
    if (!section.trim()) continue;
    
    const lines = section.split('\n');
    if (lines.length < 1) continue;
    
    const name = lines[0].trim();
    let issuer = '';
    let date = '';
    let expiryDate = '';
    let credentialId = '';
    
    // Try to extract issuer
    if (lines.length > 1) {
      issuer = lines[1].trim();
    }
    
    // Try to extract date
    const dateMatch = section.match(/(\w+\s+\d{4})/);
    if (dateMatch) {
      date = dateMatch[0];
    }
    
    // Try to extract credential ID
    const credentialMatch = section.match(/credential\s*id:?\s*([a-z0-9-]+)/i);
    if (credentialMatch) {
      credentialId = credentialMatch[1];
    }
    
    items.push({ name, issuer, date, expiryDate, credentialId });
  }
  
  return items;
}
