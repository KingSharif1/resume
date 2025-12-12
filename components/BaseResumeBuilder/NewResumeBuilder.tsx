'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ResumeProfile, SectionType, SECTION_CONFIGS, createEmptyProfile } from '@/lib/resume-schema';
import { calculateResumeScore } from '@/lib/resume-score';
import { InlineSuggestion, applySuggestionToProfile, createInlineSuggestion, SuggestionType, SuggestionSeverity, TargetSection } from '@/lib/inline-suggestions';
import { toast } from 'react-hot-toast';
import { pdf } from '@react-pdf/renderer'; // Add this import
import { saveAs } from 'file-saver'; // Add this import
import { ResumePDFDocument } from '@/components/pdf/ResumePDFDocument'; // Add this import
import { exportToDocx } from '@/lib/docx-export-profile'; // Add this import
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles, Settings, Download, ChevronDown, ChevronRight, Check, Upload, Briefcase, FileText, GripVertical, FileDown
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'; // Add this import
import { SkillsForm } from './FormSections/SkillsForm';
import { LanguagesForm } from './FormSections/LanguagesForm';
import { CertificationsForm } from './FormSections/CertificationsForm';
import { VolunteerForm } from './FormSections/VolunteerForm';
import { AwardsForm } from './FormSections/AwardsForm';
import { PublicationsForm } from './FormSections/PublicationsForm';
import { ReferencesForm } from './FormSections/ReferencesForm';
import { InterestsForm } from './FormSections/InterestsForm';
import { LayoutStyleEditor } from './LayoutStyleEditor';
import { AIChatWidget, ChatSuggestion } from './AIChatWidget';
import { UnifiedAnalysisPanel } from './UnifiedAnalysisPanel';
import { TemplateModal } from './TemplateModal';
import { useResumeSettings } from '@/lib/resume-settings-context';
import { SuggestionHoverProvider } from '@/lib/suggestion-hover-context';
import { suggestionsRepository } from '@/lib/db/repositories/suggestions-repository';

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

    // AI Analysis State
    const [inlineSuggestions, setInlineSuggestions] = useState<InlineSuggestion[]>([]);
    const [isScanning, setIsScanning] = useState(false);

    // Preview State for Chat Suggestions
    const [previewProfile, setPreviewProfile] = useState<ResumeProfile | null>(null);
    const [previewSuggestion, setPreviewSuggestion] = useState<InlineSuggestion | null>(null);
    // Chat context attachment - when user wants to discuss a suggestion
    const [attachedChatContext, setAttachedChatContext] = useState<ChatSuggestion | null>(null);

    // Load suggestions from database on mount
    useEffect(() => {
        const loadFromDB = async () => {
            if (!profile.id) return; // Don't load for new resumes without ID
            try {
                const savedSuggestions = await suggestionsRepository.getByResumeId(profile.id);
                if (savedSuggestions.length > 0) {
                    setInlineSuggestions(savedSuggestions);
                }
            } catch (error) {
                console.error('[NewResumeBuilder] Failed to load suggestions:', error);
            }
        };
        loadFromDB();
    }, [profile.id]);

    // Save suggestions to database whenever they change (debounced)
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (!profile.id || inlineSuggestions.length === 0) return;

        // Debounce saves to avoid excessive API calls
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await suggestionsRepository.saveForResume(profile.id!, inlineSuggestions);
            } catch (error) {
                console.error('[NewResumeBuilder] Failed to save suggestions:', error);
            }
        }, 1000); // Save after 1 second of inactivity

        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [inlineSuggestions, profile.id]);

    const applyChatSuggestionToProfile = (currentProfile: ResumeProfile, suggestion: ChatSuggestion): ResumeProfile => {
        const newProfile = JSON.parse(JSON.stringify(currentProfile));

        if (suggestion.targetSection === 'summary') {
            newProfile.summary = { ...newProfile.summary, content: suggestion.suggestedText };
        } else if (suggestion.targetSection === 'experience') {
            // If targetId is provided, find that specific experience
            if (suggestion.targetId) {
                const index = newProfile.experience.findIndex((e: any) => e.id === suggestion.targetId);
                if (index !== -1) {
                    newProfile.experience[index].description = suggestion.suggestedText;
                }
            } else if (newProfile.experience.length > 0) {
                // Default to first experience if no ID provided (fallback)
                newProfile.experience[0].description = suggestion.suggestedText;
            }
        } else if (suggestion.targetSection === 'skills') {
            // For skills, we might need more complex parsing, but for now let's assume it suggests a category or general list
            // This is a simplification. Real implementation might parse "Category: Skill, Skill"
            newProfile.skills['General'] = suggestion.suggestedText.split(',').map((s: string) => s.trim());
        }

        return newProfile;
    };

    const handleChatApplySuggestion = (suggestion: ChatSuggestion) => {
        const newProfile = applyChatSuggestionToProfile(profile, suggestion);
        setProfile(newProfile);
        setPreviewProfile(null);
        setPreviewSuggestion(null);

        // Also add to Unified Analysis Panel as a "Completed" or "Applied" suggestion for reference
        // Or simply remove it if it was already there.
        // For now, let's just clear the preview.

        // Open the section to show the change
        if (['summary', 'experience', 'education', 'skills', 'contact'].includes(suggestion.targetSection)) {
            setOpenSections(prev => new Set(prev).add(suggestion.targetSection as SectionType));
        }
    };

    // New Callback to sync Chat suggestions to Analysis Panel
    const handleAddInlineSuggestion = (suggestion: ChatSuggestion) => {
        const newSuggestion: InlineSuggestion = createInlineSuggestion({
            type: 'wording',
            severity: 'suggestion',
            targetSection: suggestion.targetSection as TargetSection,
            targetItemId: suggestion.targetId,
            targetField: suggestion.targetSection === 'summary' ? 'content' : 'description',
            originalText: suggestion.originalText || '',
            suggestedText: suggestion.suggestedText,
            reason: suggestion.reasoning, // Reasoning from chat
            startOffset: 0,
            endOffset: (suggestion.originalText || '').length
        });

        // Avoid duplicates
        setInlineSuggestions(prev => {
            const exists = prev.some(s => s.suggestedText === newSuggestion.suggestedText);
            if (exists) return prev;
            toast.success("Suggestion saved to Analysis Panel");
            return [...prev, newSuggestion];
        });
    };

    // Handler for replying to a suggestion - opens chat with context
    const handleReplySuggestion = (suggestion: InlineSuggestion) => {
        // Convert InlineSuggestion to ChatSuggestion format
        const chatContext: ChatSuggestion = {
            targetSection: suggestion.targetSection,
            targetId: suggestion.targetItemId,
            originalText: suggestion.originalText,
            suggestedText: suggestion.suggestedText,
            reasoning: suggestion.reason || ''
        };
        setAttachedChatContext(chatContext);
        setIsChatOpen(true);
    };

    const handleChatPreviewSuggestion = (suggestion: ChatSuggestion | null) => {
        if (!suggestion) {
            setPreviewProfile(null);
            setPreviewSuggestion(null);
            return;
        }
        const newProfile = applyChatSuggestionToProfile(profile, suggestion);
        setPreviewProfile(newProfile);

        // Create a temporary InlineSuggestion to trigger the visual highlight
        const tempSuggestion: InlineSuggestion = createInlineSuggestion({
            type: 'wording',
            severity: 'suggestion',
            targetSection: suggestion.targetSection as TargetSection,
            targetItemId: suggestion.targetId,
            targetField: suggestion.targetSection === 'summary' ? 'content' : 'description', // heuristic
            originalText: suggestion.originalText || '',
            suggestedText: suggestion.suggestedText,
            reason: suggestion.reasoning,
            startOffset: 0,
            endOffset: suggestion.suggestedText.length
        });
        setPreviewSuggestion(tempSuggestion);
    };

    const handleScan = async () => {
        setIsScanning(true);
        try {
            const response = await fetch('/api/ai/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile })
            });

            if (!response.ok) throw new Error('Scan failed');

            const data = await response.json();
            const apiSuggestions = data.suggestions || [];

            if (apiSuggestions.length === 0) {
                toast.success('Scan complete: Great job! No obvious issues found.');
                setInlineSuggestions([]);
                return;
            }

            // Map API suggestions to InlineSuggestion format
            const newSuggestions: InlineSuggestion[] = apiSuggestions.map((s: any) => {
                // Determine target field based on section if not provided
                let field = s.targetField;
                if (!field) {
                    if (s.targetSection === 'summary') field = 'content';
                    else if (['experience', 'projects', 'education'].includes(s.targetSection)) field = 'description';
                    else field = 'description';
                }

                // Default values
                let startOffset = 0;
                let endOffset = 0;

                // Try to find the text offset in the profile
                if (s.originalText) {
                    let content = '';
                    if (s.targetSection === 'summary') {
                        content = profile.summary?.content || '';
                    } else if (s.targetSection === 'experience' && s.targetItemId) {
                        const item = profile.experience.find(e => e.id === s.targetItemId);
                        if (item) {
                            if (field === 'description') content = item.description || '';
                        }
                    } else if (s.targetSection === 'projects' && s.targetItemId) {
                        const item = profile.projects.find(p => p.id === s.targetItemId);
                        if (item) {
                            if (field === 'description') content = item.description || '';
                        }
                    }

                    // Find offset with robust matching

                    // Simple exact match
                    let index = content.indexOf(s.originalText);

                    // If not found, try normalized match (ignore extra whitespace)
                    if (index === -1) {
                        const normalize = (str: string) => str.replace(/\s+/g, ' ').trim();
                        const normContent = normalize(content);
                        const normOriginal = normalize(s.originalText);
                        const normIndex = normContent.indexOf(normOriginal);

                        if (normIndex !== -1) {
                            // Map back to original indices is complex, so we'll try a fuzzy approach
                            // Look for the first few words
                            const words = s.originalText.trim().split(/\s+/);
                            if (words.length > 0) {
                                const firstChunk = words.slice(0, Math.min(3, words.length)).join(' ');
                                const chunkIndex = content.indexOf(firstChunk);
                                if (chunkIndex !== -1) {
                                    index = chunkIndex;
                                    // Approximate end
                                    endOffset = index + s.originalText.length;
                                }
                            }
                        }
                    }

                    if (index !== -1) {
                        startOffset = index;
                        // Use the length of the original text, but clamp to content length
                        endOffset = Math.min(index + s.originalText.length, content.length);

                        // Refine end offset if we did a fuzzy match
                        // (Optional: could look for distinct ending of the substring)
                    }
                }

                return createInlineSuggestion({
                    targetSection: s.targetSection as TargetSection,
                    targetItemId: s.targetItemId,
                    targetField: field,
                    originalText: s.originalText || '',
                    suggestedText: s.suggestedText || '',
                    reason: s.reason || 'Suggestion from AI',
                    type: (s.type as SuggestionType) || 'wording',
                    severity: (s.severity as SuggestionSeverity) || 'suggestion',
                    startOffset,
                    endOffset
                });
            });

            setInlineSuggestions(newSuggestions);
            toast.success(`Scan complete: Found ${newSuggestions.length} suggestions.`);

        } catch (error) {
            console.error('Scan error:', error);
            toast.error('Failed to complete scan. Please try again.');
        } finally {
            setIsScanning(false);
        }
    };

    const handleAskAI = (question: string) => {
        console.log("Asking AI:", question);
        // TODO: Implement Chat AI
    };

    const handleApplySuggestion = (suggestion: InlineSuggestion) => {
        const updatedProfile = applySuggestionToProfile(profile, suggestion);
        setProfile(updatedProfile);
        // Remove applied suggestion
        setInlineSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    };

    const handleDenySuggestion = (suggestionId: string) => {
        setInlineSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    };

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

    // Download Handlers
    const handleDownloadPDF = async () => {
        try {
            const toastId = toast.loading('Generating PDF...');
            // Generate blob using @react-pdf/renderer
            const blob = await pdf(<ResumePDFDocument profile={profile} />).toBlob();
            saveAs(blob, `${resumeName.replace(/\s+/g, '_')}_Resume.pdf`);
            toast.success('Resume downloaded as PDF', { id: toastId });
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error('Failed to generate PDF. Please try again.');
        }
    };

    const handleDownloadDOCX = async () => {
        try {
            const toastId = toast.loading('Generating Word Document...');
            await exportToDocx(profile, `${resumeName.replace(/\s+/g, '_')}_Resume.docx`);
            toast.success('Resume downloaded as DOCX', { id: toastId });
        } catch (error) {
            console.error('DOCX Generation Error:', error);
            toast.error('Failed to generate Word document.');
        }
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
        <SuggestionHoverProvider>
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

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="default" size="sm" className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                    <ChevronDown className="w-3 h-3 ml-2 opacity-70" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={handleDownloadPDF} className="cursor-pointer">
                                    <FileText className="w-4 h-4 mr-2 text-red-500" />
                                    <span>Download PDF</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDownloadDOCX} className="cursor-pointer">
                                    <FileDown className="w-4 h-4 mr-2 text-blue-600" />
                                    <span>Download Word</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                            <UnifiedAnalysisPanel
                                profile={profile}
                                onUpdateProfile={updateProfile}
                                inlineSuggestions={inlineSuggestions}
                                onScan={handleScan}
                                isScanning={isScanning}
                                onAskAI={handleAskAI}
                                onApplySuggestion={handleApplySuggestion}
                                onDenySuggestion={handleDenySuggestion}
                                onReplySuggestion={handleReplySuggestion}
                            />

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
                                    profile={previewProfile || profile}
                                    sectionVisibility={sectionVisibility}
                                    isSplitView={true}
                                    onTemplateChange={() => setIsTemplateModalOpen(true)}
                                    onLayoutChange={() => setIsLayoutStyleEditorOpen(true)}
                                    inlineSuggestions={previewSuggestion ? [...inlineSuggestions, previewSuggestion] : inlineSuggestions}
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
                    onApplySuggestion={handleChatApplySuggestion}
                    onPreviewSuggestion={handleChatPreviewSuggestion}
                    onAddInlineSuggestion={handleAddInlineSuggestion}
                    attachedContext={attachedChatContext}
                    onClearContext={() => setAttachedChatContext(null)}
                />
            </div>
            {/* Floating Chat Launcher - Always visible when chat is closed */}
            {!isChatOpen && (
                <Button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl z-50 flex items-center justify-center transition-transform hover:scale-105"
                >
                    <Sparkles className="w-6 h-6" />
                </Button>
            )}

        </SuggestionHoverProvider>
    );
}
