'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (template: string) => void;
}

const templates = [
    { id: 'basic', name: 'Basic', description: 'Clean and simple design' },
    { id: 'modern', name: 'Modern', description: 'Contemporary and stylish' },
    { id: 'professional', name: 'Professional', description: 'Traditional business format' },
    { id: 'creative', name: 'Creative', description: 'Stand out with unique design' },
];

export function TemplateModal({ isOpen, onClose, onSelectTemplate }: TemplateModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={onClose}>
            <div
                className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 rounded-t-lg">
                    <h2 className="text-xl font-semibold text-slate-900">Choose a Template</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Templates Grid */}
                <div className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                        {templates.map((template) => (
                            <Card
                                key={template.id}
                                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
                                onClick={() => {
                                    onSelectTemplate(template.id);
                                    onClose();
                                }}
                            >
                                <CardContent className="p-6">
                                    <div className="aspect-[8.5/11] bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
                                        <span className="text-slate-400 text-sm">Template Preview</span>
                                    </div>
                                    <h3 className="font-semibold text-slate-900 mb-1">{template.name}</h3>
                                    <p className="text-sm text-slate-600">{template.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
