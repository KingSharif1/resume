'use client';

import { useState, useEffect } from 'react';
import { ResumeProfile, SectionType, SECTION_CONFIGS, createEmptyProfile } from '@/lib/resume-schema';
import { calculateResumeScore } from '@/lib/resume-score';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles, Settings, Download, ChevronDown, ChevronRight, Check
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { LayoutPanel } from './LayoutPanel';
import { TemplateModal } from './TemplateModal';

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
    const [zoomLevel, setZoomLevel] = useState(50);
    const [isResumeAnalysisOpen, setIsResumeAnalysisOpen] = useState(true);
    const [openSections, setOpenSections] = useState<Set<SectionType>>(new Set<SectionType>(['contact']));
    const [isLayoutPanelOpen, setIsLayoutPanelOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

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

    useEffect(() => {
        if (initialProfile) {
            setProfile(initialProfile);
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

    return (
        <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 h-14 flex-none z-30 shadow-sm">
                <div className="max-w-full mx-auto px-6 h-full">
                    <div className="flex items-center justify-between h-full">
                        {/* Left: Resume Name */}
                        <div className="flex items-center gap-4">
                            <input
                                type="text"
                                value={resumeName}
                                onChange={(e) => setResumeName(e.target.value)}
                                className="text-base font-medium text-slate-900 bg-transparent border-none outline-none hover:bg-slate-50 focus:bg-slate-50 px-2 py-1 rounded transition-colors"
                                placeholder="Untitled Resume"
                            />
                        </div>

                        {/* Center: Tailor Resume Button */}
                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md px-6 font-medium"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Tailor resume to Job
                        </Button>

                        {/* Right: Controls */}
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-slate-700 border-slate-300 hover:bg-slate-50"
                                onClick={() => setIsTemplateModalOpen(true)}
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Change Template
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                className="text-slate-700 border-slate-300 hover:bg-slate-50"
                                onClick={() => setIsLayoutPanelOpen(true)}
                            >
                                Layout & Style
                            </Button>

                            <div className="h-6 w-px bg-slate-200" />

                            {/* Zoom Controls */}
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 hover:bg-slate-100"
                                    onClick={() => setZoomLevel(Math.max(25, zoomLevel - 10))}
                                >
                                    -
                                </Button>
                                <span className="w-12 text-center font-medium">{zoomLevel}%</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 hover:bg-slate-100"
                                    onClick={() => setZoomLevel(Math.min(100, zoomLevel + 10))}
                                >
                                    +
                                </Button>
                            </div>

                            <div className="h-6 w-px bg-slate-200" />

                            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-medium">
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Split Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Resume Analysis + Sections */}
                <div className="w-1/2 border-r border-slate-200 bg-white overflow-y-auto">
                    <div className="max-w-3xl mx-auto py-6 px-6">

                        {/* Resume Analysis Section */}
                        <div className="mb-6">
                            <button
                                onClick={() => setIsResumeAnalysisOpen(!isResumeAnalysisOpen)}
                                className="w-full flex items-center justify-between py-3 text-left hover:bg-slate-50 rounded-lg px-3 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <ChevronRight className={`w-5 h-5 text-blue-600 transition-transform ${isResumeAnalysisOpen ? 'rotate-90' : ''}`} />
                                    <h2 className="text-base font-semibold text-blue-600">Resume Analysis</h2>
                                </div>
                            </button>

                            {isResumeAnalysisOpen && (
                                <div className="mt-4 space-y-4 px-3">
                                    {/* Circular Score */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative flex items-center justify-center w-16 h-16">
                                            <svg className="w-16 h-16 transform -rotate-90">
                                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="5" fill="none" className="text-slate-200" />
                                                <circle
                                                    cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="5" fill="none"
                                                    strokeDasharray={`${2 * Math.PI * 28}`}
                                                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - resumeScorePercentage / 100)}`}
                                                    className={`transition-all duration-500 ${resumeScorePercentage >= 80 ? 'text-green-500' :
                                                        resumeScorePercentage >= 50 ? 'text-yellow-500' : 'text-red-500'
                                                        }`}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-lg font-bold text-slate-900">{totalScore}</span>
                                                <span className="text-[10px] text-slate-500">out of {maxTotalScore}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">
                                                Your resume improved from 62 to {totalScore} out of {maxTotalScore}
                                            </p>
                                            <p className="text-xs text-slate-600 mt-1">
                                                There's room for improvement. Let's work on the key areas below.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Steps to increase score */}
                                    <div className="mt-6">
                                        <h3 className="text-sm font-semibold text-slate-900 mb-3">Steps to increase your score</h3>
                                        <p className="text-xs text-slate-600 mb-4">
                                            Here are some recruiter checks that are bringing your score down. Click into each to learn where you went wrong and how to improve your score.
                                        </p>

                                        <div className="space-y-2">
                                            {categories.map((category, index) => (
                                                <Card
                                                    key={category.label}
                                                    className={`border ${category.status === 'complete' ? 'border-green-200 bg-green-50/30' :
                                                        category.status === 'partial' ? 'border-blue-200 bg-blue-50/30' :
                                                            'border-red-200 bg-red-50/30'
                                                        } hover:shadow-sm transition-shadow cursor-pointer`}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${category.status === 'complete' ? 'bg-green-500' :
                                                                category.status === 'partial' ? 'bg-blue-500' :
                                                                    'bg-red-500'
                                                                }`}>
                                                                {index + 1}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-xs font-medium text-blue-600">Step {index + 1}</span>
                                                                    <span className="text-sm font-semibold text-slate-900">{category.label}</span>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {category.score} ÷ {category.maxScore}/100
                                                                    </Badge>
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {category.weight}% weight
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-xs text-slate-600">
                                                                    {category.tips.length > 0 ? category.tips[0] : 'Looking good!'}
                                                                </p>
                                                            </div>
                                                            <ChevronRight className="w-5 h-5 text-slate-400" />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Resume Sections - Independent Collapsible */}
                        <div className="space-y-1">
                            {SECTION_CONFIGS.filter(section => sectionVisibility[section.key]).map((section) => {
                                const isOpen = openSections.has(section.key);
                                const isComplete = getSectionStatus(section.key);

                                return (
                                    <div key={section.key} className="border-b border-slate-100 last:border-0">
                                        <button
                                            onClick={() => toggleSection(section.key)}
                                            className="w-full flex items-center justify-between py-4 px-3 hover:bg-slate-50 rounded-lg transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <ChevronRight className={`w-4 h-4 text-slate-600 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                                                <span className={`text-sm font-medium ${isOpen ? 'text-blue-600' : 'text-slate-700'}`}>
                                                    {section.label}
                                                </span>
                                                {isComplete && (
                                                    <div className="bg-green-100 text-green-700 p-0.5 rounded-full">
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </div>
                                        </button>

                                        {isOpen && (
                                            <div className="pt-2 pb-4 px-3">
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

                {/* Right Panel: Preview */}
                <div className="w-1/2 bg-slate-50 overflow-y-auto flex items-start justify-center p-8">
                    <div
                        className="origin-top shadow-xl ring-1 ring-slate-900/5 transition-transform"
                        style={{ transform: `scale(${zoomLevel / 100})` }}
                    >
                        <FullPageResumePreview
                            profile={profile}
                            sectionVisibility={sectionVisibility}
                            isSplitView={true}
                        />
                    </div>
                </div>
            </div>

            {/* Layout Panel */}
            <LayoutPanel
                isOpen={isLayoutPanelOpen}
                onClose={() => setIsLayoutPanelOpen(false)}
            />

            {/* Template Modal */}
            <TemplateModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                onSelectTemplate={(template) => console.log('Selected template:', template)}
            />
        </div>
    );
}
