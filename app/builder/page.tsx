'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReziStyleEditor } from '@/components/BaseResumeBuilder/ReziStyleEditor';
import { FullPageResumePreview } from '@/components/FullPageResumePreview';
import { ResumeProfile, createEmptyProfile } from '@/lib/resume-schema';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const [profile, setProfile] = useState<ResumeProfile>(initialProfile);
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>(initialSectionVisibility);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  // Load parsed profile from upload if available
  useEffect(() => {
    const fromUpload = searchParams.get('from') === 'upload';
    
    if (fromUpload) {
      const parsedProfileData = localStorage.getItem('parsedResumeProfile');
      if (parsedProfileData) {
        try {
          const parsedProfile = JSON.parse(parsedProfileData);
          setProfile(parsedProfile);
          // Clear the stored data
          localStorage.removeItem('parsedResumeProfile');
        } catch (error) {
          console.error('Error loading parsed profile:', error);
        }
      }
    }
    
    setIsLoading(false);
  }, [searchParams]);

  const handleSave = async (profile: ResumeProfile) => {
    if (!user) {
      alert('Please sign in to save your resume');
      return;
    }

    try {
      setProfile(profile);
      
      // Update metadata
      const updatedProfile = {
        ...profile,
        metadata: {
          ...profile.metadata,
          updatedAt: new Date().toISOString()
        }
      };

      // Save to database
      const response = await fetch('/api/resumes', {
        method: resumeId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: resumeId,
          profile: updatedProfile,
          userId: user.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save resume');
      }

      const result = await response.json();
      
      if (!resumeId) {
        setResumeId(result.id);
      }

      alert('Resume saved successfully!');
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('Failed to save resume. Please try again.');
    }
  };

  const handlePreview = (profile: ResumeProfile, visibility: SectionVisibility) => {
    console.log('Previewing profile:', profile);
    setProfile(profile);
    setSectionVisibility(visibility);
    setShowPreview(true);
  };

  const handleEditSection = (sectionKey: string) => {
    console.log('Editing section:', sectionKey);
    setShowPreview(false);
    // TODO: Navigate to specific section in editor
  };

  const handleAIOptimize = (profile: ResumeProfile) => {
    console.log('AI optimizing profile:', profile);
    // TODO: Implement AI optimization
    alert('AI optimization feature coming soon!');
  };

  const handleUploadResume = () => {
    setShowUpload(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading resume builder...</p>
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
    <div className="min-h-screen bg-slate-50">
      <ReziStyleEditor
        initialProfile={profile}
        onSave={handleSave}
        onPreview={handlePreview}
        onAIOptimize={handleAIOptimize}
        onUploadResume={handleUploadResume}
      />
    </div>
  );
}
