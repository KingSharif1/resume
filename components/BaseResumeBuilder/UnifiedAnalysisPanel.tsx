'use client';

import { useState } from 'react';
import { ResumeProfile } from '@/lib/resume-schema';
import { calculateResumeScore, ActionableTip } from '@/lib/resume-score';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileQuestion, Upload, Wand2, ChevronDown, RefreshCw, X } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { InlineSuggestion } from '@/lib/inline-suggestions';
import { SuggestionCard } from '@/components/SuggestionCard';
import { ResumeScore } from '@/components/ResumeScore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
    onRegenerateSuggestion?: (suggestionId: string, userPrompt: string) => void;
    regeneratingSuggestionId?: string | null;
    highlightedSuggestionId?: string | null;
    resumeScore?: ReturnType<typeof calculateResumeScore>;
    onApplyScoreFix?: (tip: ActionableTip) => void;
    onDismissScoreTip?: (tip: ActionableTip) => void;
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
    onReplySuggestion,
    onRegenerateSuggestion,
    regeneratingSuggestionId,
    highlightedSuggestionId,
    resumeScore,
    onApplyScoreFix,
    onDismissScoreTip
}: UnifiedAnalysisPanelProps) {
    // Use provided score or calculate if not provided
    const score = resumeScore || calculateResumeScore(profile);
    const [isExpanded, setIsExpanded] = useState(true);

    // Check if resume has content
    const resumeHasContent = hasResumeContent(profile);

    // Get pending suggestions
    const pendingSuggestions = inlineSuggestions.filter(s => s.status === 'pending');
    const hasSuggestions = pendingSuggestions.length > 0;

    // Determine state: idle (no suggestions yet), scanning, or results
    const state = isScanning ? 'scanning' : hasSuggestions ? 'results' : 'idle';

    const handleDismissAll = () => {
        pendingSuggestions.forEach(s => onDenySuggestion(s.id));
    };

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
            {/* Score Breakdown */}
            <ResumeScore 
                profile={profile} 
                onApplyFix={onApplyScoreFix}
                onDismissTip={onDismissScoreTip}
            />

            {/* AI Suggestions Panel with State Machine */}
            <div className="w-full">
                <AnimatePresence mode="wait">
                    {/* 1. IDLE STATE - Scan Button */}
                    {state === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm"
                        >
                            <div className="w-12 h-12 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                Optimize Your Resume
                            </h3>
                            <p className="text-sm text-slate-500 text-center max-w-xs mb-6">
                                Our AI analyzes your resume for grammar, impact, metrics, and ATS optimization.
                            </p>
                            <button
                                onClick={onScan}
                                className="group relative overflow-hidden rounded-full bg-slate-900 text-white px-8 py-3 font-semibold shadow-xl transition-all hover:scale-105 hover:shadow-2xl active:scale-95"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <Wand2 className="w-4 h-4" />
                                    Scan for Improvements
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                            </button>
                        </motion.div>
                    )}

                    {/* 2. SCANNING STATE - Loading Animation */}
                    {state === 'scanning' && (
                        <motion.div
                            key="scanning"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center py-16"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-primary"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                                </div>
                            </div>
                            <motion.h3 
                                className="mt-6 text-lg font-medium text-slate-800"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                Analyzing your resume...
                            </motion.h3>
                            <div className="w-64 mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: ["0%", "30%", "60%", "85%", "100%"] }}
                                    transition={{ 
                                        duration: 8,
                                        times: [0, 0.2, 0.5, 0.8, 1],
                                        ease: "easeOut"
                                    }}
                                    className="h-full bg-gradient-to-r from-primary via-blue-500 to-primary rounded-full"
                                />
                            </div>
                            <motion.p
                                className="mt-3 text-xs text-slate-500"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 1, 0] }}
                                transition={{ 
                                    duration: 8,
                                    times: [0, 0.1, 0.9, 1]
                                }}
                            >
                                This may take 5-10 seconds...
                            </motion.p>
                        </motion.div>
                    )}

                    {/* 3. RESULTS STATE - Suggestions with Expand/Collapse */}
                    {state === 'results' && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden"
                        >
                            {/* Header Control Panel */}
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50 backdrop-blur-sm sticky top-0 z-10">
                                <div className="flex items-center justify-between">
                                    <div
                                        className="flex items-center gap-3 cursor-pointer select-none"
                                        onClick={() => setIsExpanded(!isExpanded)}
                                    >
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800">
                                                AI Suggestions
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                {pendingSuggestions.length} improvements found
                                            </p>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                        </motion.div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isExpanded && (
                                            <>
                                                <button
                                                    onClick={onScan}
                                                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
                                                    title="Regenerate all"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={handleDismissAll}
                                                    className="text-xs font-medium text-slate-500 hover:text-red-500 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    Dismiss All
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Suggestions List */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden bg-slate-50/30"
                                    >
                                        <div className="p-4 space-y-3">
                                            {pendingSuggestions.map((suggestion) => (
                                                <SuggestionCard
                                                    key={suggestion.id}
                                                    suggestion={suggestion}
                                                    onApprove={onApplySuggestion}
                                                    onDeny={onDenySuggestion}
                                                    onReply={onReplySuggestion}
                                                    onInlineReply={onRegenerateSuggestion}
                                                    isRegenerating={regeneratingSuggestionId === suggestion.id}
                                                    isHighlighted={highlightedSuggestionId === suggestion.id}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
