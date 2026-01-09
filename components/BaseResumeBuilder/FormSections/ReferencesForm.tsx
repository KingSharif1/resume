'use client';

import { useState } from 'react';
import { Reference, generateId } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { UnifiedTextField } from '@/components/fields';

interface ReferencesFormProps {
    references: Reference[];
    onChange: (references: Reference[]) => void;
}

export function ReferencesForm({ references, onChange }: ReferencesFormProps) {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const addReference = () => {
        const newReference: Reference = {
            id: generateId(),
            name: '',
            title: '',
            company: '',
            email: '',
            phone: '',
            relationship: ''
        };

        const updated = [...references, newReference];
        onChange(updated);

        setExpandedItems(prev => {
            const newSet = new Set(prev);
            newSet.add(newReference.id);
            return newSet;
        });
    };

    const updateReference = (id: string, updates: Partial<Reference>) => {
        const updated = references.map(ref =>
            ref.id === id ? { ...ref, ...updates } : ref
        );
        onChange(updated);
    };

    const removeReference = (id: string) => {
        const updated = references.filter(ref => ref.id !== id);
        onChange(updated);
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
    };

    const toggleExpanded = (id: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">References</h3>
                    <p className="text-sm text-slate-600">Add professional references</p>
                </div>
                <Button onClick={addReference} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Reference
                </Button>
            </div>

            {references.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-slate-500 mb-4">No references added yet</p>
                    <Button onClick={addReference} variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your Reference
                    </Button>
                </Card>
            ) : (
                <div className="space-y-4">
                    {references.map((ref) => {
                        const isExpanded = expandedItems.has(ref.id);

                        return (
                            <Card key={ref.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-base">
                                                {ref.name || 'New Reference'}
                                            </CardTitle>
                                            <p className="text-sm text-slate-600">
                                                {ref.title}
                                                {ref.company && ` at ${ref.company}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleExpanded(ref.id)}
                                            >
                                                {isExpanded ? (
                                                    <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeReference(ref.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                {isExpanded && (
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <UnifiedTextField
                                                id={`references-${ref.id}-name`}
                                                section="references"
                                                fieldKey="name"
                                                itemId={ref.id}
                                                label="Name"
                                                value={ref.name}
                                                onChange={(value) => updateReference(ref.id, { name: value })}
                                                placeholder="Jane Doe"
                                                required
                                            />
                                            <UnifiedTextField
                                                id={`references-${ref.id}-relationship`}
                                                section="references"
                                                fieldKey="relationship"
                                                itemId={ref.id}
                                                label="Relationship"
                                                value={ref.relationship}
                                                onChange={(value) => updateReference(ref.id, { relationship: value })}
                                                placeholder="Former Manager"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <UnifiedTextField
                                                id={`references-${ref.id}-title`}
                                                section="references"
                                                fieldKey="title"
                                                itemId={ref.id}
                                                label="Job Title"
                                                value={ref.title}
                                                onChange={(value) => updateReference(ref.id, { title: value })}
                                                placeholder="Senior Developer"
                                            />
                                            <UnifiedTextField
                                                id={`references-${ref.id}-company`}
                                                section="references"
                                                fieldKey="company"
                                                itemId={ref.id}
                                                label="Company"
                                                value={ref.company}
                                                onChange={(value) => updateReference(ref.id, { company: value })}
                                                placeholder="Tech Corp"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <UnifiedTextField
                                                id={`references-${ref.id}-email`}
                                                section="references"
                                                fieldKey="email"
                                                itemId={ref.id}
                                                label="Email"
                                                value={ref.email || ''}
                                                onChange={(value) => updateReference(ref.id, { email: value })}
                                                placeholder="jane@example.com"
                                                inputType="email"
                                            />
                                            <UnifiedTextField
                                                id={`references-${ref.id}-phone`}
                                                section="references"
                                                fieldKey="phone"
                                                itemId={ref.id}
                                                label="Phone"
                                                value={ref.phone || ''}
                                                onChange={(value) => updateReference(ref.id, { phone: value })}
                                                placeholder="+1 (555) 123-4567"
                                                inputType="tel"
                                            />
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
