'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Loader2, Sparkles, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { parsePDFToText } from '@/lib/pdf-parser';
import { TailoredResume } from '@/types/resume';
import { ResumeOutput } from '@/components/ResumeOutput';
import toast from 'react-hot-toast';

interface SavedResume {
  id: string;
  title: string;
  created_at: string;
  content: any;
}

export default function TailorResumePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [resumeMethod, setResumeMethod] = useState<'saved' | 'upload'>('saved');
  const [uploadedResume, setUploadedResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [tailoredResume, setTailoredResume] = useState<TailoredResume | null>(null);

  useEffect(() => {
    if (user) {
      loadSavedResumes();
    }
  }, [user]);

  const loadSavedResumes = async () => {
    try {
      setIsLoadingResumes(true);
      const { data, error } = await supabase
        .from('base_resumes')
        .select('id, title, created_at, content')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedResumes(data || []);
    } catch (error) {
      console.error('Error loading resumes:', error);
      toast.error('Failed to load saved resumes');
    } finally {
      setIsLoadingResumes(false);
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
      const fileType = fileName.endsWith('.docx') ? 'DOCX' : 'PDF';
      toast.loading(`Parsing ${fileType}...`, { id: 'file-parse' });
      const text = await parsePDFToText(file);
      setUploadedResume(text);
      toast.success(`${fileType} parsed successfully`, { id: 'file-parse' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to parse file', { id: 'file-parse' });
      console.error(error);
    }
  };

  const handleTailor = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please provide the job description');
      return;
    }

    let baseResume = '';

    if (resumeMethod === 'saved') {
      if (!selectedResumeId) {
        toast.error('Please select a resume');
        return;
      }
      const selected = savedResumes.find((r) => r.id === selectedResumeId);
      if (selected) {
        baseResume = JSON.stringify(selected.content);
      }
    } else {
      if (!uploadedResume.trim()) {
        toast.error('Please upload a resume');
        return;
      }
      baseResume = uploadedResume;
    }

    try {
      setIsLoading(true);
      const toastId = toast.loading('AI is tailoring your resume...');

      const response = await fetch('/api/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      setTailoredResume(tailoredResume);
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to tailor your resume</CardDescription>
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

  if (tailoredResume) {
    return (
      <ResumeOutput
        resume={tailoredResume}
        onStartOver={() => setTailoredResume(null)}
        user={user}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tailor Your Resume</h1>
          <p className="text-slate-600">
            Select a saved resume or upload a new one, then provide the job description
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Base Resume</CardTitle>
              <CardDescription>
                Choose from your saved resumes or upload a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={resumeMethod} onValueChange={(v) => setResumeMethod(v as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="saved">
                    <FileText className="w-4 h-4 mr-2" />
                    Saved Resumes
                  </TabsTrigger>
                  <TabsTrigger value="upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="saved" className="space-y-4">
                  {isLoadingResumes ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  ) : savedResumes.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-600 mb-4">No saved resumes found</p>
                      <Button onClick={() => router.push('/resume/create')} variant="outline">
                        Create Your First Resume
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Label>Select Resume</Label>
                      <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Choose a resume" />
                        </SelectTrigger>
                        <SelectContent>
                          {savedResumes.map((resume) => (
                            <SelectItem key={resume.id} value={resume.id}>
                              {resume.title} - {new Date(resume.created_at).toLocaleDateString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="upload">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      <Upload className="w-12 h-12 text-slate-400" />
                      <div>
                        <span className="text-base font-medium text-slate-700 block mb-1">
                          Click to upload resume
                        </span>
                        <span className="text-sm text-slate-500">PDF or DOCX files, max 10MB</span>
                      </div>
                    </label>
                  </div>
                  {uploadedResume && (
                    <div className="mt-4">
                      <Label>Parsed Content</Label>
                      <Textarea
                        value={uploadedResume}
                        onChange={(e) => setUploadedResume(e.target.value)}
                        rows={6}
                        className="mt-2 resize-none"
                      />
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
                Paste the full job description for the position you're applying to
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                rows={12}
                className="resize-none"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleTailor} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Tailoring...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Tailor Resume
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
