'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Sparkles,
    Upload,
    Link as LinkIcon,
    FileText,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BaseResume } from '@/app/dashboard/page';
import toast from 'react-hot-toast';

interface TailorResumeModalProps {
    isOpen: boolean;
    onClose: () => void;
    baseResumes: BaseResume[];
    selectedBaseResumeId?: string;
}

type InputMethod = 'text' | 'url' | 'file';

export function TailorResumeModal({
    isOpen,
    onClose,
    baseResumes,
    selectedBaseResumeId
}: TailorResumeModalProps) {
    const router = useRouter();
    const [selectedBaseId, setSelectedBaseId] = useState(selectedBaseResumeId || '');
    const [inputMethod, setInputMethod] = useState<InputMethod>('text');
    const [jobDescription, setJobDescription] = useState('');
    const [jobUrl, setJobUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);

    const handleExtractFromUrl = async () => {
        if (!jobUrl.trim()) {
            toast.error('Please enter a valid URL');
            return;
        }

        setIsExtracting(true);
        try {
            // Use Jina AI Reader for free web scraping
            const jinaUrl = `https://r.jina.ai/${jobUrl}`;
            const response = await fetch(jinaUrl);

            if (!response.ok) {
                throw new Error('Failed to extract content');
            }

            const markdown = await response.text();
            const lowerContent = markdown.toLowerCase();

            // Detect login/auth pages - these indicate the page requires authentication
            const loginIndicators = [
                'sign in',
                'log in',
                'login',
                'signin',
                'password',
                'forgot password',
                'create account',
                'join now',
                'keep me logged in',
                'email or phone',
                'enter your password'
            ];

            const isLoginPage = loginIndicators.filter(indicator => 
                lowerContent.includes(indicator)
            ).length >= 3; // If 3+ login indicators found, it's likely a login page

            if (isLoginPage) {
                toast.error(
                    'This page requires login to view. Please copy and paste the job description directly instead.',
                    { duration: 5000 }
                );
                setInputMethod('text');
                setIsExtracting(false);
                return;
            }

            // Extract the main content (remove Jina AI metadata if any)
            const cleanedContent = markdown
                .split('\n')
                .filter(line => {
                    const trimmed = line.trim().toLowerCase();
                    // Remove metadata lines
                    if (line.startsWith('Title:') || line.startsWith('URL:') || line.startsWith('URL Source:')) return false;
                    if (line.startsWith('Markdown Content:')) return false;
                    // Remove common footer/nav elements
                    if (trimmed.includes('cookie policy') || trimmed.includes('privacy policy')) return false;
                    if (trimmed.includes('terms of service') || trimmed.includes('user agreement')) return false;
                    if (trimmed.includes('copyright') || trimmed.includes('all rights reserved')) return false;
                    return true;
                })
                .join('\n')
                .trim();

            // Check if we got meaningful content
            if (cleanedContent.length < 100) {
                toast.error(
                    'Could not extract enough content from this URL. Please copy and paste the job description directly.',
                    { duration: 5000 }
                );
                setInputMethod('text');
                setIsExtracting(false);
                return;
            }

            setJobDescription(cleanedContent);
            setInputMethod('text'); // Switch to text view to show extracted content
            toast.success('Job description extracted! Please review and edit if needed.');
        } catch (error) {
            console.error('Error extracting from URL:', error);
            toast.error('Failed to extract job description. Please try copying the text directly.');
        } finally {
            setIsExtracting(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files?.[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);

        // Read file content
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setJobDescription(content);
            setInputMethod('text'); // Switch to text view
            toast.success('File uploaded successfully!');
        };
        reader.readAsText(uploadedFile);
    };

    const handleSubmit = async () => {
        if (!selectedBaseId) {
            toast.error('Please select a base resume');
            return;
        }

        if (!jobDescription.trim()) {
            toast.error('Please provide a job description');
            return;
        }

        setIsLoading(true);
        try {
            // Store job description in sessionStorage for the builder to pick up
            sessionStorage.setItem('tailorJobDescription', jobDescription);
            
            // Close modal and redirect to builder in tailor mode
            onClose();
            router.push(`/builder?baseId=${selectedBaseId}&mode=tailor`);
        } catch (error) {
            console.error('Error starting tailor flow:', error);
            toast.error('Failed to start tailoring');
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">Create Tailored Resume</h2>
                                        <p className="text-sm text-slate-500">Optimize your resume for a specific job</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                    className="rounded-full"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                                {/* Base Resume Selection */}
                                <div className="mb-6">
                                    <Label className="text-sm font-semibold text-slate-700 mb-2">
                                        Select Base Resume {selectedBaseResumeId && <span className="text-blue-600">(Auto-selected)</span>}
                                    </Label>
                                    <select
                                        value={selectedBaseId}
                                        onChange={(e) => setSelectedBaseId(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                                    >
                                        <option value="">Choose a base resume...</option>
                                        {baseResumes.map((resume) => (
                                            <option key={resume.id} value={resume.id}>
                                                {resume.title}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedBaseResumeId && (
                                        <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            The resume you clicked is already selected. You can change it if needed.
                                        </p>
                                    )}
                                </div>

                                {/* Input Method Tabs */}
                                <div className="mb-4">
                                    <Label className="text-sm font-semibold text-slate-700 mb-2">Job Description</Label>
                                    <div className="flex gap-2 mb-4">
                                        <button
                                            onClick={() => setInputMethod('text')}
                                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${inputMethod === 'text'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            <FileText className="w-4 h-4 inline mr-2" />
                                            Paste Text
                                        </button>
                                        <button
                                            onClick={() => setInputMethod('url')}
                                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${inputMethod === 'url'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            <LinkIcon className="w-4 h-4 inline mr-2" />
                                            From URL
                                        </button>
                                        <button
                                            onClick={() => setInputMethod('file')}
                                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${inputMethod === 'file'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            <Upload className="w-4 h-4 inline mr-2" />
                                            Upload File
                                        </button>
                                    </div>
                                </div>

                                {/* Text Input */}
                                {inputMethod === 'text' && (
                                    <div>
                                        <Textarea
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            placeholder="Paste the job description here..."
                                            className="w-full min-h-[300px] px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        />
                                        <p className="text-xs text-slate-500 mt-2">
                                            {jobDescription.length} characters
                                        </p>
                                    </div>
                                )}

                                {/* URL Input */}
                                {inputMethod === 'url' && (
                                    <div>
                                        <div className="flex gap-2 mb-3">
                                            <Input
                                                value={jobUrl}
                                                onChange={(e) => setJobUrl(e.target.value)}
                                                placeholder="https://jobs.company.com/posting/..."
                                                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                onKeyDown={(e) => e.key === 'Enter' && handleExtractFromUrl()}
                                            />
                                            <Button
                                                onClick={handleExtractFromUrl}
                                                disabled={isExtracting || !jobUrl.trim()}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 rounded-xl"
                                            >
                                                {isExtracting ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    'Extract'
                                                )}
                                            </Button>
                                        </div>
                                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                            <div className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-sm font-semibold text-blue-900 mb-1">Free Web Scraping</p>
                                                    <p className="text-xs text-blue-700">
                                                        We use Jina AI Reader to extract clean text from any job posting URL.
                                                        Just paste the link and click Extract!
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* File Upload */}
                                {inputMethod === 'file' && (
                                    <div>
                                        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
                                            <input
                                                type="file"
                                                accept=".txt,.pdf,.doc,.docx"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />
                                            <Upload className="w-12 h-12 text-slate-400 mb-3" />
                                            <p className="text-sm font-semibold text-slate-700 mb-1">
                                                {file ? file.name : 'Click to upload or drag and drop'}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                TXT, PDF, DOC, DOCX (Max 10MB)
                                            </p>
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="px-6 rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isLoading || !selectedBaseId || !jobDescription.trim()}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-8 rounded-xl font-semibold"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Create Tailored Resume
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
