'use client';

import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useResumeSettings } from '@/lib/resume-settings-context';
import { cn } from '@/lib/utils';

interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate?: (template: string) => void;
}

const templates = [
    {
        id: 'Basic',
        name: 'Basic',
        description: 'Clean and simple design',
        preview: {
            headerAlign: 'left',
            sectionStyle: 'border-b border-slate-300',
            headerBg: 'transparent',
            font: 'Inter'
        }
    },
    {
        id: 'Modern',
        name: 'Modern',
        description: 'Contemporary and stylish',
        preview: {
            headerAlign: 'center',
            sectionStyle: 'bg-blue-50 rounded px-2 py-1',
            headerBg: 'bg-slate-50 border-b-2 border-blue-500',
            font: 'Roboto'
        }
    },
    {
        id: 'Professional',
        name: 'Professional',
        description: 'Traditional business format',
        preview: {
            headerAlign: 'left',
            sectionStyle: 'border-b-2 border-black',
            headerBg: 'transparent',
            font: 'Times New Roman'
        }
    },
    {
        id: 'Creative',
        name: 'Creative',
        description: 'Stand out with unique design',
        preview: {
            headerAlign: 'right',
            sectionStyle: 'border-b border-purple-400',
            headerBg: 'bg-gradient-to-r from-purple-50 to-blue-50',
            font: 'Georgia'
        }
    },
];

export function TemplateModal({ isOpen, onClose, onSelectTemplate }: TemplateModalProps) {
    const { settings, updateSettings } = useResumeSettings();

    if (!isOpen) return null;

    const handleSelect = (templateId: string) => {
        let newSettings: any = { template: templateId };

        // Apply preset settings based on template
        switch (templateId) {
            case 'Modern':
                newSettings.font = { ...settings.font, primary: 'Roboto', secondary: 'Roboto' };
                newSettings.layout = { ...settings.layout, headerAlignment: 'center', skillsLayout: 'columns' };
                break;
            case 'Professional':
                newSettings.font = { ...settings.font, primary: 'Times New Roman', secondary: 'Arial' };
                newSettings.layout = { ...settings.layout, headerAlignment: 'left', skillsLayout: 'comma' };
                break;
            case 'Creative':
                newSettings.font = { ...settings.font, primary: 'Georgia', secondary: 'Verdana' };
                newSettings.layout = { ...settings.layout, headerAlignment: 'right' };
                break;
            default: // Basic
                newSettings.font = { ...settings.font, primary: 'Inter', secondary: 'Inter' };
                newSettings.layout = { ...settings.layout, headerAlignment: 'left' };
                break;
        }

        updateSettings(newSettings);
        if (onSelectTemplate) {
            onSelectTemplate(templateId);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Enhanced Header */}
                <div className="sticky top-0 bg-gradient-to-r from-white to-slate-50 border-b border-slate-200 px-8 py-6 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Choose a Template</h2>
                        <p className="text-sm text-slate-600 mt-1">Select a template to instantly update your resume design</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-10 w-10 p-0 rounded-full hover:bg-slate-100 transition-all duration-200"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Templates Grid */}
                <div className="p-8 overflow-y-auto max-h-[calc(85vh-100px)]">
                    <div className="grid grid-cols-2 gap-6">
                        {templates.map((template) => {
                            const isSelected = settings.template === template.id;
                            return (
                                <Card
                                    key={template.id}
                                    className={cn(
                                        "cursor-pointer hover:shadow-xl transition-all duration-300 border-2 group",
                                        isSelected
                                            ? "border-blue-600 ring-4 ring-blue-100 shadow-lg"
                                            : "border-slate-200 hover:border-blue-300 hover:-translate-y-1"
                                    )}
                                    onClick={() => handleSelect(template.id)}
                                >
                                    <CardContent className="p-6 relative">
                                        {/* Selection Badge */}
                                        {isSelected && (
                                            <div className="absolute top-4 right-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white p-1.5 rounded-full shadow-lg animate-in zoom-in duration-200">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}

                                        {/* Mini Resume Preview */}
                                        <div className="aspect-[8.5/11] bg-white rounded-lg mb-4 border-2 border-slate-200 overflow-hidden shadow-sm group-hover:shadow-md transition-shadow duration-300">
                                            <div className="p-4 h-full flex flex-col" style={{ fontFamily: template.preview.font, fontSize: '6px' }}>
                                                {/* Header */}
                                                <div className={cn("pb-2 mb-2", template.preview.headerBg)} style={{ textAlign: template.preview.headerAlign as any }}>
                                                    <div className="font-bold text-[10px] mb-1">JOHN DOE</div>
                                                    <div className="text-[5px] text-slate-600">email@example.com • (555) 123-4567</div>
                                                </div>

                                                {/* Section 1 */}
                                                <div className="mb-2">
                                                    <div className={cn("font-bold text-[7px] mb-1", template.preview.sectionStyle)}>EXPERIENCE</div>
                                                    <div className="space-y-1">
                                                        <div>
                                                            <div className="font-semibold text-[6px]">Senior Developer</div>
                                                            <div className="text-[5px] text-slate-600">Tech Company • 2020-Present</div>
                                                            <div className="text-[5px] text-slate-700 mt-0.5">• Led development of key features</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Section 2 */}
                                                <div className="mb-2">
                                                    <div className={cn("font-bold text-[7px] mb-1", template.preview.sectionStyle)}>EDUCATION</div>
                                                    <div>
                                                        <div className="font-semibold text-[6px]">University Name</div>
                                                        <div className="text-[5px] text-slate-600">Bachelor of Science • 2018</div>
                                                    </div>
                                                </div>

                                                {/* Section 3 */}
                                                <div>
                                                    <div className={cn("font-bold text-[7px] mb-1", template.preview.sectionStyle)}>SKILLS</div>
                                                    <div className="text-[5px] text-slate-700">JavaScript • React • Node.js • Python</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Template Info */}
                                        <div className="text-center">
                                            <h3 className={cn(
                                                "font-bold text-lg mb-1 transition-colors duration-200",
                                                isSelected ? "text-blue-600" : "text-slate-900 group-hover:text-blue-600"
                                            )}>
                                                {template.name}
                                            </h3>
                                            <p className="text-sm text-slate-600">{template.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
