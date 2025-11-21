'use client';

import { useState } from 'react';
import { ReziStyleEditor } from '@/components/BaseResumeBuilder/ReziStyleEditor';
import { FullPageResumePreview } from '@/components/FullPageResumePreview';
import { ResumeProfile, createEmptyProfile } from '@/lib/resume-schema';

interface SectionVisibility {
  [key: string]: boolean;
}

export default function TestBuilderPage() {
  const [profile, setProfile] = useState<ResumeProfile>(createEmptyProfile());
  const [showPreview, setShowPreview] = useState(false);
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>({
    contact: true,
    summary: true,
    experience: true,
    education: true,
    projects: true,
    skills: true,
    certifications: false,
    volunteer: false,
    awards: false,
    publications: false,
    languages: false,
    references: false,
    interests: false
  });

  const handleSave = (updatedProfile: ResumeProfile) => {
    console.log('Saving profile:', updatedProfile);
    setProfile(updatedProfile);
    // Here you would typically save to your database
    alert('Resume saved successfully!');
  };

  const handlePreview = (profile: ResumeProfile, visibility: SectionVisibility) => {
    console.log('Previewing profile:', profile);
    setProfile(profile);
    setSectionVisibility(visibility);
    setShowPreview(true);
  };

  const handleEditSection = (sectionKey: string) => {
    console.log('Editing section:', sectionKey);
    // This will be called when user clicks on a section in preview
    // The preview component will handle going back to editor
  };

  const handleAIOptimize = (profile: ResumeProfile) => {
    console.log('AI optimizing profile:', profile);
    // Here you would call your AI optimization service
    alert('AI optimization feature coming soon!');
  };

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
    <ReziStyleEditor
      initialProfile={profile}
      onSave={handleSave}
      onPreview={handlePreview}
      onAIOptimize={handleAIOptimize}
    />
  );
}
