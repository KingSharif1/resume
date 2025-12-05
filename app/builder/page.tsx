'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { NewResumeBuilder } from '@/components/BaseResumeBuilder/NewResumeBuilder';
import { ResumeProfile, createEmptyProfile } from '@/lib/resume-schema';
import { resumeParser } from '@/lib/services/resume-parser';
import { ResumeUploadModal } from '@/components/ResumeUploadModal';
import { ResumeSettingsProvider } from '@/lib/resume-settings-context';
import toast from 'react-hot-toast';

export default function BuilderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<ResumeProfile>(createEmptyProfile());
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    const loadResume = async () => {
      const resumeId = searchParams.get('id');
      if (resumeId && user?.id) {
        try {
          const response = await fetch(`/api/resumes?id=${resumeId}&userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.resume) {
              // Transform DB data to ResumeProfile
              const loadedProfile: ResumeProfile = {
                id: data.resume.id,
                contact: data.resume.contact_info,
                summary: { content: data.resume.summary },
                experience: data.resume.experience || [],
                education: data.resume.education || [],
                skills: data.resume.skills || {},
                languages: [], // TODO: Add to DB schema
                projects: data.resume.projects || [],
                certifications: data.resume.certifications || [],
                volunteer: [],
                awards: [],
                publications: [],
                references: [],
                interests: [],
                customSections: [],
                settings: data.resume.settings || undefined,
                targetJob: data.resume.target_job || '',
                resumeName: data.resume.title || 'Untitled Resume',
                metadata: {
                  createdAt: data.resume.created_at,
                  updatedAt: data.resume.updated_at,
                  version: '1.0.0'
                }
              };
              setProfile(loadedProfile);
            }
          }
        } catch (error) {
          console.error('Error loading resume:', error);
          toast.error('Failed to load resume');
        }
      }
      setIsLoading(false);
    };

    if (user) {
      loadResume();
    } else if (!loading) {
      // If no user but done loading, stop spinner (will redirect anyway)
      setIsLoading(false);
    }
  }, [searchParams, user, loading, router]);

  const handleSave = async (updatedProfile: ResumeProfile) => {
    if (!user?.id) {
      toast.error('You must be logged in to save.');
      return;
    }

    try {
      const isNew = !updatedProfile.id;
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch('/api/resumes', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: updatedProfile.id, // Required for PUT
          profile: updatedProfile,
          userId: user.id
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      const data = await response.json();
      toast.success('Resume saved successfully');

      // Update profile with returned ID/timestamp
      if (isNew && data.id) {
        setProfile(prev => ({ ...prev, id: data.id }));
        // Update URL without reload
        const newUrl = `/builder?id=${data.id}`;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume');
    }
  };

  const handlePreview = (currentProfile: ResumeProfile, visibility: any) => {
    // NewResumeBuilder handles preview internally via LayoutStyleEditor or side panel
    console.log('Preview requested', currentProfile);
  };

  const handleAIOptimize = (currentProfile: ResumeProfile) => {
    toast.success('AI optimization feature coming soon!');
  };

  const handleUploadResume = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadComplete = (uploadedProfile: ResumeProfile) => {
    setProfile(uploadedProfile);
    setIsUploadModalOpen(false);
    toast.success('Resume imported! Review and edit in the builder.');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Loading resume builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-slate-50">
      <ResumeSettingsProvider initialSettings={profile.settings as any}>
        <NewResumeBuilder
          initialProfile={profile}
          onSave={handleSave}
          onPreview={handlePreview}
          onAIOptimize={handleAIOptimize}
          onUploadResume={handleUploadResume}
        />
      </ResumeSettingsProvider>

      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
