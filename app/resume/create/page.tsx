'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResumeSectionBuilder } from '@/components/ResumeSectionBuilder';
import { AIResumeChat } from '@/components/AIResumeChat';
import { Upload, Loader2, FileText, Save } from 'lucide-react';
import { parsePDFToText } from '@/lib/pdf-parser';
import { parseResumeText } from '@/lib/resume-parser';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';

interface Section {
  id: string;
  type: string;
  title: string;
  content: string;
}

export default function CreateResumePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('id');
  const { user } = useAuth();

  const [resumeTitle, setResumeTitle] = useState('My Resume');
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'manual'>('manual');
  const [sections, setSections] = useState<Section[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!resumeId);

  useEffect(() => {
    if (resumeId && user) {
      loadResume(resumeId);
    }
  }, [resumeId, user]);

  const loadResume = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('base_resumes')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error('Resume not found');
        router.push('/dashboard');
        return;
      }

      setResumeTitle(data.title);
      if (data.sections && Array.isArray(data.sections)) {
        setSections(data.sections);
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      toast.error('Failed to load resume');
    } finally {
      setIsLoading(false);
    }
  };

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
      setIsUploading(true);
      const fileType = fileName.endsWith('.docx') ? 'DOCX' : 'PDF';
      toast.loading(`Parsing ${fileType}...`, { id: 'file-parse' });

      const text = await parsePDFToText(file);
      const structured = parseResumeText(text);

      const newSections: Section[] = structured.sections.map((section, index) => ({
        id: Date.now().toString() + index,
        type: section.title.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        title: section.title,
        content: section.content,
      }));

      setSections(newSections);
      setUploadMethod('manual');
      toast.success(`${fileType} parsed - Found ${structured.sections.length} sections. Edit below.`, {
        id: 'file-parse',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to parse file', { id: 'file-parse' });
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save your resume');
      return;
    }

    if (!resumeTitle.trim()) {
      toast.error('Please enter a resume title');
      return;
    }

    if (sections.length === 0) {
      toast.error('Please add at least one section to your resume');
      return;
    }

    try {
      setIsSaving(true);
      toast.loading(resumeId ? 'Updating resume...' : 'Saving resume...', { id: 'save-resume' });

      const resumeData = {
        user_id: user.id,
        title: resumeTitle,
        content: sections.reduce((acc, section) => {
          acc[section.title] = section.content;
          return acc;
        }, {} as Record<string, string>),
        sections: sections,
      };

      if (resumeId) {
        const { error } = await supabase
          .from('base_resumes')
          .update(resumeData)
          .eq('id', resumeId);
        if (error) throw error;
        toast.success('Resume updated successfully!', { id: 'save-resume' });
      } else {
        const { error } = await supabase.from('base_resumes').insert(resumeData);
        if (error) throw error;
        toast.success('Resume saved successfully!', { id: 'save-resume' });
      }

      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save resume', { id: 'save-resume' });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to create a resume</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading resume...</p>
        </div>
      </div>
    );
  }

  const resumeContent = JSON.stringify({
    title: resumeTitle,
    sections: sections,
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {resumeId ? 'Edit Resume' : 'Create Base Resume'}
          </h1>
          <p className="text-slate-600">
            {resumeId ? 'Update your resume details' : 'Upload your existing resume or build one from scratch'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resume Title</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  placeholder="e.g., Software Engineer Resume"
                  className="text-lg font-semibold"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resume Content</CardTitle>
                <CardDescription>
                  Upload a document to parse or build your resume section by section
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as any)}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="upload">Upload & Parse</TabsTrigger>
                    <TabsTrigger value="manual">Build/Edit Sections</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-4">
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="hidden"
                        id="resume-upload"
                      />
                      <label
                        htmlFor="resume-upload"
                        className="cursor-pointer flex flex-col items-center gap-3"
                      >
                        {isUploading ? (
                          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                        ) : (
                          <Upload className="w-12 h-12 text-slate-400" />
                        )}
                        <div>
                          <span className="text-base font-medium text-slate-700 block mb-1">
                            {isUploading ? 'Parsing document...' : 'Click to upload resume'}
                          </span>
                          <span className="text-sm text-slate-500">
                            PDF or DOCX files • Will be parsed into editable sections
                          </span>
                        </div>
                      </label>
                    </div>

                    {sections.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          <strong>{sections.length} sections detected!</strong> Switch to "Build/Edit Sections" tab to review and edit them.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="manual">
                    <ResumeSectionBuilder
                      initialSections={sections}
                      onSectionsChange={setSections}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || sections.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {resumeId ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {resumeId ? 'Update Resume' : 'Save Resume'}
                    </>
                  )}
                </Button>
                <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
                  Cancel
                </Button>
              </CardContent>
            </Card>

            <AIResumeChat resumeContent={resumeContent} />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>• Upload a PDF/DOCX to auto-parse into sections</li>
                  <li>• Review and edit parsed content before saving</li>
                  <li>• Add/remove/reorder sections as needed</li>
                  <li>• Use AI chat for suggestions</li>
                  <li>• Save multiple versions for different roles</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
