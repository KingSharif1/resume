'use client';

import { useState } from 'react';
import { WorkExperience, generateId } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical, Eye, EyeOff } from 'lucide-react';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ExperienceFormProps {
  experiences: WorkExperience[];
  onChange: (experiences: WorkExperience[]) => void;
}

interface SortableExperienceItemProps {
  experience: WorkExperience;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onUpdate: (updates: Partial<WorkExperience>) => void;
  onRemove: () => void;
  onUpdateAchievement: (index: number, value: string) => void;
  onAddAchievement: () => void;
  onRemoveAchievement: (index: number) => void;
}

function SortableExperienceItem({
  experience,
  isExpanded,
  onToggleExpanded,
  onUpdate,
  onRemove,
  onUpdateAchievement,
  onAddAchievement,
  onRemoveAchievement
}: SortableExperienceItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: experience.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`${isDragging ? 'shadow-lg' : ''} ${experience.visible === false ? 'opacity-60 border-dashed' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded"
              >
                <GripVertical className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base flex items-center gap-2">
                  {experience.position || 'New Position'}
                  {experience.company && ` at ${experience.company}`}
                  {experience.visible === false && (
                    <span className="text-xs text-slate-400 font-normal italic">(Hidden)</span>
                  )}
                </CardTitle>
                <p className="text-sm text-slate-600">
                  {experience.startDate && (
                    <>
                      {experience.startDate} - {experience.current ? 'Present' : experience.endDate || 'End Date'}
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpanded}
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
                onClick={() => onUpdate({ visible: experience.visible === false ? true : false })}
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
                onClick={onRemove}
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
                <Label htmlFor={`position-${experience.id}`}>Job Title *</Label>
                <Input
                  id={`position-${experience.id}`}
                  value={experience.position}
                  onChange={(e) => onUpdate({ position: e.target.value })}
                  placeholder="Software Engineer"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor={`company-${experience.id}`}>Company *</Label>
                <Input
                  id={`company-${experience.id}`}
                  value={experience.company}
                  onChange={(e) => onUpdate({ company: e.target.value })}
                  placeholder="Tech Corp"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`location-${experience.id}`}>Location</Label>
              <Input
                id={`location-${experience.id}`}
                value={experience.location || ''}
                onChange={(e) => onUpdate({ location: e.target.value })}
                placeholder="San Francisco, CA"
                className="mt-1"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`startDate-${experience.id}`}>Start Date *</Label>
                <Input
                  id={`startDate-${experience.id}`}
                  type="month"
                  value={experience.startDate}
                  onChange={(e) => onUpdate({ startDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor={`endDate-${experience.id}`}>End Date</Label>
                <Input
                  id={`endDate-${experience.id}`}
                  type="month"
                  value={experience.endDate || ''}
                  onChange={(e) => onUpdate({ endDate: e.target.value })}
                  disabled={experience.current}
                  className="mt-1"
                />
                <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    id={`current-${experience.id}`}
                    checked={experience.current}
                    onCheckedChange={(checked) => {
                      onUpdate({
                        current: checked,
                        endDate: checked ? '' : experience.endDate
                      });
                    }}
                  />
                  <Label htmlFor={`current-${experience.id}`} className="text-sm">
                    I currently work here
                  </Label>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor={`description-${experience.id}`}>Job Description</Label>
              <Textarea
                id={`description-${experience.id}`}
                value={experience.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Describe your role and responsibilities..."
                className="mt-1 min-h-[80px]"
              />
            </div>

            {/* Achievements */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Key Achievements</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onAddAchievement}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Achievement
                </Button>
              </div>
              <div className="space-y-2">
                {experience.achievements.map((achievement, achIndex) => (
                  <div key={achIndex} className="flex gap-2">
                    <Textarea
                      value={achievement}
                      onChange={(e) => onUpdateAchievement(achIndex, e.target.value)}
                      placeholder="• Increased team productivity by 30% through process improvements"
                      className="min-h-[60px]"
                    />
                    {experience.achievements.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveAchievement(achIndex)}
                        className="shrink-0 text-red-600 hover:text-red-700"
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
    </div>
  );
}

export function DraggableExperienceForm({ experiences, onChange }: ExperienceFormProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = experiences.findIndex(exp => exp.id === active.id);
      const newIndex = experiences.findIndex(exp => exp.id === over.id);

      onChange(arrayMove(experiences, oldIndex, newIndex));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Work Experience</h3>
          <p className="text-sm text-slate-600">Add your professional work experience • Drag to reorder</p>
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={experiences.map(exp => exp.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {experiences.map((experience) => (
                <SortableExperienceItem
                  key={experience.id}
                  experience={experience}
                  isExpanded={expandedItems.has(experience.id)}
                  onToggleExpanded={() => toggleExpanded(experience.id)}
                  onUpdate={(updates) => updateExperience(experience.id, updates)}
                  onRemove={() => removeExperience(experience.id)}
                  onUpdateAchievement={(index, value) => updateAchievement(experience.id, index, value)}
                  onAddAchievement={() => addAchievement(experience.id)}
                  onRemoveAchievement={(index) => removeAchievement(experience.id, index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
