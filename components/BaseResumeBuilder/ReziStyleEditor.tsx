'use client';

import { useState, useEffect } from 'react';
import { ResumeProfile, SectionType, SECTION_CONFIGS, createEmptyProfile } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Save, Eye, Sparkles, Settings, Download, Share, 
  GripVertical, Plus, ChevronDown, ChevronRight, Upload
} from 'lucide-react';

// Import form components
import { ContactForm } from './FormSections/ContactForm';
import { SummaryForm } from './FormSections/SummaryForm';
import { DraggableExperienceForm } from './FormSections/DraggableExperienceForm';
import { EducationForm } from './FormSections/EducationForm';
import { ProjectsForm } from './FormSections/ProjectsForm';
import { SkillsForm } from './FormSections/SkillsForm';
import { LanguagesForm } from './FormSections/LanguagesForm';

interface SectionVisibility {
  [key: string]: boolean;
}

interface ReziStyleEditorProps {
  initialProfile?: ResumeProfile;
  onSave: (profile: ResumeProfile) => void;
  onPreview: (profile: ResumeProfile, sectionVisibility: SectionVisibility) => void;
  onAIOptimize: (profile: ResumeProfile) => void;
  onUploadResume?: () => void;
}

export function ReziStyleEditor({ 
  initialProfile, 
  onSave, 
  onPreview, 
  onAIOptimize,
  onUploadResume
}: ReziStyleEditorProps) {
  const [profile, setProfile] = useState<ResumeProfile>(initialProfile || createEmptyProfile());
  const [activeSection, setActiveSection] = useState<SectionType>('contact');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update profile when initialProfile changes (e.g., from parsed resume)
  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      setHasUnsavedChanges(false);
    }
  }, [initialProfile]);
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

  const updateProfile = (updates: Partial<ResumeProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    onSave(profile);
    setHasUnsavedChanges(false);
  };

  const toggleSectionVisibility = (sectionKey: SectionType) => {
    setSectionVisibility(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const getSectionStatus = (section: SectionType): boolean => {
    switch (section) {
      case 'contact':
        return !!(profile.contact.firstName && profile.contact.lastName && profile.contact.email);
      case 'summary':
        return !!(profile.summary?.content);
      case 'experience':
        return profile.experience.length > 0;
      case 'education':
        return profile.education.length > 0;
      case 'projects':
        return profile.projects.length > 0;
      case 'skills':
        return Object.values(profile.skills).some(skillArray => skillArray.length > 0);
      case 'languages':
        return profile.languages.length > 0;
      default:
        return false;
    }
  };

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
          <DraggableExperienceForm
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
      case 'languages':
        return (
          <LanguagesForm
            languages={profile.languages}
            onChange={(languages) => updateProfile({ languages })}
          />
        );
      default:
        return <div className="p-8 text-center text-slate-500">Section coming soon...</div>;
    }
  };

  const visibleSections = SECTION_CONFIGS.filter(section => sectionVisibility[section.key]);
  const completedSections = visibleSections.filter(section => getSectionStatus(section.key));
  const completionPercentage = Math.round((completedSections.length / visibleSections.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Enhanced Top Navigation */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        {/* Section Toggles Row - Compact like Rezi */}
        <div className="border-b border-slate-100 px-4 py-2 bg-slate-50/50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-medium text-slate-600">Resume Sections:</span>
              <div className="flex items-center gap-2">
                {/* Show only core sections in compact view */}
                {SECTION_CONFIGS.slice(0, 6).map((section) => (
                  <label key={section.key} className="flex items-center space-x-1 cursor-pointer group whitespace-nowrap">
                    <Checkbox
                      checked={sectionVisibility[section.key]}
                      onCheckedChange={() => toggleSectionVisibility(section.key)}
                      className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-3 w-3"
                    />
                    <span className="text-xs text-slate-600 group-hover:text-slate-800 transition-colors">
                      {section.label}
                    </span>
                    {getSectionStatus(section.key) && (
                      <span className="text-green-600 text-xs">✓</span>
                    )}
                  </label>
                ))}
                {/* Show remaining sections in a dropdown or compact way */}
                {SECTION_CONFIGS.length > 6 && (
                  <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-300">
                    {SECTION_CONFIGS.slice(6).map((section) => (
                      <label key={section.key} className="flex items-center space-x-1 cursor-pointer group">
                        <Checkbox
                          checked={sectionVisibility[section.key]}
                          onCheckedChange={() => toggleSectionVisibility(section.key)}
                          className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-3 w-3"
                        />
                        <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">
                          {section.label}
                        </span>
                        {getSectionStatus(section.key) && (
                          <span className="text-green-600 text-xs">✓</span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-slate-600">Progress:</span>
              <Badge className="bg-blue-600 text-white px-2 py-0.5 text-xs font-semibold">
                {completionPercentage}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Navigation Row */}
        <div className="px-4 py-3 bg-white">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-1 overflow-x-auto flex-1 mr-4">
              {/* Only show enabled sections in main nav with scrollable container */}
              {SECTION_CONFIGS.filter(section => sectionVisibility[section.key]).map((section) => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    activeSection === section.key
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {section.label}
                  {getSectionStatus(section.key) && (
                    <span className={`ml-1 text-xs ${activeSection === section.key ? 'text-green-200' : 'text-green-600'}`}>✓</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {onUploadResume && (
                <Button 
                  onClick={onUploadResume} 
                  variant="outline" 
                  size="sm"
                  className="border-slate-300 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Upload
                </Button>
              )}
              <Button 
                onClick={handleSave} 
                size="sm" 
                disabled={!hasUnsavedChanges}
                className="bg-green-600 hover:bg-green-700 text-white font-medium"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button 
                onClick={() => onPreview(profile, sectionVisibility)} 
                variant="outline" 
                size="sm"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium"
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
              <Button 
                onClick={() => onAIOptimize(profile)} 
                variant="outline" 
                size="sm"
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-medium"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                AI Optimize
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">
        {/* Main Content Area - Full Width */}
        <div className="flex-1">
          {/* Editor Panel */}
          <div className="max-w-6xl mx-auto p-6">
            <Card>
              <CardContent className="p-8">
                {renderActiveSection()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
