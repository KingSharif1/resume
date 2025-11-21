import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

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
    
    // Basic validation for DOCX format (PK header)
    const header = new Uint8Array(buffer.slice(0, 4));
    const isPK = header[0] === 0x50 && header[1] === 0x4B && header[2] === 0x03 && header[3] === 0x04;
    if (!isPK) {
      return NextResponse.json(
        { error: 'Invalid DOCX file format. The file does not appear to be a valid DOCX document.' },
        { status: 400 }
      );
    }

    // Try to convert DOCX to HTML
    try {
      // Convert ArrayBuffer to Buffer for mammoth
      const nodeBuffer = Buffer.from(buffer);
      
      const result = await mammoth.extractRawText({ buffer: nodeBuffer });
      
      // Check for mammoth warnings
      if (result.messages && result.messages.length > 0) {
        console.warn('DOCX parsing warnings:', result.messages);
      }
      
      const text = result.value;

    // We're already getting raw text from extractRawText, no need for HTML processing
    // Just clean up the text a bit
    const cleanedText = text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .replace(/[ \t]+/g, ' ') // Normalize spaces
      .trim();

    if (!cleanedText || cleanedText.length === 0) {
      return NextResponse.json(
        { error: 'No text found in document' },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: cleanedText });
  } catch (mammothError) {
    console.error('Mammoth conversion error:', mammothError);
    return NextResponse.json(
      { error: 'Failed to parse DOCX file: ' + (mammothError instanceof Error ? mammothError.message : 'Unknown error') },
      { status: 500 }
    );
  }
  } catch (error) {
    console.error('DOCX parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse DOCX file. Please ensure it is a valid DOCX document.' },
      { status: 500 }
    );
  }
}
