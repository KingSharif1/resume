'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, ChevronDown, ChevronUp, Target } from 'lucide-react';

interface TargetJobPanelProps {
    jobDescription: string;
    onJobDescriptionChange: (value: string) => void;
    className?: string;
}

export function TargetJobPanel({ jobDescription, onJobDescriptionChange, className = '' }: TargetJobPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card className={`border-border shadow-sm bg-card ${className}`}>
            <CardHeader
                className="py-3 px-4 border-b border-border bg-accent/50 cursor-pointer hover:bg-accent/70 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <CardTitle className="text-sm font-semibold text-foreground">Target Job</CardTitle>
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                            Paste the job description here to optimize your resume keywords and improve your ATS score.
                        </p>
                        <Textarea
                            value={jobDescription}
                            onChange={(e) => onJobDescriptionChange(e.target.value)}
                            placeholder="Paste job description..."
                            className="min-h-[150px] text-sm resize-none focus-visible:ring-blue-500"
                        />
                    </div>

                    {jobDescription && (
                        <div className="pt-2 border-t border-border">
                            <div className="flex items-center gap-2 mb-2">
                                <Briefcase className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs font-medium text-foreground">Keyword Analysis</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {/* Mock keywords for now - real implementation would analyze text */}
                                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] rounded-full">
                                    React
                                </span>
                                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] rounded-full">
                                    TypeScript
                                </span>
                                <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] rounded-full">
                                    Node.js
                                </span>
                            </div>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
