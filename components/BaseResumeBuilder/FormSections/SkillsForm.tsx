'use client';

import { useState } from 'react';
import { Skills } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Trash2, Edit2, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

interface SkillsFormProps {
  skills: Skills;
  onChange: (skills: Skills) => void;
}

export function SkillsForm({ skills, onChange }: SkillsFormProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    if (skills[newCategoryName.trim()]) return; // Prevent duplicates

    onChange({
      ...skills,
      [newCategoryName.trim()]: []
    });
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const deleteCategory = (category: string) => {
    const newSkills = { ...skills };
    delete newSkills[category];
    onChange(newSkills);
  };

  const startEditingCategory = (category: string) => {
    setEditingCategory(category);
    setEditCategoryName(category);
  };

  const saveCategoryName = () => {
    if (!editCategoryName.trim() || !editingCategory) return;
    if (editCategoryName.trim() !== editingCategory && skills[editCategoryName.trim()]) return; // Prevent duplicates

    const newSkills = { ...skills };
    const categorySkills = newSkills[editingCategory];
    delete newSkills[editingCategory];
    newSkills[editCategoryName.trim()] = categorySkills;

    onChange(newSkills);
    setEditingCategory(null);
    setEditCategoryName('');
  };

  const addSkill = (category: string, skill: string) => {
    if (!skill.trim()) return;

    const currentSkills = skills[category] || [];
    if (currentSkills.includes(skill.trim())) return; // Prevent duplicates

    onChange({
      ...skills,
      [category]: [...currentSkills, skill.trim()]
    });
  };

  const removeSkill = (category: string, index: number) => {
    const currentSkills = skills[category] || [];
    const updatedSkills = currentSkills.filter((_, i) => i !== index);

    onChange({
      ...skills,
      [category]: updatedSkills
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, category: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      addSkill(category, input.value);
      input.value = '';
    }
  };

  const handleAddClick = (category: string, inputId: string) => {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      addSkill(category, input.value);
      input.value = '';
    }
  };

  const categories = Object.keys(skills);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Skills</h3>
          <p className="text-sm text-slate-600">Add custom skill categories</p>
        </div>
        <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Skill Category</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Programming Languages, Certifications"
                className="mt-2"
                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingCategory(false)}>Cancel</Button>
              <Button onClick={addCategory}>Add Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {categories.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-500 mb-4">No skill categories added yet</p>
          <Button onClick={() => setIsAddingCategory(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Category
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {categories.map((category) => {
            const categorySkills = skills[category] || [];
            const isEditing = editingCategory === category;

            return (
              <Card key={category}>
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 mr-4">
                      <Input
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        className="h-8"
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" onClick={saveCategoryName} className="h-8 w-8 p-0 text-green-600">
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <CardTitle className="text-base flex items-center gap-2 group">
                      {category}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditingCategory(category)}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-600"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </CardTitle>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCategory(category)}
                    className="text-slate-400 hover:text-red-600 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
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
                            onClick={() => removeSkill(category, index)}
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
                      <Label htmlFor={`skill-input-${category}`} className="sr-only">
                        Add skill to {category}
                      </Label>
                      <Input
                        id={`skill-input-${category}`}
                        placeholder={`Add ${category} skill...`}
                        onKeyPress={(e) => handleKeyPress(e, category)}
                        className="text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddClick(category, `skill-input-${category}`)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
