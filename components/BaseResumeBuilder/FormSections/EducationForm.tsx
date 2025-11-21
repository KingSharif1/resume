'use client';

import { useState } from 'react';
import { Education, generateId } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface EducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

export function EducationForm({ education, onChange }: EducationFormProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const addEducation = () => {
    const newEducation: Education = {
      id: generateId(),
      institution: '',
      degree: '',
      fieldOfStudy: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: '',
      honors: [],
      coursework: [],
      activities: []
    };

    const updated = [...education, newEducation];
    onChange(updated);
    
    // Expand the new item
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.add(newEducation.id);
      return newSet;
    });
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    const updated = education.map(edu => 
      edu.id === id ? { ...edu, ...updates } : edu
    );
    onChange(updated);
  };

  const removeEducation = (id: string) => {
    const updated = education.filter(edu => edu.id !== id);
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

  const updateArrayField = (id: string, field: 'honors' | 'coursework' | 'activities', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    updateEducation(id, { [field]: items });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Education</h3>
          <p className="text-sm text-slate-600">Add your educational background</p>
        </div>
        <Button onClick={addEducation} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Education
        </Button>
      </div>

      {education.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-500 mb-4">No education added yet</p>
          <Button onClick={addEducation} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Your Education
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {education.map((edu) => {
            const isExpanded = expandedItems.has(edu.id);
            
            return (
              <Card key={edu.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {edu.degree || 'New Degree'} 
                        {edu.fieldOfStudy && ` in ${edu.fieldOfStudy}`}
                      </CardTitle>
                      <p className="text-sm text-slate-600">
                        {edu.institution}
                        {edu.endDate && ` • ${edu.endDate}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(edu.id)}
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
                        onClick={() => removeEducation(edu.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`institution-${edu.id}`}>School/University *</Label>
                        <Input
                          id={`institution-${edu.id}`}
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                          placeholder="Harvard University"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`degree-${edu.id}`}>Degree *</Label>
                        <Input
                          id={`degree-${edu.id}`}
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                          placeholder="Bachelor of Science"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`fieldOfStudy-${edu.id}`}>Field of Study</Label>
                        <Input
                          id={`fieldOfStudy-${edu.id}`}
                          value={edu.fieldOfStudy || ''}
                          onChange={(e) => updateEducation(edu.id, { fieldOfStudy: e.target.value })}
                          placeholder="Computer Science"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`location-${edu.id}`}>Location</Label>
                        <Input
                          id={`location-${edu.id}`}
                          value={edu.location || ''}
                          onChange={(e) => updateEducation(edu.id, { location: e.target.value })}
                          placeholder="Cambridge, MA"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Dates and GPA */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`startDate-${edu.id}`}>Start Date</Label>
                        <Input
                          id={`startDate-${edu.id}`}
                          type="month"
                          value={edu.startDate || ''}
                          onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`endDate-${edu.id}`}>End Date</Label>
                        <Input
                          id={`endDate-${edu.id}`}
                          type="month"
                          value={edu.endDate || ''}
                          onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`gpa-${edu.id}`}>GPA</Label>
                        <Input
                          id={`gpa-${edu.id}`}
                          value={edu.gpa || ''}
                          onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                          placeholder="3.8"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Honors */}
                    <div>
                      <Label htmlFor={`honors-${edu.id}`}>Honors & Awards</Label>
                      <Input
                        id={`honors-${edu.id}`}
                        value={edu.honors?.join(', ') || ''}
                        onChange={(e) => updateArrayField(edu.id, 'honors', e.target.value)}
                        placeholder="Magna Cum Laude, Dean's List"
                        className="mt-1"
                      />
                      <p className="text-xs text-slate-500 mt-1">Separate multiple items with commas</p>
                    </div>

                    {/* Relevant Coursework */}
                    <div>
                      <Label htmlFor={`coursework-${edu.id}`}>Relevant Coursework</Label>
                      <Textarea
                        id={`coursework-${edu.id}`}
                        value={edu.coursework?.join(', ') || ''}
                        onChange={(e) => updateArrayField(edu.id, 'coursework', e.target.value)}
                        placeholder="Data Structures, Algorithms, Machine Learning, Database Systems"
                        className="mt-1 min-h-[60px]"
                      />
                      <p className="text-xs text-slate-500 mt-1">Separate multiple courses with commas</p>
                    </div>

                    {/* Activities */}
                    <div>
                      <Label htmlFor={`activities-${edu.id}`}>Activities & Organizations</Label>
                      <Textarea
                        id={`activities-${edu.id}`}
                        value={edu.activities?.join(', ') || ''}
                        onChange={(e) => updateArrayField(edu.id, 'activities', e.target.value)}
                        placeholder="Computer Science Club, Student Government, Debate Team"
                        className="mt-1 min-h-[60px]"
                      />
                      <p className="text-xs text-slate-500 mt-1">Separate multiple activities with commas</p>
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
