export async function parseDocumentToText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    let endpoint = '/api/parse-pdf';

    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')) {
      endpoint = '/api/parse-docx';
    } else if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
      throw new Error('DOC format is not supported. Please use DOCX format.');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: uint8Array,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to parse document');
    }

    const { text } = await response.json();

    if (!text || text.trim().length === 0) {
      throw new Error('No text found in document');
    }

    return text;
  } catch (error) {
    console.error('Document parsing error:', error);
    throw error instanceof Error ? error : new Error('Failed to parse document. Please try uploading as text instead.');
  }
}

export async function parsePDFToText(file: File): Promise<string> {
  return parseDocumentToText(file);
}
