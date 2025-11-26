'use client';

import { useState } from 'react';
import { NewResumeBuilder } from '@/components/BaseResumeBuilder/NewResumeBuilder';
import { ResumeProfile, createEmptyProfile } from '@/lib/resume-schema';

export default function TestNewBuilderPage() {
    const [profile, setProfile] = useState<ResumeProfile>(createEmptyProfile());

    return (
        <div className="w-full h-screen">
            <NewResumeBuilder
                initialProfile={profile}
                onSave={(updatedProfile) => {
                    setProfile(updatedProfile);
                    console.log('Saved:', updatedProfile);
                }}
                onPreview={(profile, visibility) => {
                    console.log('Preview:', profile, visibility);
                }}
                onAIOptimize={(profile) => {
                    console.log('AI Optimize:', profile);
                }}
            />
        </div>
    );
}
