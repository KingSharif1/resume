'use client';

import { useState, useEffect } from 'react';
import { ResumeProfile, SectionType, SECTION_CONFIGS, createEmptyProfile } from '@/lib/resume-schema';
import { calculateResumeScore } from '@/lib/resume-score';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles, Settings, Download, ChevronDown, ChevronRight, Check, Upload
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
import { LayoutStyleEditor } from './LayoutStyleEditor';
import { TemplateModal } from './TemplateModal';
import { ResumeSettingsProvider } from '@/lib/resume-settings-context';

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

    if (isLayoutStyleEditorOpen) {
        return (
            <ResumeSettingsProvider>
                <LayoutStyleEditor
                    profile={profile}
                    onBack={() => setIsLayoutStyleEditorOpen(false)}
                />
            </ResumeSettingsProvider>
        );
    }

    return (
        <ResumeSettingsProvider>
            <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                {/* Enhanced Header */}
                <div className="relative bg-gradient-to-r from-white to-slate-50 border-b border-slate-200 h-16 flex-none z-30 shadow-sm">
                    {/* Animated accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />

                    <div className="max-w-full mx-auto px-6 h-full">
                        <div className="flex items-center justify-between h-full">
                            {/* Left: Resume Name */}
                            <div className="flex items-center gap-4">
                                <input
                                    type="text"
                                    value={resumeName}
                                    onChange={(e) => setResumeName(e.target.value)}
                                    className="text-lg font-semibold text-slate-900 bg-transparent border-none outline-none hover:bg-slate-50 focus:bg-slate-50 px-3 py-1.5 rounded-lg transition-all duration-200"
                                    placeholder="Untitled Resume"
                                />
                            </div>

                            {/* Center: Tailor Resume Button */}
                            <Button
                                size="sm"
                                onClick={() => onAIOptimize(profile)}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl px-6 py-2.5 font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                                Tailor resume to Job
                            </Button>

                            {/* Right: Controls */}
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
                                    onClick={onUploadResume}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Import
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
                                    onClick={() => setIsTemplateModalOpen(true)}
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Change Template
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
                                    onClick={() => setIsLayoutStyleEditorOpen(true)}
                                >
                                    Layout & Style
                                </Button>

                                <div className="h-6 w-px bg-slate-200" />

                                {/* Zoom Controls */}
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 hover:bg-slate-100 rounded-md transition-all duration-200"
                                        onClick={() => setZoomLevel(Math.max(25, zoomLevel - 10))}
                                    >
                                        −
                                    </Button>
                                    <span className="w-12 text-center font-semibold">{zoomLevel}%</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 hover:bg-slate-100 rounded-md transition-all duration-200"
                                        onClick={() => setZoomLevel(Math.min(100, zoomLevel + 10))}
                                    >
                                        +
                                    </Button>
                                </div>

                                <div className="h-6 w-px bg-slate-200" />

                                <Button
                                    size="sm"
                                    onClick={() => onSave(profile)}
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                                >
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

                            {/* Resume Analysis Section - Enhanced */}
                            <div className="mb-6">
                                <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm overflow-hidden">
                                    {/* Top accent line */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />

                                    <button
                                        onClick={() => setIsResumeAnalysisOpen(!isResumeAnalysisOpen)}
                                        className="w-full flex items-center justify-between text-left transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <ChevronRight className={`w-5 h-5 text-blue-600 transition-transform duration-300 ${isResumeAnalysisOpen ? 'rotate-90' : ''}`} />
                                            <h2 className="text-lg font-bold text-blue-700">Resume Analysis</h2>
                                        </div>
                                    </button>

                                    {isResumeAnalysisOpen && (
                                        <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {/* Enhanced Circular Score */}
                                            <div className="flex items-center gap-6">
                                                <div className="relative flex items-center justify-center w-20 h-20">
                                                    <svg className="w-20 h-20 transform -rotate-90">
                                                        <defs>
                                                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                <stop offset="0%" stopColor="#3b82f6" />
                                                                <stop offset="100%" stopColor="#8b5cf6" />
                                                            </linearGradient>
                                                        </defs>
                                                        <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="none" className="text-blue-100" />
                                                        <circle
                                                            cx="40" cy="40" r="36"
                                                            stroke="url(#scoreGradient)"
                                                            strokeWidth="6"
                                                            fill="none"
                                                            strokeDasharray={`${2 * Math.PI * 36}`}
                                                            strokeDashoffset={`${2 * Math.PI * 36 * (1 - resumeScorePercentage / 100)}`}
                                                            className="transition-all duration-1000 ease-out"
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className="text-2xl font-bold text-slate-900">{totalScore}</span>
                                                        <span className="text-[10px] text-slate-600 font-medium">out of {maxTotalScore}</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-slate-900 mb-1">
                                                        Your resume improved from 62 to {totalScore} out of {maxTotalScore}
                                                    </p>
                                                    <p className="text-xs text-slate-600 leading-relaxed">
                                                        {resumeScorePercentage >= 80 ? 'Excellent work! Your resume is looking great.' :
                                                            resumeScorePercentage >= 60 ? 'Good progress! A few more improvements will make it shine.' :
                                                                'There\'s room for improvement. Let\'s work on the key areas below.'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Enhanced Steps to increase score */}
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 mb-2">Steps to increase your score</h3>
                                                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                                                    Here are some recruiter checks that are bringing your score down. Click into each to learn where you went wrong and how to improve your score.
                                                </p>

                                                <div className="space-y-2">
                                                    {categories.map((category, index) => (
                                                        <Card
                                                            key={category.label}
                                                            className={`border ${category.status === 'complete' ? 'border-green-200 bg-white' :
                                                                category.status === 'partial' ? 'border-blue-200 bg-white' :
                                                                    'border-red-200 bg-white'
                                                                } hover:shadow-md hover:translate-x-1 transition-all duration-200 cursor-pointer`}
                                                        >
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm bg-gradient-to-br ${category.status === 'complete' ? 'from-green-500 to-emerald-600' :
                                                                        category.status === 'partial' ? 'from-blue-500 to-indigo-600' :
                                                                            'from-red-500 to-rose-600'
                                                                        }`}>
                                                                        {index + 1}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                            <span className="text-xs font-semibold text-blue-600">Step {index + 1}</span>
                                                                            <span className="text-sm font-bold text-slate-900">{category.label}</span>
                                                                            <Badge variant="outline" className="text-xs font-semibold">
                                                                                {category.score}/{category.maxScore}
                                                                            </Badge>
                                                                            <Badge variant="secondary" className="text-xs">
                                                                                {category.weight}% weight
                                                                            </Badge>
                                                                        </div>
                                                                        <p className="text-xs text-slate-600 leading-relaxed">
                                                                            {category.tips.length > 0 ? category.tips[0] : 'Looking good!'}
                                                                        </p>
                                                                    </div>
                                                                    <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
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


                    {/* Right Panel: Enhanced Preview */}
                    <div className="w-1/2 bg-gradient-to-br from-slate-50 to-slate-100 overflow-y-auto flex items-start justify-center p-8 relative">
                        {/* Dot pattern background */}
                        <div className="absolute inset-0 opacity-30" style={{
                            backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }} />

                        <div
                            className="origin-top shadow-2xl ring-1 ring-slate-900/5 rounded-lg overflow-hidden transition-all duration-300 ease-out relative z-10"
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

                {/* Template Modal */}
                <TemplateModal
                    isOpen={isTemplateModalOpen}
                    onClose={() => setIsTemplateModalOpen(false)}
                    onSelectTemplate={(template) => console.log('Selected template:', template)}
                />
            </div>
        </ResumeSettingsProvider>
    );
}
