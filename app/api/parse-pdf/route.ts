import { NextRequest, NextResponse } from 'next/server';
import { extractText } from 'unpdf';

export async function POST(request: NextRequest) {
  try {
    // Validate request
    if (!request.body) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    const buffer = await request.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    // Basic validation for PDF format (check for PDF header %PDF)
    const header = new TextDecoder().decode(uint8Array.slice(0, 5));
    if (!header.startsWith('%PDF')) {
      return NextResponse.json(
        { error: 'Invalid PDF format. The file does not appear to be a valid PDF document.' },
        { status: 400 }
      );
    }

    const { text, totalPages } = await extractText(uint8Array, {
      mergePages: true,
    });

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text found in PDF. The PDF may be image-based or empty.' },
        { status: 400 }
      );
    }

    let cleanedText = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\f/g, '\n\n')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
      .replace(/\t/g, '  ')
      .replace(/  +/g, ' ')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');

    const lines = cleanedText.split('\n');
    const processedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i];
      const nextLine = lines[i + 1];

      if (currentLine.match(/^[A-Z\s&-]{3,50}$/) &&
          currentLine.length < 50 &&
          nextLine &&
          !nextLine.match(/^[A-Z\s&-]+$/)) {
        processedLines.push('\n' + currentLine + '\n');
      } else {
        processedLines.push(currentLine);
      }
    }

    cleanedText = processedLines.join('\n');

    const hasBulletChars = /[•●○■▪▫]/.test(cleanedText);
    if (!hasBulletChars) {
      cleanedText = cleanedText
        .split('\n')
        .map(line => {
          if (line.match(/^[-–—]\s+/) ||
              line.match(/^\*\s+/) ||
              line.match(/^[a-z]\)\s+/i)) {
            return line.replace(/^[-–—*]\s+/, '• ');
          }
          return line;
        })
        .join('\n');
    }

    cleanedText = cleanedText
      .replace(/\n{4,}/g, '\n\n\n')
      .trim();

    // Detect potential sections for better feedback
    const detectedSections = detectSections(cleanedText);
    
    return NextResponse.json({
      text: cleanedText,
      totalPages,
      metadata: {
        lineCount: cleanedText.split('\n').length,
        wordCount: cleanedText.split(/\s+/).length,
        detectedSections: detectedSections.map(s => s.title)
      },
      sections: detectedSections
    });
  } catch (error) {
    console.error('PDF parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse PDF: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

/**
 * Detects potential resume sections in the text
 */
interface DetectedSection {
  title: string;
  type: string;
}

function detectSections(text: string): DetectedSection[] {
  const sectionKeywords = [
    { regex: /contact|personal|details/i, type: 'contact' },
    { regex: /summary|profile|about|objective/i, type: 'summary' },
    { regex: /experience|employment|work|career/i, type: 'experience' },
    { regex: /education|academic|degree|university|college/i, type: 'education' },
    { regex: /skills|technical|competencies|expertise/i, type: 'skills' },
    { regex: /certifications|certificates|licenses/i, type: 'certifications' },
    { regex: /projects|portfolio/i, type: 'projects' },
    { regex: /awards|honors|achievements/i, type: 'awards' },
    { regex: /publications|papers|research/i, type: 'publications' },
    { regex: /volunteer|community service/i, type: 'volunteer' },
    { regex: /languages|language skills/i, type: 'languages' },
    { regex: /interests|hobbies/i, type: 'interests' },
    { regex: /references/i, type: 'references' }
  ];
  
  const lines = text.split('\n');
  const detectedSections: DetectedSection[] = [];
  
  for (const line of lines) {
    const normalizedLine = line.toLowerCase().trim();
    if (!normalizedLine || normalizedLine.length < 3) continue;
    
    // Skip lines that are just weird characters or symbols
    if (/^[^a-zA-Z0-9\s]{1,3}$/.test(normalizedLine)) {
      continue;
    }
    
    // Check if line looks like a section header
    if (
      // All caps or title case short line
      (line.match(/^[A-Z][A-Za-z\s]{2,20}$/) && line.length < 30) ||
      // Line ends with colon
      normalizedLine.endsWith(':') ||
      // Line contains a section keyword
      sectionKeywords.some(k => k.regex.test(normalizedLine))
    ) {
      // Clean up the title - remove any weird characters
      const cleanTitle = line
        .replace(/:$/, '') // Remove trailing colon
        .replace(/[^a-zA-Z0-9\s.,()&-]/g, ' ') // Replace non-alphanumeric with space
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
      
      if (cleanTitle) {
        // Determine section type
        const matchedKeyword = sectionKeywords.find(k => k.regex.test(normalizedLine));
        const sectionType = matchedKeyword ? matchedKeyword.type : 'custom';
        
        detectedSections.push({
          title: cleanTitle,
          type: sectionType
        });
      }
    }
  }
  
  // Remove duplicates by title
  const uniqueSections: DetectedSection[] = [];
  const seenTitles = new Set<string>();
  
  for (const section of detectedSections) {
    if (!seenTitles.has(section.title.toLowerCase())) {
      seenTitles.add(section.title.toLowerCase());
      uniqueSections.push(section);
    }
  }
  
  return uniqueSections;
}
