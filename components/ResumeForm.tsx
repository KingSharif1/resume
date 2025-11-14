'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Loader2, Sparkles } from 'lucide-react';
import { parsePDFToText } from '@/lib/pdf-parser';
import { parseResumeText } from '@/lib/resume-parser';
import { TailoredResume } from '@/types/resume';
import toast from 'react-hot-toast';

interface ResumeFormProps {
  onResumeGenerated: (resume: TailoredResume) => void;
}

export function ResumeForm({ onResumeGenerated }: ResumeFormProps) {
  const [baseResume, setBaseResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'text' | 'pdf'>('text');
  const [parsedSections, setParsedSections] = useState<{ summary: string; sections: { title: string; content: string }[] } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isValidFile =
      file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.pdf') ||
      fileName.endsWith('.docx');

    if (!isValidFile) {
      toast.error('Please upload a PDF or DOCX file');
      return;
    }

    try {
      const fileType = fileName.endsWith('.docx') ? 'DOCX' : 'PDF';
      toast.loading(`Parsing ${fileType}...`, { id: 'file-parse' });
      const text = await parsePDFToText(file);
      setBaseResume(text);

      const structured = parseResumeText(text);
      setParsedSections(structured);

      toast.success(`${fileType} parsed successfully - Found ${structured.sections.length} sections`, { id: 'file-parse' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to parse file', { id: 'file-parse' });
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!baseResume.trim()) {
      toast.error('Please provide your base resume');
      return;
    }

    if (!jobDescription.trim()) {
      toast.error('Please provide the job description');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('AI is tailoring your resume...');

    try {
      const response = await fetch('/api/tailor-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baseResume,
          jobDescription,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to tailor resume');
      }

      const { tailoredResume } = await response.json();
      toast.success('Resume tailored successfully!', { id: toastId });
      onResumeGenerated(tailoredResume);
    } catch (error: any) {
      toast.error(error.message || 'An error occurred', { id: toastId });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Tailor Your Resume
        </h1>
        <p className="text-slate-600">
          Upload your resume and paste the job description to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Base Resume</CardTitle>
            <CardDescription>
              Upload your resume as PDF or paste the text directly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as 'text' | 'pdf')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Paste Text</TabsTrigger>
                <TabsTrigger value="pdf">Upload Document</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-4">
                <Textarea
                  placeholder="Paste your resume content here...&#10;&#10;John Doe&#10;Software Engineer&#10;&#10;Experience:&#10;- 5 years in web development&#10;- Built scalable applications..."
                  value={baseResume}
                  onChange={(e) => setBaseResume(e.target.value)}
                  rows={12}
                  className="resize-none"
                />
              </TabsContent>

              <TabsContent value="pdf" className="mt-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-10 h-10 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">
                      Click to upload resume
                    </span>
                    <span className="text-xs text-slate-500">
                      PDF or DOCX files, max 10MB
                    </span>
                  </label>
                </div>
                {baseResume && (
                  <div className="mt-4 space-y-4">
                    {parsedSections && parsedSections.sections.length > 0 ? (
                      <div className="border rounded-lg p-4 bg-slate-50">
                        <Label className="text-sm font-semibold mb-3 block">Detected Resume Sections:</Label>
                        <div className="space-y-3">
                          {parsedSections.sections.map((section, index) => (
                            <div key={index} className="bg-white p-3 rounded border">
                              <div className="font-semibold text-sm text-blue-600 mb-1">{section.title}</div>
                              <div className="text-xs text-slate-600 line-clamp-2">{section.content}</div>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => setParsedSections(null)}
                        >
                          Edit Raw Text
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Label>Parsed Content (you can edit):</Label>
                        <Textarea
                          value={baseResume}
                          onChange={(e) => setBaseResume(e.target.value)}
                          rows={8}
                          className="mt-2 resize-none"
                        />
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
            <CardDescription>
              Paste the job description you want to tailor your resume for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste the job description here...&#10;&#10;Senior Software Engineer&#10;&#10;We are looking for an experienced developer with:&#10;- 5+ years of experience&#10;- React, TypeScript, Node.js..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={12}
              className="resize-none"
            />
          </CardContent>
        </Card>

        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Tailoring Resume...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Tailor Resume with AI
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
