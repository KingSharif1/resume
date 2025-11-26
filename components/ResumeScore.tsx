'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react';
import { ResumeProfile } from '@/lib/resume-schema';
import { calculateResumeScore } from '@/lib/resume-score';
import { useState } from 'react';

interface ResumeScoreProps {
    profile: ResumeProfile;
    className?: string;
}

export function ResumeScore({ profile, className = '' }: ResumeScoreProps) {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    const { categories, totalScore, maxTotalScore } = calculateResumeScore(profile);

    const getScoreColor = (score: number, max: number) => {
        const percentage = (score / max) * 100;
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBadgeColor = (score: number, max: number) => {
        const percentage = (score / max) * 100;
        if (percentage >= 80) return 'bg-green-600';
        if (percentage >= 50) return 'bg-yellow-600';
        return 'bg-red-600';
    };

    const getStatusIcon = (status: string) => {
        if (status === 'complete') return <CheckCircle2 className="w-4 h-4 text-green-600" />;
        if (status === 'partial') return <AlertCircle className="w-4 h-4 text-yellow-600" />;
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    };

    return (
        <Card className={`border-slate-200 shadow-lg bg-white ${className}`}>
            <CardHeader className="pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-slate-900">Resume Score</CardTitle>
                    <Badge className={`${getScoreBadgeColor(totalScore, maxTotalScore)} text-white font-bold px-3 py-1`}>
                        {totalScore}/{maxTotalScore}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-1">
                {/* Category List */}
                {categories.map((category) => (
                    <div key={category.label} className="border-b border-slate-50 last:border-0">
                        <button
                            onClick={() => setExpandedCategory(expandedCategory === category.label ? null : category.label)}
                            className="w-full flex items-center justify-between py-3 px-2 hover:bg-slate-50 rounded transition-colors text-left"
                        >
                            <div className="flex items-center gap-2 flex-1">
                                {getStatusIcon(category.status)}
                                <span className="text-sm font-medium text-slate-700">{category.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${getScoreColor(category.score, category.maxScore)}`}>
                                    {category.score}/{category.maxScore}
                                </span>
                                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${expandedCategory === category.label ? 'rotate-90' : ''}`} />
                            </div>
                        </button>

                        {/* Expanded Tips */}
                        {expandedCategory === category.label && category.tips.length > 0 && (
                            <div className="px-2 pb-3 space-y-1">
                                {category.tips.map((tip, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 bg-blue-50 p-2 rounded">
                                        <Lightbulb className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <span>{tip}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {/* Quick Tips Section */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-purple-600" />
                        <h4 className="text-sm font-semibold text-slate-900">Quick Tips</h4>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-600">
                        <li>• Use action verbs to describe your achievements</li>
                        <li>• Quantify your accomplishments with numbers</li>
                        <li>• Tailor your resume to the job description</li>
                        <li>• Keep formatting consistent throughout</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
