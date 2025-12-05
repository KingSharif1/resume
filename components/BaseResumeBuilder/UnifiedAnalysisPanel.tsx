'use client';

import { useState } from 'react';
import { ResumeProfile } from '@/lib/resume-schema';
import { calculateResumeScore } from '@/lib/resume-score';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Sparkles,
    TrendingUp,
    ChevronRight,
    Info,
    CheckCircle2,
    AlertCircle,
    Circle,
    Check,
    X,
    Edit3,
    MessageSquare
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { InlineSuggestion } from '@/lib/inline-suggestions';
import { SuggestionCard } from '@/components/SuggestionCard';

interface UnifiedAnalysisPanelProps {
    profile: ResumeProfile;
    onUpdateProfile: (updates: Partial<ResumeProfile>) => void;
    inlineSuggestions: InlineSuggestion[];
    onScan: () => void;
    isScanning: boolean;
    onAskAI: (question: string) => void;
    onApplySuggestion: (suggestion: InlineSuggestion) => void;
    onDenySuggestion: (suggestionId: string) => void;
}

export function UnifiedAnalysisPanel({
    profile,
    onUpdateProfile,
    inlineSuggestions,
    onScan,
    isScanning,
    onAskAI,
    onApplySuggestion,
    onDenySuggestion
}: UnifiedAnalysisPanelProps) {
    const [showAllSuggestions, setShowAllSuggestions] = useState(false);

    // Calculate score
    const { totalScore, maxTotalScore, categories } = calculateResumeScore(profile);
    const scorePercentage = Math.round((totalScore / maxTotalScore) * 100);

    // Get visible suggestions
    const visibleSuggestions = showAllSuggestions ? inlineSuggestions : inlineSuggestions.slice(0, 2);

    return (
        <Card className="mb-6 border-blue-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Resume Analysis</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>Score: {scorePercentage}/100</span>
                                <span>•</span>
                                <span>{inlineSuggestions.length} Suggestions</span>
                            </div>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={onScan}
                        disabled={isScanning}
                        className="bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 shadow-sm"
                    >
                        {isScanning ? (
                            <>
                                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                Scanning...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Scan Now
                            </>
                        )}
                    </Button>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                        <span>Optimization Score</span>
                        <span>{scorePercentage}%</span>
                    </div>
                    <Progress value={scorePercentage} className="h-2 bg-blue-100" />
                </div>
            </div>

            {inlineSuggestions.length > 0 && (
                <CardContent className="p-4 bg-white">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                AI Suggestions
                            </h4>
                            <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100">
                                {inlineSuggestions.length} New
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            {visibleSuggestions.map((suggestion) => (
                                <SuggestionCard
                                    key={suggestion.id}
                                    suggestion={suggestion}
                                    onApprove={() => onApplySuggestion(suggestion)}
                                    onDeny={() => onDenySuggestion(suggestion.id)}
                                    // For now, reuse onApply for customize, or we could add a specific handler
                                    onCustomize={() => onApplySuggestion(suggestion)}
                                />
                            ))}
                        </div>

                        {inlineSuggestions.length > 2 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                                className="w-full text-xs text-slate-500 hover:text-slate-900"
                            >
                                {showAllSuggestions ? 'Show Less' : `View All ${inlineSuggestions.length} Suggestions`}
                            </Button>
                        )}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
