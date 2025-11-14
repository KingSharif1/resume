import { NextRequest, NextResponse } from 'next/server';
import { extractText } from 'unpdf';

export async function POST(request: NextRequest) {
  try {
    const buffer = await request.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

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

    return NextResponse.json({
      text: cleanedText,
      totalPages,
      metadata: {
        lineCount: cleanedText.split('\n').length,
        wordCount: cleanedText.split(/\s+/).length,
      }
    });
  } catch (error) {
    console.error('PDF parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse PDF. Please ensure the file is a valid, text-based PDF.' },
      { status: 500 }
    );
  }
}
