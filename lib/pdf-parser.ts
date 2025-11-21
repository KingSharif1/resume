export interface ParsedDocument {
  text: string;
  metadata?: {
    totalPages?: number;
    lineCount?: number;
    wordCount?: number;
    detectedSections?: string[];
    aiProcessed?: boolean;
  };
  sections?: Array<{
    title: string;
    type: string;
    content: string;
  }>;
}

export async function parseDocumentToText(file: File, useAI: boolean = false): Promise<ParsedDocument> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    let endpoint = useAI ? '/api/ai-parse' : '/api/parse-pdf';
    let fileFormat = 'PDF';

    // Check if file is a DOCX file
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')) {
      endpoint = '/api/parse-docx';
      fileFormat = 'DOCX';
      
      // Check if file is actually a DOCX file (simple validation)
      const header = new Uint8Array(arrayBuffer.slice(0, 4));
      const isPK = header[0] === 0x50 && header[1] === 0x4B && header[2] === 0x03 && header[3] === 0x04;
      if (!isPK) {
        throw new Error('Invalid DOCX file format. The file does not appear to be a valid DOCX document.');
      }
    } else if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
      throw new Error('DOC format is not supported. Please use DOCX format.');
    } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      // Basic PDF validation
      const header = new Uint8Array(arrayBuffer.slice(0, 5));
      const headerText = new TextDecoder().decode(header);
      if (!headerText.startsWith('%PDF')) {
        throw new Error('Invalid PDF format. The file does not appear to be a valid PDF document.');
      }
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: uint8Array,
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.error || 'Failed to parse document');
      } catch (jsonError) {
        // If response is not JSON, use status text
        throw new Error(`Failed to parse document: ${response.statusText}`);
      }
    }

    const data = await response.json();
    const text = data.text;

    if (!text || text.trim().length === 0) {
      throw new Error('No text found in document. The document may be empty or contain only images.');
    }
    
    // Return both text and metadata
    return {
      text,
      metadata: data.metadata
    };
  } catch (error) {
    console.error('Document parsing error:', error);
    throw error instanceof Error ? error : new Error('Failed to parse document. Please try uploading as text instead.');
  }
}

export async function parsePDFToText(file: File, useAI: boolean = false): Promise<ParsedDocument> {
  return parseDocumentToText(file, useAI);
}
