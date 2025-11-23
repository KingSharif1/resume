'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ReziStyleEditor } from '@/components/BaseResumeBuilder/ReziStyleEditor';
import { FullPageResumePreview } from '@/components/FullPageResumePreview';
import { ResumeProfile, createEmptyProfile } from '@/lib/resume-schema';
import { ResumeUploadModal } from '@/components/ResumeUploadModal';
import toast from 'react-hot-toast';

interface SectionVisibility {
  [key: string]: boolean;
}

const initialProfile: ResumeProfile = createEmptyProfile();

const initialSectionVisibility: SectionVisibility = {
  contact: true,
  summary: true,
  experience: true,
  education: true,
  skills: true,
  projects: true,
  certifications: false,
  languages: false
};

export default function BuilderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<ResumeProfile>(createEmptyProfile());
  const [sectionVisibility, setSectionVisibility] = useState<any>({});
  const [showPreview, setShowPreview] = useState(false);
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
                skills: data.resume.skills || { technical: [], soft: [], tools: [] },
                languages: [], // TODO: Add to DB schema
                projects: data.resume.projects || [],
                certifications: data.resume.certifications || [],
                volunteer: [],
                awards: [],
                publications: [],
                references: [],
                interests: [],
                customSections: [],
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
    }
  }, [searchParams, user, loading, router]);

  const handleSave = async (updatedProfile: ResumeProfile) => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: updatedProfile,
          userId: user.id
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      const data = await response.json();
      toast.success('Resume saved successfully');

      // Update URL with new ID if it was a new resume
      if (!searchParams.get('id') && data.resume.id) {
        router.replace(`/builder?id=${data.resume.id}`);
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume');
    }
  };

  const handlePreview = (currentProfile: ResumeProfile, visibility: any) => {
    console.log('Previewing profile:', currentProfile);
    setProfile(currentProfile);
    setSectionVisibility(visibility);
    setShowPreview(true);
  };

  const handleEditSection = (section: string) => {
    console.log('Editing section:', section);
    setShowPreview(false);
    // You might want to pass the active section to ReziStyleEditor
    // For now, just closing preview returns to editor
  };

  const handleAIOptimize = async (currentProfile: ResumeProfile) => {
    toast('AI Optimization coming soon!', {
      icon: '✨',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  const handleUploadComplete = (uploadedProfile: ResumeProfile) => {
    setProfile(uploadedProfile);
    setIsUploadModalOpen(false);
    toast.success('Resume imported! Review and edit in the preview panel →');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading resume builder...</p>
        </div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <FullPageResumePreview
        profile={profile}
        sectionVisibility={sectionVisibility}
        onBack={() => setShowPreview(false)}
        onEditSection={handleEditSection}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ReziStyleEditor
        initialProfile={profile}
        onSave={handleSave}
        onPreview={handlePreview}
        onAIOptimize={handleAIOptimize}
        onUploadResume={() => setIsUploadModalOpen(true)}
      />

      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
