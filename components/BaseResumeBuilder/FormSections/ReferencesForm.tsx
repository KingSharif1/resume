'use client';

import { useState } from 'react';
import { Reference, generateId } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

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
                                            <div>
                                                <Label htmlFor={`name-${ref.id}`}>Name *</Label>
                                                <Input
                                                    id={`name-${ref.id}`}
                                                    value={ref.name}
                                                    onChange={(e) => updateReference(ref.id, { name: e.target.value })}
                                                    placeholder="Jane Doe"
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`relationship-${ref.id}`}>Relationship *</Label>
                                                <Input
                                                    id={`relationship-${ref.id}`}
                                                    value={ref.relationship}
                                                    onChange={(e) => updateReference(ref.id, { relationship: e.target.value })}
                                                    placeholder="Former Manager"
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor={`title-${ref.id}`}>Job Title</Label>
                                                <Input
                                                    id={`title-${ref.id}`}
                                                    value={ref.title}
                                                    onChange={(e) => updateReference(ref.id, { title: e.target.value })}
                                                    placeholder="Senior Developer"
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`company-${ref.id}`}>Company</Label>
                                                <Input
                                                    id={`company-${ref.id}`}
                                                    value={ref.company}
                                                    onChange={(e) => updateReference(ref.id, { company: e.target.value })}
                                                    placeholder="Tech Corp"
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor={`email-${ref.id}`}>Email</Label>
                                                <Input
                                                    id={`email-${ref.id}`}
                                                    type="email"
                                                    value={ref.email || ''}
                                                    onChange={(e) => updateReference(ref.id, { email: e.target.value })}
                                                    placeholder="jane@example.com"
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`phone-${ref.id}`}>Phone</Label>
                                                <Input
                                                    id={`phone-${ref.id}`}
                                                    type="tel"
                                                    value={ref.phone || ''}
                                                    onChange={(e) => updateReference(ref.id, { phone: e.target.value })}
                                                    placeholder="+1 (555) 123-4567"
                                                    className="mt-1"
                                                />
                                            </div>
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
