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
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface UnifiedAnalysisPanelProps {
    profile: ResumeProfile;
    onUpdateProfile: (updates: Partial<ResumeProfile>) => void;
}

interface AISuggestion {
    id: string;
    category: 'content' | 'ats' | 'formatting' | 'keywords';
    severity: 'high' | 'medium' | 'low';
    title: string;
    whatToChange: string;
    whyItMatters: string;
    targetSection?: string;
    action: {
        type: 'add' | 'update' | 'remove' | 'rewrite';
        data: any;
    };
}

export function UnifiedAnalysisPanel({ profile, onUpdateProfile }: UnifiedAnalysisPanelProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showAllSuggestions, setShowAllSuggestions] = useState(false);

    // Mock Suggestions State
    const [suggestions, setSuggestions] = useState<AISuggestion[]>([
        {
            id: '1',
            category: 'ats',
            severity: 'high',
            title: 'Add quantified achievements',
            whatToChange: 'Add numbers and metrics to your experience bullets (e.g., "Increased sales by 30%")',
            whyItMatters: 'ATS systems and recruiters prioritize measurable results. Quantified achievements make your impact clear.',
            targetSection: 'experience',
            action: { type: 'update', data: {} }
        },
        {
            id: '2',
            category: 'keywords',
            severity: 'medium',
            title: 'Missing key technical skills',
            whatToChange: 'Add "React", "TypeScript", and "Node.js" to your skills section',
            whyItMatters: 'These are common keywords in software engineering job descriptions. Increases ATS match rate by ~25%.',
            targetSection: 'skills',
            action: { type: 'add', data: { category: 'Technical', skills: ['React', 'TypeScript', 'Node.js'] } }
        },
        {
            id: '3',
            category: 'content',
            severity: 'medium',
            title: 'Strengthen action verbs',
            whatToChange: 'Replace "Responsible for" with stronger verbs like "Led", "Managed", or "Spearheaded"',
            whyItMatters: 'Action verbs make you sound proactive. Passive language weakens your accomplishments.',
            targetSection: 'experience',
            action: { type: 'rewrite', data: {} }
        }
    ]);

    const scoreData = calculateResumeScore(profile);
    const {
        totalScore,
        maxTotalScore,
        percentage,
        atsCompatibility,
        jobReadiness,
        overallGrade,
        summary,
        categories
    } = scoreData;

    // Helper functions
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'excellent': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
            case 'good': return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
            case 'needs-work': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
            case 'critical': return <AlertCircle className="w-4 h-4 text-red-600" />;
            default: return <Circle className="w-4 h-4 text-slate-400" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-slate-600 bg-slate-50 border-slate-200';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'ats': return <TrendingUp className="w-3.5 h-3.5" />;
            case 'keywords': return <Sparkles className="w-3.5 h-3.5" />;
            case 'content': return <Edit3 className="w-3.5 h-3.5" />;
            case 'formatting': return <AlertCircle className="w-3.5 h-3.5" />;
            default: return <Info className="w-3.5 h-3.5" />;
        }
    };

    const handleApprove = (suggestion: AISuggestion) => {
        console.log('Applying suggestion:', suggestion);
        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
        // TODO: Apply changes to profile
    };

    const handleDeny = (suggestionId: string) => {
        setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    };

    return (
        <Card className="mb-6">
            <CardHeader className="pb-3">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between text-left -m-1 p-1 rounded hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 text-white rounded-lg">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Resume Analysis</CardTitle>
                            <CardDescription className="text-xs">Score: {totalScore}/{maxTotalScore} • {suggestions.length} Suggestions</CardDescription>
                        </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
            </CardHeader>

            {isExpanded && (
                <CardContent className="space-y-6 pt-3">
                    {/* Score Metrics */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Overall Score */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-600">Overall</span>
                                <Badge variant={percentage >= 80 ? 'default' : 'secondary'} className="h-5 px-2 text-xs">
                                    {overallGrade}
                                </Badge>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold">{totalScore}</span>
                                <span className="text-sm text-slate-500">/ {maxTotalScore}</span>
                            </div>
                            <Progress value={percentage} className="h-1.5" />
                        </div>

                        {/* ATS Pass Rate */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-600">ATS Pass</span>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="w-3 h-3 text-slate-400" />
                                        </TooltipTrigger>
                                        <TooltipContent><p className="text-xs">Likelihood of passing automated screening</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold">{atsCompatibility}</span>
                                <span className="text-sm text-slate-500">%</span>
                            </div>
                            <Progress value={atsCompatibility} className="h-1.5" />
                        </div>

                        {/* Job Readiness */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-600">Readiness</span>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="w-3 h-3 text-slate-400" />
                                        </TooltipTrigger>
                                        <TooltipContent><p className="text-xs">Competitiveness vs other candidates</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold">{jobReadiness}</span>
                                <span className="text-sm text-slate-500">%</span>
                            </div>
                            <Progress value={jobReadiness} className="h-1.5" />
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-slate-700">{summary}</p>
                    </div>

                    {/* Ask AI Section */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <MessageSquare className="w-3 h-3" /> Ask AI
                        </h4>
                        <div className="flex flex-col gap-2">
                            {['How can I improve my resume?', 'Is this ATS-friendly?', 'What keywords am I missing?'].map((question, i) => (
                                <button key={i} className="text-left text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors border border-transparent hover:border-blue-100">
                                    • {question}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Integrated Enhanced AI Suggestions */}
                    <div className="pt-4 border-t border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="w-3 h-3 text-purple-500" /> AI Suggestions
                            </h4>
                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                {suggestions.length} Available
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            {suggestions.slice(0, showAllSuggestions ? undefined : 2).map((suggestion) => (
                                <div
                                    key={suggestion.id}
                                    className="group relative border border-slate-200 rounded-lg p-3 hover:border-slate-300 hover:shadow-sm transition-all bg-white"
                                >
                                    {/* Header */}
                                    <div className="flex items-start gap-3 mb-2">
                                        <div className={`p-1.5 rounded shrink-0 ${getSeverityColor(suggestion.severity)}`}>
                                            {getCategoryIcon(suggestion.category)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className="text-sm font-medium text-slate-900 truncate">
                                                    {suggestion.title}
                                                </h4>
                                                <Badge variant="outline" className="text-[10px] h-4 px-1 shrink-0">
                                                    {suggestion.category}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-1">{suggestion.whatToChange}</p>
                                        </div>
                                    </div>

                                    {/* Expanded Details (Always visible in this unified view) */}
                                    <div className="pl-10 space-y-2">
                                        <div className="p-2 bg-slate-50 rounded text-xs text-slate-700">
                                            <span className="font-medium text-slate-900">Why: </span>
                                            {suggestion.whyItMatters}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 pt-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeny(suggestion.id)}
                                                className="h-6 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 px-2"
                                            >
                                                <X className="w-3 h-3 mr-1" /> Dismiss
                                            </Button>
                                            <div className="flex-1" />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-6 text-xs px-2"
                                            >
                                                <Edit3 className="w-3 h-3 mr-1" /> Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleApprove(suggestion)}
                                                className="h-6 text-xs bg-slate-900 hover:bg-slate-800 px-2"
                                            >
                                                <Check className="w-3 h-3 mr-1" /> Apply
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {suggestions.length > 2 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                                className="w-full text-xs text-slate-500 hover:text-slate-900"
                            >
                                {showAllSuggestions ? 'Show Less' : `View All ${suggestions.length} Suggestions`}
                            </Button>
                        )}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
