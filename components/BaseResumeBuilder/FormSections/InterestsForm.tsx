'use client';

import { useState } from 'react';
import { Interest, generateId } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface InterestsFormProps {
    interests: Interest[];
    onChange: (interests: Interest[]) => void;
}

export function InterestsForm({ interests, onChange }: InterestsFormProps) {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const addInterest = () => {
        const newInterest: Interest = {
            id: generateId(),
            name: '',
            description: ''
        };

        const updated = [...interests, newInterest];
        onChange(updated);

        setExpandedItems(prev => {
            const newSet = new Set(prev);
            newSet.add(newInterest.id);
            return newSet;
        });
    };

    const updateInterest = (id: string, updates: Partial<Interest>) => {
        const updated = interests.map(int =>
            int.id === id ? { ...int, ...updates } : int
        );
        onChange(updated);
    };

    const removeInterest = (id: string) => {
        const updated = interests.filter(int => int.id !== id);
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
                    <h3 className="text-lg font-medium">Interests & Hobbies</h3>
                    <p className="text-sm text-slate-600">Share your personal interests</p>
                </div>
                <Button onClick={addInterest} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Interest
                </Button>
            </div>

            {interests.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-slate-500 mb-4">No interests added yet</p>
                    <Button onClick={addInterest} variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your Interest
                    </Button>
                </Card>
            ) : (
                <div className="space-y-4">
                    {interests.map((int) => {
                        const isExpanded = expandedItems.has(int.id);

                        return (
                            <Card key={int.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-base">
                                                {int.name || 'New Interest'}
                                            </CardTitle>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleExpanded(int.id)}
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
                                                onClick={() => removeInterest(int.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                {isExpanded && (
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor={`name-${int.id}`}>Interest Name *</Label>
                                            <Input
                                                id={`name-${int.id}`}
                                                value={int.name}
                                                onChange={(e) => updateInterest(int.id, { name: e.target.value })}
                                                placeholder="Photography, Hiking, Chess"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`description-${int.id}`}>Description (Optional)</Label>
                                            <Input
                                                id={`description-${int.id}`}
                                                value={int.description || ''}
                                                onChange={(e) => updateInterest(int.id, { description: e.target.value })}
                                                placeholder="Brief details..."
                                                className="mt-1"
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
