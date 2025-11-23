'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, Loader2, AlertCircle } from 'lucide-react';
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

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsProcessing(true);
        setError(null);

        try {
            const result = await resumeParser.parseResume(file);

            if (!result.success || !result.profile) {
                throw new Error(result.errors?.[0] || 'Failed to parse resume');
            }

            toast.success('Resume parsed successfully!');
            onUploadComplete(result.profile);
            onClose();
        } catch (err) {
            console.error('Upload error:', err);
            setError(err instanceof Error ? err.message : 'Failed to upload resume');
            toast.error('Failed to upload resume');
        } finally {
            setIsProcessing(false);
        }
    }, [onUploadComplete, onClose]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxFiles: 1,
        multiple: false
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Upload Resume</DialogTitle>
                    <DialogDescription>
                        Upload your existing resume to automatically extract your information.
                    </DialogDescription>
                </DialogHeader>

                <div
                    {...getRootProps()}
                    className={`
            mt-4 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'border-border hover:border-muted-foreground/50'}
            ${isProcessing ? 'pointer-events-none opacity-50' : ''}
          `}
                >
                    <input {...getInputProps()} />

                    {isProcessing ? (
                        <div className="flex flex-col items-center justify-center py-4">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                            <p className="text-sm font-medium text-foreground">Processing your resume...</p>
                            <p className="text-xs text-muted-foreground mt-1">This may take a few seconds</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-lg font-semibold text-foreground mb-2">
                                {isDragActive ? 'Drop your resume here' : 'Click or drag to upload'}
                            </p>
                            <p className="text-sm text-muted-foreground mb-4">
                                Supports PDF and DOCX up to 10MB
                            </p>
                            <Button variant="outline" className="mt-2">
                                Select File
                            </Button>
                        </>
                    )}
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-md flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <div className="text-sm text-red-600 dark:text-red-400">
                            <p className="font-medium">Upload Failed</p>
                            <p>{error}</p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
