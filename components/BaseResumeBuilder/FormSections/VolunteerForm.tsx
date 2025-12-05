'use client';

import { useState } from 'react';
import { VolunteerExperience, generateId } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

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
                      <div>
                        <Label htmlFor={`organization-${vol.id}`}>Organization *</Label>
                        <Input
                          id={`organization-${vol.id}`}
                          value={vol.organization}
                          onChange={(e) => updateVolunteer(vol.id, { organization: e.target.value })}
                          placeholder="Red Cross"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`role-${vol.id}`}>Role *</Label>
                        <Input
                          id={`role-${vol.id}`}
                          value={vol.role}
                          onChange={(e) => updateVolunteer(vol.id, { role: e.target.value })}
                          placeholder="Volunteer Coordinator"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`location-${vol.id}`}>Location</Label>
                      <Input
                        id={`location-${vol.id}`}
                        value={vol.location || ''}
                        onChange={(e) => updateVolunteer(vol.id, { location: e.target.value })}
                        placeholder="New York, NY"
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`startDate-${vol.id}`}>Start Date</Label>
                        <Input
                          id={`startDate-${vol.id}`}
                          type="month"
                          value={vol.startDate || ''}
                          onChange={(e) => updateVolunteer(vol.id, { startDate: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`endDate-${vol.id}`}>End Date</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            id={`endDate-${vol.id}`}
                            type="month"
                            value={vol.endDate || ''}
                            onChange={(e) => updateVolunteer(vol.id, { endDate: e.target.value })}
                            disabled={vol.current}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Checkbox
                            id={`current-${vol.id}`}
                            checked={vol.current}
                            onCheckedChange={(checked) => updateVolunteer(vol.id, { current: checked as boolean })}
                          />
                          <label
                            htmlFor={`current-${vol.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            I currently volunteer here
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`description-${vol.id}`}>Description</Label>
                      <Textarea
                        id={`description-${vol.id}`}
                        value={vol.description}
                        onChange={(e) => updateVolunteer(vol.id, { description: e.target.value })}
                        placeholder="Describe your responsibilities and impact..."
                        className="mt-1 min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`achievements-${vol.id}`}>Key Achievements</Label>
                      <Textarea
                        id={`achievements-${vol.id}`}
                        value={vol.achievements?.join('\n') || ''}
                        onChange={(e) => updateAchievements(vol.id, e.target.value)}
                        placeholder="• Organized charity event raising $5,000&#10;• Managed team of 10 volunteers"
                        className="mt-1 min-h-[100px]"
                      />
                      <p className="text-xs text-slate-500 mt-1">Enter each achievement on a new line</p>
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
