'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    XCircle,
    AlertCircle,
    Sparkles,
    ChevronDown,
    ChevronUp,
    Loader2,
    Target,
    TrendingUp,
    Lightbulb,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResumeProfile } from '@/lib/resume-schema';
import toast from 'react-hot-toast';

interface JobRequirement {
    category: 'skill' | 'experience' | 'education' | 'certification' | 'other';
    requirement: string;
    priority: 'required' | 'preferred' | 'nice-to-have';
    matched: boolean;
    matchedFrom?: string;
    suggestion?: string;
}

interface JobAnalysis {
    jobTitle: string;
    company: string;
    requirements: JobRequirement[];
    matchScore: number;
    summary: string;
    keySkills: string[];
    missingSkills: string[];
    strengthsToHighlight: string[];
    suggestedChanges: {
        section: string;
        change: string;
        priority: 'high' | 'medium' | 'low';
    }[];
}

interface JobAnalysisPanelProps {
    jobDescription: string;
    profile: ResumeProfile;
    onApplySuggestion?: (section: string, change: string) => void;
    onAutoTailor?: () => void;
}

export function JobAnalysisPanel({
    jobDescription,
    profile,
    onApplySuggestion,
    onAutoTailor
}: JobAnalysisPanelProps) {
    const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [showAllRequirements, setShowAllRequirements] = useState(false);

    useEffect(() => {
        if (jobDescription && jobDescription.length > 50) {
            analyzeJob();
        }
    }, [jobDescription]);

    const analyzeJob = async () => {
        if (!jobDescription || jobDescription.length < 50) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/analyze-job', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobDescription,
                    resumeProfile: profile
                })
            });

            if (!response.ok) {
                throw new Error('Failed to analyze job');
            }

            const data = await response.json();
            if (data.success && data.analysis) {
                setAnalysis(data.analysis);
            }
        } catch (error) {
            console.error('Error analyzing job:', error);
            toast.error('Failed to analyze job requirements');
        } finally {
            setIsLoading(false);
        }
    };

    if (!jobDescription || jobDescription.length < 50) {
        return null;
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-50';
        if (score >= 60) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'required': return 'bg-red-100 text-red-700 border-red-200';
            case 'preferred': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'nice-to-have': return 'bg-slate-100 text-slate-600 border-slate-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'skill': return '🛠️';
            case 'experience': return '💼';
            case 'education': return '🎓';
            case 'certification': return '📜';
            default: return '📋';
        }
    };

    const matchedRequirements = analysis?.requirements.filter(r => r.matched) || [];
    const unmatchedRequirements = analysis?.requirements.filter(r => !r.matched) || [];
    const displayedUnmatched = showAllRequirements ? unmatchedRequirements : unmatchedRequirements.slice(0, 5);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 text-white rounded-lg">
                        <Target className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-bold text-slate-900">Job Match Analysis</h3>
                        <p className="text-xs text-slate-500">
                            {isLoading ? 'Analyzing...' : analysis ? `${analysis.jobTitle} at ${analysis.company}` : 'Analyzing job requirements'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {analysis && (
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(analysis.matchScore)}`}>
                            {analysis.matchScore}% Match
                        </div>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isLoading ? (
                            <div className="p-6 flex flex-col items-center justify-center gap-3">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                <p className="text-sm text-slate-500">Analyzing job requirements...</p>
                            </div>
                        ) : analysis ? (
                            <div className="p-4 space-y-4">
                                {/* Summary */}
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-700">{analysis.summary}</p>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-3 bg-green-50 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-green-600">{matchedRequirements.length}</div>
                                        <div className="text-xs text-green-700">Matched</div>
                                    </div>
                                    <div className="p-3 bg-red-50 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-red-600">{unmatchedRequirements.length}</div>
                                        <div className="text-xs text-red-700">Gaps</div>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-blue-600">{analysis.suggestedChanges.length}</div>
                                        <div className="text-xs text-blue-700">Suggestions</div>
                                    </div>
                                </div>

                                {/* Missing Skills - What to Add */}
                                {unmatchedRequirements.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                            <h4 className="text-sm font-semibold text-slate-900">What You're Missing</h4>
                                        </div>
                                        <div className="space-y-2">
                                            {displayedUnmatched.map((req, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-3 bg-red-50 border border-red-100 rounded-lg"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-sm">{getCategoryIcon(req.category)}</span>
                                                                <span className="text-sm font-medium text-slate-900">{req.requirement}</span>
                                                                <Badge className={`text-xs ${getPriorityColor(req.priority)}`}>
                                                                    {req.priority}
                                                                </Badge>
                                                            </div>
                                                            {req.suggestion && (
                                                                <p className="text-xs text-slate-600 mt-1">
                                                                    <Lightbulb className="w-3 h-3 inline mr-1 text-yellow-500" />
                                                                    {req.suggestion}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {unmatchedRequirements.length > 5 && !showAllRequirements && (
                                                <button
                                                    onClick={() => setShowAllRequirements(true)}
                                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    Show {unmatchedRequirements.length - 5} more...
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Strengths to Highlight */}
                                {analysis.strengthsToHighlight.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-green-500" />
                                            <h4 className="text-sm font-semibold text-slate-900">Your Strengths</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.strengthsToHighlight.map((strength, idx) => (
                                                <Badge key={idx} className="bg-green-100 text-green-700 border-green-200">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    {strength}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Suggested Changes */}
                                {analysis.suggestedChanges.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-purple-500" />
                                            <h4 className="text-sm font-semibold text-slate-900">Recommended Changes</h4>
                                        </div>
                                        <div className="space-y-2">
                                            {analysis.suggestedChanges.slice(0, 5).map((change, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-3 bg-purple-50 border border-purple-100 rounded-lg flex items-start justify-between gap-3"
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                                                                {change.section}
                                                            </Badge>
                                                            <Badge className={`text-xs ${
                                                                change.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                                change.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-slate-100 text-slate-600'
                                                            }`}>
                                                                {change.priority}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-slate-700">{change.change}</p>
                                                    </div>
                                                    {onApplySuggestion && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                                                            onClick={() => onApplySuggestion(change.section, change.change)}
                                                        >
                                                            Apply
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Auto-Tailor Button */}
                                {onAutoTailor && (
                                    <Button
                                        onClick={onAutoTailor}
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                                    >
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Auto-Tailor My Resume
                                    </Button>
                                )}

                                {/* Refresh Button */}
                                <button
                                    onClick={analyzeJob}
                                    className="w-full text-center text-xs text-slate-500 hover:text-slate-700 py-2"
                                >
                                    Re-analyze job requirements
                                </button>
                            </div>
                        ) : (
                            <div className="p-6 text-center text-slate-500">
                                <p className="text-sm">Add a job description to see match analysis</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
