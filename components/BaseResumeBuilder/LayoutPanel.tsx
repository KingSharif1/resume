'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, GripVertical } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LayoutPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LayoutPanel({ isOpen, onClose }: LayoutPanelProps) {
    const [skillsLayout, setSkillsLayout] = useState('columns');
    const [sortSkills, setSortSkills] = useState('none');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
            <div
                className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-lg font-semibold text-slate-900">Layout & Style</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="layout" className="w-full">
                    <div className="border-b border-slate-200 px-6">
                        <TabsList className="w-full justify-start bg-transparent h-auto p-0">
                            <TabsTrigger value="settings" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">
                                Settings
                            </TabsTrigger>
                            <TabsTrigger value="text" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">
                                Text
                            </TabsTrigger>
                            <TabsTrigger value="layout" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">
                                Layout
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-6">
                        <TabsContent value="settings" className="mt-0">
                            <div className="space-y-4">
                                <p className="text-sm text-slate-600">General settings coming soon...</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="text" className="mt-0">
                            <div className="space-y-4">
                                <p className="text-sm text-slate-600">Text formatting options coming soon...</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="layout" className="mt-0 space-y-6">
                            {/* Skills Layout */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-slate-900">Skills Layout</Label>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">Layout Type</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant={skillsLayout === 'columns' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setSkillsLayout('columns')}
                                            className="w-full"
                                        >
                                            Columns
                                        </Button>
                                        <Button
                                            variant={skillsLayout === 'columns2' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setSkillsLayout('columns2')}
                                            className="w-full"
                                        >
                                            Columns
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">Sort Skills</Label>
                                    <Select value={sortSkills} onValueChange={setSortSkills}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None (Original Order)</SelectItem>
                                            <SelectItem value="alphabetical">Alphabetical</SelectItem>
                                            <SelectItem value="proficiency">By Proficiency</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Reorder Sections */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-slate-900">Reorder Sections</Label>
                                <p className="text-xs text-slate-500">
                                    Personal Information stays at the top. Drag to reorder, click edit to rename.
                                </p>

                                <div className="space-y-1 mt-4">
                                    {[
                                        { id: 'contact', label: 'Personal Information', fixed: true },
                                        { id: 'summary', label: 'SUMMARY', fixed: false },
                                        { id: 'experience', label: 'INTERNSHIPSEXPERIENCE', fixed: false },
                                        { id: 'education', label: 'EDUCATION', fixed: false },
                                        { id: 'volunteer', label: 'Volunteering & Leadership', fixed: false },
                                        { id: 'certifications', label: 'CERTIFICATIONS', fixed: false },
                                        { id: 'skills', label: 'TECHNICALSTACK', fixed: false },
                                        { id: 'projects', label: 'PROJECTS', fixed: false },
                                        { id: 'languages', label: 'Languages', fixed: false },
                                        { id: 'references', label: 'References', fixed: false },
                                    ].map((section) => (
                                        <div
                                            key={section.id}
                                            className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                                        >
                                            <GripVertical className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm text-slate-700 flex-1">{section.label}</span>
                                            {section.fixed && (
                                                <span className="text-xs text-slate-500">Fixed</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
