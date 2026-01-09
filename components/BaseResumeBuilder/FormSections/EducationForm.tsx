'use client';

import { useState } from 'react';
import { Education, generateId } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { UnifiedTextField, UnifiedTextarea, UnifiedDateField } from '@/components/fields';

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
                        onClick={() => updateEducation(edu.id, { visible: edu.visible === false ? true : false })}
                        className={edu.visible === false ? 'text-slate-400' : 'text-slate-600'}
                        title={edu.visible === false ? 'Hidden from preview - Click to show' : 'Visible in preview - Click to hide'}
                      >
                        {edu.visible === false ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
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
                      <UnifiedTextField
                        id={`education-${edu.id}-institution`}
                        section="education"
                        fieldKey="institution"
                        itemId={edu.id}
                        label="School/University"
                        value={edu.institution}
                        onChange={(value) => updateEducation(edu.id, { institution: value })}
                        placeholder="Harvard University"
                        required
                      />
                      <UnifiedTextField
                        id={`education-${edu.id}-degree`}
                        section="education"
                        fieldKey="degree"
                        itemId={edu.id}
                        label="Degree"
                        value={edu.degree}
                        onChange={(value) => updateEducation(edu.id, { degree: value })}
                        placeholder="Bachelor of Science"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <UnifiedTextField
                        id={`education-${edu.id}-fieldOfStudy`}
                        section="education"
                        fieldKey="fieldOfStudy"
                        itemId={edu.id}
                        label="Field of Study"
                        value={edu.fieldOfStudy || ''}
                        onChange={(value) => updateEducation(edu.id, { fieldOfStudy: value })}
                        placeholder="Computer Science"
                      />
                      <UnifiedTextField
                        id={`education-${edu.id}-location`}
                        section="education"
                        fieldKey="location"
                        itemId={edu.id}
                        label="Location"
                        value={edu.location || ''}
                        onChange={(value) => updateEducation(edu.id, { location: value })}
                        placeholder="Cambridge, MA"
                      />
                    </div>

                    {/* Dates and GPA */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <UnifiedDateField
                        id={`education-${edu.id}-startDate`}
                        section="education"
                        fieldKey="startDate"
                        itemId={edu.id}
                        label="Start Date"
                        value={edu.startDate || ''}
                        onChange={(value) => updateEducation(edu.id, { startDate: value })}
                      />
                      <UnifiedDateField
                        id={`education-${edu.id}-endDate`}
                        section="education"
                        fieldKey="endDate"
                        itemId={edu.id}
                        label="End Date"
                        value={edu.endDate || ''}
                        onChange={(value) => updateEducation(edu.id, { endDate: value })}
                      />
                      <UnifiedTextField
                        id={`education-${edu.id}-gpa`}
                        section="education"
                        fieldKey="gpa"
                        itemId={edu.id}
                        label="GPA"
                        value={edu.gpa || ''}
                        onChange={(value) => updateEducation(edu.id, { gpa: value })}
                        placeholder="3.8"
                      />
                    </div>

                    {/* Honors */}
                    <UnifiedTextField
                      id={`education-${edu.id}-honors`}
                      section="education"
                      fieldKey="honors"
                      itemId={edu.id}
                      label="Honors & Awards"
                      value={edu.honors?.join(', ') || ''}
                      onChange={(value) => updateArrayField(edu.id, 'honors', value)}
                      placeholder="Magna Cum Laude, Dean's List"
                      helpText="Separate multiple items with commas"
                    />

                    {/* Relevant Coursework */}
                    <UnifiedTextarea
                      id={`education-${edu.id}-coursework`}
                      section="education"
                      fieldKey="coursework"
                      itemId={edu.id}
                      label="Relevant Coursework"
                      value={edu.coursework?.join(', ') || ''}
                      onChange={(value) => updateArrayField(edu.id, 'coursework', value)}
                      placeholder="Data Structures, Algorithms, Machine Learning, Database Systems"
                      rows={2}
                      helpText="Separate multiple courses with commas"
                    />

                    {/* Activities */}
                    <UnifiedTextarea
                      id={`education-${edu.id}-activities`}
                      section="education"
                      fieldKey="activities"
                      itemId={edu.id}
                      label="Activities & Organizations"
                      value={edu.activities?.join(', ') || ''}
                      onChange={(value) => updateArrayField(edu.id, 'activities', value)}
                      placeholder="Computer Science Club, Student Government, Debate Team"
                      rows={2}
                      helpText="Separate multiple activities with commas"
                    />
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
