'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    X,
    Sparkles,
    Calendar,
    Eye,
    ChevronRight,
    Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BaseResume } from '@/app/dashboard/page';

interface TailoredResume {
    id: string;
    title: string;
    created_at: string;
    score?: number;
    target_job_description?: string;
}

interface FolderCardProps {
    resume: BaseResume;
    tailoredResumes?: TailoredResume[];
    onEdit: (id: string) => void;
    onUpdateTitle?: (id: string, newTitle: string) => Promise<void>;
    colorIndex: number;
}

const FOLDER_COLORS = [
    { bg: 'bg-blue-100/40', paper: 'bg-blue-50/60', tab: 'bg-blue-300/70', icon: 'bg-blue-500', pill: 'bg-white/60', text: 'text-blue-900' },
    { bg: 'bg-emerald-100/40', paper: 'bg-emerald-50/60', tab: 'bg-emerald-300/70', icon: 'bg-emerald-500', pill: 'bg-white/60', text: 'text-emerald-900' },
    { bg: 'bg-purple-100/40', paper: 'bg-purple-50/60', tab: 'bg-purple-300/70', icon: 'bg-purple-500', pill: 'bg-white/60', text: 'text-purple-900' },
    { bg: 'bg-orange-100/40', paper: 'bg-orange-50/60', tab: 'bg-orange-300/70', icon: 'bg-orange-500', pill: 'bg-white/60', text: 'text-orange-900' },
];

export function FolderCard({ resume, tailoredResumes = [], onEdit, onUpdateTitle, colorIndex }: FolderCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const router = useRouter();
    const color = FOLDER_COLORS[colorIndex % FOLDER_COLORS.length];

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative group cursor-pointer"
                onClick={() => setIsExpanded(true)}
            >
                {/* Layer 1: Folder Tab (Top) */}
                <div className={`absolute -top-2 left-6 w-28 h-6 ${color.tab} rounded-t-lg z-30`} />

                {/* Layer 2: White Paper Sheet (Middle) */}
                <div className="absolute top-4 left-0 right-0 h-full bg-white/90 rounded-2xl shadow-sm z-10" style={{ height: 'calc(100% - 16px)' }} />

                {/* Layer 3: Main Folder Body */}
                <div className={`relative ${color.bg} rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden z-20 group-hover:-translate-y-2`}>
                    <div className="p-6 pt-8">
                        {/* Category Pill */}
                        {resume.target_job && (
                            <div className="mb-3">
                                <span className={`inline-block px-3 py-1 ${color.pill} backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest rounded-full text-slate-700`}>
                                    {resume.target_job}
                                </span>
                            </div>
                        )}

                        {/* Resume Title */}
                        <h3 className={`text-xl font-bold ${color.text} mb-2 leading-tight`}>
                            {resume.title}
                        </h3>

                        {/* Metadata */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                                Edited {new Date(resume.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        </div>

                        {/* Variants Badge */}
                        <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 ${color.icon} rounded-full flex items-center justify-center text-white shadow-sm`}>
                                <Layers className="w-5 h-5" />
                            </div>
                            <span className={`text-xs font-semibold ${color.text}`}>
                                {tailoredResumes.length} Variant{tailoredResumes.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Bottom Sheet Modal */}
            <AnimatePresence>
                {isExpanded && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsExpanded(false)}
                            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
                        />

                        {/* Bottom Sheet */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 35, stiffness: 400 }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] shadow-2xl z-50 max-h-[85vh] overflow-hidden"
                        >
                            {/* Drag Handle */}
                            <div className="flex justify-center pt-4 pb-2">
                                <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                            </div>

                            {/* Header */}
                            <div className="px-8 py-4">
                                {/* Breadcrumb */}
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    {resume.target_job || 'BASE'} FOLDER • Last active {new Date(resume.updated_at).toLocaleDateString()}
                                </p>

                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-3xl font-bold text-slate-900 mb-1">{resume.title}</h2>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsExpanded(false)}
                                        className="rounded-full text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-slate-100" />

                            {/* Content */}
                            <div className="overflow-y-auto px-8 py-6" style={{ maxHeight: 'calc(85vh - 300px)' }}>
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Resume Versions</h3>

                                {tailoredResumes.length > 0 ? (
                                    <div className="space-y-3">
                                        {tailoredResumes.map((tailored) => (
                                            <motion.div
                                                key={tailored.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group/item"
                                                onClick={() => {
                                                    setIsExpanded(false);
                                                    router.push(`/builder?id=${tailored.id}&mode=tailored`);
                                                }}
                                            >
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-900 mb-1">{tailored.title}</h4>
                                                    <p className="text-xs text-slate-500">
                                                        {new Date(tailored.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    {tailored.score && (
                                                        <div className="text-right">
                                                            <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold mb-0.5">Match</p>
                                                            <p className="text-2xl font-bold text-slate-900">{tailored.score}%</p>
                                                        </div>
                                                    )}
                                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover/item:text-slate-600 transition-colors" />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Sparkles className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Empty Folder</h3>
                                        <p className="text-sm text-slate-500">
                                            This folder doesn't have any tailored resumes yet.<br />
                                            Create your first version!
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50">
                                <div className="flex gap-3">
                                    <Button
                                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl text-sm font-semibold shadow-sm"
                                        onClick={() => {
                                            setIsExpanded(false);
                                            router.push(`/builder?baseId=${resume.id}&mode=tailor`);
                                        }}
                                    >
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        New Tailored Version
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-12 px-8 rounded-xl text-sm font-semibold border-slate-200"
                                        onClick={() => {
                                            setIsExpanded(false);
                                            onEdit(resume.id);
                                        }}
                                    >
                                        View Base
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
