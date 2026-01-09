'use client';

import { useState } from 'react';
import { WorkExperience, generateId } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { UnifiedTextField, UnifiedTextarea, UnifiedDateField } from '@/components/fields';

interface ExperienceFormProps {
  experiences: WorkExperience[];
  onChange: (experiences: WorkExperience[]) => void;
}

export function ExperienceForm({ experiences, onChange }: ExperienceFormProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const addExperience = () => {
    const newExperience: WorkExperience = {
      id: generateId(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: [''],
      skills: []
    };

    const updated = [...experiences, newExperience];
    onChange(updated);

    // Expand the new item
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.add(newExperience.id);
      return newSet;
    });
  };

  const updateExperience = (id: string, updates: Partial<WorkExperience>) => {
    const updated = experiences.map(exp =>
      exp.id === id ? { ...exp, ...updates } : exp
    );
    onChange(updated);
  };

  const removeExperience = (id: string) => {
    const updated = experiences.filter(exp => exp.id !== id);
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

  const updateAchievement = (expId: string, index: number, value: string) => {
    const experience = experiences.find(exp => exp.id === expId);
    if (experience) {
      const newAchievements = [...experience.achievements];
      newAchievements[index] = value;
      updateExperience(expId, { achievements: newAchievements });
    }
  };

  const addAchievement = (expId: string) => {
    const experience = experiences.find(exp => exp.id === expId);
    if (experience) {
      const newAchievements = [...experience.achievements, ''];
      updateExperience(expId, { achievements: newAchievements });
    }
  };

  const removeAchievement = (expId: string, index: number) => {
    const experience = experiences.find(exp => exp.id === expId);
    if (experience && experience.achievements.length > 1) {
      const newAchievements = experience.achievements.filter((_, i) => i !== index);
      updateExperience(expId, { achievements: newAchievements });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Work Experience</h3>
          <p className="text-sm text-slate-600">Add your professional work experience</p>
        </div>
        <Button onClick={addExperience} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Experience
        </Button>
      </div>

      {experiences.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-500 mb-4">No work experience added yet</p>
          <Button onClick={addExperience} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Job
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {experiences.map((experience, index) => {
            const isExpanded = expandedItems.has(experience.id);

            return (
              <Card key={experience.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {experience.position || 'New Position'}
                        {experience.company && ` at ${experience.company}`}
                      </CardTitle>
                      <p className="text-sm text-slate-600">
                        {experience.startDate && (
                          <>
                            {experience.startDate} - {experience.current ? 'Present' : experience.endDate || 'End Date'}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(experience.id)}
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
                        onClick={() => updateExperience(experience.id, { visible: experience.visible === false ? true : false })}
                        className={experience.visible === false ? 'text-slate-400' : 'text-slate-600'}
                        title={experience.visible === false ? 'Hidden from preview - Click to show' : 'Visible in preview - Click to hide'}
                      >
                        {experience.visible === false ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperience(experience.id)}
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
                        id={`experience-${experience.id}-position`}
                        section="experience"
                        fieldKey="position"
                        itemId={experience.id}
                        label="Job Title"
                        value={experience.position}
                        onChange={(value) => updateExperience(experience.id, { position: value })}
                        placeholder="Software Engineer"
                        required
                      />
                      <UnifiedTextField
                        id={`experience-${experience.id}-company`}
                        section="experience"
                        fieldKey="company"
                        itemId={experience.id}
                        label="Company"
                        value={experience.company}
                        onChange={(value) => updateExperience(experience.id, { company: value })}
                        placeholder="Tech Corp"
                        required
                      />
                    </div>

                    <UnifiedTextField
                      id={`experience-${experience.id}-location`}
                      section="experience"
                      fieldKey="location"
                      itemId={experience.id}
                      label="Location"
                      value={experience.location || ''}
                      onChange={(value) => updateExperience(experience.id, { location: value })}
                      placeholder="San Francisco, CA"
                    />

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <UnifiedDateField
                        id={`experience-${experience.id}-startDate`}
                        section="experience"
                        fieldKey="startDate"
                        itemId={experience.id}
                        label="Start Date"
                        value={experience.startDate}
                        onChange={(value) => updateExperience(experience.id, { startDate: value })}
                        required
                      />
                      <div className="space-y-2">
                        <UnifiedDateField
                          id={`experience-${experience.id}-endDate`}
                          section="experience"
                          fieldKey="endDate"
                          itemId={experience.id}
                          label="End Date"
                          value={experience.endDate || ''}
                          onChange={(value) => updateExperience(experience.id, { endDate: value })}
                          disabled={experience.current}
                        />
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`experience-${experience.id}-current`}
                            checked={experience.current}
                            onCheckedChange={(checked) => {
                              updateExperience(experience.id, {
                                current: checked,
                                endDate: checked ? '' : experience.endDate
                              });
                            }}
                          />
                          <Label htmlFor={`experience-${experience.id}-current`} className="text-sm">
                            I currently work here
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <UnifiedTextarea
                      id={`experience-${experience.id}-description`}
                      section="experience"
                      fieldKey="description"
                      itemId={experience.id}
                      label="Job Description"
                      value={experience.description}
                      onChange={(value) => updateExperience(experience.id, { description: value })}
                      placeholder="Describe your role and responsibilities..."
                      rows={3}
                    />

                    {/* Achievements */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Key Achievements</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addAchievement(experience.id)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Achievement
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {experience.achievements.map((achievement, achIndex) => (
                          <div key={achIndex} className="flex gap-2">
                            <UnifiedTextarea
                              id={`experience-${experience.id}-achievements-${achIndex}`}
                              section="experience"
                              fieldKey={`achievements[${achIndex}]`}
                              itemId={experience.id}
                              label=""
                              value={achievement}
                              onChange={(value) => updateAchievement(experience.id, achIndex, value)}
                              placeholder="• Increased team productivity by 30% through process improvements"
                              rows={2}
                              className="flex-1"
                            />
                            {experience.achievements.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAchievement(experience.id, achIndex)}
                                className="shrink-0 text-red-600 hover:text-red-700 self-start mt-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
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
