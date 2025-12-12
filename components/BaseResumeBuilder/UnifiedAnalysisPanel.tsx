'use client';

import { useState } from 'react';
import { ResumeProfile } from '@/lib/resume-schema';
import { calculateResumeScore } from '@/lib/resume-score';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileQuestion, Upload } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { InlineSuggestion } from '@/lib/inline-suggestions';
import { SuggestionCard } from '@/components/SuggestionCard';
import { ResumeScore } from '@/components/ResumeScore';

interface UnifiedAnalysisPanelProps {
    profile: ResumeProfile;
    onUpdateProfile: (updates: Partial<ResumeProfile>) => void;
    inlineSuggestions: InlineSuggestion[];
    onScan: () => void;
    isScanning: boolean;
    onAskAI: (question: string) => void;
    onApplySuggestion: (suggestion: InlineSuggestion) => void;
    onDenySuggestion: (suggestionId: string) => void;
    onReplySuggestion?: (suggestion: InlineSuggestion) => void;
}

/**
 * Check if resume has meaningful content
 */
function hasResumeContent(profile: ResumeProfile): boolean {
    const hasName = !!profile.contact?.firstName || !!profile.contact?.lastName;
    const hasSummary = !!profile.summary?.content && profile.summary.content.length > 10;
    const hasExperience = profile.experience?.length > 0 && profile.experience.some(e => e.company || e.position);
    const hasEducation = profile.education?.length > 0 && profile.education.some(e => e.institution);
    const hasSkills = Object.keys(profile.skills || {}).length > 0;

    // Resume has content if at least 2 sections are filled
    const filledSections = [hasName, hasSummary, hasExperience, hasEducation, hasSkills].filter(Boolean).length;
    return filledSections >= 2;
}

export function UnifiedAnalysisPanel({
    profile,
    onUpdateProfile,
    inlineSuggestions,
    onScan,
    isScanning,
    onAskAI,
    onApplySuggestion,
    onDenySuggestion,
    onReplySuggestion
}: UnifiedAnalysisPanelProps) {
    const [showAllSuggestions, setShowAllSuggestions] = useState(false);

    // Check if resume has content
    const resumeHasContent = hasResumeContent(profile);

    // Get visible suggestions
    const pendingSuggestions = inlineSuggestions.filter(s => s.status === 'pending');
    const visibleSuggestions = showAllSuggestions ? pendingSuggestions : pendingSuggestions.slice(0, 3);

    // Empty state - no resume content yet
    if (!resumeHasContent) {
        return (
            <Card className="mb-6 border-slate-200 bg-gradient-to-br from-slate-50 to-white">
                <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <FileQuestion className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="font-semibold text-slate-700 mb-2">No Resume Content Yet</h3>
                    <p className="text-sm text-slate-500 mb-4 max-w-xs mx-auto">
                        Add your experience, education, and skills to see your resume score and get AI suggestions.
                    </p>
                    <div className="flex gap-2 justify-center">
                        <Button variant="outline" size="sm" className="text-slate-600">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Resume
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Score Breakdown - New Enhanced Component */}
            <ResumeScore profile={profile} />

            {/* Scan Button */}
            <div className="flex justify-center">
                <Button
                    onClick={onScan}
                    disabled={isScanning}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                >
                    {isScanning ? (
                        <>
                            <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Scan for Improvements
                        </>
                    )}
                </Button>
            </div>

            {/* AI Suggestions Section */}
            {pendingSuggestions.length > 0 && (
                <Card className="border-amber-100 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 border-b border-amber-100">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                AI Suggestions
                            </h4>
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200">
                                {pendingSuggestions.length} to review
                            </Badge>
                        </div>
                    </div>

                    <CardContent className="p-4 bg-white space-y-3">
                        {visibleSuggestions.map((suggestion) => (
                            <SuggestionCard
                                key={suggestion.id}
                                suggestion={suggestion}
                                onApprove={() => onApplySuggestion(suggestion)}
                                onDeny={() => onDenySuggestion(suggestion.id)}
                                onCustomize={() => onApplySuggestion(suggestion)}
                                onReply={onReplySuggestion ? () => onReplySuggestion(suggestion) : undefined}
                            />
                        ))}

                        {pendingSuggestions.length > 3 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                                className="w-full text-xs text-slate-500 hover:text-slate-900"
                            >
                                {showAllSuggestions
                                    ? 'Show Less'
                                    : `View All ${pendingSuggestions.length} Suggestions`}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Empty suggestions state after scan */}
            {pendingSuggestions.length === 0 && inlineSuggestions.length > 0 && (
                <Card className="border-emerald-100 bg-emerald-50/50">
                    <CardContent className="p-4 text-center">
                        <div className="text-emerald-600 font-medium">
                            ✨ All suggestions reviewed!
                        </div>
                        <p className="text-xs text-emerald-700 mt-1">
                            You've addressed all the AI suggestions. Great work!
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
