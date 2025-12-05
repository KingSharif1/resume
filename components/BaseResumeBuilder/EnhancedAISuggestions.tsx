'use client';

import { useState } from 'react';
import { ResumeProfile } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Check,
    X,
    Edit3,
    Info,
    Sparkles,
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface AISuggestion {
    id: string;
    category: 'content' | 'ats' | 'formatting' | 'keywords';
    severity: 'high' | 'medium' | 'low';
    title: string;
    whatToChange: string;
    whyItMatters: string;
    targetSection?: string; // For hover preview
    targetId?: string; // Specific item ID
    action: {
        type: 'add' | 'update' | 'remove' | 'rewrite';
        data: any;
    };
}

interface EnhancedAISuggestionsProps {
    profile: ResumeProfile;
    onUpdateProfile: (updates: Partial<ResumeProfile>) => void;
}

export function EnhancedAISuggestions({ profile, onUpdateProfile }: EnhancedAISuggestionsProps) {
    const [suggestions, setSuggestions] = useState<AISuggestion[]>([
        // Mock suggestions for demonstration
        {
            id: '1',
            category: 'ats',
            severity: 'high',
            title: 'Add quantified achievements',
            whatToChange: 'Add numbers and metrics to your experience bullets (e.g., "Increased sales by 30%")',
            whyItMatters: 'ATS systems and recruiters prioritize measurable results. Quantified achievements make your impact clear and help you stand out.',
            targetSection: 'experience',
            action: {
                type: 'update',
                data: {}
            }
        },
        {
            id: '2',
            category: 'keywords',
            severity: 'medium',
            title: 'Missing key technical skills',
            whatToChange: 'Add "React", "TypeScript", and "Node.js" to your skills section',
            whyItMatters: 'These are common keywords in software engineering job descriptions. Adding them increases ATS match rate by ~25%.',
            targetSection: 'skills',
            action: {
                type: 'add',
                data: {
                    category: 'Technical',
                    skills: ['React', 'TypeScript', 'Node.js']
                }
            }
        },
        {
            id: '3',
            category: 'content',
            severity: 'medium',
            title: 'Strengthen action verbs',
            whatToChange: 'Replace "Responsible for" with stronger verbs like "Led", "Managed", or "Spearheaded"',
            whyItMatters: 'Action verbs make you sound proactive and results-driven. Passive language weakens your accomplishments.',
            targetSection: 'experience',
            action: {
                type: 'rewrite',
                data: {}
            }
        }
    ]);

    const [customizing, setCustomizing] = useState<string | null>(null);

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
            case 'ats': return <TrendingUp className="w-4 h-4" />;
            case 'keywords': return <Sparkles className="w-4 h-4" />;
            case 'content': return <Edit3 className="w-4 h-4" />;
            case 'formatting': return <AlertCircle className="w-4 h-4" />;
            default: return <Info className="w-4 h-4" />;
        }
    };

    const handleApprove = (suggestion: AISuggestion) => {
        // Apply the suggestion
        console.log('Applying suggestion:', suggestion);

        // Remove from list
        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));

        // TODO: Actually apply the changes to profile
    };

    const handleDeny = (suggestionId: string) => {
        setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    };

    const handleCustomize = (suggestionId: string) => {
        setCustomizing(suggestionId);
        // TODO: Open modal or inline editor
    };

    if (suggestions.length === 0) {
        return null;
    }

    return (
        <Card className="mb-6">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 text-white rounded-lg">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <CardTitle className="text-base">AI Suggestions</CardTitle>
                            <CardDescription className="text-xs">
                                {suggestions.length} improvement{suggestions.length !== 1 ? 's' : ''} available
                            </CardDescription>
                        </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        Beta
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-3">
                {suggestions.map((suggestion) => (
                    <div
                        key={suggestion.id}
                        className="group relative border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-sm transition-all"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-start gap-2 flex-1">
                                <div className={`p-1.5 rounded ${getSeverityColor(suggestion.severity)}`}>
                                    {getCategoryIcon(suggestion.category)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-slate-900 mb-1">
                                        {suggestion.title}
                                    </h4>
                                    <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                                        {suggestion.category.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button className="text-slate-400 hover:text-slate-600">
                                            <Info className="w-4 h-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" className="max-w-xs">
                                        <p className="text-xs">
                                            Hover over this suggestion to see which part of your resume it affects
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {/* What to Change */}
                        <div className="mb-3 pl-9">
                            <p className="text-xs font-medium text-slate-600 mb-1">What to change:</p>
                            <p className="text-sm text-slate-900">{suggestion.whatToChange}</p>
                        </div>

                        {/* Why It Matters */}
                        <div className="mb-4 pl-9 pb-3 border-b border-slate-100">
                            <p className="text-xs font-medium text-slate-600 mb-1">Why it matters:</p>
                            <p className="text-xs text-slate-600 leading-relaxed">{suggestion.whyItMatters}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pl-9">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeny(suggestion.id)}
                                className="h-7 text-xs"
                            >
                                <X className="w-3 h-3 mr-1.5" />
                                Deny
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCustomize(suggestion.id)}
                                className="h-7 text-xs"
                            >
                                <Edit3 className="w-3 h-3 mr-1.5" />
                                Customize
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handleApprove(suggestion)}
                                className="h-7 text-xs ml-auto bg-slate-900 hover:bg-slate-800"
                            >
                                <Check className="w-3 h-3 mr-1.5" />
                                Approve
                            </Button>
                        </div>
                    </div>
                ))}

                {/* Info Footer */}
                <div className="pt-2 border-t border-slate-200">
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Info className="w-3 h-3" />
                        Hover over suggestions to preview changes in your resume
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
