'use client';

import { useState } from 'react';
import { VolunteerExperience, generateId } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { UnifiedTextField, UnifiedTextarea, UnifiedDateField } from '@/components/fields';

interface VolunteerFormProps {
  volunteer: VolunteerExperience[];
  onChange: (volunteer: VolunteerExperience[]) => void;
}

export function VolunteerForm({ volunteer, onChange }: VolunteerFormProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const addVolunteer = () => {
    const newVolunteer: VolunteerExperience = {
      id: generateId(),
      organization: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: []
    };

    const updated = [...volunteer, newVolunteer];
    onChange(updated);

    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.add(newVolunteer.id);
      return newSet;
    });
  };

  const updateVolunteer = (id: string, updates: Partial<VolunteerExperience>) => {
    const updated = volunteer.map(vol =>
      vol.id === id ? { ...vol, ...updates } : vol
    );
    onChange(updated);
  };

  const removeVolunteer = (id: string) => {
    const updated = volunteer.filter(vol => vol.id !== id);
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

  const updateAchievements = (id: string, value: string) => {
    const achievements = value.split('\n').filter(line => line.trim());
    updateVolunteer(id, { achievements });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Volunteer Experience</h3>
          <p className="text-sm text-slate-600">Add your community service and volunteer work</p>
        </div>
        <Button onClick={addVolunteer} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Volunteer
        </Button>
      </div>

      {volunteer.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-500 mb-4">No volunteer experience added yet</p>
          <Button onClick={addVolunteer} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Volunteer Experience
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {volunteer.map((vol) => {
            const isExpanded = expandedItems.has(vol.id);

            return (
              <Card key={vol.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {vol.role || 'New Role'}
                      </CardTitle>
                      <p className="text-sm text-slate-600">
                        {vol.organization}
                        {vol.startDate && ` • ${vol.startDate}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(vol.id)}
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
                        onClick={() => removeVolunteer(vol.id)}
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
                        id={`volunteer-${vol.id}-organization`}
                        section="volunteer"
                        fieldKey="organization"
                        itemId={vol.id}
                        label="Organization"
                        value={vol.organization}
                        onChange={(value) => updateVolunteer(vol.id, { organization: value })}
                        placeholder="Red Cross"
                        required
                      />
                      <UnifiedTextField
                        id={`volunteer-${vol.id}-role`}
                        section="volunteer"
                        fieldKey="role"
                        itemId={vol.id}
                        label="Role"
                        value={vol.role}
                        onChange={(value) => updateVolunteer(vol.id, { role: value })}
                        placeholder="Volunteer Coordinator"
                        required
                      />
                    </div>

                    <UnifiedTextField
                      id={`volunteer-${vol.id}-location`}
                      section="volunteer"
                      fieldKey="location"
                      itemId={vol.id}
                      label="Location"
                      value={vol.location || ''}
                      onChange={(value) => updateVolunteer(vol.id, { location: value })}
                      placeholder="New York, NY"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <UnifiedDateField
                        id={`volunteer-${vol.id}-startDate`}
                        section="volunteer"
                        fieldKey="startDate"
                        itemId={vol.id}
                        label="Start Date"
                        value={vol.startDate || ''}
                        onChange={(value) => updateVolunteer(vol.id, { startDate: value })}
                      />
                      <div className="space-y-2">
                        <UnifiedDateField
                          id={`volunteer-${vol.id}-endDate`}
                          section="volunteer"
                          fieldKey="endDate"
                          itemId={vol.id}
                          label="End Date"
                          value={vol.endDate || ''}
                          onChange={(value) => updateVolunteer(vol.id, { endDate: value })}
                          disabled={vol.current}
                        />
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`volunteer-${vol.id}-current`}
                            checked={vol.current}
                            onCheckedChange={(checked) => updateVolunteer(vol.id, { current: checked as boolean })}
                          />
                          <label
                            htmlFor={`volunteer-${vol.id}-current`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            I currently volunteer here
                          </label>
                        </div>
                      </div>
                    </div>

                    <UnifiedTextarea
                      id={`volunteer-${vol.id}-description`}
                      section="volunteer"
                      fieldKey="description"
                      itemId={vol.id}
                      label="Description"
                      value={vol.description}
                      onChange={(value) => updateVolunteer(vol.id, { description: value })}
                      placeholder="Describe your responsibilities and impact..."
                      rows={4}
                    />

                    <UnifiedTextarea
                      id={`volunteer-${vol.id}-achievements`}
                      section="volunteer"
                      fieldKey="achievements"
                      itemId={vol.id}
                      label="Key Achievements"
                      value={vol.achievements?.join('\n') || ''}
                      onChange={(value) => updateAchievements(vol.id, value)}
                      placeholder="• Organized charity event raising $5,000&#10;• Managed team of 10 volunteers"
                      rows={4}
                      helpText="Enter each achievement on a new line"
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
