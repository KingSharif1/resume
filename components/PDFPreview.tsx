'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { pdf } from '@react-pdf/renderer';
import { ResumePDF } from '@/components/ResumePDF';
import { TailoredResume } from '@/types/resume';
import { Loader2 } from 'lucide-react';

interface PDFPreviewProps {
  resume: TailoredResume;
  template: 'modern' | 'classic' | 'minimal';
}

export function PDFPreview({ resume, template }: PDFPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const generatePreview = async () => {
      try {
        setLoading(true);
        const blob = await pdf(<ResumePDF resume={resume} template={template} />).toBlob();

        if (mounted) {
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to generate PDF preview:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    generatePreview();

    return () => {
      mounted = false;
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [resume, template]);

  return (
    <Card className="p-4 bg-slate-50 h-full">
      <div className="text-sm font-semibold mb-3">PDF Preview ({template})</div>
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : pdfUrl ? (
        <div className="border rounded bg-white overflow-hidden" style={{ height: '600px' }}>
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            title="Resume Preview"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-96 text-slate-500">
          Failed to generate preview
        </div>
      )}
    </Card>
  );
}
