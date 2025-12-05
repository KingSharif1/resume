'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { resumeParser } from '@/lib/services/resume-parser';
import { ResumeProfile } from '@/lib/resume-schema';
import { toast } from 'react-hot-toast';

interface ResumeUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete: (profile: ResumeProfile) => void;
}

export function ResumeUploadModal({ isOpen, onClose, onUploadComplete }: ResumeUploadModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resumeName, setResumeName] = useState('');
    const [targetJob, setTargetJob] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        console.log('[Upload] File selected:', file.name, file.size, file.type);
        setSelectedFile(file);
        // Auto-fill name from filename if empty
        if (!resumeName) {
            setResumeName(file.name.replace(/\.[^/.]+$/, ""));
        }
        setError(null);
    }, [resumeName]);

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        console.log('[Upload] Starting upload process...');
        setIsProcessing(true);
        setError(null);

        try {
            console.log('[Upload] Sending file to parser service...');
            const result = await resumeParser.parseResume(selectedFile);
            console.log('[Upload] Parser service response:', result);

            if (!result.success || !result.profile) {
                console.error('[Upload] Parsing failed:', result.errors);
                throw new Error(result.errors?.[0] || 'Failed to parse resume');
            }

            console.log('[Upload] Parsing successful, profile data received');

            // Add the custom name and target job to the profile if provided
            const finalProfile = {
                ...result.profile,
                resumeName: resumeName || selectedFile.name.replace(/\.[^/.]+$/, ""),
                targetJob: targetJob || undefined
            };

            toast.success('Resume parsed successfully!');
            onUploadComplete(finalProfile);

            // Reset state
            setSelectedFile(null);
            setResumeName('');
            setTargetJob('');
            onClose();
        } catch (err) {
            console.error('[Upload] Error caught in handleUpload:', err);
            setError(err instanceof Error ? err.message : 'Failed to upload resume');
            toast.error('Failed to upload resume');
        } finally {
            setIsProcessing(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxFiles: 1,
        multiple: false,
        disabled: isProcessing
    });

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        setResumeName('');
        setTargetJob('');
        setError(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Upload Resume</DialogTitle>
                    <DialogDescription>
                        Upload your existing resume to automatically extract your information.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Resume Name Input */}
                    <div className="space-y-2">
                        <Label htmlFor="resume-name">Resume Name (Optional)</Label>
                        <Input
                            id="resume-name"
                            placeholder="e.g. Software Engineer Resume"
                            value={resumeName}
                            onChange={(e) => setResumeName(e.target.value)}
                            disabled={isProcessing}
                        />
                    </div>

                    {/* Target Job Input */}
                    <div className="space-y-2">
                        <Label htmlFor="target-job">Target Job Title (Optional)</Label>
                        <Input
                            id="target-job"
                            placeholder="e.g. Senior Frontend Developer"
                            value={targetJob}
                            onChange={(e) => setTargetJob(e.target.value)}
                            disabled={isProcessing}
                        />
                    </div>

                    {/* Dropzone */}
                    <div
                        {...getRootProps()}
                        className={`
                            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
                            ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-[1.02]' : 'border-border hover:border-muted-foreground/50'}
                            ${isProcessing ? 'pointer-events-none opacity-50' : ''}
                            ${selectedFile ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : ''}
                        `}
                    >
                        <input {...getInputProps()} />

                        {isProcessing ? (
                            <div className="flex flex-col items-center justify-center py-4">
                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                                <p className="text-sm font-medium text-foreground">Processing your resume...</p>
                                <p className="text-xs text-muted-foreground mt-1">Extracting text and analyzing content</p>
                            </div>
                        ) : selectedFile ? (
                            <div className="flex flex-col items-center justify-center py-2">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                                    <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-sm font-semibold text-foreground truncate max-w-[200px]">
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-muted-foreground mb-4">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={removeFile}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                >
                                    <X className="w-4 h-4 mr-1" /> Remove
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <p className="text-lg font-semibold text-foreground mb-2">
                                    {isDragActive ? 'Drop it here!' : 'Click or drag to upload'}
                                </p>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Supports PDF and DOCX up to 10MB
                                </p>
                            </>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md flex items-start text-sm">
                            <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || isProcessing}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isProcessing ? 'Parsing...' : 'Import Resume'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

