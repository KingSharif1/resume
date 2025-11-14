import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

export async function POST(request: NextRequest) {
  try {
    const buffer = await request.arrayBuffer();

    const result = await mammoth.convertToHtml(
      { arrayBuffer: buffer },
      {
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Heading 4'] => h4:fresh",
          "p[style-name='Title'] => h1:fresh",
          "p[style-name='Subtitle'] => h2:fresh",
        ]
      }
    );

    const html = result.value;

    const text = html
      .replace(/<h1[^>]*>/gi, '\n\n')
      .replace(/<\/h1>/gi, '\n')
      .replace(/<h2[^>]*>/gi, '\n\n')
      .replace(/<\/h2>/gi, '\n')
      .replace(/<h3[^>]*>/gi, '\n\n')
      .replace(/<\/h3>/gi, '\n')
      .replace(/<h4[^>]*>/gi, '\n\n')
      .replace(/<\/h4>/gi, '\n')
      .replace(/<h5[^>]*>/gi, '\n\n')
      .replace(/<\/h5>/gi, '\n')
      .replace(/<h6[^>]*>/gi, '\n\n')
      .replace(/<\/h6>/gi, '\n')
      .replace(/<p[^>]*>/gi, '\n')
      .replace(/<\/p>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<ul[^>]*>/gi, '\n')
      .replace(/<\/ul>/gi, '\n')
      .replace(/<ol[^>]*>/gi, '\n')
      .replace(/<\/ol>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<strong[^>]*>/gi, '')
      .replace(/<\/strong>/gi, '')
      .replace(/<em[^>]*>/gi, '')
      .replace(/<\/em>/gi, '')
      .replace(/<b[^>]*>/gi, '')
      .replace(/<\/b>/gi, '')
      .replace(/<i[^>]*>/gi, '')
      .replace(/<\/i>/gi, '')
      .replace(/<u[^>]*>/gi, '')
      .replace(/<\/u>/gi, '')
      .replace(/<span[^>]*>/gi, '')
      .replace(/<\/span>/gi, '')
      .replace(/<div[^>]*>/gi, '\n')
      .replace(/<\/div>/gi, '')
      .replace(/<table[^>]*>/gi, '\n')
      .replace(/<\/table>/gi, '\n')
      .replace(/<tr[^>]*>/gi, '\n')
      .replace(/<\/tr>/gi, '')
      .replace(/<td[^>]*>/gi, ' ')
      .replace(/<\/td>/gi, ' ')
      .replace(/<th[^>]*>/gi, ' ')
      .replace(/<\/th>/gi, ' ')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    if (!text || text.length === 0) {
      return NextResponse.json(
        { error: 'No text found in document' },
        { status: 400 }
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('DOCX parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse DOCX file. Please ensure it is a valid DOCX document.' },
      { status: 500 }
    );
  }
}
