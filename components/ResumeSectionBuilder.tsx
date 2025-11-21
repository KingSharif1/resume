'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Trash2, ChevronDown, ChevronUp, User, FileText, Briefcase, 
  GraduationCap, Code, Folder, Award, Trophy, Heart, Globe, Coffee, Users,
  Settings
} from 'lucide-react';
import { SectionEditorFactory } from './section-editors/SectionEditorFactory';
import { CustomSectionBuilder } from './section-editors/CustomSectionBuilder';

interface Section {
  id: string;
  type: string;
  title: string;
  content: string;
  structuredData?: any;
}

const SECTION_TYPES = [
  { value: 'contact', label: 'Contact Information', icon: 'user', description: 'Your name, email, phone, location, and links' },
  { value: 'summary', label: 'Professional Summary', icon: 'file-text', description: 'Brief overview of your skills and career' },
  { value: 'experience', label: 'Work Experience', icon: 'briefcase', description: 'Your work history and achievements' },
  { value: 'education', label: 'Education', icon: 'graduation-cap', description: 'Your academic background and qualifications' },
  { value: 'skills', label: 'Skills', icon: 'code', description: 'Technical and professional skills' },
  { value: 'projects', label: 'Projects', icon: 'folder', description: 'Notable projects you have worked on' },
  { value: 'certifications', label: 'Certifications', icon: 'award', description: 'Professional certifications and licenses' },
  { value: 'achievements', label: 'Achievements & Awards', icon: 'trophy', description: 'Honors, awards, and notable accomplishments' },
  { value: 'volunteer', label: 'Volunteer Experience', icon: 'heart', description: 'Community service and volunteer work' },
  { value: 'languages', label: 'Languages', icon: 'globe', description: 'Languages you speak and proficiency levels' },
  { value: 'interests', label: 'Interests', icon: 'coffee', description: 'Personal interests and hobbies' },
  { value: 'references', label: 'References', icon: 'users', description: 'Professional references' },
  { value: 'custom', label: 'Custom Section', icon: 'plus', description: 'Create a custom section with your own title' },
];

interface ResumeSectionBuilderProps {
  onSectionsChange: (sections: Section[]) => void;
  initialSections?: Section[];
}

// Helper functions for section types
function getIconForSectionType(type: string) {
  switch (type) {
    case 'contact': return User;
    case 'summary': return FileText;
    case 'experience': return Briefcase;
    case 'education': return GraduationCap;
    case 'skills': return Code;
    case 'projects': return Folder;
    case 'certifications': return Award;
    case 'achievements': return Trophy;
    case 'volunteer': return Heart;
    case 'languages': return Globe;
    case 'interests': return Coffee;
    case 'references': return Users;
    default: return Plus;
  }
}

function getSectionTypeLabel(type: string): string {
  const sectionType = SECTION_TYPES.find(t => t.value === type);
  return sectionType?.label || 'Custom Section';
}

function getSectionTypeDescription(type: string): string {
  const sectionType = SECTION_TYPES.find(t => t.value === type);
  return sectionType?.description || 'Custom content for your resume';
}

export function ResumeSectionBuilder({ onSectionsChange, initialSections = [] }: ResumeSectionBuilderProps) {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showCustomSectionBuilder, setShowCustomSectionBuilder] = useState(false);

  // Get available section types (those not already used)
  const getAvailableSectionTypes = () => {
    const usedTypes = new Set(sections.map(s => s.type).filter(Boolean));
    return SECTION_TYPES.filter(type => 
      type.value === 'custom' || !usedTypes.has(type.value)
    );
  };

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

  const updateSection = (id: string, field: keyof Section, value: any) => {
    // If changing section type, check if that type already exists
    if (field === 'type' && value !== 'custom') {
      const existingSection = sections.find(s => s.id !== id && s.type === value);
      if (existingSection) {
        // Alert the user that this section type already exists
        alert(`A "${getSectionTypeLabel(value)}" section already exists. Please choose a different type.`);
        return;
      }
    }
    
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

  const handleContentChange = (id: string, content: string, structuredData?: any) => {
    const updated = sections.map(s => {
      if (s.id === id) {
        return { 
          ...s, 
          content,
          structuredData: structuredData || s.structuredData 
        };
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
        <div className="space-x-2">
          <Button onClick={() => setShowCustomSectionBuilder(true)} size="sm" variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Create Custom Section
          </Button>
          <Button onClick={addSection} size="sm" variant="default">
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>

      {sections.length === 0 && (
        <Card className="p-6 text-center text-slate-500">
          <p>No sections added yet. Click "Add Section" to get started.</p>
        </Card>
      )}

      {showCustomSectionBuilder ? (
        <CustomSectionBuilder
          onSave={({ title, fields }) => {
            // Create a custom section type
            const customTypeId = `custom_${Date.now()}`;
            
            // Add the custom section
            const newSection: Section = {
              id: Date.now().toString(),
              type: customTypeId,
              title: title,
              content: '',
              structuredData: { fields }
            };
            
            const updated = [...sections, newSection];
            setSections(updated);
            onSectionsChange(updated);
            
            // Expand the new section
            const newExpanded = new Set(expandedSections);
            newExpanded.add(newSection.id);
            setExpandedSections(newExpanded);
            
            // Hide the custom section builder
            setShowCustomSectionBuilder(false);
          }}
          onCancel={() => setShowCustomSectionBuilder(false)}
        />
      ) : null}
      
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
                      {getAvailableSectionTypes().map((type) => {
                        const IconComponent = getIconForSectionType(type.value);
                        return (
                          <SelectItem key={type.value} value={type.value} className="flex items-center">
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4 text-slate-500" />
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  
                  {section.type && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs bg-slate-50">
                        {getSectionTypeLabel(section.type)}
                      </Badge>
                      <p className="text-xs text-slate-500 mt-1">
                        {getSectionTypeDescription(section.type)}
                      </p>
                    </div>
                  )}
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
                  <SectionEditorFactory
                    sectionType={section.type || 'custom'}
                    initialValue={section.structuredData || section.content}
                    onChange={(value) => {
                      // If value is a string, it's from DefaultEditor
                      if (typeof value === 'string') {
                        handleContentChange(section.id, value);
                      } 
                      // If value is an object, it's structured data
                      else {
                        // Convert structured data to a string representation for backward compatibility
                        const contentString = typeof value === 'object' ? 
                          JSON.stringify(value) : String(value);
                        handleContentChange(section.id, contentString, value);
                      }
                    }}
                    allowCustomFields={section.type === 'custom'}
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
