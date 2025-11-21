'use client';

import { Skills } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

interface SkillsFormProps {
  skills: Skills;
  onChange: (skills: Skills) => void;
}

const SKILL_CATEGORIES = [
  { key: 'technical' as keyof Skills, label: 'Technical Skills', placeholder: 'JavaScript, Python, React...' },
  { key: 'soft' as keyof Skills, label: 'Soft Skills', placeholder: 'Leadership, Communication, Problem Solving...' },
  { key: 'tools' as keyof Skills, label: 'Tools & Software', placeholder: 'Git, Docker, Figma...' },
  { key: 'frameworks' as keyof Skills, label: 'Frameworks & Libraries', placeholder: 'React, Angular, Node.js...' },
  { key: 'databases' as keyof Skills, label: 'Databases', placeholder: 'MySQL, PostgreSQL, MongoDB...' },
  { key: 'other' as keyof Skills, label: 'Other Skills', placeholder: 'Project Management, Agile...' }
];

export function SkillsForm({ skills, onChange }: SkillsFormProps) {
  const addSkill = (category: keyof Skills, skill: string) => {
    if (!skill.trim()) return;
    
    const currentSkills = skills[category] || [];
    if (currentSkills.includes(skill.trim())) return; // Prevent duplicates
    
    onChange({
      ...skills,
      [category]: [...currentSkills, skill.trim()]
    });
  };

  const removeSkill = (category: keyof Skills, index: number) => {
    const currentSkills = skills[category] || [];
    const updatedSkills = currentSkills.filter((_, i) => i !== index);
    
    onChange({
      ...skills,
      [category]: updatedSkills
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, category: keyof Skills) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      addSkill(category, input.value);
      input.value = '';
    }
  };

  const handleAddClick = (category: keyof Skills, inputId: string) => {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      addSkill(category, input.value);
      input.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Skills</h3>
        <p className="text-sm text-slate-600">Add your skills organized by category</p>
      </div>

      <div className="grid gap-6">
        {SKILL_CATEGORIES.map((category) => {
          const categorySkills = skills[category.key] || [];
          
          return (
            <Card key={category.key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{category.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Skills Display */}
                {categorySkills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 px-2 py-1"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(category.key, index)}
                          className="ml-1 hover:text-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Add New Skill */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`skill-input-${category.key}`} className="sr-only">
                      Add {category.label}
                    </Label>
                    <Input
                      id={`skill-input-${category.key}`}
                      placeholder={category.placeholder}
                      onKeyPress={(e) => handleKeyPress(e, category.key)}
                      className="text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddClick(category.key, `skill-input-${category.key}`)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <p className="text-xs text-slate-500">
                  Press Enter or click + to add skills
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Skills Summary */}
      <Card className="bg-slate-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <h4 className="font-medium text-slate-900 mb-2">Skills Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {SKILL_CATEGORIES.map((category) => {
                const count = (skills[category.key] || []).length;
                return (
                  <div key={category.key} className="text-center">
                    <div className="font-semibold text-lg text-blue-600">{count}</div>
                    <div className="text-slate-600">{category.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
