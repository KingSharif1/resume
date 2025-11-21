'use client';

import { ResumeParsingDebugger } from '@/components/ResumeParsingDebugger';

export default function ParsingDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Resume Parsing Debugger</h1>
      <p className="mb-6 text-slate-600">
        This page allows you to see exactly how the resume parsing process works.
        Upload a resume and see the step-by-step parsing process, extracted text,
        detected sections, and structured data.
      </p>
      
      <ResumeParsingDebugger />
    </div>
  );
}
