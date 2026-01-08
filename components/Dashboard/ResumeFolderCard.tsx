'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FolderOpen,
    FolderClosed,
    ChevronDown,
    ChevronRight,
    Edit3,
    MoreHorizontal,
    File,
    Sparkles,
    FileText,
    CornerDownRight,
    Check,
    X,
    Calendar,
    Target,
    Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BaseResume } from '@/app/dashboard/page';
import toast from 'react-hot-toast';

interface TailoredResume {
    id: string;
    title: string;
    created_at: string;
    score?: number;
    target_job_description?: string;
}

interface ResumeFolderCardProps {
    resume: BaseResume;
    tailoredResumes?: TailoredResume[];
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onEdit: (id: string) => void;
    onUpdateTitle?: (id: string, newTitle: string) => Promise<void>;
}

export function ResumeFolderCard({
    resume,
    tailoredResumes = [],
    onDelete,
    onDuplicate,
    onEdit,
    onUpdateTitle
}: ResumeFolderCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(resume.title);
    const router = useRouter();

    const handleSaveName = async () => {
        if (editedName.trim() && editedName !== resume.title) {
            try {
                await onUpdateTitle?.(resume.id, editedName.trim());
                toast.success('Resume name updated');
            } catch (error) {
                toast.error('Failed to update name');
                setEditedName(resume.title);
            }
        }
        setIsEditingName(false);
    };

    const handleCancelEdit = () => {
        setEditedName(resume.title);
        setIsEditingName(false);
    };

    const getScoreColor = (score?: number) => {
        if (!score) return 'bg-slate-50 text-slate-700 border-slate-100';
        if (score >= 90) return 'bg-green-50 text-green-700 border-green-100';
        if (score >= 75) return 'bg-yellow-50 text-yellow-700 border-yellow-100';
        return 'bg-orange-50 text-orange-700 border-orange-100';
    };

    const getScoreIndicatorColor = (score?: number) => {
        if (!score) return 'bg-slate-500';
        if (score >= 90) return 'bg-green-500';
        if (score >= 75) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all group"
        >
            {/* Compact Folder Header */}
            <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                {/* Left: Folder Icon + Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="shrink-0 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        {isExpanded ? (
                            <FolderOpen className="w-5 h-5 text-blue-600" />
                        ) : (
                            <FolderClosed className="w-5 h-5 text-slate-600" />
                        )}
                    </button>

                    <div className="flex-1 min-w-0">
                        {isEditingName ? (
                            <div className="flex items-center gap-2">
                                <Input
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveName();
                                        if (e.key === 'Escape') handleCancelEdit();
                                    }}
                                    className="h-8 text-sm font-semibold"
                                    autoFocus
                                    onBlur={handleSaveName}
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={handleSaveName}
                                >
                                    <Check className="w-4 h-4 text-green-600" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={handleCancelEdit}
                                >
                                    <X className="w-4 h-4 text-red-600" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <h3
                                    onClick={() => onEdit(resume.id)}
                                    className="font-semibold text-slate-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
                                >
                                    {resume.title}
                                </h3>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsEditingName(true);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all"
                                >
                                    <Edit3 className="w-3 h-3 text-slate-500" />
                                </button>
                            </div>
                        )}

                        {/* Compact Info Row */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(resume.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            {resume.target_job && (
                                <span className="flex items-center gap-1 truncate max-w-[200px]">
                                    <Target className="w-3 h-3" />
                                    {resume.target_job}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Layers className="w-3 h-3" />
                                {tailoredResumes.length} tailored
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`h-8 w-8 p-0 ${isExpanded ? 'bg-slate-100' : ''}`}
                    >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {/* Expanded: Tailored Resumes */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-slate-100 bg-slate-50/50 overflow-hidden"
                    >
                        <div className="p-4 pl-14 space-y-2">
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <CornerDownRight className="w-3 h-3" />
                                Tailored Versions ({tailoredResumes.length})
                            </div>

                            {tailoredResumes.length > 0 ? (
                                tailoredResumes.map((tailored) => (
                                    <motion.div
                                        key={tailored.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 hover:border-blue-300 transition-all cursor-pointer group/item relative overflow-hidden"
                                        onClick={() => router.push(`/builder?id=${tailored.id}&mode=tailored`)}
                                    >
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${getScoreIndicatorColor(tailored.score)}`} />
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <File className="w-4 h-4 text-slate-400 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-medium text-sm text-slate-800 group-hover/item:text-blue-600 transition-colors truncate">
                                                    {tailored.title}
                                                </h4>
                                                <p className="text-xs text-slate-400">
                                                    {new Date(tailored.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        {tailored.score && (
                                            <div className={`px-2 py-0.5 rounded text-xs font-bold border shrink-0 ${getScoreColor(tailored.score)}`}>
                                                {tailored.score}%
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 text-center py-6">
                                    No tailored versions yet
                                </p>
                            )}

                            {/* Create Tailored Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/builder?baseId=${resume.id}&mode=tailor`);
                                }}
                                className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 text-xs font-medium mt-3"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                Tailor for new job
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
