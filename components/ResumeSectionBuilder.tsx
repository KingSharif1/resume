'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Section {
  id: string;
  type: string;
  title: string;
  content: string;
}

const SECTION_TYPES = [
  { value: 'contact', label: 'Contact' },
  { value: 'summary', label: 'Summary / Profile' },
  { value: 'objective', label: 'Objective' },
  { value: 'experience', label: 'Experience' },
  { value: 'internships', label: 'Internships Experience' },
  { value: 'volunteer', label: 'Volunteer Experience' },
  { value: 'education', label: 'Education' },
  { value: 'skills', label: 'Skills / Technical Stack' },
  { value: 'certifications', label: 'Certifications & Licenses' },
  { value: 'projects', label: 'Projects' },
  { value: 'coursework', label: 'Coursework' },
  { value: 'honors', label: 'Honors & Awards' },
  { value: 'publications', label: 'Publications' },
  { value: 'activities', label: 'Activities' },
  { value: 'memberships', label: 'Memberships & Affiliations' },
  { value: 'achievements', label: 'Achievements' },
  { value: 'performances', label: 'Performances' },
  { value: 'training', label: 'Additional Training' },
  { value: 'military', label: 'Military Background' },
  { value: 'references', label: 'References' },
  { value: 'interests', label: 'Interests' },
  { value: 'presentations', label: 'Presentations' },
  { value: 'leadership', label: 'Leadership Experience' },
  { value: 'custom', label: 'Custom Section' },
];

interface ResumeSectionBuilderProps {
  onSectionsChange: (sections: Section[]) => void;
  initialSections?: Section[];
}

export function ResumeSectionBuilder({ onSectionsChange, initialSections = [] }: ResumeSectionBuilderProps) {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const addSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      type: '',
      title: '',
      content: '',
    };
    const updated = [...sections, newSection];
    setSections(updated);
    const newExpanded = new Set(expandedSections);
    newExpanded.add(newSection.id);
    setExpandedSections(newExpanded);
    onSectionsChange(updated);
  };

  const removeSection = (id: string) => {
    const updated = sections.filter(s => s.id !== id);
    setSections(updated);
    onSectionsChange(updated);
  };

  const updateSection = (id: string, field: keyof Section, value: string) => {
    const updated = sections.map(s => {
      if (s.id === id) {
        const updatedSection = { ...s, [field]: value };
        if (field === 'type' && value !== 'custom') {
          const sectionType = SECTION_TYPES.find(t => t.value === value);
          updatedSection.title = sectionType?.label || value;
        }
        return updatedSection;
      }
      return s;
    });
    setSections(updated);
    onSectionsChange(updated);
  };

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-semibold">Resume Sections</Label>
        <Button onClick={addSection} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      {sections.length === 0 && (
        <Card className="p-6 text-center text-slate-500">
          <p>No sections added yet. Click "Add Section" to get started.</p>
        </Card>
      )}

      {sections.map((section) => {
        const isExpanded = expandedSections.has(section.id);
        return (
          <Card key={section.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection(section.id)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                  <CardTitle className="text-base">
                    {section.title || 'Untitled Section'}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSection(section.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent className="space-y-4">
                <div>
                  <Label>Section Type</Label>
                  <Select
                    value={section.type}
                    onValueChange={(value) => updateSection(section.id, 'type', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select section type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {section.type === 'custom' && (
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={section.title}
                      onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                      placeholder="Enter custom section title"
                      className="mt-1"
                    />
                  </div>
                )}

                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={section.content}
                    onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                    placeholder="Enter section content..."
                    rows={6}
                    className="mt-1 resize-none"
                  />
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
