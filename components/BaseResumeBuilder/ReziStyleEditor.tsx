'use client';

import { useState, useEffect } from 'react';
import { ResumeProfile, SectionType, SECTION_CONFIGS, createEmptyProfile } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Save, Eye, Sparkles, Settings, Download, Share,
  GripVertical, Plus, ChevronDown, ChevronRight, Upload, Check
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FullPageResumePreview } from '@/components/FullPageResumePreview';

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
  const [resumeTitle, setResumeTitle] = useState("Untitled Resume");

  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>(
    SECTION_CONFIGS.reduce((acc, section) => ({ ...acc, [section.key]: true }), {})
  );

  const updateProfile = (updates: Partial<ResumeProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  // Update profile when initialProfile changes (e.g., from parsed resume)
  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      setHasUnsavedChanges(false);
    }
  }, [initialProfile]);

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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="bg-card border-b border-border h-16 flex-none z-30">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Left: Editable Title & Progress */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <input
                  type="text"
                  value={resumeTitle}
                  onChange={(e) => {
                    setResumeTitle(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Untitled Resume"
                  className="text-lg font-semibold text-foreground bg-transparent border-b-2 border-transparent hover:border-border focus:border-blue-500 outline-none transition-colors px-1 -mx-1"
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>Completion:</span>
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-24 bg-accent rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                    <span className="font-medium text-foreground">{completionPercentage}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {onUploadResume && (
                <Button
                  onClick={onUploadResume}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              )}

              <div className="h-6 w-px bg-border mx-1" />

              <Button
                onClick={() => onAIOptimize(profile)}
                variant="outline"
                size="sm"
                className="border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-800 dark:hover:text-purple-300"
              >
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                AI Optimize
              </Button>

              <Button
                onClick={handleSave}
                size="sm"
                disabled={!hasUnsavedChanges}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Editor (Scrollable) */}
        <div className="w-1/2 border-r border-border bg-card overflow-y-auto">
          <div className="max-w-3xl mx-auto p-6 space-y-6">
            <Accordion type="single" collapsible className="w-full space-y-4" value={activeSection} onValueChange={(val) => val && setActiveSection(val as SectionType)}>
              {SECTION_CONFIGS.filter(section => sectionVisibility[section.key]).map((section) => (
                <AccordionItem key={section.key} value={section.key} className="border border-border rounded-lg bg-card px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-medium ${activeSection === section.key ? 'text-primary' : 'text-foreground'}`}>
                        {section.label}
                      </span>
                      {getSectionStatus(section.key) && (
                        <div className="bg-green-100 text-green-700 p-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-6">
                    {/* Render the form for this section */}
                    {(() => {
                      switch (section.key) {
                        case 'contact':
                          return <ContactForm contact={profile.contact} onChange={(contact) => updateProfile({ contact })} />;
                        case 'summary':
                          return <SummaryForm summary={profile.summary} onChange={(summary) => updateProfile({ summary })} />;
                        case 'experience':
                          return <DraggableExperienceForm experiences={profile.experience} onChange={(experience) => updateProfile({ experience })} />;
                        case 'education':
                          return <EducationForm education={profile.education} onChange={(education) => updateProfile({ education })} />;
                        case 'projects':
                          return <ProjectsForm projects={profile.projects} onChange={(projects) => updateProfile({ projects })} />;
                        case 'skills':
                          return <SkillsForm skills={profile.skills} onChange={(skills) => updateProfile({ skills })} />;
                        case 'languages':
                          return <LanguagesForm languages={profile.languages} onChange={(languages) => updateProfile({ languages })} />;
                        default:
                          return <div className="text-muted-foreground">Section coming soon...</div>;
                      }
                    })()}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Add Section Button */}
            <div className="pt-4 border-t border-border">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full border-dashed">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Section
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56">
                  <DropdownMenuLabel>Add to Resume</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {SECTION_CONFIGS.filter(section => !sectionVisibility[section.key]).map((section) => (
                    <DropdownMenuItem
                      key={section.key}
                      onClick={() => toggleSectionVisibility(section.key)}
                    >
                      {section.label}
                    </DropdownMenuItem>
                  ))}
                  {SECTION_CONFIGS.every(section => sectionVisibility[section.key]) && (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      All sections added
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Right Panel: Preview (Sticky/Fixed) */}
        <div className="w-1/2 bg-slate-100 overflow-y-auto flex items-start justify-center p-8">
          <div className="origin-top scale-[0.85] shadow-2xl">
            <FullPageResumePreview
              profile={profile}
              sectionVisibility={sectionVisibility}
              isSplitView={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
