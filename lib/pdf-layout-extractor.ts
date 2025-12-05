// Polyfill browser APIs needed by pdf.js (used by pdf-parse)
if (typeof Promise.withResolvers === 'undefined') {
  // @ts-ignore
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

// @ts-ignore
if (typeof global.DOMMatrix === 'undefined') {
  // @ts-ignore
  global.DOMMatrix = class DOMMatrix {
    constructor() { return this; }
    toString() { return ''; }
  };
}
// @ts-ignore
if (typeof global.ImageData === 'undefined') {
  // @ts-ignore
  global.ImageData = class ImageData {
    constructor() { return this; }
  };
}
// @ts-ignore
if (typeof global.Path2D === 'undefined') {
  // @ts-ignore
  global.Path2D = class Path2D {
    constructor() { return this; }
  };
}

// @ts-ignore
const pdfParse = require('pdf-parse/lib/pdf-parse.js'); // Using direct import to bypass debug code in index.js

export interface ExtractedText {
  text: string;
  formattedText: string; // Text with heading markers
  metadata: {
    headings: Array<{ text: string; level: number; position: number }>;
    hasTables: boolean;
  };
}

/**
 * Extract text from PDF with basic structure detection
 * Uses pdf-parse for reliable extraction in Next.js environment
 */
export async function extractPDFWithLayout(buffer: Buffer): Promise<ExtractedText> {
  try {
    console.log('[PDF Layout] Starting extraction with pdf-parse...');
    console.log('[PDF Layout] pdfParse type:', typeof pdfParse);
    if (typeof pdfParse !== 'function') {
      console.log('[PDF Layout] pdfParse keys:', Object.keys(pdfParse));
      if (pdfParse.default) console.log('[PDF Layout] pdfParse.default type:', typeof pdfParse.default);
    }
    
    const parseFunc = typeof pdfParse === 'function' ? pdfParse : pdfParse.default;
    if (typeof parseFunc !== 'function') {
      throw new Error(`pdf-parse is not a function. It is: ${typeof pdfParse}`);
    }

    const data = await parseFunc(buffer);
    const fullText = data.text;
    
    if (!fullText || fullText.trim().length === 0) {
      throw new Error('No text found in PDF');
    }

    console.log(`[PDF Layout] Extracted ${fullText.length} characters`);
    
    // Analyze text to identify potential headings
    const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const headings: Array<{ text: string; level: number; position: number }> = [];
    let formattedText = '';
    let position = 0;
    
    // Heuristics for identifying headings:
    // 1. All caps lines that are short (likely section headers)
    // 2. Lines that match common resume section names
    const commonSections = /^(EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|SUMMARY|OBJECTIVE|PROFILE|CONTACT|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|TECHNICAL SKILLS|AWARDS|VOLUNTEER|LANGUAGES|INTERESTS|PUBLICATIONS)$/i;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
      
      // Check if line is a heading
      let isHeading = false;
      let headingLevel = 2;
      
      // Strategy 1: Common section names
      if (commonSections.test(line)) {
        isHeading = true;
        headingLevel = 1;
      }
      // Strategy 2: All caps, short line (< 50 chars), not email/phone
      else if (line === line.toUpperCase() && 
               line.length < 50 && 
               line.length > 2 &&
               !line.includes('@') &&
               !line.match(/\d{3}[-.\s]?\d{3}/)) {
        // Check if next line looks like content (not another heading)
        if (nextLine && nextLine !== nextLine.toUpperCase()) {
          isHeading = true;
          headingLevel = 2;
        }
      }
      
      if (isHeading) {
        const marker = '#'.repeat(headingLevel + 1);
        formattedText += `\n${marker} ${line}\n`;
        headings.push({ text: line, level: headingLevel, position });
      } else {
        formattedText += line + '\n';
      }
      
      position += line.length + 1;
    }
    
    console.log(`[PDF Layout] Found ${headings.length} potential headings`);
    if (headings.length > 0) {
      console.log('[PDF Layout] Headings:', headings.slice(0, 10).map(h => `${h.text} (L${h.level})`).join(', '));
    }
    
    return {
      text: fullText.trim(),
      formattedText: formattedText.trim(),
      metadata: {
        headings,
        hasTables: false
      }
    };
  } catch (error) {
    console.error('[PDF Layout] Extraction error:', error);
    throw new Error(`Failed to extract PDF with layout: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
