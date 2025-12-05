'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ResumeProfile, SectionType, SECTION_CONFIGS, createEmptyProfile } from '@/lib/resume-schema';
import { calculateResumeScore } from '@/lib/resume-score';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles, Settings, Download, ChevronDown, ChevronRight, Check, Upload, Briefcase, FileText, GripVertical
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FullPageResumePreview } from '@/components/FullPageResumePreview';

// Import form components
import { ContactForm } from './FormSections/ContactForm';
import { SummaryForm } from './FormSections/SummaryForm';
import { DraggableExperienceForm } from './FormSections/DraggableExperienceForm';
import { EducationForm } from './FormSections/EducationForm';
import { ProjectsForm } from './FormSections/ProjectsForm';
import { SkillsForm } from './FormSections/SkillsForm';
import { LanguagesForm } from './FormSections/LanguagesForm';
import { CertificationsForm } from './FormSections/CertificationsForm';
import { VolunteerForm } from './FormSections/VolunteerForm';
import { AwardsForm } from './FormSections/AwardsForm';
import { PublicationsForm } from './FormSections/PublicationsForm';
import { ReferencesForm } from './FormSections/ReferencesForm';
import { InterestsForm } from './FormSections/InterestsForm';
import { LayoutStyleEditor } from './LayoutStyleEditor';
import { AIChatWidget } from './AIChatWidget';
import { UnifiedAnalysisPanel } from './UnifiedAnalysisPanel';
import { EnhancedAISuggestions } from './EnhancedAISuggestions';
import { TemplateModal } from './TemplateModal';
import { useResumeSettings } from '@/lib/resume-settings-context';

interface SectionVisibility {
    [key: string]: boolean;
}

interface NewResumeBuilderProps {
    initialProfile?: ResumeProfile;
    onSave: (profile: ResumeProfile) => void;
    onPreview: (profile: ResumeProfile, sectionVisibility: SectionVisibility) => void;
    onAIOptimize: (profile: ResumeProfile) => void;
    onUploadResume?: () => void;
}

export function NewResumeBuilder({
    initialProfile,
    onSave,
    onPreview,
    onAIOptimize,
    onUploadResume
}: NewResumeBuilderProps) {
    const [profile, setProfile] = useState<ResumeProfile>(initialProfile || createEmptyProfile());
    const [resumeName, setResumeName] = useState("Untitled Resume");
    const [zoomLevel, setZoomLevel] = useState(70);
    const [isResumeAnalysisOpen, setIsResumeAnalysisOpen] = useState(true);
    const [openSections, setOpenSections] = useState<Set<SectionType>>(new Set<SectionType>(['contact']));
    const [isLayoutStyleEditorOpen, setIsLayoutStyleEditorOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
    const [isDesktop, setIsDesktop] = useState(true);

    useEffect(() => {
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    // Resizable Panel State
    const [leftPanelWidth, setLeftPanelWidth] = useState(50); // Percentage
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

        // Limit width between 30% and 70%
        if (newWidth >= 30 && newWidth <= 70) {
            setLeftPanelWidth(newWidth);
        }
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>({
        contact: true,
        summary: true,
        experience: true,
        education: true,
        projects: true,
        skills: true,
        certifications: true,
        volunteer: true,
        awards: false,
        publications: false,
        languages: true,
        references: true,
        interests: false
    });

    // Get settings from context
    const { settings, updateSettings, updateFontSettings, updateThemeSettings } = useResumeSettings();

    useEffect(() => {
        if (initialProfile) {
            console.log('[NewResumeBuilder] Received new initialProfile:', {
                contact: initialProfile.contact,
                education: initialProfile.education?.length,
                experience: initialProfile.experience?.length,
                certifications: initialProfile.certifications?.length
            });
            setProfile(initialProfile);
            if (initialProfile.resumeName) {
                setResumeName(initialProfile.resumeName);
            }
        }
    }, [initialProfile]);

    const updateProfile = (updates: Partial<ResumeProfile>) => {
        setProfile(prev => ({ ...prev, ...updates }));
    };

    const toggleSection = (sectionKey: SectionType) => {
        setOpenSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sectionKey)) {
                newSet.delete(sectionKey);
            } else {
                newSet.add(sectionKey);
            }
            return newSet;
        });
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

    // Calculate resume score
    const { totalScore, maxTotalScore, categories } = calculateResumeScore(profile);
    const resumeScorePercentage = Math.round((totalScore / maxTotalScore) * 100);

    // Update profile with settings before saving
    const handleSave = () => {
        const profileWithSettings = {
            ...profile,
            resumeName,
            settings: settings as any,
            targetJob: profile.targetJob
        };
        onSave(profileWithSettings);
    };

    if (isLayoutStyleEditorOpen) {
        return (
            <LayoutStyleEditor
                profile={profile}
                onBack={() => setIsLayoutStyleEditorOpen(false)}
            />
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Global Header */}
            <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                            CV
                        </div>
                        <Input
                            value={resumeName}
                            onChange={(e) => setResumeName(e.target.value)}
                            className="border-transparent hover:border-slate-200 focus:border-blue-500 shadow-none focus-visible:ring-0 font-semibold text-lg px-2 w-full max-w-[300px] transition-all"
                            placeholder="Untitled Resume"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 lg:gap-3">
                    {onUploadResume && (
                        <Button variant="ghost" size="sm" onClick={onUploadResume} className="hidden sm:flex text-slate-600">
                            <Upload className="w-4 h-4 mr-2" />
                            Import
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className={`hidden sm:flex transition-colors ${isChatOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}`}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Tailor AI
                    </Button>

                    <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                    <Button variant="ghost" size="sm" onClick={handleSave} className="text-slate-600">
                        Save
                    </Button>
                    <Button variant="default" size="sm" onClick={handleSave} className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </Button>
                </div>
            </header>

            {/* Mobile Tab Navigation */}
            <div className="lg:hidden flex bg-white border-b border-slate-200 px-4 py-2 gap-2">
                <button
                    onClick={() => setMobileTab('editor')}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 ${mobileTab === 'editor'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                >
                    ✏️ Edit Sections
                </button>
                <button
                    onClick={() => setMobileTab('preview')}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 ${mobileTab === 'preview'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                >
                    👁️ Preview
                </button>
            </div>

            {/* Main Split Layout */}
            <div className="flex-1 flex overflow-hidden" ref={containerRef}>
                {/* Left Panel */}
                <div
                    className={`
                        border-r border-slate-200 
                        bg-white 
                        overflow-y-auto 
                        h-full
                        ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}
                    `}
                    style={{ width: isDesktop ? `${leftPanelWidth}%` : '100%' }}
                >
                    <div className="max-w-3xl mx-auto py-6 px-6">

                        {/* Target Job Section */}
                        <div className="mb-4">
                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                        <Briefcase className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900">Target Job</h3>
                                        <p className="text-xs text-slate-500">Tailor your resume to a specific role</p>
                                    </div>
                                </div>
                                <Input
                                    value={profile.targetJob || ''}
                                    onChange={(e) => updateProfile({ targetJob: e.target.value })}
                                    placeholder="e.g., Senior Software Engineer at Google"
                                    className="text-sm"
                                />
                            </div>
                        </div>


                        {/* Unified Analysis Panel */}
                        <UnifiedAnalysisPanel profile={profile} onUpdateProfile={updateProfile} />

                        {/* Resume Sections */}
                        <div className="space-y-1">
                            {SECTION_CONFIGS.filter(section => sectionVisibility[section.key]).map((section) => {
                                const isOpen = openSections.has(section.key);
                                const isComplete = getSectionStatus(section.key);

                                return (
                                    <div key={section.key} className="border-b border-slate-100 last:border-0">
                                        <button
                                            onClick={() => toggleSection(section.key)}
                                            className="w-full flex items-center justify-between py-4 px-4 hover:bg-slate-50 rounded-xl transition-all duration-200 text-left group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <ChevronRight className={`w-4 h-4 text-slate-600 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
                                                <span className={`text-sm font-semibold transition-colors duration-200 ${isOpen ? 'text-blue-600' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                                    {section.label}
                                                </span>
                                                {isComplete && (
                                                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-1 rounded-full shadow-sm">
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </div>
                                        </button>

                                        {isOpen && (
                                            <div className="pt-2 pb-4 px-4 animate-in fade-in slide-in-from-top-2 duration-300">
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
                                                        case 'certifications':
                                                            return <CertificationsForm certifications={profile.certifications} onChange={(certifications) => updateProfile({ certifications })} />;
                                                        case 'volunteer':
                                                            return <VolunteerForm volunteer={profile.volunteer} onChange={(volunteer) => updateProfile({ volunteer })} />;
                                                        case 'awards':
                                                            return <AwardsForm awards={profile.awards} onChange={(awards) => updateProfile({ awards })} />;
                                                        case 'publications':
                                                            return <PublicationsForm publications={profile.publications} onChange={(publications) => updateProfile({ publications })} />;
                                                        case 'references':
                                                            return <ReferencesForm references={profile.references} onChange={(references) => updateProfile({ references })} />;
                                                        case 'interests':
                                                            return <InterestsForm interests={profile.interests} onChange={(interests) => updateProfile({ interests })} />;
                                                        default:
                                                            return <div className="text-slate-400 italic py-4 text-center">Section coming soon...</div>;
                                                    }
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Draggable Divider */}
                <div
                    className={`hidden lg:flex w-4 items-center justify-center cursor-col-resize hover:bg-slate-100 active:bg-blue-50 transition-colors z-20 -ml-2 mr-[-8px] relative select-none ${isDragging ? 'bg-blue-50' : ''}`}
                    onMouseDown={handleMouseDown}
                >
                    <div className={`w-1 h-8 rounded-full transition-colors ${isDragging ? 'bg-blue-400' : 'bg-slate-300'}`} />
                </div>

                {/* Right Panel: Enhanced Preview */}
                <div
                    className={`
                        bg-slate-50 
                        flex flex-col 
                        h-full
                        ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}
                    `}
                    style={{ width: isDesktop ? `${100 - leftPanelWidth}%` : '100%' }}
                >
                    {/* Preview Area */}
                    <div className="flex-1 overflow-y-auto overflow-x-auto p-4 lg:p-8 relative flex flex-col items-center bg-gradient-to-br from-slate-50 to-slate-100">
                        {/* Dot pattern background */}
                        <div className="absolute inset-0 opacity-30" style={{
                            backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }} />

                        <div className="relative z-10 w-full flex justify-center">
                            <FullPageResumePreview
                                profile={profile}
                                sectionVisibility={sectionVisibility}
                                isSplitView={true}
                                onTemplateChange={() => setIsTemplateModalOpen(true)}
                                onLayoutChange={() => setIsLayoutStyleEditorOpen(true)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Template Modal */}
            <TemplateModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                onSelectTemplate={(template) => console.log('Selected template:', template)}
            />

            {/* Floating AI Chat Widget */}
            <AIChatWidget
                resumeId={profile.id}
                profile={profile}
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
            />
        </div>
    );
}
