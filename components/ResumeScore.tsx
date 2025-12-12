'use client';

import { useState } from 'react';
import { ResumeProfile } from '@/lib/resume-schema';
import { calculateResumeScore, ScoreCategory } from '@/lib/resume-score';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown, CheckCircle2, AlertCircle, AlertTriangle, Lightbulb,
    ShieldCheck, FileCheck, ClipboardList, Sparkles, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResumeScoreProps {
    profile: ResumeProfile;
    className?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
    'ATS Compatibility': <ShieldCheck className="w-4 h-4" />,
    'Content Quality': <FileCheck className="w-4 h-4" />,
    'Completeness': <ClipboardList className="w-4 h-4" />,
    'Professional Polish': <Sparkles className="w-4 h-4" />,
};

export function ResumeScore({ profile, className = '' }: ResumeScoreProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    const score = calculateResumeScore(profile);
    const { categories, percentage, overallGrade, summary, atsCompatibility, jobReadiness } = score;

    const totalIssues = categories.reduce((sum, cat) => sum + cat.tips.length, 0);

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return { ring: 'stroke-emerald-500', bg: 'bg-emerald-500', text: 'text-emerald-600' };
            case 'B': return { ring: 'stroke-emerald-400', bg: 'bg-emerald-400', text: 'text-emerald-500' };
            case 'C': return { ring: 'stroke-amber-500', bg: 'bg-amber-500', text: 'text-amber-600' };
            case 'D': return { ring: 'stroke-orange-500', bg: 'bg-orange-500', text: 'text-orange-600' };
            default: return { ring: 'stroke-red-500', bg: 'bg-red-500', text: 'text-red-600' };
        }
    };

    const getStatusIcon = (status: ScoreCategory['status']) => {
        switch (status) {
            case 'excellent': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'good': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
            case 'needs-work': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'critical': return <AlertCircle className="w-4 h-4 text-red-500" />;
        }
    };

    const colors = getGradeColor(overallGrade);
    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className={`${className}`}>
            {/* Compact Circle Score - Click to Expand */}
            <motion.div
                className="cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    {/* Circular Progress */}
                    <div className="relative w-16 h-16 flex-shrink-0">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#e2e8f0"
                                strokeWidth="8"
                            />
                            {/* Progress circle */}
                            <motion.circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                className={colors.ring}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </svg>
                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-xl font-bold ${colors.text}`}>{overallGrade}</span>
                            <span className="text-[10px] text-slate-500">{percentage}%</span>
                        </div>
                    </div>

                    {/* Score Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 text-sm">Resume Score</h3>
                            {totalIssues > 0 && (
                                <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                                    {totalIssues} tips
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{summary}</p>
                    </div>

                    {/* Expand Icon */}
                    <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                </div>
            </motion.div>

            {/* Expanded Details Modal */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-slate-900">Score Breakdown</h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="p-4 space-y-3">
                            {categories.map((category) => {
                                const pct = Math.round((category.score / category.maxScore) * 100);
                                const isOpen = expandedCategory === category.label;
                                const icon = categoryIcons[category.label] || <CheckCircle2 className="w-4 h-4" />;

                                return (
                                    <div key={category.label} className="border border-slate-100 rounded-lg overflow-hidden">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedCategory(isOpen ? null : category.label);
                                            }}
                                            className="w-full p-3 hover:bg-slate-50 transition-colors text-left"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-slate-600">{icon}</div>
                                                    <span className="text-sm font-medium text-slate-700">{category.label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(category.status)}
                                                    <span className="text-sm font-semibold text-slate-600">
                                                        {category.score}/{category.maxScore}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Mini progress bar */}
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                                        }`}
                                                />
                                            </div>
                                        </button>

                                        {/* Expanded Tips */}
                                        <AnimatePresence>
                                            {isOpen && category.tips.length > 0 && (
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: 'auto' }}
                                                    exit={{ height: 0 }}
                                                    className="border-t border-slate-100 bg-blue-50/50"
                                                >
                                                    <div className="p-3 space-y-2">
                                                        {category.tips.map((tip, idx) => (
                                                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                                                                <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                                                <span>{tip}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer Stats */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-center p-3 bg-white rounded-lg">
                                    <div className="text-lg font-bold text-blue-600">{atsCompatibility}%</div>
                                    <div className="text-xs text-slate-500">ATS Ready</div>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg">
                                    <div className="text-lg font-bold text-purple-600">{jobReadiness}%</div>
                                    <div className="text-xs text-slate-500">Job Ready</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
