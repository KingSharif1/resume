'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Upload, X, Loader2, Search, FileText, Trash2, Copy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { FolderCard } from '@/components/Dashboard/FolderCard';
import { ResumeUploadModal } from '@/components/ResumeUploadModal';
import { TailorResumeModal } from '@/components/Dashboard/TailorResumeModal';

export interface BaseResume {
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
  target_job?: string;
  settings?: any;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [baseResumes, setBaseResumes] = useState<BaseResume[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [parsedProfile, setParsedProfile] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTailorModal, setShowTailorModal] = useState(false);
  const [selectedBaseResumeId, setSelectedBaseResumeId] = useState<string | undefined>();

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

  const toggleStar = async (id: string, currentStatus: boolean) => {
    if (!user?.id) return;

    // Optimistic update
    const updatedResumes = baseResumes.map(r =>
      r.id === id ? { ...r, is_starred: !currentStatus } : r
    );

    // Check limit (max 3 starred)
    const starredCount = updatedResumes.filter(r => r.is_starred).length;
    if (starredCount > 3 && !currentStatus) {
      toast.error('You can only pin up to 3 resumes');
      return;
    }

    setBaseResumes(updatedResumes);

    try {
      const response = await fetch('/api/resumes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          userId: user.id,
          is_starred: !currentStatus
        })
      });

      if (!response.ok) throw new Error('Failed to update pin status');

      // Reload to ensure sync/sort
      loadResumes();
    } catch (error) {
      console.error('Error toggling star:', error);
      toast.error('Failed to update pin status');
      // Revert on error
      loadResumes();
    }
  };

  const updateResumeTitle = async (id: string, newTitle: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/resumes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          userId: user.id,
          title: newTitle
        })
      });

      if (!response.ok) throw new Error('Failed to update title');

      // Reload to sync
      loadResumes();
    } catch (error) {
      console.error('Error updating title:', error);
      throw error;
    }
  };

  const deleteResume = async (id: string) => {
    const resumeToDelete = baseResumes.find(r => r.id === id);
    if (!resumeToDelete) return;
    if (!user?.id) return;

    // Show custom confirmation toast
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-500" />
          <span className="font-medium">Delete "{resumeToDelete.title}"?</span>
        </div>
        <p className="text-sm text-slate-600">This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const response = await fetch(`/api/resumes?id=${id}&userId=${user.id}`, {
                  method: 'DELETE'
                });

                if (!response.ok) {
                  throw new Error('Failed to delete resume');
                }

                toast.success(`"${resumeToDelete.title}" has been deleted`, {
                  icon: '🗑️',
                });
                loadResumes();
              } catch (error) {
                console.error('Error deleting resume:', error);
                toast.error('Failed to delete resume');
              }
            }}
            className="px-3 py-1.5 text-sm bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
      style: {
        maxWidth: '400px',
      },
    });
  };

  const duplicateResume = async (id: string) => {
    const resumeToDuplicate = baseResumes.find(r => r.id === id);
    if (!resumeToDuplicate || !user?.id) return;

    try {
      const duplicatedProfile = {
        contact: resumeToDuplicate.contact_info,
        summary: { content: resumeToDuplicate.summary },
        experience: resumeToDuplicate.experience,
        education: resumeToDuplicate.education,
        skills: resumeToDuplicate.skills,
        certifications: resumeToDuplicate.certifications,
        projects: resumeToDuplicate.projects,
        customSections: resumeToDuplicate.custom_sections,
        settings: resumeToDuplicate.settings,
        targetJob: resumeToDuplicate.target_job,
        resumeName: `${resumeToDuplicate.title} (Copy)`,
      };

      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: duplicatedProfile,
          userId: user.id
        }),
      });

      if (!response.ok) throw new Error('Failed to duplicate resume');

      toast.success(`Created "${resumeToDuplicate.title} (Copy)"`, {
        icon: '📋',
      });
      loadResumes();
    } catch (error) {
      console.error('Error duplicating resume:', error);
      toast.error('Failed to duplicate resume');
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

  const filteredResumes = baseResumes.filter(resume =>
    resume.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">

        {/* Header Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Resumes</h1>
              <p className="text-slate-500 mt-1">Manage your base resumes and tailored applications</p>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search base resumes..."
                className="pl-10 bg-white border-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Base Resumes Grid */}
          <div>

            {filteredResumes.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h3 className="text-lg font-medium text-slate-900">No resumes found</h3>
                <p className="text-slate-500 mb-6">Get started by creating your first resume folder</p>
                <Button onClick={() => router.push('/builder')} variant="outline">
                  Create Folder
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {/* New Folder Card */}
                <div
                  onClick={() => router.push('/builder')}
                  className="relative group cursor-pointer"
                >
                  {/* Tab Layer */}
                  <div className="absolute -top-2 left-6 w-28 h-6 bg-slate-300/70 rounded-t-lg z-30" />

                  {/* White Paper Layer */}
                  <div className="absolute top-4 left-0 right-0 bg-white/90 rounded-2xl shadow-sm z-10" style={{ height: 'calc(100% - 16px)' }} />

                  {/* Main Body */}
                  <div className="relative bg-slate-100/40 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden z-20 group-hover:-translate-y-2">
                    <div className="p-6 pt-8 min-h-[180px] flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-400 group-hover:bg-blue-500 rounded-full flex items-center justify-center mb-4 transition-all duration-300 shadow-md">
                        <Plus className="w-8 h-8 text-white transition-colors duration-300" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-700 group-hover:text-blue-600 transition-colors mb-1">New Folder</h3>
                      <p className="text-xs text-slate-500">Create from scratch</p>
                    </div>
                  </div>
                </div>

                {/* Existing Folders */}
                {filteredResumes.map((resume, index) => (
                  <FolderCard
                    key={resume.id}
                    resume={resume}
                    tailoredResumes={[]} // TODO: Fetch tailored resumes when backend is ready
                    onEdit={(id) => router.push(`/builder?id=${id}`)}
                    onUpdateTitle={updateResumeTitle}
                    onTailorClick={(baseId: string) => {
                      setSelectedBaseResumeId(baseId);
                      setShowTailorModal(true);
                    }}
                    colorIndex={index}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upload Modal - Replaced with shared component */}
        <ResumeUploadModal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          onUploadComplete={(profile) => {
            setParsedProfile(profile);
            setShowPreview(true);
            setShowUpload(false);
          }}
        />

        {/* Tailor Resume Modal */}
        <TailorResumeModal
          isOpen={showTailorModal}
          onClose={() => {
            setShowTailorModal(false);
            setSelectedBaseResumeId(undefined);
          }}
          baseResumes={baseResumes}
          selectedBaseResumeId={selectedBaseResumeId}
        />

        {/* Preview Modal */}
        {showPreview && parsedProfile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
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
