'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Download, FileText, RefreshCw, Save, Edit2, Check, FileDown } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { TailoredResume, AIChange, AISuggestion } from '@/types/resume';
import { AuthButton } from '@/components/AuthButton';
import { AISuggestions } from '@/components/AISuggestions';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { pdf } from '@react-pdf/renderer';
import { ResumePDF } from '@/components/ResumePDF';
import { exportToDocx } from '@/lib/docx-export';
import { PDFPreview } from '@/components/PDFPreview';
import { AIResumeChat } from '@/components/AIResumeChat';

interface ResumeOutputProps {
  resume: TailoredResume & {
    changes?: AIChange[];
    suggestions?: AISuggestion[];
  };
  onStartOver: () => void;
  user: any;
}

export function ResumeOutput({ resume: initialResume, onStartOver, user }: ResumeOutputProps) {
  const [resume, setResume] = useState<TailoredResume & { changes?: AIChange[]; suggestions?: AISuggestion[] }>(initialResume);
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [editingSummary, setEditingSummary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic' | 'minimal'>('modern');

  const handleSectionEdit = (index: number, newContent: string) => {
    const updatedSections = [...resume.sections];
    updatedSections[index].content = newContent;
    setResume({ ...resume, sections: updatedSections });
  };

  const handleSectionTitleEdit = (index: number, newTitle: string) => {
    const updatedSections = [...resume.sections];
    updatedSections[index].title = newTitle;
    setResume({ ...resume, sections: updatedSections });
  };

  const handleSummaryEdit = (newSummary: string) => {
    setResume({ ...resume, summary: newSummary });
  };

  const handleSaveToDatabase = async () => {
    if (!user) {
      toast.error('Please sign in to save your resume');
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading('Saving resume...');

    try {
      const { error } = await supabase.from('resumes').insert({
        user_id: user.id,
        title: `Resume - ${new Date().toLocaleDateString()}`,
        original_content: '',
        job_description: '',
        tailored_content: resume,
      });

      if (error) throw error;

      toast.success('Resume saved successfully!', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Failed to save resume', { id: toastId });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadText = () => {
    let content = `${resume.summary}\n\n`;

    resume.sections.forEach(section => {
      content += `${section.title}\n`;
      content += `${section.content}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tailored-resume.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Resume downloaded as text');
  };

  const handleDownloadPDF = async () => {
    try {
      const toastId = toast.loading('Generating PDF...');
      const blob = await pdf(<ResumePDF resume={resume} template={selectedTemplate} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tailored-resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Resume downloaded as PDF', { id: toastId });
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error(error);
    }
  };

  const handleDownloadDocx = async () => {
    try {
      const toastId = toast.loading('Generating DOCX...');
      await exportToDocx(resume, 'tailored-resume.docx');
      toast.success('Resume downloaded as DOCX', { id: toastId });
    } catch (error) {
      toast.error('Failed to generate DOCX');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Resume Tailor
          </div>
          <AuthButton user={user} />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button onClick={onStartOver} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Start Over
                </Button>
                <Button onClick={handleSaveToDatabase} disabled={isSaving || !user} variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  {user ? 'Save Resume' : 'Sign in to Save'}
                </Button>
                <Button onClick={handleDownloadText} variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Text
                </Button>
                <Button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button onClick={handleDownloadDocx} className="bg-green-600 hover:bg-green-700">
                  <FileDown className="w-4 h-4 mr-2" />
                  DOCX
                </Button>
              </div>

              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <Label className="text-sm font-semibold">PDF Template:</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedTemplate === 'modern' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTemplate('modern')}
                    >
                      Modern
                    </Button>
                    <Button
                      variant={selectedTemplate === 'classic' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTemplate('classic')}
                    >
                      Classic
                    </Button>
                    <Button
                      variant={selectedTemplate === 'minimal' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTemplate('minimal')}
                    >
                      Minimal
                    </Button>
                  </div>
                </div>
              </Card>

              <PDFPreview resume={resume} template={selectedTemplate} />
            </div>

            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Professional Summary</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingSummary(!editingSummary)}
                >
                  {editingSummary ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Edit2 className="w-4 h-4" />
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {editingSummary ? (
                  <Textarea
                    value={resume.summary}
                    onChange={(e) => handleSummaryEdit(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                ) : (
                  <p className="text-slate-700 leading-relaxed">{resume.summary}</p>
                )}
              </CardContent>
            </Card>

            {resume.sections.map((section, index) => (
              <Card key={index} className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  {editingSection === index ? (
                    <Input
                      value={section.title}
                      onChange={(e) => handleSectionTitleEdit(index, e.target.value)}
                      className="font-semibold text-lg"
                    />
                  ) : (
                    <CardTitle>{section.title}</CardTitle>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setEditingSection(editingSection === index ? null : index)
                    }
                  >
                    {editingSection === index ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Edit2 className="w-4 h-4" />
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  {editingSection === index ? (
                    <Textarea
                      value={section.content}
                      onChange={(e) => handleSectionEdit(index, e.target.value)}
                      rows={8}
                      className="resize-none font-mono text-sm"
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      {section.content.split('\n').map((line, i) => (
                        <p key={i} className="mb-2 text-slate-700">
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:w-96">
            <div className="sticky top-24 space-y-6">
              {resume.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {resume.notes}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <AISuggestions
                    changes={resume.changes || []}
                    suggestions={resume.suggestions || []}
                  />
                </CardContent>
              </Card>
              <AIResumeChat resumeContent={JSON.stringify(resume)} />

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-slate-600 space-y-2">
                    <li>• Click the edit icon to modify any section</li>
                    <li>• Keep bullets concise and quantifiable</li>
                    <li>• Use action verbs and keywords from the job description</li>
                    <li>• Proofread before downloading</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
