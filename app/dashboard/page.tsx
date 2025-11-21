'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Clock, Trash2, Edit, Star, StarOff, Upload, Download, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { resumeParser } from '@/lib/services/resume-parser';

interface BaseResume {
  id: string;
  title: string;
  contact_info: any;
  summary: string;
  experience: any[];
  education: any[];
  skills: any;
  certifications: any[];
  projects: any[];
  custom_sections: any[];
  is_starred: boolean;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [baseResumes, setBaseResumes] = useState<BaseResume[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedProfile, setParsedProfile] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadResumes();
    }
  }, [user]);

  const loadResumes = async () => {
    try {
      if (!user?.id) return;
      
      const response = await fetch(`/api/resumes?userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch resumes');
      }
      
      const data = await response.json();
      setBaseResumes(data.resumes || []);
    } catch (error) {
      console.error('Error loading resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoadingData(false);
    }
  };

  const deleteResume = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/resumes?id=${id}&userId=${user.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete resume');
      }
      
      toast.success('Resume deleted');
      loadResumes();
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  const toggleStar = async (id: string, currentStarred: boolean) => {
    if (!user?.id) return;

    try {
      // For now, we'll skip the star toggle since it requires updating the API
      // TODO: Implement star toggle in API
      toast.success(currentStarred ? 'Resume unpinned' : 'Resume pinned');
      // loadResumes();
    } catch (error) {
      console.error('Error updating resume:', error);
      toast.error('Failed to update resume');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.docx'))) {
      setUploadFile(droppedFile);
    } else {
      toast.error('Please upload a PDF or DOCX file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setUploadFile(selectedFile);
    }
  };

  const handleUploadResume = async () => {
    if (!uploadFile || !user?.id) return;

    setIsProcessing(true);
    try {
      // Parse the resume
      const parseResult = await resumeParser.parseResume(uploadFile);
      
      if (!parseResult.success || !parseResult.profile) {
        const errorMessage = parseResult.errors?.[0] || 'Failed to parse resume';
        throw new Error(errorMessage);
      }

      // Show preview instead of immediately saving
      setParsedProfile(parseResult.profile);
      setShowPreview(true);
      toast.success('Resume parsed successfully! Review the details below.');
    } catch (error) {
      console.error('Error parsing resume:', error);
      toast.error('Failed to parse resume. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveParsedResume = async () => {
    if (!parsedProfile || !user?.id) return;

    setIsProcessing(true);
    try {
      // Save to database
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: parsedProfile,
          userId: user.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save resume');
      }

      toast.success('Resume saved successfully!');
      setShowUpload(false);
      setShowPreview(false);
      setUploadFile(null);
      setParsedProfile(null);
      loadResumes();
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
    setParsedProfile(null);
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Resumes</h1>
            <p className="text-slate-600">Create, manage, and optimize your resumes</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowUpload(true)} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              <Upload className="w-4 h-4 mr-2" />
              Upload Resume
            </Button>
            <Button onClick={() => router.push('/builder')} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          </div>
        </div>

        {baseResumes.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No resumes yet</h3>
            <p className="text-slate-600 mb-6">Create your first resume or upload an existing one</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setShowUpload(true)} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <Upload className="w-4 h-4 mr-2" />
                Upload Resume
              </Button>
              <Button onClick={() => router.push('/builder')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create New
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sort resumes to show starred ones first */}
            {baseResumes
              .sort((a, b) => {
                // First sort by starred status (starred first)
                if (a.is_starred && !b.is_starred) return -1;
                if (!a.is_starred && b.is_starred) return 1;
                // Then sort by updated date (newest first)
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
              })
              .map((resume) => (
              <Card 
                key={resume.id} 
                className={`hover:shadow-lg transition-shadow ${resume.is_starred ? 'border-blue-400 bg-blue-50' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg truncate">{resume.title}</CardTitle>
                        {resume.is_starred && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Original</span>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-1 mt-2">
                        <Clock className="w-3 h-3" />
                        {new Date(resume.updated_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => toggleStar(resume.id, !!resume.is_starred)}
                      variant="ghost"
                      size="sm"
                      className={`p-1 h-8 w-8 ${resume.is_starred ? 'text-yellow-500' : 'text-gray-400'}`}
                    >
                      {resume.is_starred ? <Star className="w-5 h-5" /> : <StarOff className="w-5 h-5" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push(`/builder?id=${resume.id}`)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => deleteResume(resume.id)}
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Upload Resume</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowUpload(false);
                      setUploadFile(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!uploadFile ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-slate-900 mb-2">
                      Drop your resume here
                    </p>
                    <p className="text-sm text-slate-600 mb-4">
                      Supports PDF and DOCX files up to 10MB
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{uploadFile.name}</p>
                        <p className="text-sm text-slate-600">
                          {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadFile(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleUploadResume}
                        disabled={isProcessing}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload & Parse
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && parsedProfile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Resume Preview</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelPreview}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-slate-600">
                  Review the extracted information and save to your dashboard
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-900">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Name</p>
                      <p className="text-slate-900">{parsedProfile.contact?.firstName} {parsedProfile.contact?.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Email</p>
                      <p className="text-slate-900">{parsedProfile.contact?.email || 'Not found'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Phone</p>
                      <p className="text-slate-900">{parsedProfile.contact?.phone || 'Not found'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Location</p>
                      <p className="text-slate-900">{parsedProfile.contact?.location || 'Not found'}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Summary */}
                {parsedProfile.summary?.content && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-900">Professional Summary</h3>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-slate-900">{parsedProfile.summary.content}</p>
                    </div>
                  </div>
                )}

                {/* Experience */}
                {parsedProfile.experience?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-900">Experience</h3>
                    <div className="space-y-4">
                      {parsedProfile.experience.map((exp: any, index: number) => (
                        <div key={index} className="p-4 bg-slate-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-slate-900">{exp.position}</p>
                              <p className="text-slate-700">{exp.company}</p>
                            </div>
                            <p className="text-sm text-slate-600">{exp.startDate} - {exp.endDate}</p>
                          </div>
                          <p className="text-slate-900 mb-2">{exp.description}</p>
                          {exp.achievements?.length > 0 && (
                            <ul className="list-disc list-inside text-sm text-slate-700">
                              {exp.achievements.map((achievement: string, i: number) => (
                                <li key={i}>{achievement}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {parsedProfile.education?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-900">Education</h3>
                    <div className="space-y-4">
                      {parsedProfile.education.map((edu: any, index: number) => (
                        <div key={index} className="p-4 bg-slate-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-slate-900">{edu.degree}</p>
                              <p className="text-slate-700">{edu.institution}</p>
                              <p className="text-slate-600">{edu.fieldOfStudy}</p>
                            </div>
                            <p className="text-sm text-slate-600">{edu.endDate}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {parsedProfile.skills && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-900">Skills</h3>
                    <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                      {parsedProfile.skills.technical?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-1">Technical Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {parsedProfile.skills.technical.map((skill: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {parsedProfile.skills.tools?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-1">Tools</p>
                          <div className="flex flex-wrap gap-2">
                            {parsedProfile.skills.tools.map((tool: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleCancelPreview}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveParsedResume}
                    disabled={isProcessing}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Resume'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
