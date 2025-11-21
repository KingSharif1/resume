import { parseResumeFile, ParsedResume } from './unified-resume-parser';
import { mapSectionType } from './section-configs';

// Interface for parsed section data
export interface ParsedSection {
  title: string;
  type: string;
  content: any;
}

/**
 * Parse a resume document and convert it to editable sections
 * 
 * @param fileContent The raw file content (PDF or DOCX)
 * @param fileName The name of the file
 * @param useAI Whether to use AI for enhanced parsing
 * @returns Array of parsed sections ready for editing
 */
export async function parseToEditableSections(
  file: File,
  useAI: boolean = false
): Promise<ParsedSection[]> {
  // Parse the resume using the unified parser
  const parseResult = await parseResumeFile(file, { useAI });
  
  // Convert the parsed sections to editable sections
  const editableSections: ParsedSection[] = [];
  
  // Handle contact information
  if (parseResult.contactInfo) {
    editableSections.push({
      title: 'Contact Information',
      type: 'contact',
      content: parseResult.contactInfo
    });
  }
  
  // Handle summary
  if (parseResult.summary) {
    editableSections.push({
      title: 'Summary',
      type: 'summary',
      content: parseResult.summary
    });
  }
  
  // Process all sections from the parsed result
  if (parseResult.sections) {
    for (const section of parseResult.sections) {
      // Map the section type to a standard type
      const standardType = mapSectionType(section.title);
      
      // Extract structured data if needed
      let content = section.content;
      if (section.structuredData) {
        content = section.structuredData;
      } else if (typeof content === 'string') {
        // Try to extract structured data based on section type
        try {
          const structuredData = extractStructuredData(standardType, content);
          if (structuredData && typeof structuredData === 'object') {
            content = structuredData;
          }
        } catch (error) {
          console.error(`Error extracting structured data for ${section.title}:`, error);
        }
      }
      
      editableSections.push({
        title: section.title,
        type: standardType,
        content: content
      });
    }
  }
  
  
  return editableSections;
}

/**
 * Extract structured data from a section based on its type
 * 
 * @param sectionType The type of section
 * @param content The raw content of the section
 * @returns Structured data for the section
 */
export function extractStructuredData(sectionType: string, content: string): any {
  // This function would contain logic to extract structured data
  // from raw text based on the section type
  
  // For now, return the content as is
  return content;
}
