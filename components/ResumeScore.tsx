'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ScoreBreakdown {
    completeness: number;
    impact: number;
    formatting: number;
    ats?: number;
}

interface ResumeScoreProps {
    score: number;
    breakdown?: ScoreBreakdown | null;
    isScoring?: boolean;
    className?: string;
}

export function ResumeScore({ score, breakdown, isScoring = false, className = '' }: ResumeScoreProps) {
    const getScoreColor = (value: number) => {
        if (value >= 80) return 'text-green-600 dark:text-green-400';
        if (value >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreBg = (value: number) => {
        if (value >= 80) return 'bg-green-100 dark:bg-green-900/30';
        if (value >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30';
        return 'bg-red-100 dark:bg-red-900/30';
    };

    const getScoreIcon = (value: number) => {
        if (value >= 80) return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />;
        if (value >= 60) return <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
        return <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />;
    };

    return (
        <Card className={`border-border shadow-sm bg-card ${className}`}>
            <CardHeader className="pb-2 border-b border-border bg-accent/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-foreground">Resume Score</CardTitle>
                    {isScoring && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
                {/* Main Score */}
                <div className="flex flex-col items-center justify-center py-2">
                    <div className={`relative flex items-center justify-center w-24 h-24 rounded-full border-4 ${score >= 80 ? 'border-green-500' : score >= 60 ? 'border-yellow-500' : 'border-red-500'
                        } bg-background`}>
                        <div className="text-center">
                            <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
                                {score}
                            </span>
                        </div>
                    </div>
                    <p className="mt-2 text-sm font-medium text-muted-foreground">
                        {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good Start' : 'Needs Improvement'}
                    </p>
                </div>

                {/* Breakdown */}
                {breakdown && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Completeness</span>
                                <span className="font-medium text-foreground">{breakdown.completeness}/100</span>
                            </div>
                            <Progress value={breakdown.completeness} className="h-2" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Impact</span>
                                <span className="font-medium text-foreground">{breakdown.impact}/100</span>
                            </div>
                            <Progress value={breakdown.impact} className="h-2" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Formatting</span>
                                <span className="font-medium text-foreground">{breakdown.formatting}/100</span>
                            </div>
                            <Progress value={breakdown.formatting} className="h-2" />
                        </div>

                        {typeof breakdown.ats === 'number' && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">ATS Target</span>
                                    <span className="font-medium text-foreground">{breakdown.ats}/100</span>
                                </div>
                                <Progress value={breakdown.ats} className="h-2" />
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
