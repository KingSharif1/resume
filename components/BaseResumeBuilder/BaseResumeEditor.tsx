'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ResumeProfile, 
  SectionType, 
  SECTION_CONFIGS, 
  createEmptyProfile,
  ContactInfo,
  Summary,
  WorkExperience,
  Education,
  Project,
  Skills,
  Certification,
  VolunteerExperience,
  Award,
  Publication
} from '@/lib/resume-schema';
import { TabNavigation } from './TabNavigation';
import { ContactForm } from './FormSections/ContactForm';
import { SummaryForm } from './FormSections/SummaryForm';
import { ExperienceForm } from './FormSections/ExperienceForm';
import { EducationForm } from './FormSections/EducationForm';
import { ProjectsForm } from './FormSections/ProjectsForm';
import { SkillsForm } from './FormSections/SkillsForm';
import { CertificationsForm } from './FormSections/CertificationsForm';
import { VolunteerForm } from './FormSections/VolunteerForm';
import { AwardsForm } from './FormSections/AwardsForm';
import { PublicationsForm } from './FormSections/PublicationsForm';
import { Save, Download, Eye, Wand2 } from 'lucide-react';

interface BaseResumeEditorProps {
  initialProfile?: ResumeProfile;
  onSave?: (profile: ResumeProfile) => void;
  onPreview?: (profile: ResumeProfile) => void;
  onAIOptimize?: (profile: ResumeProfile) => void;
}

export function BaseResumeEditor({ 
  initialProfile, 
  onSave, 
  onPreview, 
  onAIOptimize 
}: BaseResumeEditorProps) {
  const [profile, setProfile] = useState<ResumeProfile>(
    initialProfile || createEmptyProfile()
  );
  const [activeSection, setActiveSection] = useState<SectionType>('contact');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update profile and mark as changed
  const updateProfile = (updates: Partial<ResumeProfile>) => {
    setProfile(prev => ({
      ...prev,
      ...updates,
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString()
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Handle save
  const handleSave = () => {
    if (onSave) {
      onSave(profile);
      setHasUnsavedChanges(false);
    }
  };

  // Handle preview
  const handlePreview = () => {
    if (onPreview) {
      onPreview(profile);
    }
  };

  // Handle AI optimization
  const handleAIOptimize = () => {
    if (onAIOptimize) {
      onAIOptimize(profile);
    }
  };

  // Get completion status for each section
  const getSectionStatus = (sectionType: SectionType) => {
    switch (sectionType) {
      case 'contact':
        return profile.contact.firstName && profile.contact.lastName && profile.contact.email;
      case 'summary':
        return profile.summary?.content;
      case 'experience':
        return profile.experience.length > 0;
      case 'education':
        return profile.education.length > 0;
      case 'projects':
        return profile.projects.length > 0;
      case 'skills':
        return Object.values(profile.skills).some(skillArray => skillArray.length > 0);
      case 'certifications':
        return profile.certifications.length > 0;
      case 'volunteer':
        return profile.volunteer.length > 0;
      case 'awards':
        return profile.awards.length > 0;
      case 'publications':
        return profile.publications.length > 0;
      case 'languages':
        return profile.languages.length > 0;
      case 'references':
        return profile.references.length > 0;
      case 'interests':
        return profile.interests.length > 0;
      default:
        return false;
    }
  };

  // Render the active section form
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'contact':
        return (
          <ContactForm
            contact={profile.contact}
            onChange={(contact) => updateProfile({ contact })}
          />
        );
      case 'summary':
        return (
          <SummaryForm
            summary={profile.summary}
            onChange={(summary) => updateProfile({ summary })}
          />
        );
      case 'experience':
        return (
          <ExperienceForm
            experiences={profile.experience}
            onChange={(experience) => updateProfile({ experience })}
          />
        );
      case 'education':
        return (
          <EducationForm
            education={profile.education}
            onChange={(education) => updateProfile({ education })}
          />
        );
      case 'projects':
        return (
          <ProjectsForm
            projects={profile.projects}
            onChange={(projects) => updateProfile({ projects })}
          />
        );
      case 'skills':
        return (
          <SkillsForm
            skills={profile.skills}
            onChange={(skills) => updateProfile({ skills })}
          />
        );
      case 'certifications':
        return (
          <CertificationsForm
            certifications={profile.certifications}
            onChange={(certifications) => updateProfile({ certifications })}
          />
        );
      case 'volunteer':
        return (
          <VolunteerForm
            volunteer={profile.volunteer}
            onChange={(volunteer) => updateProfile({ volunteer })}
          />
        );
      case 'awards':
        return (
          <AwardsForm
            awards={profile.awards}
            onChange={(awards) => updateProfile({ awards })}
          />
        );
      case 'publications':
        return (
          <PublicationsForm
            publications={profile.publications}
            onChange={(publications) => updateProfile({ publications })}
          />
        );
      default:
        return <div>Section not implemented yet</div>;
    }
  };

  // Calculate overall completion percentage
  const getCompletionPercentage = () => {
    const completedSections = SECTION_CONFIGS.filter(section => 
      getSectionStatus(section.key)
    ).length;
    return Math.round((completedSections / SECTION_CONFIGS.length) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-slate-900">
                Resume Builder
              </h1>
              <Badge variant="outline" className="text-xs">
                {getCompletionPercentage()}% Complete
              </Badge>
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="text-xs">
                  Unsaved Changes
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleAIOptimize}>
                <Wand2 className="w-4 h-4 mr-2" />
                AI Optimize
              </Button>
              <Button variant="outline" size="sm" onClick={handlePreview}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TabNavigation
            sections={SECTION_CONFIGS}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            getSectionStatus={getSectionStatus}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {SECTION_CONFIGS.find(s => s.key === activeSection)?.label}
                </h2>
                <p className="text-sm text-slate-600">
                  {SECTION_CONFIGS.find(s => s.key === activeSection)?.description}
                </p>
              </div>
              {getSectionStatus(activeSection) && (
                <Badge variant="default" className="text-xs">
                  Completed
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {renderActiveSection()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
