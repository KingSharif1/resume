'use client';

import { useState } from 'react';
import { Award, generateId } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface AwardsFormProps {
  awards: Award[];
  onChange: (awards: Award[]) => void;
}

export function AwardsForm({ awards, onChange }: AwardsFormProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const addAward = () => {
    const newAward: Award = {
      id: generateId(),
      title: '',
      issuer: '',
      date: '',
      description: ''
    };

    const updated = [...awards, newAward];
    onChange(updated);

    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.add(newAward.id);
      return newSet;
    });
  };

  const updateAward = (id: string, updates: Partial<Award>) => {
    const updated = awards.map(award =>
      award.id === id ? { ...award, ...updates } : award
    );
    onChange(updated);
  };

  const removeAward = (id: string) => {
    const updated = awards.filter(award => award.id !== id);
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
          <h3 className="text-lg font-medium">Awards & Achievements</h3>
          <p className="text-sm text-slate-600">Add your honors and awards</p>
        </div>
        <Button onClick={addAward} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Award
        </Button>
      </div>

      {awards.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-500 mb-4">No awards added yet</p>
          <Button onClick={addAward} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Your Award
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {awards.map((award) => {
            const isExpanded = expandedItems.has(award.id);

            return (
              <Card key={award.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {award.title || 'New Award'}
                      </CardTitle>
                      <p className="text-sm text-slate-600">
                        {award.issuer}
                        {award.date && ` • ${award.date}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(award.id)}
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
                        onClick={() => removeAward(award.id)}
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
                        <Label htmlFor={`title-${award.id}`}>Award Title *</Label>
                        <Input
                          id={`title-${award.id}`}
                          value={award.title}
                          onChange={(e) => updateAward(award.id, { title: e.target.value })}
                          placeholder="Employee of the Month"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`issuer-${award.id}`}>Issuer *</Label>
                        <Input
                          id={`issuer-${award.id}`}
                          value={award.issuer}
                          onChange={(e) => updateAward(award.id, { issuer: e.target.value })}
                          placeholder="Company Name"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`date-${award.id}`}>Date</Label>
                      <Input
                        id={`date-${award.id}`}
                        type="month"
                        value={award.date || ''}
                        onChange={(e) => updateAward(award.id, { date: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`description-${award.id}`}>Description</Label>
                      <Textarea
                        id={`description-${award.id}`}
                        value={award.description || ''}
                        onChange={(e) => updateAward(award.id, { description: e.target.value })}
                        placeholder="Brief description of the award..."
                        className="mt-1 min-h-[80px]"
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
