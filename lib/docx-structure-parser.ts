import JSZip from 'jszip';

export interface DOCXStructuredText {
  text: string;
  formattedText: string; // Text with heading markers
  metadata: {
    headings: Array<{ text: string; level: number }>;
    hasFormatting: boolean;
  };
}

/**
 * Parse DOCX structure by extracting and analyzing the underlying XML
 * Preserves headings, formatting, and document structure
 */
export async function parseDOCXStructure(buffer: Buffer): Promise<DOCXStructuredText> {
  try {
    console.log('[DOCX Structure] Starting structured parsing...');
    
    const zip = await JSZip.loadAsync(buffer as any);
    
    // Extract document.xml (main content)
    const documentXml = await zip.file('word/document.xml')?.async('text');
    if (!documentXml) {
      throw new Error('document.xml not found in DOCX');
    }
    
    // Extract styles.xml (style definitions)
    const stylesXml = await zip.file('word/styles.xml')?.async('text');
    
    console.log('[DOCX Structure] Extracted XML files');
    
    // Parse styles to identify heading styles
    const headingStyles = new Set<string>();
    if (stylesXml) {
      // Match style IDs for headings (e.g., Heading1, Heading2, etc.)
      const headingMatches = Array.from(stylesXml.matchAll(/<w:style[^>]*w:styleId="(Heading\d+)"[^>]*>/g));
      for (const match of headingMatches) {
        headingStyles.add(match[1]);
      }
    }
    
    console.log('[DOCX Structure] Found heading styles:', Array.from(headingStyles));
    
    // Parse document.xml to extract text with structure
    let fullText = '';
    let formattedText = '';
    const headings: Array<{ text: string; level: number }> = [];
    
    // Extract paragraphs - use [\s\S] instead of . with s flag for ES2017 compatibility
    const paragraphMatches = Array.from(documentXml.matchAll(/<w:p[^>]*>([\s\S]*?)<\/w:p>/g));
    
    for (const pMatch of paragraphMatches) {
      const paragraphXml = pMatch[1];
      
      // Check for paragraph style
      const styleMatch = paragraphXml.match(/<w:pStyle w:val="([^"]+)"/);
      const styleName = styleMatch ? styleMatch[1] : null;
      
      // Extract text from runs
      const textMatches = Array.from(paragraphXml.matchAll(/<w:t[^>]*>([^<]+)<\/w:t>/g));
      let paragraphText = '';
      
      for (const tMatch of textMatches) {
        paragraphText += tMatch[1];
      }
      
      if (!paragraphText.trim()) continue;
      
      // Check if it's a heading
      if (styleName && headingStyles.has(styleName)) {
        const headingLevel = parseInt(styleName.replace('Heading', '')) || 1;
        headings.push({ text: paragraphText, level: headingLevel });
        
        // Add markdown-style heading markers
        const marker = '#'.repeat(Math.min(headingLevel + 1, 6));
        formattedText += `\n${marker} ${paragraphText}\n`;
      } else {
        // Check for bold text (common for section headers)
        const isBold = paragraphXml.includes('<w:b/>') || paragraphXml.includes('<w:b ');
        
        if (isBold && paragraphText.length < 100 && paragraphText.toUpperCase() === paragraphText) {
          // Likely a section header
          formattedText += `\n### ${paragraphText}\n`;
          headings.push({ text: paragraphText, level: 3 });
        } else {
          formattedText += paragraphText + '\n';
        }
      }
      
      fullText += paragraphText + '\n';
    }
    
    console.log(`[DOCX Structure] Extracted ${fullText.length} characters`);
    console.log(`[DOCX Structure] Found ${headings.length} headings`);
    console.log('[DOCX Structure] Headings:', headings.map(h => `${h.text} (L${h.level})`).join(', '));
    
    return {
      text: fullText.trim(),
      formattedText: formattedText.trim(),
      metadata: {
        headings,
        hasFormatting: headings.length > 0
      }
    };
  } catch (error) {
    console.error('[DOCX Structure] Parsing error:', error);
    throw new Error(`Failed to parse DOCX structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
